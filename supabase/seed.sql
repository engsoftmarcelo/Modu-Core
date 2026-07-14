do $demo_seed$
begin
  perform set_config('TimeZone', 'America/Sao_Paulo', true);

-- All demo accounts use the password documented in docs/DADOS_DEMO.md.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'de000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'demo.agencia@moducore.local',
    crypt('ModuCore@2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Marina Costa","company_name":"Agencia Vitrine Promocoes","business_model":"b2b_services"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'de000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'demo.salao@moducore.local',
    crypt('ModuCore@2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Camila Rocha","company_name":"Studio Aurora Beleza","business_model":"appointments"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'de000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'demo.curso@moducore.local',
    crypt('ModuCore@2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Rafael Lima","company_name":"Escola ByteUp Informatica","business_model":"courses"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'de000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'demo.manutencao@moducore.local',
    crypt('ModuCore@2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Carlos Mendes","company_name":"ProntoLar Manutencao","business_model":"work_orders"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do update
set
  aud = excluded.aud,
  role = excluded.role,
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = coalesce(auth.users.email_confirmed_at, excluded.email_confirmed_at),
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

with demo_identities(user_id, email) as (
  values
    ('de000000-0000-4000-8000-000000000001'::uuid, 'demo.agencia@moducore.local'),
    ('de000000-0000-4000-8000-000000000002'::uuid, 'demo.salao@moducore.local'),
    ('de000000-0000-4000-8000-000000000003'::uuid, 'demo.curso@moducore.local'),
    ('de000000-0000-4000-8000-000000000004'::uuid, 'demo.manutencao@moducore.local')
)
insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  demo.user_id,
  demo.user_id::text,
  demo.user_id,
  jsonb_build_object(
    'sub', demo.user_id::text,
    'email', demo.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  now(),
  now()
from demo_identities as demo
on conflict (provider_id, provider) do update
set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  updated_at = now();

create temporary table seed_demo_organizations (
  tenant_key text primary key,
  user_id uuid not null,
  organization_id uuid not null
) on commit drop;

insert into pg_temp.seed_demo_organizations (tenant_key, user_id, organization_id)
select demo.tenant_key, demo.user_id, profile.organization_id
from (
  values
    ('agency', 'de000000-0000-4000-8000-000000000001'::uuid),
    ('salon', 'de000000-0000-4000-8000-000000000002'::uuid),
    ('course', 'de000000-0000-4000-8000-000000000003'::uuid),
    ('maintenance', 'de000000-0000-4000-8000-000000000004'::uuid)
) as demo(tenant_key, user_id)
join public.users as profile on profile.id = demo.user_id;

  if (select count(*) from pg_temp.seed_demo_organizations) <> 4 then
    raise exception 'The four demo organizations could not be prepared.';
  end if;

update public.organizations as organization
set
  name = demo.name,
  slug = demo.slug,
  business_model = demo.business_model::public.business_model
from (
  values
    ('agency', 'Agencia Vitrine Promocoes', 'demo-agencia-vitrine', 'b2b_services'),
    ('salon', 'Studio Aurora Beleza', 'demo-studio-aurora', 'appointments'),
    ('course', 'Escola ByteUp Informatica', 'demo-escola-byteup', 'courses'),
    ('maintenance', 'ProntoLar Manutencao', 'demo-prontolar-manutencao', 'work_orders')
) as demo(tenant_key, name, slug, business_model)
join pg_temp.seed_demo_organizations as context
  on context.tenant_key = demo.tenant_key
where organization.id = context.organization_id;

update public.users as profile
set
  full_name = demo.full_name,
  role = 'owner'
from (
  values
    ('agency', 'Marina Costa'),
    ('salon', 'Camila Rocha'),
    ('course', 'Rafael Lima'),
    ('maintenance', 'Carlos Mendes')
) as demo(tenant_key, full_name)
join pg_temp.seed_demo_organizations as context
  on context.tenant_key = demo.tenant_key
where profile.id = context.user_id;

update public.organization_memberships as membership
set
  role = 'owner',
  is_default = true
from pg_temp.seed_demo_organizations as context
where membership.organization_id = context.organization_id
  and membership.user_id = context.user_id;

-- Shared customer records give every demo realistic contacts and history.
insert into public.customers (
  id,
  organization_id,
  name,
  email,
  phone,
  whatsapp,
  company,
  segment,
  notes,
  status
)
select
  demo.id,
  context.organization_id,
  demo.name,
  demo.email,
  demo.phone,
  demo.whatsapp,
  demo.company,
  demo.segment,
  demo.notes,
  demo.status
from (
  values
    ('agency', 'de110000-0000-4000-8000-000000000101'::uuid, 'Fernanda Alves', 'fernanda@mercadocentral.demo', '(11) 3333-1101', '5511991111101', 'Rede Mercado Central', 'Varejo', 'Cliente recorrente de ativacoes em loja.', 'active'),
    ('agency', 'de110000-0000-4000-8000-000000000102'::uuid, 'Joao Pedro Nunes', 'joao@movimento.demo', '(11) 3333-1102', '5511991111102', 'Academia Movimento', 'Saude e bem-estar', 'Prefere contato pelo WhatsApp no periodo da tarde.', 'active'),
    ('agency', 'de110000-0000-4000-8000-000000000103'::uuid, 'Bianca Souza', 'bianca@horizonte.demo', '(11) 3333-1103', '5511991111103', 'Construtora Horizonte', 'Construcao', 'Aguardando proposta para lancamento imobiliario.', 'active'),
    ('salon', 'de210000-0000-4000-8000-000000000201'::uuid, 'Larissa Almeida', 'larissa@cliente.demo', '(11) 98888-2201', '5511988882201', null, 'Beleza', 'Coloracao sem amonia. Retorno recomendado em 30 dias.', 'active'),
    ('salon', 'de210000-0000-4000-8000-000000000202'::uuid, 'Patricia Oliveira', 'patricia@cliente.demo', '(11) 98888-2202', '5511988882202', null, 'Beleza', 'Prefere horarios pela manha.', 'active'),
    ('salon', 'de210000-0000-4000-8000-000000000203'::uuid, 'Renata Cardoso', 'renata@cliente.demo', '(11) 98888-2203', '5511988882203', null, 'Estetica', 'Pele sensivel; utilizar produtos hipoalergenicos.', 'active'),
    ('salon', 'de210000-0000-4000-8000-000000000204'::uuid, 'Sonia Martins', 'sonia@cliente.demo', '(11) 98888-2204', '5511988882204', null, 'Beleza', 'Cliente indicada pela Larissa.', 'active'),
    ('course', 'de310000-0000-4000-8000-000000000301'::uuid, 'Ana Beatriz Santos', 'ana.aluna@byteup.demo', '(11) 97777-3301', '5511977773301', null, 'Educacao', 'Interessada em Excel para recolocacao profissional.', 'active'),
    ('course', 'de310000-0000-4000-8000-000000000302'::uuid, 'Bruno Henrique Lima', 'bruno.aluno@byteup.demo', '(11) 97777-3302', '5511977773302', null, 'Educacao', 'Aluno da turma noturna.', 'active'),
    ('course', 'de310000-0000-4000-8000-000000000303'::uuid, 'Carla Menezes', 'carla.aluna@byteup.demo', '(11) 97777-3303', '5511977773303', null, 'Educacao', 'Concluiu informatica basica com frequencia integral.', 'active'),
    ('maintenance', 'de410000-0000-4000-8000-000000000401'::uuid, 'Roberto Araujo', 'roberto@cliente.demo', '(11) 96666-4401', '5511966664401', 'Condominio Jardim Azul', 'Condominios', 'Autoriza entrada pela portaria principal.', 'active'),
    ('maintenance', 'de410000-0000-4000-8000-000000000402'::uuid, 'Daniela Freire', 'daniela@cliente.demo', '(11) 96666-4402', '5511966664402', 'Cafe da Praca', 'Alimentacao', 'Atendimento preferencial antes das 10h.', 'active'),
    ('maintenance', 'de410000-0000-4000-8000-000000000403'::uuid, 'Marcio Teixeira', 'marcio@cliente.demo', '(11) 96666-4403', '5511966664403', null, 'Residencial', 'Casa com acesso lateral para equipamentos.', 'active'),
    ('maintenance', 'de410000-0000-4000-8000-000000000404'::uuid, 'Vanessa Ribeiro', 'vanessa@cliente.demo', '(11) 96666-4404', '5511966664404', 'Papelaria Criativa', 'Varejo', 'Servico concluido e aprovado pela responsavel.', 'active')
) as demo(
  tenant_key,
  id,
  name,
  email,
  phone,
  whatsapp,
  company,
  segment,
  notes,
  status
)
join pg_temp.seed_demo_organizations as context
  on context.tenant_key = demo.tenant_key
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  company = excluded.company,
  segment = excluded.segment,
  notes = excluded.notes,
  status = excluded.status;

insert into public.services (
  id,
  organization_id,
  name,
  description,
  price,
  duration_minutes,
  active
)
select
  demo.id,
  context.organization_id,
  demo.name,
  demo.description,
  demo.price,
  demo.duration_minutes,
  true
from (
  values
    ('agency', 'de140000-0000-4000-8000-000000000401'::uuid, 'Acao promocional em loja', 'Planejamento e equipe para ativacao de marca no ponto de venda.', 4500::numeric, 480),
    ('agency', 'de140000-0000-4000-8000-000000000402'::uuid, 'Equipe de degustacao', 'Promotores, supervisao e relatorio fotografico.', 2800::numeric, 360),
    ('agency', 'de140000-0000-4000-8000-000000000403'::uuid, 'Cobertura de evento', 'Recepcao, apoio operacional e registro da acao.', 3600::numeric, 480),
    ('salon', 'de220000-0000-4000-8000-000000000201'::uuid, 'Corte feminino', 'Corte, lavagem e finalizacao.', 90::numeric, 60),
    ('salon', 'de220000-0000-4000-8000-000000000202'::uuid, 'Manicure', 'Cuidado completo das unhas e esmaltacao.', 45::numeric, 45),
    ('salon', 'de220000-0000-4000-8000-000000000203'::uuid, 'Coloracao', 'Coloracao completa com avaliacao previa.', 220::numeric, 120),
    ('salon', 'de220000-0000-4000-8000-000000000204'::uuid, 'Limpeza de pele', 'Higienizacao profunda e hidratacao.', 160::numeric, 90),
    ('maintenance', 'de440000-0000-4000-8000-000000000401'::uuid, 'Manutencao de ar-condicionado', 'Limpeza, diagnostico e manutencao preventiva.', 280::numeric, 120),
    ('maintenance', 'de440000-0000-4000-8000-000000000402'::uuid, 'Reparo eletrico', 'Diagnostico e correcao de instalacoes eletricas.', 220::numeric, 120),
    ('maintenance', 'de440000-0000-4000-8000-000000000403'::uuid, 'Pequenos reparos', 'Hidraulica, fixacoes e manutencao residencial.', 180::numeric, 90)
) as demo(tenant_key, id, name, description, price, duration_minutes)
join pg_temp.seed_demo_organizations as context
  on context.tenant_key = demo.tenant_key
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  duration_minutes = excluded.duration_minutes,
  active = true;

insert into public.professionals (
  id,
  organization_id,
  name,
  specialty,
  available_hours,
  active
)
select
  demo.id,
  context.organization_id,
  demo.name,
  demo.specialty,
  demo.available_hours,
  true
from (
  values
    ('salon', 'de230000-0000-4000-8000-000000000201'::uuid, 'Julia Ferreira', 'Cabeleireira e colorista', 'Segunda a sabado, das 09:00 as 18:00'),
    ('salon', 'de230000-0000-4000-8000-000000000202'::uuid, 'Renata Gomes', 'Esteticista e manicure', 'Terca a sabado, das 10:00 as 19:00'),
    ('course', 'de330000-0000-4000-8000-000000000301'::uuid, 'Professor Rafael Lima', 'Informatica e produtividade', 'Segundas e quartas, das 19:00 as 21:00'),
    ('maintenance', 'de420000-0000-4000-8000-000000000401'::uuid, 'Eduardo Martins', 'Eletrica e climatizacao', 'Segunda a sexta, das 08:00 as 18:00'),
    ('maintenance', 'de420000-0000-4000-8000-000000000402'::uuid, 'Paulo Henrique', 'Hidraulica e reparos gerais', 'Segunda a sabado, das 08:00 as 17:00')
) as demo(tenant_key, id, name, specialty, available_hours)
join pg_temp.seed_demo_organizations as context
  on context.tenant_key = demo.tenant_key
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  name = excluded.name,
  specialty = excluded.specialty,
  available_hours = excluded.available_hours,
  active = true;

insert into public.professional_services (
  organization_id,
  professional_id,
  service_id
)
select context.organization_id, demo.professional_id, demo.service_id
from (
  values
    ('salon', 'de230000-0000-4000-8000-000000000201'::uuid, 'de220000-0000-4000-8000-000000000201'::uuid),
    ('salon', 'de230000-0000-4000-8000-000000000201'::uuid, 'de220000-0000-4000-8000-000000000203'::uuid),
    ('salon', 'de230000-0000-4000-8000-000000000202'::uuid, 'de220000-0000-4000-8000-000000000202'::uuid),
    ('salon', 'de230000-0000-4000-8000-000000000202'::uuid, 'de220000-0000-4000-8000-000000000204'::uuid),
    ('maintenance', 'de420000-0000-4000-8000-000000000401'::uuid, 'de440000-0000-4000-8000-000000000401'::uuid),
    ('maintenance', 'de420000-0000-4000-8000-000000000401'::uuid, 'de440000-0000-4000-8000-000000000402'::uuid),
    ('maintenance', 'de420000-0000-4000-8000-000000000402'::uuid, 'de440000-0000-4000-8000-000000000403'::uuid)
) as demo(tenant_key, professional_id, service_id)
join pg_temp.seed_demo_organizations as context
  on context.tenant_key = demo.tenant_key
on conflict (professional_id, service_id) do update
set organization_id = excluded.organization_id;

insert into public.professional_availability (
  id,
  organization_id,
  professional_id,
  weekday,
  starts_at,
  ends_at,
  active
)
select
  demo.id,
  context.organization_id,
  demo.professional_id,
  demo.weekday,
  demo.starts_at,
  demo.ends_at,
  true
from (
  values
    ('salon', 'de231000-0000-4000-8000-000000000211'::uuid, 'de230000-0000-4000-8000-000000000201'::uuid, 1::smallint, '09:00'::time, '18:00'::time),
    ('salon', 'de231000-0000-4000-8000-000000000212'::uuid, 'de230000-0000-4000-8000-000000000201'::uuid, 3::smallint, '09:00'::time, '18:00'::time),
    ('salon', 'de231000-0000-4000-8000-000000000213'::uuid, 'de230000-0000-4000-8000-000000000201'::uuid, 5::smallint, '09:00'::time, '18:00'::time),
    ('salon', 'de231000-0000-4000-8000-000000000221'::uuid, 'de230000-0000-4000-8000-000000000202'::uuid, 2::smallint, '10:00'::time, '19:00'::time),
    ('salon', 'de231000-0000-4000-8000-000000000222'::uuid, 'de230000-0000-4000-8000-000000000202'::uuid, 4::smallint, '10:00'::time, '19:00'::time),
    ('salon', 'de231000-0000-4000-8000-000000000223'::uuid, 'de230000-0000-4000-8000-000000000202'::uuid, 6::smallint, '09:00'::time, '16:00'::time),
    ('course', 'de331000-0000-4000-8000-000000000311'::uuid, 'de330000-0000-4000-8000-000000000301'::uuid, 1::smallint, '19:00'::time, '21:00'::time),
    ('course', 'de331000-0000-4000-8000-000000000312'::uuid, 'de330000-0000-4000-8000-000000000301'::uuid, 3::smallint, '19:00'::time, '21:00'::time),
    ('maintenance', 'de421000-0000-4000-8000-000000000411'::uuid, 'de420000-0000-4000-8000-000000000401'::uuid, 1::smallint, '08:00'::time, '18:00'::time),
    ('maintenance', 'de421000-0000-4000-8000-000000000412'::uuid, 'de420000-0000-4000-8000-000000000402'::uuid, 2::smallint, '08:00'::time, '17:00'::time)
) as demo(
  tenant_key,
  id,
  professional_id,
  weekday,
  starts_at,
  ends_at
)
join pg_temp.seed_demo_organizations as context
  on context.tenant_key = demo.tenant_key
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  professional_id = excluded.professional_id,
  weekday = excluded.weekday,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  active = true;

-- B2B agency: customers, pipeline, follow-ups and normalized proposals.
insert into public.leads (
  id,
  organization_id,
  owner_id,
  name,
  company,
  email,
  phone,
  source,
  status,
  estimated_value,
  notes
)
select
  demo.id,
  context.organization_id,
  context.user_id,
  demo.name,
  demo.company,
  demo.email,
  demo.phone,
  demo.source,
  demo.status,
  demo.estimated_value,
  demo.notes
from (
  values
    ('de120000-0000-4000-8000-000000000201'::uuid, 'Paula Martins', 'Farmacia Bem-Estar', 'paula@bemestar.demo', '5511992222201', 'Instagram', 'new', 6500::numeric, 'Pediu ideias para campanha de inauguracao.'),
    ('de120000-0000-4000-8000-000000000202'::uuid, 'Diego Castro', 'Rede Bom Preco', 'diego@bompreco.demo', '5511992222202', 'Indicacao', 'contacted', 12000::numeric, 'Reuniao de briefing realizada.'),
    ('de120000-0000-4000-8000-000000000203'::uuid, 'Luciana Freitas', 'Shopping Parque Sul', 'luciana@parquesul.demo', '5511992222203', 'Site', 'proposal_sent', 18500::numeric, 'Proposta enviada para evento de ferias.'),
    ('de120000-0000-4000-8000-000000000204'::uuid, 'Andre Ribeiro', 'Construtora Horizonte', 'andre@horizonte.demo', '5511992222204', 'Networking', 'negotiation', 24000::numeric, 'Negociando equipe para tres finais de semana.'),
    ('de120000-0000-4000-8000-000000000205'::uuid, 'Marcos Tavares', 'Supermercado Avenida', 'marcos@avenida.demo', '5511992222205', 'Indicacao', 'won', 9800::numeric, 'Contrato aprovado para campanha mensal.')
) as demo(id, name, company, email, phone, source, status, estimated_value, notes)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'agency'
) as context
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  owner_id = excluded.owner_id,
  name = excluded.name,
  company = excluded.company,
  email = excluded.email,
  phone = excluded.phone,
  source = excluded.source,
  status = excluded.status,
  estimated_value = excluded.estimated_value,
  notes = excluded.notes;

insert into public.tasks (
  id,
  organization_id,
  assignee_id,
  customer_id,
  lead_id,
  title,
  description,
  status,
  priority,
  due_at
)
select
  demo.id,
  context.organization_id,
  context.user_id,
  case when demo.related_type = 'customer' then demo.related_id end,
  case when demo.related_type = 'lead' then demo.related_id end,
  demo.title,
  demo.description,
  demo.status,
  demo.priority,
  demo.due_at
from (
  values
    ('de130000-0000-4000-8000-000000000301'::uuid, 'lead', 'de120000-0000-4000-8000-000000000201'::uuid, 'Responder briefing da Farmacia Bem-Estar', 'Enviar tres opcoes de ativacao e estimativa inicial.', 'pending', 'high', now() + interval '1 day'),
    ('de130000-0000-4000-8000-000000000302'::uuid, 'lead', 'de120000-0000-4000-8000-000000000203'::uuid, 'Confirmar recebimento da proposta', 'Fazer follow-up com Luciana pelo WhatsApp.', 'in_progress', 'high', now() + interval '4 hours'),
    ('de130000-0000-4000-8000-000000000303'::uuid, 'lead', 'de120000-0000-4000-8000-000000000204'::uuid, 'Revisar escala da equipe', 'Validar disponibilidade para os tres finais de semana.', 'pending', 'medium', now() + interval '3 days'),
    ('de130000-0000-4000-8000-000000000304'::uuid, 'customer', 'de110000-0000-4000-8000-000000000101'::uuid, 'Enviar relatorio da ultima acao', 'Consolidar fotos e resultados da campanha.', 'done', 'medium', now() - interval '2 days')
) as demo(
  id,
  related_type,
  related_id,
  title,
  description,
  status,
  priority,
  due_at
)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'agency'
) as context
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  assignee_id = excluded.assignee_id,
  customer_id = excluded.customer_id,
  lead_id = excluded.lead_id,
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  priority = excluded.priority,
  due_at = excluded.due_at;

insert into public.proposals (
  id,
  organization_id,
  customer_id,
  title,
  status,
  valid_until,
  subtotal,
  discount,
  notes
)
select
  demo.id,
  context.organization_id,
  demo.customer_id,
  demo.title,
  demo.status,
  demo.valid_until,
  0,
  0,
  demo.notes
from (
  values
    ('de150000-0000-4000-8000-000000000501'::uuid, 'de110000-0000-4000-8000-000000000101'::uuid, 'Campanha de degustacao - julho', 'accepted', current_date + 30, 'Aprovada por Fernanda via WhatsApp.'),
    ('de150000-0000-4000-8000-000000000502'::uuid, 'de110000-0000-4000-8000-000000000103'::uuid, 'Lancamento Residencial Horizonte', 'sent', current_date + 15, 'Inclui equipe, supervisao e relatorio final.')
) as demo(id, customer_id, title, status, valid_until, notes)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'agency'
) as context
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  customer_id = excluded.customer_id,
  title = excluded.title,
  status = excluded.status,
  valid_until = excluded.valid_until,
  notes = excluded.notes;

insert into public.proposal_items (
  id,
  organization_id,
  proposal_id,
  service_id,
  description,
  quantity,
  unit_price,
  discount,
  position
)
select
  demo.id,
  context.organization_id,
  demo.proposal_id,
  demo.service_id,
  demo.description,
  demo.quantity,
  demo.unit_price,
  demo.discount,
  demo.position
from (
  values
    ('de151000-0000-4000-8000-000000000511'::uuid, 'de150000-0000-4000-8000-000000000501'::uuid, 'de140000-0000-4000-8000-000000000402'::uuid, 'Equipe de degustacao para duas unidades', 2::numeric, 2800::numeric, 300::numeric, 1::smallint),
    ('de151000-0000-4000-8000-000000000512'::uuid, 'de150000-0000-4000-8000-000000000501'::uuid, 'de140000-0000-4000-8000-000000000403'::uuid, 'Supervisao e cobertura fotografica', 1::numeric, 1800::numeric, 0::numeric, 2::smallint),
    ('de151000-0000-4000-8000-000000000521'::uuid, 'de150000-0000-4000-8000-000000000502'::uuid, 'de140000-0000-4000-8000-000000000401'::uuid, 'Acao promocional de lancamento', 3::numeric, 4500::numeric, 500::numeric, 1::smallint),
    ('de151000-0000-4000-8000-000000000522'::uuid, 'de150000-0000-4000-8000-000000000502'::uuid, 'de140000-0000-4000-8000-000000000403'::uuid, 'Recepcao e apoio operacional', 1::numeric, 3600::numeric, 0::numeric, 2::smallint)
) as demo(
  id,
  proposal_id,
  service_id,
  description,
  quantity,
  unit_price,
  discount,
  position
)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'agency'
) as context
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  proposal_id = excluded.proposal_id,
  service_id = excluded.service_id,
  description = excluded.description,
  quantity = excluded.quantity,
  unit_price = excluded.unit_price,
  discount = excluded.discount,
  position = excluded.position;

-- Salon: past services and future bookings keep customer history useful.
insert into public.appointments (
  id,
  organization_id,
  customer_id,
  professional_id,
  service_id,
  title,
  starts_at,
  ends_at,
  status,
  location,
  notes
)
select
  demo.id,
  context.organization_id,
  demo.customer_id,
  demo.professional_id,
  demo.service_id,
  demo.title,
  demo.starts_at,
  demo.ends_at,
  demo.status,
  'Studio Aurora - Sala 1',
  demo.notes
from (
  values
    ('de240000-0000-4000-8000-000000000201'::uuid, 'de210000-0000-4000-8000-000000000201'::uuid, 'de230000-0000-4000-8000-000000000201'::uuid, 'de220000-0000-4000-8000-000000000203'::uuid, 'Coloracao - Larissa Almeida', date_trunc('day', now()) - interval '14 days' + interval '10 hours', date_trunc('day', now()) - interval '14 days' + interval '12 hours', 'completed', 'Cliente satisfeita. Agendar retoque em 30 dias.'),
    ('de240000-0000-4000-8000-000000000202'::uuid, 'de210000-0000-4000-8000-000000000202'::uuid, 'de230000-0000-4000-8000-000000000201'::uuid, 'de220000-0000-4000-8000-000000000201'::uuid, 'Corte feminino - Patricia', date_trunc('day', now()) - interval '2 days' + interval '9 hours', date_trunc('day', now()) - interval '2 days' + interval '10 hours', 'completed', 'Finalizacao com escova.'),
    ('de240000-0000-4000-8000-000000000203'::uuid, 'de210000-0000-4000-8000-000000000203'::uuid, 'de230000-0000-4000-8000-000000000202'::uuid, 'de220000-0000-4000-8000-000000000204'::uuid, 'Limpeza de pele - Renata', date_trunc('day', now()) + interval '1 day 14 hours', date_trunc('day', now()) + interval '1 day 15 hours 30 minutes', 'confirmed', 'Confirmado pelo WhatsApp.'),
    ('de240000-0000-4000-8000-000000000204'::uuid, 'de210000-0000-4000-8000-000000000204'::uuid, 'de230000-0000-4000-8000-000000000202'::uuid, 'de220000-0000-4000-8000-000000000202'::uuid, 'Manicure - Sonia', date_trunc('day', now()) + interval '2 days 11 hours', date_trunc('day', now()) + interval '2 days 11 hours 45 minutes', 'scheduled', 'Primeiro atendimento.'),
    ('de240000-0000-4000-8000-000000000205'::uuid, 'de210000-0000-4000-8000-000000000201'::uuid, 'de230000-0000-4000-8000-000000000201'::uuid, 'de220000-0000-4000-8000-000000000203'::uuid, 'Retoque de coloracao - Larissa', date_trunc('day', now()) + interval '16 days 10 hours', date_trunc('day', now()) + interval '16 days 12 hours', 'confirmed', 'Proximo retorno apos a ultima coloracao.')
) as demo(
  id,
  customer_id,
  professional_id,
  service_id,
  title,
  starts_at,
  ends_at,
  status,
  notes
)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'salon'
) as context
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  customer_id = excluded.customer_id,
  professional_id = excluded.professional_id,
  service_id = excluded.service_id,
  title = excluded.title,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  location = excluded.location,
  notes = excluded.notes;

