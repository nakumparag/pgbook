-- Secure the inquiry workflow, add written review moderation, and stop exposing
-- account/contact data through public PostgREST queries. This migration is
-- additive for data: no existing user, listing, inquiry, review, or booking row
-- is deleted.

-- Profiles are private. Public reviewer names are stored as a snapshot on the
-- review row instead of joining profiles from an anonymous request.
drop policy if exists profiles_select_public on public.profiles;
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or public.is_admin());

-- The profile role check policy remains the source of truth for self updates.
-- Column grants also keep role and verification fields out of self-service
-- updates while allowing profile details and avatar changes.
revoke update on public.profiles from anon, authenticated;
revoke insert on public.profiles from anon, authenticated;
grant update (full_name, avatar_url, phone, updated_at)
  on public.profiles to authenticated;
grant insert (id, full_name, avatar_url, phone) on public.profiles to authenticated;

-- Remove direct public selection of owner contact numbers stored on listings.
alter table public.pgs
  add column if not exists available_from date,
  add column if not exists rules text[] not null default '{}';
alter table public.rooms alter column security_deposit drop not null;

-- Populate the Gujarat city directory used by the real search and owner form.
-- These are location master records only; no demo PG listings are created.
insert into public.cities (name, slug, state)
values
  ('Anand', 'anand', 'Gujarat'),
  ('Bhavnagar', 'bhavnagar', 'Gujarat'),
  ('Bharuch', 'bharuch', 'Gujarat'),
  ('Jamnagar', 'jamnagar', 'Gujarat'),
  ('Junagadh', 'junagadh', 'Gujarat'),
  ('Mehsana', 'mehsana', 'Gujarat'),
  ('Morbi', 'morbi', 'Gujarat'),
  ('Nadiad', 'nadiad', 'Gujarat'),
  ('Vapi', 'vapi', 'Gujarat')
on conflict (slug) do nothing;

with locality_seed (city_slug, name, slug) as (
  values
    ('anand', 'Vallabh Vidyanagar', 'vallabh-vidyanagar'),
    ('anand', 'Anand Town', 'anand-town'),
    ('bhavnagar', 'Kaliyabid', 'kaliyabid'),
    ('bhavnagar', 'Waghawadi Road', 'waghawadi-road'),
    ('bharuch', 'Zadeshwar', 'zadeshwar'),
    ('bharuch', 'Bholav', 'bholav'),
    ('jamnagar', 'Patel Colony', 'patel-colony'),
    ('jamnagar', 'Khambhalia Gate', 'khambhalia-gate'),
    ('junagadh', 'Zanzarda Road', 'zanzarda-road'),
    ('junagadh', 'Joshipura', 'joshipura'),
    ('mehsana', 'Radhanpur Road', 'radhanpur-road'),
    ('mehsana', 'Modhera Road', 'modhera-road'),
    ('morbi', 'Sanala Road', 'sanala-road'),
    ('morbi', 'Wankaner Road', 'wankaner-road'),
    ('nadiad', 'Pij Road', 'pij-road'),
    ('nadiad', 'College Road', 'college-road'),
    ('vapi', 'Chala', 'chala'),
    ('vapi', 'Vapi GIDC', 'vapi-gidc')
)
insert into public.localities (city_id, name, slug)
select c.id, s.name, s.slug
from locality_seed s join public.cities c on c.slug = s.city_slug
on conflict (city_id, slug) do nothing;

revoke select on public.pgs from anon, authenticated;
grant select (
  id, owner_id, city_id, locality_id, name, slug, description, address,
  lat, lng, gender, food_status, status, is_verified, verified_at, rating,
  review_count, created_at, updated_at, featured, published_at,
  monthly_rent_from, monthly_rent_to, available_from, rules
) on public.pgs to anon, authenticated;

