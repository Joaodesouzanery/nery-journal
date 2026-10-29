# Produto, Stripe e copys do Nery Journal

## Recomendação de produto
1. **Boletim Nery Journal (grátis)** — motor de audiência. Resumo diário das principais notícias + 1 indicador + 1 curiosidade. É onde entra o patrocinador (WCR e próximos), como no Not Journal.
2. **Nery Journal Pro (pago)** — para quem decide: Boletim Pro completo, painel de dados (SINAPI/juros/produção), radar de licitações completo (secundário), análises e arquivo, alertas por tema e estado.
3. **Receita**: (a) publicidade/patrocínio no topo do site, no boletim e nos cards; (b) assinaturas Pro; (c) depois, eventos/jantares fechados do setor (o Not Journal anuncia o "Circle").
Gratuito: todas as notícias, indicadores principais, boletim semanal. Pro: boletim diário, séries históricas e CSV, lista completa de licitações e filtros, arquivo, alertas.

## Stripe
- **Nome do produto:** Nery Journal Pro
- **Descrição:** Boletim diário completo, painel de dados da construção, radar de licitações por estado e alertas por tema. Para construtoras, engenheiros, fornecedores e poder público.
- **Preço 1 (ativo):** R$ 9,99/mês, recorrente, nickname "Fundadores (10 vagas)". Limite de 10 clientes: use um código promocional/link com limite de resgates = 10 ou desative o link ao atingir 10.
- **Preço 2 (rascunho, inativo):** R$ 39,00/mês (nickname "Pro mensal") e R$ 390,00/ano (2 meses grátis).
- **Statement descriptor:** NERY JOURNAL PRO (até 22 caracteres).
- **Cobrança:** Pix e cartão; trial: nenhum (já é preço de lançamento); cancelamento a qualquer momento; reembolso em 7 dias (CDC art. 49).
- **Link de pagamento:** cole em `NEXT_PUBLIC_PRO_CHECKOUT_URL` (Vercel) e o botão "Assinar" aparece em /licitacoes/pro.
- Pendências legais: CNPJ, emissão de NFS-e, termos de uso, política de privacidade revisada.

## Copys do site
- **Home (título):** Destaques — "Notícias, dados e licitações para quem constrói o Brasil, com fontes identificadas."
- **Newsletter (chamada):** "Receba o Boletim Nery Journal: o que importa para quem constrói, em 5 minutos."
- **Pro (título):** "Nery Journal Pro — tudo o que acompanhamos, organizado para você decidir mais rápido."
- **Pro (botão):** "Assinar por R$ 9,99/mês" · **Alternativo:** "Quero entrar na lista de fundadores"
- **Limite no gratuito (licitações):** "Mostrando 10 de N editais. Veja a lista completa no Nery Journal Pro."
- **Escassez:** "Oferta de fundadores: restam X de 10 vagas. Quem entra agora mantém R$ 9,99 enquanto o plano estiver ativo."
- **Garantia:** "Cancele quando quiser. Reembolso em até 7 dias."
- **Anunciante:** "Anuncie no Nery Journal: seu banner no topo de todas as páginas, para quem constrói e saneia o Brasil."

## Cards para Instagram/LinkedIn
Abra `https://<site>/card/<slug-da-matéria>` (1080×1350, foto + categoria + título + marca) e salve a imagem; `?w=1200&h=630` gera o formato de link. Carrossel: o primeiro card é o da matéria; os demais usam `templates/carousel.html`.
