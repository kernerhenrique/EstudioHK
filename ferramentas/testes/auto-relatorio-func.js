// Testes da demo "Relatório da semana". Uso: node auto-relatorio-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const U = process.argv[2] || BASE + '/demos/automacoes/relatorio-semanal/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const tx = async (p, s) => (await p.textContent(s)).replace(/ /g, ' ');
const fim = p => p.waitForSelector('.etapas li[data-e="5"].feita', { timeout: 20000, state: 'attached' });
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = [], reqs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = new URL(r.url()); if (!['localhost', 'estudiohk.com.br'].includes(u.hostname)) reqs.push(r.url()); });
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.includes('noindex')), 'noindex');
  ok((await tx(p, '#relogio')) === 'seg, 07:59' && await p.isVisible('#er-vazio') && (await p.$$('#hist-linhas tr')).length === 3, 'início: 07:59, e-mail vazio, histórico com 3 semanas');
  await p.click('#c-rodar'); await fim(p);
  ok((await tx(p, '#relogio')) === 'seg, 08:00', 'roda às 8h');
  const whats = await p.$eval('#conv-dono', c => c.innerText);
  ok(whats.includes('Resumo da semana · 27/10 a 02/11') && whats.includes('Alunos ativos: 2.412 (▲ 14)') && whats.includes('Check-ins: 9.870 (▼ 2,5%)'), 'resumo no WhatsApp com os números e a variação');
  const kpis = await p.$$eval('.er-kpi b', bs => bs.map(b => b.textContent));
  ok(kpis.join() === '2.412,38,24,9.870', 'e-mail: 4 números (' + kpis.join() + ')');
  ok((await p.$$('.col')).length === 7 && (await p.$$('.col .rot')).length === 2 && (await p.$$eval('.col .rot', r => r.map(x => x.textContent))).join() === '1.920,500', 'check-ins: 7 colunas, rótulo só no maior e no menor');
  ok((await p.$$('.barra-l')).length === 5 && (await p.$$eval('.barra-l .v', v => v.map(x => x.textContent).filter(Boolean))).join() === '97%,41%', 'ocupação: 5 barras, rótulo só no maior e no menor');
  ok(await p.$eval('.col', c => c.getAttribute('data-dica') === 'segunda: 1.920 check-ins' && c.tabIndex === 0), 'coluna tem dica e pode receber foco');
  await p.click('.er-graf details summary >> nth=0');
  ok((await p.$$('.er-graf details[open] tbody tr')).length === 7, 'gráfico tem versão em tabela');
  ok((await p.$$eval('.colunas i', is => is.map(i => getComputedStyle(i).borderTopLeftRadius))).every(r => r === '4px'), 'colunas com ponta arredondada de 4px');
  ok((await tx(p, '#er-corpo')).includes('31 alunos · R$ 4.026,90') && (await tx(p, '#er-corpo')).includes('187 alunos'), 'listas de atrasados e de quem sumiu');
  ok((await p.$$('#hist-linhas tr')).length === 4 && (await tx(p, '#hist-linhas tr:last-child')).includes('27/10–02/11'), 'histórico ganha a linha da semana');
  ok((await tx(p, '#custo')).startsWith('Meta R$ 0,035'), 'custo: 1 mensagem na Meta');
  ok((await p.$$eval('#fontes-lista b', bs => bs.map(b => b.textContent))).every(t => t !== '·'), 'as 4 fontes de dados foram lidas');
  // dado faltando
  await p.click('#c-recomecar');
  ok(await p.isVisible('#er-vazio') && (await p.$$('#hist-linhas tr')).length === 3 && (await tx(p, '#relogio')) === 'seg, 07:59', 'recomeçar volta ao início');
  await p.check('#c-falha'); await p.click('#c-rodar'); await fim(p);
  ok((await p.$eval('.etapas li[data-e="3"]', l => l.className)).includes('aviso') && await p.isVisible('#alerta-hk'), 'dado faltando: conferência avisa e alerta a EstudioHK');
  ok(await p.$eval('.col:last-child', c => c.classList.contains('sem')) && (await tx(p, '.col:last-child .rot')) === 'sem dados', 'domingo aparece como "sem dados", sem número inventado');
  ok((await p.$$eval('.er-kpi b', bs => bs[3].textContent)) === '9.370' && (await tx(p, '#conv-dono')).includes('sem domingo'), 'total sem o domingo e aviso no WhatsApp');
  ok((await tx(p, '#hist-linhas tr:last-child')).includes('9.370*'), 'histórico marca a semana com dado faltando');
  // conta
  ok((await tx(p, '#k-total')) === 'R$ 0,15', 'conta padrão: 1 pessoa = R$ 0,15/mês');
  await p.fill('#k-pessoas', '0'); await p.dispatchEvent('#k-pessoas', 'input');
  ok((await tx(p, '#k-total')) === 'R$ 0,00' && (await tx(p, '#k-detalhe')).startsWith('Só por e-mail'), 'só por e-mail: R$ 0');
  ok(await p.evaluate(() => { const t = document.body.innerText; return t.includes('Está incluso na manutenção mensal da automação') && t.includes('E se eu parar de trabalhar com a EstudioHK?') && t.includes('Não usa'); }), 'n8n incluso, sem IA e "E se eu parar…"');
  ok(reqs.length === 0, 'nenhuma requisição para fora ' + JSON.stringify(reqs));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' });
  await p.click('#z-rodar'); await fim(p);
  ok(await p.isVisible('#conv-dono .bolha:last-child') && await p.isVisible('#aba-bas .ponto'), 'celular: resumo aparece e Bastidores ganha o ponto');
  await p.click('#aba-bas');
  let larg = 0; for (const s of ['#sim', '#email', '#ferramentas', '#custos']) { await p.locator(s).scrollIntoViewIfNeeded(); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  ok(larg === 375, 'celular: sem rolagem lateral');
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' }); const t0 = Date.now(); await p.click('#c-rodar'); await fim(p);
  ok(Date.now() - t0 < 3000, 'movimento reduzido: roda quase na hora');
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelectorAll('.etapas li').length === 5 && document.body.innerText.includes('precisa de JavaScript')), 'sem JS: etapas legíveis e aviso');
  await b.close(); console.log('falhas:', f);
})();
