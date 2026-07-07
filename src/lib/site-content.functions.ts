import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DeviceVisibility } from "@/lib/site-section-visibility.functions";

export type NavPlacement =
  "header_nav" | "footer_explore" | "footer_services" | "footer_legal" | "footer_social";

export type NavLinkRow = {
  id: string;
  placement: NavPlacement;
  label: string;
  href: string;
  icon_name: string | null;
  link_key: string | null;
  display_order: number;
  is_active: boolean;
  device_visibility: DeviceVisibility;
};

export type SiteContentText = {
  footer_copyright_text: string;
  footer_tagline_text: string;
  footer_address_text: string;
  footer_contact_email: string;
  footer_contact_phone: string;
  header_tagline_text: string;
};

const TEXT_KEYS = [
  "footer_copyright_text",
  "footer_tagline_text",
  "footer_address_text",
  "footer_contact_email",
  "footer_contact_phone",
  "header_tagline_text",
] as const;

// Merged over whatever partial rows exist in site_settings — a missing or
// empty row never breaks rendering. `{year}` is substituted at render time.
export const DEFAULT_SITE_CONTENT_TEXT: SiteContentText = {
  footer_copyright_text: "© {year} Mohammad Anamul Hoque. All rights reserved.",
  footer_tagline_text: "Building authority brands through AI-powered podcasts and modern websites.",
  footer_address_text: "",
  footer_contact_email: "",
  footer_contact_phone: "",
  header_tagline_text: "",
};

function serverPublicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function assertAdmin(context: {
  supabase: ReturnType<typeof serverPublicClient>;
  userId: string;
}) {
  const { data: roleRow } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) throw new Error("Forbidden");
}

export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    text: SiteContentText;
    navLinks: NavLinkRow[];
    sectionVisibility: Record<string, DeviceVisibility>;
  }> => {
    const sb = serverPublicClient();
    const [textRes, navRes, visRes] = await Promise.all([
      sb
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", TEXT_KEYS as unknown as string[]),
      sb
        .from("site_nav_links" as never)
        .select("*")
        .eq("is_active", true)
        .order("placement", { ascending: true })
        .order("display_order", { ascending: true }),
      sb.from("site_section_visibility" as never).select("section_key, device_visibility"),
    ]);

    const text: SiteContentText = { ...DEFAULT_SITE_CONTENT_TEXT };
    for (const row of textRes.data ?? []) {
      const key = row.setting_key as keyof SiteContentText;
      if (key in text && typeof row.setting_value === "string" && row.setting_value !== "") {
        text[key] = row.setting_value;
      }
    }

    const navLinks = (navRes.data ?? []) as unknown as NavLinkRow[];

    const sectionVisibility: Record<string, DeviceVisibility> = {};
    for (const row of (visRes.data ?? []) as unknown as {
      section_key: string;
      device_visibility: DeviceVisibility;
    }[]) {
      sectionVisibility[row.section_key] = row.device_visibility;
    }

    return { text, navLinks, sectionVisibility };
  },
);

// Admin-only: returns every row (including inactive/draft ones) so the admin
// UI can toggle them back on. The public getSiteContent() above intentionally
// only returns is_active rows — this is a separate, auth-gated read so
// draft/disabled links never surface to anonymous visitors.
export const listAllNavLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NavLinkRow[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("site_nav_links" as never)
      .select("*")
      .order("placement", { ascending: true })
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as NavLinkRow[];
  });

const TextUpdateSchema = z.object({
  footer_copyright_text: z.string(),
  footer_tagline_text: z.string(),
  footer_address_text: z.string(),
  footer_contact_email: z.string(),
  footer_contact_phone: z.string(),
  header_tagline_text: z.string(),
});

export const updateSiteContentText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => TextUpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const rows = TEXT_KEYS.map((key) => ({
      setting_key: key,
      setting_value: data[key],
    }));
    const { error } = await context.supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "setting_key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const NavLinkSchema = z.object({
  id: z.string().optional(),
  placement: z.enum([
    "header_nav",
    "footer_explore",
    "footer_services",
    "footer_legal",
    "footer_social",
  ]),
  label: z.string().min(1),
  href: z.string().min(1),
  icon_name: z.string().nullable().optional(),
  link_key: z.string().nullable().optional(),
  display_order: z.number(),
  is_active: z.boolean(),
  device_visibility: z.enum(["both", "desktop", "mobile"]).default("both"),
});

// Create (no id) or update (with id) a single nav/footer link row. Used for
// both plain edits and reordering (called twice with swapped display_order,
// same pattern as Builder Settings' moveTier).
export const upsertNavLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => NavLinkSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    if (id) {
      const { error } = await context.supabase
        .from("site_nav_links" as never)
        .update(rest as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true, id };
    }
    const { data: inserted, error } = await context.supabase
      .from("site_nav_links" as never)
      .insert(rest as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: (inserted as { id: string }).id };
  });

export const deleteNavLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("site_nav_links" as never)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
