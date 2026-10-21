-- Keep the SECURITY DEFINER admin lookup outside the exposed public API schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
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
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- Existing RLS policies call this public wrapper. It is invoker-rights only;
-- the protected lookup itself runs in the non-exposed private schema.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select private.is_admin();
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
