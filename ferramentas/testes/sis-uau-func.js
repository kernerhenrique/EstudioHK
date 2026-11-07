// Testes do piloto "uau" do sistema de pedidos (Coadouro). Uso: node sis-uau-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const B = process.argv[2] || BASE + '/demos/sistemas/pedidos/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const txt = (p, s) => p.textContent(s);
const pausa = (p, t) => p.waitForTimeout(t || 200);
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = [], fora = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const casa = new URL(B).hostname;
  p.on('request', r => { const u = new URL(r.url()); if (![casa, 'estudiohk.com.br'].includes(u.hostname)) fora.push(r.url()); });
  await p.goto(B, { waitUntil: 'networkidle' }); await pausa(p, 1400);
  // passeio guiado
  ok(await p.isVisible('.ps-caixa') && (await txt(p, '#ps-tit')) === 'Uma manhã na Coadouro' && await p.evaluate(() => document.activeElement.id === 'ps-tit'), 'passeio começa sozinho na primeira visita, com foco no texto');
  await p.click('[data-ps=prox]'); await pausa(p, 600);
  ok((await txt(p, '#ps-tit')) === 'Agora você é o cliente' && await p.isVisible('#celular'), 'passo 2: celular do cliente aberto');
  await p.click('#cel-conteudo [data-qr="1"][data-id="cappuccino"]'); await p.click('#cel-conteudo [data-qr="1"][data-id="cappuccino"]'); await p.click('#cel-conteudo [data-qr="1"][data-id="croissant"]');
  ok((await txt(p, '#qr-enviar')).includes('3 itens') && (await txt(p, '#qr-enviar')).includes('R$ 35,00'), 'cardápio do QR: 2 cappuccinos + 1 croissant = R$ 35,00');
  await p.click('#qr-enviar'); await pausa(p, 900);
  ok((await txt(p, '#ps-tit')) === 'Chegou na hora' && await p.evaluate(() => { const c = document.querySelector('[data-etapa=novo] #p-438'); return !!c && c.textContent.includes('Pelo QR da mesa') && c.textContent.includes('Mesa 5'); }), 'pedido do QR cai no quadro na hora (#0438, Mesa 5, "Pelo QR da mesa")');
  ok((await txt(p, '#cel-conteudo')).includes('Recebido') && (await txt(p, '#cel-conteudo')).includes('R$ 38,50'), 'celular mostra o pedido "Recebido" e o total com 10% (R$ 38,50)');
  await p.click('#p-438 .avanca'); await pausa(p, 800);
  ok((await txt(p, '#ps-tit')) === 'O cliente acompanha' && (await txt(p, '#cel-conteudo .qa-agora')) === 'Preparando', 'mover no sistema atualiza o celular do cliente ("Preparando")');
  await p.click('[data-ps=prox]'); await pausa(p, 600);
  ok((await txt(p, '#ps-tit')) === 'Avisa antes do problema' && (await p.$$('#alertas li')).length === 3, 'passo 5: 3 alertas (atraso, conta pedida, salgado acabando)');
  await p.click('[data-ps=prox]'); await pausa(p, 700);
  ok((await txt(p, '#titulo')) === 'Caixa do dia' && (await txt(p, '#ps-tit')) === 'O que importa para o dono', 'passo 6 leva para o caixa');
  await p.click('[data-ps=prox]'); await pausa(p);
  ok(await p.isHidden('.ps-caixa') && await p.isHidden('.ps-luz'), 'fim do passeio');
  // quanto devolve
  await pausa(p, 800);
  ok((await txt(p, '#dv-horas')) === '62 h' && (await txt(p, '#dv-reais')) === 'R$ 619', 'quanto devolve: 62 h e R$ 619 por mês com os números padrão');
  await p.fill('#dv-ped', '200'); await p.fill('#dv-esq', '10'); await pausa(p, 900);
  ok((await txt(p, '#dv-horas')) === '104 h' && (await txt(p, '#dv-reais')) === 'R$ 1.032', 'mudar os números recalcula (104 h, R$ 1.032)');
  ok((await p.$$('#por-hora li')).length >= 3 && await p.isVisible('#por-hora li.pico'), 'gráfico de pedidos por hora com o pico marcado');
  // pedir a conta e pagar pelo celular
  await p.click('#qr-conta'); await pausa(p);
  ok((await txt(p, '#cel-conteudo')).includes('Pagar R$ 38,50 com Pix'), 'cliente pede a conta pelo celular');
  await p.click('.vista[data-vista=pedidos]'); await pausa(p);
  ok((await txt(p, '#alertas')).includes('Mesa 5 pediu a conta'), 'sistema mostra o alerta "Mesa 5 pediu a conta"');
  await p.click('[data-qr-ir=pix]'); await pausa(p); await p.click('#pix-pago'); await pausa(p);
  ok((await txt(p, '#cel-conteudo')).includes('Pagamento recebido') && !(await txt(p, '#alertas')).includes('Mesa 5'), 'pagou no Pix pelo celular: conta fechada e alerta some');
  await p.click('.vista[data-vista=mesas]'); await pausa(p);
  ok((await txt(p, '[data-mesa="5"]')).includes('Livre'), 'mesa 5 liberada no sistema');
  await p.click('.vista[data-vista=pedidos]'); await pausa(p);
  // WhatsApp: aviso do sistema aparece no celular
  await p.click('#p-427 [data-avisar]'); await pausa(p, 400);
  ok(await p.isHidden('#janela') && (await txt(p, '#cel-conteudo')).includes('Fernando Lima') && (await txt(p, '#cel-conteudo')).includes('pronto para retirada'), 'avisar pedido pronto: a mensagem aparece no WhatsApp do celular (sem janela)');
  await pausa(p, 2800);
  ok((await txt(p, '#cel-conteudo')).includes('Já tô chegando'), 'cliente responde no WhatsApp');
  // alerta de atraso manda mensagem
  await p.click('#alertas li:has-text("Helena") button'); await pausa(p, 400);
  ok((await txt(p, '#cel-conteudo')).includes('Desculpe a demora') && !(await txt(p, '#alertas')).includes('Helena'), 'alerta de atraso: avisa a cliente e some da lista');
  // previsão de estoque
  ok((await txt(p, '#alertas')).includes('pão de queijo') && (await txt(p, '#alertas')).includes('acaba por volta'), 'previsão: pão de queijo acaba antes do almoço');
  // pedidos chegando sozinhos
  const antes = (await p.$$('#quadro .pedido')).length;
  await p.evaluate(() => UAU.chegaUm()); await pausa(p, 500);
  ok((await p.$$('#quadro .pedido')).length === antes + 1 && (await txt(p, '#cel-conteudo')).includes('Marina Alves') && (await txt(p, '#cel-conteudo')).includes('resposta automática'), 'pedido chega sozinho pelo WhatsApp, com resposta automática');
  await p.evaluate(() => UAU.chegaUm()); await pausa(p, 500);
  ok(await p.evaluate(() => [...document.querySelectorAll('#quadro .pedido')].some(c => c.textContent.includes('Pelo QR da mesa') && c.textContent.includes('Cold brew'))), 'pedido chega sozinho pelo QR de outra mesa');
  await p.click('#ao-vivo');
  ok((await p.getAttribute('#ao-vivo', 'aria-pressed')) === 'false', 'botão pausa os pedidos automáticos');
  // fotos no cardápio
  await p.click('.vista[data-vista=cardapio]'); await pausa(p);
  ok((await p.$$('#cardapio img.mini-foto')).length === 4, 'cardápio com fotos dos produtos');
  // passeio de novo
  await p.click('#ver-passeio'); await pausa(p, 600);
  ok(await p.isVisible('.ps-caixa'), 'botão "Passeio guiado" refaz o passeio');
  await p.keyboard.press('Escape'); await pausa(p);
  ok(await p.isHidden('.ps-caixa'), 'Esc sai do passeio');
  await p.reload({ waitUntil: 'networkidle' }); await pausa(p, 1300);
  ok(await p.isHidden('.ps-caixa'), 'passeio não volta sozinho depois de visto');
  ok(fora.length === 0, 'nada carregado de fora ' + JSON.stringify(fora));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' }); await pausa(p, 1400);
  ok(await p.isVisible('.ps-caixa'), 'celular: passeio aparece');
  await p.tap('[data-ps=prox]'); await pausa(p, 700);
  ok(await p.evaluate(() => { const r = document.querySelector('#celular').getBoundingClientRect(); return r.width === innerWidth; }), 'celular: o celular do cliente abre em tela cheia');
  await p.tap('.ps-caixa [data-ps=faz]'); await pausa(p, 1200);
  ok((await txt(p, '#ps-tit')) === 'Chegou na hora' && await p.isHidden('#celular'), 'celular: depois de pedir, volta para o quadro');
  await p.tap('[data-ps=sair]'); await pausa(p);
  let larg = 0; for (const t of ['pedidos', 'mesas', 'cozinha', 'caixa', 'cardapio']) { await p.tap('.vista[data-vista=' + t + ']'); await pausa(p, 80); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  await p.tap('#abre-cel'); await pausa(p); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth));
  ok(larg === 375, 'celular: sem rolagem lateral (' + larg + ')');
  await p.tap('#cel-fechar'); await pausa(p);
  ok(await p.isHidden('#celular') && await p.isVisible('#abre-cel'), 'celular: fecha e volta o botão "Celular do cliente"');
  await ctx.close();
  // movimento reduzido
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); p = await ctx.newPage();
  const e3 = []; p.on('pageerror', e => e3.push(e.message));
  await p.goto(B + '?sem-passeio', { waitUntil: 'networkidle' }); await p.evaluate(() => UAU.chegaUm()); await pausa(p);
  ok(e3.length === 0 && await p.isHidden('.ps-caixa'), 'movimento reduzido e ?sem-passeio funcionam');
  await ctx.close();
  await b.close(); console.log('falhas:', f);
})();
