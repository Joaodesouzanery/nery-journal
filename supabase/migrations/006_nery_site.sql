-- Nery Journal: política por fonte, artigos de autoria própria e assinantes da newsletter.
-- RLS ligado. Único acesso público: leitura de artigos com status 'publicado'.
-- Gravações e leituras de assinantes/fontes só pela service role (servidor).

-- Política por fonte: o pipeline só entrega texto completo à IA se allow_fulltext E allow_ai.
create table if not exists nj_sources (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('dado_aberto','orgao','release','veiculo')),
  url text,
  feed_url text,
  allow_fulltext boolean not null default false,
  allow_ai boolean not null default false,
  license text,
  terms_url text,
  terms_checked_at timestamptz,
  attribution_text text,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists nj_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  sector text not null default 'construcao' check (sector in ('construcao','regulacao')),
  category text not null,
  title text not null,
  lede text not null,
  body_md text not null default '',
  facts jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  photo_id uuid references nj_photos(id) on delete set null,
  carousel jsonb,
  pauta_item_id uuid references nj_pauta_items(id) on delete set null,
  status text not null default 'rascunho' check (status in ('rascunho','em_revisao','publicado','corrigido')),
  is_placeholder boolean not null default false,
  ai_assisted boolean not null default true,
  reviewed_by text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (sector, slug),
  -- Não publica sem ao menos uma fonte registrada.
  constraint nj_articles_published_has_source check (status not in ('publicado','corrigido') or jsonb_array_length(sources) >= 1)
);
create index if not exists idx_nj_articles_listing on nj_articles(sector, status, published_at desc);

-- Assinantes: dupla confirmação e registro do consentimento (LGPD).
create table if not exists nj_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  sector text not null default 'construcao' check (sector in ('construcao','regulacao')),
  consent_text text not null,
  consent_version text not null,
  token text not null default encode(gen_random_bytes(24), 'hex'),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email, sector)
);

alter table nj_sources enable row level security;
alter table nj_articles enable row level security;
alter table nj_subscribers enable row level security;

drop policy if exists "public_read_published_articles" on nj_articles;
create policy "public_read_published_articles" on nj_articles
  for select to anon, authenticated
  using (status in ('publicado','corrigido'));
