begin;
set local role postgres;

create extension if not exists pgtap with schema extensions;
select namespace.nspname as pgtap_schema
from pg_proc as procedure
join pg_namespace as namespace on namespace.oid = procedure.pronamespace
where procedure.proname = 'plan'
  and pg_get_function_identity_arguments(procedure.oid) = 'integer'
order by namespace.nspname
limit 1
\gset
set search_path = public, :"pgtap_schema";
grant usage on schema :"pgtap_schema" to authenticated;
grant execute on all functions in schema :"pgtap_schema" to authenticated;

select plan(45);

select is(
  (
    select count(*)::bigint
    from information_schema.columns as tenant_column
    where tenant_column.table_schema = 'public'
      and tenant_column.column_name = 'organization_id'
      and tenant_column.is_nullable = 'YES'
  ),
  0::bigint,
  'organization_id is mandatory on every tenant table'
);

select is(
  (
    select count(*)::bigint
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
      )
  ),
  0::bigint,
  'RLS is enabled on every tenant table'
);

select is(
  (
    select count(*)::bigint
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
      )
  ),
  0::bigint,
  'every tenant table has an authenticated SELECT policy'
);

select is(
  (
    select count(*)::bigint
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
        not like '%current_organization_id()%'
  ),
  0::bigint,
  'every authenticated tenant policy uses the active organization'
);

select ok(
  (
    select relation.relrowsecurity
    from pg_class as relation
    join pg_namespace as namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'organizations'
  )
  and exists (
    select 1
    from pg_policies as policy
    where policy.schemaname = 'public'
      and policy.tablename = 'organizations'
      and policy.cmd in ('SELECT', 'ALL')
      and coalesce(policy.qual, '') like '%user_has_organization_membership%'
  ),
  'organizations are protected and discovered only through memberships'
);

select is(
  (
    select count(distinct grant_row.table_name)::bigint
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
      )
  ),
  0::bigint,
  'anonymous users have no CRUD privilege on tenant tables'
);

select is(
  (
    select count(*)::bigint
    from pg_policies as policy
    where policy.schemaname = 'storage'
      and policy.tablename = 'objects'
      and policy.policyname in (
        'work_order_attachment_objects_insert_member',
        'work_order_attachment_objects_select_current',
        'work_order_attachment_objects_delete_owner_or_admin'
      )
  ),
  3::bigint,
  'the work order bucket has upload, read and delete policies'
);

select is(
  (
    select count(*)::bigint
    from pg_policies as policy
    where policy.schemaname = 'storage'
      and policy.tablename = 'objects'
      and policy.policyname in (
        'work_order_attachment_objects_insert_member',
        'work_order_attachment_objects_select_current',
        'work_order_attachment_objects_delete_owner_or_admin'
      )
      and (
        not (policy.roles @> array['authenticated']::name[])
        or concat_ws(' ', policy.qual, policy.with_check)
          not like '%work-order-attachments%'
        or concat_ws(' ', policy.qual, policy.with_check)
          not like '%current_organization_id()%'
      )
  ),
  0::bigint,
  'every work order Storage policy is scoped to the active organization'
);

insert into auth.users (id, email, raw_user_meta_data)
values (
  '90000000-0000-4000-8000-000000000001',
  'database-test@moducore.local',
  '{"full_name":"Database Test Owner","company_name":"Database Test Org"}'::jsonb
);

insert into public.organizations (id, name, slug, business_model)
values (
  '90000000-0000-4000-8000-000000000002',
  'Other Test Org',
  'other-test-org',
  'b2b_services'
);

insert into public.organization_memberships (
  organization_id,
  user_id,
  role,
  is_default
)
values (
  '90000000-0000-4000-8000-000000000002',
  '90000000-0000-4000-8000-000000000001',
  'member',
  false
);

insert into public.customers (
  id,
  organization_id,
  name,
  email,
  status
)
values
  (
    '90000000-0000-4000-8000-000000000101',
    (
      select organization_id
      from public.users
      where id = '90000000-0000-4000-8000-000000000001'
    ),
    'Own Customer',
    'student@moducore.local',
    'active'
  ),
  (
    '90000000-0000-4000-8000-000000000102',
    '90000000-0000-4000-8000-000000000002',
    'Other Customer',
    'other@moducore.local',
    'active'
  );

select set_config(
  'request.jwt.claim.sub',
  '90000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.organizations
    where id in (
      '90000000-0000-4000-8000-000000000002',
      (
        select organization_id
        from public.organization_memberships
        where user_id = '90000000-0000-4000-8000-000000000001'
          and role = 'owner'
      )
    )
  ),
  2::bigint,
  'users can discover every organization they belong to'
);

select is(
  (
    select count(*)::bigint
    from public.organization_memberships
    where user_id = '90000000-0000-4000-8000-000000000001'
  ),
  2::bigint,
  'users can list all of their own memberships'
);

select lives_ok(
  $$
    select public.switch_organization(
      '90000000-0000-4000-8000-000000000002'
    )
  $$,
  'a user can switch to another organization membership'
);

