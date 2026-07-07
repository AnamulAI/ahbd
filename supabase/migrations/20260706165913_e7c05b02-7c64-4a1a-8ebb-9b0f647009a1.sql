-- Visibility Control module: grant default access to the new
-- "visibility_control" permission section for every existing admin user
-- profile (mirrors the same seeding pattern used for "media_manager").
INSERT INTO public.user_permissions (user_id, section_key, has_access)
SELECT id, 'visibility_control', true FROM public.user_profiles
ON CONFLICT (user_id, section_key) DO UPDATE SET has_access = true;
