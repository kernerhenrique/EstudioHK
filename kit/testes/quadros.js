// Tira prints de cenas presas em vários pontos do scroll, para revisar o movimento.
// Uso: node kit/testes/quadros.js PASTA_SAIDA URL [largura] [altura] [seletores separados por vírgula] [frações]
// Ex.: node kit/testes/quadros.js /tmp/quadros http://localhost:8792/kit/exemplo.html 1280 800 "section[data-cena]" 0,0.5,1
const { chromium } = require('playwright');
const fs = require('fs');
const [,, O = '/tmp/quadros', U = 'http://localhost:8792/kit/exemplo.html', W = '1280', H = '800', SEL = '[data-cena]', PS = '0,0.3,0.55,0.8,1'] = process.argv;
(async () => {
  fs.mkdirSync(O, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +W, height: +H } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(U, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; for (const i of document.images) { i.loading = 'eager'; await i.decode().catch(() => {}); } });
  for (const sel of SEL.split(',')) {
    const n = await p.$$eval(sel, els => els.length);
    for (let k = 0; k < n; k++) for (const f of PS.split(',').map(Number)) {
      await p.evaluate(([sel, k, f]) => { const el = document.querySelectorAll(sel)[k]; const t = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topo')) || 0; const total = el.offsetHeight - (innerHeight - t); scrollTo(0, el.getBoundingClientRect().top + scrollY - t + Math.max(total, 0) * f); }, [sel, k, f]);
      await p.waitForTimeout(250);
      await p.screenshot({ path: `${O}/cena${k + 1}-${W}-${String(f).replace('.', '')}.png` });
    }
  }
  console.log('prints em', O, 'erros:', JSON.stringify(errs));
  await b.close();
})();
