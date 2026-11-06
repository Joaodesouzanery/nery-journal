# Nery Journal — banco (GNC), pipeline de autoria e site no layout tipo Maersk

## Context
Etapa anterior entregou: matriz de fontes (`docs/fontes_nery_journal.xlsx`), template de carrossel (`nery-journal/templates/carousel.html`), coletores de dados abertos (`api/_nj/sources.ts`, `api/nj-collect.ts`) e migração `supabase/migrations/005_nery_journal.sql` (não aplicada). Agora o usuário quer, antes de voltar ao Instagram/LinkedIn: (1) aplicar a migração no Supabase, (2) definir coleta ("scraping") e preparação das notícias com **autoria própria**, já no formato do site, (3) um site com praticamente o layout das páginas "Latest insights" e "Latest news" da Maersk, com nome **Grupo Nery – Construção** (setor Regulação depois), com placeholders onde faltar conteúdo.

## Decisões do usuário
- Supabase: projeto **GNC** (`jquybkqdxbiosnzsufyh`, us-east-1, ACTIVE_HEALTHY).
- Site: **app Next.js separado** em `nery-journal/site`, deploy próprio no Vercel (SSR/ISR para SEO e prévia de links).
- Fontes iniciais: dados abertos + órgãos; releases/newsletters de empresas; feeds RSS de veículos (só manchete+link).
- Stack: Vercel + Supabase; publicação manual no início.

## Limites conhecidos
- O ambiente de dev **não alcança** BC, IBGE, PNCP, sites de veículos etc. (proxy 403): nada de coleta real pode ser testado aqui. Entregar `nj:probe` e testes de funções puras (sem inventar respostas de API).
- Chave de API de IA (Anthropic) e variáveis de ambiente precisam ser configuradas pelo usuário; modelo exato a confirmar com a skill `claude-api` na implementação.

## Layout de referência (observado nos prints da Maersk) → versão Nery
Replicar **padrões de layout**, não ativos: sem logo/estrela, fontes (Maersk Headline/Text), fotos ou azul #42B0D5 deles. Marca, cores (amarelo-capacete + preto/branco) e tipografia (Inter; Barlow Condensed nas manchetes) próprias.
1. Cabeçalho: logo à esquerda; links utilitários (Pesquisar, Notificações, Contato); menu (Início, Obras, Infraestrutura, Materiais, Mercado, Indicadores, Licitações, Sobre); botões Cadastrar-se/Login → "Receber newsletter".
2. **"Últimas análises"** (equivale a Latest insights): título leve grande, descrição, filtro de categorias à direita, grade com 1 card grande + 1 largo + 2 pequenos; cards com imagem cheia, degradê escuro, categoria sublinhada • data, título branco.
3. **"Últimas notícias"** (equivale a Latest news): destaque (imagem à esquerda, texto) + caixa de newsletter à direita; grade 3 colunas de cards brancos com borda (imagem, categoria, título, data); barra lateral com listas "Indicadores" (Selic, IPCA, INCC, CUB – vindos do coletor BC/SindusCon) e "Licitações de obras" (PNCP) no lugar de Advisories/Rate announcements.
4. Faixa fixa inferior "Assine a newsletter" (com Fechar) e modal de cadastro (foto + e-mail + consentimento LGPD, dupla confirmação).
5. Rodapé em 4 colunas (Notícias, Dados, Sobre/Política editorial, Contato); aba lateral "Feedback".
6. Setores: campo `setor` ('construcao' | 'regulacao'); só Construção visível agora.

## Fases

### A. Banco (GNC) — após aprovação
1. Aplicar `005_nery_journal.sql` via Supabase MCP (`apply_migration`, projeto GNC) — RLS ligado, sem política aberta.
2. Nova migração `006_nery_site.sql`:
   - `nj_sources` (política por fonte): id, nome, tipo (dado_aberto/orgao/release/veiculo), url, feed_url, `allow_fulltext`, `allow_ai`, `license`, `terms_url`, `terms_checked_at`, `attribution_text`, `active`.
   - `nj_articles` (autoria própria): slug, setor, categoria, título, lide, corpo (markdown), fatos jsonb, fontes jsonb (≥1 fonte primária), foto_id, status (rascunho/em_revisão/publicado/corrigido), `is_placeholder`, `ai_assisted`, `reviewed_by/at`, publicado_em, carrossel jsonb.
   - `nj_subscribers` (email, setor, consentimento_texto/versão, confirmado_em, token) com dupla confirmação.
   - Políticas RLS: anon lê só `nj_articles` com status publicado; escrita só via service role/Funções.
3. Verificar com `list_tables` e `get_advisors` (segurança).

### B. Registro de política de fontes
- Script que lê `docs/fontes_nery_journal.xlsx` e semeia `nj_sources` com padrão conservador (`allow_fulltext=false`, `allow_ai=false`), liberando apenas dados abertos/atos oficiais e fontes cujos termos forem conferidos.
- O pipeline **só passa texto completo à IA se `allow_fulltext && allow_ai`**; para veículos, só manchete + link + notas do editor.

### C. Ingestão (extensão de `api/_nj/`)
- Prioridade: APIs/feeds/sitemaps; HTML scraping só para páginas públicas permitidas pela política, respeitando robots.txt, com User-Agent identificado, limite de taxa e sem contornar paywall/login. Registrar `fetched_at`, hash e URL.
- Adaptadores novos: RSS/Atom (`fast-xml-parser`), feeds gov.br por seção, press rooms de empresas aprovadas. Guardar título, link, data e trecho curto (≤ 200 caracteres) — não o texto de terceiros.
- Dedupe + agrupamento por evento (similaridade simples de título/entidades) e marcação "precisa de 2ª fonte".

### D. Preparação com autoria própria (pipeline)
Local: `nery-journal/pipeline/` (funções puras testáveis) + chamada à API de IA.
1. **Extrair fatos** (afirmações atômicas com trecho-fonte) só de fontes permitidas.
2. **Redigir** a partir dos fatos, não da prosa da fonte: guia de estilo Nery (manchete factual com número, lide, 3 fatos, contexto, "por que importa para obra", fontes), sem adjetivação nem acusação; saída JSON → `nj_articles` + `carrossel` compatível com `carousel.html`.
3. **Checagens automáticas:** números, datas e nomes do texto existem nos fatos extraídos; **originalidade** (sobreposição de n-gramas vs. texto-fonte acima do limite → rejeita); exige ≥ 1 fonte primária; item baseado em um só veículo fica bloqueado até 2ª fonte.
4. Fila de revisão humana (checklist) → publicar. Aviso "Produzido com apoio de IA e revisado por editor" quando `ai_assisted`.
- Testes: funções puras (similaridade de n-gramas, conferência de números, montagem de slug/JSON) com textos sintéticos, rotulados como tal.

### E. Site Next.js (`nery-journal/site`)
- App Router, ISR, Tailwind; leitura do Supabase (chave anon; só artigos publicados).
- Rotas: `/` (Últimas análises), `/noticias` (Últimas notícias + barra lateral de Indicadores/Licitações), `/[setor]/[slug]`, `/sobre`, `/politica-editorial`, `/privacidade`, `/newsletter/confirmar`.
- SEO: metadados, Open Graph, JSON-LD `NewsArticle`, sitemap, RSS próprio.
- **Placeholders:** artigos de exemplo com `is_placeholder=true`, faixa "EXEMPLO", `noindex`, nunca expostos como notícia real.
- Imagens: biblioteca `nj_photos` (licença + origem); sem foto → card tipográfico.

### F. (Depois) tela de pauta/revisão no app interno e Instagram/LinkedIn.

## Arquivos críticos
`supabase/migrations/005_nery_journal.sql` (existente), `006_nery_site.sql` (novo), `api/_nj/sources.ts` e `api/nj-collect.ts` (existentes; estender), `nery-journal/pipeline/*` (novo), `nery-journal/site/*` (novo), `docs/fontes_nery_journal.xlsx` (fonte da política), `nery-journal/templates/carousel.html` (formato do carrossel).

## Verificação
- Migração: `list_tables`, `get_advisors`; testar RLS (anon não lê rascunho, não escreve).
- `npm run lint` (nos arquivos novos) e `npm run build`; `next build` no site; testes das funções puras.
- Capturas com Chromium headless do site (desktop/mobile) comparadas ao layout de referência; checar que nenhum asset da Maersk foi usado.
- `npm run nj:probe` e um probe de feeds numa máquina com internet (usuário) antes de ligar o cron.
- Revisão humana + jurídica (INPI do nome, termos de cada fonte) antes de publicar.

## Estado atual e passo final: deploy no Vercel
Feito: migrações 005 e 006 aplicadas no GNC; `nj_sources` semeada (50 fontes, 5 liberadas); pipeline com testes (9 passam); site Next.js buildado e visto em capturas; tudo commitado e enviado (HEAD b457a55 na branch `claude/beautiful-gates-5kybx1`).
Projeto Vercel **`nery-journal-site`** (`prj_0AjYdrPMo9wj3VGowed7IUnO3Fdw`, time `team_yqBLMg8jWVHIXVYD3hXCz7ov`, root `nery-journal/site`, framework nextjs) já foi criado, com `NEXT_PUBLIC_SUPABASE_URL` e a chave publicável do GNC. Ainda sem deployment.
A fazer após aprovação:
1. `create_deployment` com `gitSource` github `Joaodesouzanery/ADMINISTRATIVO`, ref `claude/beautiful-gates-5kybx1`, sha b457a55… (alvo preview).
2. Acompanhar com `get_deployment`; se falhar, ler logs e corrigir.
3. Informar a URL. O projeto tem Vercel Authentication ligada (`all_except_custom_domains`): o link só abre logado na conta Vercel. Desligar a proteção (link público) é decisão do usuário — o site está `noindex` e com conteúdo de exemplo.
4. Newsletter segue retornando 503 até configurar `SUPABASE_SERVICE_ROLE_KEY` (só no Vercel, nunca no front-end).

## Resultado do deploy e decisão de acesso
Deployment `dpl_C4ephDYZMPbjE1K8R71D2fafwtRi` (commit 1094cf3) está READY; `/noticias` respondeu 200 com placeholders e `noindex`. O primeiro deploy (b457a55) falhou com `STATIC_BUILD_NO_OUT_DIR` por herdar `dist`; corrigido com `nery-journal/site/vercel.json`.
Decisão do usuário: **tornar o link público**. Passo: `update_project` (projeto `prj_0AjYdrPMo9wj3VGowed7IUnO3Fdw`) com `ssoProtection: null` (desliga a Autenticação do Vercel), depois confirmar com uma requisição sem login (o site segue `noindex`, com faixa "Em construção" e conteúdo EXEMPLO). Se o alias de preview continuar exigindo login, informar o URL de produção/alias público.

## Rodada 3 — identidade, anúncios, fontes/imagens, licitações por UF, newsletter

