# Claude Design: pacote completo (GN Construção + GN Regulação)

## Passo a passo (uma vez só)
1. No Claude Design, crie o projeto **"GN Notícias"**.
2. Cole o bloco **A** em "Instruções do projeto".
3. Suba os arquivos do bloco **B**.
4. Num chat do projeto, cole o bloco **C**. Ele gera os 16 templates (8 telas × 2 marcas).
5. Ajuste o que precisar e peça: "salve cada tela como componente/template com o nome indicado".
6. No dia a dia, cole um **PACOTE** (bloco **D**) e escolha o template.

---

## A. Instruções do projeto (colar)
```
Você é o designer fixo de dois perfis de notícias do Grupo Nery no Instagram.
O sistema visual é o mesmo para os dois; muda só a cor de acento.

MARCAS
- GN CONSTRUÇÃO: construção, engenharia, saneamento, obras e licitações.
  Acento #1a7aa8 (azul). Destaque #64D4E8 (azul-claro).
- GN REGULAÇÃO: agências reguladoras, TCU, consultas públicas, tarifas, resoluções.
  Acento #0f766e (verde-petróleo). Destaque #5eead4 (verde-água).
- Base comum: marinho #0b1f2a, preto #000, branco #fff.
- Botões SEMPRE azuis #1a7aa8 com texto branco, nas duas marcas.
- Assinatura: "GN Construção" ou "GN Regulação" (branca, bold) e, abaixo, "do Grupo Nery" (12 px, +200 de espaçamento).

FORMATO
- 1080×1350 (4:5). Margens de 64 px. Área segura: 952×1222.
- Fontes: manchete em Archivo Black (ou Inter Tight Black); textos em Inter Regular/SemiBold.

FOTO
- Foto real cheia (full-bleed), só a URL que eu mandar. Nunca gere ou invente imagem.
- Tratamento fixo: contraste +10, saturação −10, leve tom frio, vinheta suave.
- Degradê preto de baixo para cima, 0% → 85%, cobrindo 55% da altura.

TEXTO
- Editoria em caixa alta, 22 px, espaçamento +300, branca, acima da manchete.
- Manchete em caixa alta, 64–76 px, entrelinha 0,95, branca, alinhada à esquerda, de 3 a 5 linhas, no terço inferior.
- 1 palavra ou número de destaque na cor de destaque da marca.

REGRAS
- Sem crédito de foto, marca d'água, emoji na manchete ou menção a IA.
- Ícone de carrossel discreto no canto superior direito quando houver mais telas.
- Numeração "2/8" no rodapé direito das telas internas.

Quando eu colar um PACOTE, monte a capa e as telas no template e na marca indicados.
```

## B. Arquivos para subir
- Logos "GN Construção" e "GN Regulação" em SVG ou PNG transparente, nas versões branca e colorida. **Pendente: você manda ou eu desenho a especificação.**
- Fontes Archivo Black e Inter (Google Fonts, gratuitas).
- 2 ou 3 prints de perfis de referência, só como linguagem (não copiar).
- Logo da WCR Saneamento (patrocinador, tela final).
- O 1º post aprovado de cada marca, quando existir.