-- Course school: current class, completed class, enrollments and attendance.
create temporary table seed_demo_dates on commit drop as
select
  current_date - ((extract(isodow from current_date)::integer - 1) + 7)
    as previous_monday;

insert into public.courses (
  id,
  organization_id,
  name,
  description,
  workload_hours,
  price,
  modality,
  active
)
select
  demo.id,
  context.organization_id,
  demo.name,
  demo.description,
  demo.workload_hours,
  demo.price,
  demo.modality,
  true
from (
  values
    ('de340000-0000-4000-8000-000000000301'::uuid, 'Excel para o Mercado de Trabalho', 'Planilhas, formulas, graficos e rotinas administrativas.', 40, 497::numeric, 'presencial'),
    ('de340000-0000-4000-8000-000000000302'::uuid, 'Informatica Basica', 'Computador, internet, documentos e seguranca digital.', 24, 297::numeric, 'hibrido')
) as demo(id, name, description, workload_hours, price, modality)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'course'
) as context
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  name = excluded.name,
  description = excluded.description,
  workload_hours = excluded.workload_hours,
  price = excluded.price,
  modality = excluded.modality,
  active = true;

insert into public.course_classes (
  id,
  organization_id,
  course_id,
  professional_id,
  teacher,
  start_date,
  end_date,
  weekdays,
  class_time,
  capacity
)
select
  demo.id,
  context.organization_id,
  demo.course_id,
  'de330000-0000-4000-8000-000000000301',
  'Professor Rafael Lima',
  dates.previous_monday + demo.start_offset,
  dates.previous_monday + demo.end_offset,
  array['monday', 'wednesday'],
  demo.class_time,
  demo.capacity
