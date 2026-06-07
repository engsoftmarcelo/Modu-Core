create extension if not exists "pgcrypto";

create type public.business_model as enum (
  'b2b_services',
  'appointments',
  'courses',
  'work_orders'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (char_length(slug) between 2 and 140),
  business_model public.business_model not null default 'b2b_services',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  email text,
  phone text,
  document text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid references public.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 160),
  company text,
  email text,
  phone text,
  source text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  estimated_value numeric(12, 2) not null default 0 check (estimated_value >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assignee_id uuid references public.users(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null check (char_length(title) between 2 and 180),
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'done', 'cancelled')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  title text not null check (char_length(title) between 2 and 180),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'confirmed', 'completed', 'cancelled')),
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_dates_are_valid check (ends_at > starts_at)
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  title text not null check (char_length(title) between 2 and 180),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until date,
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint proposal_discount_is_valid check (discount <= subtotal)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  description text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create index customers_organization_idx on public.customers(organization_id);
create index leads_organization_status_idx on public.leads(organization_id, status);
create index tasks_organization_status_due_idx on public.tasks(organization_id, status, due_at);
create index appointments_organization_starts_idx on public.appointments(organization_id, starts_at);
create index proposals_organization_status_idx on public.proposals(organization_id, status);
create index services_organization_active_idx on public.services(organization_id, active);
create index users_organization_idx on public.users(organization_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();
create trigger proposals_set_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  organization_id uuid;
  organization_name text;
  organization_slug text;
  selected_model public.business_model;
begin
  organization_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'company_name'), ''),
    split_part(new.email, '@', 1)
  );

  organization_slug := trim(
    both '-' from regexp_replace(lower(organization_name), '[^a-z0-9]+', '-', 'g')
  );

  if organization_slug = '' then
    organization_slug := 'empresa';
  end if;

  organization_slug := organization_slug || '-' || left(replace(new.id::text, '-', ''), 8);

  selected_model := case new.raw_user_meta_data ->> 'business_model'
    when 'appointments' then 'appointments'::public.business_model
    when 'courses' then 'courses'::public.business_model
    when 'work_orders' then 'work_orders'::public.business_model
    else 'b2b_services'::public.business_model
  end;

  insert into public.organizations (name, slug, business_model)
  values (organization_name, organization_slug, selected_model)
  returning id into organization_id;

  insert into public.users (id, organization_id, full_name, role)
  values (
    new.id,
    organization_id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    'owner'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select organization_id
  from public.users
  where id = auth.uid()
  limit 1;
$$;

revoke all on function public.current_organization_id() from public;
grant execute on function public.current_organization_id() to authenticated;

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.tasks enable row level security;
alter table public.appointments enable row level security;
alter table public.proposals enable row level security;
alter table public.services enable row level security;

create policy "members can view their organization"
  on public.organizations for select to authenticated
  using (id = public.current_organization_id());

create policy "owners can update their organization"
  on public.organizations for update to authenticated
  using (
    id = public.current_organization_id()
    and exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'owner'
    )
  )
  with check (id = public.current_organization_id());

create policy "members can view organization users"
  on public.users for select to authenticated
  using (organization_id = public.current_organization_id());

create policy "users can update their own profile"
  on public.users for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and organization_id = public.current_organization_id()
  );

create policy "organization isolation for customers"
  on public.customers for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "organization isolation for leads"
  on public.leads for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "organization isolation for tasks"
  on public.tasks for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "organization isolation for appointments"
  on public.appointments for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "organization isolation for proposals"
  on public.proposals for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "organization isolation for services"
  on public.services for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

grant usage on schema public to authenticated;
grant select, update on public.organizations to authenticated;
grant select, update on public.users to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert, update, delete on public.proposals to authenticated;
grant select, insert, update, delete on public.services to authenticated;