### 1. Site: logo Nery, cores tipo Maersk, espaços de patrocínio
- **Logo:** usar o arquivo enviado (imagem 9.webp, 2000×667, preto sobre branco; bordas serrilhadas = é raster). Gerar `public/logo-grupo-nery.png` com fundo transparente (PIL) e um `logo-mark.png` só do "N"; pedir ao usuário o vetor (SVG) original para versão final. Header: marca "N + Grupo Nery" + subtítulo "Nery Journal · Construção".
- **Cores:** trocar o amarelo por azul claro nos botões/links (CTA tipo "Login" da Maersk), mantendo preto/branco. Amostrar o tom do print; recomendado um azul **semelhante, não idêntico** (ex.: `#3DA9D6`) — o conjunto "mesmo layout + mesmo azul" aumenta o risco de confusão com marca conhecida (Lei 9.279 art. 195); o logo N próprio é o que diferencia. Decisão do usuário (pergunta abaixo).
- **Patrocínio (direto, estático, sem ad server):** slots: (a) leaderboard 970×250/728×90 abaixo do header, (b) MPU 300×250 na barra lateral de /noticias, (c) card "Patrocinado" a cada N cards na grade, (d) faixa "Parceiros" no rodapé, (e) bloco patrocinado na newsletter, (f) matéria "Publi" identificada. Todo slot com rótulo visível "Publicidade"/"Conteúdo patrocinado" (CONAR arts. 28 e 30). Sem anunciante, o slot mostra "Anuncie aqui" → página `/anuncie` (formatos + formulário de contato, preço "sob consulta": sem benchmark brasileiro confiável de construção; referência de nicho B2B: CPM R$ 120–165 em um site de tecnologia, dado único).
- **Dados:** tabelas `nj_ad_slots` (id, formato, local), `nj_campaigns` (anunciante, slot, imagem, link, início/fim, rótulo, ativo), `nj_ad_events` (impressão/clique agregados por dia, sem cookies nem IP completo), `nj_leads_anuncie`. Cliques via rota `/r/[id]` (registra e redireciona 302); nomes neutros (`/parceiro/`) para evitar bloqueadores. RLS: leitura pública só de campanhas ativas; escrita via servidor.

### 2. Fontes, "autoria própria" e imagens — situação honesta
- Hoje **nem todas as fontes coletam**: 50 fontes no registro, mas só 4 coletores (BCB, PNCP, IBGE, Banco Mundial); feeds RSS de veículos, press rooms, DOU/INLABS, Caged, SINAPI, CUB, Eurostat/Census ainda **não existem** e os feeds nunca foram testados. Plano: adaptadores RSS/Atom (título+link+data+trecho ≤200 car.), DOU/INLABS, SINAPI/CUB (planilhas), Caged; teste com probe de rede do usuário.
- **Cobertura do setor (matriz categoria × fonte)**: Mercado (CBIC, IBGE, Abramat, FGV IBRE, SindusCon), Infraestrutura (PNCP, DNIT, ANTT/ANTAQ/ANAC/ANEEL, ABDIB, iNFRA), Materiais (Abramat, SINAPI, CUB), Crédito/Habitação (BCB, ABECIP, Caixa, Min. Cidades), Segurança/Regulação profissional (MTE/NRs, CAU, Confea, DOU), Tecnologia (veículos globais como radar), Internacional (Banco Mundial, Eurostat, Census, BID/CAF). Lacunas a listar na planilha após o probe.
- **Fluxo "radar → fato → matéria própria"** (já no pipeline): veículo = só manchete+link; texto completo à IA só de fontes liberadas; a IA escreve a partir dos fatos; checagens de originalidade/números; 2ª fonte; revisão humana. Itens de veículo restrito entram numa fila "pauta" para o editor buscar a **fonte primária** (release/dado).
- **Imagens das notícias de terceiros: não reutilizar** (foto de matéria e og:image são do fotógrafo/veículo). Hierarquia: 1) **gráfico/infográfico próprio gerado dos dados** (cartão com número, série, mapa por UF) — principal; 2) biblioteca `nj_photos` licenciada/genérica por tema (sem rosto nem logo); 3) imagens de órgãos com licença/uso permitido (Agência Senado/Câmara com crédito; gov.br conferindo termo); 4) fotos do Grupo Nery. Automatizar: matéria → tema → foto da biblioteca ou card de dado; sempre com crédito/licença.

### 3. Licitações por estado (valor pago, escopo pequeno)
- Base: PNCP (Lei 14.133 art. 174: divulgação centralizada e obrigatória; cobertura incompleta em municípios pequenos até a transição — avisar no produto). API: filtros do servidor **não confiáveis** (relato 3ª parte: ignora filtros silenciosamente; `uf` não confirmado; ~12 chamadas/min; paginação 10–50). Estratégia: **job noturno** por modalidade e janela de datas → tabela própria `nj_licitacoes` (id PNCP, órgão, UF, município, objeto, modalidade, valor estimado, abertura/encerramento da proposta, situação, link de origem, categoria de obra por palavras-chave) e **filtrar do nosso lado** por UF/valor/palavra-chave.
- Produto: página gratuita `/licitacoes` (últimos 7 dias, filtro por UF, resumo por estado, link para o edital) + **plano "Pro"** (alertas por e-mail por UF/palavra/faixa de valor, histórico, exportação CSV, comparação de contratos/atas de obras similares, CUB/SINAPI por UF). Benchmark de preço: Alerta Licitação a partir de R$ 44,90/mês (R$ 30,80/mês no anual); concorrentes maiores "sob consulta" → faixa inicial sugerida R$ 29–99/mês (hipótese). **Validar antes de construir cobrança:** lista de espera/pré-venda e medir inscritos.
- Aviso legal: vender análise/alertas, não "acesso a dado público"; link ao edital de origem; "PNCP é a fonte oficial"; revisão LGPD para pessoa física/MEI; ler os termos do PNCP.

### 4. Newsletter (estrutura da página da Maersk)
- Página `/newsletter` no padrão do print: hero escuro com título "Inscreva-se para receber a newsletter <nome>", texto, campo de e-mail, botão "Enviar", texto de consentimento (checkbox desmarcado) e rodapé. Nome da newsletter: decisão do usuário (evitar copiar "Pulse").
- **Fluxo duplo opt-in:** e-mail → linha `pending` com texto/versão do consentimento, data e URL → e-mail de confirmação com link/token → página de preferências (setor, UF para licitações, frequência) → confirmado. Tela pós-cadastro: "Agradecemos seu cadastramento. Você se inscreveu para receber boletins informativos. Em breve, você receberá um e-mail que explicará como definir suas preferências de boletim informativo e cancelar a inscrição." (o usuário enviará o print do estado pós-inscrição para igualar o visual).
- **E-mail:** Resend para confirmação e envios (API simples no Next/Vercel; free 3.000 e-mails/mês, Pro US$ 20 p/ 50 mil — fontes secundárias, conferir), tabelas próprias no Supabase (`nj_subscribers` + `nj_subscriber_prefs`, log de eventos subscribe/confirm/unsubscribe), cabeçalhos `List-Unsubscribe` + `List-Unsubscribe-Post` (RFC 8058), SPF/DKIM/DMARC em subdomínio (`news.<domínio>`), taxa de spam < 0,1%. Alternativa: Beehiiv (hospedado, mais caro e acoplado). Decisão do usuário.
- **Edição semanal automática:** destaques publicados + indicadores + top licitações por UF + bloco patrocinado (slot e), sempre com revisão antes do envio.
- LGPD: consentimento como base; sem checkbox pré-marcado; descadastro em 1 clique; política de privacidade revisada por advogado.

### Decisões do usuário (rodada 3) — valem sobre o texto acima
- Cor: **azul claro parecido, não idêntico** (ex.: `#3DA9D6`); logo N próprio enviado.
- E-mail: **sem provedor por enquanto** — entregar só a estrutura (tabelas, páginas, rota de inscrição, log de consentimento, página de preferências e de agradecimento, esqueleto do envio com `List-Unsubscribe`); o usuário escolhe o provedor depois. A inscrição fica em `pending` e a tela de agradecimento avisa que o e-mail de confirmação será enviado; **nenhum e-mail real é enviado**.
- Nome da newsletter: **Boletim Nery Journal**.
- Licitações Pro: **validar antes** (página gratuita por UF + lista de espera/pré-venda; sem cobrança nem login agora).

### Fases de execução propostas
R3-A (rápida): logo + cores + slots de patrocínio + /anuncie + página /newsletter + tela de agradecimento (sem envio real).
R3-B: migração `007` (anúncios, licitações, preferências), adaptador RSS + DOU, job noturno de licitações, página /licitacoes por UF.
R3-C: envio real com Resend (após chaves), pré-venda do plano Pro, edição semanal.

### Verificação (rodada 3)
Build do site e do app raiz; testes das funções puras (classificação de obras, normalização de licitações); capturas desktop/mobile; RLS (anon só lê campanhas ativas e artigos publicados); conferir rótulo "Publicidade" em todo slot; probe de rede (PNCP com `uf`, páginas, 429) numa máquina com internet.

## Rodada 4 — coleta de verdade, licitações (R$ 9,99), newsletter revisada, chaves

Decisões do usuário: pagamento por **link Asaas/Stripe**; revisão/publicação de matérias **pelo chat**; e-mail de contato **neryadministrativo@gmail.com**; endereço **São Paulo/SP e Brasília/DF**; trocar "cadastramento" por "cadastro"; logo reenviado (arquivo idêntico ao anterior: md5 igual → sem mudança; segue pedindo SVG); lembrar das chaves.

### A. Newsletter: ajustes e auditoria de prontidão
- Texto: "Agradecemos seu cadastro" (título/metadata de `/newsletter/obrigado` e `lib/emails.ts`); usar "cadastro" em todo o site.
- Contato e endereço: e-mail no `/sobre#contato` (mailto), `/privacidade` (contato do controlador), `/anuncie`, rodapé do site e rodapé dos e-mails; endereço "São Paulo/SP · Brasília/DF"; CNPJ/razão social ainda a informar (aviso).
- Logo nos e-mails: `<img src="${NEXT_PUBLIC_SITE_URL}/logo-grupo-nery.png">` na faixa azul (URL absoluta; depende do domínio).
- Novo: modelo de edição semanal (`weeklyEmail`) e página `/newsletter/email-preview` (noindex) para ver confirmação, boas-vindas e semanal; cabeçalhos `List-Unsubscribe` prontos no `sendMail`.
- Auditoria: **pronto** = formulário completo, consentimentos separados, obrigado, preferências, cancelar, confirmação por link, tabelas e log de consentimento, modelos de e-mail; **falta** = provedor de envio, chave de serviço (hoje 503), domínio/SPF/DKIM/DMARC, teste ponta a ponta com banco real, montagem automática da edição semanal.

