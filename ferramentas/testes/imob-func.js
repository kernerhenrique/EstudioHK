// Testes da demo Barlavento Camburi (lançamento imobiliário). Uso: node imob-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const B = process.argv[2] || BASE + '/demos/imobiliaria/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const vai = (p, sel, frac) => p.evaluate(([sel, frac]) => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.querySelector(sel); const t = 64; const total = el.offsetHeight - (innerHeight - t); scrollTo(0, el.getBoundingClientRect().top + scrollY - t + total * frac); }, [sel, frac]);
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); let p = await ctx.newPage();
  const errs = [], fora = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = new URL(r.url()); if (!['localhost', 'estudiohk.com.br'].includes(u.hostname)) fora.push(r.url()); });
  await p.goto(B, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.startsWith('noindex') && document.querySelector('.demo-bar .outras').href === 'https://estudiohk.com.br/sites/#demos'), 'noindex e link "outras demos"');
  await p.evaluate(() => document.fonts.ready);
  ok(await p.evaluate(() => document.fonts.check('400 40px "Young Serif"') && document.fonts.check('600 16px Manrope')), 'fontes do próprio site');
  // regras do anúncio
  const txt = await p.evaluate(() => document.body.innerText);
  ok(/registrada sob R\.0 da matrícula nº 00\.000 do Cartório do 1º Ofício de Registro de Imóveis/.test(txt) && txt.includes('Lei nº 4.591/1964, art. 32'), 'Lei 4.591/64 art. 32 §3º: número do registro da incorporação e cartório no anúncio');
  ok(await p.evaluate(() => { const n = document.querySelector('.rod-marca b'), c = document.querySelector('.rod-marca .creci'); return /CRECI\/ES 0000-J/.test(c.textContent) && parseFloat(getComputedStyle(c).fontSize) >= .25 * parseFloat(getComputedStyle(n).fontSize); }), 'COFECI 1.065/2007: nome seguido de CRECI com "J", tamanho ≥ 25% do nome');
  ok(/Imagens ilustrativas/i.test(txt) && /não fazem parte do contrato/.test(txt) && !/valoriza|rentabilidade|retorno garantido|garantid/i.test(txt), 'CDC art. 37: imagens ilustrativas avisadas, sem promessa de valorização');
  // de fora para dentro
  await vai(p, 'section.dentro', 0); await p.waitForTimeout(150);
  ok(await p.$eval('#interior', e => /circle\(0(\.0)?px/.test(e.style.clipPath)), 'início: só a fachada (sala fechada)');
  await vai(p, 'section.dentro', .3); await p.waitForTimeout(150);
  ok(await p.$eval('.zoom', e => { const m = /scale\(([\d.]+)\)/.exec(e.style.transform); return m && +m[1] > 2.5; }) && (await p.textContent('.dentro li.ativa')) === '12º andar', 'aproxima até o 12º andar');
  await vai(p, 'section.dentro', .6); await p.waitForTimeout(150);
  ok(await p.$eval('#interior', e => { const m = /circle\(([\d.]+)px/.exec(e.style.clipPath); return m && +m[1] > 400; }) && (await p.textContent('.dentro li.ativa')) === 'Sala', 'a sala se abre a partir da janela');
  await vai(p, 'section.dentro', 1); await p.waitForTimeout(200);
  ok(await p.$eval('.f-varanda', e => +getComputedStyle(e).opacity > .95) && (await p.textContent('.dentro li.ativa')) === 'Varanda', 'termina na varanda');
  // plantas
  await vai(p, 'section.plantas', 0); await p.waitForTimeout(150);
  ok(await p.$eval('#p-2q [data-a=traco]', e => parseFloat(getComputedStyle(e).strokeDashoffset) > .9), 'planta: paredes ainda não desenhadas');
  await vai(p, 'section.plantas', 1); await p.waitForTimeout(250);
  ok(await p.$$eval('#p-2q [data-a=traco]', es => es.every(e => parseFloat(getComputedStyle(e).strokeDashoffset) < .01)) && (await p.textContent('#p-2q')).includes('22 m²'), 'planta 2 quartos desenhada, com áreas');
  await p.focus('#tab-2q'); await p.keyboard.press('ArrowRight');
  ok(await p.isVisible('#p-3q') && await p.isHidden('#p-2q') && await p.isVisible('#lista-3q') && await p.evaluate(() => document.activeElement.id === 'tab-3q'), 'troca para 3 quartos pelo teclado');
  ok((await p.textContent('#p-3q')).includes('Quarto 3'), 'planta 3 quartos tem o terceiro quarto');
  // escolha o andar
  await p.click('.torre button[data-andar="3"]');
  const baixo = await p.$eval('#v-predios', e => e.style.transform);
  ok((await p.textContent('#andar-titulo')) === '3º andar · frente' && (await p.textContent('#andar-texto')).includes('rua'), 'andar 3: vista para a rua');
  await p.click('.torre button[data-andar="16"]');
  ok((await p.textContent('#andar-texto')).includes('acima dos prédios') && baixo !== await p.$eval('#v-predios', e => e.style.transform), 'andar 16: vista para o mar, prédios vizinhos baixam');
  await p.click('.posicao button[data-pos="fundos"]');
  ok((await p.textContent('#andar-titulo')).includes('fundos') && (await p.textContent('#andar-texto')).includes('tarde') && await p.$eval('#v-horizonte', e => e.style.opacity === '0'), 'fundos: sol da tarde, sem mar');
  // obra
  await p.evaluate(() => document.querySelector('#obra').scrollIntoView()); await p.waitForTimeout(500);
  ok(await p.$$eval('.etapas-obra [data-a=barra]', es => es.length === 4) && (await p.textContent('#obra')).includes('62%'), 'andamento da obra com 4 etapas');
  // visita
  await p.evaluate(() => document.querySelector('#visita').scrollIntoView());
  await p.click('#v-enviar');
  ok(await p.$eval('#v-nome', e => e.getAttribute('aria-invalid') === 'true') && await p.isHidden('#v-previa'), 'visita: sem nome não monta o pedido');
  ok((await p.$$('#v-dia option')).length === 6 && !(await p.$$eval('#v-dia option', os => os.some(o => /domingo/i.test(o.textContent)))), 'visita: 6 dias, sem domingo');
  await p.fill('#v-nome', 'Carla Mendes'); await p.fill('#v-tel', '(27) 99999-1234'); await p.selectOption('#v-tipo', '3 quartos (89 m²)'); await p.click('.periodos label:has-text("Tarde")'); await p.click('#v-enviar');
  const msg = await p.textContent('#v-msg');
  ok(await p.isVisible('#v-previa') && msg.includes('Carla Mendes') && msg.includes('3 quartos') && msg.includes('tarde'), 'visita: mensagem pronta para o WhatsApp');
  await p.click('#v-previa a[data-demo]'); ok(await p.isVisible('#janela'), 'enviar abre a janela de demonstração'); await p.keyboard.press('Escape');
  ok(fora.length === 0, 'nada carregado de fora ' + JSON.stringify(fora));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  let larg = 0; for (const s of ['.capa', 'section.dentro', 'section.plantas', '#andar', '#lazer', '#localizacao', '#obra', '#visita']) { await p.evaluate(s => document.querySelector(s).scrollIntoView(), s); await p.waitForTimeout(80); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  ok(larg === 375, 'celular: sem rolagem lateral');
  await ctx.close();
  for (const [nome, opts] of [['sem JS', { javaScriptEnabled: false }], ['movimento reduzido', { reducedMotion: 'reduce' }]]) {
    ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, ...opts }); p = await ctx.newPage();
    await p.goto(B, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => ({ presas: [...document.querySelectorAll('[data-cena]')].every(s => s.offsetHeight < 3200),
      vis: [...document.querySelectorAll('[data-a]:not(.rotulos *), [data-entrada]')].filter(e => !e.closest('[hidden]')).every(e => +getComputedStyle(e).opacity > .5),
      int: getComputedStyle(document.querySelector('#interior')).clipPath }));
    ok(r.presas && r.vis && r.int === 'none', nome + ': tudo visível, sala e fotos em sequência, nada preso');
    await ctx.close();
  }
  await b.close(); console.log('falhas:', f);
})();
