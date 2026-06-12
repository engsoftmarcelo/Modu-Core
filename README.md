# ModuCore

O ModuCore é um SaaS modular feito para facilitar a vida de pequenos negócios de serviços. Ele junta as ferramentas do dia a dia da empresa em um lugar só, incluindo um CRM de clientes, gestão de leads num quadro kanban, controle de tarefas e criação de propostas.

O código está dividido por domínios na pasta `features` e isola as rotas públicas da área logada. O banco de dados fica no Supabase com isolamento multiempresa configurado via Row Level Security (RLS).

## Stack Principal

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase

## Como rodar

1. Instale as dependências:
```bash
npm install
```

2. Copie o arquivo de variáveis de ambiente e preencha os dados do Supabase:
```bash
cp .env.example .env.local
```

3. Rode as migrações pra preparar o banco local com a CLI do Supabase:
```bash
npx supabase migration up --local
```

4. Suba o servidor:
```bash
npm run dev
```

Acesse em `http://localhost:3000`.
