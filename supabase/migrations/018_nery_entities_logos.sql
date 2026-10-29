-- Entidades citadas nas matérias (empresas, órgãos, agências) e logos para matérias sem foto específica.
create table if not exists nj_entities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  aliases text[] not null default '{}',
  kind text not null default 'empresa',     -- empresa | orgao | agencia | associacao
  country text not null default 'BR',
  logo_url text,
  site text,
  created_at timestamptz not null default now()
);
alter table nj_entities enable row level security;
create policy public_read_entities on nj_entities for select using (true);
alter table nj_photos add column if not exists kind text not null default 'photo';  -- photo | logo
alter table nj_articles add column if not exists entity_id uuid references nj_entities(id);

insert into nj_entities (name, aliases, kind, country, site) values
 ('Sabesp', '{"Sabesp"}', 'empresa', 'BR', 'https://www.sabesp.com.br'),
 ('Copasa', '{"Copasa"}', 'empresa', 'BR', 'https://www.copasa.com.br'),
 ('Sanepar', '{"Sanepar"}', 'empresa', 'BR', 'https://site.sanepar.com.br'),
 ('Aegea', '{"Aegea"}', 'empresa', 'BR', 'https://www.aegea.com.br'),
 ('BRK Ambiental', '{"BRK Ambiental","BRK"}', 'empresa', 'BR', 'https://www.brkambiental.com.br'),
 ('Iguá Saneamento', '{"Iguá","Igua"}', 'empresa', 'BR', 'https://www.iguasa.com.br'),
 ('Aesbe', '{"Aesbe"}', 'associacao', 'BR', 'https://aesbe.org.br'),
 ('Abcon Sindcon', '{"Abcon","Sindcon"}', 'associacao', 'BR', 'https://abconsindcon.com.br'),
 ('ANA', '{"Agência Nacional de Águas","ANA"}', 'orgao', 'BR', 'https://www.gov.br/ana'),
 ('DNIT', '{"DNIT"}', 'orgao', 'BR', 'https://www.gov.br/dnit'),
 ('ANTT', '{"ANTT"}', 'orgao', 'BR', 'https://www.gov.br/antt'),
 ('Caixa Econômica Federal', '{"Caixa"}', 'empresa', 'BR', 'https://www.caixa.gov.br'),
 ('CBIC', '{"CBIC"}', 'associacao', 'BR', 'https://cbic.org.br'),
 ('SindusCon-SP', '{"SindusCon-SP","Sinduscon-SP"}', 'associacao', 'BR', 'https://sindusconsp.com.br'),
 ('Secovi-SP', '{"Secovi-SP","Secovi"}', 'associacao', 'BR', 'https://secovi.com.br'),
 ('Ministério das Cidades', '{"Ministério das Cidades","MCid"}', 'orgao', 'BR', 'https://www.gov.br/cidades'),
 ('Agência Brasil', '{"Agência Brasil"}', 'agencia', 'BR', 'https://agenciabrasil.ebc.com.br'),
 ('Banco Central', '{"Banco Central","BC","Copom"}', 'orgao', 'BR', 'https://www.bcb.gov.br'),
 ('IBGE', '{"IBGE"}', 'orgao', 'BR', 'https://www.ibge.gov.br'),
 ('Petrobras', '{"Petrobras"}', 'empresa', 'BR', 'https://petrobras.com.br'),
 ('Eurostat', '{"Eurostat"}', 'orgao', 'EU', 'https://ec.europa.eu/eurostat'),
 ('EPA', '{"EPA","Environmental Protection Agency"}', 'orgao', 'US', 'https://www.epa.gov')
on conflict (name) do nothing;
