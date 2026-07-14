create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  address text not null check (
    char_length(address) between 5 and 500
  ),
  service_type text not null check (
    char_length(service_type) between 2 and 160
  ),
  description text not null check (
    char_length(description) between 5 and 3000
  ),
  technician_name text not null check (
    char_length(technician_name) between 2 and 160
  ),
  visit_date date not null,
  status text not null default 'requested' check (
    status in (
      'requested',
      'quoted',
      'approved',
      'in_progress',
      'completed',
      'cancelled'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_orders_organization_status_idx
  on public.work_orders(organization_id, status);

create index if not exists work_orders_organization_visit_date_idx
  on public.work_orders(organization_id, visit_date);

create index if not exists work_orders_organization_customer_idx
  on public.work_orders(organization_id, customer_id);

drop trigger if exists work_orders_set_updated_at on public.work_orders;
create trigger work_orders_set_updated_at
  before update on public.work_orders
  for each row execute function public.set_updated_at();

alter table public.work_orders enable row level security;

drop policy if exists "organization isolation for work orders" on public.work_orders;
create policy "organization isolation for work orders"
  on public.work_orders for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

grant select, insert, update, delete on public.work_orders to authenticated;
