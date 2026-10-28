-- Fotos com licença livre verificada (CC0/domínio público) podem ser lidas pelo site; consulta de busca guardada por matéria.
create policy public_read_photos on nj_photos for select using (license_verified);
alter table nj_articles add column if not exists photo_query text;
