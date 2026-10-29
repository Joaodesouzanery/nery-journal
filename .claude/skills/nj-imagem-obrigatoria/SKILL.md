---
name: nj-imagem-obrigatoria
description: Regra do Nery Journal: nenhuma matéria vai ao ar sem imagem do setor; árvore de decisão (foto da entidade, logo, foto do Brasil, tema). Use ao publicar ou revisar matérias.
---

# Imagem obrigatória

Nenhuma matéria publicada pode ficar sem imagem. Nunca criar imagem artificial/ilustração; só fotos da internet com licença livre (CC0/domínio público, sem crédito exibido) ou logo da entidade citada.

Ordem de decisão (feita por `scripts/nj-photos.mjs`; o agente confere):
1. **Entidade citada** (Sabesp, órgão, agência, empresa): foto livre dela; sem foto, a **logo** dela (`nj_photos.kind='logo'`). Matéria sobre a Sabesp nunca usa foto/logo de outra empresa.
2. **Assunto do Brasil**: foto livre do tema/local brasileiro (consulta com "Brazil", cidade ou UF). Matéria brasileira não usa foto de lugar ou empresa estrangeira (EUA, Reino Unido etc.).
3. **Matéria internacional**: foto/logo da entidade estrangeira ou do assunto.
4. **Tema genérico** do setor, só no último caso.

Ao gravar a matéria: preencha `photo_query` (inglês, 2–4 termos) e, se houver entidade, `entity_id` (`select id,name from nj_entities`). Depois da rodada, confira `select slug from nj_articles where status='publicado' and photo_id is null`; qualquer matéria sem imagem deve ser resolvida (ajuste `photo_query`/`entity_id` e rode `.github/triggers/photos`). Cadastre entidades novas em `nj_entities` quando aparecerem com frequência.
