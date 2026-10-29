-- Marca as matérias escolhidas para redes sociais (5–7 por dia) e mais entidades para logos.
alter table nj_articles add column if not exists social_at timestamptz;
insert into nj_entities (name, aliases, kind, country, site) values
 ('Banco Mundial', '{"Banco Mundial","World Bank"}', 'orgao', 'INT', 'https://www.worldbank.org'),
 ('Agência iNFRA', '{"Agência iNFRA"}', 'agencia', 'BR', 'https://agenciainfra.com'),
 ('Diário do Comércio', '{"Diário do Comércio"}', 'agencia', 'BR', 'https://diariodocomercio.com.br'),
 ('Receita Federal', '{"Receita Federal"}', 'orgao', 'BR', 'https://www.gov.br/receitafederal'),
 ('AGU', '{"AGU","Advocacia-Geral da União"}', 'orgao', 'BR', 'https://www.gov.br/agu')
on conflict (name) do nothing;