### B. Fontes e tratamento "pelo chat" (como resolver o que falta)
- Limite: este ambiente não alcança os sites; **GitHub Actions alcança**. Criar workflows `nj-probe` (manual, sem segredos), `nj-discover-feeds` (manual) e `nj-collect` (agendado + manual, usa segredos). Com o conector do GitHub eu disparo e leio os logs aqui; os resultados caem no Supabase, que eu leio por SQL; ajusto os adaptadores e repito. Se o conector estiver fora do ar, o usuário clica "Run workflow" e cola o log.
- **Descoberta de feeds** (`nj_source_checks`): para cada fonte ativa, buscar a home, `/robots.txt`, `<link rel="alternate" type="application/rss+xml">`, `/feed`, `/rss`; gravar status HTTP, feed encontrado, robots ok, URL de termos para revisão humana. Não raspa HTML de matérias.
- **Adaptadores novos:** RSS/Atom genérico (lê `feed_url` das fontes aprovadas; guarda título, link, data, trecho ≤200 car.); Eurostat (API JSON); SINAPI (Caixa, planilha XLSX) e CUB (PDFs do SindusCon, extração de texto); depois DOU/INLABS (exige conta: credenciais como segredo) e Caged (arquivos grandes). Cada um com probe e teste de parsing em amostras sintéticas.
- **Redação sem chave de IA, pelo chat:** (1) eu consulto `nj_pauta_items` no Supabase; (2) para dados abertos, redijo a partir dos fatos do `payload`; para veículo, uso manchete+link e peço ao usuário os fatos ou a fonte primária; (3) rodo `checkArticle` (originalidade, números, fonte primária) localmente; (4) mostro o rascunho; (5) o usuário aprova e eu publico (`status='publicado'`) via SQL. Limitação: depende deste chat estar ativo; automação com `ANTHROPIC_API_KEY` num workflow vem depois.
- **Imagens próprias dos dados:** migração `008` adiciona `nj_articles.cover jsonb` ({número, legenda}); o site mostra um cartão com o número grande no lugar da foto (sem arquivos, sem licença). Fotos genéricas continuam via `nj_photos`.
- Placeholders somem quando houver artigos reais publicados.

### C. Licitações por estado + plano de R$ 9,99 (primeiros 10)
- Migração `008`: `nj_licitacoes` (id PNCP único, órgão, UF, município, objeto, modalidade, valor estimado, abertura/encerramento da proposta, situação, link de origem, é_obra, atualizado_em) com leitura pública (dado público); `nj_pro_subscribers` (e-mail, token, UFs, palavras-chave, valor mínimo, status pendente/ativo, preço cobrado, início, referência do pagamento); RLS fechado.
- Coletor `collectPncpLicitacoes`: por modalidade e janela de datas, ≤12 chamadas/min, backoff no 429, trata 204, paginação ≤50; filtra **do nosso lado** por UF/valor/palavras de obra (`classifyObra` testada); roda à noite no workflow `nj-collect`.
- Páginas: `/licitacoes` (grátis: últimos 7 dias, filtro por UF, contagem por estado, tabela com link do edital, aviso "PNCP é a fonte oficial; cobertura incompleta em municípios pequenos"); `/licitacoes/pro` (oferta **R$ 9,99/mês para os 10 primeiros**, "vagas restantes", benefícios: filtros por UF/palavra/valor, histórico, exportação CSV, alertas por e-mail quando houver provedor; botão para o **link de pagamento Asaas/Stripe** via `NEXT_PUBLIC_PRO_CHECKOUT_URL` + formulário de interesse); `/licitacoes/meu?token=` (lista filtrada privada + CSV).
- Ativação **manual pelo chat** após o pagamento (SQL: status ativo + preço). Subida de preço depois: tabela de faixas documentada no código.
- Obrigações (avisar o usuário): CNPJ e emissão de NFS-e, termos de uso, direito de arrependimento de 7 dias (CDC art. 49), LGPD; texto da oferta é rascunho para advogado.

### D. Chaves (lembrete)
- **GitHub → Settings → Secrets → Actions:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (coleta/descoberta/licitações). Depois: `ANTHROPIC_API_KEY`, credenciais INLABS.
- **Vercel (projeto `nery-journal-site`):** `SUPABASE_SERVICE_ROLE_KEY` (newsletter, anuncie, preferências), `NEXT_PUBLIC_SITE_URL` (quando houver domínio), `NEXT_PUBLIC_PRO_CHECKOUT_URL` (link Asaas/Stripe). `CRON_SECRET` e o cron do app antigo deixam de ser necessários (coleta migra para GitHub Actions).
- Lembrar o usuário: agendar lembrete (`send_later`) ao iniciar a execução e repetir o aviso no fim de cada resposta até ele confirmar.

### Execução proposta (ordem)
1) ajustes de newsletter + e-mails + preview; 2) migração 008 + workflows + descoberta de feeds + RSS; 3) coletor e páginas de licitações + oferta Pro; 4) testes de funções puras, build, lint, capturas, deploy; 5) checklist de chaves e primeiro ciclo de coleta quando os segredos existirem.

### Verificação (rodada 4)
Testes das funções puras (normalização/classificação de licitações, parsing RSS, SINAPI/CUB com amostras sintéticas); `next build` e lint; capturas de `/newsletter`, `/newsletter/email-preview`, `/licitacoes`, `/licitacoes/pro`; RLS (anon lê só licitações públicas e artigos publicados; não lê assinantes nem `nj_pro_subscribers`); depois dos segredos: rodar `nj-probe`/`nj-discover-feeds`, conferir `nj_source_checks`, `nj_licitacoes` e testar inscrição ponta a ponta.

## Pendências (usuário)
- **Lembrete: colocar as chaves** (ver seção D).
- Chaves/variáveis: SUPABASE_SERVICE_ROLE_KEY do GNC, CRON_SECRET, chave da API de IA.
- Escolher wordmark e cor de destaque; textos de política editorial/privacidade revisados por advogado.

## Rodada 5 — repositório próprio `nery-journal` + migração 008 e workflows

Decisões: novo repo **`Joaodesouzanery/nery-journal`, público**; ADMINISTRATIVO fica intacto por enquanto. O usuário colou as variáveis no Vercel (possivelmente duplicadas) e depois cola o Supabase no novo repo.

### 0. Novo repositório (primeiro passo)
- Criar com `mcp__github__create_repository` (público, sem README) e anexar à sessão com `add_repo` (access push); clonar em pasta separada.
- Conteúdo copiado (com histórico do site via cópia simples, sem subtree): `nery-journal/site/*` → raiz do novo repo (Next.js na raiz, `vercel.json` sem `outputDirectory` especial se necessário), `nery-journal/pipeline`, `nery-journal/templates`, `api/_nj` + `scripts/nj-probe.mjs` → `collectors/` e `scripts/`, `supabase/migrations/005–008`, `docs/fontes_nery_journal.xlsx`, `docs/brand.md`, README. Novo `package.json` raiz único, `tsconfig`, `eslint` próprios; remover cron antigo.
- **Antes de publicar (repo público):** varrer por segredos (`run_secret_scanning`/grep) — só a chave publicável do Supabase pode aparecer, nunca a service role. Avisar: textos de consentimento/privacidade e a lógica de licitações ficam visíveis.
- Vercel: o projeto `nery-journal-site` hoje aponta para ADMINISTRATIVO com root `nery-journal/site`. Reconectar ao novo repo (Settings → Git, ou criar projeto novo via `create_git_project`) com root `.`; **ele reconecta ou eu recrio** e conferir env vars duplicadas com `filter_project_envs` (sem ler valores).
- Supabase GNC permanece o mesmo projeto; o usuário só cola as chaves nos Secrets do novo repo (Actions) e no Vercel.

### 1. Migração 008 e workflows (no novo repo)
Conforme seções B e C da Rodada 4: `nj_source_checks`, `nj_licitacoes`, `nj_pro_subscribers`, `nj_articles.cover`; workflows `nj-probe`, `nj-discover-feeds`, `nj-collect`; adaptadores RSS/Eurostat; coletor e páginas de licitações; oferta R$ 9,99.

### Verificação
Build/lint/testes no novo repo; `git ls-files` sem segredos; deploy READY a partir do novo repo; workflow `nj-probe` disparado via GitHub MCP.

## Rodada 6 — fontes de notícias (RSS + descoberta), autoria diária, Vercel no repo novo

Decisões do usuário: público = construtoras e engenheiros; foco = **licitações**; newsletter para construtoras, engenheiros, fornecedores e poder público, valor = **notícia + licitação por UF**; sem Anthropic API Key por enquanto (manual ou cron do Claude); quer notícias de engenharia/construção **inclusive internacionais**; quer que eu conecte o Vercel ao repo `nery-journal` e explique o GitHub passo a passo; "depois precisa funcionar normalmente".

Estado do banco (GNC): `nj_sources` tem 50 fontes (5 dado_aberto liberadas, 6 órgão, 6 release, 33 veículo), **nenhuma com `feed_url`**. Vercel: projeto `nery-journal-site` ainda ligado ao ADMINISTRATIVO; último deploy de produção em ERRO.

### 1. Descoberta de feeds + adaptador RSS (repo nery-journal)
- `collectors/feeds.ts` (funções puras testadas com XML **sintético**): `discoverFeeds(html, baseUrl)` (`<link rel=alternate type=rss|atom>`), `parseFeed(xml)` RSS 2.0 e Atom → {título, link, data, trecho ≤200 car. sem HTML}, `robotsAllows(robotsTxt, path, ua)`. Parser: `fast-xml-parser`.
- `scripts/nj-discover-feeds.mjs` + workflow `nj-discover-feeds` (manual): para cada fonte ativa busca home, `/robots.txt` e candidatos `/feed`, `/rss`, `/feed.xml`; grava em `nj_source_checks` (status, robots, feed encontrado, termos) e, se achar feed válido, `nj_sources.feed_url` (só sugestão: `active` inalterado). User-Agent identificado, 1 req/s por host, nunca raspa HTML de matéria.
- `collectFeeds()` em `collectors/sources.ts`: lê fontes ativas com `feed_url`, grava em `nj_pauta_items` (kind `noticia`, só manchete + link + trecho ≤200) com dedupe por link; respeita robots; erro por fonte não derruba as demais. Entra no `nj-collect` diário.
- **Cobertura de fontes** (semear/ajustar `nj_sources` por migração 009 com URLs oficiais conhecidas; `feed_url` só após o probe): Brasil — CBIC, SindusCon-SP, Câmara Brasileira da Indústria da Construção, IBGE Notícias, Agência Gov/Min. Cidades, DNIT, ANTT, ANEEL, Confea, CAU/BR, Abramat, Sinduscon-DF, Valor/Estadão/Folha (só manchete+link), Construção Mercado, Techne, Infra Notícias, Revista Construção e Mercado, Obras24h; Internacional — ENR, Construction Dive, Construction News (UK), Building (UK), ArchDaily, Dezeen, Construction Europe, Global Construction Review, World Bank/IDB/CAF news, Eurostat. Lista final conferida contra a matriz do xlsx; veículos ficam `allow_fulltext=false, allow_ai=false` (radar).
- Eurostat (API JSON: produção na construção, `sts_copr_m`) como coletor de dado; sinalizar SINAPI/CUB/DOU/Caged como próximos.
- Itens em inglês viram pauta com `lang`; a matéria própria é escrita em PT-BR **a partir de fatos de fonte primária**, nunca tradução de matéria única.

