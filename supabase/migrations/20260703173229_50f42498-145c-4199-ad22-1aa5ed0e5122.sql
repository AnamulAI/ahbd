ALTER TABLE public.sample_previews
  ADD COLUMN IF NOT EXISTS scarcity_duration_days integer,
  ADD COLUMN IF NOT EXISTS scarcity_label text;