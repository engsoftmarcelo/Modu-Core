alter table public.customers
  add column if not exists company text,
  add column if not exists whatsapp text,
  add column if not exists segment text;

alter table public.customers
  add constraint customers_company_length
    check (company is null or char_length(company) <= 160),
  add constraint customers_phone_length
    check (phone is null or char_length(phone) <= 30),
  add constraint customers_whatsapp_length
    check (whatsapp is null or char_length(whatsapp) <= 30),
  add constraint customers_email_length
    check (email is null or char_length(email) <= 254),
  add constraint customers_segment_length
    check (segment is null or char_length(segment) <= 80),
  add constraint customers_notes_length
    check (notes is null or char_length(notes) <= 2000);

create index if not exists customers_organization_name_idx
  on public.customers(organization_id, name);

create index if not exists customers_organization_status_idx
  on public.customers(organization_id, status);
