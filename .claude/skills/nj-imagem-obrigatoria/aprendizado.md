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

## Acertos (consultas que funcionaram)
- (preencher)
