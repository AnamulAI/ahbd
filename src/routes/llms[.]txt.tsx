import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const FALLBACK = `# AnamDev

> Freelance web developer and AI specialist helping brands build stronger authority and a sharper digital presence.

Site owner: Mohammad Anamul Hoque (AnamDev).

## Services

- [Web Development]({{SITE_URL}}/services/web-development)
- [AI Integrator]({{SITE_URL}}/services/ai-integrator)
- [AI Podcast]({{SITE_URL}}/services/ai-podcast)

## Key pages

- [Home]({{SITE_URL}}/)
- [Projects]({{SITE_URL}}/projects)
- [Blog]({{SITE_URL}}/blog)
- [About]({{SITE_URL}}/about)
- [Contact]({{SITE_URL}}/contact)
`;

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
        const key =
          process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        let body = FALLBACK;
        let baseUrl = "";
        if (url && key) {
          const supabase = createClient<Database>(url, key, {
            auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          });
          const { data } = await supabase
            .from("site_settings")
            .select("setting_key,setting_value")
            .in("setting_key", ["llms_txt_content", "site_base_url"]);
          for (const row of data ?? []) {
            const r = row as { setting_key: string; setting_value: string | null };
            if (r.setting_key === "llms_txt_content") {
              const stored = (r.setting_value ?? "").trim();
              if (stored) body = stored;
            } else if (r.setting_key === "site_base_url") {
              baseUrl = (r.setting_value ?? "").trim();
            }
          }
        }
        const resolvedBase = (baseUrl || new URL(request.url).origin).replace(/\/+$/, "");
        // Replace token AND any legacy hardcoded domain occurrences.
        const rendered = body
          .replace(/\{\{\s*SITE_URL\s*\}\}/g, resolvedBase)
          .replace(/https:\/\/ahbd\.lovable\.app/g, resolvedBase);
        return new Response(rendered, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
