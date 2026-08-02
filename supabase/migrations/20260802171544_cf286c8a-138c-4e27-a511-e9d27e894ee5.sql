ALTER TABLE public.sample_previews
  ADD COLUMN IF NOT EXISTS clip_instagram_thumb_url text,
  ADD COLUMN IF NOT EXISTS clip_instagram_thumb_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS clip_tiktok_thumb_url text,
  ADD COLUMN IF NOT EXISTS clip_tiktok_thumb_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS clip_linkedin_thumb_url text,
  ADD COLUMN IF NOT EXISTS clip_linkedin_thumb_enabled boolean NOT NULL DEFAULT false;