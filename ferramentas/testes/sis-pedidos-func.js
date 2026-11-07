// Testes da demo de sistema de pedidos (Coadouro): mesas, cozinha, caixa, cardápio e entrega. Uso: node sis-pedidos-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const B = process.argv[2] || BASE + '/demos/sistemas/pedidos/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const txt = (p, s) => p.textContent(s);
const pausa = p => p.waitForTimeout(150);
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1680, height: 900 } }); await ctx.addInitScript(() => { try { localStorage.setItem('coadouro-ao-vivo', 'nao'); localStorage.setItem('coadouro-passeio', 'visto'); } catch (e) {} }); let p = await ctx.newPage();
  const errs = [], fora = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const casa = new URL(B).hostname;
  p.on('request', r => { const u = new URL(r.url()); if (![casa, 'estudiohk.com.br'].includes(u.hostname)) fora.push(r.url()); });
  const vai = async t => { await p.click('.vista[data-vista=' + t + ']'); await pausa(p); };
  const res = async s => p.$$eval(s + ' .res b', bs => bs.map(x => x.textContent));
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.startsWith('noindex') && document.querySelector('.demo-bar .outras').href === 'https://estudiohk.com.br/sistemas/'), 'noindex e link "outros sistemas"');
  await p.evaluate(() => document.fonts.ready);
  ok(await p.evaluate(() => document.fonts.check('700 20px "Bricolage Grotesque"') && document.fonts.check('400 15px "Instrument Sans"')), 'fontes da Coadouro');
  ok((await txt(p, '#agora')) === '9h40', 'relógio da demonstração começa às 9h40');
  let r = await res('#resumo-hoje');
  ok(r.join('|') === 'R$ 514,70|8|4 de 10|R$ 367,40', 'resumo: vendas R$ 514,70, 8 em aberto, 4 mesas ocupadas, R$ 367,40 a receber ' + r.join('|'));
  const qtd = async () => p.$$eval('.coluna .qtd', q => q.map(x => x.textContent.replace(/\D/g, '')).join(','));
  ok(await qtd() === '4,2,2,7', 'colunas: 4 novos, 2 preparando, 2 prontos, 7 entregues');
  await vai('cozinha');
  ok(await p.evaluate(() => document.querySelector('.ticket[data-n="428"]').classList.contains('atraso') && document.querySelector('.ticket[data-n="430"]').className === 'ticket' && document.querySelectorAll('.ticket').length === 6), 'cozinha: 6 na fila, vermelho para quem espera há mais de 15 min');
  await vai('pedidos');
  // filtros e busca
  await p.click('.filtros [data-tipo=entrega]');
  ok((await p.$$('#quadro .pedido')).length === 3, 'filtro Entrega mostra 3 pedidos');
  await p.click('.filtros [data-tipo=todos]'); await p.fill('#busca', 'mesa 4');
  ok((await p.$$('#quadro .pedido')).length === 2, 'busca "mesa 4" acha as 2 rodadas da mesa');
  await p.fill('#busca', '');
  // etapas, aviso e saída para entrega
  await p.click('#p-431 .avanca');
  ok(await p.evaluate(() => !!document.querySelector('[data-etapa=preparando] #p-431') && document.activeElement.id === 'p-431'), 'botão move #0431 para Preparando e o foco segue o cartão');
  await p.click('#p-427 [data-avisar]');
  ok((await txt(p, '#cel-conteudo')).includes('Olá, Fernando!') && (await txt(p, '#cel-conteudo')).includes('R$ 20,00'), 'avisar retirada pronta: mensagem do WhatsApp');
  await p.keyboard.press('Escape'); await pausa(p);
  await p.click('#p-428 .avanca'); await p.click('#p-428 [data-saiu]');
  ok((await txt(p, '#cel-conteudo')).includes('saiu para entrega') && (await txt(p, '#cel-conteudo')).includes('R$ 6,00 de entrega'), 'entrega: "saiu para entrega" com a taxa do bairro');
  await p.keyboard.press('Escape'); await pausa(p);
  ok((await txt(p, '#p-428')).includes('Saiu às'), 'cartão marca a hora da saída');
  await p.dragAndDrop('#p-434', '.coluna[data-etapa=preparando]');
  ok(await p.evaluate(() => !!document.querySelector('[data-etapa=preparando] #p-434')), 'arrastar #0434 para Preparando');
  // mesas e garçom
  await vai('mesas');
  ok((await txt(p, '[data-mesa="9"]')).includes('Pedido pronto') && (await txt(p, '[data-mesa="2"]')).includes('Conta pedida'), 'mesas: 9 com pedido pronto, 2 com conta pedida');
  await p.click('[data-mesa="9"]'); await pausa(p);
  await p.click('#painel-mesa [data-levado]'); await pausa(p);
  ok((await txt(p, '#m-corpo')).includes('Entregue'), 'garçom marca "levado à mesa"');
  await p.keyboard.press('Escape'); await pausa(p);
  await p.click('[data-mesa="5"]'); await pausa(p); await p.click('#m-pe [data-lancar]'); await pausa(p);
  ok(await p.isHidden('#g-tipo') && (await txt(p, '#p-titulo')) === 'Pedido da Mesa 5' && (await txt(p, '#salvar')) === 'Enviar para a cozinha', 'mesa livre: pedido já vem com a mesa, botão "Enviar para a cozinha"');
  await p.click('li[data-id=cappuccino] [data-d="1"]'); await p.click('li[data-id=cappuccino] [data-d="1"]'); await p.click('#salvar'); await pausa(p);
  ok((await txt(p, '[data-mesa="5"]')).includes('R$ 26,40') && (await txt(p, '#n-mesas')) === '5', 'mesa 5 abre com R$ 26,40 (com 10% de serviço) e 5 mesas ocupadas');
  // cozinha
  await vai('cozinha');
  const tk = '.ticket:has(h2:text-is("Mesa 5"))';
  ok(await p.isVisible(tk), 'cozinha recebe o pedido da mesa 5');
  await p.click(tk + ' [data-coz]'); await pausa(p); await p.click(tk + ' [data-coz]'); await pausa(p);
  ok(!(await p.$(tk)) && (await txt(p, '#avisos')).includes('O garçom já vê'), 'começar e pronto: some da cozinha e avisa o garçom');
  await vai('mesas');
  ok((await txt(p, '[data-mesa="5"]')).includes('Pedido pronto'), 'mesa 5 mostra pedido pronto para levar');
  // serviço opcional
  await p.click('[data-mesa="4"]'); await pausa(p); await p.click('#m-serv'); await pausa(p);
  ok((await txt(p, '#m-corpo .tot')).includes('R$ 50,00'), 'tirar os 10% de serviço da mesa 4: total R$ 50,00');
  await p.keyboard.press('Escape'); await pausa(p);
  // pagamento com divisão, troco e fechamento
  await p.click('[data-mesa="2"]'); await pausa(p); await p.click('#m-pe [data-receber]'); await pausa(p);
  ok((await txt(p, '#r-falta')) === 'R$ 25,30' && (await p.inputValue('#r-valor')) === '25,30', 'receber mesa 2: falta R$ 25,30 (metade já paga no Pix)');
  await p.fill('#r-valor', '99'); await p.click('#f-pag button[type=submit]');
  ok(await p.isVisible('#e-valor') && (await txt(p, '#e-valor')).includes('passa do que falta'), 'não deixa receber mais do que falta');
  await p.click('[data-div="1"]');
  ok((await txt(p, '#r-por-pessoa')) === 'R$ 12,65 por pessoa' && (await p.inputValue('#r-valor')) === '12,65', 'dividir por 2: R$ 12,65 por pessoa');
  await p.check('input[name=forma][value=Dinheiro]', { force: true }); await p.fill('#r-recebido', '20');
  ok((await txt(p, '#r-troco')) === 'Troco: R$ 7,35', 'dinheiro: troco de R$ 7,35');
  await p.click('#f-pag button[type=submit]'); await pausa(p);
  ok((await txt(p, '#r-falta')) === 'R$ 12,65', 'primeira parte paga, falta R$ 12,65');
  await p.check('input[name=forma][value=Pix]', { force: true }); await p.click('#f-pag button[type=submit]'); await pausa(p);
  ok(await p.isHidden('#painel-pag') && (await txt(p, '[data-mesa="2"]')).includes('Livre') && (await txt(p, '#avisos')).includes('Mesa liberada'), 'segunda parte fecha a conta e libera a mesa 2');
  await vai('caixa');
  r = await res('#resumo-caixa');
  ok(r[0] === 'R$ 172,60', 'caixa: recebido hoje sobe para R$ 172,60 ' + r[0]);
  ok(await p.evaluate(() => [...document.querySelectorAll('#por-forma li')].find(l => l.textContent.startsWith('Dinheiro')).textContent.includes('R$ 37,65')), 'caixa: dinheiro soma R$ 37,65 (25,00 + 12,65)');
  // retirada e entrega no caixa
  await p.click('#contas tr:has-text("Fernando") [data-receber]'); await pausa(p);
  await p.check('input[name=forma][value=Débito]', { force: true }); await p.click('#f-pag button[type=submit]'); await pausa(p);
  ok(!(await txt(p, '#contas')).includes('Fernando'), 'receber a retirada de Fernando no débito tira a conta da lista');
  // nova entrega
  await vai('pedidos'); await p.click('#novo'); await p.check('input[name=tipo][value=entrega]', { force: true });
  await p.fill('#f-cliente', 'Rita Moraes'); await p.click('li[data-id=garrafa] [data-d="1"]'); await p.click('#salvar');
  ok(await p.isVisible('#e-end'), 'entrega sem endereço: pede o endereço');
  await p.fill('#f-end', 'Rua Exemplo, 12'); await p.selectOption('#f-bairro', 'Jardim da Penha');
  ok((await txt(p, '#f-total')) === 'R$ 36,00' && (await txt(p, '#f-total-rot')).includes('R$ 8,00'), 'total com a taxa do bairro (R$ 28,00 + R$ 8,00)');
  await p.click('#salvar'); await pausa(p);
  ok(await p.evaluate(() => { const c = document.querySelector('[data-etapa=novo] #p-439'); return !!c && c.textContent.includes('Jardim da Penha'); }), 'entrega #0439 entra em Novo com o bairro');
  // cancelar com motivo
  await p.click('#p-432 [data-editar]'); await p.click('#cancelar-ped'); await p.check('#cancelar input[value="Item esgotado"]', { force: true }); await p.click('#cancelar button[value=sim]'); await pausa(p);
  ok(!(await p.$('#p-432')), 'cancelar #0432 tira do quadro');
  await vai('caixa');
  ok((await txt(p, '#cancelados')).includes('#0432') && (await txt(p, '#cancelados')).includes('Item esgotado'), 'cancelamento aparece no caixa com o motivo');
  // cardápio
  await vai('cardapio');
  await p.check('[data-disp=torta]', { force: true }); await pausa(p);
  await p.uncheck('[data-disp=bolo]', { force: true }); await pausa(p);
  await p.click('#novo-item'); await p.fill('#i-nome', 'Água com gás'); await p.selectOption('#i-cat', 'Gelados'); await p.click('#i-salvar');
  ok(await p.isVisible('#e-ipreco'), 'item sem preço: pede o preço');
  await p.fill('#i-preco', '6,00'); await p.click('#i-salvar'); await pausa(p);
  ok((await txt(p, '#cardapio')).includes('Água com gás'), 'novo item entra no cardápio');
  await vai('pedidos'); await p.click('#novo');
  const form = await txt(p, '#itens-form');
  ok(form.includes('Água com gás') && form.includes('Torta de limão') && !(await p.$('#itens-form li[data-id=bolo]')) && form.includes('Esgotado agora: Bolo do dia'), 'pedido mostra o item novo e a torta, e esconde o bolo esgotado');
  await p.keyboard.press('Escape'); await pausa(p);
  // fechar o caixa
  await vai('caixa'); await p.click('#fechar-caixa'); await p.click('#confirma button[value=sim]'); await pausa(p);
  ok((await txt(p, '#j-msg')).includes('Fechamento da Coadouro') && (await txt(p, '#j-msg')).includes('· Pix:') && (await txt(p, '#j-msg')).includes('Cancelamentos: 2'), 'fechar o caixa monta o resumo do dia para o dono');
  await p.keyboard.press('Escape'); await pausa(p);
  // amanhã
  await vai('pedidos'); await p.click('.segm [data-dia=amanha]');
  const sep = await p.$$eval('#separar tr', trs => Object.fromEntries(trs.map(t => [t.cells[0].textContent, +t.cells[1].textContent])));
  ok((await txt(p, '#n-amanha')) === '3' && sep['Pão de queijo'] === 18, 'amanhã: 3 encomendas e 18 pães de queijo para separar');
  // guarda e recomeça
  await p.reload({ waitUntil: 'networkidle' });
  ok((await txt(p, '#n-mesas')) === '4' && !!(await p.$('#p-439')), 'recarregar mantém os dados (mesa 2 livre, mesa 5 aberta, entrega nova)');
  await p.click('.recomecar'); await p.click('#confirma button[value=sim]'); await pausa(p);
  r = await res('#resumo-hoje');
  ok(r[0] === 'R$ 514,70' && !(await p.$('#p-439')), 'recomeçar volta ao início');
  ok(fora.length === 0, 'nada carregado de fora ' + JSON.stringify(fora));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // sem armazenamento
  ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); p = await ctx.newPage();
  await p.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } }); });
  const e2 = []; p.on('pageerror', e => e2.push(e.message));
  await p.goto(B, { waitUntil: 'networkidle' }); await p.click('#p-431 .avanca');
  ok(e2.length === 0 && await p.evaluate(() => !!document.querySelector('[data-etapa=preparando] #p-431')), 'sem armazenamento: funciona igual ' + JSON.stringify(e2));
  await ctx.close();
  // celular (garçom)
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  let larg = 0; for (const t of ['pedidos', 'mesas', 'cozinha', 'caixa', 'cardapio']) { await p.tap('.vista[data-vista=' + t + ']'); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  ok(larg === 375, 'celular: sem rolagem lateral nas 5 telas');
  ok(await p.evaluate(() => { const l = document.querySelector('.lateral').getBoundingClientRect(); return Math.abs(l.bottom - innerHeight) < 1 && l.height < 90; }), 'celular: menu vira barra de baixo');
  await p.tap('.vista[data-vista=mesas]'); await p.tap('[data-mesa="3"]'); await p.waitForTimeout(250); await p.tap('#m-pe [data-lancar]'); await p.waitForTimeout(250);
  await p.tap('li[data-id=coado] [data-d="1"]'); await p.tap('#salvar'); await p.waitForTimeout(250);
  ok((await txt(p, '[data-mesa="3"]')).includes('R$ 9,90'), 'celular: garçom abre a mesa 3 e lança um coado (R$ 9,90 com serviço)');
  await ctx.close();
  await b.close(); console.log('falhas:', f);
})();
