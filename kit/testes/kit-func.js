// Testes do kit de animações (Playwright). Uso, com um servidor local na raiz do repositório:
//   npx serve -l 8792 .   e depois   node kit/testes/kit-func.js [URL]
// Serve também de modelo para testar as animações no site de um cliente.
const { chromium } = require('playwright');
const B = process.argv[2] || 'http://localhost:8792/kit/exemplo.html';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
// rola até a fração "frac" de uma cena presa (0 = início, 1 = fim)
const vai = (p, sel, frac) => p.evaluate(([sel, frac]) => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.querySelector(sel); const t = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topo')) || 0; const total = el.offsetHeight - (innerHeight - t); scrollTo(0, el.getBoundingClientRect().top + scrollY - t + total * frac); }, [sel, frac]);
const op = (p, sel) => p.$eval(sel, e => +getComputedStyle(e).opacity);
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); let p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.documentElement.classList.contains('anima')), 'animação ligada (classe .anima)');
  // 1. cena que se constrói
  await vai(p, 'section[data-cena]', 0); await p.waitForTimeout(150);
  ok(await p.$eval('section[data-cena] [data-a=traco]', e => parseFloat(getComputedStyle(e).strokeDashoffset) > .9), 'cena 1 no início: traço ainda não desenhado');
  await vai(p, 'section[data-cena]', .45); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.querySelector('section[data-cena] .etapas li.ativa').textContent === 'Fechamento'), 'cena 1 no meio: etapa Fechamento ativa');
  await vai(p, 'section[data-cena]', 1); await p.waitForTimeout(200);
  ok(await p.evaluate(() => [...document.querySelectorAll('section[data-cena] [data-a=traco]')].every(e => parseFloat(getComputedStyle(e).strokeDashoffset) < .01)), 'cena 1 no fim: todos os traços completos');
  ok(await op(p, 'section[data-cena] [data-a=acende][fill="#F2C76B"]') > .85 && await op(p, 'section[data-cena] [data-a=croqui]') < .01, 'cena 1 no fim: janelas acesas e croqui sumiu');
  ok(await p.$eval('section[data-cena] [data-a=conta]', e => e.textContent === '6,60'), 'contador chega a 6,60');
  // 2. do esboço à foto
  await p.evaluate(() => { const e = document.querySelector('.esboco'); scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * .85); }); await p.waitForTimeout(200);
  const ini = await p.$eval('.foto-real', e => getComputedStyle(e).clipPath);
  await p.evaluate(() => { const e = document.querySelector('.esboco'); scrollTo(0, e.getBoundingClientRect().top + scrollY - 40); }); await p.waitForTimeout(200);
  const fim = await p.$eval('.foto-real', e => getComputedStyle(e).clipPath);
  ok(/inset\((0px )?(100%|9\d)/.test(ini) || ini.includes('100%'), 'esboço → foto no início: foto escondida (' + ini + ')');
  ok(fim.includes('inset(0px)') || /inset\(0px 0px 0px 0px\)|inset\(0(px)? 0%/.test(fim) || fim === 'inset(0px)', 'esboço → foto no fim: foto inteira (' + fim + ')');
  // 3. galeria
  await vai(p, '[data-galeria]', 0); await p.waitForTimeout(150); const x0 = await p.$eval('[data-card]:last-child', e => e.getBoundingClientRect().right);
  await vai(p, '[data-galeria]', 1); await p.waitForTimeout(200); const x1 = await p.$eval('[data-card]:last-child', e => e.getBoundingClientRect().right);
  ok(x0 > 1280 && x1 <= 1281, 'galeria anda para o lado (' + Math.round(x0) + ' → ' + Math.round(x1) + ')');
  // 4. antes e depois
  await p.locator('[data-comparador] input').scrollIntoViewIfNeeded(); await p.focus('[data-comparador] input');
  for (let i = 0; i < 4; i++) await p.keyboard.press('ArrowLeft');
  ok(await p.$eval('[data-comparador]', e => e.style.getPropertyValue('--x') === '46%'), 'antes/depois pelo teclado');
  const bx = await p.locator('[data-comparador]').boundingBox(); await p.mouse.click(bx.x + bx.width * .8, bx.y + bx.height / 2);
  ok(await p.$eval('[data-comparador]', e => parseInt(e.style.getPropertyValue('--x')) > 70), 'antes/depois pelo mouse');
  // 5. peças com contador
  await vai(p, 'section[data-cena]:last-of-type', .5); await p.waitForTimeout(200);
  ok(await p.$eval('[data-contador]', e => e.textContent === '2'), 'contador de peças no meio: 2');
  await vai(p, 'section[data-cena]:last-of-type', 1); await p.waitForTimeout(250);
  ok(await p.evaluate(() => [...document.querySelectorAll('.itens [data-a]')].every(e => +getComputedStyle(e).opacity > .95)) && await p.$eval('[data-contador]', e => e.textContent === '3'), 'peças todas no lugar: 3 de 3');
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  let largura = 0; for (const s of ['section[data-cena]', '.esboco', '[data-galeria]', '[data-comparador]']) { await p.evaluate(s => document.querySelector(s).scrollIntoView(), s); await p.waitForTimeout(80); largura = Math.max(largura, await p.evaluate(() => document.documentElement.scrollWidth)); }
  ok(largura === 375, 'celular: sem rolagem lateral');
  await ctx.close();
  // sem JS e movimento reduzido: tudo pronto, nada preso
  for (const [nome, opts] of [['sem JS', { javaScriptEnabled: false }], ['movimento reduzido', { reducedMotion: 'reduce' }]]) {
    ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, ...opts }); p = await ctx.newPage();
    await p.goto(B, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => ({ anima: document.documentElement.classList.contains('anima'), altura: document.querySelector('section[data-cena]').offsetHeight,
      visiveis: [...document.querySelectorAll('[data-a]:not([data-a=croqui])')].every(e => +getComputedStyle(e).opacity > .5),
      foto: getComputedStyle(document.querySelector('.foto-real')).clipPath }));
    ok(!r.anima && r.altura < 1200 && r.visiveis && r.foto === 'none', nome + ': tudo visível e pronto, cenas sem prender o scroll');
    await ctx.close();
  }

  // ===== exemplo-referencias.html (move, escorre, enche, palavras, empilha, entrada) =====
  const R = B.replace(/exemplo(\.html)?$/, 'exemplo-referencias.html');
  ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); p = await ctx.newPage();
  const errs2 = []; p.on('pageerror', e => errs2.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs2.push(m.text()); });
  await p.goto(R, { waitUntil: 'networkidle' }); await p.waitForTimeout(1300);
  ok(await p.evaluate(() => [...document.querySelectorAll('[data-entrada]')].every(e => +getComputedStyle(e).opacity > .99 && getComputedStyle(e).filter.replace('blur(0px)', 'none') === 'none')), 'ref: entrada com desfoque termina nítida');
  // referência 1: escorre e enche
  await vai(p, 'section.fio', 0); await p.waitForTimeout(150);
  ok(await p.$eval('.fio [data-a=enche]', e => getComputedStyle(e).clipPath.includes('100%')), 'ref 1 no início: copo vazio');
  await vai(p, 'section.fio', .14); await p.waitForTimeout(150);
  const meio = await p.$eval('.fio [data-a=escorre]', e => e.style.transform);
  ok(/scaleY\(0\.[1-9]/.test(meio), 'ref 1: o fio de café está descendo (' + meio + ')');
  await vai(p, 'section.fio', 1); await p.waitForTimeout(200);
  ok(await p.$$eval('.fio [data-a=enche]', es => es.every(e => /inset\(0(%|px)/.test(getComputedStyle(e).clipPath) || getComputedStyle(e).clipPath === 'inset(0px)')), 'ref 1 no fim: copo cheio e leite misturado');
  ok(await p.evaluate(() => { const ps = [...document.querySelectorAll('.fio .painel')]; return +getComputedStyle(ps[0]).opacity < .05 && +getComputedStyle(ps[2]).opacity > .95 && document.querySelector('.fio li.ativa').textContent === 'Pronto'; }), 'ref 1: painéis passaram (01 saiu, 03 ficou) e etapa Pronto');
  // referência 2: palavra gigante
  const gig = () => p.$$eval('.gigante', es => es.map(e => +getComputedStyle(e).opacity * +getComputedStyle(e.firstElementChild || e).opacity > .9));
  await vai(p, 'section.camadas', .2); await p.waitForTimeout(150);
  ok(JSON.stringify(await gig()) === '[true,false,false]', 'ref 2: no começo só MOER aparece');
  await vai(p, 'section.camadas', .55); await p.waitForTimeout(150);
  ok(JSON.stringify(await gig()) === '[false,true,false]', 'ref 2: no meio só COAR');
  await vai(p, 'section.camadas', 1); await p.waitForTimeout(200);
  ok(JSON.stringify(await gig()) === '[false,false,true]' && await p.evaluate(() => +getComputedStyle(document.querySelector('.objeto')).zIndex > +getComputedStyle(document.querySelector('.gigante')).zIndex), 'ref 2: no fim SERVIR, com o objeto na frente da palavra');
  // referência 3: empilhadas e relógio
  await p.evaluate(() => { const pl = document.querySelector('[data-empilha]'); scrollTo(0, pl.getBoundingClientRect().top + scrollY - 56 + (innerHeight - 56) * 1.5); }); await p.waitForTimeout(250);
  ok(await p.evaluate(() => { const s = document.querySelectorAll('[data-empilha] > section'); return getComputedStyle(s[0]).position === 'sticky' && +s[0].style.getPropertyValue('--kit-cobre') > .99 && +s[1].style.getPropertyValue('--kit-cobre') > .2; }), 'ref 3: seção de cima coberta e escurecida pela seguinte');
  await p.evaluate(() => { const c = document.querySelector('.relogio'); scrollTo(0, c.closest('section').offsetTop); }); await p.locator('.relogio').scrollIntoViewIfNeeded(); await p.waitForTimeout(250);
  ok(await p.$eval('.ponteiro-h', e => /rotate\((1\d\d|2[01]\d)/.test(e.style.transform)), 'ref 3: ponteiro das horas girou até perto das 7h');
  // referência 4: palavra por palavra
  const pal = await p.$$eval('.falas h2 .kit-palavra', es => es.length);
  ok(pal === 9 && await p.$eval('.falas h2', e => e.textContent.replace(/\s+/g, ' ').trim() === 'Repara no que acontece quando você rola esta página.'), 'ref 4: título quebrado em 9 palavras, texto intacto');
  await vai(p, 'section.falas', .02); await p.waitForTimeout(150);
  ok(await p.$eval('.falas h2 .kit-palavra:last-child', e => +getComputedStyle(e).opacity < .05), 'ref 4 no início: última palavra escondida');
  await vai(p, 'section.falas', 1); await p.waitForTimeout(200);
  ok(await p.$$eval('.falas .kit-palavra', es => es.every(e => +getComputedStyle(e).opacity > .99 && getComputedStyle(e).filter === 'none')), 'ref 4 no fim: todas as palavras nítidas');
  ok(errs2.length === 0, 'ref: console limpo ' + JSON.stringify(errs2));
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(R, { waitUntil: 'networkidle' });
  let larg2 = 0; for (const s of ['section.fio', 'section.camadas', '[data-empilha]', 'section.falas']) { await p.evaluate(s => document.querySelector(s).scrollIntoView(), s); await p.waitForTimeout(80); larg2 = Math.max(larg2, await p.evaluate(() => document.documentElement.scrollWidth)); }
  ok(larg2 === 390, 'ref celular: sem rolagem lateral');
  await ctx.close();
  for (const [nome, opts] of [['sem JS', { javaScriptEnabled: false }], ['movimento reduzido', { reducedMotion: 'reduce' }]]) {
    ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, ...opts }); p = await ctx.newPage();
    await p.goto(R, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => ({ anima: document.documentElement.classList.contains('anima'),
      presas: [...document.querySelectorAll('[data-cena]')].every(s => s.offsetHeight < 1400),
      visiveis: [...document.querySelectorAll('[data-a], [data-entrada], .gigante')].every(e => +getComputedStyle(e).opacity > .5 && getComputedStyle(e).clipPath === 'none'),
      pilha: getComputedStyle(document.querySelector('[data-empilha] > section')).position }));
    ok(!r.anima && r.presas && r.visiveis && r.pilha !== 'sticky', 'ref ' + nome + ': tudo visível, nada preso nem empilhado');
    await ctx.close();
  }
  await b.close(); console.log('falhas:', f);
})();
