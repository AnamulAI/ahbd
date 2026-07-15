import { createFileRoute } from "@tanstack/react-router";

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

function isPrivateIp(ip: string): boolean {
  if (
    ip === "::1" ||
    ip === "localhost" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("169.254.") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  )
    return true;
  // 172.16.0.0 – 172.31.255.255
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1] ?? "0", 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

async function fetchWithTimeout(url: string, ms: number, init?: RequestInit) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Resolves country/city for an IP.
 *
 * - Returns `{ country: "Local" }` for local/private IPs and network failures
 *   so preview/dev traffic is visibly distinct from real geographic data.
 * - Uses ip-api.com's free keyless endpoint by default; if a future integration
 *   provides its own API key we can fall back to that here.
 * - Bounded by a short timeout so a slow lookup never delays the visit log.
 */
async function geoLookup(
  ip: string | null,
): Promise<{ country: string | null; city: string | null }> {
  // No IP or private/loopback: local/preview traffic, distinct from "Unknown".
  if (!ip || isPrivateIp(ip)) return { country: "Local", city: null };
  try {
    // ip-api.com free tier — no key required, HTTP only for the free endpoint.
    const res = await fetchWithTimeout(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city`,
      2500,
      { headers: { Accept: "application/json" } },
    );
    // Public IP but lookup couldn't resolve (VPN, data center, rate limit,
    // timeout, etc.) → "Unknown" so the visit is still counted transparently
    // instead of silently dropped from geography stats.
    if (!res.ok) return { country: "Unknown", city: null };
    const j = (await res.json()) as { status?: string; country?: string; city?: string };
    if (j.status !== "success" || !j.country) return { country: "Unknown", city: null };
    return { country: j.country, city: j.city || null };
  } catch {
    return { country: "Unknown", city: null };
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

        const { createClient } = await import("@supabase/supabase-js");
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) {
          return new Response(
            JSON.stringify({ error: "Server not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
        const supa = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
                h.delete("Authorization");
              }
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });

        const str = (v: unknown): string | null =>
          typeof v === "string" && v.length > 0 ? v.slice(0, 500) : null;
        const bool = (v: unknown): boolean => v === true;

        const id = crypto.randomUUID();
        const row = {
          id,
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

        const { error } = await supa.from("page_visits").insert(row);
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        return Response.json({ id });
      },
    },
  },
});