### 2. Autoria diária sem API key
Recomendação: **cron do Claude (tarefa agendada, sessão nova por disparo)** gera *rascunhos* uma vez por dia: lê `nj_pauta_items` novos (dados abertos, licitações), escreve a partir dos fatos, roda `checkArticle`, grava em `nj_articles` com `status='em_revisao'`; **nada é publicado sozinho**. Você abre o chat, eu mostro os rascunhos, você aprova e eu publico (SQL). Matéria baseada em veículo só entra se houver fonte primária (você ou eu a fornecemos); senão fica na pauta. Se preferir, o mesmo manualmente a qualquer hora. Antes de criar a tarefa agendada: confirmar com o usuário horário (fora de 6–9h PT) e se ele quer e-mail/push de aviso.

### 3. Vercel → repo novo (eu faço)
- Tentar `create_git_project` (repo `Joaodesouzanery/nery-journal`, framework nextjs, root `.`) no time `team_yqBLMg8jWVHIXVYD3hXCz7ov`; setar por MCP `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publicáveis); o usuário cola só `SUPABASE_SERVICE_ROLE_KEY` (+ `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PRO_CHECKOUT_URL`) por não ser seguro eu manusear segredos. Se o Vercel exigir o app GitHub no novo repo, passo a passo ao usuário. Desligar proteção (público), `noindex` mantido. Depois aposentar o projeto antigo apenas se o usuário pedir.
- Verificar: deployment READY via `get_deployment`/`web_fetch_vercel_url` (`/noticias`, `/licitacoes`, `/newsletter/email-preview`).
- Diagnosticar o deploy em ERRO do projeto antigo só se ainda for usado.

### 4. GitHub passo a passo (para o usuário)
Repo `nery-journal` → Settings → Secrets and variables → Actions → New repository secret: `SUPABASE_URL` (https://jquybkqdxbiosnzsufyh.supabase.co) e `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API → service_role). Actions → habilitar workflows se pedir → rodar `nj-probe`, `nj-discover-feeds`, `nj-collect` (Run workflow). Colar o log aqui.

### 5. Newsletter (foco: notícia + licitação por UF)
Edição semanal = destaques publicados + **top licitações por UF** (do `nj_licitacoes` e `nj_subscriber_prefs.ufs`) + indicadores; `buildWeekly()` pura e testada + prévia em `/newsletter/email-preview` com dados reais; envio segue desligado até haver provedor.

### Verificação
`npm test` (feeds/robots/RSS/Atom sintéticos), `tsc`, `next build`; migração 009 + RLS (`get_advisors`); Vercel READY e páginas 200; após segredos: `nj-probe`, `nj-discover-feeds`, `nj-collect` e conferir `nj_source_checks`, `nj_pauta_items`, `nj_licitacoes` por SQL.

## Rodada 7 — rodar o probe, revisar tudo e finalizar (sem link de pagamento por ora)

Decisão do usuário: secrets do GitHub Actions já colocados; **sem link Asaas/Stripe por enquanto** (botão de pagamento fica oculto; só interesse); "finalize tudo e revise tudo".

### Revisão feita (somente leitura)
- Supabase advisors: só `rls_enabled_no_policy` (INFO, **intencional**: tabelas `nj_*` fechadas, acesso só pela service role) e `public.rls_auto_enable()` SECURITY DEFINER executável por anon/authenticated (WARN, função **não criada por nós**; avaliar `revoke execute ... from anon, authenticated` com confirmação do usuário).
- Pendências achadas no repo `nery-journal`: README ainda descreve `api/` e cron do Vercel; `.env.example` sem `NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_PRO_CHECKOUT_URL`; `/noticias` ainda mostra Indicadores/Licitações **de exemplo** (`INDICADORES_PLACEHOLDER`, `LICITACOES_PLACEHOLDER`); sem `sitemap`/RSS/JSON-LD; `List-Unsubscribe` ausente (sem provedor); `nj-probe` só testa os 4 coletores (não licitações nem feeds); disparo de workflow pela integração dá 403.

### Execução (após aprovação)
1. **Rodar o nj-probe:** tentar `actions_run_trigger` (falhou com 403 antes); se falhar, pedir ao usuário Actions → nj-probe → Run workflow e ler o log por `actions_list`/`get_job_logs` (leitura funciona?) ou ele cola. Incluir no `nj-probe` o teste de licitações (modo teste sem segredos) e uma checagem de feeds por URL das fontes. Ajustar coletores conforme o log; repetir `nj-discover-feeds` e `nj-collect`; conferir `nj_source_checks`, `nj_pauta_items`, `nj_licitacoes` por SQL.
2. **Finalizar o site:** `/noticias` e home usam dados reais (indicadores do `nj_pauta_items` BCB/IBGE; licitações de `nj_licitacoes`), placeholders só quando o banco estiver vazio; página Pro mostra "Pagamento em breve" sem o link; `sitemap.xml`, `robots`, `feed.xml` (RSS próprio) e JSON-LD NewsArticle nas matérias; README e `.env.example` atualizados; `List-Unsubscribe` pronto no `sendMail`.
3. **Edição semanal:** `buildWeekly()` pura+testes (destaques publicados + top licitações por UF do assinante + indicadores), prévia com dados reais em `/newsletter/email-preview`.
4. **Fontes:** adaptador Eurostat (JSON) com teste sintético; SINAPI/CUB/DOU/Caged documentados como próximos.
5. **Autoria diária:** criar a tarefa agendada (cron do Claude, sessão nova) que grava rascunhos `em_revisao`, só com o horário confirmado pelo usuário.
6. **Revisão final:** `npm test`, `tsc`, `next build`, secret scan, `get_advisors`, deploy READY e fetch de `/`, `/noticias`, `/licitacoes`, `/licitacoes/pro`, `/newsletter`, `/newsletter/email-preview`; lista de pendências (CNPJ/NFS-e, termos, advogado, domínio, provedor de e-mail, SVG do logo, INPI).

## Rodada 8 — consertar coleta/descoberta, mais fontes (RSS e internacionais), tarefa diária 07:00

Decisões: service role já está no Vercel (`nery-journal`); horário da tarefa diária de rascunhos = **07:00 Brasília**; Vercel↔GitHub: projeto `nery-journal` está ligado ao repo (push na `main` = deploy), correto.

### Achados nos logs (GitHub Actions, dados reais)
- Probe: BCB, PNCP (20 itens), Banco Mundial e licitações (308 obras em 2 dias, ~2 min) **funcionam**. **IBGE: `UND_ERR_CONNECT_TIMEOUT`** (servicodados.ibge.gov.br não responde a IPs do GitHub; `caixa.gov.br` também: home=0).
- Descoberta de feeds: achou feed em CBIC (`cbic.org.br/feed/`), SindusCon-SP (`sindusconsp.com.br/feed/`) e Agência Infra (`agenciainfra.com/blog/feed/`), depois **quebrou**: `fast-xml-parser` lança "Maximum nested tags exceeded" ao ler um candidato que é HTML → o job aborta; só 4 das 29 fontes foram checadas.
- **`nj-collect` nunca disparou**: o `replace` do gatilho `push` não casou com o início do arquivo (`on: schedule`), então o workflow não tem `push` (banco: 0 licitações, 0 pauta).

### Correções (repo nery-journal)
1. `nj-collect.yml`: adicionar `push: paths ['.github/triggers/collect']`.
2. `collectors/feeds.ts`: `parseFeed` devolve `[]` em XML inválido/HTML (try/catch, limite de tamanho); `scripts/nj-discover-feeds.mjs` e `nj-feeds.mjs` com try/catch **por fonte** (uma fonte ruim não derruba as outras); teste com HTML/entrada inválida.
3. IBGE/Caixa: **testar a partir da Vercel região `gru1` (São Paulo)** com uma rota temporária protegida (`/api/br-probe`, `preferredRegion = 'gru1'`, segredo `CRON_SECRET`). Se responder, mover IBGE (SINAPI) e Caixa para `GET /api/cron/br-sources` (Vercel Cron diário, grava via service role) e tirar o IBGE do GitHub; se não responder, trocar a fonte do SINAPI (BCB/INCC e CBIC como proxy) e documentar. Pede ao usuário **1 variável nova no Vercel: `CRON_SECRET`** (texto aleatório longo).
4. Rodar de novo por push em `.github/triggers/`: `collect`, `discover`, `probe`; conferir por SQL `nj_licitacoes`, `nj_pauta_items` (kind dado/licitacao/noticia), `nj_source_checks`, `nj_sources.feed_url`.

### Mais fontes de notícias (RSS e internacionais)
- Migração 011 insere/atualiza `nj_sources` (todas `allow_fulltext=false, allow_ai=false`, só manchete+link) com a **home**; a descoberta confirma o feed. Brasil: Agência Brasil, Agência Gov, Agência Câmara, Agência Senado, gov.br Cidades/Transportes/DNIT/ANTT (seção de notícias), Sinduscon-MG/Rio/DF, Revista Infra, Diário do Comércio. Internacional: ENR, Construction Dive, Equipment World, ForConstructionPros, Construction News, New Civil Engineer, Infrastructure Intelligence, Construction Europe, Construction Week (Oriente Médio), Engineering News (África), ArchDaily/Dezeen, World Bank blogs, IDB/CAF, Eurostat news. Fontes sem RSS: ficam registradas com `note` e, se o robots permitir, **sitemap de notícias** (só título+URL) como adaptador futuro; sem raspagem de HTML de matéria e sem Google News.
- Itens em inglês entram com `payload.lang='en'`; matérias próprias sempre em PT-BR a partir de fonte primária.
- Eurostat: coletor JSON `sts_copr_m` (produção na construção) com teste sintético e probe. SINAPI/CUB (planilhas/PDF), DOU/INLABS (credenciais) e Caged: após o resultado de `gru1` (muitos hosts .gov.br bloqueiam IPs estrangeiros), decidir onde rodam.

### Itens que o usuário perguntou
- Probe de novo: sim, já rodado (resultados acima); rodar de novo após as correções. O GitHub está conectado ao Vercel (deploy a cada push) e os secrets do Actions funcionam (`SUPABASE_*` lidos no discover).
- Trocar exemplos por dados reais: migração 010 aplicada + `/noticias` já usa dados reais; falta a coleta gravar (correção 1).
- **Tarefa diária 07:00 Brasília** (`10:00 UTC`, minuto jitter, sessão nova): lê `nj_pauta_items` novos, escreve rascunhos em `nj_articles` com `status='em_revisao'` (fonte primária obrigatória, `checkArticle`), **não publica**; você aprova no chat. Criar com `create_trigger` após a coleta estar gravando.

