# ModuCore

Plataforma SaaS modular para pequenos negocios de servico em Belo Horizonte.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase

## Primeiros passos

1. Instale as dependencias:

```bash
npm install
```

2. Copie `.env.example` para `.env.local` e preencha as credenciais do projeto
   Supabase.

3. Aplique `supabase/migrations/202606070001_initial_schema.sql` no SQL Editor
   do Supabase ou com a Supabase CLI.

4. Inicie o projeto:

```bash
npm run dev
```

A aplicacao estara disponivel em `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Documentacao

- [Escopo](docs/ESCOPO.md)
- [Arquitetura](docs/ARQUITETURA.md)
- [Backlog](BACKLOG.md)

## Estrutura

As rotas publicas ficam em `src/app/(auth)` e as rotas internas em
`src/app/(app)`. Cada dominio possui uma pasta propria em `src/features`.
