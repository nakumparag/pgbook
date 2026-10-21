-- Keep the security-definer helpers used by RLS and triggers safe from search_path changes.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'ADMIN'::public.user_role
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'USER'::public.user_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.prevent_owner_self_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'APPROVED'
    and old.status is distinct from new.status
    and not public.is_admin() then
    raise exception 'Only an administrator can approve an owner profile';
  end if;
  return new;
end;
$$;

-- These helpers are invoked by database triggers, not by client RPC requests.
revoke all on function public.handle_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.prevent_owner_self_approval() from public, anon, authenticated;

-- RLS policies call is_admin() for both public reads and authenticated management.
-- It only reports the role of auth.uid(), and has a fixed, empty search_path.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create index if not exists inquiries_pg_id_idx on public.inquiries (pg_id);
create index if not exists inquiries_user_id_idx on public.inquiries (user_id);
create index if not exists pg_visits_user_id_idx on public.pg_visits (user_id);
