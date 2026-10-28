-- Foco em saneamento: coluna de tema e fontes (Brasil e exterior). Só radar: manchete, link e trecho curto.
alter table nj_sources add column if not exists topic text not null default 'construcao';

insert into nj_sources (id, name, kind, url, allow_fulltext, allow_ai, notes, topic)
select v.id, v.name, v.kind, v.url, false, false, 'Saneamento — radar de pauta: feed a confirmar pela descoberta.', 'saneamento'
from (values
  ('ana','Agência Nacional de Águas e Saneamento Básico (ANA)','orgao','https://www.gov.br/ana'),
  ('abcon-sindcon','Abcon Sindcon (concessionárias privadas de saneamento)','release','https://abconsindcon.com.br'),
  ('aesbe','Aesbe (empresas estaduais de saneamento)','release','https://aesbe.org.br'),
  ('assemae','Assemae (serviços municipais de saneamento)','release','https://www.assemae.org.br'),
  ('abes','ABES (engenharia sanitária e ambiental)','release','https://abes-dn.org.br'),
  ('trata-brasil','Instituto Trata Brasil','release','https://tratabrasil.org.br'),
  ('instituto-agua-saneamento','Instituto Água e Saneamento','release','https://www.aguaesaneamento.org.br'),
  ('sabesp','Sabesp — notícias','release','https://site.sabesp.com.br'),
  ('copasa','Copasa — notícias','release','https://www.copasa.com.br'),
  ('sanepar','Sanepar — notícias','release','https://www.sanepar.com.br'),
  ('aegea','Aegea — notícias','release','https://www.aegea.com.br'),
  ('igua','Iguá Saneamento — notícias','release','https://www.igua.com.br'),
  ('brk-ambiental','BRK Ambiental — notícias','release','https://www.brkambiental.com.br'),
  ('arsesp','Arsesp (agência reguladora SP)','orgao','https://www.arsesp.sp.gov.br'),
  ('bndes','BNDES — notícias (concessões e saneamento)','orgao','https://www.bndes.gov.br'),
  ('revista-dae','Revista DAE','veiculo','https://revistadae.com.br'),
  ('tratamento-de-agua','Tratamento de Água','veiculo','https://tratamentodeagua.com.br'),
  ('saneamento-basico-portal','Portal Saneamento Básico','veiculo','https://www.saneamentobasico.com.br'),
  ('iwa','IWA — International Water Association','release','https://iwa-network.org'),
  ('water-technology','Water Technology','veiculo','https://www.water-technology.net'),
  ('waterworld','WaterWorld','veiculo','https://www.waterworld.com'),
  ('wastewater-digest','Wastewater Digest','veiculo','https://www.wwdmag.com'),
  ('smart-water-magazine','Smart Water Magazine','veiculo','https://smartwatermagazine.com'),
  ('water-online','Water Online','veiculo','https://www.wateronline.com'),
  ('water-europe','Water Europe','release','https://watereurope.eu'),
  ('un-water','UN-Water','orgao','https://www.unwater.org'),
  ('worldbank-water','Banco Mundial — água','orgao','https://www.worldbank.org/en/topic/water'),
  ('us-epa','US EPA — notícias','orgao','https://www.epa.gov/newsreleases'),
  ('awwa','AWWA','release','https://www.awwa.org'),
  ('wef','Water Environment Federation','release','https://www.wef.org'),
  ('wateraid','WaterAid','release','https://www.wateraid.org')
) as v(id, name, kind, url)
on conflict (id) do nothing;
