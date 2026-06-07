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

## Proximas fronteiras

- Gerar os tipos do banco com Supabase CLI em CI.
- Adicionar testes unitarios para regras de dominio.
- Adicionar testes end-to-end para login e isolamento multiempresa.
- Criar camada de validacao com Zod quando os primeiros CRUDs forem iniciados.
