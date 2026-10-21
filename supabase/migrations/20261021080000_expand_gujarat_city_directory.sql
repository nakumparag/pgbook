-- Expand supported Gujarat locations without creating demo PG listings.
insert into public.cities (name, slug, state, is_active)
values
  ('Navsari', 'navsari', 'Gujarat', true),
  ('Valsad', 'valsad', 'Gujarat', true),
  ('Porbandar', 'porbandar', 'Gujarat', true),
  ('Bhuj', 'bhuj', 'Gujarat', true),
  ('Amreli', 'amreli', 'Gujarat', true),
  ('Palanpur', 'palanpur', 'Gujarat', true),
  ('Godhra', 'godhra', 'Gujarat', true),
  ('Surendranagar', 'surendranagar', 'Gujarat', true),
  ('Gondal', 'gondal', 'Gujarat', true)
on conflict (slug) do update set is_active = true;

-- Let owners choose a real city while they add its actual address.
insert into public.localities (city_id, name, slug)
select c.id, 'Other areas', 'other-areas'
from public.cities c
where c.state = 'Gujarat' and c.is_active = true
  and not exists (select 1 from public.localities l where l.city_id = c.id)
on conflict (city_id, slug) do nothing;
