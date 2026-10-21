-- Allow guests to read the related data for approved listings while keeping
-- draft and pending listing details private.
drop policy if exists pg_amenities_select_public on public.pg_amenities;
create policy pg_amenities_select_public on public.pg_amenities
  for select to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.pgs p
      where p.id = pg_amenities.pg_id
        and (p.status = 'APPROVED'::public.pg_status or p.owner_id = (select auth.uid()))
    )
  );

grant select on public.rooms, public.pg_images, public.pg_amenities, public.amenities
  to anon, authenticated;

notify pgrst, 'reload schema';
