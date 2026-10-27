-- Mais fontes de notícias (radar: só manchete, link e trecho curto). Home apenas; o feed é descoberto pelo workflow nj-discover-feeds.
-- Nada liberado para texto completo nem para IA.
insert into nj_sources (id, name, kind, url, allow_fulltext, allow_ai, notes)
select v.id, v.name, v.kind, v.url, false, false, 'Radar de pauta: feed a confirmar pela descoberta.'
from (values
  ('agencia-brasil','Agência Brasil (EBC)','orgao','https://agenciabrasil.ebc.com.br'),
  ('agencia-gov','Agência Gov (EBC)','orgao','https://agenciagov.ebc.com.br'),
  ('agencia-camara','Agência Câmara de Notícias','orgao','https://www.camara.leg.br/noticias'),
  ('agencia-senado','Agência Senado','orgao','https://www12.senado.leg.br/noticias'),
  ('gov-cidades','Ministério das Cidades','orgao','https://www.gov.br/cidades'),
  ('gov-transportes','Ministério dos Transportes','orgao','https://www.gov.br/transportes'),
  ('sinduscon-mg','Sinduscon-MG','release','https://www.sinduscon-mg.org.br'),
  ('sinduscon-rio','Sinduscon-Rio','release','https://sinduscon-rio.com.br'),
  ('sinduscon-df','Sinduscon-DF','release','https://sinduscondf.org.br'),
  ('revista-infra','Revista Infra','veiculo','https://revistainfra.com.br'),
  ('diario-do-comercio','Diário do Comércio','veiculo','https://diariodocomercio.com.br'),
  ('equipment-world','Equipment World','veiculo','https://www.equipmentworld.com'),
  ('for-construction-pros','ForConstructionPros','veiculo','https://www.forconstructionpros.com'),
  ('new-civil-engineer','New Civil Engineer (UK)','veiculo','https://www.newcivilengineer.com'),
  ('infrastructure-intelligence','Infrastructure Intelligence (UK)','veiculo','https://www.infrastructure-intelligence.com'),
  ('construction-europe','Construction Europe','veiculo','https://www.khl.com/construction-europe'),
  ('construction-week-me','Construction Week Middle East','veiculo','https://www.constructionweekonline.com'),
  ('engineering-news-za','Engineering News (África do Sul)','veiculo','https://www.engineeringnews.co.za'),
  ('archdaily-int','ArchDaily (internacional)','veiculo','https://www.archdaily.com'),
  ('worldbank-blogs','Banco Mundial — blogs','veiculo','https://blogs.worldbank.org'),
  ('eurostat-news','Eurostat — notícias','orgao','https://ec.europa.eu/eurostat/web/main/news'),
  ('smart-cities-dive','Smart Cities Dive','veiculo','https://www.smartcitiesdive.com'),
  ('canadian-construction','Daily Commercial News (Canadá)','veiculo','https://canada.constructconnect.com/dcn'),
  ('build-australia','Build Australia','veiculo','https://www.buildaustralia.com.au')
) as v(id, name, kind, url)
on conflict (id) do nothing;
