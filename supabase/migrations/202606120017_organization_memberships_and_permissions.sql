create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create unique index organization_memberships_one_default_per_user_idx
  on public.organization_memberships(user_id)
  where is_default;

create index organization_memberships_user_idx
  on public.organization_memberships(user_id, organization_id);

insert into public.organization_memberships (
  organization_id,
  user_id,
  role,
  is_default,
  created_at,
  updated_at
)
select
  organization_id,
  id,
  role,
  true,
  created_at,
  updated_at
from public.users
on conflict (organization_id, user_id) do update
set
  role = excluded.role,
  is_default = true,
  updated_at = now();

create trigger organization_memberships_set_updated_at
  before update on public.organization_memberships
  for each row execute function public.set_updated_at();

create or replace function public.ensure_initial_organization_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.organization_memberships (
    organization_id,
    user_id,
    role,
    is_default
  )
  values (
    new.organization_id,
    new.id,
    new.role,
    true
  )
  on conflict (organization_id, user_id) do update
  set
    role = excluded.role,
    is_default = true,
    updated_at = now();

  return new;
end;
$$;

create trigger users_create_initial_organization_membership
  after insert on public.users
  for each row execute function public.ensure_initial_organization_membership();

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select membership.organization_id
  from public.organization_memberships as membership
  where membership.user_id = auth.uid()
    and membership.is_default
  limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select membership.role
  from public.organization_memberships as membership
  where membership.user_id = auth.uid()
    and membership.organization_id = public.current_organization_id()
  limit 1;
$$;

create or replace function public.current_user_can_write()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    public.current_user_role() in ('owner', 'admin', 'member'),
    false
  );
$$;

create or replace function public.current_user_can_administer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() in ('owner', 'admin'), false);
$$;

create or replace function public.current_user_is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'owner', false);
$$;

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

revoke all on function public.current_organization_id() from public;
revoke all on function public.current_user_role() from public;
revoke all on function public.current_user_can_write() from public;
revoke all on function public.current_user_can_administer() from public;
revoke all on function public.current_user_is_owner() from public;
revoke all on function public.user_has_organization_membership(uuid) from public;

grant execute on function public.current_organization_id()
  to authenticated, service_role;
grant execute on function public.current_user_role()
  to authenticated, service_role;
grant execute on function public.current_user_can_write()
  to authenticated, service_role;
grant execute on function public.current_user_can_administer()
  to authenticated, service_role;
grant execute on function public.current_user_is_owner()
  to authenticated, service_role;
grant execute on function public.user_has_organization_membership(uuid)
  to authenticated, service_role;

alter table public.organization_memberships enable row level security;

drop policy if exists "members can view their organization"
  on public.organizations;
drop policy if exists "owners can update their organization"
  on public.organizations;

create policy organizations_select_current
  on public.organizations for select to authenticated
  using (public.user_has_organization_membership(id));

create policy organizations_update_owner
  on public.organizations for update to authenticated
  using (
    id = public.current_organization_id()
    and public.current_user_is_owner()
  )
  with check (
    id = public.current_organization_id()
    and public.current_user_is_owner()
  );

drop policy if exists "members can view organization users"
  on public.users;
drop policy if exists "users can update their own profile"
  on public.users;

create policy users_select_organization_members
  on public.users for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.organization_memberships as membership
      where membership.user_id = users.id
        and membership.organization_id = public.current_organization_id()
    )
  );

create policy users_update_own_profile
  on public.users for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and organization_id = public.current_organization_id()
  );

create policy organization_memberships_select_current
  on public.organization_memberships for select to authenticated
  using (
    user_id = auth.uid()
    or organization_id = public.current_organization_id()
  );

revoke insert, update, delete on public.organization_memberships
  from authenticated;
grant select on public.organization_memberships to authenticated;

revoke update on public.users from authenticated;
grant update (full_name) on public.users to authenticated;

do $policies$
declare
  table_name text;
  policy_row record;