-- Only listing fields are editable directly by owners. Status and moderation
-- fields are changed through checked RPCs below; ratings are maintained by a
-- database trigger.
revoke insert, update on public.pgs from anon, authenticated;
grant insert (
  owner_id, city_id, locality_id, name, slug, description, address, lat, lng,
  gender, food_status, status, monthly_rent_from, monthly_rent_to
) on public.pgs to authenticated;
grant update (
  city_id, locality_id, name, slug, description, address, lat, lng,
  gender, food_status, available_from, rules, monthly_rent_from, monthly_rent_to
) on public.pgs to authenticated;

drop policy if exists pgs_insert_owner on public.pgs;
create policy pgs_insert_owner on public.pgs
  for insert to authenticated
  with check ((select auth.uid()) = owner_id and status = 'DRAFT'::public.pg_status);

create or replace function public.owner_set_pg_status(target_pg_id uuid, target_status public.pg_status)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status public.pg_status;
  listing_owner uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select p.status, p.owner_id into current_status, listing_owner
  from public.pgs p where p.id = target_pg_id for update;
  if not found or listing_owner <> (select auth.uid()) then
    raise exception 'Listing not found or access denied';
  end if;

  if not (
    (current_status in ('DRAFT'::public.pg_status, 'REJECTED'::public.pg_status) and target_status = 'PENDING'::public.pg_status)
    or (current_status = 'APPROVED'::public.pg_status and target_status = 'SUSPENDED'::public.pg_status)
    or (current_status = 'SUSPENDED'::public.pg_status and target_status = 'APPROVED'::public.pg_status)
    or (target_status = 'ARCHIVED'::public.pg_status and current_status <> 'ARCHIVED'::public.pg_status)
  ) then
    raise exception 'Unsupported listing status change';
  end if;

  update public.pgs set status = target_status,
    published_at = case when target_status = 'APPROVED'::public.pg_status then coalesce(published_at, now()) else published_at end
  where id = target_pg_id;
  return true;
end;
$$;
revoke all on function public.owner_set_pg_status(uuid, public.pg_status) from public, anon;
grant execute on function public.owner_set_pg_status(uuid, public.pg_status) to authenticated;

create or replace function public.admin_set_pg_status(target_pg_id uuid, target_status public.pg_status)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;
  update public.pgs set status = target_status,
    published_at = case when target_status = 'APPROVED'::public.pg_status then coalesce(published_at, now()) else published_at end
  where id = target_pg_id;
  if not found then raise exception 'Listing not found'; end if;
  return true;
end;
$$;
revoke all on function public.admin_set_pg_status(uuid, public.pg_status) from public, anon;
grant execute on function public.admin_set_pg_status(uuid, public.pg_status) to authenticated;

