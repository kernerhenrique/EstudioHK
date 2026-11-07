// Testes da demo de sistema de estoque (Ofício Barbearia). Uso: node sis-estoque-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const B = process.argv[2] || BASE + '/demos/sistemas/estoque/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const txt = (p, s) => p.textContent(s);
const pausa = p => p.waitForTimeout(150);
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); let p = await ctx.newPage(); await p.clock.setFixedTime(new Date('2026-11-06T10:00:00'));
  const errs = [], fora = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const casa = new URL(B).hostname;
  p.on('request', r => { const u = new URL(r.url()); if (![casa, 'estudiohk.com.br'].includes(u.hostname)) fora.push(r.url()); });
  const vai = async t => { await p.click('.vista[data-vista=' + t + ']'); await pausa(p); };
  const res = async s => p.$$eval(s + ' .res b', bs => bs.map(x => x.textContent));
  const linha = async nome => { await vai('produtos'); await p.fill('#busca', nome); await pausa(p); return txt(p, '#lista-produtos tr'); };
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.startsWith('noindex') && document.querySelector('.demo-bar .outras').href === 'https://estudiohk.com.br/sistemas/'), 'noindex e link "outros sistemas"');
  await p.evaluate(() => document.fonts.ready);
  ok(await p.evaluate(() => document.fonts.check('600 20px Fraunces') && document.fonts.check('400 15px "DM Sans"')), 'fontes da Ofício');
  // início
  let r = await res('#resumo-inicio');
  ok(r[1] === '5' && r[2] === 'R$ 236,00' && r[3] === '8', 'início: 5 acabando, R$ 236,00 vendidos, 8 atendimentos ' + r.join('|'));
  ok((await p.$$('#acabando li:not(.mais)')).length === 5 && (await txt(p, '#acabando')).includes('Pedido a caminho'), 'acabando: 5, dois com pedido a caminho');
  ok((await p.$$('#vencendo li')).length === 3 && (await txt(p, '#vencendo li:first-child')).includes('Pigmento'), 'vencendo: 3, o pigmento primeiro');
  // produtos e filtros
  await vai('produtos');
  ok((await p.$$('#lista-produtos tr')).length === 16, '16 produtos');
  await p.click('[data-filtro=venda]');
  ok((await p.$$('#lista-produtos tr')).length === 6, 'filtro venda no balcão: 6');
  await p.click('[data-filtro=todos]');
  // saída usa primeiro o lote que vence antes
  await p.fill('#busca', 'Óleo'); await pausa(p);
  ok((await txt(p, '#lista-produtos tr')).includes('21/12/2026'), 'óleo: próxima validade é a do lote mais antigo');
  await p.click('[data-mov=saida][data-p=oleo]'); await pausa(p);
  await p.fill('#mv-qtd', '99'); await p.click('#f-mov button[type=submit]');
  ok(await p.isVisible('#e-mv') && (await txt(p, '#e-mv')).includes('Só tem 9 un'), 'saída maior que o estoque: avisa');
  await p.selectOption('#mv-motivo', 'Vencido'); await p.fill('#mv-qtd', '3'); await p.click('#f-mov button[type=submit]'); await pausa(p);
  let l = await txt(p, '#lista-produtos tr');
  ok(l.includes('6 un') && !l.includes('21/12/2026') && !l.includes('vence logo'), 'saída de 3 tira o lote que vencia antes (sobra o lote novo)');
  // entrada com validade
  await p.fill('#busca', 'Espuma'); await pausa(p);
  await p.click('[data-mov=entrada][data-p=espuma]'); await pausa(p);
  ok((await txt(p, '#mv-qtd-rot')).includes('frascos de 500 ml'), 'entrada pede em frascos de 500 ml');
  await p.fill('#mv-qtd', '2'); await p.click('#f-mov button[type=submit]'); await pausa(p);
  l = await txt(p, '#lista-produtos tr');
  ok(l.includes('1.600 ml') && l.includes('Ok'), 'entrada de 2 frascos: 600 ml vira 1.600 ml e sai do "acabando"');
  // movimentos
  await p.click('[data-aba=mov]'); await p.click('[data-fmov=Saída]');
  ok((await txt(p, '#lista-movs')).includes('Vencido') && (await txt(p, '#lista-movs')).includes('Perda ou quebra'), 'movimentos: saídas com o motivo');
  await p.click('[data-aba=lista]'); await p.fill('#busca', '');
  // balcão
  await vai('balcao');
  await p.click('[data-por=pomadabr]'); await p.click('[data-por=pomadabr]'); await p.click('[data-por=pomada]');
  ok((await txt(p, '#v-total')) === 'R$ 147,00', 'venda: 2 pomadas brilho + 1 seco = R$ 147,00');
  await p.click('[data-por=pomadabr]'); await p.click('[data-por=pomadabr]');
  ok(await p.$eval('[data-por=pomadabr]', e => e.disabled) && await p.$eval('#itens-venda li[data-id=pomadabr] [data-d="1"]', e => e.disabled), 'não deixa vender mais do que tem (4 pomadas brilho)');
  await p.click('#itens-venda li[data-id=pomadabr] [data-d="-1"]'); await p.click('#itens-venda li[data-id=pomadabr] [data-d="-1"]');
  await p.check('#f-venda input[value=Cartão]', { force: true }); await p.fill('#v-cliente', 'Bruno'); await p.click('#v-fechar'); await pausa(p);
  r = await res('#resumo-vendas');
  ok(r[0] === 'R$ 383,00' && r[1] === 'R$ 214,00' && (await txt(p, '#lista-vendas tr:first-child')).includes('Bruno'), 'venda registrada: R$ 383,00 no dia, lucro R$ 214,00');
  ok(!(await p.$('#vitrine li:has-text("efeito brilho") [data-por]:disabled')) && (await txt(p, '#vitrine')).includes('2 em estoque'), 'estoque da pomada brilho baixou para 2');
  ok((await txt(p, '#avisos')).includes('Venda de R$ 147,00'), 'aviso da venda');
  await p.click('#v-fechar');
  ok((await txt(p, '#avisos')).includes('pelo menos um produto'), 'venda vazia: pede um produto');
  // serviços
  await vai('servicos');
  await p.selectOption('#at-barbeiro', 'Rafa'); await p.selectOption('#at-servico', 'barba');
  ok((await txt(p, '#at-prev')).includes('20 ml de espuma de barbear') && (await txt(p, '#at-prev')).includes('1 un de lâmina'), 'prévia do que sai do estoque na barba');
  const lam0 = await (async () => { await vai('produtos'); await p.fill('#busca', 'Lâmina'); await pausa(p); return txt(p, '#lista-produtos tr'); })();
  await vai('servicos'); await p.selectOption('#at-barbeiro', 'Rafa'); await p.selectOption('#at-servico', 'barba'); await p.click('#f-atend button[type=submit]'); await pausa(p);
  r = await res('#resumo-atend');
  ok(r[0] === '9' && (await txt(p, '#lista-atend tr:first-child')).includes('Barba com toalha quente'), 'atendimento registrado (9 hoje)');
  l = await linha('Lâmina');
  ok(lam0.includes('140 un') && l.includes('139 un'), 'gasto por serviço: lâmina baixou de 140 para 139');
  // receitas
  await vai('servicos'); await p.click('[data-aba-s=receitas]');
  await p.selectOption('#rca-sobrancelha', 'alcool'); await p.click('.receita[data-s=sobrancelha] [data-add-rc]'); await pausa(p);
  await p.fill('#rc-sobrancelha-1', '3');
  await p.click('[data-aba-s=hoje]'); await p.selectOption('#at-servico', 'sobrancelha');
  ok((await txt(p, '#at-prev')).includes('3 ml de álcool 70%'), 'editar quanto o serviço gasta muda a baixa');
  // pigmento: atendimento leva ao mínimo? (já está acabando) — toalha zera?
  // compras
  await vai('compras');
  const lc = await txt(p, '#lista-compras');
  ok(lc.includes('Pigmento') && lc.includes('Toalha descartável') && !lc.includes('Espuma') && !lc.includes('efeito brilho'), 'lista de compras: pigmento e toalha (sem espuma, que entrou, nem a pomada a caminho)');
  ok((await p.inputValue('#lc-toalha')) === '3', 'sugestão para toalha: 3 pacotes de 100 (dobro do mínimo)');
  await p.fill('#lc-toalha', '4');
  ok((await txt(p, '.forn[data-f=desc] .lc-total')) === 'R$ 152,00', 'muda a quantidade e o custo estimado acompanha');
  await p.click('[data-pedir=desc]'); await pausa(p);
  ok((await txt(p, '#j-msg')).includes('Olá, Marcos!') && (await txt(p, '#j-msg')).includes('4 pacotes de 100 un · Toalha descartável'), 'pedido ao fornecedor pelo WhatsApp com as quantidades');
  await p.keyboard.press('Escape'); await pausa(p);
  ok((await txt(p, '#pedidos')).includes('Pedido nº 18') && !(await txt(p, '#lista-compras')).includes('Toalha'), 'pedido nº 18 a caminho; toalha sai da lista de compras');
  // receber com diferença
  await p.click('#pd-2 [data-receber], .ped:has-text("nº 17") [data-receber]'); await pausa(p);
  await p.fill('#rq-0', '5'); await p.click('#f-rec button[type=submit]'); await pausa(p);
  ok((await txt(p, '#avisos')).includes('Shampoo para barba 120 ml: chegou 5 de 6') && (await txt(p, '.ped:has-text("nº 17")')).includes('Recebido') && (await txt(p, '.ped:has-text("nº 17")')).includes('chegou 5'), 'conferir pedido: entrada com o que chegou e a diferença registrada');
  l = await linha('Shampoo para barba');
  ok(l.includes('5 un') && l.includes('Ok'), 'shampoo para barba: de zerado para 5 un');
  // novo produto
  await vai('produtos'); await p.fill('#busca', ''); await p.click('#novo-produto'); await p.fill('#pr-nome', 'Cera para bigode'); await p.click('#f-prod button[type=submit]');
  ok(await p.isVisible('#e-prcusto'), 'produto sem custo: pede o custo');
  await p.fill('#pr-custo', '15,00'); await p.fill('#pr-preco', '35,00'); await p.click('#f-prod button[type=submit]'); await pausa(p);
  ok((await txt(p, '#lista-produtos')).includes('Cera para bigode') && (await txt(p, '#lista-produtos tr:has-text("Cera")')).includes('Zerado'), 'produto novo entra zerado');
  // guarda e recomeça
  await p.reload({ waitUntil: 'networkidle' }); await vai('balcao');
  ok((await res('#resumo-vendas'))[0] === 'R$ 383,00', 'recarregar mantém os dados');
  await p.click('.recomecar'); await p.click('#confirma button[value=sim]'); await pausa(p);
  ok((await res('#resumo-inicio'))[1] === '5' && (await txt(p, '#titulo')) === 'Início', 'recomeçar volta ao início');
  ok(fora.length === 0, 'nada carregado de fora ' + JSON.stringify(fora));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // sem armazenamento
  ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); p = await ctx.newPage(); await p.clock.setFixedTime(new Date('2026-11-06T10:00:00'));
  await p.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } }); });
  const e2 = []; p.on('pageerror', e => e2.push(e.message));
  await p.goto(B + '#balcao', { waitUntil: 'networkidle' }); await p.click('[data-por=pente]'); await p.click('#v-fechar'); await p.waitForTimeout(150);
  ok(e2.length === 0 && (await txt(p, '#resumo-vendas .res b')) === 'R$ 261,00', 'sem armazenamento: funciona igual ' + JSON.stringify(e2));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage(); await p.clock.setFixedTime(new Date('2026-11-06T10:00:00'));
  await p.goto(B, { waitUntil: 'networkidle' });
  let larg = 0; for (const t of ['inicio', 'produtos', 'balcao', 'servicos', 'compras']) { await p.tap('.vista[data-vista=' + t + ']'); await p.waitForTimeout(80); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  await p.tap('.vista[data-vista=produtos]'); await p.tap('[data-aba=mov]'); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth));
  await p.tap('.vista[data-vista=servicos]'); await p.tap('[data-aba-s=receitas]'); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth));
  ok(larg === 375, 'celular: sem rolagem lateral em todas as telas (' + larg + ')');
  await p.tap('.vista[data-vista=balcao]'); await p.tap('[data-por=balm]'); await p.tap('#v-fechar'); await p.waitForTimeout(150);
  ok((await txt(p, '#resumo-vendas .res b')) === 'R$ 290,00', 'celular: venda no balcão funciona');
  await ctx.close();
  await b.close(); console.log('falhas:', f);
})();
