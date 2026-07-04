import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LOGO_BUCKET = "sample-logos";
const SUPABASE_URL_FALLBACK = "https://kuqqfgngrwduzxrffyhj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY_FALLBACK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cXFmZ25ncndkdXp4cmZmeWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NDU3MjUsImV4cCI6MjA5NzUyMTcyNX0.xh4Ftebp4mV0jf9-7rvN3r-uzOcoZna11r9EY4JA1ig";

const UPLOAD_BUCKETS = {
  audio: "sample-audio",
  video: "sample-video",
  clip: "sample-clips",
} as const;

type UploadKind = keyof typeof UPLOAD_BUCKETS;

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days; refreshed on every SSR fetch

const MEDIA_URL_FIELDS = [
  "logo_url",
  "audio_url",
  "video_url",
  "clip_instagram_url",
  "clip_tiktok_url",
  "clip_linkedin_url",
] as const;

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

async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}


async function ensureLogoBucket() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.storage.createBucket(LOGO_BUCKET, {
    public: false,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (error && !/exists/i.test(error.message)) throw error;
}

/**
 * Detect a stored Supabase Storage URL and produce a fresh signed URL.
 * Returns the input unchanged if it's not a Supabase Storage URL (e.g.
 * pasted external link, YouTube, etc.).
 */
async function maybeSignStorageUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/([^?]+)/);
  if (!m) return url;
  const [, bucket, encodedPath] = m;
  const path = decodeURIComponent(encodedPath);
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) return url;
    return data.signedUrl;
  } catch {
    return url;
  }
}

export async function signSampleRow<T extends Record<string, any> | null>(row: T): Promise<T> {
  if (!row) return row;
  const next: Record<string, any> = { ...row };
  for (const key of MEDIA_URL_FIELDS) {
    if (next[key]) {
      next[key] = await maybeSignStorageUrl(next[key]);
    }
  }
  return next as T;
}

export const verifyPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return { ok: true };
  });

export const listSamples = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertAdmin(context);
      const supabasePublic = createPublicSupabaseClient();
      const { data: rows, error } = await supabasePublic
        .from("sample_previews")
        .select("id, slug, business_name, created_at, logo_url")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return { samples: [], error: error.message };
      const signed = await Promise.all(
        (rows ?? []).map(async (r) => ({ ...r, logo_url: await maybeSignStorageUrl(r.logo_url) })),
      );
      return { samples: signed, error: null };
    } catch (error) {
      return { samples: [], error: errorMessage(error, "Could not load samples") };
    }
  });

export const getSampleForEdit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    try {
      await assertAdmin(context);
      const supabasePublic = createPublicSupabaseClient();
      const { data: row, error } = await supabasePublic
        .from("sample_previews")
        .select("*")
        .eq("id", data.id)
        .maybeSingle();
      if (error) return { sample: null, error: error.message };
      const signed = await signSampleRow(row);
      return { sample: signed, error: null };
    } catch (error) {
      return { sample: null, error: errorMessage(error, "Could not load sample") };
    }
  });

/**
 * Returns a signed upload URL for the chosen media bucket plus the eventual
 * canonical storage URL (which the public preview will re-sign at read time).
 */
export const createMediaUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: UploadKind; filename: string; slugHint?: string }) => d)
  .handler(async ({ data, context }) => {
    try {
      await assertAdmin(context);

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

      // Store the canonical "public" URL pattern so we can recognize the
      // bucket+path at read time and re-sign it. The bucket itself is private,
      // so this URL won't work raw — the public preview signs it on the fly.
      const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
      const { data: previewSigned } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

      return {
        ok: true as const,
        bucket,
        path: signed.path,
        token: signed.token,
        // Stored value (canonical, used to identify bucket/path later):
        publicUrl: pub.publicUrl,
        // Immediately usable preview URL for the admin form:
        previewUrl: previewSigned?.signedUrl ?? pub.publicUrl,
      };
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Could not create upload URL") } as const;
    }
  });

export type AudienceCategory = "marketers" | "creators" | "businesses" | "educators";

export const AUDIENCE_CATEGORIES: AudienceCategory[] = ["marketers", "creators", "businesses", "educators"];

