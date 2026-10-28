-- Radar de notícias: manchete, link e trecho curto (≤ 200 caracteres) de fontes públicas, legíveis pelo site com a chave pública.
create policy public_read_radar on nj_pauta_items for select using (kind = 'noticia');
-- Nome e endereço das fontes (dado público) para exibir "via <fonte>".
create policy public_read_sources on nj_sources for select using (active);
