
-- Part 1: Page Assignment defaults
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('home_page_route', '/'),
  ('services_page_route', '/services/web-development')
ON CONFLICT (setting_key) DO NOTHING;

-- Part 2: user_profiles + user_permissions
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  role_label text NOT NULL DEFAULT 'Custom',
  is_primary_owner boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  has_access boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_permissions TO authenticated;
GRANT ALL ON public.user_permissions TO service_role;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION public.is_primary_owner(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = _user_id AND is_primary_owner = true
  ) OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = _user_id AND lower(email) = 'anamulhoque.dev@gmail.com'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_section_access(_user_id uuid, _section text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_primary_owner(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.user_permissions
      WHERE user_id = _user_id AND section_key = _section AND has_access = true
    );
$$;

-- Safeguard triggers
CREATE OR REPLACE FUNCTION public.protect_primary_owner_permissions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF public.is_primary_owner(OLD.user_id) THEN
      RAISE EXCEPTION 'Cannot delete permissions for the primary owner account';
    END IF;
    RETURN OLD;
  END IF;
  IF public.is_primary_owner(NEW.user_id) THEN
    NEW.has_access := true;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS user_permissions_protect_owner ON public.user_permissions;
CREATE TRIGGER user_permissions_protect_owner
BEFORE INSERT OR UPDATE OR DELETE ON public.user_permissions
FOR EACH ROW EXECUTE FUNCTION public.protect_primary_owner_permissions();

CREATE OR REPLACE FUNCTION public.protect_primary_owner_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_primary_owner OR public.is_primary_owner(OLD.id) THEN
      RAISE EXCEPTION 'Cannot delete the primary owner profile';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.is_primary_owner = true AND (NEW.is_primary_owner IS DISTINCT FROM true) THEN
    RAISE EXCEPTION 'Cannot remove is_primary_owner flag from the primary owner';
  END IF;
  IF NEW.is_primary_owner OR public.is_primary_owner(NEW.id) THEN
    NEW.role_label := 'Owner';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS user_profiles_protect_owner ON public.user_profiles;
CREATE TRIGGER user_profiles_protect_owner
BEFORE UPDATE OR DELETE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_primary_owner_profile();

DROP TRIGGER IF EXISTS user_profiles_updated ON public.user_profiles;
CREATE TRIGGER user_profiles_updated BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS user_permissions_updated ON public.user_permissions;
CREATE TRIGGER user_permissions_updated BEFORE UPDATE ON public.user_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies
DROP POLICY IF EXISTS "user_profiles self select" ON public.user_profiles;
CREATE POLICY "user_profiles self select" ON public.user_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "user_profiles self update" ON public.user_profiles;
CREATE POLICY "user_profiles self update" ON public.user_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_primary_owner(auth.uid()))
  WITH CHECK (id = auth.uid() OR public.is_primary_owner(auth.uid()));

DROP POLICY IF EXISTS "user_profiles owner insert" ON public.user_profiles;
CREATE POLICY "user_profiles owner insert" ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_primary_owner(auth.uid()));

DROP POLICY IF EXISTS "user_profiles owner delete" ON public.user_profiles;
CREATE POLICY "user_profiles owner delete" ON public.user_profiles FOR DELETE TO authenticated
  USING (public.is_primary_owner(auth.uid()) AND NOT is_primary_owner);

DROP POLICY IF EXISTS "user_permissions self select" ON public.user_permissions;
CREATE POLICY "user_permissions self select" ON public.user_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_primary_owner(auth.uid()));

DROP POLICY IF EXISTS "user_permissions owner write" ON public.user_permissions;
CREATE POLICY "user_permissions owner write" ON public.user_permissions FOR ALL TO authenticated
  USING (public.is_primary_owner(auth.uid())) WITH CHECK (public.is_primary_owner(auth.uid()));

-- Seed: bootstrap owner
DO $$
DECLARE
  owner_id uuid;
  section text;
  sections text[] := ARRAY['dashboard','leads','sample_builder','builder_settings','blog_posts','sidebar_cards','projects','newsletter','pages','seo_tracking','integrations','profile'];
BEGIN
  SELECT id INTO owner_id FROM auth.users WHERE lower(email) = 'anamulhoque.dev@gmail.com' LIMIT 1;
  IF owner_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, full_name, role_label, is_primary_owner)
    VALUES (owner_id, 'Anamul Hoque', 'Owner', true)
    ON CONFLICT (id) DO UPDATE SET is_primary_owner = true, role_label = 'Owner';
    FOREACH section IN ARRAY sections LOOP
      INSERT INTO public.user_permissions (user_id, section_key, has_access)
      VALUES (owner_id, section, true)
      ON CONFLICT (user_id, section_key) DO UPDATE SET has_access = true;
    END LOOP;
  END IF;
END $$;

-- Storage policies for profile-avatars (bucket already created via tool)
DROP POLICY IF EXISTS "profile-avatars public read" ON storage.objects;
CREATE POLICY "profile-avatars public read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "profile-avatars admin insert" ON storage.objects;
CREATE POLICY "profile-avatars admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-avatars' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profile-avatars admin update" ON storage.objects;
CREATE POLICY "profile-avatars admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-avatars' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'profile-avatars' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profile-avatars admin delete" ON storage.objects;
CREATE POLICY "profile-avatars admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-avatars' AND public.has_role(auth.uid(), 'admin'));