begin
  foreach table_name in array array[
    'customers',
    'leads',
    'tasks',
    'appointments',
    'proposals',
    'students',
    'enrollments',
    'attendance_records',
    'work_orders'
  ]
  loop
    for policy_row in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
    loop
      execute format(
        'drop policy %I on public.%I',
        policy_row.policyname,
        table_name
      );
    end loop;

    execute format(
      'create policy %I on public.%I for select to authenticated using (organization_id = public.current_organization_id())',
      table_name || '_select_current',
      table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (organization_id = public.current_organization_id() and public.current_user_can_write())',
      table_name || '_insert_member',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (organization_id = public.current_organization_id() and public.current_user_can_write()) with check (organization_id = public.current_organization_id() and public.current_user_can_write())',
      table_name || '_update_member',
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (organization_id = public.current_organization_id() and public.current_user_can_administer())',
      table_name || '_delete_admin',
      table_name
    );
  end loop;

  foreach table_name in array array[
    'services',
    'professionals',
    'professional_services',
    'courses',
    'course_classes'
  ]
  loop
    for policy_row in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
    loop
      execute format(
        'drop policy %I on public.%I',
        policy_row.policyname,
        table_name
      );
    end loop;

    execute format(
      'create policy %I on public.%I for select to authenticated using (organization_id = public.current_organization_id())',
      table_name || '_select_current',
      table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (organization_id = public.current_organization_id() and public.current_user_can_administer())',
      table_name || '_insert_admin',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (organization_id = public.current_organization_id() and public.current_user_can_administer()) with check (organization_id = public.current_organization_id() and public.current_user_can_administer())',
      table_name || '_update_admin',
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (organization_id = public.current_organization_id() and public.current_user_can_administer())',
      table_name || '_delete_admin',
      table_name
    );
  end loop;
end;
$policies$;

drop policy if exists "organization can view work order checklist"
  on public.work_order_checklist_items;
drop policy if exists "organization can update work order checklist"
  on public.work_order_checklist_items;

create policy work_order_checklist_items_select_current
  on public.work_order_checklist_items for select to authenticated
  using (organization_id = public.current_organization_id());

create policy work_order_checklist_items_update_member
  on public.work_order_checklist_items for update to authenticated
  using (
    organization_id = public.current_organization_id()
    and public.current_user_can_write()
  )
  with check (
    organization_id = public.current_organization_id()
    and public.current_user_can_write()
  );

drop policy if exists "organization can view work order attachments"
  on public.work_order_attachments;
drop policy if exists "organization can create work order attachments"
  on public.work_order_attachments;
drop policy if exists "organization can update work order attachments"
  on public.work_order_attachments;
drop policy if exists "organization can delete work order attachments"
  on public.work_order_attachments;

create policy work_order_attachments_select_current
  on public.work_order_attachments for select to authenticated
  using (organization_id = public.current_organization_id());

create policy work_order_attachments_insert_member
  on public.work_order_attachments for insert to authenticated
  with check (
    organization_id = public.current_organization_id()
    and uploaded_by = auth.uid()
    and public.current_user_can_write()
  );

create policy work_order_attachments_update_owner_or_admin
  on public.work_order_attachments for update to authenticated
  using (
    organization_id = public.current_organization_id()
    and (
      uploaded_by = auth.uid()
      or public.current_user_can_administer()
    )
  )
  with check (
    organization_id = public.current_organization_id()
    and (
      uploaded_by = auth.uid()
      or public.current_user_can_administer()
    )
  );

create policy work_order_attachments_delete_owner_or_admin
  on public.work_order_attachments for delete to authenticated
  using (
    organization_id = public.current_organization_id()
    and (
      uploaded_by = auth.uid()
      or public.current_user_can_administer()
    )
  );

drop policy if exists "organization can upload work order attachment objects"
  on storage.objects;
drop policy if exists "organization can view work order attachment objects"
  on storage.objects;
drop policy if exists "organization can delete work order attachment objects"
  on storage.objects;

create policy work_order_attachment_objects_insert_member
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'work-order-attachments'
    and public.current_user_can_write()
    and coalesce(array_length(storage.foldername(name), 1), 0) = 2
    and (storage.foldername(name))[1] = public.current_organization_id()::text
    and exists (
      select 1
      from public.work_order_attachments as attachment
      where attachment.storage_path = name
        and attachment.organization_id = public.current_organization_id()
        and attachment.uploaded_by = auth.uid()
        and attachment.upload_status = 'pending'
    )
  );

create policy work_order_attachment_objects_select_current
  on storage.objects for select to authenticated
  using (
    bucket_id = 'work-order-attachments'
    and (storage.foldername(name))[1] = public.current_organization_id()::text
    and exists (
      select 1
      from public.work_order_attachments as attachment
      where attachment.storage_path = name
        and attachment.organization_id = public.current_organization_id()
    )
  );

create policy work_order_attachment_objects_delete_owner_or_admin
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'work-order-attachments'
    and (storage.foldername(name))[1] = public.current_organization_id()::text
    and exists (
      select 1
      from public.work_order_attachments as attachment
      where attachment.storage_path = name
        and attachment.organization_id = public.current_organization_id()
        and (
          attachment.uploaded_by = auth.uid()
          or public.current_user_can_administer()
        )
    )
  );

