
CREATE TABLE public.builder_promo_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,
  brand_color TEXT NOT NULL,
  eyebrow_text TEXT NOT NULL DEFAULT '// RECOMMENDED',
  heading_prefix TEXT NOT NULL DEFAULT 'We Recommend',
  description TEXT NOT NULL,
  cta_label TEXT NOT NULL,
  cta_url TEXT NOT NULL DEFAULT '#',
  feature_pills JSONB NOT NULL DEFAULT '[]'::jsonb,
  visibility_condition TEXT NOT NULL DEFAULT 'always',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.builder_promo_cards TO anon;
GRANT SELECT ON public.builder_promo_cards TO authenticated;
GRANT ALL ON public.builder_promo_cards TO service_role;

ALTER TABLE public.builder_promo_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active promo cards"
  ON public.builder_promo_cards FOR SELECT
  USING (is_active = true);

CREATE TRIGGER update_builder_promo_cards_updated_at
  BEFORE UPDATE ON public.builder_promo_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.builder_promo_cards
  (brand_name, brand_color, eyebrow_text, heading_prefix, description, cta_label, cta_url, feature_pills, visibility_condition, display_order)
VALUES
  (
    'Hostinger',
    '#673DE6',
    '// RECOMMENDED HOSTING',
    'We Recommend',
    'Get an extra discount through this link — more than what''s available on the website directly. (affiliate link)',
    'Get Extra 20% Discount →',
    '#',
    '[
      {"label":"Free Domain","icon_name":"Globe"},
      {"label":"Free SSL","icon_name":"Shield"},
      {"label":"99.9% Uptime","icon_name":"Zap"},
      {"label":"LiteSpeed","icon_name":"Server"}
    ]'::jsonb,
    'hosting_self_managed',
    10
  ),
  (
    'Vercel',
    '#FFFFFF',
    '// RECOMMENDED DEPLOYMENT',
    'We Recommend',
    'Deploy your custom build to a blazing-fast global edge network — free tier available. (affiliate link)',
    'Get Vercel →',
    '#',
    '[
      {"label":"Instant Deploys","icon_name":"Rocket"},
      {"label":"Global CDN","icon_name":"Globe2"},
      {"label":"Auto SSL","icon_name":"Lock"},
      {"label":"Zero Config","icon_name":"Wand2"}
    ]'::jsonb,
    'tech_approach_custom',
    20
  );
