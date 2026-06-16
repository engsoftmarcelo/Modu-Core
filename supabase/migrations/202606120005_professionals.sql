create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  specialty text check (specialty is null or char_length(specialty) <= 120),
  available_hours text check (available_hours is null or char_length(available_hours) <= 500),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professionals_organization_id_id_key unique (organization_id, id)
);

alter table public.services
  add constraint services_organization_id_id_key unique (organization_id, id);

create table public.professional_services (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  professional_id uuid not null,
  service_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (professional_id, service_id),
  constraint professional_services_professional_fk
    foreign key (organization_id, professional_id)
    references public.professionals(organization_id, id)
    on delete cascade,
  constraint professional_services_service_fk
    foreign key (organization_id, service_id)
    references public.services(organization_id, id)
    on delete cascade
);

create index professionals_organization_active_idx
  on public.professionals(organization_id, active);
create index professional_services_organization_idx
  on public.professional_services(organization_id);
create index professional_services_service_idx
  on public.professional_services(service_id);

create trigger professionals_set_updated_at
  before update on public.professionals
  for each row execute function public.set_updated_at();

alter table public.professionals enable row level security;
alter table public.professional_services enable row level security;

create policy "organization isolation for professionals"
  on public.professionals for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "organization isolation for professional_services"
  on public.professional_services for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

grant select, insert, update, delete on public.professionals to authenticated;
grant select, insert, update, delete on public.professional_services to authenticated;
