-- Revisão de imagens: lista de fotos rejeitadas (nunca mais usadas) e descrição guardada para conferência.
create table if not exists nj_photo_blocklist (
  origin_url text primary key,
  reason text,
  created_at timestamptz not null default now()
);
alter table nj_photo_blocklist enable row level security;
alter table nj_photos add column if not exists description text;
