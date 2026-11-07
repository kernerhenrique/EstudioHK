// Testes da demo "Contato que não esfria". Uso: node auto-contato-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const U = process.argv[2] || BASE + '/demos/automacoes/contato-que-nao-esfria/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const cls = (p, n) => p.$eval(`.etapas li[data-e="${n}"]`, e => e.className);
const tx = async (p, s) => (await p.textContent(s)).replace(/\u00a0/g, ' ');
const det = (p, n) => p.$eval(`.etapas li[data-e="${n}"] .det`, e => e.textContent);
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = [], reqs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = new URL(r.url()); if (!['localhost', 'estudiohk.com.br'].includes(u.hostname)) reqs.push(r.url()); });
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.includes('noindex')), 'noindex');
  ok(await p.evaluate(() => document.querySelector('.aviso-demo').innerText.includes('nada é enviado')), 'aviso "nada é enviado" visível');
  // validação
  await p.click('#t-enviar');
  ok((await p.textContent('#t-erro')).startsWith('Falta o tipo de projeto') && await p.evaluate(() => document.activeElement.name === 'tipo'), 'formulário vazio: mostra o que falta e põe o foco no primeiro campo');
  await p.click('#t-exemplo'); await p.uncheck('#t-aceite'); await p.click('#t-enviar');
  ok((await p.textContent('#t-erro')).includes('aceite'), 'sem o aceite do WhatsApp não envia');
  // envio
  await p.check('#t-aceite'); await p.click('#t-enviar');
  ok(await p.isVisible('#t-ok') && !(await p.isVisible('#t-form')), 'cliente vê "Pedido recebido"');
  await p.waitForSelector('.etapas li[data-e="5"].espera', { timeout: 10000 });
  ok((await Promise.all([1, 2, 3, 4].map(n => cls(p, n)))).every(c => c.includes('feita')), 'etapas 1 a 4 concluídas e a 5 esperando');
  ok(await p.$eval('#pl-linhas tr:first-child', tr => tr.innerText.includes('Júlia S.') && tr.innerText.includes('Novo')), 'linha nova na planilha com status Novo');
  ok(await p.$eval('#conversa', c => c.innerText.includes('Novo pedido de orçamento') && c.innerText.includes('(27) 90000-0000')), 'aviso no WhatsApp da Laís com o resumo');
  ok((await p.textContent('#notif-cli-txt')).startsWith('Olá, Júlia! Recebemos seu pedido de reforma.'), 'confirmação no WhatsApp do cliente');
  ok((await tx(p, '#gasto')) === '2 mensagens pagas · R$ 0,070', 'custo acumulado: 2 mensagens, R$ 0,070');
  ok((await p.textContent('#relogio')) === 'ter, 10:42', 'relógio no horário inicial');
  // pular 2 horas → lembrete
  await p.click('#c-pular'); await p.waitForSelector('.etapas li[data-e="5"].aviso');
  ok((await p.textContent('#relogio')) === 'ter, 12:42', 'pular 2 horas avança o relógio');
  ok(await p.$eval('#pl-linhas tr:first-child', tr => tr.innerText.includes('Sem resposta há 2 h')) && (await p.$$('.bolha')).length === 2, 'sem resposta: lembrete enviado e planilha atualizada');
  ok((await tx(p, '#gasto')) === '3 mensagens pagas · R$ 0,105', 'lembrete soma mais uma mensagem');
  ok(await p.isDisabled('#c-pular'), 'pular fica desligado depois do lembrete');
  await p.locator('.bolha .bt:not([disabled])').last().click(); await p.waitForSelector('.etapas li[data-e="5"].feita');
  ok(await p.$eval('#pl-linhas tr:first-child', tr => tr.innerText.includes('Respondido em 2 h 05')), 'Já respondi depois do lembrete: "Respondido em 2 h 05"');
  ok(await p.$$eval('.bolha .bt', bs => bs.every(b => b.disabled)), 'botões "Já respondi" desligam depois da resposta');
  // recomeçar e responder antes do lembrete
  await p.click('#c-recomecar');
  ok(await p.isVisible('#t-form') && (await p.$$('#pl-linhas tr')).length === 2 && (await p.$$('.bolha')).length === 0 && (await p.textContent('#relogio')) === 'ter, 10:42' && (await tx(p, '#gasto')).startsWith('0 mensagens'), 'recomeçar volta tudo ao início');
  await p.click('#t-exemplo'); await p.click('#t-enviar'); await p.waitForSelector('.etapas li[data-e="5"].espera');
  await p.locator('.bolha .bt').first().click(); await p.waitForSelector('.etapas li[data-e="5"].feita');
  ok(await p.$eval('#pl-linhas tr:first-child', tr => tr.innerText.includes('Respondido em 14 min')) && (await det(p, 5)).includes('Lembrete cancelado'), 'respondendo antes: lembrete cancelado, "Respondido em 14 min"');
  // falha na planilha
  await p.click('#c-recomecar'); await p.check('#c-falha'); await p.click('#t-exemplo'); await p.click('#t-enviar');
  await p.waitForSelector('.etapas li[data-e="5"].espera', { timeout: 15000 });
  ok((await cls(p, 2)).includes('aviso') && (await det(p, 2)).includes('e-mail de reserva') && await p.isVisible('#pl-fora') && await p.isVisible('#alerta-hk'), 'falha: 3 tentativas, e-mail de reserva, planilha fora e alerta para a EstudioHK');
  ok((await p.$$('#pl-linhas tr')).length === 2 && (await cls(p, 3)).includes('feita'), 'falha: Laís é avisada mesmo assim e a linha ainda não entrou');
  await p.click('#c-pular'); await p.waitForSelector('.etapas li[data-e="5"].aviso');
  ok(!(await p.isVisible('#pl-fora')) && (await cls(p, 2)).includes('feita') && await p.$eval('#pl-linhas tr:first-child', tr => tr.innerText.includes('Júlia S.')) && (await p.textContent('#alerta-txt')).startsWith('Resolvido'), 'planilha volta e a linha entra sozinha, alerta resolvido');
  // conta de custos
  ok((await tx(p, '#k-total')) === 'R$ 4,62' && (await p.textContent('#k-detalhe')).startsWith('132 mensagens'), 'conta padrão: 60 pedidos, 20% sem resposta = 132 mensagens = R$ 4,62');
  await p.fill('#k-contatos', '200'); await p.dispatchEvent('#k-contatos', 'input'); await p.fill('#k-sem', '50'); await p.dispatchEvent('#k-sem', 'input');
  ok((await tx(p, '#k-total')) === 'R$ 17,50', 'conta: 200 pedidos e 50% = 500 mensagens = R$ 17,50 (' + await p.textContent('#k-total') + ')');
  ok(await p.evaluate(() => { const t = document.body.innerText; return t.includes('Está incluso na manutenção mensal da automação') && t.includes('E se eu parar de trabalhar com a EstudioHK?') && t.includes('Precisa criar, eu ajudo'); }), 'ferramentas, n8n incluso e "E se eu parar…" na página');
  ok(reqs.length === 0, 'nenhuma requisição para fora (nada é enviado) ' + JSON.stringify(reqs));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular: abas
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.isVisible('#lado-cli') && !(await p.isVisible('#lado-bas')), 'celular: começa no lado do cliente');
  await p.click('#t-exemplo'); await p.click('#t-enviar'); await p.waitForTimeout(1700);
  ok(await p.isVisible('#lado-bas') && !(await p.isVisible('#lado-cli')) && (await p.getAttribute('#aba-bas', 'aria-selected')) === 'true', 'celular: depois do envio mostra os bastidores');
  await p.waitForSelector('.etapas li[data-e="5"].espera');
  ok(await p.isVisible('#aba-cli .ponto'), 'celular: ponto avisa novidade no lado do cliente');
  await p.focus('#aba-bas'); await p.keyboard.press('ArrowLeft');
  ok(await p.isVisible('#notif-cli') && await p.evaluate(() => document.activeElement.id === 'aba-cli'), 'celular: setas trocam de aba e a confirmação aparece');
  let larg = 0; for (const s of ['#sim', '#ferramentas', '#custos']) { await p.locator(s).scrollIntoViewIfNeeded(); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  ok(larg === 375, 'celular: sem rolagem lateral');
  await ctx.close();
  // movimento reduzido
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' }); await p.click('#t-exemplo'); await p.click('#t-enviar');
  await p.waitForSelector('.etapas li[data-e="5"].espera', { timeout: 3000 }).then(() => ok(true, 'movimento reduzido: o fluxo roda quase na hora'), () => ok(false, 'movimento reduzido: o fluxo roda quase na hora'));
  await ctx.close();
  // sem JS
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelectorAll('.etapas li').length === 5 && [...document.querySelectorAll('.etapas li')].every(l => getComputedStyle(l).opacity === '1') && document.body.innerText.includes('precisa de JavaScript')), 'sem JS: etapas legíveis e aviso');
  await b.close(); console.log('falhas:', f);
})();
