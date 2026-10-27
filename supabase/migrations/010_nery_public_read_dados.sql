-- Indicadores de dados abertos (BCB, IBGE, Banco Mundial) podem ser lidos pelo site com a chave pública.
-- Notícias de veículos (kind 'noticia') e licitações em pauta continuam fechadas.
create policy public_read_dados on nj_pauta_items for select using (kind = 'dado');