create or replace function public.admin_set_pg_verified(target_pg_id uuid, verified boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;
  update public.pgs set is_verified = verified, verified_at = case when verified then now() else null end
  where id = target_pg_id;
  if not found then raise exception 'Listing not found'; end if;
  return true;
end;
$$;
revoke all on function public.admin_set_pg_verified(uuid, boolean) from public, anon;
grant execute on function public.admin_set_pg_verified(uuid, boolean) to authenticated;

-- Inquiry workflow: authenticated users submit a short in-app inquiry. The
-- trigger derives owner and contact identity from the selected PG and profile,
-- rather than trusting caller-supplied personal data or status fields.
alter table public.inquiries drop constraint if exists inquiries_status_check;
alter table public.inquiries add constraint inquiries_status_check
  check (status in ('NEW', 'CONTACTED', 'INTERESTED', 'CLOSED', 'CANCELLED'));
alter table public.inquiries drop constraint if exists inquiries_contact_type_check;
alter table public.inquiries add constraint inquiries_contact_type_check
  check (contact_type in ('CALLBACK', 'CALL', 'WHATSAPP', 'IN_APP'));
alter table public.inquiries alter column phone drop not null;

create unique index if not exists inquiries_one_open_per_user_pg
  on public.inquiries (user_id, pg_id)
  where user_id is not null and status not in ('CLOSED', 'CANCELLED');
create index if not exists inquiries_pg_created_idx on public.inquiries (pg_id, created_at desc);
create index if not exists inquiries_status_created_idx on public.inquiries (status, created_at desc);

drop policy if exists inquiries_insert_contact on public.inquiries;
drop policy if exists inquiries_select_owner_or_admin on public.inquiries;
drop policy if exists inquiries_select_user_own on public.inquiries;
drop policy if exists inquiries_update_owner on public.inquiries;
create policy inquiries_select_owner_or_admin on public.inquiries
  for select to authenticated
  using ((select auth.uid()) = owner_id or public.is_admin());
create policy inquiries_select_user_own on public.inquiries
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy inquiries_insert_authenticated on public.inquiries
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy inquiries_update_owner_or_admin on public.inquiries
  for update to authenticated
  using ((select auth.uid()) = owner_id or public.is_admin())
  with check ((select auth.uid()) = owner_id or public.is_admin());

revoke all on public.inquiries from anon, authenticated;
grant select on public.inquiries to authenticated;
grant insert (user_id, pg_id, message) on public.inquiries to authenticated;
grant update (status) on public.inquiries to authenticated;

create or replace function private.prepare_inquiry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_user uuid := (select auth.uid());
  owner_profile public.profiles%rowtype;
begin
  if request_user is null then raise exception 'Sign in to send an inquiry'; end if;
  if new.user_id is distinct from request_user then raise exception 'Invalid inquiry owner'; end if;

  select p.owner_id into new.owner_id
  from public.pgs p
  where p.id = new.pg_id and p.status = 'APPROVED'::public.pg_status;
  if new.owner_id is null then raise exception 'This PG is no longer available for inquiries'; end if;
  if new.owner_id = request_user then raise exception 'You cannot inquire about your own listing'; end if;

  select * into owner_profile from public.profiles where id = request_user;
  if owner_profile.phone is null or length(regexp_replace(owner_profile.phone, '\D', '', 'g')) < 10 then
    raise exception 'Add a valid phone number to your profile before sending an inquiry';
  end if;

  new.name := coalesce(nullif(btrim(owner_profile.full_name), ''), 'PGBook user');
  new.phone := owner_profile.phone;
  new.contact_type := 'IN_APP';
  new.preferred_time := null;
  new.status := 'NEW';
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.prepare_inquiry() from public, anon, authenticated;
drop trigger if exists prepare_inquiry_before_insert on public.inquiries;
create trigger prepare_inquiry_before_insert before insert on public.inquiries
  for each row execute function private.prepare_inquiry();

create or replace function private.guard_inquiry_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_user uuid := (select auth.uid());
begin
  if new.status is not distinct from old.status then return new; end if;
  if public.is_admin() then return new; end if;
  if request_user is distinct from old.owner_id then raise exception 'Only the listing owner can update this inquiry'; end if;

  if not (
    (old.status = 'NEW' and new.status in ('CONTACTED', 'INTERESTED', 'CLOSED'))
    or (old.status = 'CONTACTED' and new.status in ('INTERESTED', 'CLOSED'))
    or (old.status = 'INTERESTED' and new.status in ('CONTACTED', 'CLOSED'))
  ) then raise exception 'Unsupported inquiry status change'; end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.guard_inquiry_status() from public, anon, authenticated;
drop trigger if exists guard_inquiry_status_before_update on public.inquiries;
create trigger guard_inquiry_status_before_update before update on public.inquiries
  for each row execute function private.guard_inquiry_status();

-- Written reviews: one per user/PG, public only when published, reviewer name
-- snapshot, reports, and database-maintained public rating aggregates.
alter table public.reviews add column if not exists status text not null default 'PUBLISHED';
alter table public.reviews add column if not exists display_name text;
alter table public.reviews add column if not exists moderated_at timestamptz;
alter table public.reviews add column if not exists moderation_note text;
alter table public.reviews drop constraint if exists reviews_status_check;
alter table public.reviews add constraint reviews_status_check check (status in ('PUBLISHED', 'HIDDEN'));
alter table public.reviews drop constraint if exists reviews_content_length_check;
alter table public.reviews add constraint reviews_content_length_check
  check (content is null or char_length(btrim(content)) between 30 and 2000);
alter table public.reviews drop constraint if exists reviews_title_length_check;
alter table public.reviews add constraint reviews_title_length_check
  check (title is null or char_length(btrim(title)) <= 120);
create index if not exists reviews_public_pg_created_idx
  on public.reviews (pg_id, created_at desc) where status = 'PUBLISHED';

drop policy if exists reviews_select_public on public.reviews;
drop policy if exists reviews_insert_self on public.reviews;
drop policy if exists reviews_update_self on public.reviews;
drop policy if exists reviews_delete_self on public.reviews;
drop policy if exists reviews_all_admin on public.reviews;
create policy reviews_select_published_self_admin on public.reviews
  for select to anon, authenticated
  using (status = 'PUBLISHED' or (select auth.uid()) = user_id or public.is_admin());
create policy reviews_insert_self on public.reviews
  for insert to authenticated
  with check ((select auth.uid()) = user_id and exists (
    select 1 from public.pgs p where p.id = reviews.pg_id and p.status = 'APPROVED'::public.pg_status
  ));
create policy reviews_update_self on public.reviews
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy reviews_delete_self on public.reviews
  for delete to authenticated
  using ((select auth.uid()) = user_id);
create policy reviews_all_admin on public.reviews
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.reviews from anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant insert (user_id, pg_id, rating, title, content) on public.reviews to authenticated;
grant update (rating, title, content, updated_at) on public.reviews to authenticated;
grant delete on public.reviews to authenticated;

create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('SPAM', 'ABUSE', 'NOT_RELEVANT', 'OTHER')),
  details text check (details is null or char_length(btrim(details)) <= 1000),
  status text not null default 'OPEN' check (status in ('OPEN', 'REVIEWED', 'DISMISSED')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (review_id, reporter_id)
);
create index if not exists review_reports_status_created_idx
  on public.review_reports (status, created_at desc);
