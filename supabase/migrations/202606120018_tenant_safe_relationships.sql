alter table public.customers
  add constraint customers_organization_id_id_key
  unique (organization_id, id);

alter table public.leads
  add constraint leads_organization_id_id_key
  unique (organization_id, id);

alter table public.proposals
  add constraint proposals_organization_id_id_key
  unique (organization_id, id);

alter table public.students
  add constraint students_organization_id_id_key
  unique (organization_id, id);

alter table public.courses
  add constraint courses_organization_id_id_key
  unique (organization_id, id);

alter table public.course_classes
  add constraint course_classes_organization_id_id_key
  unique (organization_id, id);

alter table public.enrollments
  add constraint enrollments_organization_id_id_key
  unique (organization_id, id);

alter table public.work_orders
  add constraint work_orders_organization_id_id_key
  unique (organization_id, id);

alter table public.leads
  drop constraint leads_owner_id_fkey,
  add constraint leads_owner_organization_fkey
    foreign key (organization_id, owner_id)
    references public.organization_memberships(organization_id, user_id)
    on delete set null (owner_id);

alter table public.tasks
  drop constraint tasks_assignee_id_fkey,
  drop constraint tasks_customer_id_fkey,
  drop constraint tasks_lead_id_fkey,
  add constraint tasks_assignee_organization_fkey
    foreign key (organization_id, assignee_id)
    references public.organization_memberships(organization_id, user_id)
    on delete set null (assignee_id),
  add constraint tasks_customer_organization_fkey
    foreign key (organization_id, customer_id)
    references public.customers(organization_id, id)
    on delete set null (customer_id),
  add constraint tasks_lead_organization_fkey
    foreign key (organization_id, lead_id)
    references public.leads(organization_id, id)
    on delete set null (lead_id);

alter table public.appointments
  drop constraint appointments_customer_id_fkey,
  drop constraint appointments_professional_id_fkey,
  drop constraint appointments_service_id_fkey,
  add constraint appointments_customer_organization_fkey
    foreign key (organization_id, customer_id)
    references public.customers(organization_id, id)
    on delete set null (customer_id),
  add constraint appointments_professional_organization_fkey
    foreign key (organization_id, professional_id)
    references public.professionals(organization_id, id)
    on delete set null (professional_id),
  add constraint appointments_service_organization_fkey
    foreign key (organization_id, service_id)
    references public.services(organization_id, id)
    on delete set null (service_id);

alter table public.proposals
  drop constraint proposals_customer_id_fkey,
  add constraint proposals_customer_organization_fkey
    foreign key (organization_id, customer_id)
    references public.customers(organization_id, id)
    on delete set null (customer_id);

alter table public.course_classes
  drop constraint course_classes_course_id_fkey,
  add constraint course_classes_course_organization_fkey
    foreign key (organization_id, course_id)
    references public.courses(organization_id, id)
    on delete cascade;

alter table public.enrollments
  drop constraint enrollments_student_id_fkey,
  drop constraint enrollments_course_class_id_fkey,
  add constraint enrollments_student_organization_fkey
    foreign key (organization_id, student_id)
    references public.students(organization_id, id)
    on delete cascade,
  add constraint enrollments_class_organization_fkey
    foreign key (organization_id, course_class_id)
    references public.course_classes(organization_id, id)
    on delete cascade;

alter table public.attendance_records
  drop constraint attendance_records_student_id_fkey,
  drop constraint attendance_records_course_class_id_fkey,
  add constraint attendance_records_student_organization_fkey
    foreign key (organization_id, student_id)
    references public.students(organization_id, id)
    on delete cascade,
  add constraint attendance_records_class_organization_fkey
    foreign key (organization_id, course_class_id)
    references public.course_classes(organization_id, id)
    on delete cascade,
  add constraint attendance_records_enrollment_fkey
    foreign key (organization_id, student_id, course_class_id)
    references public.enrollments(
      organization_id,
      student_id,
      course_class_id
    )
    on delete cascade;

alter table public.work_orders
  drop constraint work_orders_customer_id_fkey,
  add constraint work_orders_customer_organization_fkey
    foreign key (organization_id, customer_id)
    references public.customers(organization_id, id)
    on delete set null (customer_id);

