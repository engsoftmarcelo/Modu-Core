create table if not exists public.work_order_attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  work_order_id uuid not null,
  uploaded_by uuid references public.users(id) on delete set null,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 180),
  mime_type text not null check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  file_size bigint not null check (file_size between 1 and 5242880),
  upload_status text not null default 'pending' check (
    upload_status in ('pending', 'ready')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_order_attachments_work_order_organization_fkey
    foreign key (work_order_id, organization_id)
    references public.work_orders(id, organization_id)
    on delete cascade,
  constraint work_order_attachments_storage_path_check check (
    storage_path = organization_id::text || '/' || work_order_id::text || '/' ||
      id::text ||
      case mime_type
        when 'image/jpeg' then '.jpg'
        when 'image/png' then '.png'
        when 'image/webp' then '.webp'
      end
  )
);

create index if not exists work_order_attachments_organization_order_idx
  on public.work_order_attachments(
    organization_id,
    work_order_id,
    upload_status,
    created_at desc
  );

drop trigger if exists work_order_attachments_set_updated_at
  on public.work_order_attachments;
create trigger work_order_attachments_set_updated_at
  before update on public.work_order_attachments
  for each row execute function public.set_updated_at();

alter table public.work_order_attachments enable row level security;

drop policy if exists "organization can view work order attachments"
  on public.work_order_attachments;
create policy "organization can view work order attachments"
  on public.work_order_attachments for select to authenticated
  using (organization_id = public.current_organization_id());

drop policy if exists "organization can create work order attachments"
  on public.work_order_attachments;
create policy "organization can create work order attachments"
  on public.work_order_attachments for insert to authenticated
  with check (
    organization_id = public.current_organization_id()
    and uploaded_by = auth.uid()
  );

drop policy if exists "organization can update work order attachments"
  on public.work_order_attachments;
create policy "organization can update work order attachments"
  on public.work_order_attachments for update to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

drop policy if exists "organization can delete work order attachments"
  on public.work_order_attachments;
create policy "organization can delete work order attachments"
  on public.work_order_attachments for delete to authenticated
  using (organization_id = public.current_organization_id());

grant select, insert, delete on public.work_order_attachments to authenticated;
grant update (upload_status) on public.work_order_attachments to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'work-order-attachments',
  'work-order-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "organization can upload work order attachment objects"
  on storage.objects;
create policy "organization can upload work order attachment objects"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'work-order-attachments'
    and coalesce(array_length(storage.foldername(name), 1), 0) = 2
    and (storage.foldername(name))[1] = public.current_organization_id()::text
    and exists (
      select 1
      from public.work_order_attachments as attachment
      where attachment.storage_path = name
        and attachment.organization_id = public.current_organization_id()
        and attachment.upload_status = 'pending'
    )
  );

drop policy if exists "organization can view work order attachment objects"
  on storage.objects;
create policy "organization can view work order attachment objects"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'work-order-attachments'
    and (storage.foldername(name))[1] = public.current_organization_id()::text
    and exists (
      select 1
      from public.work_order_attachments as attachment
      where attachment.storage_path = name
        and attachment.organization_id = public.current_organization_id()
    )
  );

drop policy if exists "organization can delete work order attachment objects"
  on storage.objects;
create policy "organization can delete work order attachment objects"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'work-order-attachments'
    and (storage.foldername(name))[1] = public.current_organization_id()::text
    and exists (
      select 1
      from public.work_order_attachments as attachment
      where attachment.storage_path = name
        and attachment.organization_id = public.current_organization_id()
    )
  );
