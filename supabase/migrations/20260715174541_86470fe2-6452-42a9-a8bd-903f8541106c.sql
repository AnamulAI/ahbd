
CREATE TABLE public.blog_categories (
  key text PRIMARY KEY,
  label text NOT NULL,
  color text NOT NULL DEFAULT '#64748B',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog categories"
  ON public.blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Blog admins can insert categories"
  ON public.blog_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_section_access(auth.uid(), 'blog_posts'));

CREATE POLICY "Blog admins can update categories"
  ON public.blog_categories FOR UPDATE
  TO authenticated
  USING (public.has_section_access(auth.uid(), 'blog_posts'))
  WITH CHECK (public.has_section_access(auth.uid(), 'blog_posts'));

CREATE POLICY "Blog admins can delete categories"
  ON public.blog_categories FOR DELETE
  TO authenticated
  USING (public.has_section_access(auth.uid(), 'blog_posts'));

CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.blog_categories (key, label, color, sort_order) VALUES
  ('web_development', 'Web Development', '#3B82F6', 10),
  ('ai_integrator', 'AI Integrator', '#F97316', 20),
  ('ai_podcast', 'AI Podcast', '#22C55E', 30)
ON CONFLICT (key) DO NOTHING;
