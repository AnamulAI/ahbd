import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

const LOGO_BUCKET = "sample-logos";
const SUPABASE_URL_FALLBACK = "https://kuqqfgngrwduzxrffyhj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY_FALLBACK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cXFmZ25ncndkdXp4cmZmeWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NDU3MjUsImV4cCI6MjA5NzUyMTcyNX0.xh4Ftebp4mV0jf9-7rvN3r-uzOcoZna11r9EY4JA1ig";

const UPLOAD_BUCKETS = {
  audio: "sample-audio",
  video: "sample-video",
  clip: "sample-clips",
} as const;

type UploadKind = keyof typeof UPLOAD_BUCKETS;

function createPublicSupabaseClient() {
  const url = process.env.SUPABASE_URL || SUPABASE_URL_FALLBACK;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY_FALLBACK;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function isMissingAdminSecret(error: unknown) {
  return error instanceof Error && error.message.includes("SUPABASE_SERVICE_ROLE_KEY");
}

function errorMessage(error: unknown, fallback = "Something went wrong") {
  return error instanceof Error ? error.message : fallback;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "sample";
}

function safeExt(filename: string | null | undefined, fallback: string): string {
  if (!filename) return fallback;
  const part = filename.split(".").pop();
  if (!part) return fallback;
  return part.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6) || fallback;
}

function checkPin(pin: string) {
  const expected = process.env.ADMIN_PIN;
  if (!expected) throw new Error("ADMIN_PIN is not configured on the server.");
  if (typeof pin !== "string" || pin.length === 0) throw new Error("PIN required");
  if (pin.length !== expected.length) throw new Error("Invalid PIN");
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= pin.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) throw new Error("Invalid PIN");
}

async function ensureLogoBucket() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.storage.createBucket(LOGO_BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (error && !/exists/i.test(error.message)) throw error;
}

export const verifyPin = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string }) => d)
  .handler(async ({ data }) => {
    checkPin(data.pin);
    return { ok: true };
  });

export const listSamples = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string }) => d)
  .handler(async ({ data }) => {
    try {
      checkPin(data.pin);
      const supabasePublic = createPublicSupabaseClient();
      const { data: rows, error } = await supabasePublic
        .from("sample_previews")
        .select("id, slug, business_name, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return { samples: [], error: error.message };
      return { samples: rows ?? [], error: null };
    } catch (error) {
      return { samples: [], error: errorMessage(error, "Could not load samples") };
    }
  });

export const getSampleForEdit = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; id: string }) => d)
  .handler(async ({ data }) => {
    try {
      checkPin(data.pin);
      const supabasePublic = createPublicSupabaseClient();
      const { data: row, error } = await supabasePublic
        .from("sample_previews")
        .select("*")
        .eq("id", data.id)
        .maybeSingle();
      if (error) return { sample: null, error: error.message };
      return { sample: row, error: null };
    } catch (error) {
      return { sample: null, error: errorMessage(error, "Could not load sample") };
    }
  });

/**
 * Returns a signed upload URL for the chosen media bucket plus the eventual
 * public URL. Client uses `supabase.storage.from(bucket).uploadToSignedUrl(...)`.
 */