alter table public.review_reports enable row level security;
revoke all on public.review_reports from anon, authenticated;
grant select on public.review_reports to authenticated;
grant insert (review_id, reporter_id, reason, details) on public.review_reports to authenticated;
grant update (status, resolved_at) on public.review_reports to authenticated;
create policy review_reports_select_own_or_admin on public.review_reports
  for select to authenticated
  using ((select auth.uid()) = reporter_id or public.is_admin());
create policy review_reports_insert_self on public.review_reports
  for insert to authenticated
  with check ((select auth.uid()) = reporter_id);
create policy review_reports_update_admin on public.review_reports
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function private.prepare_review_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_user uuid := (select auth.uid());
  review_author uuid;
  review_status text;
begin
  if request_user is null or new.reporter_id is distinct from request_user then raise exception 'Sign in to report a review'; end if;
  select user_id, status into review_author, review_status from public.reviews where id = new.review_id;
  if not found or review_status <> 'PUBLISHED' or review_author = request_user then raise exception 'This review cannot be reported'; end if;
  new.status := 'OPEN';
  new.resolved_at := null;
  new.created_at := now();
  new.details := nullif(btrim(new.details), '');
  return new;
end;
$$;
revoke all on function private.prepare_review_report() from public, anon, authenticated;
drop trigger if exists prepare_review_report_before_insert on public.review_reports;
create trigger prepare_review_report_before_insert before insert on public.review_reports
  for each row execute function private.prepare_review_report();

create or replace function private.prepare_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_user uuid := (select auth.uid());
  reviewer_name text;
