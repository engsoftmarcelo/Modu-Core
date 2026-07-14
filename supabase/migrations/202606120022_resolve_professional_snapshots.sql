create or replace function public.resolve_course_class_professional()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.teacher is distinct from old.teacher then
    select professional.id
    into new.professional_id
    from public.professionals as professional
    where professional.organization_id = new.organization_id
      and professional.active
      and lower(trim(professional.name)) = lower(trim(new.teacher))
    order by professional.created_at
    limit 1;
  end if;

  return new;
end;
$$;

create trigger course_classes_resolve_professional
  before insert or update of teacher
  on public.course_classes
  for each row execute function public.resolve_course_class_professional();

create or replace function public.resolve_work_order_professional()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
    or new.technician_name is distinct from old.technician_name
  then
    select professional.id
    into new.professional_id
    from public.professionals as professional
    where professional.organization_id = new.organization_id
      and professional.active
      and lower(trim(professional.name)) = lower(trim(new.technician_name))
    order by professional.created_at
    limit 1;
  end if;

  return new;
end;
$$;

create trigger work_orders_resolve_professional
  before insert or update of technician_name
  on public.work_orders
  for each row execute function public.resolve_work_order_professional();

revoke all on function public.resolve_course_class_professional() from public;
revoke all on function public.resolve_work_order_professional() from public;
