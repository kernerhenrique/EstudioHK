// Testes da demo "Agenda sem faltas". Uso: node auto-agenda-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const U = process.argv[2] || BASE + '/demos/automacoes/agenda-sem-faltas/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const tx = async (p, s) => (await p.textContent(s)).replace(/ /g, ' ');
const cls = (p, n) => p.$eval(`.etapas li[data-e="${n}"]`, e => e.className);
const det = (p, n) => p.$eval(`.etapas li[data-e="${n}"] .det`, e => e.textContent);
const linha = (p, hora, nome) => p.evaluate(([h, n]) => { const tr = [...document.querySelectorAll('#ag-linhas tr')].find(t => t.cells[0].textContent === h && t.cells[1].textContent.startsWith(n)); return tr ? tr.cells[2].textContent : null; }, [hora, nome]);
const bt = (p, t) => p.locator('#conv-pac .bt:not([disabled])', { hasText: t }).first();
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = [], reqs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = new URL(r.url()); if (!['localhost', 'estudiohk.com.br'].includes(u.hostname)) reqs.push(r.url()); });
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.includes('noindex')), 'noindex');
  ok((await p.$$('#ag-linhas tr')).length === 8 && (await p.$$('#le-linhas tr')).length === 2 && (await tx(p, '#relogio')) === 'seg, 17:59', 'início: agenda com 8 consultas, lista de espera com 2, relógio 17:59');
  // rodar às 18h
  await p.click('#c-rodar');
  await p.waitForSelector('#conv-pac .bt', { timeout: 10000 });
  const lemb = await p.$eval('#conv-pac', c => c.innerText);
  ok(lemb.includes('amanhã, terça, às 9h') && !/cardio|derma|pediatr|ortop|gineco|Dr\.|Dra\./i.test(lemb), 'lembrete da Ana: dia e hora, sem especialidade nem médico');
  await p.waitForSelector('.etapas li[data-e="3"].espera', { timeout: 10000 });
  ok((await cls(p, 1)).includes('feita') && (await cls(p, 2)).includes('feita') && (await tx(p, '#gasto')) === '8 mensagens pagas · R$ 0,280', '8 lembretes enviados, R$ 0,280 na Meta');
  // Ana confirma
  await bt(p, 'Confirmo').click(); await p.waitForTimeout(1200);
  ok((await linha(p, '09:00', 'Ana')).startsWith('Confirmou') && (await p.$eval('#conv-pac', c => c.innerText)).includes('Confirmado! Até amanhã às 9h'), 'Ana confirma: resposta da clínica e agenda atualizada');
  ok(await p.$$eval('#conv-pac .bt', bs => bs.every(b => b.disabled)), 'botões travam depois da resposta');
  await p.waitForSelector('#c-pular:not([disabled])', { timeout: 25000 });
  ok((await linha(p, '10:30', 'Helena')).startsWith('Remarcou') && (await linha(p, '10:30', 'Carla')).startsWith('Confirmou') && (await tx(p, '#le-linhas')).includes('Encaixado: ter, 10:30'), 'Helena remarca e a vaga vai para a Carla, da lista de espera');
  ok((await linha(p, '15:00', 'Júlia')) === 'Confirmou às 18:20', 'Júlia confirma às 18:20');
  ok((await tx(p, '#gasto')) === '9 mensagens pagas · R$ 0,315', 'aviso de vaga soma 1 mensagem (respostas não somam)');
  // pular para 8h
  await p.click('#c-pular'); await p.waitForSelector('.etapas li[data-e="5"].feita');
  ok((await tx(p, '#relogio')) === 'ter, 08:00', 'relógio vira para ter, 08:00');
  const rec = await p.$eval('#conv-rec', c => c.innerText);
  ok(rec.includes('11:00') && rec.includes('Rita S.') && rec.includes('Paulo M.') && rec.includes('Sérgio T.') && !rec.includes('Marcos'), 'recepção recebe só quem não respondeu');
  ok((await linha(p, '11:00', 'Rita')) === 'Sem resposta: ligar' && (await det(p, 3)).startsWith('5 de 8'), 'agenda marca "ligar" e 5 de 8 responderam');
  ok((await tx(p, '#gasto')) === '10 mensagens pagas · R$ 0,350', 'lista da recepção soma 1 mensagem');
  // recomeçar + Ana remarca
  await p.click('#c-recomecar');
  ok((await tx(p, '#relogio')) === 'seg, 17:59' && (await p.$$('#conv-pac .bolha')).length === 1 && (await p.$$('#conv-rec .bolha')).length === 0 && (await tx(p, '#gasto')).startsWith('0 mensagens'), 'recomeçar volta tudo ao início');
  await p.click('#c-rodar'); await p.waitForSelector('#conv-pac .bt');
  await bt(p, 'Preciso remarcar').click(); await p.waitForTimeout(1000);
  await bt(p, 'qua, 14h').click(); await p.waitForTimeout(3500);
  ok((await linha(p, '09:00', 'Ana')) === 'Remarcou para qua, 14h' && (await p.$eval('#conv-pac', c => c.innerText)).includes('Sua consulta passou para qua, 14h'), 'Ana remarca escolhendo um horário livre');
  ok((await linha(p, '09:00', 'Carla')) !== null, 'vaga das 9h vai para a primeira da lista (Carla)');
  await p.waitForSelector('#c-pular:not([disabled])', { timeout: 25000 });
  ok((await linha(p, '10:30', 'Diego')) !== null && (await det(p, 4)).startsWith('2 vagas'), 'vaga da Helena vai para o Diego: 2 vagas preenchidas');
  // falha: sem WhatsApp
  await p.click('#c-recomecar'); await p.check('#c-falha'); await p.click('#c-rodar');
  await p.waitForSelector('.etapas li[data-e="3"].espera', { timeout: 10000 });
  ok((await linha(p, '16:00', 'Sérgio')) === 'Não entregue: sem WhatsApp' && (await cls(p, 2)).includes('aviso') && (await p.$eval('#conv-rec', c => c.innerText)).includes('Sérgio T. (16:00) não tem WhatsApp'), 'sem WhatsApp: não entregue e recepção avisada na hora');
  ok((await tx(p, '#gasto')) === '8 mensagens pagas · R$ 0,280', 'custo: 7 lembretes entregues + aviso à recepção');
  ok(await p.isDisabled('#c-falha'), 'chave de falha trava durante a simulação');
  // conta
  ok((await tx(p, '#k-total')) === 'R$ 16,17' && (await tx(p, '#k-resp')).includes('dentro das 1.000 grátis'), 'conta padrão: 400 consultas = R$ 16,17, respostas dentro das 1.000');
  await p.fill('#k-consultas', '1000'); await p.dispatchEvent('#k-consultas', 'input');
  ok((await tx(p, '#k-total')) === 'R$ 46,27' && (await tx(p, '#k-resp')).includes('passam das 1.000'), 'conta com 1.000 consultas: respostas acima de 1.000 entram na conta (R$ 46,27)');
  ok(await p.evaluate(() => { const t = document.body.innerText; return t.includes('art. 5º, II') && t.includes('Está incluso na manutenção mensal da automação') && t.includes('E se eu parar de trabalhar com a EstudioHK?'); }), 'LGPD citada, n8n incluso e "E se eu parar…"');
  ok(reqs.length === 0, 'nenhuma requisição para fora ' + JSON.stringify(reqs));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.isVisible('#z-rodar') && !(await p.isVisible('#lado-bas')), 'celular: começa no lado da paciente, com o botão de rodar no celular');
  await p.click('#z-rodar'); await p.waitForSelector('#conv-pac .bt');
  ok(await p.isVisible('#conv-pac .bt') && await p.isVisible('#aba-bas .ponto'), 'celular: lembrete aparece e a aba Bastidores ganha o ponto de novidade');
  let larg = 0; for (const s of ['#sim', '#ferramentas', '#custos']) { await p.locator(s).scrollIntoViewIfNeeded(); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  ok(larg === 375, 'celular: sem rolagem lateral');
  await ctx.close();
  // movimento reduzido e sem JS
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' }); await p.click('#c-rodar');
  await p.waitForSelector('#c-pular:not([disabled])', { timeout: 4000 }).then(() => ok(true, 'movimento reduzido: o fluxo roda quase na hora'), () => ok(false, 'movimento reduzido: o fluxo roda quase na hora'));
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelectorAll('.etapas li').length === 5 && document.body.innerText.includes('precisa de JavaScript')), 'sem JS: etapas legíveis e aviso');
  await b.close(); console.log('falhas:', f);
})();
