-- Cópia das fotos aprovadas no Storage (endereço estável) + hash do conteúdo para barrar imagem repetida com URL diferente.
alter table nj_photos add column if not exists content_hash text;
alter table nj_photos add column if not exists stored_at timestamptz;
create index if not exists idx_nj_photos_hash on nj_photos(content_hash);
insert into storage.buckets (id, name, public) values ('nj-photos', 'nj-photos', true) on conflict (id) do nothing;
