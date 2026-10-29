# Produto, Stripe e copys do Nery Journal

## Recomendação de produto
1. **Boletim Nery Journal (grátis)** — motor de audiência. Resumo diário das principais notícias + 1 indicador + 1 curiosidade. É onde entra o patrocinador (WCR e próximos), como no Not Journal.
2. **Nery Journal Pro (pago)** — para quem decide: Boletim Pro completo, painel de dados (SINAPI/juros/produção), radar de licitações completo (secundário), análises e arquivo, alertas por tema e estado.
3. **Receita**: (a) publicidade/patrocínio no topo do site, no boletim e nos cards; (b) assinaturas Pro; (c) depois, eventos/jantares fechados do setor (o Not Journal anuncia o "Circle").
Gratuito: todas as notícias, indicadores principais, boletim semanal. Pro: boletim diário, séries históricas e CSV, lista completa de licitações e filtros, arquivo, alertas.

## Stripe (versão atual: boletim, filtros e extras no Pro; site, notícias e indicadores grátis)
- **Nome do produto:** Nery Journal Pro
- **Descrição curta (até 255 caracteres):** Boletim Nery Journal diário completo, filtros por assunto e estado (ex.: Saneamento em São Paulo), painel de dados da construção com CSV, radar de licitações e alertas.
- **Descrição longa:** O Nery Journal Pro reúne o que importa para quem constrói o Brasil. Você recebe o Boletim completo todo dia útil, monta seu feed combinando assuntos e estados, acessa séries de dados (custo da construção, juros, produção) com exportação em CSV, o radar completo de licitações de obras e saneamento e alertas por tema. O site, as notícias e os indicadores principais continuam gratuitos.
- **Preço 1 (ativo):** R$ 9,99/mês, recorrente, nickname "Fundadores (10 vagas)". Limite de 10 clientes: código promocional/link com 10 resgates ou desative o link ao atingir 10.
- **Preço 2 (rascunho, inativo):** R$ 39,00/mês e R$ 390,00/ano.
- **Statement descriptor:** NERY JOURNAL PRO. **Pix e cartão.** Cancelamento a qualquer momento; reembolso em 7 dias.
- **Link de pagamento:** cole em `NEXT_PUBLIC_PRO_CHECKOUT_URL` (Vercel). E-mail de contato: neryadministrativo@gmail.com. CNPJ, NFS-e e termos ficam para depois.

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
