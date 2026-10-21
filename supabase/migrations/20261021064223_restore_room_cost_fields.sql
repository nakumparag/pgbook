-- The owner wizard and PG detail page both read these cost fields. Existing
-- listings remain unknown (NULL) until their owners provide the amounts.
alter table public.rooms
  add column if not exists electricity_charges integer,
  add column if not exists maintenance_charges integer,
  add column if not exists other_charges integer;

notify pgrst, 'reload schema';
