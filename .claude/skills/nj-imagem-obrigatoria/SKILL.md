---
name: nj-imagem-obrigatoria
description: Regra do Nery Journal: toda matéria tem imagem e ela precisa ser FIEL ao assunto (mesmo tema); árvore de decisão (foto da entidade, logo, foto do mesmo assunto, logo do veículo). Use ao publicar ou revisar matérias.
---

# Imagem obrigatória e fiel ao assunto

**Regra do dono (07/11):** imagem do SETOR que converse com a notícia, sempre.
- Notícia da CAESB → imagem da CAESB. Notícia de saneamento no estado X → imagem de saneamento DO estado X. Notícia do TCU → prédio/plenário do TCU.
- A busca nasce da notícia: entidade + objeto + lugar (`newsQueries` em `collectors/photos.ts`), nunca termo genérico.
- Logo SÓ se não houver nada correlato, interessante e bonito, e a matéria for SOBRE a entidade.
- Nunca a mesma foto em duas matérias (30 dias). Nunca lugar contraditório (neve no Golfo/Brasil).
- Sem imagem aprovada, a matéria não vai ao ar: o banco recusa `publicado` sem `photo_id` (migração 022), `nj-check-imagens.mjs` baixa cada imagem e tira do ar a que não abre ou se repete, e o agente `nj-foto-conferencia` olha cada foto antes de publicar.

Nenhuma matéria publicada fica sem imagem, e a imagem precisa combinar com o assunto. Nunca criar ilustração; só foto da internet com licença livre (CC0/domínio público, sem crédito exibido) ou logo.

Ordem de decisão (`scripts/nj-photos.mjs` faz; o agente `nj-imagem-revisor` confere):
1. **Foto correlata** ao assunto: foto livre da própria entidade ou, na falta, do MESMO grupo do tema (água, resíduos, rodovia, ferrovia, porto, aeroporto, energia, habitação, obra). Água não recebe avião; porto não recebe túnel; energia não recebe prédio. A foto precisa ter termos do assunto no título/descrição; matéria brasileira não usa foto de lugar/empresa estrangeira; nada de reunião, escritório, militares ou laboratório.
2. **Logo só se não houver foto correlata e boa**: logo da entidade do assunto; na falta, logo do veículo/órgão da fonte. A logo não é a regra, é o último recurso.
3. Matéria de dado/política/gestão (PIB, juros, relatório, lei): logo da entidade (Banco Mundial, CBIC, CNI…).
4. Nunca foto genérica "de setor" sem relação com a matéria.

Revisão: depois de cada rodada, rode o agente `nj-imagem-revisor`. O botão "Imagem não combina" em `/social` registra o aviso; o próximo `nj-photos` bloqueia essa foto para sempre (`nj_photo_blocklist`) e escolhe outra.

Checagem do agente depois da rodada: `select slug,title,p.url,p.theme from nj_articles a join nj_photos p on p.id=a.photo_id where a.published_at > now()-interval '12 hours'`. Leia o `theme` (consulta usada) e o título: se não combinam, apague o `photo_id`, ajuste `photo_query`/`entity_id` e rode `.github/triggers/photos`. Nunca repita a mesma foto em duas matérias.
