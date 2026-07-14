# Auditoria do banco de dados

Data da revisao: 2026-07-14.

## Resultado

O schema foi revisado e corrigido nas migracoes `202606120017` ate
`202606120025`. As migracoes foram aplicadas no Supabase local sem apagar os
dados existentes.

### Seguranca e multiempresa

- `organization_memberships` passou a ser a fonte de organizacao ativa e papel.
- Cada usuario pode listar e alternar somente entre as empresas das quais faz
  parte; os demais membros continuam visiveis apenas no espaco atual.
- Papel, organizacao e associacoes nao podem ser alterados diretamente pelo
  usuario autenticado.
- Donos administram membros por RPCs com verificacao de ultimo dono.
- Politicas RLS foram separadas por operacao. Membros escrevem dados
  operacionais; apenas dono e administrador excluem registros.
- As 21 tabelas com `organization_id` possuem chave tenant obrigatoria, RLS
  ativo e politica de leitura para a organizacao atual.
- A migracao `202606120025` interrompe a publicacao se encontrar tabela tenant
  sem RLS, politica autenticada sem `current_organization_id()` ou acesso
  anonimo aos dados internos.
- Catalogos, como cursos, servicos e profissionais, exigem dono ou
  administrador para alteracao.
- Os anexos de O.S. no Storage validam bucket, pasta da organizacao e registro
  de metadados pertencente a mesma empresa.
- O `service_role` recebeu os privilegios necessarios para rotinas de backend.
- Privilegios de `truncate`, `trigger` e `references` foram removidos de
  `anon` e `authenticated`.

### Relacionamentos

- FKs entre tabelas multiempresa agora incluem `organization_id`.
- Responsaveis e autores apontam para membros da mesma organizacao.
- Frequencia exige uma matricula do mesmo aluno na mesma turma.
- Alunos podem apontar para o cliente correspondente.
- Turmas e ordens de servico podem apontar para um profissional, mantendo o
  nome como snapshot historico.

### Integridade de dominio

- Situacao da matricula e situacao do pagamento sao campos separados.
- A capacidade da turma e validada no banco com bloqueio concorrente.
- Frequencia exige matricula ativa, data dentro do periodo e dia agendado.
- Conclusao de O.S. exige aceite e nome de quem aprovou; o banco define a data.
- Dados de conclusao ficam imutaveis enquanto a O.S. estiver concluida.
- Status de orcamento e execucao exigem orcamento salvo.
- Alteracoes relevantes da O.S. geram eventos append-only.

### Normalizacao

- Propostas usam `proposal_items` como fonte canonica.
- Subtotal, resumo de servicos e total sao calculados no banco.
- A tela simples salva cabecalho e item em uma transacao por RPC.
- Disponibilidade profissional possui estrutura por dia e horario.
- Indices redundantes foram removidos e indices para FKs foram adicionados.

## Verificacao

Execute antes de publicar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx supabase db lint --local --level warning
npx supabase test db --local supabase/tests/database_integrity.test.sql
```

O teste pgTAP possui 45 verificacoes de RLS, privilegios, FKs, propostas,
matriculas, frequencia, capacidade e auditoria de O.S.

## Publicacao no Supabase remoto

Este repositorio ainda nao esta vinculado a um projeto remoto. No computador
com acesso ao projeto correto:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push --linked --dry-run
npx supabase db push --linked
```

Confirme no dry-run que somente as migracoes `202606120017` a
`202606120025` estao pendentes antes de executar o ultimo comando.
