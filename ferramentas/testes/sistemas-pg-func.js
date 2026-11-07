const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const B = BASE + '';
const SHOT = SAIDA + '';
let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('FALHA:', m); } else console.log('ok:', m); };

(async () => {
  require('fs').mkdirSync(SHOT, { recursive: true });
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1366, height: 900 } });
  const pg = await ctx.newPage();
  const erros = [], fora = [];
  pg.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  pg.on('pageerror', e => erros.push(String(e)));
  pg.on('request', r => { if (!r.url().startsWith(B) && !r.url().startsWith('data:')) fora.push(r.url()); });
  await pg.goto(B + '/sistemas/', { waitUntil: 'networkidle' });

  ok(await pg.locator('.aviso-previa').isVisible(), 'aviso de simulação visível');
  ok((await pg.locator('.aviso-previa').innerText()).includes('Não é o sistema final'), 'aviso diz que não é o sistema final');
  // as 12 funcionalidades: [aba, índice, texto esperado no painel, texto esperado no celular]
  const CASOS = [
    ['cafe', 0, '537,70', 'Pronto'], ['cafe', 1, 'Mesa 7 liberada', 'Pix recebido'], ['cafe', 2, 'Gaveta conferida', 'Resumo de hoje'],
    ['marc', 0, 'PDF enviado', 'R$ 6.578,40'], ['marc', 1, 'Serviço criado', 'Assinado por'], ['marc', 2, 'Medição sugerida', 'marcar a medição'],
    ['acad', 0, 'entrou pela lista de espera', 'Reservado'], ['acad', 1, 'Carga atualizada', 'Sua evolução'], ['acad', 2, 'Recebido: R$ 149,90', 'Pago'],
    ['barb', 0, 'Lista de compras', 'Venda registrada'], ['barb', 1, 'Usar primeiro: lote A', 'Atendido'], ['barb', 2, 'Confirmado pelo fornecedor', 'Pedido nº 18'],
  ];
  for (const [aba, i, tDono, tCel] of CASOS) {
    await pg.click('#ab-' + aba);
    await pg.click('#exp-funcs button[data-f="' + i + '"]');
    ok((await pg.getAttribute('#exp-funcs button[data-f="' + i + '"]', 'aria-pressed')) === 'true', aba + i + ': botão marcado');
    await pg.click('#exp-rodar');
    await pg.waitForSelector('#exp-de-novo:not([hidden])', { timeout: 8000 });
    ok((await pg.locator('#exp-log li').count()) === 3, aba + i + ': 3 passos');
    const d = await pg.locator('#exp-dono').innerText(), c = await pg.locator('#exp-cel').innerText();
    ok(d.includes(tDono), aba + i + ': painel mostra "' + tDono + '"');
    ok(c.includes(tCel), aba + i + ': celular mostra "' + tCel + '"');
    if (i === 1) await pg.locator('#exp').screenshot({ path: SHOT + 'exp-' + aba + '.png' });
    await pg.click('#exp-de-novo');
    ok((await pg.locator('#exp-log li').count()) === 0 && !(await pg.locator('#exp-rodar').isDisabled()), aba + i + ': Fazer de novo');
  }
  // teclado
  await pg.click('#ab-cafe'); await pg.focus('#ab-cafe'); await pg.keyboard.press('ArrowRight');
  ok(await pg.evaluate(() => document.activeElement.id === 'ab-marc' && document.getElementById('ab-marc').getAttribute('aria-selected') === 'true'), 'teclado: seta muda a aba');
  // escolha manual na aprovação
  await pg.click('#exp-funcs button[data-f="1"]');
  await pg.click('#exp-cel [data-op="2"]');
  await pg.click('#exp-rodar');
  await pg.waitForSelector('#exp-de-novo:not([hidden])', { timeout: 8000 });
  ok((await pg.locator('#exp-dono').innerText()).includes('Aprovado · Premium') && (await pg.locator('#exp-log').innerText()).includes('mais completa'), 'aprovação: escolha manual respeitada');
  ok(await pg.locator('#sob-medida table').isVisible() && (await pg.locator('.func-grupo').count()) === 4, 'seções sob medida e funcionalidades');
  ok((await pg.locator('#custos, #demos, .sis-card').count()) === 0, 'sem custos e sem cartões de demo');

  // calculadora
  const h1 = await pg.locator('#sr-horas').innerText();
  await pg.check('input[name=s-tipo][value=marc]', { force: true });
  await pg.waitForTimeout(700);
  ok((await pg.locator('#s-qtd-rot').innerText()).includes('Orçamentos'), 'calculadora: rótulos mudam com o tipo');
  const h2 = await pg.locator('#sr-horas').innerText();
  ok(h1 !== h2, 'calculadora: resultado muda com o tipo (' + h1 + ' → ' + h2 + ')');
  await pg.locator('#s-perda').evaluate(e => { e.value = 8; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await pg.waitForTimeout(700);
  ok((await pg.locator('#sr-mes').innerText()) === 'R$ 18.000', 'calculadora: 8 × 9.000 × 1/4 = R$ 18.000 (' + await pg.locator('#sr-mes').innerText() + ')');
  ok((await pg.locator('#sr-ano').innerText()) === 'R$ 216.000', 'calculadora: ano');
  await pg.locator('#calculadora .calc').screenshot({ path: SHOT + 'calc.png' });

  // quero um sistema marca w3
  await pg.click('#calculadora [data-quero-sistema]');
  ok(await pg.isChecked('#w3'), '"Quero um sistema" marca Sistema no orçamento');

  ok(erros.length === 0, 'console limpo ' + erros.join(' | '));
  ok(fora.length === 0, 'nada carregado de fora ' + fora.join(' '));
  await pg.screenshot({ path: SHOT + 'sistemas-full.png', fullPage: true });

  // menu nas páginas
  for (const u of ['/', '/sites/', '/automacoes/']) {
    await pg.goto(B + u);
    ok(await pg.locator('.nav-links a[href="/sistemas/"]').count() === 1, 'menu tem Sistemas em ' + u);
  }
  // nenhum link para as demos e demos fora do Google
  for (const u of ['/', '/sites/', '/automacoes/', '/sistemas/']) {
    await pg.goto(B + u);
    ok(await pg.locator('a[href*="/demos/sistemas/"], img[src*="/demos/sistemas/"]').count() === 0, 'sem link para demos de sistema em ' + u);
  }
  for (const s of ['pedidos', 'orcamento', 'academia', 'estoque']) {
    await pg.goto(B + '/demos/sistemas/' + s + '/?sem-passeio');
    ok((await pg.getAttribute('meta[name=robots]', 'content')).startsWith('noindex'), 'noindex na demo ' + s);
  }

  // celular 375
  const m = await br.newContext({ viewport: { width: 375, height: 800 }, deviceScaleFactor: 1 });
  const mp = await m.newPage();
  await mp.goto(B + '/sistemas/', { waitUntil: 'networkidle' });
  const larg = await mp.evaluate(() => document.documentElement.scrollWidth);
  ok(larg <= 375, 'celular sem rolagem lateral (' + larg + ')');
  await mp.click('#exp-rodar');
  await mp.waitForSelector('#exp-de-novo:not([hidden])', { timeout: 8000 });
  ok(await mp.evaluate(() => document.documentElement.scrollWidth) <= 375, 'celular sem rolagem lateral depois da cena');
  await mp.locator('#simule').screenshot({ path: SHOT + 'exp-cel375.png' });
  await mp.screenshot({ path: SHOT + 'sistemas-375.png', fullPage: true });

  // movimento reduzido
  const r = await br.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const rp = await r.newPage();
  await rp.goto(B + '/sistemas/');
  await rp.click('#exp-rodar');
  await rp.waitForTimeout(400);
  ok((await rp.locator('#exp-log li').count()) === 3, 'movimento reduzido: resultado quase instantâneo');

  await br.close();
  console.log('\nFALHAS:', falhas);
  process.exit(falhas ? 1 : 0);
})();
