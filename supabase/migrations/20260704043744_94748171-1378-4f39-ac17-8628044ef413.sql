
-- 1. Seed site_base_url setting
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('site_base_url', 'https://ahbd.lovable.app')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. Update default llms_txt_content to token-based (only if it still contains the hardcoded domain)
UPDATE public.site_settings
SET setting_value = regexp_replace(setting_value, 'https://ahbd\.lovable\.app', '{{SITE_URL}}', 'g')
WHERE setting_key = 'llms_txt_content'
  AND setting_value LIKE '%ahbd.lovable.app%';

-- 3. newsletter_webhooks
CREATE TABLE public.newsletter_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT '',
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_webhooks TO authenticated;
GRANT ALL ON public.newsletter_webhooks TO service_role;
ALTER TABLE public.newsletter_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage newsletter_webhooks"
  ON public.newsletter_webhooks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_newsletter_webhooks_updated_at
  BEFORE UPDATE ON public.newsletter_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing single webhook (if set) into first entry
INSERT INTO public.newsletter_webhooks (label, url)
SELECT 'Legacy Webhook', trim(setting_value)
FROM public.site_settings
WHERE setting_key = 'newsletter_webhook_url'
  AND setting_value IS NOT NULL
  AND trim(setting_value) <> '';

-- 4. ai_provider_keys
CREATE TABLE public.ai_provider_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  custom_provider_name text,
  api_key text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_provider_keys TO authenticated;
GRANT ALL ON public.ai_provider_keys TO service_role;
ALTER TABLE public.ai_provider_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ai_provider_keys"
  ON public.ai_provider_keys FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_ai_provider_keys_updated_at
  BEFORE UPDATE ON public.ai_provider_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. whatsapp_accounts
CREATE TABLE public.whatsapp_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT '',
  access_token text NOT NULL,
  phone_number_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_accounts TO authenticated;
GRANT ALL ON public.whatsapp_accounts TO service_role;
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage whatsapp_accounts"
  ON public.whatsapp_accounts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_whatsapp_accounts_updated_at
  BEFORE UPDATE ON public.whatsapp_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. telegram_bots
CREATE TABLE public.telegram_bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT '',
  bot_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_bots TO authenticated;
GRANT ALL ON public.telegram_bots TO service_role;
ALTER TABLE public.telegram_bots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage telegram_bots"
  ON public.telegram_bots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_telegram_bots_updated_at
  BEFORE UPDATE ON public.telegram_bots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
