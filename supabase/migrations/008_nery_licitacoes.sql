-- Nery Journal: licitações (PNCP), plano Pro, checagem de fontes e capa por dado.

alter table nj_articles add column if not exists cover jsonb;  -- {"numero":"R$ 5,3 bi","legenda":"..."}

-- Licitações: dado público do PNCP, leitura aberta.
create table if not exists nj_licitacoes (
  pncp_id text primary key,
  orgao text,
  uf text,
  municipio text,
  objeto text not null,
  modalidade text,
  valor_estimado numeric,
  publicado_em timestamptz,
  abertura_proposta timestamptz,
  encerramento_proposta timestamptz,
  situacao text,
  link text,
  is_obra boolean not null default false,
  atualizado_em timestamptz not null default now()
);
create index if not exists nj_licitacoes_uf_idx on nj_licitacoes (uf, publicado_em desc);
create index if not exists nj_licitacoes_pub_idx on nj_licitacoes (publicado_em desc);
alter table nj_licitacoes enable row level security;
create policy public_read_licitacoes on nj_licitacoes for select using (true);

-- Plano Pro (lista de assinantes e interessados). Sem política: só a service role.
create table if not exists nj_pro_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  ufs text[] not null default '{}',
  keywords text[] not null default '{}',
  min_value numeric not null default 0,
  status text not null default 'interessado' check (status in ('interessado','pendente','ativo','cancelado')),
  price_cents integer,
  started_at timestamptz,
  payment_ref text,
  consent_text text,
  consent_version text,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table nj_pro_subscribers enable row level security;

-- Resultado da descoberta de feeds e termos por fonte. Só service role.
create table if not exists nj_source_checks (
  id bigserial primary key,
  source_id text references nj_sources(id) on delete cascade,
  checked_at timestamptz not null default now(),
  home_status integer,
  robots_status integer,
  robots_allows boolean,
  feed_url text,
  terms_url text,
  note text
);
alter table nj_source_checks enable row level security;
