# Kit de animações EstudioHK

Animações ligadas ao scroll para landing pages e sites de clientes. É o mesmo motor da demo
[Taipa Arquitetura](https://estudiohk.com.br/demos/arquitetura/), sem bibliotecas: um JS
(`cena.js`, ~12 KB) e um CSS (`cena.css`).

Esta pasta **não vai para o ar**: o `.vercelignore` na raiz do repositório a exclui do deploy.
Para ver o exemplo, sirva o repositório localmente (`npx serve -l 8792 .`) e abra
`http://localhost:8792/kit/exemplo.html`.

## Regra de ouro

Cada animação precisa **contar uma etapa real do serviço do cliente**. A casa se constrói
porque o arquiteto constrói; a planta se desenha porque o projeto passa por fases; a sala se
mobília porque é isso que o projeto de interiores faz. Animação que só enfeita sai.

## O que tem no kit

| Receita | Como funciona | Combina com |
|---|---|---|
| **Algo que se constrói** (cena presa) | SVG desenhado à mão: traços se desenham, peças surgem, luz acende | arquitetura, construção, marcenaria, energia solar, paisagismo |
| **Planta / esquema em fases** (cena presa) | camadas que entram por fase, com números contando e etapas na legenda | arquitetura, engenharia, consultoria, qualquer serviço "em etapas" |
| **Peças que entram no lugar** (cena presa) | itens caem, giram ou crescem até o lugar, com contador | interiores, decoração, montagem de kits, restaurante (prato montado) |
| **Do esboço à foto** (passagem) | a foto real corre por cima de um desenho em linhas feito a partir dela | arquitetura, imobiliária, produtos, moda, gastronomia |
| **Galeria que anda para o lado** (presa) | o scroll vertical move os cards; cada foto abre como um corte | portfólio de qualquer nicho |
| **Antes e depois** | arrastar com mouse, toque ou teclado | reforma, estética, odontologia*, limpeza, paisagismo, projeto × obra |
| **Números que contam** | `data-a="conta"` em qualquer número | áreas, prazos, quantidades (nunca promessa de resultado) |
| **Líquido que atravessa as seções** (cena presa, ref. 1) | o produto fica parado; o líquido escorre e enche o copo; os textos passam como se fossem seções | cafeteria, bebidas, sucos, cosméticos líquidos, tintas, perfumaria |
| **Palavra gigante atrás do objeto** (cena presa, ref. 2) | palavra enorme em camada de trás, o produto na frente; troca por etapa (moer → coar → servir); bolhas em velocidades diferentes | qualquer produto com etapas: café, padaria, cervejaria artesanal, marcenaria, cosméticos |
| **Seções que sobem por cima** (ref. 3) | cada seção prende no alto e a próxima cobre; a de baixo escurece e encolhe | cardápio → horário → pedido; serviços em capítulos; qualquer landing curta |
| **Entrada com desfoque** (ref. 3) | título e produto entram de lado saindo de um borrão, ao abrir a página | capa de qualquer site; produto em destaque |
| **Texto palavra por palavra** (cena presa, ref. 4) | cada palavra sobe do desfoque; palavras-chave em outra cor ou só contorno; janelas de site em perspectiva passando | frase de impacto, manifesto da marca, portfólio (EstudioHK) |

\* Em saúde, conferir a regra do conselho antes de usar antes e depois (CFM e CFO têm restrições).

## Como montar (passo a passo)

1. **Imagens**
   - **Do cliente:** recortar e converter para webp (600/1000 px, `srcset`). Tirar textos e marcas d'água do recorte.
   - **Da internet:** seguir `ferramentas/fotos.md` (Unsplash só gratuitas, folha de contato, crédito "Fotos: Unsplash").
   - **Esboço:** `python3 kit/ferramentas/esboco.py foto.jpg assets/img nome --proporcao 4:3 [--detalhe .8] [--tinta 1A1B19 --papel F7F6F2]`
     gera `nome-600.webp`, `nome-esboco-600.webp` etc. Conferir o resultado: `--detalhe` menor = desenho mais limpo.
2. **Copiar** `cena.js` e `cena.css` para `assets/` do site do cliente e colocar no `<head>`:
   ```html
   <link rel="stylesheet" href="assets/cena.css">
   <script>document.documentElement.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('anima');</script>
   <script src="assets/cena.js" defer></script>
   ```
   Se o cabeçalho for fixo (`position: sticky`), definir `--topo` com a altura dele no `:root`.
3. **Montar a receita** copiando o trecho do `exemplo.html` e trocando desenho/fotos.
4. **Testar** (seção "Testes" abaixo) e revisar os quadros em 3 pontos do scroll, no computador e no celular.

## Atributos

**Blocos**
- `data-cena style="--h:300"`: seção presa; `--h` é a altura em telas (300 = 3 telas). Dentro, um `<div class="palco">`.
- `data-passagem`: bloco normal; o progresso vai de 0 (entrando por baixo) a 1 (chegando ao alto da tela).
- `data-galeria` > `.palco-g` > `data-trilho` > vários `data-card` (com `.foto` > `img`).
- `data-comparador` (+ `data-rotulo`): `.lado.antes`, `.lado.depois`, `.divisor`, `input[type=range]` com `aria-label`.

**Peças** (dentro de uma cena ou passagem): `data-a="tipo" data-de="0.2" data-ate="0.4"`
- `traco`: linha que se desenha (SVG com `pathLength="1"` e `class="t"`).
- `surge`: aparece subindo. `acende`: só opacidade (luz, noite); `data-max` limita (0.9).
- `escala`: cresce do centro com leve elástico. `cresce`: nasce de baixo (tronco, barra). `larga`: abre para os lados (tapete).
- `cai`: cai e assenta. `gira`: gira até o lugar (quadro na parede).
- `croqui`: esboço tracejado que some enquanto o real aparece.
- `zona` + `data-some="0.4"`: mancha que aparece e depois esmaece.
- `revela`: máscara que abre do centro. `cortina`: a foto corre da esquerda para a direita (esboço → foto).
- `conta` + `data-valor="6.6" data-casas="2"`: número contando (formato brasileiro).
- `escorre`: nasce de cima para baixo (fio de líquido, fita). `enche`: sobe de baixo como nível de copo (pôr dentro de um `<g clip-path>` com o formato do copo; o recorte do `enche` substitui o do próprio elemento).
- `move`: movimento livre de um estado a outro. Começo: `data-x`, `data-y` (px ou %), `data-r` (graus), `data-s` (escala), `data-o` (opacidade). Fim: os mesmos com `2` (`data-x2`, `data-o2`…). O que não for dado fica no lugar (0, escala 1, opacidade 1). `data-linear` tira a desaceleração (bom para parallax e ponteiros). Para entrar e depois sair, aninhar dois `move` (o de fora entra, o de dentro sai). Ponto de giro pelo CSS (`transform-origin`).
- `data-palavras` (em um título ou parágrafo, com `data-de`/`data-ate`): o JS quebra em palavras (`.kit-palavra`) que sobem do desfoque uma a uma. Mantém `<em>` e `<strong>` (estilizar no CSS do cliente: cor, contorno com `-webkit-text-stroke`).

**Blocos novos (nov/2026)**
- `data-empilha`: no elemento que contém as seções; cada filha prende no alto e a próxima sobe por cima. A variável `--cobre` (0 a 1) escurece (`::after`) e encolhe a de baixo. Sem JS ou com movimento reduzido, viram seções normais.
- `data-entrada` (ou `data-entrada="lado"`) com atraso em `style="--d:200ms"`: entra ao abrir a página, com desfoque de movimento. Só CSS; usar só no primeiro trecho da página.

**Listas**: `data-etapa=".2,.4"` fica `.ativa` nesse trecho e `.feita` depois. `data-contador` recebe quantas etapas já começaram.

**Efeito sob medida** (ex.: sol atravessando o céu na Taipa): escutar o evento no bloco:
```js
document.querySelector('#capa').addEventListener('cena:progresso', e => { /* e.detail.p de 0 a 1 */ });
```

## Regras de qualidade (não negociáveis)

- **Sem JS ou com "reduzir movimento"**: tudo aparece pronto e nada prende o scroll (o kit já faz; não quebrar com CSS próprio).
- **Celular**: cenas presas usam `100svh`; esconder textos longos dentro do palco no celular; nada de rolagem lateral.
- **Desempenho**: animar só `transform`, `opacity`, `stroke-dashoffset` e `clip-path`. Imagens em webp com `srcset` e `loading="lazy"` (menos a primeira).
- **Acessibilidade**: SVG com `role="img"` e `<title>` descrevendo o que o desenho mostra; imagens decorativas com `alt=""`; contraste AA.
- **Duração**: 2 a 4 telas por cena presa. Mais que isso cansa.
- **Sentido**: ver a regra de ouro. Nada de promessa de resultado em números.

## Testes

- `testes/kit-func.js`: testa o `exemplo.html` e o `exemplo-referencias.html` (estado inicial e final de cada receita, teclado, mouse, celular, sem JS, movimento reduzido).
- `testes/modelo-cliente.js`: o teste completo da Taipa, para adaptar ao site de um cliente (trocar seletores e textos).
- `testes/quadros.js`: tira prints de cada cena em vários pontos do scroll, para revisar o movimento.

```bash
npx serve -l 8792 .
node kit/testes/kit-func.js
node kit/testes/quadros.js /tmp/quadros http://localhost:8792/kit/exemplo.html 1280 800 "section[data-cena]" 0,0.5,1
```
Depois: Lighthouse no celular e no computador (acessibilidade 100, CLS 0).

## Referências (vídeos de 5/nov/2026)

Quatro gravações de Reels que o Henrique guardou como referência. Quadros-chave em `referencias/`.
Exemplo funcionando com as quatro, numa cafeteria fictícia: `exemplo-referencias.html`.

### 1. Líquido que atravessa as seções · `referencias/ref-1-liquido-atravessa-secoes.jpg`
- **O que se vê:** site de cold brew. A garrafa inclinada no alto despeja o café. O fio desce e passa da primeira seção para a segunda, onde enche um copo com gelo. Depois o leite desce e se mistura, e a terceira seção (escura) mostra o produto pronto. O texto das seções passa, mas o líquido liga tudo.
- **Gatilho:** rolagem. A cena dura cerca de 3 telas.
- **Como montar no kit:** cena presa; garrafa com `move` (entra girando), fio com `escorre`, nível com `enche` dentro de um `clipPath`, gelo com `cai`, textos em painéis com `move` (sobem e saem), etapas com `data-etapa`.
- **Versão com foto real (como no vídeo):** o vídeo usa um filme do produto gerado por IA, tocado conforme a rolagem (sequência de quadros num `<canvas>`, estilo página da Apple). O kit ainda não tem esse bloco. Fazer quando houver um cliente com vídeo do produto (100 a 150 quadros em webp, cerca de 40 KB cada, carregados aos poucos e com uma imagem parada no celular fraco).

### 2. Palavra gigante atrás do objeto · `referencias/ref-2-palavra-atras-do-objeto.jpg`
- **O que se vê:** cafeteria "POUR/PLAY" em três etapas: GRIND → POUR → SIP. Uma palavra enorme ocupa a largura e o objeto fica na frente dela, cobrindo as letras do meio ("GR[moedor]ND"). Os grãos caem no moedor; o pó cai para a seção seguinte, onde a chaleira despeja no coador; o café pinga na xícara. Bolhas 3D flutuam em velocidades diferentes. No fim, "FIND YOUR CUP" com as palavras das etapas em contorno passando ao fundo.
- **Gatilho:** rolagem.
- **Como montar no kit:** contêiner em grade com todas as camadas em `grid-area: 1/1` (palavra `z-index:1`, objeto `z-index:2`). Cada palavra com dois `move` aninhados: entra de lado (`data-x="35%"`) e sai crescendo (`data-s2="1.2" data-o2="0"`). Bolhas com `move data-linear` em `data-y` diferentes. Grãos com `cai`, café com `escorre` e `enche`.
- **Cuidado:** a palavra é decorativa (`aria-hidden`); o texto de verdade fica num título normal. No celular a palavra precisa caber (`clamp` com `vw`).

### 3. Seções que sobem por cima + entrada com desfoque · `referencias/ref-3-secoes-empilhadas.jpg`
- **O que se vê:** cafeteria "brewns". A capa entra com borrão de movimento. Depois cada seção sobe por cima da anterior (capa escura → cardápio claro → relógio com o copo no centro → seção escura). O copo passa de uma seção para outra e um comprovante de pedido sobe no fim.
- **Gatilho:** abertura da página (entrada) e rolagem (o resto).
- **Como montar no kit:** `data-entrada` / `data-entrada="lado"` na capa; `data-empilha` no bloco das seções; ponteiro do relógio com `move data-r2="720"` dentro de um `data-passagem` (horário de funcionamento é um uso real); comprovante com `move data-y="160" data-o="0"`.

### 4. Texto palavra por palavra · `referencias/ref-4-texto-palavra-por-palavra.jpg`
- **O que se vê:** anúncio de um editor de sites, com fundo escuro. A frase se monta palavra por palavra ("Repara no que acontece quando eu rolo essas páginas"). Cada palavra sobe desfocada; as palavras-chave aparecem em laranja, em letra mais larga ou só no contorno. Abaixo, janelas de navegador com sites (advocacia, lançamento imobiliário, salão) passam em perspectiva.
- **Gatilho:** no vídeo, o tempo; no kit, a rolagem.
- **Como montar no kit:** `data-palavras` no título dentro de uma cena presa; `<em>`/`<strong>` para os destaques; janelas num contêiner com `rotateY`/`rotateX` fixos e trilho com `move data-linear data-x="30%" data-x2="-35%"`.
- **Uso:** frase de impacto ou manifesto. Bom também para a página da própria EstudioHK, mostrando as demos em janelas.
