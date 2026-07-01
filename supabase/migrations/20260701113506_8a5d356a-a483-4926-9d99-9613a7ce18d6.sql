
CREATE TABLE public.blog_sidebar_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  eyebrow_text TEXT NOT NULL DEFAULT '',
  heading TEXT NOT NULL DEFAULT '',
  body_text TEXT NOT NULL DEFAULT '',
  cta_label TEXT NOT NULL DEFAULT '',
  cta_url TEXT NOT NULL DEFAULT '',
  cta_style TEXT NOT NULL DEFAULT 'primary',
  input_type TEXT NOT NULL DEFAULT 'none',
  input_placeholder TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_on_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_sidebar_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_sidebar_cards TO authenticated;
GRANT ALL ON public.blog_sidebar_cards TO service_role;

ALTER TABLE public.blog_sidebar_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sidebar cards"
  ON public.blog_sidebar_cards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all sidebar cards"
  ON public.blog_sidebar_cards FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert sidebar cards"
  ON public.blog_sidebar_cards FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sidebar cards"
  ON public.blog_sidebar_cards FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sidebar cards"
  ON public.blog_sidebar_cards FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_blog_sidebar_cards_updated_at
  BEFORE UPDATE ON public.blog_sidebar_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.blog_sidebar_cards
  (eyebrow_text, heading, body_text, cta_label, cta_url, cta_style, input_type, input_placeholder, display_order, is_active, show_on_categories)
VALUES
  ('// NEWSLETTER',
   'Want This Newsletter Automatically?',
   'Get articles like this sent to your inbox — no spam, unsubscribe anytime.',
   'Subscribe',
   '',
   'primary',
   'email',
   'you@email.com',
   0,
   true,
   '[]'::jsonb);
