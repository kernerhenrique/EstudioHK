// Testes da demo "Cobrança sem constrangimento". Uso: node auto-cobranca-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const U = process.argv[2] || BASE + '/demos/automacoes/cobranca-sem-constrangimento/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const tx = async (p, s) => (await p.textContent(s)).replace(/ /g, ' ');
const etapa = (p, n, cls) => p.waitForSelector(`.etapas li[data-e="${n}"].${cls}`, { timeout: 20000, state: 'attached' });
const st = p => tx(p, '#st-lucas');
const ultima = p => p.evaluate(() => { const b = document.querySelectorAll('#conv-cli .bolha'); return b[b.length - 1].innerText; });
const pularLiberado = p => p.waitForFunction(() => !document.querySelector('#c-pular').disabled);
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = [], reqs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = new URL(r.url()); if (!['localhost', 'estudiohk.com.br'].includes(u.hostname)) reqs.push(r.url()); });
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.includes('noindex')), 'noindex');
  ok((await tx(p, '#relogio')) === 'seg 09/11, 08:59' && (await st(p)) === 'a vencer' && (await tx(p, '#recebido')) === 'R$ 469,70' && await p.isDisabled('#c-pular'), 'início: segunda 8:59, Lucas a vencer, R$ 469,70 recebidos');
  // paga em dia
  await p.click('#c-rodar'); await etapa(p, 3, 'espera');
  const aviso = await ultima(p);
  ok(aviso.includes('vence na quinta, 12/11') && aviso.includes('CNPJ 00.000.000/0001-00') && aviso.includes('Av. Exemplo'), 'aviso 3 dias antes, com nome, CNPJ e endereço da academia (CDC art. 42-A)');
  ok(!/juros|multa|protesto|SPC|Serasa/i.test(aviso), 'aviso sem juros, multa ou ameaça');
  ok((await tx(p, '#custo')).includes('Meta R$ 0,035 (1 paga)'), 'aviso: 1 mensagem paga');
  await p.click('#conv-cli .bt.destaque');
  ok(await p.isVisible('#ov-banco') && (await tx(p, '#ov-banco')).includes('R$ 149,90'), '"Copiar código Pix" abre o app do banco com o valor');
  await p.click('#ob-pagar'); await etapa(p, 4, 'feita');
  ok((await st(p)) === 'pago · Pix' && (await tx(p, '#recebido')) === 'R$ 619,60', 'baixa na planilha: pago, recebido R$ 619,60');
  ok((await tx(p, '#recibo-corpo')).includes('Recebemos de Lucas Andrade a quantia de R$ 149,90') && (await tx(p, '#conv-cli')).includes('Recibo-FORJA-nov-2026.pdf'), 'recibo gerado e enviado em PDF');
  ok((await tx(p, '.etapas li[data-e="5"] .det')).includes('Não foi preciso lembrar') && await p.isHidden('#alerta-hk'), 'pagou em dia: nenhum lembrete');
  ok((await tx(p, '#custo')).startsWith('Asaas R$ 1,99 · Meta R$ 0,070 (2 pagas)'), 'custo: R$ 1,99 do Pix + 2 mensagens (' + await tx(p, '#custo') + ')');
  ok(await p.isDisabled('#conv-cli .bt.destaque'), 'depois de pago, o botão do Pix trava');
  // régua de atraso
  await p.click('#c-recomecar');
  ok((await st(p)) === 'a vencer' && (await p.$$('#conv-cli .bolha')).length === 1 && await p.isHidden('#recibo-corpo') && (await tx(p, '#relogio')) === 'seg 09/11, 08:59', 'recomeçar volta ao início');
  await p.click('#z-rodar'); await etapa(p, 3, 'espera'); await pularLiberado(p);
  await p.click('#c-pular'); await etapa(p, 5, 'espera');
  ok((await tx(p, '#relogio')) === 'sex 13/11, 09:00' && (await ultima(p)).includes('venceu ontem (12/11)') && (await st(p)) === 'atrasado · 1º lembrete', '1º lembrete: sexta 13/11, 1 dia útil depois');
  ok((await tx(p, '.etapas li[data-e="3"] .det')).includes('ainda sem pagamento'), 'confere o pagamento antes de lembrar');
  await pularLiberado(p);
  await p.click('#c-pular'); await etapa(p, 5, 'aviso');
  ok((await tx(p, '#relogio')) === 'ter 17/11, 09:00' && (await st(p)) === 'atrasado · 2º lembrete', '2º lembrete: terça 17/11 (pula o fim de semana e o feriado de 15/11)');
  await pularLiberado(p);
  const nAntes = (await p.$$('#conv-cli .bolha')).length;
  await p.click('#c-pular'); await p.waitForFunction(() => document.querySelector('#st-lucas').textContent === 'falar na recepção');
  ok((await p.$$('#conv-cli .bolha')).length === nAntes && (await tx(p, '#conv-rec')).includes('conversa pessoal, com discrição') && await p.isDisabled('#c-pular'), 'depois de 2 lembretes: para de mandar ao aluno e avisa a recepção');
  await p.locator('#conv-cli .bt.destaque').last().click(); await p.click('#ob-pagar'); await etapa(p, 4, 'feita');
  ok((await tx(p, '#conv-rec')).includes('Não precisa mais falar com ele') && (await tx(p, '.etapas li[data-e="5"] .det')).includes('depois de 2 lembretes'), 'pagou atrasado: recepção avisada e régua encerrada');
  // pedir prazo
  await p.click('#c-recomecar'); await p.click('#c-rodar'); await etapa(p, 3, 'espera'); await pularLiberado(p);
  await p.click('#c-pular'); await etapa(p, 5, 'espera');
  await p.locator('#conv-cli .bt', { hasText: 'Preciso de mais prazo' }).click();
  await p.waitForFunction(() => document.querySelector('#st-lucas').textContent === 'pediu prazo');
  ok((await tx(p, '#conv-rec')).includes('pediu mais prazo') && await p.isDisabled('#c-pular'), 'pedir prazo: lembretes pausam e a recepção combina a data');
  // já paguei
  await p.click('#c-recomecar'); await p.click('#c-rodar'); await etapa(p, 3, 'espera'); await pularLiberado(p);
  await p.click('#c-pular'); await etapa(p, 5, 'espera');
  await p.locator('#conv-cli .bt', { hasText: 'Já paguei' }).click();
  await p.waitForFunction(() => document.querySelector('#st-lucas').textContent === 'conferir comprovante');
  ok((await tx(p, '#conv-cli')).includes('ainda não apareceu') && (await tx(p, '#conv-rec')).includes('Conferir o comprovante'), '"Já paguei" sem Pix: confere, responde com educação e chama a recepção');
  // aviso de pagamento perdido
  await p.click('#c-recomecar'); await p.check('#c-falha'); await p.click('#c-rodar'); await etapa(p, 3, 'espera');
  await p.click('#conv-cli .bt.destaque'); await p.click('#ob-pagar');
  await etapa(p, 4, 'feita');
  ok(await p.isVisible('#alerta-hk') && (await tx(p, '.etapas li[data-e="3"] .det')).includes('conferência') && (await tx(p, '#relogio')) === 'seg 09/11, 10:00' && (await st(p)) === 'pago · Pix', 'aviso perdido: a conferência das 10h acha o Pix, dá baixa e alerta a EstudioHK');
  // conta
  ok((await tx(p, '#k-total')) === 'R$ 828,20', 'conta padrão: 400 alunos, 15% atrasam = R$ 828,20');
  await p.fill('#k-atraso', '0'); await p.dispatchEvent('#k-atraso', 'input');
  ok((await tx(p, '#k-total')) === 'R$ 824,00', 'sem atrasos: R$ 824,00');
  ok(await p.evaluate(() => { const t = document.body.innerText; return t.includes('Está incluso na manutenção mensal da automação') && t.includes('E se eu parar de trabalhar com a EstudioHK?') && t.includes('art. 42') && t.includes('Pix Automático'); }), 'n8n incluso, "E se eu parar…", CDC e Pix Automático');
  ok(reqs.length === 0, 'nenhuma requisição para fora ' + JSON.stringify(reqs));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' });
  await p.click('#z-rodar'); await p.waitForSelector('#conv-cli .bt.destaque', { timeout: 15000 });
  ok(await p.isVisible('#aba-bas .ponto'), 'celular: Bastidores ganha o ponto');
  await p.click('#conv-cli .bt.destaque'); await p.click('#ob-pagar');
  await p.waitForSelector('.anexo', { timeout: 15000 });
  ok(true, 'celular: dá para pagar e receber o recibo pelo lado do aluno');
  await p.click('#aba-bas');
  let larg = 0; for (const s of ['#sim', '#painel', '#recibo', '#ferramentas', '#custos']) { await p.locator(s).scrollIntoViewIfNeeded(); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  ok(larg === 375, 'celular: sem rolagem lateral (' + larg + ')');
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' }); const t0 = Date.now(); await p.click('#c-rodar'); await etapa(p, 3, 'espera');
  ok(Date.now() - t0 < 3000, 'movimento reduzido: roda quase na hora');
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelectorAll('.etapas li').length === 5 && document.body.innerText.includes('precisa de JavaScript')), 'sem JS: etapas legíveis e aviso');
  await b.close(); console.log('falhas:', f);
})();
