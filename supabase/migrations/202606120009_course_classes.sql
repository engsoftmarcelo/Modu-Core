create table if not exists public.course_classes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher text not null check (char_length(teacher) between 2 and 160),
  start_date date not null,
  end_date date not null,
  weekdays text[] not null default '{}',
  class_time time not null,
  capacity integer not null check (capacity between 1 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_classes_dates_are_valid check (end_date >= start_date),
  constraint course_classes_weekdays_are_valid check (
    weekdays <@ array[
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ]::text[]
    and cardinality(weekdays) > 0
  )
);

create index if not exists course_classes_organization_course_idx
  on public.course_classes(organization_id, course_id);

create index if not exists course_classes_organization_start_idx
  on public.course_classes(organization_id, start_date);

drop trigger if exists course_classes_set_updated_at on public.course_classes;
create trigger course_classes_set_updated_at
  before update on public.course_classes
  for each row execute function public.set_updated_at();

alter table public.course_classes enable row level security;

drop policy if exists "organization isolation for course classes" on public.course_classes;
create policy "organization isolation for course classes"
  on public.course_classes for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

grant select, insert, update, delete on public.course_classes to authenticated;
