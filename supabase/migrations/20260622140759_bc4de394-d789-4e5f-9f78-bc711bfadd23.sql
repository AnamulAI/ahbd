ALTER TABLE public.sample_previews
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS clip_instagram_url text,
  ADD COLUMN IF NOT EXISTS clip_tiktok_url text,
  ADD COLUMN IF NOT EXISTS clip_linkedin_url text;