-- GN Regulação: fontes ganham setor; feeds das agências reguladoras (pauta separada por sector).
alter table nj_sources add column if not exists sector text not null default 'construcao' check (sector in ('construcao','regulacao'));
alter table nj_pauta_items add column if not exists sector text not null default 'construcao' check (sector in ('construcao','regulacao'));

insert into nj_sources (id, name, kind, url, feed_url, sector, notes) values
 ('reg-ana',    'ANA',    'orgao', 'https://www.gov.br/ana/pt-br/assuntos/noticias-e-eventos/noticias',   'https://www.gov.br/ana/pt-br/assuntos/noticias-e-eventos/noticias/RSS',   'regulacao', 'gov.br RSS'),
 ('reg-aneel',  'ANEEL',  'orgao', 'https://www.gov.br/aneel/pt-br/assuntos/noticias',                    'https://www.gov.br/aneel/pt-br/assuntos/noticias/RSS',                    'regulacao', 'gov.br RSS'),
 ('reg-anp',    'ANP',    'orgao', 'https://www.gov.br/anp/pt-br/canais_atendimento/imprensa/noticias-comunicados', 'https://www.gov.br/anp/pt-br/canais_atendimento/imprensa/noticias-comunicados/RSS', 'regulacao', 'gov.br RSS'),
 ('reg-antt',   'ANTT',   'orgao', 'https://www.gov.br/antt/pt-br/assuntos/ultimas-noticias',             'https://www.gov.br/antt/pt-br/assuntos/ultimas-noticias/RSS',             'regulacao', 'gov.br RSS'),
 ('reg-antaq',  'ANTAQ',  'orgao', 'https://www.gov.br/antaq/pt-br/noticias',                             'https://www.gov.br/antaq/pt-br/noticias/RSS',                             'regulacao', 'gov.br RSS'),
 ('reg-anac',   'ANAC',   'orgao', 'https://www.gov.br/anac/pt-br/noticias',                              'https://www.gov.br/anac/pt-br/noticias/RSS',                              'regulacao', 'gov.br RSS'),
 ('reg-anatel', 'Anatel', 'orgao', 'https://www.gov.br/anatel/pt-br/assuntos/noticias',                   'https://www.gov.br/anatel/pt-br/assuntos/noticias/RSS',                   'regulacao', 'gov.br RSS'),
 ('reg-anm',    'ANM',    'orgao', 'https://www.gov.br/anm/pt-br/assuntos/noticias',                      'https://www.gov.br/anm/pt-br/assuntos/noticias/RSS',                      'regulacao', 'gov.br RSS'),
 ('reg-cade',   'CADE',   'orgao', 'https://www.gov.br/cade/pt-br/assuntos/noticias',                     'https://www.gov.br/cade/pt-br/assuntos/noticias/RSS',                     'regulacao', 'gov.br RSS'),
 ('reg-tcu',    'TCU',    'orgao', 'https://portal.tcu.gov.br/imprensa/noticias',                         null,                                                                      'regulacao', 'sem RSS confirmado'),
 ('reg-arsesp', 'Arsesp', 'orgao', 'https://www.arsesp.sp.gov.br',                                        null,                                                                      'regulacao', 'estadual SP; sem RSS confirmado'),
 ('reg-adasa',  'Adasa',  'orgao', 'https://www.adasa.df.gov.br',                                         null,                                                                      'regulacao', 'estadual DF; sem RSS confirmado')
on conflict (id) do nothing;
