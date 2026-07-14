# Dados de demonstracao

O seed cria quatro empresas completamente separadas por RLS. Cada conta possui
somente os dados do seu modelo de negocio.

## Acessos

Todas as contas usam a senha `ModuCore@2026`.

| Modelo | Empresa | E-mail |
| --- | --- | --- |
| CRM B2B | Agencia Vitrine Promocoes | `demo.agencia@moducore.local` |
| Agenda | Studio Aurora Beleza | `demo.salao@moducore.local` |
| Cursos | Escola ByteUp Informatica | `demo.curso@moducore.local` |
| Ordem de servico | ProntoLar Manutencao | `demo.manutencao@moducore.local` |

As contas sao proprietarias apenas de empresas ficticias. Nao reutilize essa
senha em contas reais.

## Conteudo

- A agencia possui clientes, cinco etapas do funil, tarefas e propostas com
  itens e totais calculados.
- O salao possui servicos, profissionais, disponibilidade, atendimentos
  concluidos e proximos retornos.
- A escola possui cursos, turmas, alunos, matriculas, frequencia e uma
  matricula concluida para demonstrar o certificado.
- A manutencao possui tecnicos e ordens solicitada, orcada, em execucao e
  concluida, incluindo orcamentos, checklists e confirmacao do cliente.

As datas sao relativas ao momento da execucao. Rodar o seed novamente atualiza
os registros conhecidos sem excluir dados criados manualmente.

## Executar

Banco local:

```powershell
npx.cmd supabase db query --local --file supabase/seed.sql
```

Projeto vinculado:

```powershell
npx.cmd supabase db query --linked --file supabase/seed.sql
```

Validacao:

```powershell
npx.cmd supabase test db --local supabase/tests/demo_seed.test.sql
```

O `supabase db reset` tambem executa o arquivo automaticamente, conforme a
configuracao em `supabase/config.toml`.
