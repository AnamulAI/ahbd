## Goal
Let admins create, rename, recolor, and delete blog categories from the admin dashboard. The blog editor's Category dropdown pulls from this list (with an inline "+ New category" shortcut), and existing posts keep working.

## Changes

### 1. Database (migration)
New table `public.blog_categories`:
- `key` (text, primary key, slug-safe) — matches `blog_posts.category`
- `label` (text)
- `color` (text, hex like `#3B82F6`)
- `sort_order` (int, default 0)
- `created_at`, `updated_at`

RLS + GRANTs:
- `GRANT SELECT` to `anon, authenticated` (public site reads categories for tag chips).
- `GRANT ALL` to `service_role`; `GRANT INSERT/UPDATE/DELETE` to `authenticated`.
- Public SELECT policy (anyone can read).
- Admin-only write policies gated by `has_section_access(auth.uid(), 'blog_posts')`.
- Seed the three current categories: `web_development` / Web Development / `#3B82F6`, `ai_integrator` / AI Integrator / `#F97316`, `ai_podcast` / AI Podcast / `#22C55E`.

### 2. Admin — Categories manager
New route `/admin/blog/categories` (linked from the Blog list page header, next to "New Post"):
- Table of categories: color swatch, label, key, sort order, edit / delete.
- "New category" form: label (auto-slug → key), color picker (hex input + swatch), sort order.
- Edit inline. Delete disabled when any `blog_posts.category = key` exists (shows count).

### 3. Blog editor + list — dynamic categories
- Replace hardcoded `CATEGORY_OPTIONS/LABEL/COLOR` reads in `BlogEditorPage` and `BlogListPage` with a hook `useBlogCategories()` that fetches from `blog_categories` (ordered by `sort_order`, then label).
- Editor Category dropdown ends with a "+ New category…" option → opens a small dialog (label + color), inserts row, selects it.
- List page category filter and chip colors come from the same hook. Unknown category keys fall back to a neutral gray chip.
- Keep `slugify` for key generation; enforce uniqueness via PK.

### 4. Public site
`src/lib/blog-data.ts` / `blog-loader.ts` and any site components rendering the category chip switch to the same fetched list (single source of truth). Behavior unchanged for the seeded keys.

## Out of scope
- No changes to `blog_posts` schema (still stores `category` as text key).
- No reassignment tool for bulk-moving posts between categories (delete stays blocked while in use).
- No changes to sidebar cards, projects, or other content types.

## Files touched
- New migration (via `supabase--migration`)
- New: `src/components/admin/BlogCategoriesPage.tsx`, `src/routes/admin.blog.categories.tsx`, `src/hooks/use-blog-categories.ts`
- Edit: `src/components/admin/BlogEditorPage.tsx`, `src/components/admin/BlogListPage.tsx`, `src/lib/admin-content-helpers.ts` (keep `slugify`, drop hardcoded category maps or keep as fallback constants), any public blog components using `CATEGORY_LABEL/COLOR`.