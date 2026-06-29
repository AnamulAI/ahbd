
-- Revoke EXECUTE on SECURITY DEFINER functions from public/anon/authenticated.
-- has_role is called from RLS policies as the table owner context, so it does not
-- need direct EXECUTE grants to anon/authenticated. Trigger functions are invoked
-- by Postgres internally and also do not require role-level EXECUTE grants.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_bootstrap_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
