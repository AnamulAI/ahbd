
CREATE TABLE public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  visitor_id text NOT NULL,
  path text NOT NULL,
  country text,
  city text,
  device_type text,
  browser text,
  os text,
  ip_truncated text,
  referrer_raw text,
  referrer_category text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  is_new_visitor boolean NOT NULL DEFAULT false,
  is_admin boolean NOT NULL DEFAULT false,
  is_bot boolean NOT NULL DEFAULT false,
  time_on_page_seconds integer,
  visited_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_visits_visited_at ON public.page_visits (visited_at DESC);
CREATE INDEX idx_page_visits_session_id ON public.page_visits (session_id);
CREATE INDEX idx_page_visits_visitor_id ON public.page_visits (visitor_id);
CREATE INDEX idx_page_visits_path ON public.page_visits (path);

GRANT INSERT ON public.page_visits TO anon, authenticated;
GRANT UPDATE (time_on_page_seconds) ON public.page_visits TO anon, authenticated;
GRANT SELECT ON public.page_visits TO authenticated;
GRANT ALL ON public.page_visits TO service_role;

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visits"
  ON public.page_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update time on page"
  ON public.page_visits FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins with analytics access can read visits"
  ON public.page_visits FOR SELECT
  TO authenticated
  USING (public.has_section_access(auth.uid(), 'analytics'));


CREATE TABLE public.conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversion_events_session_id ON public.conversion_events (session_id);
CREATE INDEX idx_conversion_events_created_at ON public.conversion_events (created_at DESC);
CREATE INDEX idx_conversion_events_event_type ON public.conversion_events (event_type);

GRANT INSERT ON public.conversion_events TO anon, authenticated;
GRANT SELECT ON public.conversion_events TO authenticated;
GRANT ALL ON public.conversion_events TO service_role;

ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert conversions"
  ON public.conversion_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins with analytics access can read conversions"
  ON public.conversion_events FOR SELECT
  TO authenticated
  USING (public.has_section_access(auth.uid(), 'analytics'));
