-- Liga os agendamentos ao profissional e ao servico do catalogo.
-- FKs simples com on delete set null espelham customer_id: ao remover um
-- profissional ou servico, o historico do agendamento e preservado.
alter table public.appointments
  add column professional_id uuid references public.professionals(id) on delete set null,
  add column service_id uuid references public.services(id) on delete set null;

create index appointments_professional_idx
  on public.appointments(professional_id)
  where professional_id is not null;

create index appointments_service_idx
  on public.appointments(service_id)
  where service_id is not null;
