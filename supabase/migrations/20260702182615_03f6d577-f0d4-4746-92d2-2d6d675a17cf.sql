ALTER TABLE public.sample_previews
  ADD COLUMN IF NOT EXISTS client_industry text,
  ADD COLUMN IF NOT EXISTS scarcity_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scarcity_message text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS booking_link text,
  ADD COLUMN IF NOT EXISTS estimated_listeners text,
  ADD COLUMN IF NOT EXISTS estimated_reach_growth text,
  ADD COLUMN IF NOT EXISTS estimated_time_saved text,
  ADD COLUMN IF NOT EXISTS before_state text,
  ADD COLUMN IF NOT EXISTS after_state text,
  ADD COLUMN IF NOT EXISTS ig_reel_caption text,
  ADD COLUMN IF NOT EXISTS tiktok_clip_caption text,
  ADD COLUMN IF NOT EXISTS linkedin_clip_caption text;

CREATE TABLE IF NOT EXISTS public.social_proof_logos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.social_proof_logos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_proof_logos TO authenticated;
GRANT ALL ON public.social_proof_logos TO service_role;

ALTER TABLE public.social_proof_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view social proof logos"
  ON public.social_proof_logos FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert social proof logos"
  ON public.social_proof_logos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update social proof logos"
  ON public.social_proof_logos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete social proof logos"
  ON public.social_proof_logos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_social_proof_logos_updated_at
  BEFORE UPDATE ON public.social_proof_logos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();