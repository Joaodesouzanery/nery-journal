-- Curador com visão: aprovação de cada foto ligada a matéria.
alter table nj_photos add column if not exists approved boolean;
alter table nj_photos add column if not exists reviewed_at timestamptz;
alter table nj_photos add column if not exists review_note text;
