// Abas das demonstrações em /sites/: "Sites e landing pages" | "Experiências imersivas".
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok    ' : 'FALHA ') + m); if (!c) falhas++; };

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  const erros = []; p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.goto(BASE + '/sites/', { waitUntil: 'networkidle' });
  await p.locator('#demos').scrollIntoViewIfNeeded();
  ok(await p.isVisible('.demo-abas') && (await p.getAttribute('#ab-sites', 'aria-selected')) === 'true', 'abas visíveis, "Sites e landing pages" começa selecionada');
  ok(await p.isVisible('#pn-sites') && await p.isHidden('#imersivas'), 'só a grade de sites aparece no início');
  ok(await p.locator('#pn-sites .demo-card').count() === 8, '8 demos na aba de sites');
  await p.click('#ab-imersivas');
  ok(await p.isVisible('#imersivas') && await p.isHidden('#pn-sites'), 'clique abre "Experiências imersivas"');
  ok((await p.getAttribute('#imersivas .demo-card', 'href')) === '/demos/maillard/', 'cartão aponta para a Maillard');
  await p.waitForTimeout(800);
  await p.locator('#imersivas').screenshot({ path: SAIDA + 'abas-imersivas.png' });
  await p.focus('#ab-imersivas'); await p.keyboard.press('ArrowLeft');
  ok(await p.evaluate(() => document.activeElement.id === 'ab-sites') && await p.isVisible('#pn-sites'), 'seta para a esquerda volta para sites');
  const r = await p.request.get(BASE + '/demos/maillard/'); const html = await r.text();
  ok(r.status() === 200 && html.includes('noindex') && html.includes('https://estudiohk.com.br/demos/maillard/media/images/hero-burger-1600.webp'), 'demo responde, com noindex e og:image completo');
  // endereço direto
  const p2 = await b.newPage({ viewport: { width: 1366, height: 900 } });
  await p2.goto(BASE + '/sites/#imersivas', { waitUntil: 'networkidle' });
  ok(await p2.isVisible('#imersivas') && (await p2.getAttribute('#ab-imersivas', 'aria-selected')) === 'true', '/sites/#imersivas abre a aba certa');
  // dúvida nova leva à aba
  await p2.goto(BASE + '/sites/', { waitUntil: 'networkidle' });
  const q = p2.locator('.acc-q', { hasText: 'experiência imersiva' });
  ok(await q.count() === 1, 'dúvida nova sobre experiência imersiva');
  // celular
  const m = await b.newPage({ viewport: { width: 375, height: 800 } });
  await m.goto(BASE + '/sites/#imersivas', { waitUntil: 'networkidle' });
  ok(await m.evaluate(() => document.documentElement.scrollWidth) <= 375, 'celular sem rolagem lateral');
  await m.locator('#demos').screenshot({ path: SAIDA + 'abas-cel.png' });
  // sem JS: as duas grades aparecem
  const sj = await b.newContext({ javaScriptEnabled: false }); const s = await sj.newPage();
  await s.goto(BASE + '/sites/');
  ok(await s.isVisible('#pn-sites') && await s.isVisible('#imersivas') && await s.isHidden('.demo-abas'), 'sem JS: as duas grades aparecem e as abas somem');
  ok(erros.length === 0, 'console limpo ' + erros.join(' | '));
  await b.close();
  console.log('falhas: ' + falhas); process.exit(falhas ? 1 : 0);
})();
