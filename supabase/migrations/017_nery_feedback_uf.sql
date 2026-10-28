-- Feedback dos leitores (privado: só a service role grava e lê) e UF da matéria (cobertura por estado).
create table if not exists nj_feedback (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'site' check (kind in ('site','materia','licitacoes','newsletter')),
  rating int check (rating between 1 and 5),
  useful boolean,
  article_slug text,
  message text,
  email text,
  page text,
  created_at timestamptz not null default now()
);
alter table nj_feedback enable row level security;
alter table nj_articles add column if not exists uf text;
update nj_articles set uf = 'DF' where uf is null and title ~* '\mDF\M|Brasília';
update nj_articles set uf = 'AM' where uf is null and title ~* 'Manaus';
update nj_articles set uf = 'MG' where uf is null and title ~* 'Minas|Conceição do Mato Dentro';
