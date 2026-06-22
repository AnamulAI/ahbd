ALTER TABLE public.sample_previews
  ADD COLUMN IF NOT EXISTS audience_category text NOT NULL DEFAULT 'businesses'
  CHECK (audience_category IN ('marketers', 'creators', 'businesses', 'educators'));