
-- Part 1: SEO fields on projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

-- Part 2: static_page_seo
CREATE TABLE IF NOT EXISTS public.static_page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  page_label text NOT NULL,
  seo_title text,
  seo_description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.static_page_seo TO anon, authenticated;
GRANT ALL ON public.static_page_seo TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.static_page_seo TO authenticated;
ALTER TABLE public.static_page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "static_page_seo public read"
  ON public.static_page_seo FOR SELECT
  USING (true);

CREATE POLICY "static_page_seo admin write"
  ON public.static_page_seo FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER static_page_seo_updated
BEFORE UPDATE ON public.static_page_seo
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.static_page_seo (page_key, page_label) VALUES
  ('home','Home'),
  ('about','About'),
  ('services','Services'),
  ('contact','Contact')
ON CONFLICT (page_key) DO NOTHING;

-- Part 3/4: site_settings key-value store
CREATE TABLE IF NOT EXISTS public.site_settings (
  setting_key text PRIMARY KEY,
  setting_value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings public read"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "site_settings admin write"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_settings_updated
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('default_meta_title_template', '{page} | AnamDev'),
  ('default_meta_description', ''),
  ('default_og_image_url', ''),
  ('ga4_measurement_id', ''),
  ('facebook_pixel_id', ''),
  ('google_site_verification', ''),
  ('custom_head_scripts', ''),
  ('custom_body_scripts', '')
ON CONFLICT (setting_key) DO NOTHING;
