CREATE POLICY "Public can read sample audio" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'sample-audio');
CREATE POLICY "Service role can manage sample audio" ON storage.objects FOR ALL TO service_role USING (bucket_id = 'sample-audio');

CREATE POLICY "Public can read sample video" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'sample-video');
CREATE POLICY "Service role can manage sample video" ON storage.objects FOR ALL TO service_role USING (bucket_id = 'sample-video');

CREATE POLICY "Public can read sample clips" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'sample-clips');
CREATE POLICY "Service role can manage sample clips" ON storage.objects FOR ALL TO service_role USING (bucket_id = 'sample-clips');