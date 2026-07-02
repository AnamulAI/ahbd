ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS problem text,
  ADD COLUMN IF NOT EXISTS integration_map jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS trigger_text text,
  ADD COLUMN IF NOT EXISTS action_text text,
  ADD COLUMN IF NOT EXISTS output_text text;