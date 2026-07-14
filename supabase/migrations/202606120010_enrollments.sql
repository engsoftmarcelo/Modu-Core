create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  course_class_id uuid not null references public.course_classes(id) on delete cascade,
  status text not null default 'interested' check (
    status in (
      'interested',
      'enrolled',
      'paid',
      'in_progress',
      'completed',
      'cancelled'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, student_id, course_class_id)
);

create index if not exists enrollments_organization_status_idx
  on public.enrollments(organization_id, status);

create index if not exists enrollments_organization_class_idx
  on public.enrollments(organization_id, course_class_id);

create index if not exists enrollments_organization_student_idx
  on public.enrollments(organization_id, student_id);

drop trigger if exists enrollments_set_updated_at on public.enrollments;
create trigger enrollments_set_updated_at
  before update on public.enrollments
  for each row execute function public.set_updated_at();

alter table public.enrollments enable row level security;

drop policy if exists "organization isolation for enrollments" on public.enrollments;
create policy "organization isolation for enrollments"
  on public.enrollments for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

grant select, insert, update, delete on public.enrollments to authenticated;