### Verificação
`npm test`, `tsc`, build; `get_job_logs` dos 3 workflows; SQL de contagens; `/noticias` e `/licitacoes` no Vercel mostrando dados reais (fetch); advisors.

## Rodada 9 — resultado da coleta real e próximos ajustes (28/10)

### Resultado medido no banco (GNC) após o 2º ciclo
- `nj_licitacoes`: **308** obras reais (PNCP). Indicadores: 4 (BCB ×3, Banco Mundial). Notícias (RSS): **91** itens de 4 fontes (CBIC 30, Agência Infra 30, Building Design+Construction 25, SindusCon-SP 6). Checagens: 64. **21 fontes com feed** descoberto, mas só 4 já coletadas (a coleta rodou antes de a descoberta terminar).
- Sem acesso a partir do GitHub (home 0/403): IBGE, Caixa, CAF, Eurostat, Construção Mercado, Revista Infra, O Empreiteiro (timeout) e BID, BNamericas, CAU/Confea, ABDIB, Equipment World, ForConstructionPros, Infrastructure Intelligence, Engineering News, Construction Global/Week (403: bloqueio anti-bot/IP; **não contornar**).

### Bug a corrigir
`robotsAllows` trata regra com curinga no início (ex.: `Disallow: /*?s=`) como prefixo vazio e **bloqueia tudo** → `robots_allows=false` em ~25 fontes (ENR, Building UK, ArchDaily, gov.br, Agência Câmara/Gov, FGV, Sienge, World Bank blogs, KHL, DNIT…), que então nem têm o feed gravado. Corrigir com casamento real de padrões (`*` e `$`), regra mais específica vence; testes (curinga no início, `$`, Allow vs Disallow). Depois rodar `discover` de novo.

### Próximos passos (após aprovação)
1. Corrigir `robotsAllows` + testes; push com gatilhos `discover` e depois `collect` (coleta depois da descoberta); conferir contagens por SQL e `/noticias`.
2. Fontes bloqueadas por IP/anti-bot: registrar `note`, manter fora; alternativas legítimas (feeds oficiais por outro host, newsletters por e-mail, ou usar a Vercel `gru1`/outra região só para hosts BR). Teste `gru1` depende de `CRON_SECRET` no Vercel.
3. Coletor Eurostat (JSON) — hoje `ec.europa.eu` deu timeout a partir do GitHub: testar o endpoint da API (`api.europa.eu/eurostat`) no probe antes de codar.
4. Tarefa diária 07:00 Brasília (10:00 UTC) para rascunhos `em_revisao`, **sem publicar**: criar agora que há dados (licitações, indicadores, 91+ itens de notícia).
5. Revisão final do site em produção (`/`, `/noticias`, `/licitacoes`) com dados reais.

## Rodada 10 — coletar de todas as fontes possíveis, ampliar cobertura, Vercel (SITE_URL e CRON_SECRET), site no ar

Pedido: "não quero só 4 fontes"; resolver as fontes com timeout/403; `NEXT_PUBLIC_SITE_URL` não é do pagamento (explicar); **eu** resolvo o `CRON_SECRET`; no fim mostrar o site funcionando com notícias.

### Estado (banco, após a descoberta corrigida)
23 fontes com feed (Abramat, Agência Infra, Agência Brasil, Agência Gov, Agência Senado, Build Australia, BDC, CBIC, Construction Dive, Construction Enquirer, Construction Executive, Construction News, Dezeen, Diário do Comércio, Dodge, Global Construction Review, Highways Today, New Civil Engineer, Secovi-SP, Sinduscon-DF, SindusCon-SP, Smart Cities Dive, The Construction Index). 19 com home ok e sem feed, 7 cujo robots realmente bloqueia, 19 inacessíveis. A coleta ainda não rodou sobre os 23 feeds (só 4 tinham feed no 1º ciclo).

### Passos
1. **Coleta agora:** push de `.github/triggers/collect`; conferir por SQL itens por fonte e erros no log; ajustar parse por feed que falhar (ex.: Atom da Agência Gov, RSS com namespaces).
2. **Descoberta semanal automática:** `nj-discover-feeds` ganha `schedule` (segunda 08:00 UTC) para pegar novos feeds sem ação manual; coleta diária continua às 09:00 UTC.
3. **Mais cobertura legítima para as 19 fontes com home ok e sem feed:** adaptador de **sitemap de notícias** (`news-sitemap.xml`/`sitemap` indicado no robots.txt; só título+URL+data; respeita robots; sem abrir páginas de matéria). Candidatos: ENR, ArchDaily (BR e int.), Building UK, FGV IBRE, KHL/International Construction, World Bank blogs, gov.br Cidades/Transportes/DNIT, Agência Câmara, Canadian DCN. Teste com sitemap sintético; descoberta registra `sitemap_url`.
4. **Fontes com timeout/403 (IBGE, Caixa, CAF, Eurostat, Construção Mercado, Revista Infra, O Empreiteiro; BID, BNamericas, CAU/Confea, ABDIB, Equipment World, ForConstructionPros, Infrastructure Intelligence, Engineering News, Construction Global/Week):** sem driblar bloqueios (nada de trocar User-Agent por navegador, proxies residenciais ou captcha). Caminhos legítimos, na ordem:
   - **Vercel Cron em outra rede** (`/api/cron/fontes-br`, `preferredRegion` `gru1`) para hosts brasileiros por timeout (IBGE, Caixa, CAF, Construção Mercado, Revista Infra, O Empreiteiro) — IPs diferentes dos do GitHub; mesmo UA identificado. Mede-se primeiro com uma rota de teste.
   - **APIs oficiais** em vez de HTML: IBGE `servicodados` (já usada), Eurostat API JSON (`ec.europa.eu/eurostat/api/dissemination`), BID/CAF dados abertos — testadas no probe.
   - **Pedir feed/licença**: para 403 comercial (ENR já ok por sitemap; Equipment World, ForConstructionPros, Infrastructure Intelligence, Engineering News, BNamericas, Construction Global/Week), e-mail à assessoria/redação (modelo pronto) ou assinar a newsletter oficial com e-mail dedicado do Grupo Nery; registrar `note` e manter fora até lá.
   - O que continuar bloqueado fica documentado em `nj_sources.note`/`nj_source_checks` e na planilha.
5. **Vercel (eu faço, via MCP):**
   - `NEXT_PUBLIC_SITE_URL` **não é do link de pagamento**: é o endereço público do próprio site (usado em links dos e-mails, logo nos e-mails, sitemap e RSS). Definir `https://nery-journal-joaodesouzanerys-projects.vercel.app` (trocar quando houver domínio próprio).
   - `CRON_SECRET`: gerar valor aleatório forte (`openssl rand -hex 32`), gravar como variável **sensitive** no projeto `nery-journal`, sem imprimir; usado só pela rota de cron/teste na Vercel.
   - `NEXT_PUBLIC_PRO_CHECKOUT_URL` fica vazio (sem pagamento por ora). Redeploy após as variáveis.
6. **Rota Vercel `gru1` (teste e, se funcionar, produção):** `app/api/cron/fontes-br/route.ts` protegida por `CRON_SECRET`, roda IBGE (SINAPI) + Caixa/CAF se acessíveis, grava em `nj_pauta_items` com service role; `vercel.json` com cron diário. Se `gru1` também der timeout, remover a rota e documentar.
7. **Eurostat** (coletor JSON) e **SINAPI/CUB**: implementar só após o probe confirmar o endpoint; testes sintéticos.
8. **Site com notícias:** `/noticias` e home passam a listar **radar de notícias** (itens de `nj_pauta_items kind='noticia'`: manchete, fonte, data, link para o original — nunca texto) além das matérias próprias; filtro por fonte/idioma; rótulo "Radar: via <fonte>". Política de leitura pública para `nj_pauta_items` com `kind='noticia'` (migração 012; só colunas públicas necessárias via view/policy). Conferir `/noticias` em produção com fetch.
9. **Tarefa diária 07:00 Brasília** (`create_trigger`, 10:00 UTC): rascunhos `em_revisao`, sem publicar.

### Verificação
`npm test`, `tsc`, build; logs dos workflows; SQL: itens por `source_id` (meta: ≥ 15 fontes com itens), `nj_source_checks` por motivo de falha; `get_advisors`; `/noticias`, `/licitacoes`, `/` em produção mostrando dados reais (fetch) e `feed.xml`/`sitemap.xml`.

## Rodada 11 — resultado (28/10 02:40 UTC) e o que falta

### Resultado medido
- `nj_pauta_items` kind noticia: **23 fontes** com itens (antes 4): Agência Infra 33, Highways Today 30, Dezeen 30, CBIC 30, The Construction Index 30, Secovi-SP 30, BDC 25, ArchDaily int. 24, Global Construction Review 24, Agência Gov 15, Agência Senado 15, Smart Cities Dive/Abramat/Construction Dive/Sinduscon-DF/Agência Brasil/Dodge/New Civil Engineer/Construction Enquirer/Diário do Comércio/Construction News 10 cada, SindusCon-SP 6, Build Australia 2.
- Site em produção (`/noticias`): Radar renderizado (~48 manchetes), indicadores reais (Selic/IPCA/INCC/Banco Mundial), sem "EXEMPLO". Run `nj-collect` terminou "failure" só por causa do passo IBGE (timeout), os demais passos rodaram (`!cancelled()`).
- Vercel `nery-journal`: `CRON_SECRET` (sensitive) e `NEXT_PUBLIC_SITE_URL` definidos. **Falta `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_URL` no projeto novo** (estão só no antigo `nery-journal-site`) → newsletter/Pro/Anuncie dão 503 até o usuário colar.

### Falta fazer (executar após aprovação)
1. Fazer o IBGE não derrubar o `nj-collect` (marcar o passo `continue-on-error` e registrar a fonte como "timeout" em `nj_source_checks`).
2. Adaptador de **sitemap de notícias** para fontes com home ok e sem feed (ENR, Building UK, FGV IBRE, KHL, World Bank blogs, gov.br etc.), com testes sintéticos; respeita robots.
3. **Descoberta semanal** (`schedule` segunda 08:00 UTC) no `nj-discover-feeds`.
4. **Rota `gru1`** (`/api/cron/fontes-br`, `CRON_SECRET`) para IBGE/Caixa/CAF/Construção Mercado/Revista Infra/O Empreiteiro; Vercel Cron diário; se também der timeout, remover e documentar.
5. **Eurostat** via API JSON após confirmar endpoint no probe.
6. **Tarefa diária 07:00 Brasília** (`create_trigger`, 10:00 UTC, sessão nova): lê pauta/radar, escreve rascunhos `em_revisao`, **não publica**.
7. Revisão final de `/`, `/noticias`, `/licitacoes` em produção; lista de pendências do usuário (service role no Vercel, CNPJ/NFS-e, advogado, domínio, provedor de e-mail, SVG do logo, INPI).

## Rodada 12 — resultado da sonda (28/10 02:52 UTC)

