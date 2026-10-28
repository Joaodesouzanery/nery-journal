-- Publicidade: formato único 960×120, nos espaços "top" (acima do cabeçalho) e "inline" (entre seções da home).
alter table nj_campaigns drop constraint if exists nj_campaigns_slot_check;
update nj_campaigns set slot = case slot when 'leaderboard' then 'top' when 'footer' then 'inline' else slot end, image_url = '/ads/wcr-728x90.png' where advertiser = 'WCR Saneamento';
alter table nj_campaigns add constraint nj_campaigns_slot_check check (slot in ('top','inline','leaderboard','mpu','footer','native'));
