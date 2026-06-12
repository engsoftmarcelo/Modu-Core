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

### Tarefas e follow-ups

O dominio de tarefas fica em `features/tarefas` e usa a tabela `tasks` existente.
Cada registro pode ser vinculado a um cliente ou a um lead, nunca aos dois ao
mesmo tempo. As Server Actions validam que o registro relacionado pertence a
organizacao autenticada antes de persistir o vinculo. O responsavel inicial e o
usuario atual, e prazo, prioridade e status alimentam tanto a lista operacional
quanto os indicadores do dashboard.

## Proximas fronteiras

- Gerar os tipos do banco com Supabase CLI em CI.
- Adicionar testes unitarios para regras de dominio.
- Adicionar testes end-to-end para login e isolamento multiempresa.
- Criar camada de validacao com Zod quando os primeiros CRUDs forem iniciados.
