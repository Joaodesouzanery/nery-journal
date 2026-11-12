# HANDOFF — retomar o Nery Journal em um chat novo

Última atualização: 06/11/2026. Dono: João de Souza (joaodsouzanery@gmail.com). Idioma: português.

## O que é
"Nery Journal – Construção": jornal de Construção, Engenharia e Saneamento (Brasil todo; SP e DF em destaque), do Grupo Nery. Site Next.js 15 (App Router) na Vercel, banco Supabase, coleta e fotos em GitHub Actions, matérias de autoria própria escritas por agentes (hoje, no chat), newsletter/Pro, posts de Instagram.

## Endereços e IDs (não secretos)
- Site: https://nery-journal-joaodesouzanerys-projects.vercel.app (deploy automático a cada push na `main`)
- Repositório: github.com/Joaodesouzanery/nery-journal (público)
- Supabase: projeto GNC `jquybkqdxbiosnzsufyh` (us-east-1)
- Vercel: projeto `nery-journal`, time `team_yqBLMg8jWVHIXVYD3hXCz7ov`
- Repositório antigo (não usar): Joaodesouzanery/ADMINISTRATIVO

## Segredos e variáveis (SÓ OS NOMES; valores o usuário recoloca)
- GitHub → Settings → Secrets → Actions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (já existem); pendentes: `ANTHROPIC_API_KEY` (redator `nj-writer` e curador de imagens), `PEXELS_API_KEY` (fotos por assunto).
- Vercel (projeto nery-journal): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`; pendente: `NEXT_PUBLIC_PRO_CHECKOUT_URL` (link Stripe/Asaas); `NEXT_PUBLIC_INDEXABLE` vazio por enquanto.
- Modelo do redator no workflow: `claude-sonnet-5-5`.
- Conectores usados no chat: Supabase MCP (SQL), GitHub, Vercel. Em outro chat, reconecte-os.

## Como o fluxo funciona
1. `nj-feeds` (cron) e `nj-collect` (diário) gravam o radar em `nj_pauta_items` e licitações do PNCP em `nj_licitacoes`; `nj-texts` guarda texto das fontes em `nj_source_texts` (privado). Gatilho manual: escrever um arquivo em `.github/triggers/<nome>` e dar push (`collect`, `feeds`, `photos`, `texts`, `discover`, `probe`, `posts`).
2. Agentes em `.claude/agents/nj-*.md` (triagem → fonte primária → fatos → redator → verificador → editor) escolhem pautas e gravam em `nj_articles` com `status='publicado'` se `scripts/nj-check.mjs` aprovar (senão `em_revisao`). Status permitidos pela constraint: rascunho, em_revisao, publicado, corrigido.
3. `nj-photos` liga uma foto (`photo_id`) a cada matéria publicada; sem foto, o site esconde a matéria (`lib/data.ts` e `lib/search.ts`).
4. Posts: `/card/[slug]` (1080×1350) e painel `/social`; brief para o Claude Design em `docs/claude-design-brief.md`.
5. Cron do chat: só a rodada editorial das 07h (Brasília) está ativa (gatilho `trig_0166pJJY5PckC1Wh6DkkV3fn`, criado em 06/11 no chat novo; é de sessão — em outro chat, recrie). As rodadas extras (12h, 18h, rápidas) foram desligadas por custo de tokens; o usuário pediu para ser lembrado de religá-las quando quiser.

## Estado em 06/11/2026
- Escopo corrigido; 10 matérias fora do tema foram despublicadas. Trava de imagem no site ativa. Coleta voltou a funcionar (ficou parada de 30/10 a 02/11).
- Publicadas em 02/11: DER-PR PRC-487, Tacaratu (PE) triagem de lixo, aeroportos de Manchester, Veolia/Arauco, ponte Leeds–York (dependem de o job de fotos ligar imagem).
- A rodada das 07h de 06/11 não foi executada.
- FEITO em 06/11: regra de lugar (`placeMismatch`), nunca repetir foto em 30 dias, Pexels primeiro (também no genérico do grupo), fim da reutilização, curador com visão `scripts/nj-photo-curator.mjs` no workflow nj-photos e migração `021_nery_photo_approved.sql` (APLICAR no GNC). Só funciona com `PEXELS_API_KEY` e `ANTHROPIC_API_KEY` nos Secrets. Antes:
- Fotos AINDA não são confiáveis (Commons devolve fotos fracas; Dubai com neve, foto repetida). Correção planejada e NÃO feita: Pexels como fonte principal, regra de lugar/entidade, nunca repetir foto em 30 dias, curador com visão (`scripts/nj-photo-curator.mjs`, `nj_photos.approved`) usando a API da Anthropic.

## Pendências
Do usuário: criar `PEXELS_API_KEY` e `ANTHROPIC_API_KEY` nos Secrets; link de pagamento (`NEXT_PUBLIC_PRO_CHECKOUT_URL`); CNPJ/NFS-e, termos e advogado; domínio e provedor de e-mail; logo em SVG; criar o modelo dos posts no Claude Design usando `docs/claude-design-brief.md`; confirmar o registro de bloqueio de fontes no Supabase.
Do Claude (próximos passos): implementar Pexels + regras de lugar/repetição + curador com visão; ligar o redator `nj-writer`; reescrever os 3 posts do dia dentro do escopo (`docs/posts/`); PNCP investigado em 06/11: NÃO houve falha. nj-collect rodou todo dia (31/10: 352 obras gravadas); o que parece "parada" é o atraso/omissão dos crons do GitHub (o de 2 em 2 h rodou de 2 a 4 vezes por dia, e o das 09h UTC roda por volta das 15h–16h UTC). Remédio: a rodada das 07h dispara `.github/triggers/feeds` antes da triagem; reativar rodadas extras quando o usuário pedir.

## Documentos
`docs/pipeline-autoria.md`, `docs/melhorias-agentes.md`, `docs/produto-e-copys.md` (copys Stripe/Vercel), `docs/newsletter-fluxo.md`, `docs/custo-api.md` (estimativa de custo, de memória — conferir preços), `docs/pedido-de-feed.md`, `docs/plano-historico.md` (todo o histórico de decisões por rodada). Migrações em `supabase/migrations/005–020` (já aplicadas no GNC).

## 09/11
- Migrações 021 e 022 aplicadas no GNC: trava no banco (publicado exige foto) e fila `needs_photo` (matérias sem foto ficam em_revisao até ganhar foto e voltam sozinhas).
- Fotos: Pexels suspendeu chaves novas. Ordem atual: foto/og:image da entidade → Openverse (CC0/domínio público, sem chave) → Pexels (se houver chave) → Commons → Pixabay (`PIXABAY_API_KEY`, opcional) → genérico do setor → logo.
- Agente `nj-foto-conferencia` confere cada foto; `nj-check-imagens.mjs` tira do ar a que não abre ou se repete.

## 12/11
- Site mostra SÓ matéria com foto APROVADA (`nj_photos.approved=true`, em lib/data.ts e lib/search.ts).
- Até a ANTHROPIC_API_KEY entrar, quem aprova é o Claude no chat: o job nj-photos publica miniaturas na branch `nj-review`; ver `.claude/skills/nj-imagem-obrigatoria/aprendizado.md` (processo + erros/acertos, atualizar a cada revisão).
- Instagram: sistema de 6 layouts no Claude Design (`docs/claude-design-brief.md`); todo dia o Claude manda um "pacote" por post.
- Nery Regula: proposta aprovada em ideia (agências gov.br + MegaWhat, Agência iNFRA, Canal Energia, Globo/Valor, Estadão); implementar quando o dono mandar.
- PENDENTE DO DONO (lembrar em toda rodada até ele confirmar): configurar a Anthropic — console.anthropic.com → créditos (US$ 10) → limite mensal US$ 20 → API key "nery-journal-github" → GitHub Secret `ANTHROPIC_API_KEY`.

## 12/11 (tarde): duas marcas
- O dono decidiu: **GN Construção** e **GN Regulação**, "do Grupo Nery", em dois Instagrams. Ver `docs/estrategia-marca-assinatura.md`.
- O site ganhou `/regulacao`, com tema verde-petróleo e a mesma trava de foto aprovada. `getArticles(limit, sector)`.
- Migração 023 (aplicada na GNC): coluna `sector` em nj_sources e nj_pauta_items, mais 12 fontes de regulação (9 com RSS gov.br).
- Docs novos: `docs/claude-design-projeto.md`, `docs/fontes-mapa.md`, `docs/posts/2026-11-12.md`.
- **Pendente:**
  - os 3 rascunhos de 12/11 (em_revisao) precisam do check e da limpeza das frases sem fonte;
  - a rodada das 07h deve gerar 3 matérias de cada marca;
  - o dono deve confirmar os @, as logos e a ANTHROPIC_API_KEY.