### Medido (função na Vercel, região real = iad1; `preferredRegion=gru1` NÃO foi aplicada no plano atual)
- **apisidra.ibge.gov.br: 200** (221 ms) — a API SIDRA responde (servicodados.ibge.gov.br dá timeout). **Eurostat API: 200** (1,4 s). BID: 403 (anti-bot). CAF: erro de certificado (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` — problema do site; não desligar verificação TLS). Caixa, Construção Mercado, Revista Infra, O Empreiteiro: timeout (provável bloqueio a IP estrangeiro; testá-los de São Paulo exigiria mudar a região de **todas** as funções do projeto para gru1 — não recomendado agora: o banco está em us-east-1 e o site ficaria mais lento).
- Descoberta de sitemaps: `com_feed` 23→24, 0 por sitemap (as outras fontes sem RSS não publicam sitemap de notícias com título).

### Execução (após aprovação)
1. **IBGE/SINAPI via `apisidra.ibge.gov.br`** (`/values/t/2296/n1/all/v/48/p/last 2`, JSON array com cabeçalho na 1ª linha) em `collectIbge`, com teste sintético do parser; validar no `nj-probe` (GitHub) — se também responder lá, o passo deixa de falhar.
2. **Coletor Eurostat** (`sts_copr_m`, geo BR/EU27, `lastTimePeriod=3`) com parser JSON-stat testado com amostra sintética; entra em `COLLECTORS`; probe confirma.
3. **Remover `/api/br-probe`** (temporária) e a ideia da rota `gru1`; registrar em `nj_sources.note` o motivo (timeout/anti-bot/certificado) das fontes sem acesso: Caixa, Construção Mercado, Revista Infra, O Empreiteiro, CAF, BID, BNamericas, CAU/Confea, ABDIB, Equipment World, ForConstructionPros, Infrastructure Intelligence, Engineering News, Construction Global/Week.
4. Modelo de e-mail de pedido de feed/licença às redações bloqueadas em `docs/pedido-de-feed.md` (para o usuário enviar).
5. Rodar coleta de novo (push em `.github/triggers/collect` e `probe`), conferir por SQL e `/noticias` em produção.
6. Fechar: lista de pendências do usuário (service role no Vercel do projeto novo, rotina com conector Supabase na claude.ai para a tarefa diária, CNPJ/NFS-e/advogado, domínio, provedor de e-mail, SVG do logo, INPI).

## Rodada 13 — saneamento, patrocínio WCR e primeiras matérias (28/10 12:50 UTC)

### Feito e no ar
- Vercel `nery-journal`: service role e URL presentes (Production); `/licitacoes/pro` mostra "restam 10" (banco lido). Botões azuis com texto branco (`--accent-btn #1a7aa8`, contraste 4,8:1). Capas SVG próprias por tema. Patrocínio WCR Saneamento (970×250 topo, 728×90 rodapé; `link_url '#aguardando-link'` → criativo sem clique). Página `/saneamento`, item de menu, filtro de licitações de saneamento, tema Saneamento no radar. Migração 013: 31 fontes de saneamento (`topic='saneamento'`); 13 já com feed descoberto. 6 agentes `nj-*` e `docs/pipeline-autoria.md`. 3 matérias em `em_revisao` (INCC-M/SINAPI, 315 licitações PNCP, aterro DF + drenagem PI), checadas por `scripts/nj-check.mjs`.
- Disparada a coleta com os feeds de saneamento (commit 60439f1); o commit foi feito antes de eu receber o aviso de modo de plano.

### Próximos passos (após aprovação)
1. Conferir o resultado da coleta (itens por fonte; tema Saneamento no radar) e `/saneamento` em produção.
2. Publicar as matérias que o usuário aprovar (`status='publicado'`, `published_at`, `reviewed_by`, `reviewed_at`) e conferir que os exemplos somem.
3. Ligar o clique do banner WCR quando o usuário mandar o link (`update nj_campaigns set link_url=...`).
4. Reaplicar a anotação de motivo nas fontes bloqueadas (pendente: SQL que pediu confirmação no Supabase).
5. Rodar de novo a descoberta nas fontes de saneamento que ainda não têm feed; pedidos de feed por e-mail às que bloquearam.
6. Rotina diária com conector Supabase em claude.ai (ou rascunhos sob demanda no chat).

## Rodada 14 — mobile, fotos reais livres, fontes como base, agentes 07h/12h/18h, mais matérias (28/10)

Decisões do usuário: **aprovação "Misto"; no início, para testar, publicar sozinho o que passar no verificador**; o que passar e estiver fora do padrão vira melhoria nos agentes/skill. **Imagens reais com licença livre, sem exibir crédito** (→ só CC0/domínio público e licenças Pexels/Unsplash, que não exigem crédito; CC BY fica de fora); nunca fotos dos jornais. O jornal é **para o Brasil todo**: notícias internacionais (ex.: saneamento) como curiosidade, estilo Not Journal. Fontes (inclusive em inglês) são **só base** para matérias nossas.

### Estado medido
Saneamento: 13 de 31 fontes com feed; **199 itens** coletados dessas 13 (total radar: construção 28 fontes/600 itens). Bloqueadas/sem feed: Sabesp, Abcon Sindcon, Assemae (403), Copasa (timeout), outras ainda sem feed; `nj_photos` existe (theme, url, origin_url, license, credit, has_people, has_logos, license_verified), sem política pública e sem uso no site.

### 1. Agentes em rotina 07:07 / 12:07 / 18:07 (BRT = 10:07 / 15:07 / 21:07 UTC)
- Criar 3 tarefas agendadas (sessão nova) tentando `connectors: ["Supabase"]` em `create_trigger`; se o conector não puder ser anexado, orientar o usuário a criar as rotinas em claude.ai/code/routines com o conector (texto pronto) e manter o modo sob demanda no chat.
- Cada rodada: `nj-triagem` escolhe até 6 pautas (mix: Brasil com fonte primária/dados e licitações; saneamento; internacional como curiosidade) → `nj-fonte-primaria` (WebSearch para confirmar com 2ª fonte ou fonte primária; o ambiente não abre páginas externas) → `nj-fatos` → `nj-redator` → `nj-verificador` (`scripts/nj-check.mjs`) → `nj-editor`: se APROVADO, grava `status='publicado'`, `published_at=now()`, `reviewed_by='auto-verificador'`; se REPROVADO, grava `em_revisao` com o motivo. Limite ~6 por rodada (≈18/dia).
- Regras para matéria baseada em veículo: fato precisa de fonte primária **ou** 2 fontes independentes; texto 100% próprio (sem tradução/paráfrase próxima; sobreposição ≤ 20% com título+trecho); linha "Com informações de <fonte>" com link; nunca fotos do veículo.
- Atualizar `.claude/agents/nj-*.md` (novo agente `nj-imagens`; formato "curiosidade internacional"; quotas), `docs/pipeline-autoria.md` e `docs/melhorias-agentes.md` (registro de falhas que passaram → regra nova).

### 2. Mais matérias agora
Lote de ~8–10 matérias a partir dos dados atuais (licitações por UF/saneamento, indicadores, Eurostat) e de 4–5 curiosidades internacionais de saneamento/construção confirmadas por WebSearch; passam pelo verificador; publicar as aprovadas (modo teste) e listar as reprovadas.

### 3. Fotos reais livres (sem crédito exibido)
- Migração 014: política de leitura pública em `nj_photos`; `nj_articles.photo_id` já existe.
- `scripts/nj-photos.mjs` + workflow `nj-photos` (GitHub, tem internet; agendado 07:40/12:40/18:40 BRT e por push em `.github/triggers/photos`): para cada matéria publicada sem foto, monta consulta em inglês pelo tema/palavras-chave do agente (`photo_query`), consulta **Openverse** (`license=cc0,pdm`, `category=photograph`, tamanho mínimo) e **Wikimedia Commons** (arquivos CC0/PD); descarta resultados com pessoas/logotipos pelas tags/título; grava em `nj_photos` (url, origin_url, licença, autor interno, `license_verified=true`) e liga `photo_id`. Pexels/Unsplash só se o usuário criar chave gratuita.
- Site: cartões e página da matéria usam a foto (`object-fit: cover`, `loading=lazy`, dimensões fixas) e caem na ilustração SVG se não houver. Sem crédito visível por decisão do usuário (guardado no banco para auditoria).

### 4. Mobile
Capturas Playwright em 390×844 e 360×800 de `/`, `/noticias`, `/saneamento`, `/licitacoes`, `/licitacoes/pro`, `/newsletter`, página de matéria e `/anuncie`; corrigir overflow do menu (novo item Saneamento), grade do radar (`minmax(min(100%,320px),1fr)`), tabelas com rolagem, banner WCR (728×90 no celular), botões e rodapé. Conferir toque ≥ 44px e legibilidade.

### 5. Respostas a dar ao usuário
- Saneamento: 13/31 fontes com feed; 199 manchetes; quais bloqueiam.
- Como o Nery Journal "cria a sua": a coleta só reúne manchetes (radar); a criação é feita pelos agentes acima, não existe seleção automática de tudo; limites do ambiente (sem abrir páginas externas; WebSearch para confirmar).
- Imagens: licença livre sem crédito = só CC0/PD e Pexels/Unsplash; CC BY exige crédito por lei.

### Verificação
`npm test`, `tsc`, build; workflows `nj-photos`/`nj-collect` verdes; SQL: artigos publicados, `photo_id` preenchido, 3 gatilhos criados (`list_triggers`); capturas mobile antes/depois; `/`, `/noticias`, `/saneamento` e matéria em produção; link final ao usuário.

## Rodada 15 — publicidade no topo, só fotos reais, fluxo do leitor, busca, licitações, Anuncie em popup, Sobre, textos-fonte

Pedidos do usuário (9 pontos) e decisões: banners no tamanho dos prints do Not Journal (~960×120, proporção 8:1, quase igual ao 728×90 da WCR) e **só no topo**; **nenhuma imagem criada por mim** (sem CoverArt/SVG/cartão de número): só fotos da internet com licença livre; usuário autorizou a tabela privada de textos das fontes.

### 1. Publicidade (pontos 2 e 4)
- `components/AdSlot.tsx` + `globals.css`: um único formato **960×120** (`aspect-ratio 8/1`, `max-width 960`, centralizado, escala no celular; usa o criativo `728x90` da WCR com `object-fit: contain` sobre fundo neutro; o 970×250 deixa de ser usado). Posição: **faixa no topo, acima do cabeçalho** (`TopAd` movido para antes de `<Header/>` em `app/layout.tsx`) e **um segundo espaço do mesmo tamanho entre "Destaques" e "Todas as notícias"** na home. Removidos: MPU da barra lateral, faixa do rodapé, slot `native`. Rótulo "Publicidade" mantido (CONAR). Slot vazio: "Anuncie aqui" abre o popup (item 7).
- Banco: `nj_campaigns` WCR passa a ter `slot='top'` e `'inline'` (update SQL); `/r/[id]` e `link_url '#'` iguais.

### 2. Só imagens reais (ponto 3)
- Remover `CoverArt` e o uso de `cover` (número) em `components/Cards.tsx`, `app/construcao/[slug]/page.tsx`; sem foto = cartão só de texto sobre cor lisa da marca (sem ilustração).
- `scripts/nj-photos.mjs` / `collectors/photos.ts`: ampliar consultas por tema (inglês genérico) e fallback por categoria (ex.: Saneamento → "water treatment plant", "sewer pipe", "wastewater"; Infraestrutura → "highway construction"; Habitação → "housing construction"), preferir fotos recentes/coloridas (descartar gravuras/desenhos antigos por título/ano/tags), tamanho mínimo 1200 px, `category=photograph`; sem repetir a mesma foto em matérias vizinhas. Re-rodar nas 17 matérias e trocar fotos ruins (ex.: gravura de 1899). Estado atual: 17/17 com foto; revisar qualidade.
- Agente `nj-imagens` passa a conferir "foto fotográfica, atual, sem texto/logo".

### 3. Fluxo do leitor na home (ponto 5)
`app/page.tsx` reordenada: (1) **Destaques** (grade 1 grande + 3, já existe), (2) espaço de publicidade inline, (3) **Todas as notícias** (grade 3 colunas, "Ver mais" para `/noticias`), (4) **Análises** (matérias de dados/licitações em lista), (5) **Indicadores** (faixa com 4 números do `getIndicadores`), (6) **Licitações em destaque** (5 maiores valores, link para `/licitacoes`), (7) **Saneamento** (3 últimas + link), (8) **Radar do setor**, (9) caixa da newsletter. Título "Últimas análises" vira "Destaques".

### 4. Licitações (ponto 6)
`app/licitacoes/page.tsx` + novos componentes cliente `components/LicFilters.tsx`: filtros por **tema** (Todas, Saneamento, Pavimentação/Rodovias, Edificações/Escolas/Saúde, Drenagem, Resíduos), **UF** (select + pílulas), **faixa de valor** (≤1 mi, 1–10 mi, 10–50 mi, >50 mi), **modalidade**, **período** (7/14/30 dias; ampliar janela no coletor `collectors/licitacoes.ts` para 30 dias), **busca por texto** e **ordenação** (mais recentes / maior valor / encerra primeiro). Resumo no topo (nº de editais, soma estimada, por UF). Linhas em cartões no celular, tabela no desktop, selo de tema e valor em destaque, link "Abrir edital". **Saneamento completo**: `ehSaneamento` ampliado (água, esgoto, drenagem, resíduos, aterro, limpeza urbana, poços, ETA/ETE) e aba `/licitacoes?tema=saneamento` sem limite de 100; `getLicitacoes` com paginação (hoje `limit`). Filtros via query string (server) para manter URL compartilhável.

### 5. Anuncie e Sobre (pontos 7 e 8)
- Remover `app/anuncie/page.tsx`, `components/AnuncieForm.tsx`, rota `api/anuncie` e links de rodapé; menu: botão **"Anuncie"** (estilo contorno) que abre `components/AnuncieModal.tsx` (cliente, `<dialog>`, fechar por Esc/clique fora, acessível): e-mail `neryadministrativo@gmail.com` (mailto) e LinkedIn `https://www.linkedin.com/in/jo%C3%A3o-de-souza-nery-4380262b0/` (nome "joaodsouzanery"), formatos do espaço (960×120) e rótulo de publicidade. Os espaços "Anuncie aqui" abrem o mesmo popup.
- `app/sobre/page.tsx`: reescrever com **Missão, Visão, Valores** (cartões), "Como produzimos" (fonte → fatos → redação própria → verificação → editor), transparência (Grupo Nery atua no setor), contato. Minuta de texto: Missão — informar quem constrói o Brasil com dados e licitações claros e verificáveis; Visão — ser a referência nacional em notícia e inteligência de obras e saneamento; Valores — rigor/fonte primária, independência e transparência, clareza, utilidade para quem decide, responsabilidade com dados públicos. Remover o aviso "Rascunho".

### 6. Pesquisar (ponto 9)
Nova `app/busca/page.tsx` (server, `?q=`) + formulário no cabeçalho (ícone/campo que abre input; no celular, linha própria): busca `ilike` em `nj_articles` (título, lide, corpo), radar `nj_pauta_items` (título/trecho), `nj_licitacoes` (objeto, órgão, município, UF) e páginas do site (lista estática: Sobre, Política editorial, Privacidade, Newsletter), resultados agrupados por tipo com contagem e filtros por tipo; escapar `%`/`_`; mínimo 2 caracteres; limite por grupo com "ver mais"; `noindex`. Função `lib/search.ts` testada (sanitização/consulta). Políticas de leitura pública já existem para essas tabelas.

### 7. Tabela privada com o texto das fontes (autorizada)
- Migração `015_nj_source_texts.sql`: `nj_source_texts` (pauta_item_id, url, fetched_at, text (≤30 mil car.), hash, status), **RLS ligado sem nenhuma política** (privada; só service role). 
- `scripts/nj-texts.mjs` + workflow `nj-texts` (gatilho `.github/triggers/texts` + agendado antes das rodadas 06:40/11:40/17:40 BRT): para itens recentes do radar escolhidos (até 40/rodada; fontes brasileiras e de saneamento primeiro), respeita robots.txt, 1 req/s por host, UA identificado, sem contornar paywall/login/403; extrai texto do artigo (`<article>`/parágrafos; função pura `extractArticleText` com teste sintético).
- Uso: **só interno** para conferir fatos e sobreposição no `nj-check` (`sourceTexts`) e para os agentes; nunca exibido, nunca copiado (regra de 5-gramas ≤ 20% mantida). Política de privacidade/terceiros: aviso em `docs/pipeline-autoria.md`; itens `allow_fulltext=false` só ficam privados e não vão a serviços externos. Agentes `nj-fonte-primaria`/`nj-fatos` leem a tabela por SQL.

### Verificação
`npm test`, `tsc`, `next build`; capturas Playwright desktop/mobile (home, /licitacoes com filtros, /busca, popup Anuncie, /sobre, banner topo 960×120); conferir que nenhum SVG criado por mim aparece; SQL: artigos com `photo_id`, campanhas `top/inline`, RLS de `nj_source_texts` (anon não lê); `get_advisors`; deploy READY e fetch das páginas; link final ao usuário.

## Rodada 16 — WCR→LinkedIn, Pro com boletim e filtros, imagem sempre (logo/entidade), 50 notícias na home, notícias em tempo quase real

Pedidos: (1) clique do banner WCR → LinkedIn `https://www.linkedin.com/in/equipe-wcr-655aa7417`; (2) olhar como o Not Journal monetiza (**sem acesso**: `notjournal.com.br` não resolve na rede da sessão; pesquisa web não trouxe nada; o que se vê nos prints = banner de patrocinador no topo e entre seções, bloco de newsletter, podcast, evento fechado "Circle", colunistas/portfólio; modelos usuais: publicidade display, newsletter patrocinada, conteúdo de marca, eventos/clubes, assinatura; liberar o domínio na rede da sessão se quiser leitura direta); (3) notícias/indicadores grátis, boletim e afins no Pro, + descrição para o Stripe/Vercel; (4) nenhuma matéria sem imagem, com imagem específica da entidade (ex.: Sabesp → imagem/logo da Sabesp; não usar foto de empresa americana para notícia brasileira); ~50 matérias na home e mais em /noticias; (5) CNPJ e domínio depois, e-mail neryadministrativo@gmail.com; (6) filtros Pro (ex.: só Saneamento de SP), base grande, principais = melhores do setor, notícias atuais ("saiu, nós também temos, com autoria nossa").

### A. WCR (SQL, 1 linha)
`update nj_campaigns set link_url='https://www.linkedin.com/in/equipe-wcr-655aa7417' where advertiser='WCR Saneamento'` (rel=sponsored, abre em nova aba; `/r/[id]` já registra o clique).

### B. Produto (decisão do usuário: notícias e indicadores grátis; boletim, filtros e extras no Pro)
- Gratuito: todas as notícias, indicadores, filtro por assunto. Pro: **Boletim Nery Journal** (diário), **filtros combinados e salvos** (assunto × UF × tipo, ex.: Saneamento + SP), feed personalizado `/pro/feed?token=` e boletim segmentado pelas preferências (reaproveita `nj_pro_subscribers.ufs/keywords` e `getProByToken`), painel de dados com CSV, licitações completas, arquivo, alertas.
- Páginas: `/licitacoes/pro` (copy do Pro já reescrita) passa a descrever o boletim e os filtros; `/newsletter` passa a ser "lista de espera do Boletim (Pro)" ou boletim gratuito curto (pergunta ao usuário); `docs/produto-e-copys.md` atualizado com a descrição final para a Vercel/Stripe (nome "Nery Journal Pro", descrição, preços, descritor, copys) — entregue no chat para ele colar e devolver o link de pagamento em `NEXT_PUBLIC_PRO_CHECKOUT_URL`.
- Gating no site: chips de UF e combinações só para Pro (cadeado + chamada), assunto único grátis; lista completa de licitações/CSV Pro (já feito: 10 no grátis).

### C. Imagem sempre, e específica (agente + skill + código)
- Nova tabela `nj_entities` (nome, aliases, tipo empresa/órgão/agência, `logo_url`, site, nota de uso) semeada com as entidades mais citadas (Sabesp, Copasa, Sanepar, Aegea, BRK, Iguá, Aesbe, Abcon, ANA, DNIT, ANTT, Caixa, CBIC, SindusCon-SP, Secovi-SP, MCid, Agência Gov…); logos obtidos no Wikimedia Commons ou do site da entidade por script do GitHub Actions (uso editorial/identificação; risco de marca registrada sinalizado; sem recolorir/alterar).
- Ordem de escolha da imagem (`scripts/nj-photos.mjs` + `collectors/photos.ts`): 1) foto CC0/PD da própria entidade/obra/local (Commons, busca por nome + cidade/UF); 2) **logo da entidade** em cartão limpo (`kind='logo'` em `nj_photos`, exibido com `object-fit: contain` sobre fundo neutro); 3) foto de assunto do **Brasil** (consultas com "Brazil"/cidade e filtro por categorias/título que casem com BR); 4) só então tema genérico. Notícia brasileira nunca usa foto de empresa/local estrangeiro (descartar títulos com termos de outro país quando a matéria é BR: `USA|American|United States|UK|England…`). Matéria internacional pode usar a logo/foto da entidade estrangeira.
- Regra dura no agente `nj-editor`/`nj-imagens` e checagem em `scripts/nj-check.mjs`: **publicar exige imagem** (photo_id ou logo); sem imagem → `em_revisao`. Skill `.claude/skills/nj-imagem-obrigatoria` (ou seção nos agentes) com a árvore de decisão acima. Fallback do site continua (foto do mesmo assunto), mas o agente deve resolver antes.
- Coluna `nj_articles.entity_id` opcional (preenchida pelo editor) e matcher por título quando vazia.