select is(
  public.current_organization_id(),
  '90000000-0000-4000-8000-000000000002'::uuid,
  'the selected organization becomes the active workspace'
);

select is(
  (
    select name
    from public.customers
    where id in (
      '90000000-0000-4000-8000-000000000101',
      '90000000-0000-4000-8000-000000000102'
    )
  ),
  'Other Customer',
  'switching organizations changes the data visible through RLS'
);

select lives_ok(
  $$
    select public.switch_organization((
      select organization_id
      from public.organization_memberships
      where user_id = auth.uid()
        and role = 'owner'
      limit 1
    ))
  $$,
  'the user can switch back to the owner workspace'
);

select is(
  public.current_user_role(),
  'owner',
  'the signup owner receives an owner membership'
);

select ok(
  has_column_privilege('authenticated', 'public.users', 'full_name', 'UPDATE'),
  'authenticated users may update their profile name'
);

select ok(
  not has_column_privilege('authenticated', 'public.users', 'role', 'UPDATE'),
  'authenticated users cannot update their cached role'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.organization_memberships',
    'UPDATE'
  ),
  'memberships cannot be edited directly by authenticated users'
);

select is(
  (
    select count(*)::bigint
    from public.customers
    where id in (
      '90000000-0000-4000-8000-000000000101',
      '90000000-0000-4000-8000-000000000102'
    )
  ),
  1::bigint,
  'RLS only exposes customers from the current organization'
);

select throws_ok(
  $$
    insert into public.customers (organization_id, name)
    values ('90000000-0000-4000-8000-000000000002', 'Cross tenant')
  $$,
  '42501'
);

select throws_ok(
  $$
    insert into public.tasks (
      organization_id,
      customer_id,
      title
    )
    values (
      public.current_organization_id(),
      '90000000-0000-4000-8000-000000000102',
      'Cross-tenant relation'
    )
  $$,
  '23503'
);

select lives_ok(
  $$
    select public.save_simple_proposal(
      null,
      '90000000-0000-4000-8000-000000000101',
      'Normalized proposal',
      'Implementation and training',
      123.45,
      '2026-08-31',
      'sent',
      'Database test'
    )
  $$,
  'the proposal RPC saves its header and item atomically'
);

select is(
  (
    select total
    from public.proposals
    where title = 'Normalized proposal'
  ),
  123.45::numeric,
  'proposal total is calculated from normalized items'
);

select is(
  (
    select count(*)::bigint
    from public.proposal_items as item
    join public.proposals as proposal on proposal.id = item.proposal_id
    where proposal.title = 'Normalized proposal'
  ),
  1::bigint,
  'the simple proposal creates one normalized item'
);

select ok(
  not has_table_privilege('authenticated', 'public.proposals', 'INSERT'),
  'proposal writes are restricted to RPCs'
);

set local role postgres;
update public.organization_memberships
set role = 'member'
where user_id = '90000000-0000-4000-8000-000000000001'
  and is_default;
set local role authenticated;

select is(
  public.current_user_role(),
  'member',
  'the active membership is the source of authorization'
);

select results_eq(
  $$
    with deleted as (
      delete from public.customers
      where id = '90000000-0000-4000-8000-000000000101'
      returning id
    )
    select count(*)::bigint from deleted
  $$,
  array[0::bigint],
  'members cannot delete operational records'
);

select throws_ok(
  $$
    insert into public.courses (
      organization_id,
      name,
      workload_hours,
      price,
      modality
    )
    values (
      public.current_organization_id(),
      'Unauthorized catalog change',
      10,
      100,
      'online'
    )
  $$,
  '42501'
);

set local role postgres;
update public.organization_memberships
set role = 'owner'
where user_id = '90000000-0000-4000-8000-000000000001'
  and is_default;
set local role authenticated;

insert into public.professionals (
  id,
  organization_id,
  name,
  specialty,
  active
)
values (
  '90000000-0000-4000-8000-000000000202',
  public.current_organization_id(),
  'Tecnico Teste',
  'Instrutor e tecnico',
  true
);

insert into public.courses (
  id,
  organization_id,
  name,
  workload_hours,
  price,
  modality,
  active
)
values (
  '90000000-0000-4000-8000-000000000201',
  public.current_organization_id(),
  'Course Test',
  20,
  250,
  'presencial',
  true
);

insert into public.course_classes (
  id,
  organization_id,
  course_id,
  teacher,
  start_date,
  end_date,
  weekdays,
  class_time,
  capacity
)
values (
  '90000000-0000-4000-8000-000000000203',
  public.current_organization_id(),
  '90000000-0000-4000-8000-000000000201',
  'tecnico teste',
  '2026-07-13',
  '2026-07-19',
  array['monday'],
  '19:00',
  1
);

select is(
  (
    select professional_id
    from public.course_classes
    where id = '90000000-0000-4000-8000-000000000203'
  ),
  '90000000-0000-4000-8000-000000000202'::uuid,
  'course classes resolve the professional from the teacher snapshot'
);

