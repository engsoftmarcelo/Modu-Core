create table public.proposal_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  proposal_id uuid not null,
  service_id uuid,
  description text not null check (char_length(description) between 2 and 2000),
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  total numeric(14, 2) generated always as (
    quantity * unit_price - discount
  ) stored,
  position smallint not null default 1 check (position between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint proposal_items_discount_not_above_subtotal_check check (
    discount <= quantity * unit_price
  ),
  constraint proposal_items_proposal_organization_fkey
    foreign key (organization_id, proposal_id)
    references public.proposals(organization_id, id)
    on delete cascade,
  constraint proposal_items_service_organization_fkey
    foreign key (organization_id, service_id)
    references public.services(organization_id, id)
    on delete set null (service_id),
  unique (organization_id, proposal_id, position)
);

create index proposal_items_organization_service_idx
  on public.proposal_items(organization_id, service_id)
  where service_id is not null;

create trigger proposal_items_set_updated_at
  before update on public.proposal_items
  for each row execute function public.set_updated_at();

insert into public.proposal_items (
  organization_id,
  proposal_id,
  description,
  quantity,
  unit_price,
  discount,
  position,
  created_at,
  updated_at
)
select
  proposal.organization_id,
  proposal.id,
  coalesce(nullif(trim(proposal.services), ''), proposal.title),
  1,
  proposal.subtotal,
  0,
  1,
  proposal.created_at,
  proposal.updated_at
from public.proposals as proposal;

alter table public.proposals
  rename column services to service_summary;

update public.proposals
set total = subtotal - discount;

alter table public.proposals
  drop column total,
  add column total numeric(12, 2)
    generated always as (subtotal - discount) stored;

create or replace function public.recalculate_proposal_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_organization_id uuid;
  target_proposal_id uuid;
begin
  if tg_op = 'DELETE' then
    target_organization_id := old.organization_id;
    target_proposal_id := old.proposal_id;
  else
    target_organization_id := new.organization_id;
    target_proposal_id := new.proposal_id;
  end if;

  update public.proposals as proposal
  set
    subtotal = totals.subtotal,
    discount = least(proposal.discount, totals.subtotal),
    service_summary = totals.service_summary
  from (
    select
      coalesce(sum(item.total), 0)::numeric(12, 2) as subtotal,
      string_agg(item.description, E'\n' order by item.position) as service_summary
    from public.proposal_items as item
    where item.organization_id = target_organization_id
      and item.proposal_id = target_proposal_id
  ) as totals
  where proposal.organization_id = target_organization_id
    and proposal.id = target_proposal_id;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger proposal_items_recalculate_totals
  after insert or update or delete on public.proposal_items
  for each row execute function public.recalculate_proposal_totals();

update public.proposal_items
set updated_at = updated_at;

alter table public.proposal_items enable row level security;

create policy proposal_items_select_current
  on public.proposal_items for select to authenticated
  using (organization_id = public.current_organization_id());

grant select on public.proposal_items to authenticated;
revoke insert, update, delete on public.proposal_items from authenticated;

