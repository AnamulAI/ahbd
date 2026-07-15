import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/track-heartbeat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { id?: string; seconds?: number } = {};
        try {
          body = (await request.json()) as { id?: string; seconds?: number };
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const id = typeof body.id === "string" ? body.id : null;
        const seconds = Number.isFinite(body.seconds) ? Math.min(60 * 60 * 6, Math.max(0, Math.round(body.seconds as number))) : null;
        if (!id || seconds === null) return new Response("Bad request", { status: 400 });

        const { createClient } = await import("@supabase/supabase-js");
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) return new Response("Server not configured", { status: 500 });
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
        await supa.from("page_visits").update({ time_on_page_seconds: seconds }).eq("id", id);
        return new Response("ok");
      },
    },
  },
});
