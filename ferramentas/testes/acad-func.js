const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const B = process.argv[2] || BASE + '/demos/academia/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.startsWith('noindex')), 'demo fora do Google (noindex)');
  ok(await p.evaluate(() => document.fonts.check('800 40px Archivo')), 'fonte Archivo carregada do próprio site');
  ok((await p.getAttribute('.demo-bar a.quero', 'href')).startsWith('https://wa.me/5527996950409'), 'faixa: "Quero um site assim" leva ao WhatsApp da EstudioHK');
  // horários
  ok((await p.$$eval('#dias-tab button', a => a.length)) === 6, 'grade: 6 dias (seg a sáb)');
  await p.click('#dias-tab button[data-dia="6"]'); ok((await p.$$eval('#grade-aulas .aula', a => a.length)) === 3, 'sábado tem 3 aulas');
  await p.click('#dias-tab button[data-dia="1"]'); ok((await p.$$eval('#grade-aulas .aula', a => a.length)) === 7, 'segunda tem 7 aulas');
  await p.click('#chips-mod button[data-mod="bike"]'); ok((await p.$$eval('#grade-aulas .aula', a => a.length)) === 2, 'filtro Bike na segunda: 2 aulas');
  await p.click('#chips-mod button[data-mod="todas"]');
  await p.click('[data-ver-horarios="boxe"]'); await p.waitForTimeout(700);
  ok(await p.evaluate(() => [...document.querySelectorAll('#grade-aulas .aula b')].every(x => x.textContent === 'Boxe')), 'card "Ver horários" do Boxe filtra a grade');
  // planos
  await p.click('#chave-planos button[data-tipo="anual"]');
  ok((await p.textContent('.plano.dest .preco b')).includes('112,40') && (await p.textContent('.plano.dest .fid')) === '12 meses' && await p.isVisible('.plano.dest .preco s'), 'plano anual: preço, fidelidade e preço cheio riscado');
  await p.click('#chave-planos button[data-tipo="mensal"]'); ok((await p.textContent('.plano.dest .preco b')).includes('149,90') && !(await p.isVisible('.plano.dest .preco s')), 'volta para mensal');
  // quiz
  await p.click('#quiz .opcoes button:has-text("Ganhar força")'); await p.click('#quiz .opcoes button:has-text("No meu ritmo")'); await p.click('#quiz .opcoes button:has-text("Moderada")');
  ok((await p.textContent('#quiz .resultado h3')) === 'Musculação', 'quiz: força + no meu ritmo = Musculação');
  await p.click('#quiz [data-q=refazer]'); await p.click('#quiz .opcoes button:has-text("Aliviar o estresse")'); await p.click('#quiz .opcoes button:has-text("Em grupo")'); await p.click('#quiz .opcoes button:has-text("Leve")');
  ok((await p.textContent('#quiz .resultado h3')) === 'Yoga e mobilidade', 'quiz: estresse + grupo + leve = Yoga');
  await p.click('#quiz [data-q=agendar]'); await p.waitForTimeout(800);
  ok(await p.evaluate(() => document.querySelector('input[name=mod][value=yoga]').checked), 'resultado do quiz já marca a modalidade na aula grátis');
  // aula grátis
  ok(await p.isDisabled('#ag-seguir'), 'passo 1 bloqueado sem dia e período');
  await p.click('#ag-dias label >> nth=0'); await p.click('label:has(input[value="noite"])');
  ok(!(await p.isDisabled('#ag-seguir')), 'passo 1 completo libera Continuar'); await p.click('#ag-seguir');
  await p.fill('#ag-nome', 'Carla'); await p.fill('#ag-zap', '27999998888');
  ok((await p.inputValue('#ag-zap')) === '(27) 99999-8888', 'máscara do WhatsApp: ' + await p.inputValue('#ag-zap'));
  await p.click('#ag-seguir'); const msg = await p.textContent('#ag-msg');
  ok(msg.includes('Yoga e mobilidade') && msg.includes('noite') && msg.includes('Carla') && msg.includes('(27) 99999-8888'), 'mensagem final: ' + JSON.stringify(msg));
  await p.click('#ag-voltar'); ok(await p.isVisible('[data-passo="1"]') && await p.isDisabled('#ag-seguir'), 'Agendar outra aula recomeça');
  // reservar da grade
  await p.click("#chips-mod button[data-mod=todas]"); await p.click("#dias-tab button[data-dia=\"2\"]"); await p.click("#grade-aulas .aula >> nth=0 >> .reservar"); await p.waitForTimeout(800);
  ok(await p.evaluate(() => document.querySelector('input[name=mod][value=bike]').checked && document.querySelector('input[name=periodo][value="manhã"]').checked), '"Reservar" da grade preenche modalidade e período');
  // janela e dúvidas
  await p.click('[data-demo^="Num site de verdade, este botão abriria o Google"]'); ok(await p.isVisible('#janela'), '"Como chegar" abre a janela de demonstração'); await p.keyboard.press('Escape'); ok(!(await p.isVisible('#janela')), 'Esc fecha');
  await p.click('#p3'); ok((await p.getAttribute('#p3', 'aria-expanded')) === 'true', 'dúvidas abrem');
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.documentElement.scrollWidth === innerWidth), 'sem rolagem lateral no celular');
  ok(!(await p.evaluate(() => document.getElementById('barra-m').classList.contains('visivel'))), 'barra "Aula grátis" escondida na capa');
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#planos').scrollIntoView(); }); await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.getElementById('barra-m').classList.contains('visivel')), 'barra aparece nos planos');
  await p.click('.abre-menu'); ok(await p.isVisible('#gaveta a[href="#horarios"]'), 'menu do celular abre');
  ok(await p.evaluate(() => [...document.querySelectorAll('.plano .btn')].every(x => x.getBoundingClientRect().height < 60)), 'botões dos planos em uma linha');
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => [...document.querySelectorAll('.revela, .capa h1')].every(e => getComputedStyle(e).opacity === '1')), 'sem JS: conteúdo visível');
  await ctx.close();
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.faixa ul')).animationName === 'none' && [...document.querySelectorAll('.revela')].every(e => getComputedStyle(e).opacity === '1')), 'movimento reduzido: faixa parada e sem animação de entrada');
  ok((await p.textContent('[data-alvo="2400"]')) === '2.400', 'movimento reduzido: números já no valor final');
  await b.close(); console.log('falhas:', f);
})();