from (
  values
    ('de350000-0000-4000-8000-000000000301'::uuid, 'de340000-0000-4000-8000-000000000301'::uuid, 0, 56, '19:00'::time, 18),
    ('de350000-0000-4000-8000-000000000302'::uuid, 'de340000-0000-4000-8000-000000000302'::uuid, -70, -14, '09:00'::time, 15)
) as demo(id, course_id, start_offset, end_offset, class_time, capacity)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'course'
) as context
cross join pg_temp.seed_demo_dates as dates
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  course_id = excluded.course_id,
  professional_id = excluded.professional_id,
  teacher = excluded.teacher,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  weekdays = excluded.weekdays,
  class_time = excluded.class_time,
  capacity = excluded.capacity;

insert into public.students (
  id,
  organization_id,
  customer_id,
  name,
  whatsapp,
  email,
  cpf,
  notes,
  status
)
select
  demo.id,
  context.organization_id,
  demo.customer_id,
  demo.name,
  demo.whatsapp,
  demo.email,
  demo.cpf,
  demo.notes,
  'active'
from (
  values
    ('de320000-0000-4000-8000-000000000301'::uuid, 'de310000-0000-4000-8000-000000000301'::uuid, 'Ana Beatriz Santos', '5511977773301', 'ana.aluna@byteup.demo', '111.222.333-01', 'Matricula realizada por indicacao.'),
    ('de320000-0000-4000-8000-000000000302'::uuid, 'de310000-0000-4000-8000-000000000302'::uuid, 'Bruno Henrique Lima', '5511977773302', 'bruno.aluno@byteup.demo', null, 'Prefere materiais digitais.'),
    ('de320000-0000-4000-8000-000000000303'::uuid, 'de310000-0000-4000-8000-000000000303'::uuid, 'Carla Menezes', '5511977773303', 'carla.aluna@byteup.demo', '333.222.111-03', 'Curso concluido; certificado disponivel.')
) as demo(id, customer_id, name, whatsapp, email, cpf, notes)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'course'
) as context
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  customer_id = excluded.customer_id,
  name = excluded.name,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  cpf = excluded.cpf,
  notes = excluded.notes,
  status = 'active';

