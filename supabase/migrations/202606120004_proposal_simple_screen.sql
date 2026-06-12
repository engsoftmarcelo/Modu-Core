alter table public.proposals
  add column services text
  constraint proposals_services_length
  check (services is null or char_length(services) <= 2000);

alter table public.proposals
  add constraint proposals_notes_length
  check (notes is null or char_length(notes) <= 2000);

create index if not exists proposals_customer_idx
  on public.proposals(customer_id)
  where customer_id is not null;
