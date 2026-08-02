ALTER TABLE public.sample_previews
  ADD COLUMN IF NOT EXISTS extra_video_1_url text,
  ADD COLUMN IF NOT EXISTS extra_video_1_title text,
  ADD COLUMN IF NOT EXISTS extra_video_1_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS extra_video_2_url text,
  ADD COLUMN IF NOT EXISTS extra_video_2_title text,
  ADD COLUMN IF NOT EXISTS extra_video_2_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS extra_video_3_url text,
  ADD COLUMN IF NOT EXISTS extra_video_3_title text,
  ADD COLUMN IF NOT EXISTS extra_video_3_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS extra_video_4_url text,
  ADD COLUMN IF NOT EXISTS extra_video_4_title text,
  ADD COLUMN IF NOT EXISTS extra_video_4_enabled boolean NOT NULL DEFAULT false;