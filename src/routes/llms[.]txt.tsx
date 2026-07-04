import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const FALLBACK = `# AnamDev

> Freelance web developer and AI specialist helping brands build stronger authority and a sharper digital presence.

Site owner: Mohammad Anamul Hoque (AnamDev).

## Services

- [Web Development](https://ahbd.lovable.app/services/web-development)
- [AI Integrator](https://ahbd.lovable.app/services/ai-integrator)
- [AI Podcast](https://ahbd.lovable.app/services/ai-podcast)

## Key pages

- [Home](https://ahbd.lovable.app/)
- [Projects](https://ahbd.lovable.app/projects)
- [Blog](https://ahbd.lovable.app/blog)
- [About](https://ahbd.lovable.app/about)
- [Contact](https://ahbd.lovable.app/contact)
`;

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
        const key =
          process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        let body = FALLBACK;
        if (url && key) {
          const supabase = createClient<Database>(url, key, {
            auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          });
          const { data } = await supabase
            .from("site_settings")
            .select("setting_value")
            .eq("setting_key", "llms_txt_content")
            .maybeSingle();
          const stored = (
            (data as { setting_value: string | null } | null)?.setting_value ?? ""
          ).trim();
          if (stored) body = stored;
        }
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
