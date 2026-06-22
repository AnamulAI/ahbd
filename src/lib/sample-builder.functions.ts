import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

const BUCKET = "sample-logos";
const SUPABASE_URL_FALLBACK = "https://kuqqfgngrwduzxrffyhj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY_FALLBACK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cXFmZ25ncndkdXp4cmZmeWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NDU3MjUsImV4cCI6MjA5NzUyMTcyNX0.xh4Ftebp4mV0jf9-7rvN3r-uzOcoZna11r9EY4JA1ig";

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

async function ensureBucket() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // createBucket is idempotent-ish; ignore "already exists" errors.
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (error && !/already exists/i.test(error.message)) {
    // Not fatal if it already exists; throw otherwise.
    if (!/exists/i.test(error.message)) throw error;
  }
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
};

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
      // Force lazy client initialization here so missing admin config becomes a handled form error.
      supabaseAdmin.from("sample_previews");
    } catch (error) {
      if (isMissingAdminSecret(error)) {
        return { ok: false, error: "Sample creation needs the SUPABASE_SERVICE_ROLE_KEY server secret to be available.", slug: null };
      }
      return { ok: false, error: errorMessage(error, "Could not connect to Supabase"), slug: null };
    }

    // Generate a unique slug
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

    // Upload logo if present
    let logo_url: string | null = null;
    if (data.logo_base64 && data.logo_filename) {
      await ensureBucket();
      const match = data.logo_base64.match(/^data:(.+);base64,(.+)$/);
      const mime = match?.[1] ?? "image/png";
      const b64 = match?.[2] ?? data.logo_base64;
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const ext = (data.logo_filename.split(".").pop() || "png").toLowerCase();
      const path = `${slug}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType: mime, upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
      logo_url = pub.publicUrl;
    }

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
      })
      .select("slug")
      .single();
    if (insErr) return { ok: false, error: insErr.message, slug: null };
    return { ok: true, error: null, slug: row.slug };
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Failed to create sample"), slug: null };
    }
  });
