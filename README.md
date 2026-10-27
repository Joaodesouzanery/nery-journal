# Nery Journal

Notícias, indicadores e licitações de obras para construtoras e engenheiros (Grupo Nery). Site Next.js (Vercel) + Supabase (projeto GNC) + coleta em GitHub Actions.

## Estrutura

| Pasta | O que é |
|---|---|
| `app/`, `components/`, `lib/` | Site Next.js (notícias, `/licitacoes`, plano Pro, newsletter, anuncie) |
| `collectors/` | Coletores: dados abertos (`sources.ts`), licitações PNCP (`licitacoes.ts`), RSS/Atom (`feeds.ts`) |
| `scripts/` | Execução dos coletores (`nj-probe`, `nj-collect`, `nj-licitacoes`, `nj-feeds`, `nj-discover-feeds`) |
| `pipeline/` | Autoria própria: checagens (`checkArticle`), carrossel, redação com IA (opcional) |
| `supabase/migrations/` | Banco (005–009). Tabelas `nj_*` com RLS; só o que é público tem política de leitura |
| `templates/carousel.html` | Template de carrossel (Instagram/LinkedIn) |
| `docs/` | Matriz de fontes (`fontes_nery_journal.xlsx`) e guia de marca |

## Workflows (GitHub Actions)

Secrets necessários: `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

- `nj-probe`: testa os coletores contra as APIs reais (não grava nada).
- `nj-discover-feeds`: procura feeds RSS/Atom das fontes e grava em `nj_source_checks`.
- `nj-collect`: diário, 09:00 UTC. Dados abertos, licitações e feeds → `nj_pauta_items` / `nj_licitacoes`.
- `ci`: testes e build a cada push.

Cada um roda pelo botão **Run workflow** ou por push do arquivo correspondente em `.github/triggers/` (`probe`, `discover`, `collect`).

## Variáveis do Vercel

Veja `.env.example`. A service role nunca vai para o navegador.

## Regras de conteúdo

- Veículos são radar: só manchete, link e trecho curto (≤ 200 caracteres). Texto vem de fonte primária e dados.
- Dados abertos exigem atribuição (BC: ODbL; Banco Mundial: CC BY 4.0; IBGE: citar a fonte).
- Foto: só licenciada ou própria. Sem foto de matéria de terceiros.
- Revisão humana obrigatória antes de publicar; publicidade rotulada; correção visível.
- Textos legais (consentimento, privacidade, termos do Pro) são rascunhos: revisar com advogado. Buscar o nome no INPI.

## Desenvolvimento

```
npm install
npm test          # funções puras (pipeline, licitações, feeds)
npm run build
```
