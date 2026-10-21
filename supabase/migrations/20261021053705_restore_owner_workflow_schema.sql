-- Restore tables and columns expected by the live owner, inquiry, and admin flows.
-- This migration is additive and preserves existing profile and listing rows.

alter table public.profiles
  add column if not exists id_verified boolean not null default false;

create table if not exists public.owner_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'NOT_SUBMITTED'
    check (status in ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED')),
  owner_type text not null default 'PG Owner',
  id_type text,
  id_number text,
  id_document_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  pg_id uuid references public.pgs(id) on delete cascade,
  request_type text not null check (request_type in ('OWNER', 'PG')),
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint approval_request_target_check check (
    (request_type = 'OWNER' and pg_id is null) or
    (request_type = 'PG' and pg_id is not null)
  )
);

create unique index if not exists approval_requests_pending_owner_unique
  on public.approval_requests (owner_id)
  where request_type = 'OWNER' and status = 'PENDING';
create unique index if not exists approval_requests_pending_pg_unique
  on public.approval_requests (pg_id)
  where request_type = 'PG' and status = 'PENDING';
create index if not exists approval_requests_status_created_idx
  on public.approval_requests (status, created_at desc);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  pg_id uuid not null references public.pgs(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  contact_type text not null check (contact_type in ('CALLBACK', 'CALL', 'WHATSAPP')),
  preferred_time text,
  message text,
  status text not null default 'NEW' check (status in ('NEW', 'CONTACTED', 'CLOSED')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists inquiries_owner_created_idx
  on public.inquiries (owner_id, created_at desc);

create table if not exists public.pg_visits (
  id uuid primary key default gen_random_uuid(),
  pg_id uuid not null references public.pgs(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists pg_visits_pg_created_idx
  on public.pg_visits (pg_id, created_at desc);

alter table public.owner_profiles enable row level security;
alter table public.approval_requests enable row level security;
alter table public.inquiries enable row level security;
alter table public.pg_visits enable row level security;

grant select, insert, update on public.owner_profiles to authenticated;
grant select, insert, update on public.approval_requests to authenticated;
grant select, insert, update on public.inquiries to authenticated;
grant insert on public.inquiries to anon;
grant select, insert on public.pg_visits to authenticated;
grant insert on public.pg_visits to anon;

create policy owner_profiles_select_self_or_admin on public.owner_profiles
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());
create policy owner_profiles_insert_self on public.owner_profiles
  for insert to authenticated
  with check (auth.uid() = user_id and status in ('NOT_SUBMITTED', 'PENDING'));
create policy owner_profiles_update_self_or_admin on public.owner_profiles
  for update to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create or replace function public.prevent_owner_self_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'APPROVED' and old.status is distinct from new.status and not public.is_admin() then
    raise exception 'Only an administrator can approve an owner profile';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_owner_self_approval_trigger on public.owner_profiles;
create trigger prevent_owner_self_approval_trigger
  before update on public.owner_profiles
  for each row execute function public.prevent_owner_self_approval();

create policy approval_requests_select_own_or_admin on public.approval_requests
  for select to authenticated
  using (auth.uid() = owner_id or public.is_admin());
create policy approval_requests_insert_own_pending on public.approval_requests
  for insert to authenticated
  with check (
    auth.uid() = owner_id and status = 'PENDING' and
    ((request_type = 'OWNER' and pg_id is null) or
     (request_type = 'PG' and exists (
       select 1 from public.pgs where pgs.id = approval_requests.pg_id and pgs.owner_id = auth.uid()
     )))
  );
create policy approval_requests_update_admin on public.approval_requests
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy inquiries_select_owner_or_admin on public.inquiries
  for select to authenticated
  using (auth.uid() = owner_id or public.is_admin());
create policy inquiries_insert_contact on public.inquiries
  for insert to anon, authenticated
  with check (
    (user_id is null or user_id = auth.uid()) and
    exists (select 1 from public.pgs where pgs.id = inquiries.pg_id and pgs.owner_id = inquiries.owner_id)
  );
create policy inquiries_update_owner on public.inquiries
  for update to authenticated
  using (auth.uid() = owner_id or public.is_admin())
  with check (auth.uid() = owner_id or public.is_admin());

create policy pg_visits_insert_public on public.pg_visits
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy pg_visits_select_owner_or_admin on public.pg_visits
  for select to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.pgs where pgs.id = pg_visits.pg_id and pgs.owner_id = auth.uid()
    )
  );

drop trigger if exists on_owner_profiles_updated on public.owner_profiles;
create trigger on_owner_profiles_updated before update on public.owner_profiles
  for each row execute function public.handle_updated_at();
drop trigger if exists on_approval_requests_updated on public.approval_requests;
create trigger on_approval_requests_updated before update on public.approval_requests
  for each row execute function public.handle_updated_at();
drop trigger if exists on_inquiries_updated on public.inquiries;
create trigger on_inquiries_updated before update on public.inquiries
  for each row execute function public.handle_updated_at();

-- Preserve existing pending PG submissions so admins can review them immediately.
insert into public.owner_profiles (user_id, status, owner_type)
select distinct owner_id, 'NOT_SUBMITTED', 'PG Owner'
from public.pgs
on conflict (user_id) do nothing;

insert into public.approval_requests (owner_id, pg_id, request_type, status, admin_notes)
select p.owner_id, p.id, 'PG', 'PENDING', 'Existing pending listing restored for admin review'
from public.pgs as p
where p.status = 'PENDING'
  and not exists (
    select 1 from public.approval_requests as ar
    where ar.pg_id = p.id and ar.request_type = 'PG' and ar.status = 'PENDING'
  );

notify pgrst, 'reload schema';
