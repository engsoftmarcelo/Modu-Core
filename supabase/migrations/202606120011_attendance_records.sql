create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_class_id uuid not null references public.course_classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_date date not null,
  status text not null check (status in ('present', 'absent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, course_class_id, student_id, class_date)
);

create index if not exists attendance_records_organization_class_date_idx
  on public.attendance_records(organization_id, course_class_id, class_date);

create index if not exists attendance_records_organization_student_idx
  on public.attendance_records(organization_id, student_id);

drop trigger if exists attendance_records_set_updated_at on public.attendance_records;
create trigger attendance_records_set_updated_at
  before update on public.attendance_records
  for each row execute function public.set_updated_at();

alter table public.attendance_records enable row level security;

drop policy if exists "organization isolation for attendance records" on public.attendance_records;
create policy "organization isolation for attendance records"
  on public.attendance_records for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

grant select, insert, update, delete on public.attendance_records to authenticated;