begin
  if request_user is null then raise exception 'Sign in to write a review'; end if;
  if tg_op = 'INSERT' and new.user_id is distinct from request_user then raise exception 'Invalid review author'; end if;
  if tg_op = 'INSERT' then
    select nullif(btrim(full_name), '') into reviewer_name from public.profiles where id = request_user;
    new.display_name := coalesce(reviewer_name, 'PGBook user');
    new.status := 'PUBLISHED';
    new.moderated_at := null;
    new.moderation_note := null;
    new.created_at := now();
  elsif new.user_id is distinct from old.user_id or new.pg_id is distinct from old.pg_id then
    raise exception 'Review author and PG cannot be changed';
  end if;

  if new.title is not null and char_length(btrim(new.title)) > 120 then raise exception 'Review title is too long'; end if;
  if new.content is null or char_length(btrim(new.content)) < 30 or char_length(btrim(new.content)) > 2000 then
    raise exception 'Review must be between 30 and 2000 characters';
  end if;
  new.title := nullif(btrim(new.title), '');
  new.content := btrim(new.content);
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.prepare_review() from public, anon, authenticated;
drop trigger if exists prepare_review_before_write on public.reviews;
create trigger prepare_review_before_write before insert or update on public.reviews
  for each row execute function private.prepare_review();

create or replace function private.refresh_pg_review_stats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_pg uuid;
begin
  if tg_op <> 'INSERT' then
    affected_pg := old.pg_id;
    update public.pgs p set
      rating = coalesce((select avg(r.rating)::numeric(3,2) from public.reviews r where r.pg_id = affected_pg and r.status = 'PUBLISHED'), 0),
      review_count = (select count(*)::integer from public.reviews r where r.pg_id = affected_pg and r.status = 'PUBLISHED')
    where p.id = affected_pg;
  end if;
  if tg_op <> 'DELETE' then
    affected_pg := new.pg_id;
    update public.pgs p set
      rating = coalesce((select avg(r.rating)::numeric(3,2) from public.reviews r where r.pg_id = affected_pg and r.status = 'PUBLISHED'), 0),
      review_count = (select count(*)::integer from public.reviews r where r.pg_id = affected_pg and r.status = 'PUBLISHED')
    where p.id = affected_pg;
  end if;
  return null;
end;
$$;
revoke all on function private.refresh_pg_review_stats() from public, anon, authenticated;
drop trigger if exists refresh_pg_review_stats_after_change on public.reviews;
create trigger refresh_pg_review_stats_after_change after insert or update or delete on public.reviews
  for each row execute function private.refresh_pg_review_stats();

update public.pgs p set
  rating = coalesce((select avg(r.rating)::numeric(3,2) from public.reviews r where r.pg_id = p.id and r.status = 'PUBLISHED'), 0),
  review_count = (select count(*)::integer from public.reviews r where r.pg_id = p.id and r.status = 'PUBLISHED');

create or replace function public.admin_set_review_status(target_review_id uuid, target_status text, note text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if target_status not in ('PUBLISHED', 'HIDDEN') then raise exception 'Invalid review status'; end if;
  update public.reviews set status = target_status, moderated_at = now(), moderation_note = nullif(left(btrim(coalesce(note, '')), 1000), '')
  where id = target_review_id;
  if not found then raise exception 'Review not found'; end if;
  return true;
end;
$$;
revoke all on function public.admin_set_review_status(uuid, text, text) from public, anon;
grant execute on function public.admin_set_review_status(uuid, text, text) to authenticated;

-- There is no online booking workflow. Keep the legacy table and any records,
-- but remove client API access and its old mutation policies.
drop policy if exists bookings_all_admin on public.visit_bookings;
drop policy if exists bookings_insert_self on public.visit_bookings;
drop policy if exists bookings_select_owner on public.visit_bookings;
drop policy if exists bookings_select_self on public.visit_bookings;
drop policy if exists bookings_update_owner on public.visit_bookings;
drop policy if exists bookings_update_self_cancel on public.visit_bookings;
revoke all on public.visit_bookings from anon, authenticated;

notify pgrst, 'reload schema';
