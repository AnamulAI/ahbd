
CREATE TABLE public.builder_copy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  group_key text NOT NULL DEFAULT 'general',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.builder_copy TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_copy TO authenticated;
GRANT ALL ON public.builder_copy TO service_role;

ALTER TABLE public.builder_copy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "builder_copy public read"
  ON public.builder_copy FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "builder_copy admin insert"
  ON public.builder_copy FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "builder_copy admin update"
  ON public.builder_copy FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "builder_copy admin delete"
  ON public.builder_copy FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_builder_copy_updated_at
  BEFORE UPDATE ON public.builder_copy
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.builder_copy (key, value, label, group_key, display_order) VALUES
  ('divider_text', '— or build your own —', 'Divider text between Signature Package and custom builder', 'general', 10),

  ('step1_title', 'Your starting point', 'Step 1 — heading', 'step1', 10),
  ('step1_dropdown_label', 'Where are you starting from?', 'Step 1 — dropdown label', 'step1', 20),
  ('step1_textarea_label', 'Tell me a bit more', 'Step 1 — textarea label', 'step1', 30),
  ('step1_textarea_placeholder', 'Tell me briefly about your idea or business...', 'Step 1 — textarea placeholder', 'step1', 40),
  ('step1_helper_text', 'Saved with your lead — doesn''t affect price.', 'Step 1 — helper text under textarea', 'step1', 50),

  ('step2_title', 'Website (required)', 'Step 2 — heading', 'step2', 10),
  ('step2_tech_approach_label', 'Tech approach', 'Step 2 — Tech Approach field label', 'step2', 20),
  ('step2_use_case_label', 'Use case', 'Step 2 — Use Case field label', 'step2', 30),

  ('step3_title', 'AI Agent (optional)', 'Step 3 — heading', 'step3', 10),
  ('step3_toggle_label', 'Add AI Agent', 'Step 3 — toggle label', 'step3', 20),

  ('step4_title', 'Podcast (optional)', 'Step 4 — heading', 'step4', 10),
  ('step4_toggle_label', 'Add a podcast', 'Step 4 — toggle label', 'step4', 20),

  ('live_quote_eyebrow', '// LIVE QUOTE', 'Live Quote — eyebrow', 'live_quote', 10),
  ('live_quote_heading', 'Your custom build', 'Live Quote — heading', 'live_quote', 20),
  ('live_quote_empty_state', 'Make selections to see your price build up live.', 'Live Quote — empty state', 'live_quote', 30),
  ('live_quote_total_label', 'TOTAL', 'Live Quote — TOTAL label', 'live_quote', 40),
  ('live_quote_advance_label', '10% advance to secure the order', 'Live Quote — advance label', 'live_quote', 50),
  ('live_quote_payment_note', 'Payment options shown after your build is complete.', 'Live Quote — payment note callout', 'live_quote', 60),
  ('whatsapp_button_label', 'Get Instant Reply on WhatsApp', 'Live Quote — WhatsApp button label', 'live_quote', 70),
  ('whatsapp_prefilled_message', 'Hi! I have a quick question about my custom build on the DFY Package Builder.', 'WhatsApp — prefilled message', 'live_quote', 80),

  ('payment_section_heading', 'How would you like to pay?', 'Payment cards — section heading', 'payment_cards', 10),
  ('see_payment_button_label', 'See Payment Options', 'Button — reveals payment cards', 'payment_cards', 20),
  ('confirm_build_button_label', 'Confirm My Build', 'Button — submits lead', 'payment_cards', 30),

  ('contact_form_heading', 'Your contact details', 'Contact form — heading', 'contact_form', 10),
  ('contact_name_label', 'Name', 'Contact form — Name label', 'contact_form', 20),
  ('contact_email_label', 'Email', 'Contact form — Email label', 'contact_form', 30),
  ('contact_whatsapp_label', 'WhatsApp', 'Contact form — WhatsApp label', 'contact_form', 40),
  ('confirmation_message', 'Thanks! I''ve received your build details and will reach out on WhatsApp within 24 hours to confirm everything.', 'Contact form — confirmation message after submit', 'contact_form', 50),

  ('builder_faq_heading', 'Quick questions about this builder', 'Builder FAQ — heading', 'faq', 10),
  ('faq_1_question', 'What if I already have a domain or hosting?', 'FAQ 1 — question', 'faq', 20),
  ('faq_1_answer', 'Just select ''I have my own hosting'' in Step 2 — no extra charge. If you don''t have one yet, I can set it up for a small fee, or you can grab a discount through my Hostinger link.', 'FAQ 1 — answer', 'faq', 30),
  ('faq_2_question', 'Do I have to add AI Agent or Podcast?', 'FAQ 2 — question', 'faq', 40),
  ('faq_2_answer', 'No — only the website is required. AI Agent and Podcast are optional add-ons you can include now or discuss separately later.', 'FAQ 2 — answer', 'faq', 50),
  ('faq_3_question', 'How does the 10% advance work?', 'FAQ 3 — question', 'faq', 60),
  ('faq_3_answer', 'A 10% advance secures your spot in the project queue once you confirm your build. The remaining balance follows whichever payment plan you choose.', 'FAQ 3 — answer', 'faq', 70),
  ('faq_4_question', 'Can I change my selections after submitting?', 'FAQ 4 — question', 'faq', 80),
  ('faq_4_answer', 'Yes — this is just a starting quote. We''ll review everything together over a quick call or WhatsApp before anything is finalized.', 'FAQ 4 — answer', 'faq', 90),
  ('faq_5_question', 'Where can I read the full terms?', 'FAQ 5 — question', 'faq', 100),
  ('faq_5_answer', 'See our full Terms of Service at /terms.', 'FAQ 5 — answer', 'faq', 110);
