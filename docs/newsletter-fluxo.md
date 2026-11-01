# Newsletter: formato e fluxo

## Formato (inspirado no briefing que você enviou)
Faixa de marca → data → abertura de 1–2 linhas → blocos por assunto (categoria, título grande, foto, resumo, "ler a matéria") → indicadores do dia → bloco do patrocinador ("Publicidade · oferecido por") → compartilhar no WhatsApp → rodapé (preferências, cancelar, privacidade). Prévia real em `/newsletter/edicao` (monta com as matérias de hoje) e exemplos em `/newsletter/email-preview`.

## Fluxo recomendado
1. **Diário (Pro)**, 06h30: o sistema monta a edição com as 5 melhores matérias das últimas 24 h + indicadores + patrocinador. Você abre `/newsletter/edicao`, confere (1 min) e copia o HTML para o provedor (Resend/Brevo etc.). Quando houver provedor, o envio vira automático e você só aprova.
2. **Semanal (Pro)**, sexta: "Relatório Nery do Setor" (PDF de 2–3 páginas) com a análise da semana, principais obras licitadas e agenda; página `/relatorio` (Salvar como PDF).
3. **Exclusivo para o assinante**: edição filtrada pelos estados e assuntos que ele escolheu (`/pro/feed`), CSV de licitações e arquivo.
4. Segmentação: cada assinante tem UFs e assuntos; a edição é a mesma base, reordenada.

## Decisões em aberto
Provedor de e-mail e domínio de envio (SPF/DKIM); horário (sugestão 06h30); texto de consentimento revisado por advogado.
