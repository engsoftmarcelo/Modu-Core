create unique index if not exists work_orders_id_organization_idx
  on public.work_orders(id, organization_id);

create table if not exists public.work_order_checklist_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  work_order_id uuid not null,
  item_key text not null check (
    item_key in (
      'arrived_on_site',
      'assessed_problem',
      'took_photos',
      'performed_service',
      'customer_approved',
      'finished'
    )
  ),
  label text not null check (char_length(label) between 2 and 120),
  position smallint not null check (position between 1 and 50),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_order_checklist_items_work_order_organization_fkey
    foreign key (work_order_id, organization_id)
    references public.work_orders(id, organization_id)
    on delete cascade,
  constraint work_order_checklist_items_completion_check check (
    (completed and completed_at is not null)
    or (not completed and completed_at is null)
  ),
  unique (work_order_id, item_key),
  unique (work_order_id, position)
);

create index if not exists work_order_checklist_items_organization_order_idx
  on public.work_order_checklist_items(organization_id, work_order_id, position);

drop trigger if exists work_order_checklist_items_set_updated_at
  on public.work_order_checklist_items;
create trigger work_order_checklist_items_set_updated_at
  before update on public.work_order_checklist_items
  for each row execute function public.set_updated_at();

create or replace function public.create_default_work_order_checklist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.work_order_checklist_items (
    organization_id,
    work_order_id,
    item_key,
    label,
    position
  )
  values
    (new.organization_id, new.id, 'arrived_on_site', 'Chegou ao local', 1),
    (new.organization_id, new.id, 'assessed_problem', 'Avaliou o problema', 2),
    (new.organization_id, new.id, 'took_photos', 'Tirou fotos', 3),
    (new.organization_id, new.id, 'performed_service', 'Executou o servico', 4),
    (new.organization_id, new.id, 'customer_approved', 'Cliente aprovou', 5),
    (new.organization_id, new.id, 'finished', 'Finalizou', 6)
  on conflict (work_order_id, item_key) do nothing;

  return new;
end;
$$;

drop trigger if exists work_orders_create_default_checklist
  on public.work_orders;
create trigger work_orders_create_default_checklist
  after insert on public.work_orders
  for each row execute function public.create_default_work_order_checklist();

insert into public.work_order_checklist_items (
  organization_id,
  work_order_id,
  item_key,
  label,
  position
)
select
  work_order.organization_id,
  work_order.id,
  checklist.item_key,
  checklist.label,
  checklist.position
from public.work_orders as work_order
cross join (
  values
    ('arrived_on_site', 'Chegou ao local', 1),
    ('assessed_problem', 'Avaliou o problema', 2),
    ('took_photos', 'Tirou fotos', 3),
    ('performed_service', 'Executou o servico', 4),
    ('customer_approved', 'Cliente aprovou', 5),
    ('finished', 'Finalizou', 6)
) as checklist(item_key, label, position)
on conflict (work_order_id, item_key) do nothing;

alter table public.work_order_checklist_items enable row level security;

drop policy if exists "organization can view work order checklist"
  on public.work_order_checklist_items;
create policy "organization can view work order checklist"
  on public.work_order_checklist_items for select to authenticated
  using (organization_id = public.current_organization_id());

drop policy if exists "organization can update work order checklist"
  on public.work_order_checklist_items;
create policy "organization can update work order checklist"
  on public.work_order_checklist_items for update to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

grant select on public.work_order_checklist_items to authenticated;
grant update (completed, completed_at)
  on public.work_order_checklist_items to authenticated;
