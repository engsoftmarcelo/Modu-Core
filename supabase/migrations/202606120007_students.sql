create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  whatsapp text,
  email text,
  cpf text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.students
  add constraint students_whatsapp_length
    check (whatsapp is null or char_length(whatsapp) <= 30),
  add constraint students_email_length
    check (email is null or char_length(email) <= 254),
  add constraint students_cpf_length
    check (cpf is null or char_length(cpf) <= 20),
  add constraint students_notes_length
    check (notes is null or char_length(notes) <= 2000);

create index if not exists students_organization_name_idx
  on public.students(organization_id, name);

create index if not exists students_organization_status_idx
  on public.students(organization_id, status);

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

alter table public.students enable row level security;

drop policy if exists "organization isolation for students" on public.students;
create policy "organization isolation for students"
  on public.students for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

grant select, insert, update, delete on public.students to authenticated;
