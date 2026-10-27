# Grupo Nery — Guia de identidade (rascunho v0)

Status: rascunho para decisão. Nada aqui altera o app ainda.

## Princípios
- Inspirado na *abordagem* de marcas de logística (limpa, azul claro, símbolo geométrico, tipografia sans), mas **100% original**.
- Não reutilizar logo, estrela de sete pontas, fontes (Maersk Headline/Text) ou ativos de terceiros.
- Voz: direta, técnica, confiável. Frases curtas; preço e prazo sempre visíveis.

## Ponto de partida: tokens já existentes no repo
O app já usa uma paleta navy + ciano em `tailwind.config.js` (marca "Atlântico"). Proposta: o Grupo Nery reaproveita esses tokens para manter coerência e diferencia-se pelo símbolo e pelo nome.

| Papel | Token existente | Hex |
|---|---|---|
| Primária (escura) | `navy-800` | `#0D1B3E` |
| Destaque (claro) | `cyan-400` | `#64D4E8` |
| Fundo | `surface` | `#EBF6FA` |
| Sucesso / alerta / erro | `atlantico-*` | `#22C55E` / `#F59E0B` / `#EF4444` |

Pendente: 1 cor de ação para botões de compra (sugestão: laranja de segurança, contraste alto sobre navy e branco). Validar contraste WCAG AA antes de fixar.

## Tipografia
- Família: **Inter** (já carregada em `src/index.css`), aberta e sem risco de licença.
- Escala sugerida: títulos 600–700, corpo 400, rótulos/tabelas 500; números tabulares em preços e prazos.

## Símbolo (a desenhar)
- Conceito: forma geométrica simples ligada a "N" + caixa/contêiner ou rota; legível em 16 px (favicon) e em fundo navy ou claro.
- Entregáveis: símbolo, assinatura horizontal, versão monocromática, favicon (`public/favicon.svg`).
- Existe `src/components/brand/Logo.tsx`; avaliar se vira base ou se cria `NeryLogo`.

## Componentes de loja (a definir na Fase 2)
Cartão de produto (foto, preço, prazo de entrega por CEP), seletor de frete, selo de nota fiscal/garantia, badges de status do pedido.

## Decisões pendentes
1. Nome comercial da loja (Grupo Nery puro ou sub-marca).
2. Cor de ação.
3. Brief do símbolo (usuário aprova antes de desenhar).
