
-- Signature package (Home page Pricing Reveal Card)
CREATE TABLE public.signature_package_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  web_dev_label TEXT NOT NULL DEFAULT 'Web Development — Business Website',
  web_dev_price NUMERIC NOT NULL DEFAULT 2500,
  ai_integrator_label TEXT NOT NULL DEFAULT 'AI Integrator — API Integration',
  ai_integrator_price NUMERIC NOT NULL DEFAULT 1500,
  podcast_label TEXT NOT NULL DEFAULT 'AI Podcast — Business Authority (Setup + Month 1)',
  podcast_price NUMERIC NOT NULL DEFAULT 2499,
  bundle_price NUMERIC NOT NULL DEFAULT 4990,
  disclosure_text TEXT NOT NULL DEFAULT 'After month 1, Podcast Management continues at $1,500/mo to keep your show running — cancel anytime.',
  whats_included JSONB NOT NULL DEFAULT '[
    "A complete website or web app built for the business",
    "A custom AI agent integrated into the website, WhatsApp, or internal systems",
    "A fully launched podcast with Business Authority setup",
    "First month of podcast management included",
    "One point of contact for the entire build — no coordinating between vendors"
  ]'::jsonb,
  cta_label TEXT NOT NULL DEFAULT 'Start Your Brand Build',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.signature_package_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.signature_package_settings TO authenticated;
GRANT ALL ON public.signature_package_settings TO service_role;

ALTER TABLE public.signature_package_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view signature package settings"
  ON public.signature_package_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert signature package settings"
  ON public.signature_package_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update signature package settings"
  ON public.signature_package_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete signature package settings"
  ON public.signature_package_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_signature_package_updated_at
  BEFORE UPDATE ON public.signature_package_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.signature_package_settings DEFAULT VALUES;


-- Payment plan settings (Builder payment plan cards)
CREATE TABLE public.payment_plan_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installment_count INTEGER NOT NULL DEFAULT 3,
  pay_in_full_discount_percent NUMERIC NOT NULL DEFAULT 25,
  advance_percent NUMERIC NOT NULL DEFAULT 10,
  installments_label TEXT NOT NULL DEFAULT 'Installments',
  pay_in_full_label TEXT NOT NULL DEFAULT 'Pay in Full',
  milestone_label TEXT NOT NULL DEFAULT 'Milestone-Based',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_plan_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_plan_settings TO authenticated;
GRANT ALL ON public.payment_plan_settings TO service_role;

ALTER TABLE public.payment_plan_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payment plan settings"
  ON public.payment_plan_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert payment plan settings"
  ON public.payment_plan_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payment plan settings"
  ON public.payment_plan_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete payment plan settings"
  ON public.payment_plan_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_payment_plan_updated_at
  BEFORE UPDATE ON public.payment_plan_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_plan_settings DEFAULT VALUES;
