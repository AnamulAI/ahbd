import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DeviceVisibility = "both" | "desktop" | "mobile";
export type SectionPage = "home" | "footer" | "blog_detail";

export type SectionVisibilityRow = {
  section_key: string;
  page: SectionPage;
  label: string;
  device_visibility: DeviceVisibility;
  display_order: number;
};

/** CSS-based device visibility — content still renders in the DOM on both
 *  server and client (no hydration mismatch), just hidden per breakpoint.
 *  `shownDisplay` is the Tailwind display value the element should use once
 *  visible at the md+ breakpoint. Returns fully literal class strings (not
 *  built via `md:${shownDisplay}` interpolation) so Tailwind's static
 *  content scanner can actually detect and generate every variant. */
export function sectionVisibilityClass(
  v: DeviceVisibility,
  shownDisplay: "block" | "flex" | "inline-flex" | "inline-block" | "grid" = "block",
): string {
  if (v === "mobile") return "md:hidden";
  if (v !== "desktop") return "";
  switch (shownDisplay) {
    case "flex":
      return "hidden md:flex";
    case "inline-flex":
      return "hidden md:inline-flex";
    case "inline-block":
      return "hidden md:inline-block";
    case "grid":
      return "hidden md:grid";
    default:
      return "hidden md:block";
  }
}

function serverPublicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function assertVisibilityControlAccess(context: any) {
  const sb = context.supabase as any;
  const { data, error } = await sb.rpc("has_section_access", {
    _user_id: context.userId,
    _section: "visibility_control",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: no access to Visibility Control");
}

// Public — read by both the public site (Homepage/Footer/Blog detail, wired
// up in a later step) and the admin Visibility Control page. Values aren't
// sensitive; RLS already allows anon SELECT on this table.
export const getSectionVisibility = createServerFn({ method: "GET" }).handler(
  async (): Promise<SectionVisibilityRow[]> => {
    const sb = serverPublicClient();
    const { data, error } = await sb
      .from("site_section_visibility" as never)
      .select("*")
      .order("page", { ascending: true })
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as SectionVisibilityRow[];
  },
);

const UpdateSchema = z.object({
  section_key: z.string().min(1),
  device_visibility: z.enum(["both", "desktop", "mobile"]),
});

export const updateSectionVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertVisibilityControlAccess(context);
    const { error } = await context.supabase
      .from("site_section_visibility" as never)
      .update({ device_visibility: data.device_visibility } as never)
      .eq("section_key", data.section_key);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
