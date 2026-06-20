
-- 1. Remove anon storage policies on blog-images
DROP POLICY IF EXISTS "allow_all_blog_images bjsgsj_0" ON storage.objects;
DROP POLICY IF EXISTS "allow_all_blog_images bjsgsj_1" ON storage.objects;
DROP POLICY IF EXISTS "allow_all_blog_images bjsgsj_2" ON storage.objects;
DROP POLICY IF EXISTS "allow_all_blog_images bjsgsj_3" ON storage.objects;

-- 2. Remove anon storage policies on media-library
DROP POLICY IF EXISTS "allow_anon_upload u6aaxe_0" ON storage.objects;
DROP POLICY IF EXISTS "allow_anon_upload u6aaxe_1" ON storage.objects;
DROP POLICY IF EXISTS "allow_anon_upload u6aaxe_2" ON storage.objects;
DROP POLICY IF EXISTS "allow_anon_upload u6aaxe_3" ON storage.objects;

-- Restore public read for blog-images (needed since bucket is public for display)
-- The "Public can read blog images" policy already exists, so anon read still works.

-- 3. Restrict blog-images write policies to admins
DROP POLICY IF EXISTS "Authenticated can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete blog images" ON storage.objects;

CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

-- 4. Restrict public access to client_demo_pages sensitive columns
DROP POLICY IF EXISTS "Published client demo pages are viewable by everyone" ON public.client_demo_pages;

-- Create a sanitized public view that excludes sensitive sales/CRM fields.
CREATE OR REPLACE VIEW public.client_demo_pages_public
WITH (security_invoker = true) AS
SELECT
  id, slug, client_name, brand_name, page_title, subtitle,
  personalized_intro, why_fits_brand, episode_title, episode_summary,
  podcast_category, transcript_highlights, closing_note,
  audio_url, cover_image, video_url, preview_mode,
  whatsapp_link, book_call_link,
  cta_button_text, secondary_cta_text,
  features, website_url,
  is_published, created_at, updated_at
FROM public.client_demo_pages
WHERE is_published = true;

GRANT SELECT ON public.client_demo_pages_public TO anon, authenticated;