## C. Prompt para gerar os templates (colar num chat do projeto)
```
Crie 16 templates editáveis, 1080×1350, seguindo as instruções do projeto.
Faça as 8 telas abaixo em DUAS versões: CONSTRUÇÃO (azul) e REGULAÇÃO (verde).
Use placeholders nomeados: {FOTO}, {EDITORIA}, {MANCHETE}, {DESTAQUE}, {CIRCULO1}, {CIRCULO2}, {NUMERO}, {TEXTO}, {LISTA}, {N/T}.

L1 FOTO CHEIA: {FOTO} cheia, assinatura no topo à esquerda, {EDITORIA} e {MANCHETE} embaixo (a manchete termina a 120 px da base).
L2 FOTO + 1 CÍRCULO: L1 + {CIRCULO1} com 420 px de diâmetro, centro em (790, 330), borda branca de 6 px e sombra leve. Logo em fundo branco, centralizada.
L3 FOTO + 2 CÍRCULOS: {CIRCULO1} com 380 px, centro em (800, 300); {CIRCULO2} com 300 px, centro em (620, 560), sobreposto em diagonal.
L4 NÚMERO GRANDE: {FOTO} com overlay preto de 70%. {NUMERO} com 180–220 px, na cor de destaque, à esquerda, a 45% da altura. {MANCHETE} de 48 px abaixo.
L5 LISTA DO DIA: fundo marinho. Título "LICITAÇÕES DO DIA" (Construção) ou "AGENDA REGULATÓRIA" (Regulação). {LISTA} de 3 a 5 linhas: tarja da UF ou sigla do órgão (na cor de acento) + texto + valor ou prazo à direita.
L6 FIXADO / BOLETIM: fundo preto, assinatura grande, ícone de envelope, "Assine grátis o boletim" na cor de destaque e "Link na bio ↗".
T  TELA INTERNA: a mesma {FOTO} com overlay de 80% (ou fundo marinho). {NUMERO} em destaque, {TEXTO} de até 45 palavras (34 px) e {N/T} no rodapé.
F  TELA FINAL: fundo marinho, logo da marca, "Notícia completa no site — link na bio", botão azul #1a7aa8 "LEIA NO SITE" com texto branco, e faixa inferior "Patrocínio: WCR Saneamento".

Nomeie os templates assim: CON-L1 … CON-F e REG-L1 … REG-F.
Mostre os 16 lado a lado com conteúdo de exemplo.
```

## D. Formato do PACOTE diário (eu entrego em docs/posts/AAAA-MM-DD.md)
```
POST 1 — Template CON-L4
Editoria: ENGENHARIA · SERGIPE
Manchete: DER/SE LICITA R$ 58,8 MI PARA DUPLICAR E RESTAURAR A SE-170 EM TOBIAS BARRETO
Destaque: R$ 58,8 MI
Foto: <URL da foto aprovada>
Círculo 1: <URL da logo DER/SE>
Telas (CON-T): 2/4 "…" 3/4 "…"
Final: CON-F
Legenda: …
Hashtags: …
```
```
POST 1 — Template REG-L2
Editoria: SANEAMENTO · TCU
Manchete: TCU CRIA INDICADOR PARA MEDIR A GESTÃO DO SANEAMENTO NOS MUNICÍPIOS
Destaque: IMIS
Foto: <URL aprovada: sede do TCU ou estação de tratamento>
Círculo 1: <logo TCU>
Telas (REG-T): 2/8 … 7/8
Final: REG-F
```

## E. Chat "Estúdio de posts" (chat separado, só texto; colar como 1ª mensagem)
```
Você é o editor de redes do GN Construção e do GN Regulação (Grupo Nery).
Para cada matéria que eu colar (marca, título, lide, link), devolva UM PACOTE com:
- Marca e template (CON-/REG- L1…L6) e o motivo em 1 linha
- Editoria
- 2 opções de manchete em caixa alta, com até 16 palavras
- Destaque (1 número ou palavra)
- FOTO: consulta de busca (entidade + lugar + objeto) e o que a foto PRECISA mostrar.
  Regra: fiel ao assunto e ao LUGAR; logo da entidade só como último recurso.
- Círculo(s): de qual entidade
- Telas internas: até 45 palavras cada, 1 número por tela
- Legenda: gancho na 1ª linha + 3 frases de dados + "…do seu estado no boletim. Link na bio."
- 5 hashtags (setor + UF/órgão)
Não invente dados; use só o que está na matéria. Não mencione IA.
```

## F. Checklist antes de postar
- [ ] A marca e a cor estão certas (azul = Construção, verde = Regulação).
- [ ] A foto é fiel ao assunto e ao lugar, sem texto ou marca d'água.
- [ ] A manchete tem até 5 linhas, sem erro de português.
- [ ] O número confere com a matéria.
- [ ] A logo do círculo está nítida e é a da entidade certa.
- [ ] A legenda tem CTA e link na bio.
- [ ] A tela final traz o patrocínio da WCR.

## Pendências do dono
- Confirmar os @ (@gnconstrucao e @gnregulacao).
- Logos em SVG.
- Logo da WCR.
