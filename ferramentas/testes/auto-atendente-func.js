// Testes da demo "Atendente com IA no WhatsApp". Uso: node auto-atendente-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const U = process.argv[2] || BASE + '/demos/automacoes/atendente-whatsapp/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const tx = async (p, s) => (await p.textContent(s)).replace(/ /g, ' ');
const ultima = p => p.$eval('#conv-cli', c => { const bs = c.querySelectorAll('.bolha:not(.dela)'); return bs[bs.length - 1].innerText; });
const usadas = p => p.$$eval('tr.usada td:first-child', ts => ts.map(t => t.textContent));
const espera = p => p.waitForFunction(() => !document.querySelector('#z-texto').disabled, null, { timeout: 15000 });
async function diz(p, msg) { await p.fill('#z-texto', msg); await p.press('#z-texto', 'Enter'); await p.waitForTimeout(100); await espera(p); }
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = [], reqs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = new URL(r.url()); if (!['localhost', 'estudiohk.com.br'].includes(u.hostname)) reqs.push(r.url()); });
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.includes('noindex')), 'noindex');
  ok((await p.$$('#ficha-linhas tr')).length === 16 && await p.$$eval('#ficha-linhas td:nth-child(2)', ts => ts.every(t => t.textContent.trim().length > 3)), 'ficha com 16 itens, todos preenchidos');
  ok(await p.isVisible('.z-nota') && (await p.textContent('.z-nota')).includes('sem IA de verdade'), 'aviso de que as respostas são simuladas');
  // preço
  await p.click('#chips button >> nth=0'); await espera(p);
  ok((await ultima(p)).includes('Corte + barba sai por R$ 95') && (await usadas(p)).join() === 'Corte + barba', 'preço do corte + barba pela ficha, com a linha destacada');
  ok((await tx(p, '#custo')).startsWith('1 resposta · Meta: grátis') && (await tx(p, '#custo')).endsWith('US$ 0,0005'), 'custo: 1 resposta, Meta grátis, IA US$ 0,0005');
  ok((await tx(p, '#relogio')) === 'ter, 21:11', 'relógio anda 1 minuto por mensagem');
  // sábado e Pix
  await p.click('#chips button >> nth=1'); await espera(p);
  ok((await ultima(p)).includes('Sábado abrimos das 8h às 18h'), 'horário de sábado');
  await p.click('#chips button >> nth=3'); await espera(p);
  ok((await ultima(p)).includes('Pix'), 'formas de pagamento');
  // texto livre variado
  await diz(p, 'onde fica a barbearia?'); ok((await ultima(p)).includes('Rua Exemplo, 123'), 'texto livre: endereço');
  await diz(p, 'quanto é a pigmentação?'); ok((await ultima(p)).includes('Pigmentação de barba sai por R$ 40'), 'texto livre: preço da pigmentação');
  await diz(p, 'e se eu me atrasar?'); ok((await ultima(p)).includes('10 minutos'), 'texto livre: atraso');
  // editar preço na ficha
  await p.click('#c-preco');
  ok((await p.textContent('#ficha-linhas tr:nth-child(3) td:nth-child(2)')).includes('R$ 100') && (await p.getAttribute('#c-preco', 'aria-pressed')) === 'true', 'editar preço: ficha mostra R$ 100');
  await diz(p, 'quanto custa corte e barba?'); ok((await ultima(p)).includes('R$ 100'), 'próxima resposta já usa o preço novo');
  await p.click('#c-preco');
  // agenda
  await p.click('#chips button >> nth=2'); await espera(p);
  const slots = await p.$$eval('#conv-cli .bolha:last-child .bt', bs => bs.map(b => b.textContent));
  ok(slots.join() === '14h · Léo,15h30 · Caio,17h · Rafa', 'horários livres à tarde: ' + slots.join());
  await p.locator('#conv-cli .bt:not([disabled])', { hasText: '15h30' }).click(); await espera(p);
  await p.locator('#conv-cli .bt:not([disabled])', { hasText: 'Corte + barba' }).click(); await espera(p);
  ok((await ultima(p)).includes('Marcado! Quarta, 15h30, com o Caio') && (await tx(p, '#ag-linhas tr:nth-child(4) td:nth-child(3)')).includes('Thiago · Corte + barba'), 'marca na agenda e confirma ao cliente');
  ok((await tx(p, '#conv-dono')).includes('Novo horário marcado pelo atendimento'), 'dono recebe aviso do horário marcado');
  // fora do assunto
  await p.click('#c-fora'); await espera(p);
  ok((await ultima(p)).includes('só consigo ajudar com a Ofício') && (await p.textContent('.etapas li[data-e="3"] .det')).startsWith('Fora do assunto'), 'fora do assunto: recusa educada');
  // pergunta que não está na ficha → humano
  await diz(p, 'vocês vendem pomada importada?');
  ok((await ultima(p)).includes('não tenho aqui na ficha e prefiro não chutar') && (await tx(p, '#conv-dono')).includes('quer falar com uma pessoa'), 'fora da ficha: não chuta e chama a equipe');
  const n = (await p.$$('#conv-cli .bolha:not(.dela)')).length;
  await diz(p, 'oi?');
  ok((await p.$$('#conv-cli .bolha:not(.dela)')).length === n && (await p.textContent('.etapas li[data-e="5"] .det')).includes('IA não responde'), 'depois de passar para a equipe, a IA não responde mais');
  // recomeçar + humano direto
  await p.click('#c-recomecar');
  ok((await p.$$('#conv-cli .bolha')).length === 1 && (await tx(p, '#relogio')) === 'ter, 21:10' && (await tx(p, '#custo')).startsWith('0 respostas'), 'recomeçar volta ao início');
  await p.click('#chips button >> nth=4'); await espera(p);
  ok((await ultima(p)).includes('um barbeiro te responde amanhã a partir das 9h'), 'pedir o barbeiro: equipe avisada, resposta honesta sobre o horário');
  // IA fora do ar
  await p.click('#c-recomecar'); await p.check('#c-falha');
  await p.click('#chips button >> nth=0'); await espera(p);
  ok((await ultima(p)).includes('Recebemos sua mensagem') && await p.isVisible('#alerta-hk') && (await tx(p, '#custo')).endsWith('IA: US$ 0,0000'), 'IA fora do ar: resposta de reserva, alerta e sem custo de IA');
  // conta
  ok((await tx(p, '#k-total')) === 'R$ 28,00 + US$ 0,90', 'conta padrão: R$ 28,00 + US$ 0,90');
  await p.check('input[name=modelo][value=sonnet]');
  ok((await tx(p, '#k-total')) === 'R$ 28,00 + US$ 18,00', 'com Sonnet: R$ 28,00 + US$ 18,00');
  await p.fill('#k-conversas', '100'); await p.dispatchEvent('#k-conversas', 'input');
  ok((await tx(p, '#k-total')) === 'R$ 0,00 + US$ 6,00' && (await tx(p, '#k-detalhe')).includes('dentro das 1.000 grátis'), 'poucas conversas: Meta dentro do grátis');
  ok(await p.evaluate(() => { const t = document.body.innerText; return t.includes('4.7') && t.includes('Está incluso na manutenção mensal da automação') && t.includes('E se eu parar de trabalhar com a EstudioHK?') && t.includes('parceiro oficial da Meta'); }), 'regras da Meta, n8n incluso, parceiro e "E se eu parar…"');
  ok(reqs.length === 0, 'nenhuma requisição para fora ' + JSON.stringify(reqs));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' });
  await p.click('#chips button >> nth=0'); await espera(p);
  ok(await p.isVisible('#lado-cli') && !(await p.isVisible('#lado-bas')) && await p.isVisible('#aba-bas .ponto'), 'celular: conversa visível e ponto de novidade em Bastidores');
  let larg = 0; for (const s of ['#sim', '#ferramentas', '#custos', '#regras']) { await p.locator(s).scrollIntoViewIfNeeded(); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  ok(larg === 375, 'celular: sem rolagem lateral');
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' }); const t0 = Date.now(); await p.click('#chips button >> nth=0'); await espera(p);
  ok(Date.now() - t0 < 2500, 'movimento reduzido: resposta quase na hora');
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); p = await ctx.newPage();
  await p.goto(U, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelectorAll('.etapas li').length === 5 && document.body.innerText.includes('precisa de JavaScript')), 'sem JS: etapas legíveis e aviso');
  await b.close(); console.log('falhas:', f);
})();
