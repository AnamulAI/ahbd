
-- Allow admins to fully manage all builder configuration tables from the admin panel.
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'builder_tech_approaches',
    'builder_use_cases',
    'builder_use_case_pricing',
    'builder_tiers',
    'builder_options',
    'builder_ai_types',
    'builder_podcast_types',
    'builder_promo_cards',
    'builder_categories'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins can insert %1$I" ON public.%1$I;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins can update %1$I" ON public.%1$I;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins can delete %1$I" ON public.%1$I;', t);
    EXECUTE format($p$CREATE POLICY "Admins can insert %1$I" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));$p$, t);
    EXECUTE format($p$CREATE POLICY "Admins can update %1$I" ON public.%1$I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));$p$, t);
    EXECUTE format($p$CREATE POLICY "Admins can delete %1$I" ON public.%1$I FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));$p$, t);
  END LOOP;
END $$;
