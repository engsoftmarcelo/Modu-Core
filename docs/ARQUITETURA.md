# Arquitetura inicial

## Stack

- Next.js 16 com App Router, TypeScript e React 19
- Tailwind CSS 4
- Supabase Auth e PostgreSQL
- `@supabase/ssr` para sessao baseada em cookies
- Lucide React para icones

## Organizacao de codigo

```text
src/
  app/
    (auth)/             rotas publicas de autenticacao
    (app)/              rotas internas protegidas
    auth/               callbacks e logout
  components/
    auth/               formularios de acesso
    dashboard/          componentes do painel
    layout/             sidebar, topbar e navegacao mobile
    modules/            apresentacao compartilhada dos modulos
    ui/                 primitivas visuais
  features/
    agenda/
    crm/
      customers/          regras, consultas, acoes e componentes de clientes
      leads/              funil, regras, consultas, acoes e componentes de leads
    dashboard/
    matriculas/
    ordens-servico/
    propostas/
    tarefas/
  lib/
    supabase/           clientes para browser, servidor e proxy
  types/
```

## Decisoes

### Multiempresa

Todas as tabelas operacionais possuem `organization_id`. As politicas de Row
Level Security usam `current_organization_id()` para impedir acesso cruzado.
`organization_memberships` define a organizacao ativa e o papel do usuario.
Relacionamentos entre entidades de negocio usam FKs compostas com
`organization_id`, impedindo vinculos acidentais entre empresas.

As duas excecoes de leitura sao intencionais: o usuario pode descobrir as
organizacoes e associacoes das quais ele proprio faz parte para alternar o
espaco ativo. Dados operacionais, usuarios de outras empresas e anexos no
Storage continuam filtrados pela organizacao selecionada. A migracao
`202606120025` valida essas invariantes e falha se uma politica tenant perder o
filtro por `current_organization_id()`.

### Cadastro

O cadastro envia nome, empresa e modelo de negocio como metadados do Auth. Um
trigger cria a organizacao e o perfil publico em uma unica transacao.

### Protecao de rotas

`src/proxy.ts` atualiza os cookies da sessao e protege as rotas internas. O
layout protegido faz uma segunda verificacao no servidor antes de renderizar.

### Features

Configuracao, consultas e componentes especificos devem ficar dentro de
`src/features/<modulo>`. Componentes realmente compartilhados ficam em
`src/components`.

### CRUD de clientes

O dominio de clientes usa Server Components para leitura e Server Actions para
criacao, atualizacao e exclusao. O mesmo schema Zod valida criacao e edicao.
Todas as operacoes incluem o `organization_id` da sessao e continuam protegidas
pelas politicas de RLS do banco.

### CRUD de leads

Os leads seguem o mesmo fluxo de Server Components e Server Actions, com seis
etapas comerciais: novo, em contato, proposta enviada, negociacao, fechado e
perdido. O responsavel inicial e o usuario que cria a oportunidade, e o resumo
do funil e calculado apenas com registros da organizacao autenticada.

O pipeline kanban exibe as cinco etapas ativas do processo comercial. A
movimentacao usa atualizacao otimista no cliente e persiste a nova etapa por
Server Action. Alem de arrastar no desktop, cada card oferece um seletor para
uso por toque ou teclado.

### Dashboard do CRM

O dashboard comercial fica em `/crm/dashboard` e consulta apenas agregados da
organizacao autenticada. Os indicadores usam os status atuais de leads,
propostas e tarefas: novos, propostas enviadas, propostas aceitas, valor
estimado em negociacao e tarefas ainda abertas. Cada card aponta para a lista
filtrada que explica o numero exibido.

### Tarefas e follow-ups

O dominio de tarefas fica em `features/tarefas` e usa a tabela `tasks` existente.
Cada registro pode ser vinculado a um cliente ou a um lead, nunca aos dois ao
mesmo tempo. As Server Actions validam que o registro relacionado pertence a
organizacao autenticada antes de persistir o vinculo. O responsavel inicial e o
usuario atual, e prazo, prioridade e status alimentam tanto a lista operacional
quanto os indicadores do dashboard.

### Propostas

`proposal_items` e a fonte canonica do escopo e dos valores. A tela simples
continua com um unico campo de servicos, mas salva cabecalho e item por uma RPC
transacional. Subtotal, resumo e total sao recalculados por trigger.

### Matriculas e frequencia

O ciclo academico e o pagamento usam status independentes. O banco valida
capacidade da turma, matricula ativa, periodo e dia da semana antes de aceitar
uma frequencia.

### Ordens de servico

Conclusoes exigem aceite e aprovador, recebem horario do banco e nao podem ser
alteradas enquanto a ordem estiver concluida. Criacao, mudanca de status,
orcamento, conclusao e reabertura sao registrados em `work_order_events`.

### Testes do banco

As invariantes de RLS, privilegios e dominio possuem testes pgTAP em
`supabase/tests/database_integrity.test.sql`. O procedimento completo esta em
`docs/AUDITORIA_BANCO.md`.

## Proximas fronteiras

- Gerar os tipos do banco com Supabase CLI em CI.
- Executar os testes pgTAP e o build em CI.
- Adicionar testes end-to-end de login e fluxos completos no deploy de preview.
