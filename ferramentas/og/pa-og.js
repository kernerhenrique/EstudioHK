const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
 await p.goto(BASE + '/demos/advocacia/', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
 const y = await p.evaluate(() => document.querySelector('.demo-bar').offsetHeight);
 await p.screenshot({ path: SAIDA + 'pa-og-raw.png', clip: { x: 0, y, width: 1440, height: 756 } });
 await b.close(); })();