alter table public.work_order_attachments
  drop constraint work_order_attachments_uploaded_by_fkey,
  add constraint work_order_attachments_uploader_organization_fkey
    foreign key (organization_id, uploaded_by)
    references public.organization_memberships(organization_id, user_id)
    on delete set null (uploaded_by);

alter table public.students
  add column customer_id uuid;

update public.students as student
set customer_id = (
  select customer.id
  from public.customers as customer
  where customer.organization_id = student.organization_id
    and (
      (
        student.email is not null
        and customer.email is not null
        and lower(trim(customer.email)) = lower(trim(student.email))
      )
      or (
        student.whatsapp is not null
        and customer.whatsapp is not null
        and regexp_replace(customer.whatsapp, '[^0-9]', '', 'g') =
          regexp_replace(student.whatsapp, '[^0-9]', '', 'g')
      )
    )
  order by customer.created_at
  limit 1
)
where student.customer_id is null;

alter table public.students
  add constraint students_customer_organization_fkey
    foreign key (organization_id, customer_id)
    references public.customers(organization_id, id)
    on delete set null (customer_id);

create or replace function public.link_student_to_customer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.customer_id is null then
    select customer.id
    into new.customer_id
    from public.customers as customer
    where customer.organization_id = new.organization_id
      and (
        (
          new.email is not null
          and customer.email is not null
          and lower(trim(customer.email)) = lower(trim(new.email))
        )
        or (
          new.whatsapp is not null
          and customer.whatsapp is not null
          and regexp_replace(customer.whatsapp, '[^0-9]', '', 'g') =
            regexp_replace(new.whatsapp, '[^0-9]', '', 'g')
        )
      )
    order by customer.created_at
    limit 1;
  end if;

  return new;
end;
$$;

create trigger students_link_customer
  before insert or update of email, whatsapp, customer_id
  on public.students
  for each row execute function public.link_student_to_customer();

alter table public.course_classes
  add column professional_id uuid;

update public.course_classes as course_class
set professional_id = (
  select professional.id
  from public.professionals as professional
  where professional.organization_id = course_class.organization_id
    and lower(trim(professional.name)) = lower(trim(course_class.teacher))
  order by professional.created_at
  limit 1
)
where course_class.professional_id is null;

alter table public.course_classes
  add constraint course_classes_professional_organization_fkey
    foreign key (organization_id, professional_id)
    references public.professionals(organization_id, id)
    on delete set null (professional_id);

alter table public.work_orders
  add column professional_id uuid;

update public.work_orders as work_order
set professional_id = (
  select professional.id
  from public.professionals as professional
  where professional.organization_id = work_order.organization_id
    and lower(trim(professional.name)) = lower(trim(work_order.technician_name))
  order by professional.created_at
  limit 1
)
where work_order.professional_id is null;

alter table public.work_orders
  add constraint work_orders_professional_organization_fkey
    foreign key (organization_id, professional_id)
    references public.professionals(organization_id, id)
    on delete set null (professional_id);

create index leads_organization_owner_idx
  on public.leads(organization_id, owner_id)
  where owner_id is not null;

create index tasks_organization_assignee_idx
  on public.tasks(organization_id, assignee_id)
  where assignee_id is not null;

create index appointments_organization_customer_idx
  on public.appointments(organization_id, customer_id)
  where customer_id is not null;

create index proposals_organization_customer_idx
  on public.proposals(organization_id, customer_id)
  where customer_id is not null;

create index work_order_attachments_organization_uploader_idx
  on public.work_order_attachments(organization_id, uploaded_by)
  where uploaded_by is not null;

create index students_organization_customer_idx
  on public.students(organization_id, customer_id)
  where customer_id is not null;

create index course_classes_organization_professional_idx
  on public.course_classes(organization_id, professional_id)
  where professional_id is not null;

create index work_orders_organization_professional_idx
  on public.work_orders(organization_id, professional_id)
  where professional_id is not null;

drop index if exists public.courses_organization_name_idx;
drop index if exists public.enrollments_organization_student_idx;
drop index if exists public.customers_organization_idx;

comment on column public.students.customer_id is
  'Optional link to the same person in CRM. Student fields remain historical snapshots.';
comment on column public.course_classes.teacher is
  'Teacher name snapshot. professional_id is the normalized relationship when available.';
comment on column public.work_orders.technician_name is
  'Technician name snapshot. professional_id is the normalized relationship when available.';

revoke all on function public.link_student_to_customer() from public;