### D. Volume e atualidade (50 na home; mais em /noticias)
- Home: `getArticles(50)` (matérias mais recentes e melhor classificadas: destaques = as 4 de maior pontuação — fórmula `score` = recência + prioridade de fonte primária/entidade nacional; coluna `nj_articles.priority int`), grade de 50; `/noticias` com **paginação** (`?p=`) e "carregar mais", mantendo filtros. 
- Produção: subir cota para até **15 matérias por rodada** (07:07, 12:07, 18:07) e criar **rodadas rápidas** a cada 2 horas entre 08h e 20h BRT (até 4 notas cada, "saiu, publicamos") — via triggers da sessão (dependem de a sessão seguir ativa) ou, melhor, rotinas em claude.ai com conector Supabase; fotos 5 min depois de cada rodada (workflow `nj-photos` agendado a cada 2h). Agentes: priorizar fontes brasileiras e saneamento; texto de `nj_source_texts` para dar mais informação (já feito).
- Cobertura SP/Brasília: cotas por rodada (≥3 SP, ≥3 DF) e fontes adicionais de SP/DF (Agência SP, Prefeitura SP, Agência Brasília/Metrópoles-Construção se houver feed, Sabesp press) via descoberta de feeds.

### E. Pro: preferências e filtros (6)
`nj_pro_subscribers` ganha `temas text[]`; `/licitacoes/meu?token=` → `/pro?token=` com seleção (temas × UFs), página `/pro/feed` com as matérias filtradas (consulta por `category` e `uf`), e boletim futuro segmentado. Até haver provedor de e-mail, a edição é montada por `buildWeekly` + prévia.

