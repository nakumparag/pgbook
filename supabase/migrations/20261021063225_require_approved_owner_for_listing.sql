-- A regular account may apply to become an owner, but only an approved owner
-- (or the administrator) may create or submit listings.
drop policy if exists pgs_insert_owner on public.pgs;
create policy pgs_insert_owner on public.pgs
  for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and status = 'DRAFT'::public.pg_status
    and (
      public.is_admin()
      or exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid()) and p.role = 'OWNER' and p.id_verified
      )
    )
  );

create or replace function public.owner_set_pg_status(target_pg_id uuid, target_status public.pg_status)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status public.pg_status;
  listing_owner uuid;
  owner_approved boolean;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  select p.status, p.owner_id into current_status, listing_owner
  from public.pgs p where p.id = target_pg_id for update;
  if not found or listing_owner <> (select auth.uid()) then raise exception 'Listing not found or access denied'; end if;

  select (p.role = 'OWNER' and p.id_verified) or p.role = 'ADMIN'
  into owner_approved from public.profiles p where p.id = (select auth.uid());
  if not coalesce(owner_approved, false) then raise exception 'Owner verification must be approved before submitting a listing'; end if;

  if not (
    (current_status in ('DRAFT'::public.pg_status, 'REJECTED'::public.pg_status) and target_status = 'PENDING'::public.pg_status)
    or (current_status = 'APPROVED'::public.pg_status and target_status = 'SUSPENDED'::public.pg_status)
    or (current_status = 'SUSPENDED'::public.pg_status and target_status = 'APPROVED'::public.pg_status)
    or (target_status = 'ARCHIVED'::public.pg_status and current_status <> 'ARCHIVED'::public.pg_status)
  ) then raise exception 'Unsupported listing status change'; end if;

  update public.pgs set status = target_status,
    published_at = case when target_status = 'APPROVED'::public.pg_status then coalesce(published_at, now()) else published_at end
  where id = target_pg_id;
  return true;
end;
$$;
revoke all on function public.owner_set_pg_status(uuid, public.pg_status) from public, anon;
grant execute on function public.owner_set_pg_status(uuid, public.pg_status) to authenticated;

notify pgrst, 'reload schema';