insert into public.enrollments (
  id,
  organization_id,
  student_id,
  course_class_id,
  status,
  payment_status
)
select
  demo.id,
  context.organization_id,
  demo.student_id,
  demo.course_class_id,
  demo.status,
  demo.payment_status
from (
  values
    ('de360000-0000-4000-8000-000000000301'::uuid, 'de320000-0000-4000-8000-000000000301'::uuid, 'de350000-0000-4000-8000-000000000301'::uuid, 'in_progress', 'paid'),
    ('de360000-0000-4000-8000-000000000302'::uuid, 'de320000-0000-4000-8000-000000000302'::uuid, 'de350000-0000-4000-8000-000000000301'::uuid, 'enrolled', 'pending'),
    ('de360000-0000-4000-8000-000000000303'::uuid, 'de320000-0000-4000-8000-000000000303'::uuid, 'de350000-0000-4000-8000-000000000302'::uuid, 'completed', 'paid')
) as demo(id, student_id, course_class_id, status, payment_status)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'course'
) as context
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  student_id = excluded.student_id,
  course_class_id = excluded.course_class_id,
  status = excluded.status,
  payment_status = excluded.payment_status;

insert into public.attendance_records (
  id,
  organization_id,
  course_class_id,
  student_id,
  class_date,
  status
)
select
  demo.id,
  context.organization_id,
  demo.course_class_id,
  demo.student_id,
  dates.previous_monday + demo.date_offset,
  demo.status
