// Testes da demo Coadouro (cafeteria). Uso: node cafe-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const B = process.argv[2] || BASE + '/demos/cafeteria/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const vai = (p, sel, frac) => p.evaluate(([sel, frac]) => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.querySelector(sel); const t = 64; const total = el.offsetHeight - (innerHeight - t); scrollTo(0, el.getBoundingClientRect().top + scrollY - t + total * frac); }, [sel, frac]);
const op = (p, sel) => p.$eval(sel, e => +getComputedStyle(e).opacity);
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); let p = await ctx.newPage();
  const errs = [], fora = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = new URL(r.url()); if (!['localhost', 'estudiohk.com.br'].includes(u.hostname)) fora.push(r.url()); });
  await p.goto(B, { waitUntil: 'networkidle' }); await p.waitForTimeout(1300);
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.startsWith('noindex') && document.querySelector('.demo-bar .outras').href === 'https://estudiohk.com.br/sites/#demos'), 'noindex e link "outras demos"');
  await p.evaluate(() => document.fonts.ready);
  ok(await p.evaluate(() => document.fonts.check('800 40px "Bricolage Grotesque"') && document.fonts.check('400 16px "Instrument Sans"')), 'fontes do próprio site');
  ok(await p.evaluate(() => [...document.querySelectorAll('[data-entrada]')].every(e => +getComputedStyle(e).opacity > .99)), 'capa entra e fica nítida');
  // cold brew
  await vai(p, 'section.fio', 0); await p.waitForTimeout(150);
  ok(await p.$eval('.fio [data-a=enche]', e => getComputedStyle(e).clipPath.includes('100%')), 'cold brew no início: copo vazio');
  await vai(p, 'section.fio', 1); await p.waitForTimeout(200);
  ok(await p.$$eval('.fio [data-a=enche]', es => es.every(e => /inset\(0(%|px)/.test(getComputedStyle(e).clipPath))) && (await p.textContent('.fio li.ativa')) === 'Pronto', 'cold brew no fim: copo cheio, leite misturado, etapa Pronto');
  // do grão à xícara
  const gig = () => p.$$eval('.gigante', es => es.map(e => +getComputedStyle(e).opacity * +getComputedStyle(e.firstElementChild || e).opacity > .9));
  await vai(p, 'section.camadas', .2); await p.waitForTimeout(150);
  ok(JSON.stringify(await gig()) === '[true,false,false]' && await p.$eval('.camadas [data-r2="720"]', e => /rotate\((\d{3})/.test(e.style.transform)), 'MOER com a manivela girando');
  await vai(p, 'section.camadas', .6); await p.waitForTimeout(150);
  ok(JSON.stringify(await gig()) === '[false,true,false]' && await p.$eval('#pano + g [data-a=enche], [clip-path="url(#pano)"] [data-a=enche]', e => /inset\(0(%|px)/.test(getComputedStyle(e).clipPath)), 'COAR com o pano manchado de café');
  await vai(p, 'section.camadas', 1); await p.waitForTimeout(200);
  ok(JSON.stringify(await gig()) === '[false,false,true]', 'SERVIR no fim');
  // seções empilhadas
  await p.evaluate(() => { const s = document.querySelector('#pedido'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 64); }); await p.waitForTimeout(350);
  ok(await p.evaluate(() => { const s = document.querySelectorAll('[data-empilha] > section'); return getComputedStyle(s[0]).position === 'sticky' && +s[0].style.getPropertyValue('--kit-cobre') > .99 && getComputedStyle(s[2], '::after').opacity === '0'; }), 'seções empilhadas: as de cima escurecem, a do pedido fica clara');
  ok(await p.$eval('.recibo', e => +getComputedStyle(e).opacity > .95), 'comprovante subiu');
  await p.evaluate(() => scrollTo(0, document.querySelector('#horario').getBoundingClientRect().top + scrollY - 64)); await p.waitForTimeout(300);
  ok(await p.$eval('.relogio .ponteiro', e => /rotate\((1\d\d|20\d|210)/.test(e.style.transform)), 'relógio gira até as 7h');
  ok((await p.$$('.item')).length === 4 && (await p.textContent('#cardapio')).includes('R$ 16,00'), 'cardápio com 4 itens e preços');
  // a casa
  ok(await p.$$eval('.casa h2 .kit-palavra', es => es.length) === 11, 'frase quebrada em 11 palavras');
  await vai(p, 'section.casa', 1); await p.waitForTimeout(200);
  ok(await p.$$eval('.casa .kit-palavra', es => es.every(e => +getComputedStyle(e).opacity > .99 && getComputedStyle(e).filter === 'none')), 'frase toda nítida no fim');
  // janela
  await p.click('.s-pedido a[data-demo]'); ok(await p.isVisible('#janela') && (await p.textContent('#j-texto')).includes('WhatsApp'), '"Pedir pelo WhatsApp" abre a janela de demonstração');
  await p.keyboard.press('Escape'); ok(await p.isHidden('#janela'), 'Esc fecha');
  ok((await p.textContent('.rodape')).includes('fictícios') && (await p.textContent('.rodape')).includes('Unsplash'), 'rodapé com aviso e crédito das fotos');
  ok(fora.length === 0, 'nada carregado de fora ' + JSON.stringify(fora));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  let larg = 0; for (const s of ['.capa', 'section.fio', 'section.camadas', '#cardapio', '#pedido', 'section.casa', '#onde']) { await p.evaluate(s => document.querySelector(s).scrollIntoView(), s); await p.waitForTimeout(80); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  ok(larg === 375, 'celular: sem rolagem lateral');
  await ctx.close();
  // sem JS e movimento reduzido
  for (const [nome, opts] of [['sem JS', { javaScriptEnabled: false }], ['movimento reduzido', { reducedMotion: 'reduce' }]]) {
    ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, ...opts }); p = await ctx.newPage();
    await p.goto(B, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => ({ presas: [...document.querySelectorAll('[data-cena]')].every(s => s.offsetHeight < 1500),
      vis: [...document.querySelectorAll('[data-a], [data-entrada], .gigante, .rv')].every(e => +getComputedStyle(e).opacity > .5 && getComputedStyle(e).clipPath === 'none'),
      pilha: getComputedStyle(document.querySelector('[data-empilha] > section')).position }));
    ok(r.presas && r.vis && r.pilha !== 'sticky', nome + ': tudo visível, nada preso');
    await ctx.close();
  }
  await b.close(); console.log('falhas:', f);
})();
