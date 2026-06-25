UPDATE public.builder_promo_cards
SET eyebrow_text = '// RECOMMENDED HOSTING'
WHERE eyebrow_text ILIKE '%RECOMMEND%HOSTING%';

UPDATE public.builder_promo_cards
SET eyebrow_text = '// RECOMMENDED HOSTING'
WHERE brand_name = 'Hostinger';