create or replace function public.add_organization_member(
  target_user_id uuid,
  target_role text default 'member'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_org_id uuid := public.current_organization_id();
begin
  if not public.current_user_is_owner() then
    raise exception 'Only organization owners can add members.'
      using errcode = '42501';
  end if;

  if target_role not in ('owner', 'admin', 'member') then
    raise exception 'Invalid organization role.' using errcode = '22023';
  end if;

  if not exists (select 1 from public.users where id = target_user_id) then
    raise exception 'User profile not found.' using errcode = 'P0002';
  end if;

  insert into public.organization_memberships (
    organization_id,
    user_id,
    role,
    is_default
  )
  values (current_org_id, target_user_id, target_role, false)
  on conflict (organization_id, user_id) do nothing;
end;
$$;

create or replace function public.set_organization_member_role(
  target_user_id uuid,
  target_role text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_org_id uuid := public.current_organization_id();
  previous_role text;
begin
  if not public.current_user_is_owner() then
    raise exception 'Only organization owners can change member roles.'
      using errcode = '42501';
  end if;

  if target_role not in ('owner', 'admin', 'member') then
    raise exception 'Invalid organization role.' using errcode = '22023';
  end if;

  select membership.role
  into previous_role
  from public.organization_memberships as membership
  where membership.organization_id = current_org_id
    and membership.user_id = target_user_id;

  if previous_role is null then
    raise exception 'Organization membership not found.' using errcode = 'P0002';
  end if;

  if previous_role = 'owner'
    and target_role <> 'owner'
    and (
      select count(*)
      from public.organization_memberships as membership
      where membership.organization_id = current_org_id
        and membership.role = 'owner'
    ) <= 1
  then
    raise exception 'The organization must keep at least one owner.'
      using errcode = '23514';
  end if;

  update public.organization_memberships
  set role = target_role
  where organization_id = current_org_id
    and user_id = target_user_id;

  update public.users
  set role = target_role
  where id = target_user_id
    and organization_id = current_org_id;
end;
$$;

create or replace function public.remove_organization_member(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_org_id uuid := public.current_organization_id();
  membership_role text;
  membership_is_default boolean;
begin
  if not public.current_user_is_owner() then
    raise exception 'Only organization owners can remove members.'
      using errcode = '42501';
  end if;

  select membership.role, membership.is_default
  into membership_role, membership_is_default
  from public.organization_memberships as membership
  where membership.organization_id = current_org_id
    and membership.user_id = target_user_id;

  if membership_role is null then
    raise exception 'Organization membership not found.' using errcode = 'P0002';
  end if;

  if membership_is_default then
    raise exception 'Switch the user default organization before removal.'
      using errcode = '23514';
  end if;

  if membership_role = 'owner'
    and (
      select count(*)
      from public.organization_memberships as membership
      where membership.organization_id = current_org_id
        and membership.role = 'owner'
    ) <= 1
  then
    raise exception 'The organization must keep at least one owner.'
      using errcode = '23514';
  end if;

  delete from public.organization_memberships
  where organization_id = current_org_id
    and user_id = target_user_id;
end;
$$;

create or replace function public.switch_organization(target_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role text;
begin
  select membership.role
  into selected_role
  from public.organization_memberships as membership
  where membership.organization_id = target_organization_id
    and membership.user_id = auth.uid();

  if selected_role is null then
    raise exception 'Organization membership not found.' using errcode = '42501';
  end if;

  update public.organization_memberships
  set is_default = false
  where user_id = auth.uid()
    and is_default;

  update public.organization_memberships
  set is_default = true
  where organization_id = target_organization_id
    and user_id = auth.uid();

  update public.users
  set
    organization_id = target_organization_id,
    role = selected_role
  where id = auth.uid();
end;
$$;

revoke all on function public.add_organization_member(uuid, text) from public;
revoke all on function public.set_organization_member_role(uuid, text) from public;
revoke all on function public.remove_organization_member(uuid) from public;
revoke all on function public.switch_organization(uuid) from public;

grant execute on function public.add_organization_member(uuid, text)
  to authenticated;
grant execute on function public.set_organization_member_role(uuid, text)
  to authenticated;
grant execute on function public.remove_organization_member(uuid)
  to authenticated;
grant execute on function public.switch_organization(uuid)
  to authenticated;

comment on column public.users.organization_id is
  'Cached default organization. Memberships are canonical.';
comment on column public.users.role is
  'Cached role for the default organization. Memberships are canonical.';

revoke truncate, trigger, references on all tables in schema public
  from anon, authenticated;
revoke all on function public.handle_new_user() from public;
revoke all on function public.ensure_initial_organization_membership() from public;
revoke all on function public.create_default_work_order_checklist() from public;
revoke all on function public.set_updated_at() from public;
