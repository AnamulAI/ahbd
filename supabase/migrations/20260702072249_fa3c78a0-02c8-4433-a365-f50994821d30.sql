
CREATE POLICY "Admins can upload podcast media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'podcast-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update podcast media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'podcast-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete podcast media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'podcast-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read podcast media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'podcast-media' AND public.has_role(auth.uid(), 'admin'));