export const createMediaUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; kind: UploadKind; filename: string; slugHint?: string }) => d)
  .handler(async ({ data }) => {
    try {
      checkPin(data.pin);
      const bucket = UPLOAD_BUCKETS[data.kind];
      if (!bucket) return { ok: false, error: "Unknown upload kind" } as const;

      let supabaseAdmin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];
      try {
        ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
        supabaseAdmin.storage.from(bucket);
      } catch (error) {
        if (isMissingAdminSecret(error)) {
          return { ok: false, error: "Media uploads need the SUPABASE_SERVICE_ROLE_KEY server secret." } as const;
        }
        throw error;
      }

      const ext = safeExt(data.filename, data.kind === "audio" ? "mp3" : "mp4");
      const stem = data.slugHint ? slugify(data.slugHint) : "sample";
      const path = `${stem}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { data: signed, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUploadUrl(path);
      if (error || !signed) return { ok: false, error: error?.message || "Could not create upload URL" } as const;

      const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

      return {
        ok: true as const,
        bucket,
        path: signed.path,
        token: signed.token,
        publicUrl: pub.publicUrl,
      };
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Could not create upload URL") } as const;
    }
  });

export type SamplePayload = {
  pin: string;
  business_name: string;
  episode_title: string;
  topic: string;
  platforms: string[];
  show_video: boolean;
  show_smm: boolean;
  module_order: string[];
  cta_text: string;
  cta_link: string;
  logo_base64?: string | null;
  logo_filename?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  clip_instagram_url?: string | null;
  clip_tiktok_url?: string | null;
  clip_linkedin_url?: string | null;
};

async function uploadLogoIfPresent(
  slug: string,
  logo_base64: string | null | undefined,
  logo_filename: string | null | undefined,
): Promise<string | null> {
  if (!logo_base64 || !logo_filename) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await ensureLogoBucket();
  const match = logo_base64.match(/^data:(.+);base64,(.+)$/);
  const mime = match?.[1] ?? "image/png";
  const b64 = match?.[2] ?? logo_base64;
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const ext = safeExt(logo_filename, "png");
  const path = `${slug}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabaseAdmin.storage
    .from(LOGO_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: true });
  if (upErr) throw upErr;
  const { data: pub } = supabaseAdmin.storage.from(LOGO_BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}

export const createSample = createServerFn({ method: "POST" })
  .inputValidator((d: SamplePayload) => d)
  .handler(async ({ data }) => {
    try {
      checkPin(data.pin);
      if (!data.business_name?.trim()) return { ok: false, error: "Business name required", slug: null };
      if (!Array.isArray(data.platforms) || data.platforms.length === 0) {
        return { ok: false, error: "Pick at least one platform", slug: null };
      }

      let supabaseAdmin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];
      try {
        ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
        supabaseAdmin.from("sample_previews");
      } catch (error) {
        if (isMissingAdminSecret(error)) {
          return { ok: false, error: "Sample creation needs the SUPABASE_SERVICE_ROLE_KEY server secret to be available.", slug: null };
        }
        return { ok: false, error: errorMessage(error, "Could not connect to Supabase"), slug: null };
      }

      const base = slugify(data.business_name);
      let slug = base;
      for (let i = 0; i < 5; i++) {
        const { data: existing } = await supabaseAdmin
          .from("sample_previews")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (!existing) break;
        slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      }

      const logo_url = await uploadLogoIfPresent(slug, data.logo_base64, data.logo_filename);

      const { error: insErr, data: row } = await supabaseAdmin
        .from("sample_previews")
        .insert({
          slug,
          business_name: data.business_name.trim(),
          episode_title: data.episode_title?.trim() || "",
          topic: data.topic?.trim() || "",
          platforms: data.platforms,
          show_video: !!data.show_video,
          show_smm: !!data.show_smm,
          module_order: data.module_order,
          cta_text: data.cta_text?.trim() || "Get This Service →",
          cta_link: data.cta_link?.trim() || "/services/ai-podcast",
          logo_url,
          audio_url: data.audio_url || null,
          video_url: data.video_url || null,
          clip_instagram_url: data.clip_instagram_url || null,
          clip_tiktok_url: data.clip_tiktok_url || null,
          clip_linkedin_url: data.clip_linkedin_url || null,
        })
        .select("slug")
        .single();
      if (insErr) return { ok: false, error: insErr.message, slug: null };
      return { ok: true, error: null, slug: row.slug };
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Failed to create sample"), slug: null };
    }
  });

export type SampleUpdatePayload = SamplePayload & { id: string };

export const updateSample = createServerFn({ method: "POST" })
  .inputValidator((d: SampleUpdatePayload) => d)
  .handler(async ({ data }) => {
    try {
      checkPin(data.pin);
      if (!data.id) return { ok: false, error: "Missing sample id", slug: null };
      if (!data.business_name?.trim()) return { ok: false, error: "Business name required", slug: null };
      if (!Array.isArray(data.platforms) || data.platforms.length === 0) {
        return { ok: false, error: "Pick at least one platform", slug: null };
      }

      let supabaseAdmin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];
      try {
        ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
        supabaseAdmin.from("sample_previews");
      } catch (error) {
        if (isMissingAdminSecret(error)) {
          return { ok: false, error: "Sample update needs the SUPABASE_SERVICE_ROLE_KEY server secret to be available.", slug: null };
        }
        return { ok: false, error: errorMessage(error, "Could not connect to Supabase"), slug: null };
      }

      const { data: existing, error: getErr } = await supabaseAdmin
        .from("sample_previews")
        .select("slug, logo_url")
        .eq("id", data.id)
        .maybeSingle();
      if (getErr) return { ok: false, error: getErr.message, slug: null };
      if (!existing) return { ok: false, error: "Sample not found", slug: null };

      const logo_url = data.logo_base64
        ? await uploadLogoIfPresent(existing.slug, data.logo_base64, data.logo_filename)
        : data.logo_filename === null
          ? null // explicit clear
          : existing.logo_url;

      const { error: updErr } = await supabaseAdmin
        .from("sample_previews")
        .update({
          business_name: data.business_name.trim(),
          episode_title: data.episode_title?.trim() || "",
          topic: data.topic?.trim() || "",
          platforms: data.platforms,
          show_video: !!data.show_video,
          show_smm: !!data.show_smm,
          module_order: data.module_order,
          cta_text: data.cta_text?.trim() || "Get This Service →",
          cta_link: data.cta_link?.trim() || "/services/ai-podcast",
          logo_url,
          audio_url: data.audio_url || null,
          video_url: data.video_url || null,
          clip_instagram_url: data.clip_instagram_url || null,
          clip_tiktok_url: data.clip_tiktok_url || null,
          clip_linkedin_url: data.clip_linkedin_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (updErr) return { ok: false, error: updErr.message, slug: null };
      return { ok: true, error: null, slug: existing.slug };
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Failed to update sample"), slug: null };
    }
  });
