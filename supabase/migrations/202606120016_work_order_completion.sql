alter table public.work_orders
  add column if not exists completion_approved_by text,
  add column if not exists completion_notes text,
  add column if not exists completion_accepted boolean not null default false,
  add column if not exists completed_at timestamptz;

alter table public.work_orders
  drop constraint if exists work_orders_completion_confirmation_check;

alter table public.work_orders
  add constraint work_orders_completion_confirmation_check check (
    (
      completion_approved_by is null
      and completion_notes is null
      and completion_accepted = false
      and completed_at is null
    )
    or (
      completion_approved_by is not null
      and char_length(completion_approved_by) between 2 and 160
      and (
        completion_notes is null
        or char_length(completion_notes) <= 2000
      )
      and completion_accepted = true
      and completed_at is not null
    )
  );
