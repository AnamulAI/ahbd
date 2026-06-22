
CREATE TABLE public.sample_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  business_name text NOT NULL,
  logo_url text,
  episode_title text NOT NULL DEFAULT '',
  topic text NOT NULL DEFAULT '',
  platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
  show_video boolean NOT NULL DEFAULT false,
  show_smm boolean NOT NULL DEFAULT false,
  module_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_text text NOT NULL DEFAULT 'Get This Service →',
  cta_link text NOT NULL DEFAULT '/services/ai-podcast',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sample_previews TO anon, authenticated;
GRANT ALL ON public.sample_previews TO service_role;

ALTER TABLE public.sample_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sample previews by slug"
  ON public.sample_previews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER sample_previews_updated_at
  BEFORE UPDATE ON public.sample_previews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for the sample-logos bucket (bucket itself is created via the storage tool)
CREATE POLICY "Public can read sample logos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'sample-logos');

CREATE POLICY "Service role can manage sample logos"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'sample-logos')
  WITH CHECK (bucket_id = 'sample-logos');
