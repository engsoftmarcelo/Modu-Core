alter table public.enrollments
  add column payment_status text not null default 'pending';

update public.enrollments
set
  status = 'enrolled',
  payment_status = 'paid'
where status = 'paid';

alter table public.enrollments
  drop constraint enrollments_status_check,
  add constraint enrollments_status_check check (
    status in (
      'interested',
      'enrolled',
      'in_progress',
      'completed',
      'cancelled'
    )
  ),
  add constraint enrollments_payment_status_check check (
    payment_status in ('pending', 'paid', 'refunded', 'waived')
  );

create or replace function public.enforce_course_class_capacity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  class_capacity integer;
  occupied_seats integer;
begin
  if new.status not in ('enrolled', 'in_progress') then
    return new;
  end if;

  select course_class.capacity
  into class_capacity
  from public.course_classes as course_class
  where course_class.organization_id = new.organization_id
    and course_class.id = new.course_class_id
  for update;

  if class_capacity is null then
    raise exception 'Course class not found in this organization.'
      using errcode = '23503';
  end if;

  select count(*)
  into occupied_seats
  from public.enrollments as enrollment
  where enrollment.organization_id = new.organization_id
    and enrollment.course_class_id = new.course_class_id
    and enrollment.status in ('enrolled', 'in_progress')
    and enrollment.id <> new.id;

  if occupied_seats >= class_capacity then
    raise exception 'Course class capacity has been reached.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger enrollments_enforce_capacity
  before insert or update of course_class_id, status
  on public.enrollments
  for each row execute function public.enforce_course_class_capacity();

create or replace function public.validate_attendance_record()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  class_start date;
  class_end date;
  class_weekdays text[];
  attendance_weekday text;
begin
  if not exists (
    select 1
    from public.enrollments as enrollment
    where enrollment.organization_id = new.organization_id
      and enrollment.student_id = new.student_id
      and enrollment.course_class_id = new.course_class_id
      and enrollment.status in ('enrolled', 'in_progress', 'completed')
  ) then
    raise exception 'Attendance requires an active enrollment.'
      using errcode = '23514';
  end if;

  select
    course_class.start_date,
    course_class.end_date,
    course_class.weekdays
  into class_start, class_end, class_weekdays
  from public.course_classes as course_class
  where course_class.organization_id = new.organization_id
    and course_class.id = new.course_class_id;

  if new.class_date < class_start or new.class_date > class_end then
    raise exception 'Attendance date is outside the course class period.'
      using errcode = '23514';
  end if;

  attendance_weekday := case extract(isodow from new.class_date)::integer
    when 1 then 'monday'
    when 2 then 'tuesday'
    when 3 then 'wednesday'
    when 4 then 'thursday'
    when 5 then 'friday'
    when 6 then 'saturday'
    when 7 then 'sunday'
  end;

  if not (attendance_weekday = any(class_weekdays)) then
    raise exception 'Attendance date is not a scheduled weekday.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger attendance_records_validate
  before insert or update of organization_id, course_class_id, student_id, class_date
  on public.attendance_records
  for each row execute function public.validate_attendance_record();

create or replace function public.text_array_has_unique_values(values_to_check text[])
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select cardinality(values_to_check) = (
    select count(distinct value)
    from unnest(values_to_check) as value
  );
$$;

alter table public.course_classes
  add constraint course_classes_weekdays_are_unique
  check (public.text_array_has_unique_values(weekdays));

update public.work_orders
set
  completion_approved_by = null,
  completion_notes = null,
  completion_accepted = false,
  completed_at = null
where status <> 'completed'
  and (
    completion_approved_by is not null
    or completion_notes is not null
    or completion_accepted
    or completed_at is not null
  );

update public.work_orders
set status = 'requested'
where status in ('quoted', 'approved', 'in_progress')
  and quoted_at is null;

alter table public.work_orders
  drop constraint work_orders_completion_confirmation_check,
  add constraint work_orders_completion_confirmation_check check (
    (
      status = 'completed'
      and completion_approved_by is not null
      and char_length(completion_approved_by) between 2 and 160
      and (
        completion_notes is null
        or char_length(completion_notes) <= 2000
      )
      and completion_accepted
      and completed_at is not null
    )
    or (
      status <> 'completed'
      and completion_approved_by is null
      and completion_notes is null
      and not completion_accepted
      and completed_at is null
    )
  ),
  add constraint work_orders_quote_status_check check (
    status not in ('quoted', 'approved', 'in_progress')
    or quoted_at is not null
  );

