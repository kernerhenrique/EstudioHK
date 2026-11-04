// Modelo: teste completo da demo Taipa Arquitetura. Para um cliente, trocar a URL, os seletores (#capa, #processo…) e os textos esperados.
const { chromium } = require('playwright');
const B = process.argv[2] || 'http://localhost:8792/demos/arquitetura/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const vai = (p, sel, frac) => p.evaluate(([sel, frac]) => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.querySelector(sel); const t = document.querySelector('.topo').offsetHeight; const total = el.offsetHeight - (innerHeight - t); scrollTo(0, el.getBoundingClientRect().top + scrollY - t + total * frac); }, [sel, frac]);
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const bad = []; p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(bad.length === 0, 'nenhum arquivo quebrado ' + JSON.stringify(bad));
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.startsWith('noindex')), 'demo fora do Google (noindex)');
  ok(await p.evaluate(() => document.fonts.check('700 30px "Bricolage Grotesque"') && document.fonts.check('12px "IBM Plex Mono"')), 'fontes do próprio site');
  const txt = await p.evaluate(() => document.body.innerText);
  ok(/Laís Andrade · Arquiteta e urbanista · CAU A000000-0/.test(txt) && /arquitetura residencial/i.test(txt), 'Lei 12.378/2010 art. 14: nome, registro no CAU e atividade visíveis');
  ok(!/R\$|depoimento|melhor arquitet|garant|grátis|gratuit/i.test(txt), 'sem preço, depoimento ou promessa');
  // capa: começa vazia (só croqui) e termina com a casa pronta e a noite
  await vai(p, '#capa', 0); await p.waitForTimeout(200);
  const ini = await p.evaluate(() => ({ chao: getComputedStyle(document.querySelector('#capa [data-a=traco]')).strokeDashoffset, noite: +getComputedStyle(document.querySelector('#capa rect[fill="#22303D"]')).opacity }));
  ok(parseFloat(ini.chao) > .9 && ini.noite === 0, 'capa no início: traços ainda não desenhados, sem noite');
  await vai(p, '#capa', .5); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelector('.etapas li.ativa').textContent.includes('Fechamentos')), 'no meio da capa a etapa ativa é Fechamentos');
  await vai(p, '#capa', 1); await p.waitForTimeout(250);
  const fim = await p.evaluate(() => ({ tracos: [...document.querySelectorAll('#capa [data-a=traco]')].every(e => parseFloat(getComputedStyle(e).strokeDashoffset) < .01), noite: +getComputedStyle(document.querySelector('#capa rect[fill="#22303D"]')).opacity, luz: +getComputedStyle(document.querySelector('#capa rect[fill="#F2C76B"]')).opacity, ativa: document.querySelector('.etapas li.ativa').textContent }));
  ok(fim.tracos && fim.noite > .9 && fim.luz > .8 && fim.ativa.includes('Vida'), 'capa no fim: todos os traços completos, noite e janelas acesas, etapa Vida');
  // planta
  for (const [fr, nome] of [[.1, 'Estudo preliminar'], [.4, 'Anteprojeto'], [.6, 'Projeto executivo'], [.9, 'Acompanhamento']]) {
    await vai(p, '#processo', fr); await p.waitForTimeout(150);
    ok(await p.evaluate(n => document.querySelector('.fases li.ativa b').textContent === n, nome), 'planta em ' + fr + ': fase ' + nome);
  }
  await vai(p, '#processo', 1); await p.waitForTimeout(250);
  ok(await p.evaluate(() => [...document.querySelectorAll('#processo .r-area tspan')].map(t => t.textContent).join('|') === '48,6|34,7|30,1|9,3|16,1|5,6|6,2|16,1'), 'áreas dos cômodos contadas até o valor final');
  await p.hover('.planta .comodo[data-nome="Suíte"]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.getElementById('dica-comodo').classList.contains('visivel') && document.getElementById('dica-comodo').textContent === 'Suíte · 16,1 m²'), 'passar o mouse na suíte mostra nome e área');
  // sala
  await vai(p, '#interiores', 1); await p.waitForTimeout(250);
  ok(await p.evaluate(() => document.querySelector('#contador-sala b').textContent === '6' && [...document.querySelectorAll('#interiores .item')].every(e => +getComputedStyle(e).opacity > .95)), 'sala completa: 6 de 6 itens visíveis');
  await vai(p, '#interiores', .4); await p.waitForTimeout(200);
  ok(await p.evaluate(() => +document.querySelector('#contador-sala b').textContent < 6), 'no meio da cena a sala ainda está incompleta');
  // galeria
  await vai(p, '#projetos', 0); await p.waitForTimeout(200); const x0 = await p.evaluate(() => document.querySelector('.proj:last-child').getBoundingClientRect().right);
  await vai(p, '#projetos', 1); await p.waitForTimeout(250); const x1 = await p.evaluate(() => document.querySelector('.proj:last-child').getBoundingClientRect().right);
  ok(x0 > 1440 && x1 <= 1440, 'galeria anda para o lado com o scroll e mostra o último projeto (' + Math.round(x0) + ' → ' + Math.round(x1) + ')');
  // antes e depois
  await p.locator('#comp-range').scrollIntoViewIfNeeded(); await p.focus('#comp-range');
  for (let i = 0; i < 5; i++) await p.keyboard.press('ArrowRight');
  ok(await p.evaluate(() => document.getElementById('comparador').style.getPropertyValue('--x') === '55%'), 'antes/depois anda pelo teclado');
  const box = await p.locator('#comparador').boundingBox(); await p.mouse.click(box.x + box.width * .2, box.y + box.height / 2);
  ok(await p.evaluate(() => parseInt(document.getElementById('comparador').style.getPropertyValue('--x')) < 30), 'antes/depois anda com o mouse');
  // formulário
  ok(await p.isDisabled('#f-enviar'), 'formulário bloqueado no início');
  await p.click('.pilulas label:has-text("Reforma")'); await p.click('.pilulas label:has-text("Sim")'); await p.fill('#f-cidade', 'Vila Velha'); await p.fill('#f-nome', 'Paulo');
  await p.click('#f-enviar'); const msg = await p.textContent('#f-msg');
  ok(msg.includes('Paulo') && msg.includes('uma reforma em Vila Velha') && msg.includes(': sim'), 'mensagem: ' + JSON.stringify(msg));
  await p.click('.rod-links a:has-text("Instagram")'); ok(await p.isVisible('#janela'), 'links do rodapé abrem a janela de demonstração'); await p.keyboard.press('Escape');
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  for (const w of [375, 768]) {
    ctx = await b.newContext({ viewport: { width: w, height: 812 }, isMobile: w < 500, hasTouch: w < 500 }); p = await ctx.newPage();
    await p.goto(B, { waitUntil: 'networkidle' });
    let largura = 0; for (const s of ['#capa', '#processo', '#interiores', '#projetos', '#reforma', '#contato']) { await p.evaluate(s => document.querySelector(s).scrollIntoView(), s); await p.waitForTimeout(80); largura = Math.max(largura, await p.evaluate(() => document.documentElement.scrollWidth)); }
    ok(largura === w, w + 'px: sem rolagem lateral');
    if (w === 375) {
      await vai(p, '#processo', .6); await p.waitForTimeout(150);
      ok(await p.evaluate(() => getComputedStyle(document.querySelector('.fases li.ativa'), '::before').content.includes('03')), 'celular: fase ativa mostra o número certo (03)');
      await p.evaluate(() => scrollTo(0, 0)); await p.click('.abre-menu'); ok(await p.isVisible('#gaveta a[href="#processo"]'), 'menu do celular abre');
    }
    await ctx.close();
  }
  for (const [nome, opts] of [['sem JS', { javaScriptEnabled: false }], ['movimento reduzido', { reducedMotion: 'reduce' }]]) {
    ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts }); p = await ctx.newPage();
    await p.goto(B, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => ({ anima: document.documentElement.classList.contains('anima'), alturaCapa: document.getElementById('capa').offsetHeight, visiveis: [...document.querySelectorAll('[data-a]:not([data-a=croqui]):not([data-a=zona]):not([data-a=zonatxt])')].every(e => +getComputedStyle(e).opacity > .5 || e.closest('svg') === null), tracos: [...document.querySelectorAll('[data-a=traco]')].every(e => !getComputedStyle(e).strokeDashoffset || parseFloat(getComputedStyle(e).strokeDashoffset) === 0) }));
    ok(!r.anima && r.alturaCapa < 1400 && r.tracos, nome + ': desenhos prontos e cenas sem prender o scroll');
    await ctx.close();
  }
  await b.close(); console.log('falhas:', f);
})();
