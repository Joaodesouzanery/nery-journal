# Nery Journal

Marca de notícias de construção/engenharia (regulatório depois). Este diretório guarda o template de carrossel; o coletor de dados abertos está em `api/` e `supabase/migrations/005_nery_journal.sql`.

## Status (honesto)

| Parte | Estado |
|---|---|
| Template de carrossel (`templates/carousel.html`) | Pronto como protótipo; renderiza. Os textos/dados de exemplo são **fictícios** |
| Migração Supabase `005` | Escrita, **não aplicada** ao banco |
| Coletores (`collectors/sources.ts`) | Escritos pela documentação pública, **não testados contra as APIs reais** (o ambiente de dev não alcança esses hosts) |
| Cron + função (`api/nj-collect.ts`, `vercel.json`) | Escritos, **não implantados** |
| DOU/INLABS, Caged, SINAPI Caixa, Eurostat, Census, RSS de veículos | Fase 2, não implementados |

## Template de carrossel

Abra `templates/carousel.html` no navegador. Cole o JSON do post e clique em **Aplicar**. "Modo limpo" mostra os slides em 1080×1350 para tirar print/exportar. Tipos de slide: `capa`, `fatos`, `dado`, `impacto`, `fonte`. Selo `PUBLI` e `CORREÇÃO` por campo (`publi.ativo`, `correcao`).

Foto: preencha `foto.url`, `credito`, `licenca` e `origem_url`. Sem foto, a capa usa um fundo quadriculado (card tipográfico). O wordmark é texto provisório: troque pelo desenho próprio.

## Coletor de dados abertos

Fontes: Banco Central (SGS), PNCP (licitações de obras acima de R$ 5 mi), IBGE (SIDRA), Banco Mundial.

1. Rode de uma máquina com internet: `npm run nj:probe` (não grava nada; imprime status e exemplos). Ajuste códigos/URLs em `collectors/sources.ts` conforme os erros. Itens a conferir primeiro: série 192 do BC (INCC-M), tabela 2296/variável 48 do IBGE (SINAPI), códigos de modalidade do PNCP (4, 5, 6).
2. Aplique `supabase/migrations/005_nery_journal.sql` no projeto Supabase.
3. No Vercel, configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `CRON_SECRET` (nunca exponha a service role no front-end).
4. O cron roda todo dia às 09:00 UTC e grava em `nj_pauta_items`. Teste manual: `GET /api/nj-collect?source=bcb-sgs` com o cabeçalho `Authorization: Bearer <CRON_SECRET>`.

As tabelas `nj_*` têm RLS ligado **sem política**: a chave anon não acessa nada. Isso difere das migrações 002/004, que são abertas.

## Regras de conteúdo

- Veículos são radar de pauta; texto vem de fonte primária e dados. Nunca copiar texto de paywall nem traduzir/parafrasear matéria única.
- Dados abertos exigem atribuição (BC: ODbL; Banco Mundial: CC BY 4.0, indicar alterações; IBGE: citar a fonte e confirmar os termos).
- Foto: só licenciada ou própria; guarde licença e URL de origem em `nj_photos`. Sem rosto reconhecível nem logo.
- Revisão humana obrigatória antes de publicar; publi rotulada; correção visível.
- Antes de lançar o nome "Nery Journal": busca no INPI e advogado de propriedade intelectual.

Matriz de fontes: `docs/fontes_nery_journal.xlsx`.
