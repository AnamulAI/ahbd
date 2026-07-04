import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const SECTION_KEYS = [
  "dashboard",
  "leads",
  "sample_builder",
  "builder_settings",
  "blog_posts",
  "sidebar_cards",
  "projects",
  "newsletter",
  "pages",
  "seo_tracking",
  "analytics",
  "integrations",
  "profile",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  dashboard: "Dashboard",
  leads: "Leads",
  sample_builder: "Sample Builder",
  builder_settings: "Builder Settings",
  blog_posts: "Blog Posts",
  sidebar_cards: "Sidebar Cards",
  projects: "Projects",
  newsletter: "Newsletter",
  pages: "Pages",
  seo_tracking: "SEO & Tracking",
  analytics: "Analytics",
  integrations: "Integrations",
  profile: "Profile",
};

export type MyProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role_label: string;
  is_primary_owner: boolean;
  sections: Record<SectionKey, boolean>;
};

async function loadProfile(context: {
  supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>;
  userId: string;
  claims: Record<string, unknown>;
}): Promise<MyProfile> {
  const sb = context.supabase as any;
  const [{ data: profile }, { data: perms }] = await Promise.all([
    sb.from("user_profiles").select("*").eq("id", context.userId).maybeSingle(),
    sb.from("user_permissions").select("section_key, has_access").eq("user_id", context.userId),
  ]);

  const email = (context.claims["email"] as string | undefined) ?? null;
  const isPrimaryOwner: boolean =
    profile?.is_primary_owner === true ||
    (email ?? "").toLowerCase() === "anamulhoque.dev@gmail.com";

  const sections = SECTION_KEYS.reduce(
    (acc, k) => {
      acc[k] = isPrimaryOwner;
      return acc;
    },
    {} as Record<SectionKey, boolean>,
  );
  for (const row of perms ?? []) {
    const k = row.section_key as SectionKey;
    if (k in sections) sections[k] = Boolean(row.has_access) || isPrimaryOwner;
  }

  return {
    id: context.userId,
    email,
    full_name: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    avatar_url: profile?.avatar_url ?? null,
    role_label: isPrimaryOwner ? "Owner" : (profile?.role_label ?? "Custom"),
    is_primary_owner: isPrimaryOwner,
    sections,
  };
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => loadProfile(context as any));

const UpdateSchema = z.object({
  full_name: z.string().max(200).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  avatar_url: z.string().max(1000).nullable().optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    // Ensure profile row exists
    const { error } = await sb
      .from("user_profiles")
      .upsert(
        {
          id: context.userId,
          full_name: data.full_name ?? null,
          phone: data.phone ?? null,
          avatar_url: data.avatar_url ?? null,
        },
        { onConflict: "id" },
      );
    if (error) throw new Error(error.message);
    return loadProfile(context as any);
  });