### Verificação
`npm test`, `tsc`, `next build`; SQL: campanha WCR com link LinkedIn, 0 matérias publicadas sem foto/logo, `nj_entities` populada, `/noticias?p=2`; capturas desktop/mobile; deploy READY (Vercel MCP quando conectado) e link final ao usuário.

**Decisão (Rodada 16):** Boletim **só no Pro** (sem boletim gratuito); `/newsletter` vira lista de espera do Pro. Patrocinador alcança via site (topo/inline) e, no Pro, via bloco patrocinado do boletim.

## Rodada 17 — fotos de volta ao rumo, posts de hoje, newsletter, redator fora do chat

Pedidos (01/11): (1) conferir e refazer os posts de HOJE; (2) logos de empresa nas capas "não têm nada a ver" — voltar ao que estava bom (foto do setor) e só ajustar; (3) como é a newsletter/fluxo; (4) 3 posts por dia com qualidade — escolher os 3 de hoje; (5) skill final: nunca notícia sem imagem; (6) posts do Instagram para o grande público (estaduais só quando forem interessantes); (7) o usuário fará o modelo visual dos posts no Claude Design — eu entrego o conteúdo pronto; (8) resolver de vez o bloqueio das rodadas (modo de planejamento).

### Diagnóstico
- Fotos: o filtro novo (grupo de assunto + mínimo de termos) rejeita quase tudo no Wikimedia e o fallback virou **logo do veículo** (iN, CBIC…). Errado. Corrigir: logo só se a matéria for SOBRE a entidade; caso contrário, **foto do mesmo grupo de assunto** (agua, residuos, rodovia, ferrovia, porto, aeroporto, energia, habitacao, obra) com consultas por grupo e sem mínimo de termos; nunca logo de veículo.
- Posts: nada publicado desde 30/10 (rodadas bloqueadas) → não há "posts de hoje". Rodar a rodada agora, depois escolher 3.
- Bloqueio (8): o modo de planejamento é reativado pela plataforma a cada rodada e proíbe gravar; enquanto o redator morar no chat, vai repetir. Solução: **redator em GitHub Actions chamando a API da Anthropic** (secret ANTHROPIC_API_KEY, custo de centavos/dia), com o mesmo verificador (`pipeline/lib.ts`); o chat fica só para estratégia e ajustes.

### Passos (após aprovação)
1. **Rodar a rodada de hoje** a partir de `nj_pauta_items` (≈40 h): notas com `checkArticle` (ex.: BH Anel Rodoviário R$ 12,4 mi, TCU/Marco do Saneamento, ANA reservatórios 65,9%, BNDES R$ 879,4 mi ônibus elétricos SJC, Emirados R$/AED 95 bi PPP, Rodoanel BH, grid UK £181 bi, SP/DF), gravar `publicado`.
2. **Fotos** (`collectors/photos.ts`, `scripts/nj-photos.mjs`): remover fallback de logo do veículo; logo só para entidade-assunto; adicionar `GROUP_QUERIES` por grupo e tier final "mesma categoria sem mínimo de termos"; refazer as matérias que hoje têm logo do veículo (`photo_id=null` onde `theme like 'logo https://%'` e a entidade não é o assunto) e disparar `photos`. Skill/agente de revisão final: `scripts/nj-check-imagens.mjs` (falha se houver matéria publicada sem imagem; atribui foto genérica do grupo) no workflow `nj-photos`; reforçar `nj-imagem-obrigatoria` e `nj-imagem-revisor`.
3. **Posts de hoje** (grande público): escolher 3 das matérias de hoje (critério: número forte, impacto no bolso/emprego/obras, entendível sem contexto); limpar `social_at` antigo e marcar as 3; gerar pacote de conteúdo por post em `docs/posts/2026-11-01.md` (título de capa, 3 slides de texto, final, legenda, hashtags, sugestão de imagem) para colar no Claude Design; cards `/card/<slug>` continuam como referência.
4. **Newsletter**: página `/newsletter/edicao` (interna) que monta a edição do dia com `briefingEmail` a partir das matérias reais (5 principais + indicadores + patrocinador WCR) com botão "copiar HTML"; documento `docs/newsletter-fluxo.md` com o fluxo recomendado (agente monta a edição às 6h30 → você aprova → envio pelo provedor; semanal: Relatório Nery em PDF) e as opções (curada diária / exclusiva Pro).
5. **Redator fora do chat**: `scripts/nj-writer.mjs` + workflow `nj-writer.yml` (07:07, 12:07, 18:07 e a cada 2 h): lê itens novos, chama a API (modelo claude-sonnet-5-5) com prompt restrito aos fatos do item, valida com `checkArticle`, grava `publicado`/`em_revisao`; exige `ANTHROPIC_API_KEY` (usuário cria em console.anthropic.com e cola em Secrets). Rotinas do chat ficam desativadas depois que o workflow rodar.
6. Verificação: `npm test`, `tsc`, `next build`; SQL (0 publicados sem imagem; 3 posts marcados); logs do workflow de fotos; link final.

## Rodada 18 — escopo só construção/engenharia/saneamento, imagens fiéis (Pexels + curador com visão), brief do Claude Design

Decisões do usuário: Instagram e site só com **Construção, Engenharia e Saneamento** (regulação só bem depois; fora energia/ANEEL, estádios, ônibus, política); imagens: **Pexels/Unsplash (busca por assunto)** + **curador com visão (Anthropic)** + regras duras; **estimativa de custo** da API; rodadas continuam **no chat** por enquanto (lembrar da API depois); ele fará o modelo dos posts no **Claude Design** → entregar o brief completo.

### Falhas a corrigir (reconhecidas)
1. Escolhi posts fora do escopo (ANEEL, San Siro, ônibus) e publiquei matérias fora do escopo.
2. "Trava" anterior só reportava no log do workflow: **não impedia** matéria sem imagem aparecer. Criar trava real.
3. Fotos erradas: Commons devolve fotos fracas (neve para Dubai; guindaste da "Southern Cranes" repetido 3×; foto aleatória para TCU).

### Passos (após aprovação)
1. **Escopo**: despublicar (`em_revisao`) as fora do tema (ANEEL bandeira verde, Foster/San Siro, BNDES ônibus; reavaliar reservatórios/leilão de transmissão/PDE); regra no `nj-triagem`, `nj-redator`, `nj-writer` e no prompt: só obras, engenharia civil, infraestrutura de transporte/água, habitação/incorporação, materiais, licitações de obra e saneamento; energia só se for obra (usina/linha em construção). Reescolher os 3 posts de hoje dentro do escopo (ex.: ANA 878 municípios com risco de inundação; construção +210 mil ocupados; BH área de escape R$ 12,4 mi / Dubai PPP água e estradas).
2. **Trava real**: `getArticles` (site, busca, feed, RSS, sitemap) só devolve matéria com imagem; destaque/hero exige foto; o redator publica com `status='publicado'` só depois de ter `photo_id` (novo status `aguardando_imagem` que o site esconde); `nj-check-imagens` passa a falhar o workflow e a promover/ocultar.
3. **Imagens fiéis**: (a) regra de lugar/entidade do título (Dubai/Abu Dhabi/EUA/Milão exigem foto daquele lugar; senão busca específica no banco de imagens; sem lugar fiel, foto genérica do assunto sem pista de lugar); (b) filtro de contexto (sem neve/inverno/noite/pessoas/veículos de marca, salvo se a matéria pedir); (c) nunca repetir a mesma foto (janela de 30 dias; contagem por `photo_id`); (d) **Pexels** como fonte principal (`searchPexels` já escrito; consultas em inglês por assunto + lugar; precisa `PEXELS_API_KEY`), Commons só complementar; (e) coluna `nj_photos.approved` + **curador com visão** `scripts/nj-photo-curator.mjs`: baixa a foto candidata no GitHub Actions, envia ao Claude (visão) com título e resumo, recebe `{combina, motivo}`; reprovada → blocklist + nova busca; sem `ANTHROPIC_API_KEY`, o curador fica em "modo pendente" (foto só entra pelas regras duras) e o botão "Imagem não combina" segue valendo.
4. **Claude Design**: `docs/claude-design-brief.md` — o que passar para ele: formato 1080×1350, estrutura de slides (capa, 2–3 de texto, final), tipografia (geométrica bold caixa alta; Josefin Sans/Poppins), cores da marca (#1a7aa8, escuros), regras de layout (foto cheia, degradê inferior, categoria espaçada, marca no topo, texto embaixo à esquerda, ≤ 45 palavras), exemplos dos posts de referência, e **JSON de conteúdo** por post (capa, slides, legenda, hashtags, sugestão de imagem) + os 3 posts de hoje prontos.
5. **Custo da API**: `docs/custo-api.md` com estimativa por rodada/dia/mês (redator + curador de imagens), tokens por chamada, número de chamadas e fórmula, usando preços oficiais da skill `claude-api` (modelo `claude-sonnet-5-5`; opção de modelo menor para triagem/visão) e cenários (conservador/padrão/alto).
6. **Lembrete** (send_later) em ~3 dias: "conectar a chave da Anthropic e ligar o redator/curador".
7. Verificação: `npm test`, `tsc`, `next build`; SQL (0 publicados sem foto; nenhuma foto repetida; escopo); conferir logs do workflow; link final.
