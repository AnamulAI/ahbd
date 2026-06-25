
-- 1. builder_categories
CREATE TABLE public.builder_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  is_required boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.builder_categories TO anon, authenticated;
GRANT ALL ON public.builder_categories TO service_role;
ALTER TABLE public.builder_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read builder_categories" ON public.builder_categories FOR SELECT TO anon, authenticated USING (true);

-- 2. builder_tech_approaches
CREATE TABLE public.builder_tech_approaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.builder_tech_approaches TO anon, authenticated;
GRANT ALL ON public.builder_tech_approaches TO service_role;
ALTER TABLE public.builder_tech_approaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read builder_tech_approaches" ON public.builder_tech_approaches FOR SELECT TO anon, authenticated USING (true);

-- 3. builder_use_cases
CREATE TABLE public.builder_use_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.builder_use_cases TO anon, authenticated;
GRANT ALL ON public.builder_use_cases TO service_role;
ALTER TABLE public.builder_use_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read builder_use_cases" ON public.builder_use_cases FOR SELECT TO anon, authenticated USING (true);

-- 4. builder_use_case_pricing
CREATE TABLE public.builder_use_case_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id uuid NOT NULL REFERENCES public.builder_use_cases(id) ON DELETE CASCADE,
  tech_approach_id uuid NOT NULL REFERENCES public.builder_tech_approaches(id) ON DELETE CASCADE,
  base_price numeric NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (use_case_id, tech_approach_id)
);
GRANT SELECT ON public.builder_use_case_pricing TO anon, authenticated;
GRANT ALL ON public.builder_use_case_pricing TO service_role;
ALTER TABLE public.builder_use_case_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read builder_use_case_pricing" ON public.builder_use_case_pricing FOR SELECT TO anon, authenticated USING (true);

-- 5. builder_tiers
CREATE TABLE public.builder_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id uuid NOT NULL REFERENCES public.builder_use_cases(id) ON DELETE CASCADE,
  label text NOT NULL,
  price_delta numeric NOT NULL DEFAULT 0,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.builder_tiers TO anon, authenticated;
GRANT ALL ON public.builder_tiers TO service_role;
ALTER TABLE public.builder_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read builder_tiers" ON public.builder_tiers FOR SELECT TO anon, authenticated USING (true);

-- 6. builder_options
CREATE TABLE public.builder_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key text NOT NULL,
  option_group text NOT NULL,
  label text NOT NULL,
  price_delta numeric NOT NULL DEFAULT 0,
  input_type text NOT NULL DEFAULT 'select',
  is_default boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.builder_options TO anon, authenticated;
GRANT ALL ON public.builder_options TO service_role;
ALTER TABLE public.builder_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read builder_options" ON public.builder_options FOR SELECT TO anon, authenticated USING (true);

-- 7a. builder_ai_types
CREATE TABLE public.builder_ai_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  base_price numeric NOT NULL DEFAULT 0,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.builder_ai_types TO anon, authenticated;
GRANT ALL ON public.builder_ai_types TO service_role;
ALTER TABLE public.builder_ai_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read builder_ai_types" ON public.builder_ai_types FOR SELECT TO anon, authenticated USING (true);

-- 7b. builder_podcast_types
CREATE TABLE public.builder_podcast_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  base_price numeric NOT NULL DEFAULT 0,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.builder_podcast_types TO anon, authenticated;
GRANT ALL ON public.builder_podcast_types TO service_role;
ALTER TABLE public.builder_podcast_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read builder_podcast_types" ON public.builder_podcast_types FOR SELECT TO anon, authenticated USING (true);

-- 8. builder_leads
CREATE TABLE public.builder_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  starting_point text,
  idea_description text,
  name text,
  email text,
  whatsapp text,
  selected_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_price numeric,
  chosen_payment_plan text,
  status text NOT NULL DEFAULT 'new'
);
GRANT INSERT ON public.builder_leads TO anon, authenticated;
GRANT ALL ON public.builder_leads TO service_role;
ALTER TABLE public.builder_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a builder lead" ON public.builder_leads FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =========================
-- SEED DATA
-- =========================

