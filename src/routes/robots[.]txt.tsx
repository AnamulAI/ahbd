import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const AI_BOTS: Array<{ key: string; agents: string[] }> = [
  { key: "allow_gptbot", agents: ["GPTBot"] },
  { key: "allow_google_extended", agents: ["Google-Extended"] },
  { key: "allow_claudebot", agents: ["ClaudeBot", "anthropic-ai"] },
  { key: "allow_perplexitybot", agents: ["PerplexityBot"] },
  { key: "allow_ccbot", agents: ["CCBot"] },
];

async function loadAiSettings(): Promise<Record<string, string>> {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return {};
  const supabase = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const keys = AI_BOTS.map((b) => b.key);
  const { data } = await supabase
    .from("site_settings")
    .select("setting_key,setting_value")
    .in("setting_key", keys);
  const out: Record<string, string> = {};
  for (const row of data ?? []) {
    out[(row as { setting_key: string }).setting_key] =
      (row as { setting_value: string | null }).setting_value ?? "";
  }
  return out;
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const settings = await loadAiSettings();
        const lines: string[] = [];

        for (const bot of AI_BOTS) {
          const allowed = (settings[bot.key] ?? "true").toLowerCase() !== "false";
          for (const agent of bot.agents) {
            lines.push(`User-agent: ${agent}`);
            lines.push(allowed ? "Allow: /" : "Disallow: /");
            lines.push("");
          }
        }

        lines.push("User-agent: *");
        lines.push("Allow: /");
        lines.push("");
        lines.push("Sitemap: https://ahbd.lovable.app/sitemap.xml");

        return new Response(lines.join("\n"), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
