-- Work-order events are written exclusively by the record_work_order_event trigger.
revoke insert, update, delete, truncate, references, trigger
  on table public.work_order_events
  from anon, authenticated;

grant select on table public.work_order_events to authenticated;
