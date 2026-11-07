# Ferramentas do site (EstudioHK)

São as ferramentas para montar e testar o site. **Esta pasta não vai para o ar** (está no `.vercelignore`).

## Antes de tudo
- Node 18 ou mais novo, com o Playwright e o Chromium (`npm i -D playwright` e `npx playwright install chromium`).
- Python 3 com Pillow (`pip install pillow`), só para converter as imagens de compartilhamento.
- O teste do orçamento em PDF usa `pdftotext` e `pdfinfo` (pacote `poppler-utils`).
- Servidor local na raiz do site, **na porta 8792**:
  ```
  npx serve -l 8792 .
  ```
  Para testar outro endereço (uma prévia ou o site no ar), use `BASE`:
  ```
  BASE=https://estudiohk.com.br node ferramentas/testes/sistemas-pg-func.js
  ```

## Gerar as páginas /sites/, /automacoes/ e /sistemas/
O gerador pega da home (`index.html`) o cabeçalho, os ícones, o pedido de orçamento, o rodapé e o Ctrl+K. Ele junta essas partes com os modelos em `paginas/modelos/`.
```
python3 ferramentas/paginas/hk_paginas.py
```
**Rode de novo sempre** que mudar o menu, o rodapé ou o orçamento da home, ou quando editar um modelo. Nunca edite `sites/index.html`, `automacoes/index.html` ou `sistemas/index.html` à mão: a próxima geração apaga a mudança.

| Modelo | Vira |
|---|---|
| `sites.main.html` (+ `svc_sites.html`, `calc_demos.html`) | `/sites/` |
| `automacoes.main.html` (+ a calculadora de `calc_demos.html`) | `/automacoes/` |
| `sistemas.main.html` | `/sistemas/` |

## Testes (Playwright)
Cada teste imprime `ok` ou `FALHA` em cada item e termina com `falhas: N`. As fotos que eles tiram vão para `ferramentas/.saida/`, que o git ignora.
```
node ferramentas/testes/<teste>.js
```
| Teste | O que testa |
|---|---|
| `pgs-check.js` | Home, /sites/, /automacoes/ e /sistemas/: sem erro no console e sem rolagem lateral (1366, 1000 e 375 px) |
| `sistemas-pg-func.js` | Página /sistemas/: 4 abas × 3 simulações, calculadora, sem links para as demos de sistema, celular e movimento reduzido |
| `auto-*-func.js` | As 6 demos de automação |
| `sis-*-func.js` | As 4 demos de sistema (guardadas fora do site) e o piloto "uau" |
| `acad`, `arq`, `barb`, `cafe`, `clin2`, `imob`, `pa2`, `psi` | As demos de site |

- Academia e estoque usam o **relógio fixo numa sexta-feira** (6/11/2026), porque a grade de aulas e as validades mudam com o dia.
- Às vezes um teste estoura o tempo quando a máquina está lenta. Rode de novo antes de concluir que algo quebrou.
- Ficaram de fora os testes antigos da Clínica Lumar v1, do Prates & Arruda v1 e da página de cliente Amanda, porque essas páginas mudaram ou saíram.

## Imagens de compartilhamento (og.jpg)
Os scripts em `og/` abrem a demo, deixam a tela no ponto certo e salvam a captura em `.saida/<script>-raw.png` (ex.: `auto-og-raw.png`). Depois, converta para 1200 × 630:
```
node ferramentas/og/auto-og.js
python3 ferramentas/og/para-jpg.py ferramentas/.saida/auto-og-raw.png demos/automacoes/contato-que-nao-esfria/assets/og.jpg
```

## Lighthouse
```
CHROME_PATH=/caminho/do/chromium npx lighthouse http://localhost:8792/sistemas/ --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo
```
Meta: desempenho 95 ou mais, e 100 em acessibilidade, boas práticas e SEO, no celular e no computador. Use `--preset=desktop` para medir no computador. No celular, a nota de desempenho varia: meça 2 ou 3 vezes.