INSERT INTO public.builder_categories (key, label, is_required, display_order) VALUES
  ('website', 'Website', true, 1),
  ('ai_agent', 'AI Agent', false, 2),
  ('podcast', 'Podcast', false, 3);

INSERT INTO public.builder_tech_approaches (key, label, description, display_order) VALUES
  ('custom', 'Custom Build — Lovable, Supabase, Vercel', 'Modern, fast, fully bespoke build using Lovable + Supabase + Vercel.', 1),
  ('wordpress', 'WordPress', 'Familiar CMS with themes & plugins. Faster to launch, easier for non-tech editors.', 2);

INSERT INTO public.builder_use_cases (key, label, display_order) VALUES
  ('business_website', 'Business Website', 1),
  ('landing_page', 'Landing Page', 2),
  ('ecommerce', 'eCommerce Store', 3),
  ('lms', 'LMS / Course Platform', 4),
  ('web_app', 'Web App / Dashboard', 5);

-- Use case pricing (Custom ~30-50% higher than WordPress).
-- Note: web_app under wordpress seeded with is_available = false (WP not suited for complex web apps); admin can re-enable.
INSERT INTO public.builder_use_case_pricing (use_case_id, tech_approach_id, base_price, is_available)
SELECT uc.id, ta.id,
  CASE
    WHEN uc.key = 'business_website' AND ta.key = 'custom' THEN 1800
    WHEN uc.key = 'business_website' AND ta.key = 'wordpress' THEN 1200
    WHEN uc.key = 'landing_page' AND ta.key = 'custom' THEN 900
    WHEN uc.key = 'landing_page' AND ta.key = 'wordpress' THEN 600
    WHEN uc.key = 'ecommerce' AND ta.key = 'custom' THEN 3500
    WHEN uc.key = 'ecommerce' AND ta.key = 'wordpress' THEN 2400
    WHEN uc.key = 'lms' AND ta.key = 'custom' THEN 4000
    WHEN uc.key = 'lms' AND ta.key = 'wordpress' THEN 2800
    WHEN uc.key = 'web_app' AND ta.key = 'custom' THEN 5500
    WHEN uc.key = 'web_app' AND ta.key = 'wordpress' THEN 3800
  END,
  CASE WHEN uc.key = 'web_app' AND ta.key = 'wordpress' THEN false ELSE true END
FROM public.builder_use_cases uc CROSS JOIN public.builder_tech_approaches ta;

-- Tiers per use case
INSERT INTO public.builder_tiers (use_case_id, label, price_delta, display_order)
SELECT id, 'Up to 5 pages', 0, 1 FROM public.builder_use_cases WHERE key='business_website'
UNION ALL SELECT id, '6-10 pages', 500, 2 FROM public.builder_use_cases WHERE key='business_website'
UNION ALL SELECT id, '10+ pages', 1000, 3 FROM public.builder_use_cases WHERE key='business_website'
UNION ALL SELECT id, '1 section', 0, 1 FROM public.builder_use_cases WHERE key='landing_page'
UNION ALL SELECT id, '2-4 sections', 250, 2 FROM public.builder_use_cases WHERE key='landing_page'
UNION ALL SELECT id, '5+ sections', 500, 3 FROM public.builder_use_cases WHERE key='landing_page'
UNION ALL SELECT id, 'Up to 25 products', 0, 1 FROM public.builder_use_cases WHERE key='ecommerce'
UNION ALL SELECT id, '26-100 products', 700, 2 FROM public.builder_use_cases WHERE key='ecommerce'
UNION ALL SELECT id, '100+ products', 1500, 3 FROM public.builder_use_cases WHERE key='ecommerce'
UNION ALL SELECT id, 'Up to 3 courses', 0, 1 FROM public.builder_use_cases WHERE key='lms'
UNION ALL SELECT id, '4-10 courses', 800, 2 FROM public.builder_use_cases WHERE key='lms'
UNION ALL SELECT id, '10+ courses', 1800, 3 FROM public.builder_use_cases WHERE key='lms'
UNION ALL SELECT id, 'Up to 3 modules', 0, 1 FROM public.builder_use_cases WHERE key='web_app'
UNION ALL SELECT id, '4-7 modules', 1200, 2 FROM public.builder_use_cases WHERE key='web_app'
UNION ALL SELECT id, '8+ modules', 2500, 3 FROM public.builder_use_cases WHERE key='web_app';

