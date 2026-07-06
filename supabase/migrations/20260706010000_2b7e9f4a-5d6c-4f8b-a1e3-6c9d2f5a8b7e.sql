-- Corrective fix: the header_nav "Services" row was deleted and recreated
-- during admin testing (via Delete + "+ Add Link"), which silently dropped
-- its link_key = 'services' marker. Without that marker, SiteHeader.tsx's
-- Services-link override stopped applying, and the live nav briefly pointed
-- at whatever literal href was typed into the admin form instead of the
-- Page Assignment target (services_page_route).
--
-- This restores the marker (matched by row id, discovered via direct
-- inspection at the time of the fix) and resyncs its href to whatever
-- services_page_route currently holds, looked up dynamically rather than
-- hardcoded. It also restores the other header_nav rows' display_order,
-- which had shifted by one when the row was recreated.
--
-- Delete protection for link_key-tagged rows (NavFooterSection.tsx) was
-- added at the same time so this failure mode can't recur.
DO $$
DECLARE
  current_services_route text;
BEGIN
  SELECT setting_value INTO current_services_route
  FROM public.site_settings WHERE setting_key = 'services_page_route';

  UPDATE public.site_nav_links
  SET link_key = 'services',
      display_order = 3,
      href = COALESCE(current_services_route, '/services/web-development')
  WHERE id = 'c67b02a9-aef8-44d0-96fb-5e852c390884';  -- the "Services" row at the time of the fix
END $$;

UPDATE public.site_nav_links SET display_order = 4 WHERE id = 'abceb31a-689a-4361-ab64-697a04331b76'; -- Projects
UPDATE public.site_nav_links SET display_order = 5 WHERE id = '819a0ac0-dfff-4182-8ba7-31ace91088c4'; -- Blog
UPDATE public.site_nav_links SET display_order = 6 WHERE id = '93c861c3-0732-4a46-9084-2857168f60b3'; -- Contact