from (
  values
    ('de370000-0000-4000-8000-000000000301'::uuid, 'de350000-0000-4000-8000-000000000301'::uuid, 'de320000-0000-4000-8000-000000000301'::uuid, 0, 'present'),
    ('de370000-0000-4000-8000-000000000302'::uuid, 'de350000-0000-4000-8000-000000000301'::uuid, 'de320000-0000-4000-8000-000000000301'::uuid, 2, 'present'),
    ('de370000-0000-4000-8000-000000000303'::uuid, 'de350000-0000-4000-8000-000000000301'::uuid, 'de320000-0000-4000-8000-000000000302'::uuid, 0, 'present'),
    ('de370000-0000-4000-8000-000000000304'::uuid, 'de350000-0000-4000-8000-000000000301'::uuid, 'de320000-0000-4000-8000-000000000302'::uuid, 2, 'absent'),
    ('de370000-0000-4000-8000-000000000305'::uuid, 'de350000-0000-4000-8000-000000000302'::uuid, 'de320000-0000-4000-8000-000000000303'::uuid, -14, 'present')
) as demo(id, course_class_id, student_id, date_offset, status)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'course'
) as context
cross join pg_temp.seed_demo_dates as dates
on conflict (id) do update
set
  organization_id = excluded.organization_id,
  course_class_id = excluded.course_class_id,
  student_id = excluded.student_id,
  class_date = excluded.class_date,
  status = excluded.status;

