create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  description text,
  workload_hours integer not null default 1 check (workload_hours between 1 and 10000),
  price numeric(12, 2) not null default 0 check (price >= 0),
  modality text not null default 'presencial'
    check (modality in ('presencial', 'online', 'hibrido')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

alter table public.courses
  add constraint courses_description_length
    check (description is null or char_length(description) <= 2000);

create index if not exists courses_organization_name_idx
  on public.courses(organization_id, name);

create index if not exists courses_organization_active_idx
  on public.courses(organization_id, active);

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

alter table public.courses enable row level security;

drop policy if exists "organization isolation for courses" on public.courses;
create policy "organization isolation for courses"
  on public.courses for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

grant select, insert, update, delete on public.courses to authenticated;
