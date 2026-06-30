CREATE POLICY "Admins can read all builder_promo_cards"
ON public.builder_promo_cards
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));