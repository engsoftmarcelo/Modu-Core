create or replace function public.user_has_organization_membership(
  target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships as membership
    where membership.user_id = auth.uid()
      and membership.organization_id = target_organization_id
  );
$$;

revoke all on function public.user_has_organization_membership(uuid) from public;
grant execute on function public.user_has_organization_membership(uuid)
  to authenticated, service_role;

drop policy if exists organizations_select_current on public.organizations;
create policy organizations_select_memberships
  on public.organizations for select to authenticated
  using (public.user_has_organization_membership(id));

drop policy if exists organization_memberships_select_current
  on public.organization_memberships;
create policy organization_memberships_select_accessible
  on public.organization_memberships for select to authenticated
  using (
    user_id = auth.uid()
    or organization_id = public.current_organization_id()
  );
