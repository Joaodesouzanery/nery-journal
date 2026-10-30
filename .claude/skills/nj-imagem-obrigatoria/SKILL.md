---
name: nj-imagem-obrigatoria
description: Regra do Nery Journal: toda matéria tem imagem e ela precisa ser FIEL ao assunto (mesmo tema); árvore de decisão (foto da entidade, logo, foto do mesmo assunto, logo do veículo). Use ao publicar ou revisar matérias.
---

# Imagem obrigatória e fiel ao assunto

Nenhuma matéria publicada fica sem imagem, e a imagem precisa combinar com o assunto. Nunca criar ilustração; só foto da internet com licença livre (CC0/domínio público, sem crédito exibido) ou logo.

Ordem de decisão (`scripts/nj-photos.mjs` faz; o agente confere):
1. **Entidade citada** (ANA, Sabesp, DNIT…): foto livre dela; sem foto, a **logo** dela.
2. **Mesmo assunto**: foto do MESMO grupo do tema (água, resíduos, rodovia, ferrovia, porto, aeroporto, energia, habitação, obra). Água não recebe avião; porto não recebe túnel; energia não recebe prédio. A foto precisa ter termos do assunto no título/descrição. Matéria brasileira não usa foto de lugar/empresa estrangeira.
3. **Matéria de dado/política/gestão** (PIB, juros, relatório, lei): logo da entidade (Banco Mundial, CBIC, CNI…), não foto aleatória.
4. **Sem foto fiel**: logo do veículo/órgão da fonte. Nunca uma foto genérica "de setor" que não tenha a ver.

Checagem do agente depois da rodada: `select slug,title,p.url,p.theme from nj_articles a join nj_photos p on p.id=a.photo_id where a.published_at > now()-interval '12 hours'`. Leia o `theme` (consulta usada) e o título: se não combinam, apague o `photo_id`, ajuste `photo_query`/`entity_id` e rode `.github/triggers/photos`. Nunca repita a mesma foto em duas matérias.
