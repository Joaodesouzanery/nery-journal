# Brief — modelo de post do Instagram do Nery Journal (para colar no Claude Design)

## O que é
Nery Journal: jornal de **Construção, Engenharia e Saneamento** do Grupo Nery (Brasil todo; SP e DF em destaque).
O Instagram publica SÓ esses três temas. Regulação fica para bem depois — não criar rótulo nem layout de regulação.

## Referência de estilo
Not Journal: notícia contada em carrossel, **foto real cheia**, manchete curta em **caixa alta e bold**, leitura em 3 segundos, visual editorial sóbrio (nada de cara de anúncio). Criar um modelo ORIGINAL nessa linguagem, sem copiar logo, fontes ou artes do Not Journal.

## Formato
- 1080 × 1350 px (4:5). Carrossel de 4 a 5 telas: **capa → 2 ou 3 telas de contexto → tela final**.
- Margem de segurança: 64 px nas laterais; nada importante nos 120 px de baixo (barra do Instagram).

## Tela 1 — Capa
- Foto real full-bleed, do assunto e do lugar da notícia (ex.: CAESB → foto da CAESB; saneamento em PE → saneamento em PE).
- Degradê preto de baixo para cima (0% → 85% em ~55% da altura) para dar leitura.
- Topo esquerdo: assinatura "NERY JOURNAL" (branco, pequena, espaçamento largo).
- Acima do título: rótulo da editoria em caixa alta com espaçamento largo, numa tarja azul #1a7aa8 com texto branco: CONSTRUÇÃO · ENGENHARIA · SANEAMENTO.
- Título: CAIXA ALTA, bold, branco, alinhado à esquerda, no terço inferior, máx. 12 palavras / 3–4 linhas. Uma palavra-chave pode vir em azul claro #64D4E8.
- Rodapé discreto: "arraste →" e a UF/cidade (ex.: "DISTRITO FEDERAL").

## Telas 2 a 4 — Contexto
- Fundo: a mesma foto bem escurecida (overlay 80%) ou azul-marinho sólido #0b1f2a.
- Um número grande em destaque (ex.: "R$ 432 MI", "878 MUNICÍPIOS") em azul claro #64D4E8.
- Texto curto, máx. 45 palavras por tela, alinhado à esquerda, corpo regular branco.
- Numeração discreta da tela (2/5) no topo direito.

## Tela final
- Fundo azul-marinho #0b1f2a; logo Nery Journal centralizado.
- "Notícia completa no site — link na bio" e "Assine o boletim".
- Botão desenhado: **fundo azul #1a7aa8, texto branco** ("LEIA NO SITE").
- Faixa pequena: "Patrocínio: WCR Saneamento".

## Tipografia e cores
- Títulos: geométrica bold (Poppins Bold/ExtraBold ou Josefin Sans Bold). Corpo: Inter Regular.
- Cores: azul #1a7aa8 (ação/tarjas), azul claro #64D4E8 (destaques), marinho #0b1f2a / #0D1B3E (fundos), branco.
- Botões sempre azuis com texto branco.

## Regras fixas
- Sem crédito de foto na arte. Sem rostos identificáveis em destaque. Sem imagens geradas/ilustrações: só foto real.
- Sem mencionar IA ou "revisado por editor".
- Logo da empresa só se não houver foto correlata — e aí em fundo marinho, logo grande e nítido.
- Sem marca d'água, sem emojis no título.

## Conteúdo de cada post (o que eu vou mandar a cada dia)
```json
{"editoria":"SANEAMENTO","lugar":"DISTRITO FEDERAL","capa":"TÍTULO EM CAIXA ALTA",
 "telas":[{"numero":"R$ 432 MI","texto":"..."},{"numero":"...","texto":"..."}],
 "final":"Leia no site","legenda":"...","hashtags":["#saneamento"],"foto":"URL da foto aprovada"}
```
Posts do dia: `docs/posts/AAAA-MM-DD.md`. Card pronto no site: `/card/[slug]`.
