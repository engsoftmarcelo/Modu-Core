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

grant execute on function public.save_simple_proposal(
  uuid,
  uuid,
  text,
  text,
  numeric,
  date,
  text,
  text
) to authenticated, service_role;
