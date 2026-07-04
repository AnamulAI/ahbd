# Module 6 — SEO & Tracking

Large multi-part module. Plan below; will implement across ~2-3 turns after DB migration approval.

## DB migrations (single migration)

1. `ALTER TABLE public.projects ADD COLUMN seo_title text, ADD COLUMN seo_description text`.
2. Create `public.static_page_seo` (id, page_key unique, page_label, seo_title, seo_description, updated_at) + grants + RLS (public SELECT; admin write via `has_role`) + seed rows `home / about / services / contact`.
3. Create `public.site_settings` key-value table (`setting_key` unique PK, `setting_value` text, updated_at) + grants + RLS (public SELECT; admin write). Seed empty rows for `default_meta_title_template`, `default_meta_description`, `default_og_image_url`, `ga4_measurement_id`, `facebook_pixel_id`, `google_site_verification`, `custom_head_scripts`, `custom_body_scripts`.
   - No existing `page_settings` table in project (verified) — creating a fresh, generically named `site_settings` is cleaner than fabricating a "page_settings" name.

## Part 1 — Project SEO fields

- Add SEO card (title + description, same visual pattern as Blog editor lines 244-260) to `src/components/admin/ProjectEditorPage.tsx`. Load/save via existing project state.
- In `src/routes/projects.$slug.tsx` `head()`, use `seo_title` → fallback to project title, `seo_description` → fallback to project description → global default.

## Part 2 — SEO & Tracking admin page

- `src/components/admin/AdminShell.tsx`: change the SEO nav item from `/admin/coming-soon/seo` (comingSoon) to `/admin/seo` (active).
- New route `src/routes/admin.seo.tsx` → new component `src/components/admin/SeoTrackingPage.tsx` with three sections stacked (Static Pages / Global Defaults / Tracking & Verification).
- Static Pages list: fetch `static_page_seo` rows, row layout matching existing services listing pattern (label + muted route + Edit pencil). Edit opens inline dialog/panel with title + description fields, saves back.
- Public pages (`index.tsx`, `about.tsx`, `services.index.tsx`, `contact.tsx`): route loader fetches the row for its `page_key`, `head()` renders resolved title/description with global fallback. Loaders call a small `getStaticPageSeo` server fn (public) to avoid client-only fetch on SSR.

## Part 3 — Global Defaults

- Section with three fields (title template with `{page}` note, description textarea, OG image upload reusing existing `ImageUploader`). Read/write `site_settings` rows via server fns.
- Helper `resolveSeo({ pageTitle, seoTitle, seoDescription, ogImage })` used by all `head()` implementations.

## Part 4 — Tracking & Verification

- Section with GA4 ID, FB Pixel ID, GSC verification, Custom Head Scripts (large textarea), Custom Body Scripts (smaller textarea).
- New server fn `getPublicSiteSettings()` returns the tracking bag (safe fields only; strings).
- In `src/routes/__root.tsx`:
  - Loader calls `getPublicSiteSettings()`.
  - `head()` builds:
    - `<meta name="google-site-verification" content="…">` when set.
    - GA4 gtag: two `scripts` entries (`{ src: "https://www.googletagmanager.com/gtag/js?id=…", async: true }` and inline gtag init).
    - Facebook Pixel: inline init script + noscript img (noscript in body via component render).
    - Custom head scripts: parse and emit as `scripts` entries — since head scripts field is raw HTML, we inject via a small `<CustomHtmlHead html={...} />` that uses `dangerouslySetInnerHTML` inside a hidden container appended to `document.head` via `useEffect` (SSR-safe fallback: inject through `scripts` array as inline children when it's a plain `<script>…</script>`; for arbitrary HTML we accept client-side injection). Simpler: render the raw HTML through a `ScriptOnce`-style tag by appending to `document.head` on mount. Body scripts injected via similar effect appending to `document.body`.

## Part 5 — Structured data (JSON-LD)

- Blog post route `head().scripts`: Article JSON-LD from post fields (author = "Mohammad Anamul Hoque"). If parsed content contains FAQ (reuse existing FAQ detector — locate in blog route file), also emit FAQPage JSON-LD.
- Project route `head().scripts`: CreativeWork JSON-LD with title/description/image/category.
- Root route `head().scripts`: Organization JSON-LD (name AnamDev, url, logo). Include `sameAs` only from confirmed socials in `SiteFooter.tsx` (read once, hardcode into the schema builder).

## Files to touch (approximate)

- New: `supabase/migrations/<ts>_seo_module.sql`, `src/routes/admin.seo.tsx`, `src/components/admin/SeoTrackingPage.tsx`, `src/lib/seo.functions.ts`, `src/lib/seo-helpers.ts`.
- Edit: `src/components/admin/AdminShell.tsx`, `src/components/admin/ProjectEditorPage.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/about.tsx`, `src/routes/services.index.tsx`, `src/routes/contact.tsx`, `src/routes/projects.$slug.tsx`, `src/routes/blog.$slug.tsx`, `src/routes/admin.index.tsx` (dashboard tile if any).

## Notes / trade-offs

- `custom_head_scripts` / `custom_body_scripts` are admin-only trusted input; injected client-side via `useEffect` appending a parsed HTML fragment (works for `<script>`, `<meta>`, `<noscript>` tags). This means those scripts do not run during SSR/prerender — acceptable for GA/pixel/chat widgets which all initialize client-side anyway.
- Site settings table is public-readable so SSR `head()` can render values without auth.
- No changes to existing blog SEO card copy other than updating the note text since this IS the SEO module (per user).

Approve to proceed with the migration + implementation.
