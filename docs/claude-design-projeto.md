# Claude Design: pacote completo (GN Construção + GN Regulação)

## Passo a passo (uma vez só)
1. No Claude Design, crie o projeto **"GN Notícias"**.
2. Cole o bloco **A** em "Instruções do projeto".
3. Suba os arquivos do bloco **B**.
4. Num chat do projeto, cole o bloco **C**. Ele gera os 22 templates (11 telas × 2 marcas). Detalhes em "Passo a passo para começar no Claude Design".
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

Catálogo de referência (28 prints de perfis de notícia, só como linguagem). Padrões vistos:
- Marca pequena, branca, no canto superior esquerdo de todas as telas de notícia.
- Editoria minúscula em caixa alta logo acima da manchete; manchete em caixa alta, bold, branca, alinhada à esquerda, no quinto inferior (de 70% a 92% da altura), sobre degradê preto.
- Recortes circulares (logos ou fotos de contexto) no terço superior direito, 1 a 3, com fundo branco e às vezes sobrepostos.
- Nome ou wordmark do assunto gigante no topo, integrado à foto (escrito em tipografia própria, nunca a logo de terceiros recriada).
- Telas internas com a mesma linguagem: 2 blocos de texto (afirmação + complemento) ou parágrafo longo em caixa alta.
- Tela de assinatura fixa: fundo preto, objeto (envelope) ao centro, chamada grande na cor de destaque, "Link na bio ↗".
- Hierarquia: foto > manchete > editoria > marca. Sem créditos, sem botões, sem números gigantes (os números ficam como destaque de cor).

O desenho do Grupo Nery é ORIGINAL: não copie logo, nome, fonte proprietária nem arte de nenhum perfil de referência.

