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

select plan(15);

select is(
  (
    select count(*)::bigint
    from auth.users
    where id in (
      'de000000-0000-4000-8000-000000000001',
      'de000000-0000-4000-8000-000000000002',
      'de000000-0000-4000-8000-000000000003',
      'de000000-0000-4000-8000-000000000004'
    )
  ),
  4::bigint,
  'the seed creates four demo authentication users'
);

select is(
  (
    select count(*)::bigint
    from auth.identities
    where user_id in (
      'de000000-0000-4000-8000-000000000001',
      'de000000-0000-4000-8000-000000000002',
      'de000000-0000-4000-8000-000000000003',
      'de000000-0000-4000-8000-000000000004'
    )
      and provider = 'email'
  ),
  4::bigint,
  'every demo user has an email identity'
);

select is(
  (
    select count(distinct organization_id)::bigint
    from public.users
    where id in (
      'de000000-0000-4000-8000-000000000001',
      'de000000-0000-4000-8000-000000000002',
      'de000000-0000-4000-8000-000000000003',
      'de000000-0000-4000-8000-000000000004'
    )
  ),
  4::bigint,
  'each demo account owns a separate organization'
);

select is(
  (
    select count(distinct organization.business_model)::bigint
    from public.organizations as organization
    join public.users as profile on profile.organization_id = organization.id
    where profile.id in (
      'de000000-0000-4000-8000-000000000001',
      'de000000-0000-4000-8000-000000000002',
      'de000000-0000-4000-8000-000000000003',
      'de000000-0000-4000-8000-000000000004'
    )
  ),
  4::bigint,
  'the four business models are represented'
);

select is(
  (
    select count(*)::bigint
    from public.organization_memberships
    where user_id in (
      'de000000-0000-4000-8000-000000000001',
      'de000000-0000-4000-8000-000000000002',
      'de000000-0000-4000-8000-000000000003',
      'de000000-0000-4000-8000-000000000004'
    )
      and role = 'owner'
      and is_default
  ),
  4::bigint,
  'demo users are owners of their default organizations'
);

select is(
  (select count(*)::bigint from public.leads where id::text like 'de120000-%'),
  5::bigint,
  'the agency demo has a populated sales pipeline'
);

select is(
  (select count(*)::bigint from public.proposals where id::text like 'de150000-%'),
  2::bigint,
  'the agency demo has two proposals'
);

select ok(
  (
    select bool_and(total > 0)
    from public.proposals
    where id::text like 'de150000-%'
  ),
  'demo proposal totals are calculated from their items'
);

select is(
  (select count(*)::bigint from public.appointments where id::text like 'de240000-%'),
  5::bigint,
  'the salon demo has a useful appointment history'
);

select ok(
  exists (
    select 1
    from public.appointments
    where id::text like 'de240000-%'
      and starts_at < now()
      and status = 'completed'
  )
  and exists (
    select 1
    from public.appointments
    where id::text like 'de240000-%'
      and starts_at > now()
      and status in ('scheduled', 'confirmed')
  ),
  'the salon has both past services and future returns'
);

select is(
  (select count(*)::bigint from public.enrollments where id::text like 'de360000-%'),
  3::bigint,
  'the course demo has three enrollments'
);

select is(
  (select count(*)::bigint from public.attendance_records where id::text like 'de370000-%'),
  5::bigint,
  'the course demo has attendance records'
);

select ok(
  exists (
    select 1
    from public.enrollments
    where id = 'de360000-0000-4000-8000-000000000303'
      and status = 'completed'
      and payment_status = 'paid'
  ),
  'the course demo has a completed enrollment for certificates'
);

select is(
  (
    select count(distinct status)::bigint
    from public.work_orders
    where id::text like 'de430000-%'
  ),
  4::bigint,
  'the maintenance demo represents four work order stages'
);

select is(
  (
    select count(*)::bigint
    from public.work_order_checklist_items
    where work_order_id = 'de430000-0000-4000-8000-000000000404'
      and completed
  ),
  6::bigint,
  'the completed work order has a finished checklist'
);

select * from finish();
rollback;
