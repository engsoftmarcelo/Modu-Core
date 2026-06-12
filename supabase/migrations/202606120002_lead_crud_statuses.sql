alter table public.leads
  drop constraint if exists leads_status_check;

update public.leads
set status = 'negotiation'
where status = 'qualified';

alter table public.leads
  add constraint leads_status_check
  check (
    status in (
      'new',
      'contacted',
      'proposal_sent',
      'negotiation',
      'won',
      'lost'
    )
  );

create index if not exists leads_organization_name_idx
  on public.leads(organization_id, name);
