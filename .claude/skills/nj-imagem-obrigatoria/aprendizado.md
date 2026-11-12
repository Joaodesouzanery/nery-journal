# Aprendizado das fotos (atualizar a CADA revisão)

Leia antes de escolher ou aprovar foto. Anote aqui todo erro e todo acerto que se repete; quando um padrão aparecer 3 vezes, vire regra no código (`collectors/photos.ts`: `newsQueries`, `GROUP_QUERIES`, filtros).

## Como revisar (até a ANTHROPIC_API_KEY entrar)
1. `git fetch origin nj-review && git worktree add -f /tmp/nj-review origin/nj-review` (ou `git checkout origin/nj-review -- .` numa pasta temporária).
2. Ler `review/index.json`; abrir cada `review/<slug>.jpg` com Read e comparar com título e lide.
3. Aprovar: `update nj_photos set approved=true, reviewed_at=now(), review_note='<motivo>' where id='<photo_id>'`.
4. Reprovar: `update nj_photos set approved=false, reviewed_at=now(), review_note='<motivo>' where id='<photo_id>'`; `insert into nj_photo_blocklist(origin_url, reason) values (...) on conflict do nothing`; `update nj_articles set status='em_revisao', needs_photo=true, photo_id=null where slug='<slug>'`.
5. Registrar abaixo o que aprendeu.

## Critérios de aprovação (do dono)
- Foto do SETOR que conversa com a notícia: mesma entidade (CAESB → CAESB), mesmo objeto (esgoto → rede/ETE de esgoto), mesmo lugar ou plausível (saneamento em PE → Brasil, de preferência PE).
- Nunca repetida (30 dias). Nunca lugar contraditório (neve no Golfo/Brasil). Sem pessoas em destaque, sem marca d'água, sem texto. Boa de ver no card 4:5.
- Logo só se nada correlato e bonito existir e a matéria for SOBRE a entidade. Nunca imagem de "período eleitoral"/banner de site.

## Erros já vistos (não repetir)
- "highway road" → estrada com neve na Polônia e estrada nas Filipinas para Dubai/Abu Dhabi. Usar "Dubai Sheikh Zayed Road", "Abu Dhabi highway".
- "water treatment plant" genérico → ETE do Arkansas/Iraque/Polônia para TCU e saneamento BR. Para órgão (TCU), foto do órgão; para saneamento BR, "estação de tratamento de esgoto Brasil"/"Sabesp ETE".
- "river dam reservoir" → barragem dos EUA para esgoto em MG. Esgoto: "sewer pipe trench", "rede de esgoto obra".
- "school building São Paulo" → Zoológico de SP. Creche: "creche obra", "school construction Brazil"; exigir "school/creche/escola" no título da foto.
- og:image de gov.br pode ser banner (ex.: DNIT "período eleitoral") → reprovar banners com texto.

## Revisão de 12/11 (54 fotos: 17 aprovadas, 37 reprovadas)
Padrões de reprovação (o que a busca ainda erra):
- Matéria de MERCADO/POLÍTICA/ECONOMIA (jornada 6×1, PIB, reforma tributária, lucro de empresa) recebe guindaste ou obra genérica, muitas vezes repetida → para esse tipo, usar a LOGO da entidade (CBIC, SindusCon, Secovi foram aprovadas) ou não publicar.
- Saneamento brasileiro (esgoto em MG, poços no PA, adutora em MG) recebe lago, barragem ou tubulação estrangeira com texto → o Commons tem pouco; precisa de foto da companhia/prefeitura (og:image do site do SAAE/DAAE) ou de Pixabay.
- Obra específica (passarela, creche, UBS, ponte sobre córrego) recebe outro tipo de obra → exigir o objeto exato no título da foto (passarela/footbridge, creche/school, UBS/clinic, ponte pequena/culvert bridge).
- Fotos com pessoas em destaque, texto/marca, carimbo de data, P&B antigas → reprovar sempre (dá para filtrar por palavras no título: "workers", "Dirty_Jobs", "Haberkorn", anos < 1990).
- Logo errada: "Ana" vermelho NÃO é a ANA (Agência Nacional de Águas). Conferir a logo pelo site oficial.
## Acertos (aprovadas e por quê)
- Linhas de transmissão para leilão/rede elétrica; vertedouro para reservatórios; ETE aérea para Aesbe; ônibus elétrico carregando para BNDES/ônibus elétricos; muro de contenção junto a rio para contenção em Manaus; casa rural brasileira para MCMV Rural; portêineres no Rio para porto seco; duplicação de rodovia (og:image DNIT) para BR-020.
- Logos de entidade aprovadas quando a matéria é SOBRE a entidade e é de mercado/institucional.
