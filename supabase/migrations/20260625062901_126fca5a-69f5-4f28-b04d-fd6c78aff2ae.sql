
DROP POLICY IF EXISTS "Anyone can submit a builder lead" ON public.builder_leads;
CREATE POLICY "Anyone can submit a builder lead" ON public.builder_leads
FOR INSERT TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND length(name) BETWEEN 1 AND 200
  AND email IS NOT NULL AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (idea_description IS NULL OR length(idea_description) <= 5000)
  AND (whatsapp IS NULL OR length(whatsapp) <= 50)
);
