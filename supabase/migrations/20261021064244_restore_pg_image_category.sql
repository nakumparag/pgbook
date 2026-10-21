-- Image categories are optional metadata; existing uploads remain uncategorized.
alter table public.pg_images
  add column if not exists category text;

notify pgrst, 'reload schema';
