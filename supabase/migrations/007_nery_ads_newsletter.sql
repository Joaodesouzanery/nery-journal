-- Nery Journal: patrocínio (campanhas/eventos/leads) e estrutura completa da newsletter (perfil, preferências, eventos de consentimento).
-- RLS ligado em tudo. Leitura pública apenas de campanhas ativas; o restante só pela service role (servidor).

-- ---------- Newsletter ----------
alter table nj_subscribers
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists company text,
  add column if not exists job_role text,
  add column if not exists country text not null default 'Brasil',
  add column if not exists segment text,
  add column if not exists source_url text,
  add column if not exists status text not null default 'pending';

alter table nj_subscribers
  add constraint nj_subscribers_status_check check (status in ('pending','confirmed','unsubscribed'));

create table if not exists nj_subscriber_prefs (
  subscriber_id uuid primary key references nj_subscribers(id) on delete cascade,
  ufs text[] not null default '{}',
  alerts_licitacoes boolean not null default false,
  alerts_normas boolean not null default false,
  boletim boolean not null default true,
  analises boolean not null default false,
  eventos boolean not null default false,
  parceiros boolean not null default false,
  language text not null default 'pt-BR',
  updated_at timestamptz not null default now()
);

-- Trilha de consentimento (append-only): o texto exato mostrado e a versão.
create table if not exists nj_subscriber_events (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references nj_subscribers(id) on delete cascade,
  event text not null check (event in ('subscribe','confirm','prefs','unsubscribe')),
  consent_text text,
  consent_version text,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_nj_sub_events_sub on nj_subscriber_events(subscriber_id, created_at);

-- ---------- Patrocínio ----------
create table if not exists nj_campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser text not null,
  slot text not null check (slot in ('leaderboard','mpu','native','footer','newsletter','publi')),
  image_url text,
  alt_text text,
  headline text,
  link_url text not null,
  label text not null default 'Publicidade',
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_nj_campaigns_slot on nj_campaigns(slot, active, starts_at, ends_at);

-- Eventos agregados por dia (sem cookie, sem IP).
create table if not exists nj_ad_events (
  day date not null default current_date,
  campaign_id uuid not null references nj_campaigns(id) on delete cascade,
  impressions integer not null default 0,
  clicks integer not null default 0,
  primary key (day, campaign_id)
);

create table if not exists nj_leads_anuncie (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text not null,
  email text not null,
  phone text,
  message text,
  created_at timestamptz not null default now()
);

alter table nj_subscriber_prefs enable row level security;
alter table nj_subscriber_events enable row level security;
alter table nj_campaigns enable row level security;
alter table nj_ad_events enable row level security;
alter table nj_leads_anuncie enable row level security;

create policy "public_read_active_campaigns" on nj_campaigns
  for select to anon, authenticated
  using (active and now() >= starts_at and now() <= ends_at);
