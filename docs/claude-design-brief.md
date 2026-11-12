# Sistema de layouts do Instagram — Nery Journal (colar no Claude Design)

## Peça para o Claude Design
"Crie um SISTEMA de layouts para posts de Instagram de um jornal de Construção, Engenharia e Saneamento chamado Nery Journal. A estética é única e sempre igual; o que muda de post para post é a posição dos elementos (manchete, círculos, número). Quero 6 layouts editáveis (L1 a L6), formato 1080×1350 (4:5), com componentes reutilizáveis. A referência de linguagem é a de perfis de notícia editoriais (foto cheia, manchete em caixa alta, círculos sobrepostos), mas o desenho é original: não copie logo, fontes ou artes de nenhuma marca."

## Regras comuns (todas as telas)
- **Foto real cheia** (full-bleed), tratada sempre igual: contraste +10, saturação −10, leve tom frio, vinheta suave nas bordas.
- **Degradê preto** de baixo para cima (0% → 85%, cobrindo ~55% da altura) para a leitura.
- **Assinatura "nery"** no topo à esquerda, branca, bold, ~90 px de altura; margem de 64 px.
- **Editoria** acima da manchete: CONSTRUÇÃO · ENGENHARIA · SANEAMENTO (ou o estado: DISTRITO FEDERAL), em caixa alta, 22 px, espaçamento de letras largo (+300), branca.
- **Manchete**: CAIXA ALTA, bold condensada (Poppins ExtraBold, Archivo Black ou Inter Tight Black), branca, alinhada à esquerda, 3 a 5 linhas, no terço inferior. Máximo de ~16 palavras.
- **Círculos**: foto ou logo recortados em círculo, com borda branca de 6 px e sombra leve, sobrepostos à foto principal. Logo em fundo branco ou marinho, centralizada.
- **Cores**: azul #1a7aa8 (destaque, botões, tarjas), azul-claro #64D4E8 (palavra destacada), marinho #0b1f2a (fundos sólidos), branco.
- **Ícone de carrossel** discreto no topo direito quando houver mais telas.
- Nada de crédito de foto, marca d'água, emoji na manchete, menção a IA. Botões sempre azuis com texto branco.

## Os 6 layouts
**L1 — Foto cheia.** Só a foto, a assinatura, a editoria e a manchete embaixo. Para obra ou lugar com foto forte.

**L2 — Foto + 1 círculo.** Igual ao L1, com um círculo grande (~420 px) no terço superior direito, com a logo ou foto da entidade (CAESB, DER-DF, Sabesp). Para matéria SOBRE uma entidade.

**L3 — Foto + 2 círculos.** Dois círculos sobrepostos em diagonal no lado direito (~380 px e ~300 px). Para duas entidades (ex.: governo + empresa) ou duas obras.

**L4 — Número grande.** Foto bem escurecida (overlay 70%). Número gigante no centro-esquerda (ex.: "R$ 432 MI"), em azul-claro, e a manchete menor embaixo. Para licitação ou valor.

**L5 — Lista do dia.** Fundo marinho #0b1f2a, título "LICITAÇÕES DO DIA". Lista de 3 a 5 linhas, cada uma com UF em tarja azul, o objeto e o valor. Para resumir várias licitações.

**L6 — Boletim (post fixado).** Fundo preto, assinatura grande "nery journal", envelope com o boletim e o texto "Assine grátis o boletim" em azul-claro, além de "Link na bio ↗".

**Telas internas do carrossel (2 a 4).** A mesma foto com overlay de 80% ou fundo marinho; número de destaque em azul-claro; texto de até 45 palavras; numeração "2/5".

**Tela final.** Fundo marinho, logo, "Notícia completa no site — link na bio", botão azul "LEIA NO SITE", faixa "Patrocínio: WCR Saneamento".

## O pacote diário (o que eu mando no chat para cada post)
```
POST 1 — Layout L2
Editoria: SANEAMENTO · DISTRITO FEDERAL
Manchete: CAESB LICITA R$ 120 MI PARA AMPLIAR ESTAÇÃO DE ESGOTO NO GAMA
Palavra em destaque: R$ 120 MI
Foto principal: <URL da foto aprovada>
Círculo 1: <URL da logo/foto da entidade>
Telas: 2) "..." 3) "..."
Legenda: ...
Hashtags: #saneamento #df #obras
```
Você cola o pacote no Claude Design, escolhe o layout indicado, exporta e posta.