-- Maintenance company: each order represents one stage of the field workflow.
insert into public.work_orders (
  id,
  organization_id,
  customer_id,
  professional_id,
  address,
  service_type,
  description,
  technician_name,
  visit_date,
  status
)
select
  demo.id,
  context.organization_id,
  demo.customer_id,
  demo.professional_id,
  demo.address,
  demo.service_type,
  demo.description,
  demo.technician_name,
  demo.visit_date,
  'requested'
from (
  values
    ('de430000-0000-4000-8000-000000000401'::uuid, 'de410000-0000-4000-8000-000000000401'::uuid, 'de420000-0000-4000-8000-000000000402'::uuid, 'Rua das Acacias, 180 - Bloco B', 'Reparo hidraulico', 'Vazamento constante na torneira da area comum.', 'Paulo Henrique', current_date + 1),
    ('de430000-0000-4000-8000-000000000402'::uuid, 'de410000-0000-4000-8000-000000000402'::uuid, 'de420000-0000-4000-8000-000000000401'::uuid, 'Avenida Central, 455 - Loja 2', 'Instalacao eletrica', 'Instalar seis luminarias LED no salao principal.', 'Eduardo Martins', current_date + 2),
    ('de430000-0000-4000-8000-000000000403'::uuid, 'de410000-0000-4000-8000-000000000403'::uuid, 'de420000-0000-4000-8000-000000000401'::uuid, 'Rua das Palmeiras, 72', 'Manutencao de ar-condicionado', 'Equipamento liga, mas nao resfria adequadamente.', 'Eduardo Martins', current_date),
    ('de430000-0000-4000-8000-000000000404'::uuid, 'de410000-0000-4000-8000-000000000404'::uuid, 'de420000-0000-4000-8000-000000000401'::uuid, 'Rua do Comercio, 920', 'Reparo eletrico', 'Revisar quadro eletrico e substituir disjuntor danificado.', 'Eduardo Martins', current_date - 3)
) as demo(
  id,
  customer_id,
  professional_id,
  address,
  service_type,
  description,
  technician_name,
  visit_date
)
cross join (
  select * from pg_temp.seed_demo_organizations where tenant_key = 'maintenance'
) as context
on conflict (id) do nothing;

