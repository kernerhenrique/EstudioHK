const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const B = process.argv[2] || BASE + '/demos/barbearia/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.startsWith('noindex')), 'demo fora do Google (noindex)');
  ok(await p.evaluate(() => document.fonts.check('600 20px Fraunces') && document.fonts.check('16px "DM Sans"')), 'fontes da demo carregadas do próprio site');
  ok((await p.getAttribute('.demo-bar a.quero', 'href')).startsWith('https://wa.me/5527996950409'), 'faixa: "Quero um site assim" leva ao WhatsApp da EstudioHK');
  // agendamento completo
  ok(await p.isDisabled('#ag-seguir'), 'passo 1: Continuar desativado sem serviço');
  await p.click('#op-servicos label:has-text("Corte + barba")'); ok(!(await p.isDisabled('#ag-seguir')), 'passo 1: serviço escolhido libera Continuar');
  await p.click('#ag-seguir'); ok(await p.isVisible('[data-etapa="2"]'), 'passo 2 aparece');
  await p.click('#op-barbeiros label:has-text("Léo")'); await p.click('#ag-seguir');
  ok(await p.isVisible('[data-etapa="3"]'), 'passo 3 aparece');
  const dias = await p.$$eval('#op-dias input', a => a.length); ok(dias === 6, '6 dias de funcionamento: ' + dias);
  await p.click('#op-dias label >> nth=1');
  const livres = await p.$$eval('#op-horas input:not(:disabled)', a => a.map(x => x.value)); ok(livres.length > 3, 'horários livres: ' + livres.length);
  await p.click(`#op-horas label:has(input[value="${livres[0]}"])`); await p.click('#ag-seguir');
  ok((await p.textContent('#resumo')).includes('Corte + barba') && (await p.textContent('#resumo')).includes('Léo'), 'resumo com serviço e barbeiro');
  await p.fill('#nome', 'João'); await p.click('#ag-seguir');
  const msg = await p.textContent('#msg-final'); ok(msg.includes('Corte + barba') && msg.includes('Léo') && msg.includes(livres[0]) && msg.includes('João'), 'mensagem final completa: ' + JSON.stringify(msg));
  ok(await p.isVisible('.aviso-demo'), 'aviso de que nada foi enviado');
  await p.click('#ag-voltar'); ok(await p.isVisible('[data-etapa="1"]') && await p.isDisabled('#ag-seguir'), 'Fazer outro agendamento recomeça');
  // atalhos
  await p.click('[data-barbeiro="caio"]'); await p.waitForTimeout(800);
  ok(await p.evaluate(() => document.querySelector('input[name=barbeiro][value=caio]').checked), '"Agendar com o Caio" marca o Caio');
  await p.click('[data-servico="barba"]'); await p.waitForTimeout(800);
  ok(await p.isVisible('[data-etapa="3"]'), 'serviço do cardápio + barbeiro já escolhido pula para o dia e horário');
  // galeria
  await p.click('[data-filtro="barba"]'); ok((await p.$$eval('.fotos li:not([hidden])', a => a.length)) === 1, 'filtro Barba mostra 1 foto');
  await p.click('[data-filtro="todos"]'); ok((await p.$$eval('.fotos li:not([hidden])', a => a.length)) === 6, 'filtro Todos mostra 6');
  // janela de demonstração
  await p.click('[data-contato="Olá! Quero entrar no Clube Ofício."]'); ok(await p.isVisible('#janela') && (await p.textContent('#j-msg')).includes('Clube'), 'botão de contato abre a janela "isto é uma demonstração"');
  await p.keyboard.press('Escape'); ok(!(await p.isVisible('#janela')), 'Esc fecha a janela');
  await p.click('#p3'); ok((await p.getAttribute('#p3', 'aria-expanded')) === 'true', 'dúvidas abrem');
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.documentElement.scrollWidth === innerWidth), 'sem rolagem lateral no celular');
  ok(!(await p.isVisible('#gaveta a')), 'menu do celular começa fechado');
  await p.click('.abre-menu'); ok(await p.isVisible('#gaveta a[href="#servicos"]'), 'menu abre'); await p.click("#gaveta a[href=\"#clube\"]"); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => document.getElementById('barra-ag').classList.contains('visivel')), 'barra "Agendar" aparece fora da capa');
  await ctx.close();
  // sem JS e movimento reduzido
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' }); ok(await p.evaluate(() => [...document.querySelectorAll('.revela, .cortina')].every(e => getComputedStyle(e).opacity === '1' && getComputedStyle(e).clipPath === 'none')), 'sem JS: tudo visível');
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' }); ok(await p.evaluate(() => [...document.querySelectorAll('.revela')].every(e => getComputedStyle(e).opacity === '1')), 'movimento reduzido: sem animação de entrada');
  await b.close(); console.log('falhas:', f);
})();
