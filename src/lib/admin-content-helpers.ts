import { supabase } from "@/integrations/supabase/client";

export const CATEGORY_OPTIONS = [
  { key: "web_development", label: "Web Development", color: "#3B82F6" },
  { key: "ai_integrator", label: "AI Integrator", color: "#F97316" },
  { key: "ai_podcast", label: "AI Podcast", color: "#22C55E" },
] as const;

export type CategoryKey = (typeof CATEGORY_OPTIONS)[number]["key"];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.key, c.label]),
);

export const CATEGORY_COLOR: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.key, c.color]),
);

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function estimateReadMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

const BUCKET = "content-images";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function uploadContentImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${crypto.randomUUID()}.${ext.toLowerCase()}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, ONE_YEAR * 10);
  if (error) throw error;
  return data.signedUrl;
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
