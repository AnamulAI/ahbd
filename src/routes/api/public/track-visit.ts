import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function truncateIp(ip: string | null): string | null {
  if (!ip) return null;
  // IPv4: first three octets. IPv6: first four groups.
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return parts.slice(0, 4).join(":") + "::xxxx";
  }
  return null;
}

function pickClientIp(request: Request): string | null {
  const h = request.headers;
  const cand =
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    null;
  return cand || null;
}

async function geoLookup(ip: string | null): Promise<{ country: string | null; city: string | null }> {
  if (!ip || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.") || ip === "::1") {
    return { country: null, city: null };
  }
  try {
    const res = await fetch(
      `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return { country: null, city: null };
    const j = (await res.json()) as { country_name?: string; city?: string };
    return { country: j.country_name ?? null, city: j.city ?? null };
  } catch {
    return { country: null, city: null };
  }
}

export const Route = createFileRoute("/api/public/track-visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: Record<string, unknown> = {};
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const ip = pickClientIp(request);
        const geo = await geoLookup(ip);

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const supa = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        const str = (v: unknown): string | null =>
          typeof v === "string" && v.length > 0 ? v.slice(0, 500) : null;
        const bool = (v: unknown): boolean => v === true;

        const row = {
          session_id: str(payload.session_id) ?? "unknown",
          visitor_id: str(payload.visitor_id) ?? "unknown",
          path: str(payload.path) ?? "/",
          country: geo.country,
          city: geo.city,
          device_type: str(payload.device_type),
          browser: str(payload.browser),
          os: str(payload.os),
          ip_truncated: truncateIp(ip),
          referrer_raw: str(payload.referrer_raw),
          referrer_category: str(payload.referrer_category),
          utm_source: str(payload.utm_source),
          utm_medium: str(payload.utm_medium),
          utm_campaign: str(payload.utm_campaign),
          is_new_visitor: bool(payload.is_new_visitor),
          is_admin: bool(payload.is_admin),
          is_bot: bool(payload.is_bot),
        };

        const { data, error } = await supa
          .from("page_visits")
          .insert(row)
          .select("id")
          .single();
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        return Response.json({ id: data.id });
      },
    },
  },
});
