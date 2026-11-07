// Testes da Prates & Arruda v2. Uso: node pa2-func.js [url base da demo]
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8792';
const SAIDA = require('path').join(__dirname, '..', '.saida') + '/'; require('fs').mkdirSync(SAIDA, { recursive: true });
const B = process.argv[2] || BASE + '/demos/advocacia/';
let f = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) f++; };
const PAGS = ['', 'areas/empresarial/', 'areas/trabalhista/', 'areas/familia/', 'artigos/prazo-rescisao/', 'artigos/revisao-pensao/', 'artigos/contrato-social/', 'en/'];
(async () => {
  const b = await chromium.launch();
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await ctx.newPage();
  const errs = [], fora = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = new URL(r.url()); if (!['localhost', 'estudiohk.com.br'].includes(u.hostname)) fora.push(r.url()); });
  // todas as páginas: regras da OAB e do site de demonstração
  for (const u of PAGS) {
    const r = await p.goto(B + u, { waitUntil: 'networkidle' });
    const txt = await p.evaluate(() => document.body.innerText);
    const info = await p.evaluate(() => ({ robots: document.querySelector('meta[name=robots]').content, canon: document.querySelector('link[rel=canonical]').href, outras: document.querySelector('.demo-bar .outras').href, h1: document.querySelectorAll('h1').length, larg: document.documentElement.scrollWidth === innerWidth }));
    ok(r.status() === 200 && info.robots.startsWith('noindex') && info.canon.endsWith('/demos/advocacia/' + u) && info.outras === 'https://estudiohk.com.br/sites/#demos' && info.h1 === 1 && info.larg, `/${u}: abre, noindex, canonical, um h1, link "outras demos"`);
    ok(!/especialista|specialist|o melhor|os melhores|melhor escritório|líder|lider|garant|resultado garantido|vitórias?\b(?! ?\()|ganhamos|sucesso em|R\$ ?\d|honorários a partir|desconto|grátis|gratuit|free consultation|ranking|prêmio|premiad/i.test(txt.replace(/Vitória\/ES|Vitória \(ES\)|em Vitória|Vitória, Brazil|VITÓRIA|Vitória/g, '')), `/${u}: Provimento 205 (sem especialista, autoelogio, resultados, preço, prêmio)`);
  }
  // home
  await p.goto(B, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  ok(await p.evaluate(() => document.fonts.check('600 20px "Source Serif 4"') && document.fonts.check('400 16px "Public Sans"')), 'fontes do próprio site');
  ok(await p.evaluate(() => !!document.querySelector('.capa .selo') && !document.querySelector('.capa img')), 'capa tipográfica com selo P&A (sem foto de prédio)');
  ok((await p.$$('.indice a')).length === 3, 'índice das 3 áreas na capa');
  // abas
  ok(await p.isVisible('#sit-voce') && await p.isHidden('#sit-empresa') && (await p.$$('#sit-voce .sit')).length === 4, '"Para você" aberto com 4 situações');
  await p.click('#tab-empresa');
  ok(await p.isVisible('#sit-empresa') && await p.isHidden('#sit-voce') && (await p.getAttribute('#tab-empresa', 'aria-selected')) === 'true', '"Para empresas" troca a lista');
  await p.focus('#tab-empresa'); await p.keyboard.press('ArrowLeft');
  ok(await p.isVisible('#sit-voce') && await p.evaluate(() => document.activeElement.id === 'tab-voce'), 'abas trocam pelas setas do teclado');
  const hrefs = await p.$$eval('.sit', a => a.map(x => x.getAttribute('href')));
  ok(hrefs.every(h => /\/demos\/advocacia\/(areas|artigos)\/[a-z-]+\/$/.test(h)), 'cada situação leva a uma área ou artigo');
  // áreas
  ok((await p.getAttribute('#aq-empresarial', 'aria-expanded')) === 'true', 'primeira área aberta');
  await p.click('#aq-familia'); await p.waitForTimeout(450);
  ok((await p.getAttribute('#aq-familia', 'aria-expanded')) === 'true' && (await p.getAttribute('#aq-empresarial', 'aria-expanded')) === 'false' && (await p.textContent('#ar-familia')).includes('Código de Processo Civil, art. 611'), 'abre Família (fecha a outra) com prazo e lei citada');
  // equipe
  ok((await p.$$('.pessoa')).length === 3 && await p.$$eval('.pessoa-foto img', i => i.every(x => getComputedStyle(x).filter.includes('grayscale'))), 'equipe com 3 retratos em preto e branco');
  await p.click('.pessoa:nth-child(1) .cv summary');
  ok((await p.textContent('.pessoa:nth-child(1) .cv')).includes('Mestrado em Direito Empresarial'), 'currículo abre com formação');
  ok((await p.$$('#lista-artigos .artigo-card')).length === 3 && (await p.textContent('#lista-artigos')).includes('min de leitura') && (await p.textContent('#lista-artigos')).includes('Por Helena Duarte'), 'artigos com autor e tempo de leitura');
  ok((await p.$$('.pubs li')).length === 3, 'publicações e palestras');
  // formulário
  await p.fill('#c-nome', 'Ana Lima'); await p.fill('#c-contato', 'ana@email.com'); await p.selectOption('#c-area', 'familia'); await p.fill('#c-msg', 'Quero revisar a pensão.');
  ok(await p.isDisabled('#c-enviar'), 'sem escolher presencial ou vídeo, não envia');
  await p.click('.opcoes label:has-text("Por vídeo")');
  ok(!(await p.isDisabled('#c-enviar')), 'com o modo escolhido, libera');
  await p.click('#c-enviar');
  const okt = await p.textContent('#c-ok');
  ok(await p.isVisible('#c-ok') && okt.includes('por vídeo') && okt.includes('Família e Sucessões') && okt.includes('nada foi enviado') && await p.evaluate(() => document.activeElement.id === 'c-ok-t'), 'pedido montado (por vídeo, assunto) e aviso de demonstração');
  ok(await p.$eval('#c-ok a', a => a.getAttribute('href') === '/demos/automacoes/escritorio-sem-papelada/'), 'link para a automação de documentos');
  ok((await p.textContent('#form-contato')).includes('Não envie documentos nem detalhes sigilosos'), 'aviso de sigilo no formulário');
  // janela e rodapé
  await p.click('a:has-text("(27) 0000-0000")'); ok(await p.isVisible('#janela'), 'telefone abre a janela de demonstração'); await p.keyboard.press('Escape');
  ok(await p.isHidden('#janela'), 'Esc fecha a janela');
  const rod = await p.textContent('.rodape');
  ok(rod.includes('OAB/ES 0.000') && rod.includes('CNPJ') && rod.includes('Provimento nº 205/2021'), 'rodapé com OAB, CNPJ e Provimento 205');
  ok(await p.$eval('.topo .idioma', a => a.getAttribute('href') === '/demos/advocacia/en/'), 'link para a versão em inglês');
  // página de área
  await p.goto(B + 'areas/trabalhista/', { waitUntil: 'networkidle' });
  const at = await p.evaluate(() => document.body.innerText);
  ok((await p.$$('.etapas li')).length === 4 && (await p.$$('.prazo')).length === 2 && at.includes('CLT, art. 477, § 6º') && at.includes('Constituição Federal, art. 7º, XXIX'), 'área: 4 etapas e prazos com a lei');
  ok((await p.$$('.pergunta')).length === 3, 'área: 3 dúvidas');
  await p.click('.pergunta:nth-of-type(3) summary');
  ok(await p.isVisible('.pergunta[open] p'), 'dúvida abre');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.lateral')).position === 'sticky'), 'lateral fixa ao rolar');
  await p.emulateMedia({ media: 'print' });
  ok(await p.evaluate(() => { const v = e => e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; return v(document.querySelector('.docs-print')) && v(document.querySelector('.docs-t')) && !v(document.querySelector('.topo')) && !v(document.querySelector('#etapas')) && !v(document.querySelector('.rodape')); }), 'impressão: só a lista de documentos, com título');
  await p.emulateMedia({ media: 'screen' });
  // artigo
  await p.goto(B + 'artigos/revisao-pensao/', { waitUntil: 'networkidle' });
  const ar = await p.evaluate(() => document.body.innerText);
  ok(ar.includes('Por Helena Duarte') && /Leitura de \d min/.test(ar) && /fontes/i.test(ar) && ar.includes('caráter informativo'), 'artigo com autor, tempo de leitura, fontes e aviso');
  // inglês
  await p.goto(B + 'en/', { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.documentElement.lang === 'en' && document.querySelector('.idioma').getAttribute('href') === '/demos/advocacia/') && (await p.textContent('h1')).includes('English'), 'versão em inglês com link de volta');
  ok(fora.length === 0, 'nada carregado de fora ' + JSON.stringify(fora));
  ok(errs.length === 0, 'console limpo ' + JSON.stringify(errs));
  await ctx.close();
  // celular
  ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => document.documentElement.scrollWidth === innerWidth), 'sem rolagem lateral no celular');
  ok(!(await p.evaluate(() => document.getElementById('barra-m').classList.contains('visivel'))), 'barra "Agendar" escondida no topo');
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#equipe').scrollIntoView(); }); await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.getElementById('barra-m').classList.contains('visivel')), 'barra aparece no meio da página');
  await p.click('.abre-menu'); ok(await p.isVisible('#gaveta a[href="#situacoes"]'), 'menu do celular abre');
  await ctx.close();
  // sem JS
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); p = await ctx.newPage();
  await p.goto(B, { waitUntil: 'networkidle' });
  ok(await p.evaluate(() => [...document.querySelectorAll('.revela')].every(e => getComputedStyle(e).opacity === '1') && document.querySelectorAll('.pessoa').length === 3 && getComputedStyle(document.querySelector('#ar-trabalhista > div')).visibility === 'visible'), 'sem JS: tudo visível, áreas abertas');
  await b.close(); console.log('falhas:', f);
})();