update public.work_orders as work_order
set
  quote_materials = 420,
  quote_labor = 380,
  quote_discount = 50,
  quote_term = 'Execucao em ate 2 dias uteis apos aprovacao',
  quoted_at = coalesce(work_order.quoted_at, now()),
  status = 'quoted'
from pg_temp.seed_demo_organizations as context
where context.tenant_key = 'maintenance'
  and work_order.organization_id = context.organization_id
  and work_order.id = 'de430000-0000-4000-8000-000000000402'
  and (
    work_order.status <> 'quoted'
    or work_order.quote_materials <> 420
    or work_order.quote_labor <> 380
    or work_order.quote_discount <> 50
  );

update public.work_orders as work_order
set
  quote_materials = 180,
  quote_labor = 320,
  quote_discount = 0,
  quote_term = 'Conclusao prevista para o fim do dia',
  quoted_at = coalesce(work_order.quoted_at, now()),
  status = 'in_progress'
from pg_temp.seed_demo_organizations as context
where context.tenant_key = 'maintenance'
  and work_order.organization_id = context.organization_id
  and work_order.id = 'de430000-0000-4000-8000-000000000403'
  and (
    work_order.status <> 'in_progress'
    or work_order.quote_materials <> 180
    or work_order.quote_labor <> 320
  );

