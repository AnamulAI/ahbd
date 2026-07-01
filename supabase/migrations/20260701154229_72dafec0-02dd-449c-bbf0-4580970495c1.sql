
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS challenge text,
  ADD COLUMN IF NOT EXISTS solution text,
  ADD COLUMN IF NOT EXISTS process_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS result_stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS testimonial_quote text,
  ADD COLUMN IF NOT EXISTS testimonial_name text,
  ADD COLUMN IF NOT EXISTS testimonial_title text;
