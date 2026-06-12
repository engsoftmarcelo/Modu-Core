alter table public.tasks
  add constraint tasks_single_related_record
  check (num_nonnulls(customer_id, lead_id) <= 1);

alter table public.tasks
  add constraint tasks_description_length
  check (description is null or char_length(description) <= 2000);

create index if not exists tasks_organization_due_at_idx
  on public.tasks(organization_id, due_at);

create index if not exists tasks_customer_idx
  on public.tasks(customer_id)
  where customer_id is not null;

create index if not exists tasks_lead_idx
  on public.tasks(lead_id)
  where lead_id is not null;
