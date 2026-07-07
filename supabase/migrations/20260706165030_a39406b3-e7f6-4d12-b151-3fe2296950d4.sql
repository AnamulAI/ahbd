-- Visibility Control (Part 1): new table for hardcoded/static section-level
-- device visibility (Homepage blocks, Footer structural blocks, Blog detail
-- blocks that have no other existing admin-editable table backing them).

CREATE TABLE IF NOT EXISTS public.site_section_visibility (
  section_key text PRIMARY KEY,   -- stable identifier, e.g. 'home.the_problem'
  page text NOT NULL,             -- 'home' | 'footer' | 'blog_detail' — for admin grouping
  label text NOT NULL,            -- human-readable name shown in the admin UI
  device_visibility text NOT NULL DEFAULT 'both'
    CHECK (device_visibility IN ('both', 'desktop', 'mobile')),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_section_visibility TO anon, authenticated;
GRANT ALL ON public.site_section_visibility TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_section_visibility TO authenticated;
ALTER TABLE public.site_section_visibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_section_visibility public read"
  ON public.site_section_visibility FOR SELECT
  USING (true);

CREATE POLICY "site_section_visibility admin write"
  ON public.site_section_visibility FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_section_visibility_updated
BEFORE UPDATE ON public.site_section_visibility
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 17 in-scope sections (idempotent — safe to re-run).
INSERT INTO public.site_section_visibility (section_key, page, label, device_visibility, display_order) VALUES
  -- Homepage
  ('home.the_problem',      'home', 'The Problem',        'both', 10),
  ('home.the_journey',      'home', 'The Journey',        'both', 20),
  ('home.why_this_works',   'home', 'Why This Works',     'both', 30),
  ('home.about_condensed',  'home', 'About (Condensed)',  'both', 40),
  ('home.selected_work',    'home', 'Selected Work',      'both', 50),
  ('home.from_the_blog',    'home', 'From the Blog',      'both', 60),
  ('home.faq',              'home', 'FAQ',                'both', 70),
  ('home.closing_cta',      'home', 'Closing CTA',        'both', 80),
  -- Footer
  ('footer.brand_blurb',      'footer', 'Brand Blurb',      'both', 10),
  ('footer.explore_column',   'footer', 'Explore Column',   'both', 20),
  ('footer.services_column',  'footer', 'Services Column',  'both', 30),
  ('footer.legal_column',     'footer', 'Legal Column',     'both', 40),
  ('footer.social_icons',     'footer', 'Social Icons',     'both', 50),
  ('footer.copyright',        'footer', 'Copyright',        'both', 60),
  -- Blog Post Detail
  ('blog_detail.author_bio',      'blog_detail', 'Author Bio Row',  'both', 10),
  ('blog_detail.related_posts',   'blog_detail', 'Related Posts',   'both', 20),
  ('blog_detail.closing_cta',     'blog_detail', 'Closing CTA',     'both', 30)
ON CONFLICT (section_key) DO NOTHING;

-- Visibility Control (Part 2): device_visibility on tables that already back
-- an individually manageable "section" (one row == one card/link). Defaults
-- to 'both' so every existing row keeps its current (fully visible) behavior.

ALTER TABLE public.blog_sidebar_cards
  ADD COLUMN IF NOT EXISTS device_visibility text NOT NULL DEFAULT 'both'
    CHECK (device_visibility IN ('both', 'desktop', 'mobile'));

ALTER TABLE public.site_nav_links
  ADD COLUMN IF NOT EXISTS device_visibility text NOT NULL DEFAULT 'both'
    CHECK (device_visibility IN ('both', 'desktop', 'mobile'));
