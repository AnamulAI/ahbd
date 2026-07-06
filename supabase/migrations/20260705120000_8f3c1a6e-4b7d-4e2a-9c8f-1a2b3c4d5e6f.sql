-- Part 1: site_settings scalar keys for header/footer text
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('footer_copyright_text', '© {year} Mohammad Anamul Hoque. All rights reserved.'),
  ('footer_tagline_text', 'Building authority brands through AI-powered podcasts and modern websites.'),
  ('footer_address_text', ''),
  ('footer_contact_email', ''),
  ('footer_contact_phone', ''),
  ('header_tagline_text', '')
ON CONFLICT (setting_key) DO NOTHING;

-- Part 2: site_nav_links — ordered, admin-editable nav/footer link rows
CREATE TABLE IF NOT EXISTS public.site_nav_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement text NOT NULL,
  label text NOT NULL,
  href text NOT NULL,
  icon_name text,
  link_key text,             -- stable identifier for rows with special behavior
                              -- (currently only 'services' — its href is ignored
                              -- on the public site in favor of Page Assignment)
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_nav_links TO anon, authenticated;
GRANT ALL ON public.site_nav_links TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_nav_links TO authenticated;
ALTER TABLE public.site_nav_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_nav_links public read"
  ON public.site_nav_links FOR SELECT
  USING (true);

CREATE POLICY "site_nav_links admin write"
  ON public.site_nav_links FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_nav_links_updated
BEFORE UPDATE ON public.site_nav_links
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Part 3: seed today's exact hardcoded content (only runs if the table is
-- currently empty, so this is safe to leave in place / can't double-insert)
INSERT INTO public.site_nav_links (placement, label, href, link_key, display_order, is_active)
SELECT * FROM (VALUES
  -- header_nav (matches SiteHeader.tsx's current NAV_LINKS)
  ('header_nav', 'Home', '/', NULL, 1, true),
  ('header_nav', 'About', '/about', NULL, 2, true),
  ('header_nav', 'Services', '/services/web-development', 'services', 3, true),
  ('header_nav', 'Projects', '/projects', NULL, 4, true),
  ('header_nav', 'Blog', '/blog', NULL, 5, true),
  ('header_nav', 'Contact', '/contact', NULL, 6, true),
  -- footer_explore (matches SiteFooter.tsx's current `explore`)
  ('footer_explore', 'Home', '/', NULL, 1, true),
  ('footer_explore', 'About', '/about', NULL, 2, true),
  ('footer_explore', 'Projects', '/projects', NULL, 3, true),
  -- footer_services (matches SiteFooter.tsx's current `services`)
  ('footer_services', 'Web Development', '/services/web-development', NULL, 1, true),
  ('footer_services', 'AI Integrator', '/services/ai-integrator', NULL, 2, true),
  ('footer_services', 'AI Podcast', '/services/ai-podcast', NULL, 3, true),
  -- footer_legal (matches SiteFooter.tsx's current `legal`)
  ('footer_legal', 'Privacy Policy', '/privacy', NULL, 1, true),
  ('footer_legal', 'Terms of Service', '/terms', NULL, 2, true),
  ('footer_legal', 'Contact', '/contact', NULL, 3, true)
  -- footer_social: intentionally not seeded (none exist today) — add via admin UI
) AS v(placement, label, href, link_key, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.site_nav_links);