update public.work_orders as work_order
set
  quote_materials = 260,
  quote_labor = 340,
  quote_discount = 40,
  quote_term = 'Servico executado no mesmo dia',
  quoted_at = coalesce(work_order.quoted_at, now()),
  status = 'completed',
  completion_approved_by = 'Vanessa Ribeiro',
  completion_notes = 'Quadro revisado, disjuntor substituido e testes realizados.',
  completion_accepted = true
from pg_temp.seed_demo_organizations as context
where context.tenant_key = 'maintenance'
  and work_order.organization_id = context.organization_id
  and work_order.id = 'de430000-0000-4000-8000-000000000404'
  and work_order.status <> 'completed';

update public.work_order_checklist_items as checklist
set
  completed = true,
  completed_at = coalesce(checklist.completed_at, now())
where checklist.work_order_id = 'de430000-0000-4000-8000-000000000402'
  and checklist.item_key in ('arrived_on_site', 'assessed_problem');

update public.work_order_checklist_items as checklist
set
  completed = true,
  completed_at = coalesce(checklist.completed_at, now())
where checklist.work_order_id = 'de430000-0000-4000-8000-000000000403'
  and checklist.item_key in (
    'arrived_on_site',
    'assessed_problem',
    'took_photos',
    'performed_service'
  );

update public.work_order_checklist_items as checklist
set
  completed = true,
  completed_at = coalesce(checklist.completed_at, now())
where checklist.work_order_id = 'de430000-0000-4000-8000-000000000404';

end;
$demo_seed$;
