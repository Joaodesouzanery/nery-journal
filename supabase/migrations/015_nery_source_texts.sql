-- Texto das páginas-fonte (radar), guardado SÓ para conferência interna de fatos e de originalidade.
-- Tabela privada: RLS ligado e nenhuma política (apenas a service role lê/escreve). Nunca exibida no site.
create table if not exists nj_source_texts (
  id uuid primary key default gen_random_uuid(),
  pauta_item_id uuid references nj_pauta_items(id) on delete cascade,
  url text not null unique,
  status text not null default 'ok',   -- ok | vazio | erro | bloqueado
  http_status int,
  text text,                           -- até 30 mil caracteres
  text_hash text,
  fetched_at timestamptz not null default now()
);
alter table nj_source_texts enable row level security;
create index if not exists nj_source_texts_item on nj_source_texts (pauta_item_id);