```
Crie os templates editáveis abaixo, 1080×1350, seguindo as instruções do projeto.
Cada tela em DUAS versões: CONSTRUÇÃO (acento #1a7aa8, destaque #64D4E8) e REGULAÇÃO (acento #0f766e, destaque #5eead4).
Botões, quando houver, SEMPRE azuis #1a7aa8 com texto branco, nas duas marcas.
Nunca gere, desenhe ou invente imagem: {FOTO} e {CIRCULO} são só as URLs de fotos/logos reais que eu enviar. Sem crédito de foto, sem menção a IA.
Fontes: Archivo Black (manchete) e Inter (resto). Não use fonte, logo ou arte de nenhum print de referência.

ELEMENTOS COMUNS (telas de notícia)
- {FOTO} full-bleed, cover. Degradê preto de baixo para cima: 0% em y=600, 88% em y=1350.
- Assinatura no topo: "GN" bold 44 px + "Construção"/"Regulação" 28 px, branca, em x=64, y=64. Abaixo, "do Grupo Nery" 14 px, +200.
- {EDITORIA}: Inter Bold 20 px, caixa alta, +300, branca, x=64, 24 px acima da manchete.
- {MANCHETE}: Archivo Black 56–64 px, caixa alta, entrelinha 1,0, branca, x=64, largura 952, base em y=1230. 3 a 5 linhas.
- {DESTAQUE}: 1 palavra ou número da manchete na cor de destaque da marca.
- Indicador {N/T} 20 px, branco 70%, em x=1016 (alinhado à direita), y=1290. Ícone de carrossel 32 px em (1000, 64) na capa.

CAPAS
CON-C1 / REG-C1 FOTO CHEIA: elementos comuns, nada mais. Para foto forte de obra, pessoa ou lugar.
CON-C2 / REG-C2 FOTO + 1 CÍRCULO: + {CIRCULO1} 360 px de diâmetro, centro (820, 330), fundo branco, borda 6 px na cor de acento, logo centralizada a 70%.
CON-C3 / REG-C3 FOTO + 2 OU 3 CÍRCULOS: {CIRCULO1} 300 px centro (220, 420); {CIRCULO2} 280 px centro (840, 250); {CIRCULO3} opcional 260 px centro (860, 560). Fundo branco, borda 6 px na cor de acento, sombra 0 8 24 / 30%. Para notícias com 2–3 entidades (ex.: TCU + ministério + companhia).
CON-C4 / REG-C4 NOME GIGANTE: {NOME} (sigla do órgão, obra ou projeto, ex.: "SE-170", "IMIS") em Archivo Black 150–190 px, branca, centrado em x=540, topo em y=150, com sombra suave; a foto continua por trás. Sem recriar logos de terceiros.
CON-C5 / REG-C5 NÚMERO GRANDE: {FOTO} com overlay preto 65%. {NUMERO} Archivo Black 200 px, cor de destaque, x=64, base em y=760. {MANCHETE} 52 px abaixo (base y=1230).
CON-C6 / REG-C6 FAIXA DE ENTIDADE: faixa branca 1080×150 em y=760 com {CIRCULO1} (logo) 110 px à esquerda (x=64) e {ENTIDADE} 48 px na cor de acento; manchete abaixo da faixa, 52 px, base y=1230. Foto em cima.

TELAS INTERNAS
CON-T1 / REG-T1 DOIS BLOCOS: mesma {FOTO} ou outra foto real, elementos comuns; {TEXTO_A} 48 px (afirmação) e, 40 px abaixo, {TEXTO_B} 40 px (complemento); {NUMERO} opcional na cor de destaque dentro do texto.
CON-T2 / REG-T2 TEXTO LONGO: overlay preto 75% (ou fundo marinho #0b1f2a). {TEXTO} em caixa alta, Inter ExtraBold 34 px, entrelinha 1,15, até 60 palavras em 2 parágrafos, de y=780 a y=1230.
CON-T3 / REG-T3 LISTA: fundo marinho. Título "LICITAÇÕES DO DIA" (CON) ou "AGENDA REGULATÓRIA" (REG), 44 px, y=180. {LISTA} de 3 a 5 linhas a cada 170 px a partir de y=360: tarja 120×56 na cor de acento com UF/sigla + texto 32 px + valor ou prazo à direita na cor de destaque.

TELAS FIXAS
CON-B / REG-B BOLETIM: fundo preto. Assinatura grande centrada (y=120). Envelope desenhado em formas simples (vetor geométrico, não foto) centrado em y=520, 520 px de largura, com cartão "Boletim GN · às 6h". Chamada "Assine grátis o boletim." Archivo Black 84 px, cor de destaque, centrada em y=1020. "Link na bio ↗" 36 px branco em y=1160.
CON-F / REG-F FINAL: fundo marinho, assinatura centralizada em y=300, "Notícia completa no site — link na bio" 40 px em y=620, botão azul #1a7aa8 600×110 com texto branco "LEIA NO SITE" em y=760, faixa inferior 1080×160 (y=1190) branca: "Patrocínio: WCR Saneamento" + logo WCR.

Placeholders: {FOTO}, {EDITORIA}, {MANCHETE}, {DESTAQUE}, {CIRCULO1}, {CIRCULO2}, {CIRCULO3}, {NOME}, {ENTIDADE}, {NUMERO}, {TEXTO}, {TEXTO_A}, {TEXTO_B}, {LISTA}, {N/T}.
Mostre os 22 (11 × 2 marcas) lado a lado com conteúdo de exemplo, usando cinza neutro no lugar das fotos até eu mandar as URLs.
```

## Passo a passo para começar no Claude Design

1. **Criar o projeto.** Em claude.ai, abra Claude Design → "Novo projeto" → nome **GN Notícias**.
2. **Instruções.** Em "Instruções do projeto", cole o bloco **A** inteiro (acima). Salve.
3. **Prints de referência (um por tipo).** Suba só estes 8 arquivos, com a nota "referência de linguagem, não copiar":
   - C1 foto cheia: `Captura de Tela 2026-11-21 às 11.29.01.png` (Arquivo_5)
   - C2 1 círculo: `Captura de Tela 2026-11-21 às 11.28.43.png` (Arquivo_6)
   - C3 vários círculos: `Captura de Tela 2026-11-21 às 11.31.14.png` (Arquivo)
   - C4 nome gigante: `Captura de Tela 2026-11-21 às 11.30.46.png` (Arquivo_4)
   - C6 faixa de entidade: `Captura de Tela 2026-11-21 às 11.29.51.png` (Arquivo_5)
   - T1 dois blocos: `Captura de Tela 2026-11-21 às 11.28.13.png` (Arquivo_7)
   - T2 texto longo: `Captura de Tela 2026-11-21 às 11.31.34.png` (Arquivo)
   - B boletim: `Captura de Tela 2026-11-21 às 11.28.27.png` (Arquivo_6)
   (C5, T3 e F são nossos; não têm print.) Suba também as fontes e logos do bloco B, se já existirem.
