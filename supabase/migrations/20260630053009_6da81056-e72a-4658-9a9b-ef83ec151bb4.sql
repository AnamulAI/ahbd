
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'active' AND unsubscribed_at IS NULL);

CREATE POLICY "Public read content-images" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'content-images');
CREATE POLICY "Admins insert content-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update content-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete content-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'::app_role));
