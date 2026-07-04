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

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("page_visits").update({ time_on_page_seconds: seconds }).eq("id", id);
        return new Response("ok");
      },
    },
  },
});