create or replace function public.enforce_work_order_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if old.quoted_at is not null
      and new.quoted_at is distinct from old.quoted_at
    then
      new.quoted_at := old.quoted_at;
    elsif old.quoted_at is null
      and new.quoted_at is not null
    then
      new.quoted_at := now();
    end if;

    if old.status = 'completed' and new.status = 'completed' and (
      new.completion_approved_by is distinct from old.completion_approved_by
      or new.completion_notes is distinct from old.completion_notes
      or new.completion_accepted is distinct from old.completion_accepted
      or new.completed_at is distinct from old.completed_at
    ) then
      raise exception 'Completion confirmation is immutable after completion.'
        using errcode = '23514';
    end if;
  elsif new.quoted_at is not null then
    new.quoted_at := now();
  end if;

  if new.status = 'completed' then
    if not new.completion_accepted
      or new.completion_approved_by is null
      or char_length(trim(new.completion_approved_by)) < 2
    then
      raise exception 'Completion requires customer approval.'
        using errcode = '23514';
    end if;

    if tg_op = 'INSERT' or old.status <> 'completed' then
      new.completed_at := now();
    end if;
  else
    new.completion_approved_by := null;
    new.completion_notes := null;
    new.completion_accepted := false;
    new.completed_at := null;
  end if;

  if new.status in ('quoted', 'approved', 'in_progress')
    and new.quoted_at is null
  then
    raise exception 'This work order status requires a saved quote.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger work_orders_enforce_state
  before insert or update on public.work_orders
  for each row execute function public.enforce_work_order_state();

create table public.work_order_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  work_order_id uuid not null,
  actor_id uuid,
  event_type text not null check (
    event_type in (
      'created',
      'status_changed',
      'quote_updated',
      'completed',
      'reopened'
    )
  ),
  from_status text,
  to_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint work_order_events_order_organization_fkey
    foreign key (work_order_id, organization_id)
    references public.work_orders(id, organization_id)
    on delete cascade,
  constraint work_order_events_actor_organization_fkey
    foreign key (organization_id, actor_id)
    references public.organization_memberships(organization_id, user_id)
    on delete set null (actor_id)
);

create index work_order_events_organization_order_created_idx
  on public.work_order_events(organization_id, work_order_id, created_at desc);

create or replace function public.record_work_order_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_actor_id uuid;
begin
  select membership.user_id
  into event_actor_id
  from public.organization_memberships as membership
  where membership.organization_id = new.organization_id
    and membership.user_id = auth.uid();

  if tg_op = 'INSERT' then
    insert into public.work_order_events (
      organization_id,
      work_order_id,
      actor_id,
      event_type,
      to_status
    )
    values (
      new.organization_id,
      new.id,
      event_actor_id,
      'created',
      new.status
    );
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.work_order_events (
      organization_id,
      work_order_id,
      actor_id,
      event_type,
      from_status,
      to_status
    )
    values (
      new.organization_id,
      new.id,
      event_actor_id,
      case
        when new.status = 'completed' then 'completed'
        when old.status = 'completed' then 'reopened'
        else 'status_changed'
      end,
      old.status,
      new.status
    );
  end if;

  if new.quote_materials is distinct from old.quote_materials
    or new.quote_labor is distinct from old.quote_labor
    or new.quote_discount is distinct from old.quote_discount
    or new.quote_term is distinct from old.quote_term
  then
    insert into public.work_order_events (
      organization_id,
      work_order_id,
      actor_id,
      event_type,
      from_status,
      to_status,
      metadata
    )
    values (
      new.organization_id,
      new.id,
      event_actor_id,
      'quote_updated',
      old.status,
      new.status,
      jsonb_build_object('total', new.quote_total)
    );
  end if;

  return new;
end;
$$;

create trigger work_orders_record_event
  after insert or update on public.work_orders
  for each row execute function public.record_work_order_event();

insert into public.work_order_events (
  organization_id,
  work_order_id,
  event_type,
  to_status,
  created_at
)
select
  work_order.organization_id,
  work_order.id,
  'created',
  work_order.status,
  work_order.created_at
from public.work_orders as work_order;

insert into public.work_order_events (
  organization_id,
  work_order_id,
  event_type,
  from_status,
  to_status,
  created_at
)
select
  work_order.organization_id,
  work_order.id,
  'completed',
  'in_progress',
  'completed',
  work_order.completed_at
from public.work_orders as work_order
where work_order.status = 'completed'
  and work_order.completed_at is not null;

alter table public.work_order_events enable row level security;

create policy work_order_events_select_current
  on public.work_order_events for select to authenticated
  using (organization_id = public.current_organization_id());

grant select on public.work_order_events to authenticated;

revoke all on function public.enforce_course_class_capacity() from public;
revoke all on function public.validate_attendance_record() from public;
revoke all on function public.text_array_has_unique_values(text[]) from public;
grant execute on function public.text_array_has_unique_values(text[])
  to authenticated, service_role;
revoke all on function public.enforce_work_order_state() from public;
revoke all on function public.record_work_order_event() from public;
