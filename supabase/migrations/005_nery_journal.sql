-- Nery Journal: pauta (itens coletados), biblioteca de fotos licenciadas e posts.
-- ATENÇÃO: diferente das migrations 002/004, estas tabelas NÃO têm política aberta.
-- RLS ligado e sem políticas = a chave anon não lê nem escreve; só a service role (servidor/Vercel Function) acessa.
-- Quando houver login de editor, crie políticas por usuário.

create table if not exists nj_pauta_items (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  external_id text not null,
  kind text not null check (kind in ('dado','licitacao','noticia')),
  title text not null,
  url text,
  summary text,
  published_at timestamptz,
  payload jsonb,
  status text not null default 'novo' check (status in ('novo','descartado','em_rascunho','publicado')),
  created_at timestamptz not null default now(),
  unique (source_id, external_id)
);
create index if not exists idx_nj_pauta_status_created on nj_pauta_items(status, created_at desc);

-- Fotos genéricas licenciadas: sempre guardar licença e URL de origem.
create table if not exists nj_photos (
  id uuid primary key default gen_random_uuid(),
  theme text not null,
  url text not null,
  origin_url text not null,
  license text not null,
  credit text,
  has_people boolean not null default false,
  has_logos boolean not null default false,
  license_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Posts: conteúdo JSON do carrossel + trilha de revisão.
create table if not exists nj_posts (
  id uuid primary key default gen_random_uuid(),
  pauta_item_id uuid references nj_pauta_items(id) on delete set null,
  vertical text not null default 'obras' check (vertical in ('obras','regula')),
  status text not null default 'rascunho' check (status in ('rascunho','em_revisao','aprovado','publicado','corrigido')),
  content jsonb not null,
  sources jsonb not null default '[]'::jsonb,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table nj_pauta_items enable row level security;
alter table nj_photos enable row level security;
alter table nj_posts enable row level security;
