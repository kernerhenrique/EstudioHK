# Kit de animações EstudioHK

Animações ligadas ao scroll para landing pages e sites de clientes. É o mesmo motor da demo
[Taipa Arquitetura](https://estudiohk.com.br/demos/arquitetura/), sem bibliotecas: um JS
(`cena.js`, ~8 KB) e um CSS (`cena.css`).

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

- `testes/kit-func.js`: testa o `exemplo.html` (estado inicial e final de cada receita, teclado, mouse, celular, sem JS, movimento reduzido).
- `testes/modelo-cliente.js`: o teste completo da Taipa, para adaptar ao site de um cliente (trocar seletores e textos).
- `testes/quadros.js`: tira prints de cada cena em vários pontos do scroll, para revisar o movimento.

```bash
npx serve -l 8792 .
node kit/testes/kit-func.js
node kit/testes/quadros.js /tmp/quadros http://localhost:8792/kit/exemplo.html 1280 800 "section[data-cena]" 0,0.5,1
```
Depois: Lighthouse no celular e no computador (acessibilidade 100, CLS 0).
