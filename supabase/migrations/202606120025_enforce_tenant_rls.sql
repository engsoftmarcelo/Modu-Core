-- organization_id is the mandatory tenant boundary for every operational table.
do $enable_tenant_rls$
declare
  tenant_table record;
begin
  for tenant_table in
    select namespace.nspname as schema_name, relation.relname as table_name
    from pg_class as relation
    join pg_namespace as namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relkind in ('r', 'p')
      and exists (
        select 1
        from pg_attribute as attribute
        where attribute.attrelid = relation.oid
          and attribute.attname = 'organization_id'
          and not attribute.attisdropped
      )
  loop
    execute format(
      'alter table %I.%I enable row level security',
      tenant_table.schema_name,
      tenant_table.table_name
    );
  end loop;
end;
$enable_tenant_rls$;

alter table public.organizations enable row level security;

-- Public pages are static. Anonymous database access is denied by default.
revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon;

alter default privileges for role postgres in schema public
  revoke all on tables from anon;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon;
alter default privileges for role postgres in schema public
  revoke execute on functions from public;

-- Fail the migration if tenant isolation drifts from the expected invariants.
do $tenant_rls_guard$
declare
  nullable_tenant_keys text;
  rls_disabled_tables text;
  tables_without_select_policy text;
  unscoped_policies text;
  anonymous_tables text;
  invalid_storage_policies text;
begin
  select string_agg(format('%I.%I', namespace.nspname, relation.relname), ', ')
  into nullable_tenant_keys
  from pg_class as relation
  join pg_namespace as namespace on namespace.oid = relation.relnamespace
  join pg_attribute as attribute
    on attribute.attrelid = relation.oid
   and attribute.attname = 'organization_id'
   and not attribute.attisdropped
  where namespace.nspname = 'public'
    and relation.relkind in ('r', 'p')
    and not attribute.attnotnull;

  if nullable_tenant_keys is not null then
    raise exception 'organization_id must be NOT NULL on: %', nullable_tenant_keys;
  end if;

  select string_agg(format('%I.%I', namespace.nspname, relation.relname), ', ')
  into rls_disabled_tables
  from pg_class as relation
  join pg_namespace as namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'public'
    and relation.relkind in ('r', 'p')
    and not relation.relrowsecurity
    and exists (
      select 1
      from pg_attribute as attribute
      where attribute.attrelid = relation.oid
        and attribute.attname = 'organization_id'
        and not attribute.attisdropped
    );

  if rls_disabled_tables is not null then
    raise exception 'RLS must be enabled on tenant tables: %', rls_disabled_tables;
  end if;

  select string_agg(format('%I.%I', namespace.nspname, relation.relname), ', ')
  into tables_without_select_policy
  from pg_class as relation
  join pg_namespace as namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'public'
    and relation.relkind in ('r', 'p')
    and exists (
      select 1
      from pg_attribute as attribute
      where attribute.attrelid = relation.oid
        and attribute.attname = 'organization_id'
        and not attribute.attisdropped
    )
    and not exists (
      select 1
      from pg_policies as policy
      where policy.schemaname = namespace.nspname
        and policy.tablename = relation.relname
        and policy.cmd in ('SELECT', 'ALL')
        and policy.roles @> array['authenticated']::name[]
    );

  if tables_without_select_policy is not null then
    raise exception 'Tenant tables need an authenticated SELECT policy: %',
      tables_without_select_policy;
  end if;

  select string_agg(
    format('%I.%I:%I', policy.schemaname, policy.tablename, policy.policyname),
    ', '
  )
  into unscoped_policies
  from pg_policies as policy
  where policy.schemaname = 'public'
    and policy.roles && array['authenticated', 'public']::name[]
    and exists (
      select 1
      from information_schema.columns as tenant_column
      where tenant_column.table_schema = policy.schemaname
        and tenant_column.table_name = policy.tablename
        and tenant_column.column_name = 'organization_id'
    )
    and concat_ws(' ', policy.qual, policy.with_check)
      not like '%current_organization_id()%';

  if unscoped_policies is not null then
    raise exception 'Tenant policies must use current_organization_id(): %',
      unscoped_policies;
  end if;

  if not exists (
    select 1
    from pg_class as relation
    join pg_namespace as namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'organizations'
      and relation.relrowsecurity
  ) then
    raise exception 'RLS must be enabled on public.organizations';
  end if;

  if not exists (
    select 1
    from pg_policies as policy
    where policy.schemaname = 'public'
      and policy.tablename = 'organizations'
      and policy.cmd in ('SELECT', 'ALL')
      and policy.roles @> array['authenticated']::name[]
      and coalesce(policy.qual, '') like '%user_has_organization_membership%'
  ) then
    raise exception 'Organizations must be visible only through memberships';
  end if;

  select string_agg(distinct format('%I.%I', grant_row.table_schema, grant_row.table_name), ', ')
  into anonymous_tables
  from information_schema.role_table_grants as grant_row
  where grant_row.grantee = 'anon'
    and grant_row.table_schema = 'public'
    and grant_row.privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
    and exists (
      select 1
      from information_schema.columns as tenant_column
      where tenant_column.table_schema = grant_row.table_schema
        and tenant_column.table_name = grant_row.table_name
        and tenant_column.column_name = 'organization_id'
    );

  if anonymous_tables is not null then
    raise exception 'Anonymous access is forbidden on tenant tables: %',
      anonymous_tables;
  end if;

  with required_policy(policy_name, command_name) as (
    values
      ('work_order_attachment_objects_insert_member', 'INSERT'),
      ('work_order_attachment_objects_select_current', 'SELECT'),
      ('work_order_attachment_objects_delete_owner_or_admin', 'DELETE')
  )
  select string_agg(required_policy.policy_name, ', ')
  into invalid_storage_policies
  from required_policy
  left join pg_policies as policy
    on policy.schemaname = 'storage'
   and policy.tablename = 'objects'
   and policy.policyname = required_policy.policy_name
   and policy.cmd = required_policy.command_name
   and policy.roles @> array['authenticated']::name[]
   and concat_ws(' ', policy.qual, policy.with_check)
     like '%work-order-attachments%'
   and concat_ws(' ', policy.qual, policy.with_check)
     like '%current_organization_id()%'
  where policy.policyname is null;

  if invalid_storage_policies is not null then
    raise exception 'Missing or invalid tenant Storage policies: %',
      invalid_storage_policies;
  end if;
end;
$tenant_rls_guard$;
