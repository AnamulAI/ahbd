-- Media Manager module: grant default access to the new "media_manager"
-- permission section for every existing admin user profile (mirrors the
-- default-access seeding pattern used when the permission system itself
-- was introduced).
INSERT INTO public.user_permissions (user_id, section_key, has_access)
SELECT id, 'media_manager', true FROM public.user_profiles
ON CONFLICT (user_id, section_key) DO UPDATE SET has_access = true;
