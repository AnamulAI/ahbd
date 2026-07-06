import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** The 3 buckets that hold actual images — the only ones this module browses/manages. */
export const IMAGE_BUCKETS = ["profile-avatars", "content-images", "sample-logos"] as const;
export type ImageBucket = (typeof IMAGE_BUCKETS)[number];

/** profile-avatars is a public bucket (getPublicUrl works); the others are
 *  private and require a signed URL (see admin-content-helpers.ts / sample-builder.functions.ts). */
const PUBLIC_BUCKETS = new Set<string>(["profile-avatars"]);

/** All 7 buckets — the Free Plan's 1 GB storage quota is shared project-wide,
 *  so usage must be summed across every bucket, not just the image ones. */
const ALL_BUCKETS = [
  "profile-avatars",
  "content-images",
  "sample-logos",
  "podcast-media",
  "sample-audio",
  "sample-video",
  "sample-clips",
] as const;

export const STORAGE_QUOTA_BYTES = 1024 * 1024 * 1024; // Supabase Free Plan

// Long-lived, matching the existing convention for content-images cover URLs
// (admin-content-helpers.ts) since a copied link may get pasted into content elsewhere.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 10;

export type MediaImage = {
  bucket: ImageBucket;
  name: string;
  size: number;
  mimetype: string | null;
  createdAt: string | null;
  url: string;
};

function errorMessage(error: unknown, fallback = "Something went wrong") {
  return error instanceof Error ? error.message : fallback;
}

function isMissingAdminSecret(error: unknown) {
  return error instanceof Error && error.message.includes("SUPABASE_SERVICE_ROLE_KEY");
}

async function assertMediaManagerAccess(context: any) {
  const sb = context.supabase as any;
  const { data, error } = await sb.rpc("has_section_access", {
    _user_id: context.userId,
    _section: "media_manager",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: no access to Media Manager");
}

async function listBucketObjects(supabaseAdmin: any, bucket: string) {
  const pageSize = 1000;
  let offset = 0;
  const all: any[] = [];
  for (;;) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list("", { limit: pageSize, offset, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw error;
    all.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
    offset += pageSize;
  }
  // storage.list() can include folder placeholder rows (id: null) — not real objects.
  return all.filter((o) => o.id);
}

function buildPublicUrl(supabaseAdmin: any, bucket: string, name: string): string {
  return supabaseAdmin.storage.from(bucket).getPublicUrl(name).data.publicUrl as string;
}

export const listMediaImages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertMediaManagerAccess(context);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const images: MediaImage[] = [];
      for (const bucket of IMAGE_BUCKETS) {
        const objects = await listBucketObjects(supabaseAdmin, bucket);
        if (objects.length === 0) continue;

        if (PUBLIC_BUCKETS.has(bucket)) {
          for (const o of objects) {
            images.push({
              bucket,
              name: o.name,
              size: o.metadata?.size ?? 0,
              mimetype: o.metadata?.mimetype ?? null,
              createdAt: o.created_at ?? null,
              url: buildPublicUrl(supabaseAdmin, bucket, o.name),
            });
          }
        } else {
          const paths = objects.map((o) => o.name);
          const { data: signed, error: signErr } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
          if (signErr) throw signErr;
          objects.forEach((o, i) => {
            images.push({
              bucket,
              name: o.name,
              size: o.metadata?.size ?? 0,
              mimetype: o.metadata?.mimetype ?? null,
              createdAt: o.created_at ?? null,
              url: signed?.[i]?.signedUrl ?? "",
            });
          });
        }
      }
      images.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      return { ok: true as const, images };
    } catch (error) {
      if (isMissingAdminSecret(error)) {
        return {
          ok: false as const,
          error: "Media Manager needs the SUPABASE_SERVICE_ROLE_KEY server secret.",
          images: [] as MediaImage[],
        };
      }
      return {
        ok: false as const,
        error: errorMessage(error, "Could not load media"),
        images: [] as MediaImage[],
      };
    }
  });

export const getMediaStorageUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertMediaManagerAccess(context);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const byBucket: Record<string, number> = {};
      let totalBytes = 0;
      for (const bucket of ALL_BUCKETS) {
        const objects = await listBucketObjects(supabaseAdmin, bucket);
        const bytes = objects.reduce((sum, o) => sum + (o.metadata?.size ?? 0), 0);
        byBucket[bucket] = bytes;
        totalBytes += bytes;
      }
      return { ok: true as const, totalBytes, quotaBytes: STORAGE_QUOTA_BYTES, byBucket };
    } catch (error) {
      const message = isMissingAdminSecret(error)
        ? "Media Manager needs the SUPABASE_SERVICE_ROLE_KEY server secret."
        : errorMessage(error, "Could not compute storage usage");
      return {
        ok: false as const,
        error: message,
        totalBytes: 0,
        quotaBytes: STORAGE_QUOTA_BYTES,
        byBucket: {},
      };
    }
  });

const UploadSchema = z.object({
  bucket: z.enum(IMAGE_BUCKETS),
  filename: z.string().min(1).max(200),
  base64: z.string().min(1),
});

export const uploadMediaImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UploadSchema.parse(d))
  .handler(async ({ data, context }) => {
    try {
      await assertMediaManagerAccess(context);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const match = data.base64.match(/^data:(.+);base64,(.+)$/);
      const mime = match?.[1] ?? "image/webp";
      const b64 = match?.[2] ?? data.base64;
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const ext =
        data.filename
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "webp";
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabaseAdmin.storage
        .from(data.bucket)
        .upload(path, bytes, { contentType: mime, upsert: false, cacheControl: "31536000" });
      if (upErr) throw upErr;

      let url: string;
      if (PUBLIC_BUCKETS.has(data.bucket)) {
        url = buildPublicUrl(supabaseAdmin, data.bucket, path);
      } else {
        const { data: signed, error: signErr } = await supabaseAdmin.storage
          .from(data.bucket)
          .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
        if (signErr) throw signErr;
        url = signed?.signedUrl ?? "";
      }

      const image: MediaImage = {
        bucket: data.bucket,
        name: path,
        size: bytes.byteLength,
        mimetype: mime,
        createdAt: new Date().toISOString(),
        url,
      };
      return { ok: true as const, image };
    } catch (error) {
      const message = isMissingAdminSecret(error)
        ? "Uploads need the SUPABASE_SERVICE_ROLE_KEY server secret."
        : errorMessage(error, "Upload failed");
      return { ok: false as const, error: message };
    }
  });

const DeleteSchema = z.object({
  bucket: z.enum(IMAGE_BUCKETS),
  name: z.string().min(1),
});

export const deleteMediaImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DeleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    try {
      await assertMediaManagerAccess(context);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.storage.from(data.bucket).remove([data.name]);
      if (error) throw error;
      return { ok: true as const };
    } catch (error) {
      const message = isMissingAdminSecret(error)
        ? "Delete needs the SUPABASE_SERVICE_ROLE_KEY server secret."
        : errorMessage(error, "Delete failed");
      return { ok: false as const, error: message };
    }
  });