create or replace function public.save_simple_proposal(
  p_proposal_id uuid,
  p_customer_id uuid,
  p_proposal_title text,
  p_service_description text,
  p_proposal_value numeric,
  p_valid_until_date date,
  p_proposal_status text,
  p_proposal_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_org_id uuid := public.current_organization_id();
  saved_proposal_id uuid;
  first_item_id uuid;
begin
  if current_org_id is null or not public.current_user_can_write() then
    raise exception 'You cannot save proposals in this organization.'
      using errcode = '42501';
  end if;

  if p_proposal_status not in ('draft', 'sent', 'accepted', 'rejected', 'expired') then
    raise exception 'Invalid proposal status.' using errcode = '22023';
  end if;

  if p_proposal_value < 0 or p_proposal_value > 9999999999.99 then
    raise exception 'Invalid proposal value.' using errcode = '22003';
  end if;

  if not exists (
    select 1
    from public.customers as customer
    where customer.organization_id = current_org_id
      and customer.id = p_customer_id
  ) then
    raise exception 'Customer not found in this organization.'
      using errcode = '23503';
  end if;

  if p_proposal_id is null then
    insert into public.proposals (
      organization_id,
      customer_id,
      title,
      status,
      valid_until,
      subtotal,
      discount,
      notes
    )
    values (
      current_org_id,
      p_customer_id,
      trim(p_proposal_title),
      p_proposal_status,
      p_valid_until_date,
      0,
      0,
      nullif(trim(p_proposal_notes), '')
    )
    returning id into saved_proposal_id;
  else
    update public.proposals
    set
      customer_id = p_customer_id,
      title = trim(p_proposal_title),
      status = p_proposal_status,
      valid_until = p_valid_until_date,
      discount = 0,
      notes = nullif(trim(p_proposal_notes), '')
    where id = p_proposal_id
      and organization_id = current_org_id
    returning id into saved_proposal_id;

    if saved_proposal_id is null then
      raise exception 'Proposal not found in this organization.'
        using errcode = 'P0002';
    end if;
  end if;

  select item.id
  into first_item_id
  from public.proposal_items as item
  where item.organization_id = current_org_id
    and item.proposal_id = saved_proposal_id
    and item.position = 1;

  if first_item_id is null then
    insert into public.proposal_items (
      organization_id,
      proposal_id,
      description,
      quantity,
      unit_price,
      discount,
      position
    )
    values (
      current_org_id,
      saved_proposal_id,
      trim(p_service_description),
      1,
      p_proposal_value,
      0,
      1
    );
  else
    update public.proposal_items
    set
      description = trim(p_service_description),
      quantity = 1,
      unit_price = p_proposal_value,
      discount = 0,
      service_id = null
    where id = first_item_id;
  end if;

  return saved_proposal_id;
end;
$$;

create or replace function public.set_proposal_status(
  p_proposal_id uuid,
  p_proposal_status text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_id uuid;
begin
  if not public.current_user_can_write() then
    raise exception 'You cannot update proposals in this organization.'
      using errcode = '42501';
  end if;

  if p_proposal_status not in ('draft', 'sent', 'accepted', 'rejected', 'expired') then
    raise exception 'Invalid proposal status.' using errcode = '22023';
  end if;

  update public.proposals
  set status = p_proposal_status
  where id = p_proposal_id
    and organization_id = public.current_organization_id()
  returning id into updated_id;

  return updated_id is not null;
end;
$$;

create or replace function public.delete_proposal(p_proposal_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_id uuid;
begin
  if not public.current_user_can_administer() then
    raise exception 'Only owners and admins can delete proposals.'
      using errcode = '42501';
  end if;

  delete from public.proposals
  where id = p_proposal_id
    and organization_id = public.current_organization_id()
  returning id into deleted_id;

  return deleted_id is not null;
end;
$$;

revoke insert, update, delete on public.proposals from authenticated;
grant select on public.proposals to authenticated;

revoke all on function public.save_simple_proposal(
  uuid,
  uuid,
  text,
  text,
  numeric,
  date,
  text,
  text
) from public;
revoke all on function public.set_proposal_status(uuid, text) from public;
revoke all on function public.delete_proposal(uuid) from public;
revoke all on function public.recalculate_proposal_totals() from public;

grant execute on function public.save_simple_proposal(
  uuid,
  uuid,
  text,
  text,
  numeric,
  date,
  text,
  text
) to authenticated;
grant execute on function public.set_proposal_status(uuid, text)
  to authenticated;
grant execute on function public.delete_proposal(uuid)
  to authenticated;

create table public.professional_availability (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  professional_id uuid not null,
  weekday smallint not null check (weekday between 1 and 7),
  starts_at time not null,
  ends_at time not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_availability_time_check check (ends_at > starts_at),
  constraint professional_availability_professional_organization_fkey
    foreign key (organization_id, professional_id)
    references public.professionals(organization_id, id)
    on delete cascade,
  unique (organization_id, professional_id, weekday, starts_at, ends_at)
);

create index professional_availability_organization_professional_idx
  on public.professional_availability(organization_id, professional_id, weekday);

create trigger professional_availability_set_updated_at
  before update on public.professional_availability
  for each row execute function public.set_updated_at();

alter table public.professional_availability enable row level security;

create policy professional_availability_select_current
  on public.professional_availability for select to authenticated
  using (organization_id = public.current_organization_id());

create policy professional_availability_insert_admin
  on public.professional_availability for insert to authenticated
  with check (
    organization_id = public.current_organization_id()
    and public.current_user_can_administer()
  );

create policy professional_availability_update_admin
  on public.professional_availability for update to authenticated
  using (
    organization_id = public.current_organization_id()
    and public.current_user_can_administer()
  )
  with check (
    organization_id = public.current_organization_id()
    and public.current_user_can_administer()
  );

create policy professional_availability_delete_admin
  on public.professional_availability for delete to authenticated
  using (
    organization_id = public.current_organization_id()
    and public.current_user_can_administer()
  );

grant select, insert, update, delete
  on public.professional_availability to authenticated;

comment on column public.proposals.service_summary is
  'Trigger-maintained summary. proposal_items is canonical.';
comment on column public.professionals.available_hours is
  'Legacy display note. professional_availability is canonical for structured schedules.';

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public
  to service_role;
grant execute on all functions in schema public to service_role;

revoke truncate, trigger, references on all tables in schema public
  from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke truncate, trigger, references on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;

revoke all on function public.set_updated_at() from public;
