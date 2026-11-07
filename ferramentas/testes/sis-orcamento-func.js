// Testes da demo de sistema de orçamentos (Respiga Marcenaria). Uso: node sis-orcamento-func.js [url]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const { execFileSync } = require('child_process');
const B = process.argv[2] || BASE + '/demos/sistemas/orcamento/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const txt = (p, s) => p.textContent(s);
const pausa = p => p.waitForTimeout(150);
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = [], fora = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const casa = new URL(B).hostname;
  p.on('request', r => { const u = new URL(r.url()); if (![casa, 'estudiohk.com.br'].includes(u.hostname)) fora.push(r.url()); });
  const vai = async t => { await p.click('.vista[data-vista=' + t + ']'); await pausa(p); };
  const res = async s => p.$$eval(s + ' .res b', bs => bs.map(x => x.textContent));
  const abre = async (n, rev) => { await vai('orcamentos'); await p.click('#lista-orcs tr:has(td.principal b:text-is("' + n + '"))' + (rev ? ':has-text("rev. ' + rev + '")' : ':not(:has-text("rev."))') + ' [data-abrir]'); await pausa(p); };
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.querySelector('meta[name=robots]').content.startsWith('noindex') && document.querySelector('.demo-bar .outras').href === 'https://estudiohk.com.br/sistemas/'), 'noindex e link "outros sistemas"');
  await p.evaluate(() => document.fonts.ready);
  ok(await p.evaluate(() => document.fonts.check('700 20px Bitter') && document.fonts.check('400 15px "Work Sans"')), 'fontes da Respiga');
  // painel
  let r = await res('#resumo-inicio');
  ok(r[0] === '8' && r[2] === '40%', 'início: 8 enviados em 30 dias e 40% de aprovação ' + r.join('|'));
  const rt = await txt(p, '#retornos');
  ok(rt.includes('Beatriz Santos') && rt.includes('Vence amanhã') && rt.includes('Mariana Couto') && rt.includes('Enviado há 4 dias') && !rt.includes('Rafael') && (await txt(p, '#n-retorno')) === '2', 'precisa de retorno: Beatriz (vence amanhã) e Mariana (4 dias sem resposta)');
  await p.click('#retornos [data-cobrar]:near(:text("Mariana Couto"))');
  ok((await txt(p, '#j-msg')).includes('Olá, Mariana!') && (await txt(p, '#j-msg')).includes('nº 1043') && (await txt(p, '#j-msg')).includes('vale até'), 'cobrar resposta: mensagem educada com número e validade');
  await p.keyboard.press('Escape'); await pausa(p);
  ok((await txt(p, '#retornos')).includes('Cobrado hoje'), 'marca "cobrado hoje"');
  ok((await txt(p, '#agenda')).includes('Instalação') && (await txt(p, '#agenda')).includes('Amanhã'), 'agenda mostra a instalação de amanhã');
  // lista e filtros
  await vai('orcamentos');
  ok((await p.$$('#lista-orcs tr')).length === 11, 'lista com 11 orçamentos');
  await p.click('[data-filtro=vencido]');
  ok((await p.$$('#lista-orcs tr')).length === 1 && (await txt(p, '#lista-orcs')).includes('Carlos Menezes'), 'filtro Vencido: o 1040 venceu pela validade');
  await p.click('[data-filtro=todos]'); await p.fill('#busca', 'closet');
  ok((await p.$$('#lista-orcs tr')).length === 1, 'busca por ambiente');
  await p.fill('#busca', '');
  // novo orçamento
  await p.click('#novo-orc'); await pausa(p);
  ok(!(await p.isHidden('#editor')) && (await txt(p, '#titulo')) === 'Orçamento nº 1048' && await p.evaluate(() => document.activeElement.id === 'ed-cliente'), 'novo orçamento nº 1048 abre no editor com foco no cliente');
  await p.click('[data-ed=enviar]');
  ok(await p.$eval('#ed-cliente', e => e.getAttribute('aria-invalid') === 'true'), 'enviar sem cliente: pede o cliente');
  await p.selectOption('#ed-cliente', { label: 'Pedro Vieira' });
  await p.click('[data-ed=enviar]');
  ok((await txt(p, '#avisos')).includes('pelo menos um item'), 'enviar sem itens: pede um item');
  await p.selectOption('#add-0', 'arm-amad'); await p.click('[data-add="0"]'); await pausa(p);
  ok(await p.evaluate(() => document.activeElement.id === 'l-0-0-l'), 'item novo: foco vai para a largura');
  await p.fill('#l-0-0-l', '240'); await p.fill('#l-0-0-a', '90');
  ok((await txt(p, '#ed-ambientes .linha .l-qtd')) === '2,16 m²' && (await txt(p, '#ed-ambientes .linha .l-val')) === 'R$ 2.980,80', 'medida 240 × 90 cm = 2,16 m² × R$ 1.380,00 = R$ 2.980,80');
  await p.selectOption('#add-0', 'montagem'); await p.click('[data-add="0"]'); await pausa(p);
  await p.fill('#l-0-1-l', '240'); await p.fill('#l-0-1-a', '90');
  await p.fill('#amb-0', 'Cozinha da casa de praia');
  const folha = await txt(p, '#folha');
  ok(folha.includes('Materiais e equipamentosR$ 2.980,80') && folha.includes('Mão de obraR$ 388,80') && folha.includes('Cozinha da casa de praia'), 'prévia separa materiais (R$ 2.980,80) e mão de obra (R$ 388,80)');
  // frete 250 → total 3.619,60; desconto 10% sobre 3.369,60 = 336,96
  await p.fill('#ed-desc', '10');
  ok((await txt(p, '#folha')).includes('Desconto (10%)− R$ 336,96') && (await txt(p, '#folha')).includes('TotalR$ 3.282,64'), 'desconto de 10%: total R$ 3.282,64');
  await p.selectOption('#ed-desc-tipo', 'R$'); await p.fill('#ed-desc', '269,60');
  ok((await txt(p, '#folha')).includes('TotalR$ 3.350,00'), 'desconto em reais: total redondo R$ 3.350,00');
  await p.selectOption('#ed-entrada', '50'); await p.selectOption('#ed-parcelas', '2');
  ok((await txt(p, '#ed-pag-calc')).includes('Entrada de R$ 1.675,00') && (await txt(p, '#ed-pag-calc')).includes('2× de R$ 837,50'), 'entrada de 50% e 2 parcelas de R$ 837,50');
  ok((await p.inputValue('#ed-validade')) === '10' && (await txt(p, '#folha')).includes('10 dias a partir do recebimento'), 'validade padrão de 10 dias a partir do recebimento (CDC, art. 40, § 1º)');
  const fim = await p.inputValue('#ed-termino'); await p.fill('#ed-termino', await p.inputValue('#ed-inicio')); await p.dispatchEvent('#ed-termino', 'change');
  ok(await p.isVisible('#e-datas'), 'término antes do início: avisa');
  await p.fill('#ed-termino', fim); await p.dispatchEvent('#ed-termino', 'change');
  await p.click('[data-ed=enviar]'); await pausa(p);
  ok((await txt(p, '#j-msg')).includes('Olá, Pedro!') && (await txt(p, '#j-msg')).includes('R$ 3.350,00') && (await txt(p, '#ed-status')).includes('Enviado'), 'enviar pelo WhatsApp: mensagem com total e o orçamento vira "Enviado"');
  await p.keyboard.press('Escape'); await pausa(p);
  // PDF
  await p.emulateMedia({ media: 'print' }); await p.pdf({ path: SAIDA + 'teste-1048.pdf', format: 'A4', printBackground: true }); await p.emulateMedia({ media: 'screen' });
  const pdf = execFileSync('pdftotext', [SAIDA + 'teste-1048.pdf', '-']).toString();
  const pags = +/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [SAIDA + 'teste-1048.pdf']).toString())[1];
  ok(pags === 1 && ['Materiais e equipamentos', 'Mão de obra', 'Condições de pagamento', 'início em', 'término em', 'Validade', 'De acordo', '1048'].every(t => pdf.includes(t)) && !pdf.includes('Recomeçar'), 'PDF A4 de 1 página só com o orçamento: materiais, mão de obra, condições, início, término e validade');
  // recusar com motivo e duplicar
  await p.click('[data-ed=recusar]'); await p.check('#recusar input[value="Prazo"]', { force: true }); await p.click('#recusar button[value=sim]'); await pausa(p);
  ok((await txt(p, '#ed-status')).includes('Recusado') && await p.isVisible('#ed-trava') && await p.$eval('#ed-campos', e => e.disabled), 'recusado com motivo: campos travados');
  await p.click('[data-ed=duplicar]'); await pausa(p);
  ok((await txt(p, '#titulo')).includes('revisão 2') && (await txt(p, '#ed-status')).includes('Rascunho') && !(await p.$eval('#ed-campos', e => e.disabled)), 'duplicar cria a revisão 2 como rascunho editável');
  await p.click('#ed-voltar'); await pausa(p);
  ok((await txt(p, '#lista-orcs')).includes('rev. 2'), 'revisão aparece na lista');
  // aprovar vira serviço
  await abre(1044);
  await p.click('[data-ed=aprovar]'); await pausa(p);
  const sinal = await p.inputValue('#ap-sinal');
  ok(sinal === '5592,32', 'aprovar: sinal sugerido é a entrada de 40% (R$ 5.592,32) ' + sinal);
  await p.fill('#ap-sinal', '999999'); await p.click('#f-aprovar button[type=submit]');
  ok(await p.isVisible('#e-sinal'), 'sinal maior que o total: avisa');
  await p.fill('#ap-sinal', sinal); await p.click('#f-aprovar button[type=submit]'); await pausa(p);
  ok((await txt(p, '#titulo')) === 'Serviços' && (await txt(p, '#servicos')).includes('Quarto do casal') && (await txt(p, '#n-servicos')) === '3', 'aprovado vira serviço (3 em andamento)');
  const sv = '.servico:has-text("Quarto do casal")';
  ok((await txt(p, sv + ' .sv-val')).includes('R$ 8.388,48') && (await txt(p, sv + ' [aria-current=step]')).includes('Medição técnica'), 'serviço começa na medição técnica com saldo de R$ 8.388,48');
  await p.click(sv + ' [data-avancar]'); await pausa(p);
  ok((await txt(p, sv + ' [aria-current=step]')).includes('Produção'), 'avançar para produção');
  await p.click(sv + ' [data-avisar]');
  ok((await txt(p, '#j-msg')).includes('entraram em produção'), 'avisar cliente da etapa');
  await p.keyboard.press('Escape'); await pausa(p);
  await p.click(sv + ' [data-receber]'); await pausa(p);
  ok((await p.inputValue('#rc-valor')) === '2796,16', 'receber sugere a parcela de R$ 2.796,16');
  await p.click('#f-receber button[type=submit]'); await pausa(p);
  ok((await txt(p, sv + ' .sv-val')).includes('R$ 5.592,32'), 'parcela recebida: saldo cai para R$ 5.592,32');
  // clientes
  await vai('clientes');
  await p.click('[data-ficha]:near(:text("Rafael Lima"))'); await pausa(p);
  const ficha = await txt(p, '#cl-ficha');
  ok(ficha.includes('1044') && ficha.includes('1039') && ficha.includes('R$ 13.980,80') && ficha.includes('50%'), 'ficha do Rafael: 2 orçamentos, R$ 13.980,80 fechado, 50% de aprovação');
  await p.click('#cl-orc'); await pausa(p);
  ok((await txt(p, '#subtitulo')).startsWith('Rafael Lima') && (await txt(p, '#titulo')) === 'Orçamento nº 1049', 'novo orçamento a partir da ficha já vem com o cliente');
  await p.click('#ed-novo-cli'); await p.fill('#cl-nome', 'Sofia Rangel'); await p.click('#cl-salvar'); await pausa(p);
  ok((await p.$eval('#ed-cliente', s => s.options[s.selectedIndex].textContent)) === 'Sofia Rangel', 'cadastrar cliente pelo editor já seleciona o cliente novo');
  // catálogo
  await vai('catalogo');
  await p.uncheck('[data-ativo=espelho]', { force: true }); await pausa(p);
  await p.click('#novo-item'); await p.fill('#it-nome', 'Painel de cabeceira estofado'); await p.selectOption('#it-un', 'm2'); await p.click('#f-item button[type=submit]');
  ok(await p.isVisible('#e-itpreco'), 'item sem preço: pede o preço');
  await p.fill('#it-preco', '890,00'); await p.click('#f-item button[type=submit]'); await pausa(p);
  await vai('orcamentos'); await p.click('#novo-orc'); await pausa(p);
  const ops = await p.$$eval('#add-0 option', os => os.map(o => o.textContent));
  ok(ops.some(o => o.startsWith('Painel de cabeceira')) && !ops.some(o => o.startsWith('Espelho')) && !ops.some(o => o.startsWith('Tampo de vidro')), 'editor mostra o item novo e esconde os desativados');
  await p.click('#ed-voltar'); await pausa(p);
  ok(!(await txt(p, '#lista-orcs')).includes('1050'), 'rascunho vazio some ao sair do editor');
  // guarda e recomeça
  await p.reload({ waitUntil: 'networkidle' }); await vai('servicos');
  ok((await txt(p, '#n-servicos')) === '3', 'recarregar mantém o serviço novo');
  await p.click('.recomecar'); await p.click('#confirma button[value=sim]'); await pausa(p);
  ok((await txt(p, '#n-servicos')) === '2' && (await txt(p, '#titulo')) === 'Início', 'recomeçar volta ao início');
  ok(fora.length === 0, 'nada carregado de fora ' + JSON.stringify(fora));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // sem armazenamento
  ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); p = await ctx.newPage();
  await p.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } }); });
  const e2 = []; p.on('pageerror', e => e2.push(e.message));
  await p.goto(B + '#orcamentos', { waitUntil: 'networkidle' }); await p.click('#novo-orc'); await pausa(p);
  ok(e2.length === 0 && (await txt(p, '#titulo')) === 'Orçamento nº 1048', 'sem armazenamento: funciona igual ' + JSON.stringify(e2));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  let larg = 0; for (const t of ['inicio', 'orcamentos', 'servicos', 'clientes', 'catalogo']) { await p.tap('.vista[data-vista=' + t + ']'); await p.waitForTimeout(80); larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth)); }
  await p.tap('.vista[data-vista=orcamentos]'); await p.tap('#lista-orcs [data-abrir]'); await p.waitForTimeout(200);
  larg = Math.max(larg, await p.evaluate(() => document.documentElement.scrollWidth));
  ok(larg === 375, 'celular: sem rolagem lateral nas telas e no editor (' + larg + ')');
  ok(await p.isHidden('.ed-previa') && await p.isVisible('.ed-abas'), 'celular: editor com abas Editar / Ver PDF');
  await p.tap('.ed-abas [data-aba=pdf]');
  ok(await p.isVisible('#folha') && await p.isHidden('.ed-form'), 'celular: aba Ver PDF mostra a folha');
  await ctx.close();
  await b.close(); console.log('falhas:', f);
})();
