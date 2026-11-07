// Testes da Clínica Lumar (v2, verde-petróleo). Uso: node clin2-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const B = process.argv[2] || BASE + '/demos/clinica/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const tx = async (p, s) => (await p.textContent(s)).replace(/ /g, ' ');
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = [], fora = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = new URL(r.url()); if (!['localhost', 'estudiohk.com.br'].includes(u.hostname)) fora.push(r.url()); });
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.startsWith('noindex')), 'demo fora do Google (noindex)');
  await p.evaluate(() => document.fonts.ready);
  ok(await p.evaluate(() => document.fonts.check('600 20px Figtree') && document.fonts.check('500 40px Newsreader') && document.fonts.check('italic 400 40px Newsreader')), 'fontes Figtree e Newsreader carregadas do próprio site');
  const txt = await p.evaluate(() => document.body.innerText);
  ok(/Diretor técnico:.*CRM-ES.*RQE/.test(txt) && /CRM-ES 0000-PJ/.test(txt), 'regra CFM: clínica com CRM e diretor técnico com CRM e RQE');
  ok((txt.match(/Médic[oa] ·/g) || []).length >= 12, 'regra CFM: cada médico com "Médico(a)", especialidade, CRM e RQE (cartões e equipe)');
  ok(!/melhor clínica|o melhor|referência em|garant|grátis|gratuit|antes e depois/i.test(txt), 'regra CFM: sem superlativo, promessa de resultado ou consulta grátis');
  // horários livres
  ok((await p.$$('#hl-esp button')).length === 6 && (await p.getAttribute('#hl-esp button[data-esp=clinica]', 'aria-pressed')) === 'true', 'horários livres: 6 especialidades, clínica geral escolhida');
  ok((await p.$$('#hl-slots button')).length === 3 && (await tx(p, '#hl-slots')).includes('Dr. Ricardo'), '3 próximos horários da clínica geral');
  await p.click('#hl-esp button[data-esp=cardiologia]');
  const slotsC = await tx(p, '#hl-slots');
  ok((await p.$$('#hl-slots button')).length === 3 && slotsC.includes('Dr. Paulo') && /(ter|qui) \d\d\/\d\d/.test(slotsC) && !/(seg|qua|sex|sáb) \d/.test(slotsC), 'cardiologia: horários só terça e quinta, com o Dr. Paulo');
  const primeiro = await p.$eval('#hl-slots button', b => b.innerText.replace(/\n/g, ' '));
  await p.click('#hl-slots button'); await p.waitForTimeout(900);
  ok((await p.inputValue('#ag-esp')) === 'cardiologia' && await p.isVisible('#ag-escolhido') && (await tx(p, '#ag-escolhido')).includes('Dr. Paulo Neves') && await p.isHidden('.form-ag fieldset'), 'escolher horário preenche a especialidade e mostra o horário (' + primeiro + ')');
  await p.selectOption('#ag-conv', 'particular'); await p.fill('#ag-nome', 'Maria Souza');
  ok(!(await p.isDisabled('#ag-montar')), 'com horário escolhido, não precisa do período');
  await p.click('#ag-montar');
  const msg1 = await p.textContent('#ag-msg');
  ok(msg1.includes('Cardiologia') && msg1.includes('Horário que vi no site') && msg1.includes('Particular') && msg1.includes('Maria Souza'), 'mensagem com o horário escolhido');
  await p.click('#ag-escolhido button');
  ok(await p.isHidden('#ag-escolhido') && await p.isVisible('.form-ag fieldset') && await p.isDisabled('#ag-montar'), '"Trocar" volta a pedir o período');
  // cartões
  ok((await p.$$('.esp')).length === 6 && (await tx(p, '.esp:nth-child(5)')).includes('Particular R$ 260') && (await tx(p, '.esp:nth-child(5)')).includes('Dra. Camila Rocha'), '6 especialidades com médico e valor (pediatria R$ 260)');
  await p.click('.esp:nth-child(6) summary');
  ok((await tx(p, '.esp:nth-child(6) details p')).includes('raio-x'), '"O que levar" abre na ortopedia');
  await p.click('[data-agendar=ortopedia]'); await p.waitForTimeout(900);
  ok((await p.inputValue('#ag-esp')) === 'ortopedia', '"Agendar ortopedia" preenche a especialidade');
  ok((await p.$$('#valores tr')).length === 6 && (await tx(p, '#valores')).includes('R$ 320,00'), 'tabela de valores com as 6 especialidades');
  ok((await p.$$('.exame')).length === 3 && /preparo/i.test(txt) && txt.includes('Anvisa'), 'exames na clínica com preparo e duração');
  // convênio
  await p.fill('#conv', 'vida'); ok((await p.getAttribute('#conv-resp', 'class')).includes('sim') && (await tx(p, '#conv-resp')).includes('Vida+ Saúde'), 'convênio aceito: "vida" encontra Vida+ Saúde');
  await p.fill('#conv', 'plena'); ok((await tx(p, '#conv-resp')).includes('exceto dermatologia'), 'convênio mostra a cobertura');
  await p.click('#sugestoes button:has-text("Outro plano")'); ok((await p.getAttribute('#conv-resp', 'class')).includes('nao'), 'convênio não aceito sugere particular');
  await p.fill('#conv', 'Horizonte'); await p.click('#conv-agendar'); await p.waitForTimeout(800);
  ok((await p.inputValue('#ag-conv')) === 'Horizonte Saúde', '"Agendar com este plano" preenche o convênio');
  await p.click('.periodos label:has-text("Tarde")'); await p.fill('#ag-nome', 'João Lima'); await p.click('#ag-montar');
  const msg2 = await p.textContent('#ag-msg'); ok(msg2.includes('Ortopedia') && msg2.includes('Horizonte Saúde') && msg2.includes('tarde'), 'mensagem com período');
  // parallax
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, document.querySelector('.faixa').offsetTop - 300); }); await p.waitForTimeout(300);
  ok(await p.$eval('.faixa-foto img', i => /translate3d/.test(i.style.transform)), 'parallax ligado no computador');
  // janela, dúvidas
  await p.click('a:has-text("Como chegar")'); ok(await p.isVisible('#janela'), '"Como chegar" abre a janela de demonstração'); await p.keyboard.press('Escape');
  await p.click('#p2'); ok((await p.getAttribute('#p2', 'aria-expanded')) === 'true', 'dúvidas abrem');
  ok(fora.length === 0, 'nada carregado de fora ' + JSON.stringify(fora));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // movimento reduzido: sem parallax
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  await p.evaluate(() => scrollTo(0, document.querySelector('.faixa').offsetTop - 300)); await p.waitForTimeout(300);
  ok(await p.$eval('.faixa-foto img', i => getComputedStyle(i).transform === 'none'), 'movimento reduzido: sem parallax');
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.documentElement.scrollWidth === innerWidth), 'sem rolagem lateral no celular');
  ok(await p.$eval('.faixa-foto img', i => !i.style.transform), 'celular: sem parallax');
  ok(!(await p.evaluate(() => document.getElementById('barra-m').classList.contains('visivel'))), 'barra "Agendar" escondida no topo');
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#equipe').scrollIntoView(); }); await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.getElementById('barra-m').classList.contains('visivel')), 'barra aparece no meio da página');
  await p.click('.abre-menu'); ok(await p.isVisible('#gaveta a[href="#exames"]'), 'menu do celular abre');
  await ctx.close();
  // sem JS
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => [...document.querySelectorAll('.revela')].every(e => getComputedStyle(e).opacity === '1') && document.querySelectorAll('.esp').length === 6 && document.querySelectorAll('.doc').length === 6 && document.querySelectorAll('#valores tr').length === 6), 'sem JS: especialidades, equipe e valores visíveis');
  await b.close(); console.log('falhas:', f);
})();
