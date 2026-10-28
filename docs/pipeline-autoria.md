# Pipeline de autoria própria (Nery Journal)

Objetivo: o que aparece no site é **matéria do Nery Journal**, escrita a partir de **fonte primária**. Notícia de veículo é radar de pauta, nunca texto-base.

```
coleta (GitHub Actions)  →  triagem  →  fonte primária  →  fatos  →  redator  →  verificador  →  editor (em_revisao)  →  João aprova  →  publicado
```

| Etapa | Agente (`.claude/agents/`) | Entrega |
|---|---|---|
| 1 | `nj-triagem` | até 5 pautas com tema, nota e fonte primária (ou "radar sem fonte") |
| 2 | `nj-fonte-primaria` | dados exatos + URL da fonte |
| 3 | `nj-fatos` | fatos atômicos com referência |
| 4 | `nj-redator` | título, lide, corpo, categoria, capa (número + legenda) |
| 5 | `nj-verificador` | `scripts/nj-check.mjs` + conferência manual; aprova ou devolve |
| 6 | `nj-editor` | grava em `nj_articles` com `status='em_revisao'` |

Regras: texto próprio; todo número está nos fatos; sobreposição ≤ 20% com a fonte; ao menos uma fonte primária; sem sensacionalismo; **publicação só após aprovação humana** (`status='publicado'`, `published_at`, `reviewed_by`, `reviewed_at`).

Como rodar hoje (sem chave de API): peça no chat "rascunhos de hoje"; o Claude executa as etapas, mostra os rascunhos e publica o que você aprovar. Para rodar sozinho todo dia é preciso uma rotina com conector do Supabase (claude.ai/code/routines) ou uma `ANTHROPIC_API_KEY` em workflow.

## Textos das fontes (nj_source_texts)
O workflow `nj-texts` (06:40/11:40/17:40 BRT) baixa o texto das páginas do radar (robots.txt respeitado, 1 req/s por host, sem contornar bloqueios) para a tabela **privada** `nj_source_texts` (RLS sem políticas). Uso exclusivo: conferência interna de fatos e de originalidade. Nunca exibido no site, nunca republicado.
