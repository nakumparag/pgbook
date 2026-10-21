-- Keep owner approval functional after removing client-side grants to sensitive
-- profile columns. This RPC cannot create additional administrators.
create or replace function public.admin_set_owner_profile(target_user_id uuid, approve boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_role text;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  select p.role into current_role from public.profiles p where p.id = target_user_id for update;
  if not found then raise exception 'User not found'; end if;
  if current_role = 'ADMIN' then raise exception 'Administrator profile cannot be changed through owner approval'; end if;

  if approve then
    update public.profiles set role = 'OWNER', id_verified = true, updated_at = now()
    where id = target_user_id;
  else
    update public.profiles set id_verified = false, updated_at = now()
    where id = target_user_id;
  end if;
  return true;
end;
$$;
revoke all on function public.admin_set_owner_profile(uuid, boolean) from public, anon;
grant execute on function public.admin_set_owner_profile(uuid, boolean) to authenticated;

create or replace function public.admin_set_profile_verified(target_user_id uuid, verified boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  update public.profiles set id_verified = verified, updated_at = now()
  where id = target_user_id and role <> 'ADMIN';
  if not found then raise exception 'User not found or administrator profile'; end if;
  return true;
end;
$$;
revoke all on function public.admin_set_profile_verified(uuid, boolean) from public, anon;
grant execute on function public.admin_set_profile_verified(uuid, boolean) to authenticated;

notify pgrst, 'reload schema';
