-- Do not allow an administrator to publish an unverified owner's listing.
create or replace function public.admin_set_pg_status(target_pg_id uuid, target_status public.pg_status)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if target_status = 'APPROVED'::public.pg_status and not exists (
    select 1 from public.pgs listing
    join public.profiles owner_account on owner_account.id = listing.owner_id
    where listing.id = target_pg_id and owner_account.role = 'OWNER' and owner_account.id_verified
  ) then
    raise exception 'Owner verification must be approved before publishing this PG';
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

notify pgrst, 'reload schema';
