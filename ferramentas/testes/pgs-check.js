const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
(async () => {
  const b = await chromium.launch(); let f = 0;
  for (const w of [1366, 1000, 375]) for (const u of ['/', '/sites/', '/automacoes/', '/sistemas/']) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } }); const e = [];
    p.on('pageerror', x => e.push(x.message)); p.on('console', m => { if (m.type() === 'error') e.push(m.text()); });
    await p.goto(BASE + '' + u, { waitUntil: 'networkidle' });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    if (e.length || sw > w) { f++; console.log('FALHA', w, u, sw, e); }
    if (u === '/' && w !== 375) { await p.locator('.portas').scrollIntoViewIfNeeded(); await p.waitForTimeout(900); await p.locator('.portas').screenshot({ path: SAIDA + 'portas-' + w + '.png' }); }
    await p.close();
  }
  console.log('falhas', f); await b.close();
})();
