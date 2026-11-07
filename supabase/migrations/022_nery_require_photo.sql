-- Trava no banco: matéria publicada exige foto. Matérias com foto errada/repetida/sem foto saem do ar e entram na fila (needs_photo).
alter table nj_articles add column if not exists needs_photo boolean not null default false;

with bad as (
  select a.id from nj_articles a left join nj_photos p on p.id = a.photo_id
  where a.status = 'publicado' and not a.is_placeholder and (
    a.photo_id is null
    or p.origin_url in (select p2.origin_url from nj_articles a2 join nj_photos p2 on p2.id = a2.photo_id
                        where a2.status = 'publicado' group by 1 having count(*) > 1)
    or a.slug like any (array['dubai-e-abu-dhabi%','tcu-fiscaliza%','engenheiros-trocam-ponte%','plano-edifica%',
      'eua-lancam-estrategia%','projeto-de-lei-nos-eua%','empresas-estaduais-de-saneamento%','deputados-britanicos%',
      'agu-consegue%','bh-abre-licitacao%','der-do-parana%','grupo-dos-aeroportos%','relatorio-estima%',
      'reino-unido-construtoras%','falha-em-sistema%','ministerio-dos-transportes%'])
  ))
update nj_articles set status = 'em_revisao', needs_photo = true, photo_id = null where id in (select id from bad);

create or replace function nj_require_photo() returns trigger language plpgsql as $$
begin
  if new.status in ('publicado','corrigido') and new.photo_id is null and not coalesce(new.is_placeholder, false) then
    raise exception 'nj_articles: matéria publicada exige photo_id (%)', new.slug;
  end if;
  return new;
end $$;
drop trigger if exists trg_nj_require_photo on nj_articles;
create trigger trg_nj_require_photo before insert or update on nj_articles
  for each row execute function nj_require_photo();
