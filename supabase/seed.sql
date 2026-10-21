-- PGBook master data needed by search and owner onboarding.
-- Safe to rerun: existing cities, localities, and amenities are left unchanged.

INSERT INTO public.cities (name, slug, is_active)
VALUES
  ('Ahmedabad', 'ahmedabad', true),
  ('Gandhinagar', 'gandhinagar', true),
  ('Surat', 'surat', true),
  ('Vadodara', 'vadodara', true),
  ('Rajkot', 'rajkot', true),
  ('Bhavnagar', 'bhavnagar', true),
  ('Jamnagar', 'jamnagar', true),
  ('Junagadh', 'junagadh', true),
  ('Anand', 'anand', true),
  ('Bharuch', 'bharuch', true),
  ('Vapi', 'vapi', true),
  ('Mehsana', 'mehsana', true),
  ('Morbi', 'morbi', true),
  ('Nadiad', 'nadiad', true),
  ('Navsari', 'navsari', true),
  ('Valsad', 'valsad', true),
  ('Porbandar', 'porbandar', true),
  ('Bhuj', 'bhuj', true),
  ('Amreli', 'amreli', true),
  ('Palanpur', 'palanpur', true),
  ('Godhra', 'godhra', true),
  ('Surendranagar', 'surendranagar', true),
  ('Gondal', 'gondal', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.localities (city_id, name, slug)
SELECT cities.id, seed.name, seed.slug
FROM (VALUES
  ('ahmedabad', 'Sola', 'sola'),
  ('ahmedabad', 'Satellite', 'satellite'),
  ('ahmedabad', 'Navrangpura', 'navrangpura'),
  ('ahmedabad', 'Vastrapur', 'vastrapur'),
  ('ahmedabad', 'Prahlad Nagar', 'prahlad-nagar'),
  ('gandhinagar', 'Infocity', 'infocity'),
  ('gandhinagar', 'Kudasan', 'kudasan'),
  ('surat', 'Adajan', 'adajan'),
  ('surat', 'Vesu', 'vesu'),
  ('vadodara', 'Alkapuri', 'alkapuri'),
  ('vadodara', 'Sayajigunj', 'sayajigunj'),
  ('rajkot', 'Kalawad Road', 'kalawad-road')
) AS seed(city_slug, name, slug)
JOIN public.cities AS cities ON cities.slug = seed.city_slug
ON CONFLICT (city_id, slug) DO NOTHING;

INSERT INTO public.amenities (name, icon, category)
VALUES
  ('WiFi', 'wifi', 'Basic'),
  ('AC', 'snowflake', 'Comfort'),
  ('Parking', 'car', 'Facilities'),
  ('Laundry', 'washing-machine', 'Services'),
  ('CCTV', 'cctv', 'Security'),
  ('Security Guard', 'shield', 'Security'),
  ('RO Water', 'droplets', 'Basic'),
  ('Geyser', 'thermometer', 'Comfort'),
  ('Lift', 'arrow-up-down', 'Facilities'),
  ('Housekeeping', 'broom', 'Services'),
  ('Power Backup', 'battery-charging', 'Facilities'),
  ('Study Table', 'desk', 'Room'),
  ('Attached Bathroom', 'bath', 'Room'),
  ('Refrigerator', 'refrigerator', 'Facilities'),
  ('TV', 'tv', 'Entertainment'),
  ('Furnished', 'bed', 'Room'),
  ('Washing Machine', 'washing-machine', 'Services')
ON CONFLICT (name) DO NOTHING;
