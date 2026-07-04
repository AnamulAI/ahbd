import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SECTION_KEYS, type SectionKey } from "./profile.functions";

export type TeamMember = {
  id: string;
  email: string | null;
  full_name: string | null;
  role_label: string;
  is_primary_owner: boolean;
  sections: Record<SectionKey, boolean>;
};

async function assertPrimaryOwner(context: {
  supabase: any;
  userId: string;
  claims: Record<string, unknown>;
}) {
  const email = ((context.claims["email"] as string) ?? "").toLowerCase();
  if (email === "anamulhoque.dev@gmail.com") return;
  const { data } = await context.supabase
    .from("user_profiles")
    .select("is_primary_owner")
    .eq("id", context.userId)
    .maybeSingle();
  if (!data?.is_primary_owner) throw new Error("Forbidden: only the primary owner can manage the team");
}

export const listTeamMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeamMember[]> => {
    await assertPrimaryOwner(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authUsers, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (usersErr) throw new Error(usersErr.message);

    const { data: profiles } = await supabaseAdmin.from("user_profiles").select("*");
    const { data: perms } = await supabaseAdmin.from("user_permissions").select("user_id, section_key, has_access");

    const profileById = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const permsByUser = new Map<string, Record<string, boolean>>();
    for (const row of perms ?? []) {
      const map = permsByUser.get(row.user_id) ?? {};
      map[row.section_key] = row.has_access;
      permsByUser.set(row.user_id, map);
    }

    const members: TeamMember[] = [];
    for (const u of authUsers.users) {
      const profile: any = profileById.get(u.id) ?? {};
      const isPrimary =
        profile.is_primary_owner === true ||
        (u.email ?? "").toLowerCase() === "anamulhoque.dev@gmail.com";
      if (u.id === context.userId) continue; // exclude self
      const map = permsByUser.get(u.id) ?? {};
      const sections = SECTION_KEYS.reduce((acc, k) => {
        acc[k] = isPrimary ? true : Boolean(map[k]);
        return acc;
      }, {} as Record<SectionKey, boolean>);
      members.push({
        id: u.id,
        email: u.email ?? null,
        full_name: profile.full_name ?? null,
        role_label: isPrimary ? "Owner" : (profile.role_label ?? "Custom"),
        is_primary_owner: isPrimary,
        sections,
      });
    }
    return members;
  });

const SectionsSchema = z.record(z.enum(SECTION_KEYS as unknown as [string, ...string[]]), z.boolean());

const InviteSchema = z.object({
  email: z.string().email(),
  full_name: z.string().max(200).optional(),
  role_label: z.enum(["Owner", "Admin", "Editor", "Custom"]),
  sections: SectionsSchema,
});

export const inviteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InviteSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertPrimaryOwner(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Invite via Auth Admin API (magic link email)
    const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
    );
    if (inviteErr) throw new Error(inviteErr.message);

    const userId = inviteData.user?.id;
    if (!userId) throw new Error("Invite created but no user id returned");

    // Create profile + permission rows
    await supabaseAdmin.from("user_profiles").upsert(
      {
        id: userId,
        full_name: data.full_name ?? null,
        role_label: data.role_label,
      },
      { onConflict: "id" },
    );

    // Grant admin role so they can access the admin panel at all
    await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: "admin" },
      { onConflict: "user_id,role" },
    );

    const permRows = SECTION_KEYS.map((k) => ({
      user_id: userId,
      section_key: k,
      has_access: Boolean(data.sections[k]),
    }));
    await supabaseAdmin.from("user_permissions").upsert(permRows, {
      onConflict: "user_id,section_key",
    });

    return { ok: true, user_id: userId };
  });

const UpdateSchema = z.object({
  user_id: z.string().uuid(),
  role_label: z.enum(["Owner", "Admin", "Editor", "Custom"]).optional(),
  sections: SectionsSchema,
});

export const updateMemberPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertPrimaryOwner(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Refuse to touch the primary owner (defense in depth; trigger also blocks it)
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("is_primary_owner")
      .eq("id", data.user_id)
      .maybeSingle();
    if (profile?.is_primary_owner) throw new Error("Cannot modify the primary owner");

    if (data.role_label) {
      await supabaseAdmin
        .from("user_profiles")
        .upsert({ id: data.user_id, role_label: data.role_label }, { onConflict: "id" });
    }

    const permRows = SECTION_KEYS.map((k) => ({
      user_id: data.user_id,
      section_key: k,
      has_access: Boolean(data.sections[k]),
    }));
    const { error } = await supabaseAdmin
      .from("user_permissions")
      .upsert(permRows, { onConflict: "user_id,section_key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const RemoveSchema = z.object({ user_id: z.string().uuid() });

export const removeTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => RemoveSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertPrimaryOwner(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("is_primary_owner")
      .eq("id", data.user_id)
      .maybeSingle();
    if (profile?.is_primary_owner) throw new Error("Cannot remove the primary owner");

    // Delete auth user (cascade deletes profile + permissions via FK)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