-- Options (website)
INSERT INTO public.builder_options (category_key, option_group, label, price_delta, input_type, is_default, display_order) VALUES
  ('website','design','Standard template',0,'select',true,1),
  ('website','design','Custom design',600,'select',false,2),
  ('website','cms','Static (no editing)',0,'select',true,1),
  ('website','cms','Editable CMS',400,'select',false,2),
  ('website','language','English only',0,'select',true,1),
  ('website','language','Bilingual (EN + 1)',300,'select',false,2),
  ('website','hosting','I have my own hosting',0,'select',true,1),
  ('website','hosting','Set up hosting for me',200,'select',false,2),
-- AI Agent options
  ('ai_agent','ai_where','Website (included)',0,'checkbox',true,1),
  ('ai_agent','ai_where','WhatsApp',400,'checkbox',false,2),
  ('ai_agent','ai_where','Internal tools / CRM',700,'checkbox',false,3),
  ('ai_agent','ai_language','English only',0,'select',true,1),
  ('ai_agent','ai_language','Bilingual',250,'select',false,2),
  ('ai_agent','ai_language','Multilingual (3+)',600,'select',false,3),
  ('ai_agent','ai_volume','Low (<500 msgs/mo)',0,'select',true,1),
  ('ai_agent','ai_volume','Medium (500-5k msgs/mo)',300,'select',false,2),
  ('ai_agent','ai_volume','High (5k+ msgs/mo)',800,'select',false,3),
  ('ai_agent','ai_knowledge','Website content only',0,'select',true,1),
  ('ai_agent','ai_knowledge','Docs + FAQ upload',250,'select',false,2),
  ('ai_agent','ai_knowledge','Connected data source / API',600,'select',false,3),
-- Podcast options
  ('podcast','podcast_frequency','Monthly',0,'select',true,1),
  ('podcast','podcast_frequency','Bi-weekly',300,'select',false,2),
  ('podcast','podcast_frequency','Weekly',700,'select',false,3),
  ('podcast','podcast_length','Short (5-10 min)',0,'select',true,1),
  ('podcast','podcast_length','Standard (15-25 min)',200,'select',false,2),
  ('podcast','podcast_length','Long (30-45 min)',450,'select',false,3),
  ('podcast','podcast_platform','Spotify only',0,'select',true,1),
  ('podcast','podcast_platform','Spotify + Apple',200,'select',false,2),
  ('podcast','podcast_platform','All major platforms',400,'select',false,3),
  ('podcast','podcast_format','Audio only',0,'select',true,1),
  ('podcast','podcast_format','Audio + video',500,'select',false,2),
  ('podcast','podcast_addon','Short-form clips (IG/TikTok/LinkedIn)',350,'checkbox',false,1),
  ('podcast','podcast_addon','Show notes & transcripts',150,'checkbox',false,2),
  ('podcast','podcast_addon','Social media management',500,'checkbox',false,3);

INSERT INTO public.builder_ai_types (label, base_price, display_order) VALUES
  ('API Integration', 1500, 1),
  ('Custom GPT Assistant', 1200, 2),
  ('Copilot Agent', 2000, 3);

INSERT INTO public.builder_podcast_types (label, base_price, display_order) VALUES
  ('Business Authority', 2499, 1),
  ('Publishing & Management', 349, 2),
  ('Content-to-Podcast', 599, 3);
