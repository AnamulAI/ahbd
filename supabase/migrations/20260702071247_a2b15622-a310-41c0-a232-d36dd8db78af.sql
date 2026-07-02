
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS spotify_url text,
  ADD COLUMN IF NOT EXISTS apple_podcasts_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS episode_title text,
  ADD COLUMN IF NOT EXISTS episode_audio_url text,
  ADD COLUMN IF NOT EXISTS episode_video_url text,
  ADD COLUMN IF NOT EXISTS ig_reel_url text,
  ADD COLUMN IF NOT EXISTS ig_reel_caption text,
  ADD COLUMN IF NOT EXISTS tiktok_clip_url text,
  ADD COLUMN IF NOT EXISTS tiktok_clip_caption text,
  ADD COLUMN IF NOT EXISTS linkedin_clip_url text,
  ADD COLUMN IF NOT EXISTS linkedin_clip_caption text;
