# Plan: Page Assignment + Profile & Team Permissions

## Part 1 — Page Assignment (small)

**DB (migration):** reuse existing `site_settings` (key/value). Insert defaults for `home_page_route` = `/` and `services_page_route` = `/services/web-development`.

**Admin UI:** activate the sidebar "Pages" item — replace its current placeholder with a new `PagesAssignmentPage` at `/admin/pages`. Two `<Select>` dropdowns listing:
- Home (`/`), Web Development (`/services/web-development`), AI Integrator (`/services/ai-integrator`), AI Podcast (`/services/ai-podcast`), Blog (`/blog`), Projects (`/projects`), About (`/about`), Contact (`/contact`).

Each has the warning note + one "Save Settings" button that upserts both keys via a `requireSupabaseAuth` + admin-check server fn.

**Runtime wiring:**
- `/` route (`src/routes/index.tsx`): loader reads `home_page_route` via a public server fn (publishable client). If the value is not `/`, `throw redirect({ to: <route>, statusCode: 302 })`. If it IS `/` (default Home), render current home component untouched.
- Site nav: `SiteHeader` + `SiteFooter` fetch `services_page_route` once (public server fn, TanStack Query, cached) and render the "Services" `<Link>` with the dynamic `to`.

## Part 2 — Profile & Flexible Permissions

### DB migration (single migration)

1. `user_profiles`: `id uuid pk references auth.users on delete cascade`, `full_name text`, `phone text`, `avatar_url text`, `role_label text default 'Custom'`, `is_primary_owner boolean not null default false`, `created_at/updated_at`.
2. `user_permissions`: `id uuid pk`, `user_id uuid references auth.users on delete cascade`, `section_key text`, `has_access boolean default false`, `unique(user_id, section_key)`.
3. Grants (`authenticated`, `service_role`) + RLS enabled.
4. Reuse existing `has_role(_user_id, _role)` and `app_role` enum. Add helper `public.is_primary_owner(_user_id uuid)` returning boolean (checks the flag OR the fallback email `anamulhoque.dev@gmail.com` via `auth.users`).
5. Add helper `public.has_section_access(_user_id uuid, _section text)` returning boolean — always true for primary owner + admins with the section row set true.
6. **Safeguard trigger** on `user_permissions`: BEFORE INSERT OR UPDATE OR DELETE — if target user is primary owner, force `has_access = true` and block delete. Also BEFORE UPDATE OR DELETE on `user_profiles` blocks changes to `is_primary_owner` and blocks delete of primary owner.
7. RLS policies:
   - `user_profiles`: self-select; primary-owner-only update on others; admin select all.
   - `user_permissions`: self-select; primary-owner-only insert/update/delete on others.
8. Seed: insert `user_profiles` row for existing owner (`anamulhoque.dev@gmail.com`) with `is_primary_owner=true`, `role_label='Owner'`. Backfill full `user_permissions` set for that user (all sections, has_access=true).
9. Storage: create bucket `profile-avatars` (public), with RLS on `storage.objects` allowing admin/owner upload/delete, public read.

### Server functions (`src/lib/profile.functions.ts`, `src/lib/team.functions.ts`, `src/lib/pages-settings.functions.ts`)

- `getMyProfile`, `updateMyProfile`, `getMyPermissions` (requireSupabaseAuth).
- `listTeamMembers`, `getMemberPermissions`, `updateMemberPermissions`, `removeTeamMember` (requireSupabaseAuth + `is_primary_owner` check inside handler; use `supabaseAdmin` loaded inside handler for auth admin ops).
- `inviteTeamMember` — validates caller is primary owner, calls `supabaseAdmin.auth.admin.inviteUserByEmail()`, seeds `user_profiles` + `user_permissions` rows.
- `getPageAssignments` (public, publishable client), `updatePageAssignments` (admin-only).

### Client — Sidebar & Permission context

- New hook `useMyPermissions()` — TanStack Query, returns `{ sections: Set<string>, isPrimaryOwner, roleLabel }`.
- `AdminShell.tsx`: filter the nav items array by `sections.has(item.sectionKey)`, always show Dashboard, always show Profile. Replace the bottom profile block with a link to `/admin/profile` (keep Logout + Back to Website).
- Route guards: each admin route component checks `useMyPermissions()`; if missing, `<Navigate to="/admin" />` with a toast. Dashboard/Profile skip the check.

### Profile page (`/admin/profile`)

Card 1 "Your Profile": avatar dropzone (upload to `profile-avatars`), Full Name, Email (disabled), Phone, Save.

Card 2 "Role & Permissions": read-only checklist for self, showing role_label + each section with lock icons for primary owner.

Team Members section (owner-only): list of other users with Edit / Remove buttons + "+ Invite" dialog. Invite dialog = email input + role preset select (Owner/Admin/Editor/Custom) with preset defaults, followed by editable per-section checklist. Edit dialog = same checklist pre-filled.

### Section keys (canonical list)
`dashboard, leads, sample_builder, builder_settings, blog_posts, sidebar_cards, projects, newsletter, pages, seo_tracking, integrations, profile`

## Explicit scope

- Phase 1 does **not** add per-section RLS to content tables (blog_posts, projects, newsletter_subscribers, sample_previews, etc.). Enforcement is UI + route guard + server-fn admin check. Phase 2 (follow-up) adds `has_section_access(auth.uid(), '<key>')` policies to each table.
- Primary owner identified by BOTH `is_primary_owner` flag AND email fallback in `is_primary_owner()` function; trigger prevents flag being changed and permissions being reduced.

## Files touched (new)

- `supabase/migrations/<ts>_profile_permissions.sql`
- `src/lib/pages-settings.functions.ts`
- `src/lib/profile.functions.ts`
- `src/lib/team.functions.ts`
- `src/hooks/use-my-permissions.ts`
- `src/components/admin/PagesAssignmentPage.tsx`
- `src/components/admin/ProfilePage.tsx`
- `src/components/admin/TeamMembersSection.tsx`
- `src/components/admin/InviteMemberDialog.tsx`
- `src/components/admin/EditMemberPermissionsDialog.tsx`
- `src/routes/admin.pages.tsx`
- `src/routes/admin.profile.tsx`

## Files modified

- `src/routes/index.tsx` — loader reads home_page_route, throws redirect when not `/`.
- `src/components/site/SiteHeader.tsx` + `SiteFooter.tsx` — dynamic Services href.
- `src/components/admin/AdminShell.tsx` — permission-filtered nav, profile block → link, section-key metadata on each nav item.
- Each `src/routes/admin.*.tsx` — add permission-guard wrapper (or centralize inside AdminShell via a `requiredSection` prop).

## Verification (per user's 8 checks)

Run after build: set home page to AI Podcast → curl `/` returns 302; set services to /about → header link points there; upload avatar; invite Editor and verify preset; log in as second user in incognito and check sidebar; confirm owner unaffected; attempt Editor write via supabase-js — will succeed at DB level in Phase 1 (documented), route guard blocks UI; note Phase 2 follow-up.