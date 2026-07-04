import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const KEYS = ["home_page_route", "services_page_route"] as const;
export type PageAssignmentKey = (typeof KEYS)[number];

export type PageAssignments = {
  home_page_route: string;
  services_page_route: string;
};

const DEFAULTS: PageAssignments = {
  home_page_route: "/",
  services_page_route: "/services/web-development",
};

function serverPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    },
  );
}

export const getPageAssignments = createServerFn({ method: "GET" }).handler(
  async (): Promise<PageAssignments> => {
    const sb = serverPublicClient();
    const { data } = await sb
      .from("site_settings")
      .select("setting_key, setting_value")
      .in("setting_key", KEYS as unknown as string[]);
    const out: PageAssignments = { ...DEFAULTS };
    for (const row of data ?? []) {
      const key = row.setting_key as PageAssignmentKey;
      if (key in out && typeof row.setting_value === "string") {
        (out as Record<string, string>)[key] = row.setting_value;
      }
    }
    return out;
  },
);

const UpdateSchema = z.object({
  home_page_route: z.string().min(1),
  services_page_route: z.string().min(1),
});

export const updatePageAssignments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Only primary owner or admin can write; enforced by RLS on site_settings admin write policy.
    // But we also verify admin role for defense in depth.
    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");

    const rows = [
      { setting_key: "home_page_route", setting_value: data.home_page_route },
      { setting_key: "services_page_route", setting_value: data.services_page_route },
    ];
    const { error } = await context.supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "setting_key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