function normalizeAudience(value: unknown): AudienceCategory {
  return AUDIENCE_CATEGORIES.includes(value as AudienceCategory)
    ? (value as AudienceCategory)
    : "businesses";
}

export type SamplePayload = {
  business_name: string;
  audience_category: AudienceCategory;
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
  /** Direct URL to use as logo_url (paste-link mode). Pass null to clear, undefined to leave unchanged. */
  logo_direct_url?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  clip_instagram_url?: string | null;
  clip_tiktok_url?: string | null;
  clip_linkedin_url?: string | null;
  // New conversion-boosting fields
  client_industry?: string | null;
  scarcity_enabled?: boolean;
  scarcity_message?: string | null;
  scarcity_duration_days?: number | null;
  scarcity_label?: string | null;
  whatsapp_number?: string | null;
  booking_link?: string | null;
  estimated_listeners?: string | null;
  estimated_reach_growth?: string | null;
  estimated_time_saved?: string | null;
  before_state?: string | null;
  after_state?: string | null;
  ig_reel_caption?: string | null;
  tiktok_clip_caption?: string | null;
  linkedin_clip_caption?: string | null;
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
  // Canonical storage URL — re-signed on read.
  const { data: pub } = supabaseAdmin.storage.from(LOGO_BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}

function resolveLogoForCreate(data: SamplePayload, uploaded: string | null): string | null {
  if (uploaded) return uploaded;
  if (data.logo_direct_url !== undefined) return data.logo_direct_url || null;
  return null;
}

function resolveLogoForUpdate(
  data: SamplePayload,
  uploaded: string | null,
  existing: string | null,
): string | null {
  if (uploaded) return uploaded;
  if (data.logo_direct_url !== undefined) return data.logo_direct_url || null;
  if (data.logo_filename === null) return null; // legacy explicit clear
  return existing;
}

export const createSample = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: SamplePayload) => d)
  .handler(async ({ data, context }) => {
    try {
      await assertAdmin(context);
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

      const uploaded = await uploadLogoIfPresent(slug, data.logo_base64, data.logo_filename);
      const logo_url = resolveLogoForCreate(data, uploaded);

      const { error: insErr, data: row } = await supabaseAdmin
        .from("sample_previews")
        .insert({
          slug,
          business_name: data.business_name.trim(),
          audience_category: normalizeAudience(data.audience_category),
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
          client_industry: data.client_industry ?? null,
          scarcity_enabled: !!data.scarcity_enabled,
          scarcity_message: data.scarcity_message ?? null,
          scarcity_duration_days: data.scarcity_duration_days ?? null,
          scarcity_label: data.scarcity_label ?? null,
          whatsapp_number: data.whatsapp_number ?? null,
          booking_link: data.booking_link ?? null,
          estimated_listeners: data.estimated_listeners ?? null,
          estimated_reach_growth: data.estimated_reach_growth ?? null,
          estimated_time_saved: data.estimated_time_saved ?? null,
          before_state: data.before_state ?? null,
          after_state: data.after_state ?? null,
          ig_reel_caption: data.ig_reel_caption ?? null,
          tiktok_clip_caption: data.tiktok_clip_caption ?? null,
          linkedin_clip_caption: data.linkedin_clip_caption ?? null,
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
  .middleware([requireSupabaseAuth])
  .inputValidator((d: SampleUpdatePayload) => d)
  .handler(async ({ data, context }) => {
    try {
      await assertAdmin(context);
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

      const uploaded = data.logo_base64
        ? await uploadLogoIfPresent(existing.slug, data.logo_base64, data.logo_filename)
        : null;
      const logo_url = resolveLogoForUpdate(data, uploaded, existing.logo_url);

      const { error: updErr } = await supabaseAdmin
        .from("sample_previews")
        .update({
          business_name: data.business_name.trim(),
          audience_category: normalizeAudience(data.audience_category),
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
          client_industry: data.client_industry ?? null,
          scarcity_enabled: !!data.scarcity_enabled,
          scarcity_message: data.scarcity_message ?? null,
          scarcity_duration_days: data.scarcity_duration_days ?? null,
          scarcity_label: data.scarcity_label ?? null,
          whatsapp_number: data.whatsapp_number ?? null,
          booking_link: data.booking_link ?? null,
          estimated_listeners: data.estimated_listeners ?? null,
          estimated_reach_growth: data.estimated_reach_growth ?? null,
          estimated_time_saved: data.estimated_time_saved ?? null,
          before_state: data.before_state ?? null,
          after_state: data.after_state ?? null,
          ig_reel_caption: data.ig_reel_caption ?? null,
          tiktok_clip_caption: data.tiktok_clip_caption ?? null,
          linkedin_clip_caption: data.linkedin_clip_caption ?? null,
          updated_at: new Date().toISOString(),

        })
        .eq("id", data.id);

      if (updErr) return { ok: false, error: updErr.message, slug: null };
      return { ok: true, error: null, slug: existing.slug };
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Failed to update sample"), slug: null };
    }
  });

export const deleteSample = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    try {
      await assertAdmin(context);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("sample_previews").delete().eq("id", data.id);
      if (error) return { ok: false, error: error.message } as const;
      return { ok: true, error: null } as const;
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Failed to delete sample") } as const;
    }
  });

/* ---------- Social Proof Logos (global, shared across samples) ---------- */

const SOCIAL_PROOF_BUCKET = "sample-logos"; // reuse existing logos bucket

async function signSocialLogo(url: string | null | undefined): Promise<string | null> {
  return maybeSignStorageUrl(url ?? null);
}

export const listSocialProofLogos = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabasePublic = createPublicSupabaseClient();
    const { data: rows, error } = await supabasePublic
      .from("social_proof_logos")
      .select("id, logo_url, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return { logos: [], error: error.message };
    const signed = await Promise.all(
      (rows ?? []).map(async (r) => ({ ...r, logo_url: (await signSocialLogo(r.logo_url)) ?? r.logo_url })),
    );
    return { logos: signed, error: null };
  } catch (error) {
    return { logos: [], error: errorMessage(error, "Could not load logos") };
  }
});

export const createSocialProofLogo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { logo_base64: string; logo_filename: string }) => d)
  .handler(async ({ data, context }) => {
    try {
      await assertAdmin(context);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await ensureLogoBucket();
      const match = data.logo_base64.match(/^data:(.+);base64,(.+)$/);
      const mime = match?.[1] ?? "image/png";
      const b64 = match?.[2] ?? data.logo_base64;
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const ext = safeExt(data.logo_filename, "png");
      const path = `social-proof/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from(SOCIAL_PROOF_BUCKET)
        .upload(path, bytes, { contentType: mime, upsert: true });
      if (upErr) return { ok: false, error: upErr.message } as const;
      const { data: pub } = supabaseAdmin.storage.from(SOCIAL_PROOF_BUCKET).getPublicUrl(path);

      // Find max sort_order and append
      const { data: last } = await supabaseAdmin
        .from("social_proof_logos")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextOrder = (last?.sort_order ?? -1) + 1;

      const { error: insErr } = await supabaseAdmin
        .from("social_proof_logos")
        .insert({ logo_url: pub.publicUrl, sort_order: nextOrder });
      if (insErr) return { ok: false, error: insErr.message } as const;
      return { ok: true, error: null } as const;
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Failed to add logo") } as const;
    }
  });

export const deleteSocialProofLogo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    try {
      await assertAdmin(context);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("social_proof_logos").delete().eq("id", data.id);
      if (error) return { ok: false, error: error.message } as const;
      return { ok: true, error: null } as const;
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Failed to delete logo") } as const;
    }
  });

export const reorderSocialProofLogos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ids: string[] }) => d)
  .handler(async ({ data, context }) => {
    try {
      await assertAdmin(context);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      for (let i = 0; i < data.ids.length; i++) {
        const { error } = await supabaseAdmin
          .from("social_proof_logos")
          .update({ sort_order: i })
          .eq("id", data.ids[i]);
        if (error) return { ok: false, error: error.message } as const;
      }
      return { ok: true, error: null } as const;
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Failed to reorder logos") } as const;
    }
  });