4. **Primeira mensagem (colar num chat novo do projeto):**
```
Olá. Vamos montar o sistema de posts do GN Construção e do GN Regulação.
1) Leia as instruções do projeto.
2) Os 8 prints anexados são só REFERÊNCIA DE LINGUAGEM (hierarquia, posição da manchete, círculos, faixa, tela de boletim). Não copie logo, nome, fonte nem arte deles; nosso desenho é original.
3) Crie os templates abaixo exatamente com as posições indicadas, em 1080×1350.
4) Regras fixas: botões azuis #1a7aa8 com texto branco; nunca gere ou desenhe foto (use só a URL de foto real que eu mandar; até lá, retângulo cinza); sem crédito de foto; sem menção a IA; a tela final sempre tem "Patrocínio: WCR Saneamento".
5) No fim, liste os nomes dos 22 templates e me diga o que ficou ambíguo.

[COLE AQUI O BLOCO C, do "Crie os templates" até "...até eu mandar as URLs."]
```
5. **Ajustar e salvar.** Peça correções por nome e medida ("CON-C3: suba o CIRCULO2 40 px", "REG-T2: texto 32 px"). Quando aprovar, diga: "Salve cada tela como template com o nome indicado (CON-C1 … REG-F) e não altere mais as posições sem eu pedir." Exporte um PNG de cada para conferência.
6. **Testar com o pacote do TCU.** No mesmo projeto, cole a versão Regulação de `docs/posts/carrossel-tcu-imis.md` e peça: "Monte este carrossel: capa REG-C2 (círculo = logo do TCU que anexo), telas 2/8–7/8 em REG-T1 (número como destaque), final REG-F." Repita com a versão Construção (capa CON-C5 com 76%, telas CON-T1, final CON-F). Use só fotos aprovadas (URLs reais); se ainda não houver, deixe o cinza. Confira com o checklist F: cores, números iguais à matéria, WCR na tela final.

## D. Formato do PACOTE diário (eu entrego em docs/posts/AAAA-MM-DD.md)
```
POST 1 — Template CON-C5
Editoria: ENGENHARIA · SERGIPE
Manchete: DER/SE LICITA R$ 58,8 MI PARA DUPLICAR E RESTAURAR A SE-170 EM TOBIAS BARRETO
Destaque: R$ 58,8 MI
Foto: <URL da foto aprovada>
Círculo 1: <URL da logo DER/SE>
Telas (CON-T1/T2): 2/4 "…" 3/4 "…"
Final: CON-F
Legenda: …
Hashtags: …
```
```
POST 1 — Template REG-C2
Editoria: SANEAMENTO · TCU
Manchete: TCU CRIA INDICADOR PARA MEDIR A GESTÃO DO SANEAMENTO NOS MUNICÍPIOS
Destaque: IMIS
Foto: <URL aprovada: sede do TCU ou estação de tratamento>
Círculo 1: <logo TCU>
Telas (REG-T1/T2): 2/8 … 7/8
Final: REG-F
```

## E. Chat "Estúdio de posts" (chat separado, só texto; colar como 1ª mensagem)
```
Você é o editor de redes do GN Construção e do GN Regulação (Grupo Nery).
Para cada matéria que eu colar (marca, título, lide, link), devolva UM PACOTE com:
- Marca e template (CON-/REG- C1…C6, T1…T3, B, F) e o motivo em 1 linha
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