insert into public.students (
  id,
  organization_id,
  name,
  email,
  status
)
values
  (
    '90000000-0000-4000-8000-000000000204',
    public.current_organization_id(),
    'Student One',
    'student@moducore.local',
    'active'
  ),
  (
    '90000000-0000-4000-8000-000000000205',
    public.current_organization_id(),
    'Student Two',
    'student-two@moducore.local',
    'active'
  );

select is(
  (
    select customer_id
    from public.students
    where id = '90000000-0000-4000-8000-000000000204'
  ),
  '90000000-0000-4000-8000-000000000101'::uuid,
  'students reuse an existing customer identity when contact data matches'
);

select lives_ok(
  $$
    insert into public.enrollments (
      id,
      organization_id,
      student_id,
      course_class_id,
      status,
      payment_status
    )
    values (
      '90000000-0000-4000-8000-000000000206',
      public.current_organization_id(),
      '90000000-0000-4000-8000-000000000204',
      '90000000-0000-4000-8000-000000000203',
      'enrolled',
      'paid'
    )
  $$,
  'the first active enrollment occupies the available seat'
);

select throws_ok(
  $$
    insert into public.enrollments (
      organization_id,
      student_id,
      course_class_id,
      status
    )
    values (
      public.current_organization_id(),
      '90000000-0000-4000-8000-000000000205',
      '90000000-0000-4000-8000-000000000203',
      'enrolled'
    )
  $$,
  '23514'
);

select is(
  (
    select payment_status
    from public.enrollments
    where id = '90000000-0000-4000-8000-000000000206'
  ),
  'paid',
  'payment status remains independent from enrollment lifecycle'
);

select lives_ok(
  $$
    insert into public.attendance_records (
      id,
      organization_id,
      course_class_id,
      student_id,
      class_date,
      status
    )
    values (
      '90000000-0000-4000-8000-000000000207',
      public.current_organization_id(),
      '90000000-0000-4000-8000-000000000203',
      '90000000-0000-4000-8000-000000000204',
      '2026-07-13',
      'present'
    )
  $$,
  'attendance is accepted on a scheduled date for an enrolled student'
);

select throws_ok(
  $$
    insert into public.attendance_records (
      organization_id,
      course_class_id,
      student_id,
      class_date,
      status
    )
    values (
      public.current_organization_id(),
      '90000000-0000-4000-8000-000000000203',
      '90000000-0000-4000-8000-000000000204',
      '2026-07-14',
      'present'
    )
  $$,
  '23514'
);

select throws_ok(
  $$
    insert into public.attendance_records (
      organization_id,
      course_class_id,
      student_id,
      class_date,
      status
    )
    values (
      public.current_organization_id(),
      '90000000-0000-4000-8000-000000000203',
      '90000000-0000-4000-8000-000000000205',
      '2026-07-13',
      'absent'
    )
  $$,
  '23514'
);

select lives_ok(
  $$
    insert into public.work_orders (
      id,
      organization_id,
      customer_id,
      address,
      service_type,
      description,
      technician_name,
      visit_date,
      status
    )
    values (
      '90000000-0000-4000-8000-000000000301',
      public.current_organization_id(),
      '90000000-0000-4000-8000-000000000101',
      'Rua de Teste, 100',
      'Manutencao',
      'Revisar equipamento no local',
      'TECNICO TESTE',
      '2026-07-14',
      'requested'
    )
  $$,
  'a requested work order can be created without a quote'
);

select is(
  (
    select professional_id
    from public.work_orders
    where id = '90000000-0000-4000-8000-000000000301'
  ),
  '90000000-0000-4000-8000-000000000202'::uuid,
  'work orders resolve the professional from the technician snapshot'
);

select throws_ok(
  $$
    update public.work_orders
    set status = 'approved'
    where id = '90000000-0000-4000-8000-000000000301'
  $$,
  '23514'
);

select throws_ok(
  $$
    update public.work_orders
    set status = 'completed'
    where id = '90000000-0000-4000-8000-000000000301'
  $$,
  '23514'
);

select lives_ok(
  $$
    update public.work_orders
    set
      status = 'completed',
      completion_approved_by = 'Cliente Teste',
      completion_notes = 'Servico aprovado',
      completion_accepted = true
    where id = '90000000-0000-4000-8000-000000000301'
  $$,
  'completion succeeds when explicit customer proof is present'
);

select ok(
  (
    select completed_at is not null
    from public.work_orders
    where id = '90000000-0000-4000-8000-000000000301'
  ),
  'the database assigns the completion timestamp'
);

select is(
  (
    select count(*)::bigint
    from public.work_order_events
    where work_order_id = '90000000-0000-4000-8000-000000000301'
  ),
  2::bigint,
  'work order creation and completion are recorded in the audit log'
);

select throws_ok(
  $$
    update public.work_orders
    set completion_approved_by = 'Another Person'
    where id = '90000000-0000-4000-8000-000000000301'
  $$,
  '23514'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.work_order_events',
    'INSERT'
  ),
  'the work order audit log is append-only for application users'
);

select * from finish();
rollback;
