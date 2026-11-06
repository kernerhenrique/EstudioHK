/* Orçamentos e obras · Respiga Marcenaria · demonstração da EstudioHK
   Orçamento por ambiente com medidas, PDF (CDC, art. 40), lembrete de retorno, serviços com etapas e clientes. Valores em centavos. */
(function () {
  'use strict';
  var S = window.SIS, $ = S.$, $$ = S.$$, esc = S.esc;
  var R = function (c) { return S.dinheiro(c / 100); };
  var CATS = ['Chapas e materiais', 'Ferragens', 'Mão de obra', 'Outros'];
  var UN = { m2: 'm²', m: 'metro', un: 'unidade' };
  var ST = { rascunho: 'Rascunho', enviado: 'Enviado', aprovado: 'Aprovado', recusado: 'Recusado', vencido: 'Vencido' };
  var ETAPAS = ['Medição técnica', 'Produção', 'Instalação', 'Concluído'];
  var dois = function (n) { return String(n).padStart(2, '0'); };
  var deIso = function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var iso = function (d) { return d.getFullYear() + '-' + dois(d.getMonth() + 1) + '-' + dois(d.getDate()); };
  var mais = function (s, n) { var d = deIso(s); d.setDate(d.getDate() + n); return iso(d); };
  var br = function (s) { return s ? s.split('-').reverse().join('/') : '—'; };
  var soma = function (a, f) { return a.reduce(function (t, x) { return t + f(x); }, 0); };
  var plural = function (n, um, varios) { return n + ' ' + (n === 1 ? um : varios); };
  var ico = function (id) { return '<svg class="ico" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
  var lerValor = function (t) { t = String(t).trim().replace(/[R$\s]/g, ''); if (!t) return 0; if (/,/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); var v = Math.round(parseFloat(t) * 100); return isFinite(v) ? v : NaN; };
  var fmtValor = function (c) { return (c / 100).toFixed(2).replace('.', ','); };
  var dec = function (x, casas) { return x.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }); };
  var primeiro = function (nome) { return nome.split(/[ ·(]/)[0]; };
  var res = function (rot, val, det) { return '<div class="res"><small>' + rot + '</small><b>' + val + '</b><span>' + det + '</span></div>'; };

  /* ---------- dados de exemplo (recriados a cada dia, com datas relativas a hoje) ---------- */
  function semente() {
    var d = { prox: 1048, proxId: 1, clientes: [], catalogo: [], orcs: [], servs: [] };
    var H = function (n) { return S.dia(n); };
    var C = function (id, nome, cat, un, preco, ativo) { d.catalogo.push({ id: id, nome: nome, cat: cat, un: un, preco: preco, ativo: ativo !== false }); };
    C('arm-branco', 'Armário em MDF branco (caixa e portas)', 'Chapas e materiais', 'm2', 115000);
    C('arm-amad', 'Armário em MDF amadeirado (caixa e portas)', 'Chapas e materiais', 'm2', 138000);
    C('ripado', 'Painel ripado em MDF amadeirado', 'Chapas e materiais', 'm2', 69000);
    C('bancada', 'Bancada em MDF com fita de borda', 'Chapas e materiais', 'm', 52000);
    C('prateleira', 'Prateleira em MDF 18 mm', 'Chapas e materiais', 'm', 14000);
    C('dobradica', 'Dobradiça com amortecedor', 'Ferragens', 'un', 2800);
    C('corredica', 'Corrediça telescópica com amortecedor (par)', 'Ferragens', 'un', 9500);
    C('puxador', 'Puxador perfil em alumínio', 'Ferragens', 'm', 8500);
    C('led', 'Fita de LED com perfil', 'Ferragens', 'm', 12000);
    C('montagem', 'Montagem e instalação', 'Mão de obra', 'm2', 18000);
    C('projeto', 'Projeto 3D com 2 revisões', 'Mão de obra', 'un', 45000);
    C('desmontagem', 'Desmontagem de móvel antigo', 'Mão de obra', 'un', 25000);
    C('espelho', 'Espelho com bisotê', 'Outros', 'm2', 48000);
    C('nicho', 'Nicho com iluminação de LED', 'Outros', 'un', 38000);
    C('vidro', 'Tampo de vidro temperado', 'Outros', 'm2', 52000, false);
    var cat = {}; d.catalogo.forEach(function (i) { cat[i.id] = i; });
    var L = function (id, x, y, q) { var i = cat[id], l = { id: id, nome: i.nome, un: i.un, preco: i.preco, tipo: i.cat === 'Mão de obra' ? 'mao' : 'mat', l: 0, a: 0, c: 0, q: 1 }; if (i.un === 'm2') { l.l = x; l.a = y; l.q = q || 1; } else if (i.un === 'm') { l.c = x; l.q = y || 1; } else l.q = x; return l; };
    var A = function (nome, linhas) { return { nome: nome, linhas: linhas }; };
    var AMB = {
      cozinha: function () { return A('Cozinha', [L('arm-amad', 240, 70), L('arm-branco', 240, 85), L('bancada', 240), L('puxador', 480), L('dobradica', 12), L('corredica', 3), L('led', 240), L('montagem', 240, 155)]); },
      area: function () { return A('Área de serviço', [L('arm-branco', 160, 220), L('dobradica', 6), L('montagem', 160, 220)]); },
      casal: function () { return A('Quarto do casal', [L('arm-amad', 300, 260), L('corredica', 4), L('dobradica', 10), L('puxador', 520), L('espelho', 60, 160), L('montagem', 300, 260)]); },
      home: function () { return A('Home office', [L('bancada', 180), L('prateleira', 180, 3), L('arm-branco', 180, 60), L('nicho', 1), L('montagem', 180, 60)]); },
      banheiro: function () { return A('Banheiro', [L('arm-branco', 120, 60), L('espelho', 120, 80), L('dobradica', 4), L('montagem', 120, 60)]); },
      sala: function () { return A('Sala', [L('ripado', 280, 260), L('arm-amad', 280, 50), L('led', 280), L('corredica', 2), L('montagem', 280, 260)]); },
      closet: function () { return A('Closet', [L('arm-branco', 350, 260), L('corredica', 6), L('prateleira', 350, 4), L('led', 350), L('montagem', 350, 260)]); },
      varanda: function () { return A('Varanda gourmet', [L('arm-amad', 220, 85), L('bancada', 220), L('dobradica', 6), L('montagem', 220, 85)]); },
      lavabo: function () { return A('Lavabo', [L('arm-amad', 80, 50), L('espelho', 80, 100), L('montagem', 80, 50)]); },
      bebe: function () { return A('Quarto do bebê', [L('arm-branco', 200, 240), L('prateleira', 120, 2), L('dobradica', 8), L('montagem', 200, 240)]); }
    };
    var K = function (nome, tel, end) { var c = { id: d.proxId++, nome: nome, tel: tel, end: end }; d.clientes.push(c); return c.id; };
    var mariana = K('Mariana Couto', '(27) 99999-0143', 'Rua Exemplo, 120, ap. 502 · Praia do Canto');
    var rafael = K('Rafael Lima', '(27) 99999-0144', 'Rua Exemplo, 88 · Jardim da Penha');
    var beatriz = K('Beatriz Santos', '(27) 99999-0145', 'Av. Exemplo, 1500, ap. 1203 · Mata da Praia');
    var carlos = K('Carlos Menezes', '(27) 99999-0140', 'Rua Exemplo, 15 · Bento Ferreira');
    var juliana = K('Juliana Prado', '(27) 99999-0141', 'Rua Exemplo, 400, casa 3 · Jardim Camburi');
    var taipa = K('Taipa Arquitetura · Apto 801', '(27) 99999-0138', 'Rua Exemplo, 77, ap. 801 · Praia do Canto');
    var fernanda = K('Fernanda Alves', '(27) 99999-0136', 'Rua Exemplo, 230 · Santa Lúcia');
    var pedro = K('Pedro Vieira', '(27) 99999-0142', 'Rua Exemplo, 9, ap. 302 · Enseada do Suá');
    var O = function (n, cli, ambs, o) {
      var x = { id: d.proxId++, n: n, rev: o.rev || 1, cli: cli, criado: H(o.criado), enviado: o.enviado === undefined ? '' : H(o.enviado), status: o.status, motivo: o.motivo || '', respondido: o.resp === undefined ? '' : H(o.resp), cobrado: '',
        validade: 10, amb: ambs.map(function (k) { return AMB[k](); }), frete: o.frete === undefined ? 25000 : o.frete, desc: o.desc || { t: '%', v: 0 }, inicio: H(o.inicio), termino: H(o.termino), entrada: o.entrada === undefined ? 40 : o.entrada, parcelas: o.parcelas || 3, obs: o.obs || 'Cores e acabamentos conforme o projeto 3D aprovado. Medidas finais confirmadas na medição técnica.' };
      if (o.projeto) x.amb[0].linhas.push(L('projeto', 1));
      d.orcs.push(x); return x;
    };
    var o36 = O(1036, fernanda, ['closet'], { criado: -34, enviado: -33, resp: -32, status: 'aprovado', inicio: -30, termino: -3, projeto: true });
    var o38 = O(1038, taipa, ['cozinha', 'area'], { criado: -24, enviado: -23, resp: -21, status: 'aprovado', inicio: -19, termino: 2, entrada: 50, parcelas: 2, desc: { t: '%', v: 5 }, obs: 'Projeto da Taipa Arquitetura (arquiteta responsável: Lia). Instalação combinada com a obra do apartamento.' });
    O(1039, rafael, ['lavabo'], { criado: -20, enviado: -19, resp: -15, status: 'recusado', motivo: 'Prazo', inicio: -12, termino: 8 });
    O(1040, carlos, ['banheiro'], { criado: -15, enviado: -14, status: 'enviado', inicio: -4, termino: 14 });
    var o41 = O(1041, juliana, ['sala'], { criado: -13, enviado: -12, resp: -10, status: 'aprovado', inicio: -8, termino: 7, projeto: true });
    O(1042, pedro, ['varanda'], { criado: -10, enviado: -9, resp: -6, status: 'recusado', motivo: 'Preço', inicio: 2, termino: 24 });
    O(1043, mariana, ['cozinha', 'area'], { criado: -5, enviado: -4, status: 'enviado', inicio: 10, termino: 40, projeto: true });
    O(1044, rafael, ['casal'], { criado: -2, enviado: -1, status: 'enviado', inicio: 12, termino: 35 });
    O(1045, beatriz, ['home'], { criado: -10, enviado: -9, status: 'enviado', inicio: 6, termino: 22, frete: 15000 });
    O(1046, juliana, ['bebe'], { criado: -1, status: 'rascunho', inicio: 15, termino: 40 });
    O(1040, carlos, ['banheiro'], { rev: 2, criado: 0, status: 'rascunho', inicio: 7, termino: 25, desc: { t: '%', v: 5 }, obs: 'Revisão do orçamento nº 1040 com 5% de desconto e novo prazo.' });
    // serviços dos aprovados
    var V = function (o, etapa, datas, pags) { d.servs.push({ id: d.proxId++, orc: o.id, etapa: etapa, datas: datas.map(H), pags: pags.map(function (p) { return { valor: p[0], forma: p[1], data: H(p[2]) }; }) }); o.serv = d.servs[d.servs.length - 1].id; };
    var t36 = calc(o36).total, t38 = calc(o38).total, t41 = calc(o41).total;
    V(o36, 3, [-29, -26, -5, -3], [[Math.round(t36 * .4), 'Pix', -32], [Math.round(t36 * .2), 'Transferência', -18]]);
    V(o38, 2, [-19, -16, 1, 2], [[Math.round(t38 * .5), 'Transferência', -21], [Math.round(t38 * .25), 'Pix', -6]]);
    V(o41, 1, [-8, -5, 6, 7], [[Math.round(t41 * .4), 'Pix', -10]]);
    return d;
  }

  /* ---------- cálculos ---------- */
  function qtd(l) { return l.un === 'm2' ? l.l * l.a / 1e4 * l.q : l.un === 'm' ? l.c / 100 * l.q : l.q; }
  function valor(l) { return Math.round(qtd(l) * l.preco); }
  function qtdTxt(l) { return l.un === 'm2' ? dec(qtd(l), 2) + ' m²' : l.un === 'm' ? dec(qtd(l), 2) + ' m' : plural(l.q, 'un', 'un'); }
  function medTxt(l) { return l.un === 'm2' ? l.l + ' × ' + l.a + ' cm' + (l.q > 1 ? ' · ' + l.q + ' peças' : '') : l.un === 'm' ? l.c + ' cm' + (l.q > 1 ? ' · ' + l.q + ' peças' : '') : '—'; }
  function calc(o) {
    var linhas = [].concat.apply([], o.amb.map(function (a) { return a.linhas; }));
    var mat = soma(linhas.filter(function (l) { return l.tipo === 'mat'; }), valor), mao = soma(linhas.filter(function (l) { return l.tipo === 'mao'; }), valor);
    var sub = mat + mao, desc = o.desc.t === '%' ? Math.round(sub * Math.min(100, o.desc.v) / 100) : Math.min(sub, o.desc.v);
    var total = sub - desc + o.frete, entrada = Math.round(total * o.entrada / 100), resto = total - entrada;
    return { mat: mat, mao: mao, sub: sub, desc: desc, total: total, entrada: entrada, parcela: o.parcelas ? Math.round(resto / o.parcelas) : resto, itens: linhas.length };
  }
  var validoAte = function (o) { return o.enviado ? mais(o.enviado, o.validade) : ''; };
  var situacao = function (o) { return o.status === 'enviado' && S.entre(validoAte(o), S.hoje) > 0 ? 'vencido' : o.status; };
  function retorno(o) {
    if (situacao(o) !== 'enviado') return '';
    var dias = S.entre(o.enviado, S.hoje), falta = S.entre(S.hoje, validoAte(o));
    if (falta <= 2) return falta === 0 ? 'Vence hoje' : falta === 1 ? 'Vence amanhã (' + S.curta(validoAte(o)) + ')' : 'Vence em 2 dias (' + S.curta(validoAte(o)) + ')';
    if (dias >= 3) return 'Enviado há ' + dias + ' dias, sem resposta';
    return '';
  }

  var G = S.guarda('estudiohk-sis-orcamento-v1', semente, true);
  var D = function () { return G.d; };
  var cli = function (id) { return D().clientes.filter(function (c) { return c.id === id; })[0]; };
  var orc = function (id) { return D().orcs.filter(function (o) { return o.id === id; })[0]; };
  var serv = function (id) { return D().servs.filter(function (s) { return s.id === id; })[0]; };
  var itemCat = function (id) { return D().catalogo.filter(function (i) { return i.id === id; })[0]; };
  var numero = function (o) { return 'nº ' + o.n + (o.rev > 1 ? ' · revisão ' + o.rev : ''); };
  var ambNomes = function (o) { return o.amb.map(function (a) { return a.nome; }).join(', ') || 'sem ambientes'; };
  var nomeCli = function (o) { var c = cli(o.cli); return c ? c.nome : 'Cliente não escolhido'; };
  var etqSit = function (o) { var s = situacao(o); return '<span class="etq s-' + s + '">' + ST[s] + '</span>'; };
  var recebido = function (s) { return soma(s.pags, function (p) { return p.valor; }); };
  var saldo = function (s) { return Math.max(0, calc(orc(s.orc)).total - recebido(s)); };
  var nos30 = function (o) { return o.enviado && S.entre(o.enviado, S.hoje) <= 30; };
  function salva() { G.salva(); desenha(); }

  /* ---------- mensagens do WhatsApp ---------- */
  function msgEnvio(o) { var k = calc(o); return 'Olá, ' + primeiro(nomeCli(o)) + '! Aqui é o André, da Respiga Marcenaria. Segue o orçamento ' + numero(o) + ' (' + ambNomes(o).toLowerCase() + '):\nTotal: ' + R(k.total) + (o.entrada ? ', com entrada de ' + o.entrada + '% e o restante em ' + o.parcelas + '×' : '') + '.\nPrazo: de ' + br(o.inicio) + ' a ' + br(o.termino) + '.\nO orçamento vale por ' + o.validade + ' dias.\n[link do PDF]'; }
  function msgCobrar(o) { return 'Olá, ' + primeiro(nomeCli(o)) + '! Tudo bem? Passando para saber se você conseguiu ver o orçamento ' + numero(o) + ' (' + ambNomes(o).toLowerCase() + '). Se quiser ajustar alguma medida ou acabamento, é só me falar. Ele vale até ' + S.curta(validoAte(o)) + '.'; }
  function msgEtapa(s) { var o = orc(s.orc);
    var t = ['A medição técnica está marcada para ' + br(s.datas[0]) + '.', 'Os móveis entraram em produção. A instalação está marcada para ' + br(s.datas[2]) + '.', 'A instalação começa em ' + br(s.datas[2]) + '. A equipe chega às 8h.', 'Serviço concluído! Obrigado pela confiança. Se precisar de qualquer ajuste, é só chamar.'][s.etapa];
    return 'Olá, ' + primeiro(nomeCli(o)) + '! Aqui é o André, da Respiga. Notícias do seu projeto (' + ambNomes(o).toLowerCase() + '): ' + t; }

  /* ---------- tela: início ---------- */
  function desenhaInicio() {
    var os = D().orcs, env = os.filter(nos30), ap = env.filter(function (o) { return o.status === 'aprovado'; });
    var decididos = env.filter(function (o) { var s = situacao(o); return s === 'aprovado' || s === 'recusado' || s === 'vencido'; });
    var aReceber = soma(D().servs, saldo);
    $('#resumo-inicio').innerHTML = res('Enviados (30 dias)', env.length, plural(env.filter(function (o) { return situacao(o) === 'enviado'; }).length, 'aguardando resposta', 'aguardando resposta')) +
      res('Valor aprovado', R(soma(ap, function (o) { return calc(o).total; })), plural(ap.length, 'orçamento', 'orçamentos') + ' em 30 dias') +
      res('Taxa de aprovação', (decididos.length ? Math.round(ap.length / decididos.length * 100) : 0) + '%', ap.length + ' de ' + plural(decididos.length, 'decidido', 'decididos')) +
      res('A receber das obras', R(aReceber), plural(D().servs.filter(function (s) { return saldo(s) > 0; }).length, 'serviço com saldo', 'serviços com saldo'));
    var rt = os.filter(retorno).sort(function (a, b) { return a.enviado < b.enviado ? -1 : 1; });
    $('#retornos').innerHTML = rt.length ? rt.map(function (o) {
      return '<li><div><b>' + esc(nomeCli(o)) + '</b><span class="dica"> · ' + numero(o) + '</span><span class="r-amb">' + esc(ambNomes(o)) + ' · ' + R(calc(o).total) + '</span><span class="etq ' + (/Vence/.test(retorno(o)) ? 'alerta' : 's-enviado') + '">' + retorno(o) + '</span>' + (o.cobrado === S.hoje ? ' <span class="etq ok">' + ico('check') + 'Cobrado hoje</span>' : '') + '</div>' +
        '<div class="r-acoes"><button class="btn btn-p btn-sm" type="button" data-cobrar="' + o.id + '">' + ico('zap') + 'Cobrar resposta<span class="sr"> de ' + esc(nomeCli(o)) + '</span></button><button class="btn btn-s btn-sm" type="button" data-abrir="' + o.id + '">Abrir<span class="sr"> o orçamento ' + numero(o) + '</span></button></div></li>';
    }).join('') : '<li class="vazio">Nenhum orçamento esperando retorno. Tudo em dia.</li>';
    var ag = [];
    D().servs.forEach(function (s) { if (s.etapa >= 3) return; var o = orc(s.orc);
      [[0, 'Medição técnica'], [2, 'Instalação'], [3, 'Entrega']].forEach(function (x) { if (x[0] >= s.etapa && S.entre(S.hoje, s.datas[x[0]]) >= 0 && S.entre(S.hoje, s.datas[x[0]]) <= 14) ag.push({ data: s.datas[x[0]], o: o, txt: x[1] }); });
    });
    ag.sort(function (a, b) { return a.data < b.data ? -1 : 1; });
    $('#agenda').innerHTML = ag.length ? ag.map(function (a) { var dd = S.entre(S.hoje, a.data); return '<li><span class="ag-data"><b>' + (dd === 0 ? 'Hoje' : dd === 1 ? 'Amanhã' : S.semana(a.data).slice(0, 3)) + '</b>' + S.curta(a.data) + '</span><span><b>' + a.txt + '</b>' + esc(nomeCli(a.o)) + ' · ' + esc(ambNomes(a.o)) + '</span></li>'; }).join('') : '<li class="vazio">Nenhuma etapa nos próximos 14 dias.</li>';
    var cont = {}; Object.keys(ST).forEach(function (k) { cont[k] = 0; }); os.filter(function (o) { return S.entre(o.criado, S.hoje) <= 30; }).forEach(function (o) { cont[situacao(o)]++; });
    var max = Math.max.apply(null, Object.keys(cont).map(function (k) { return cont[k]; }).concat([1]));
    $('#funil').innerHTML = '<ul>' + Object.keys(ST).map(function (k) { return '<li><span class="b-rot">' + ST[k] + '</span><span class="b-trilho" aria-hidden="true"><i class="s-' + k + '" style="width:' + (cont[k] / max * 100).toFixed(1) + '%"></i></span><span class="b-val">' + cont[k] + '</span></li>'; }).join('') + '</ul>';
  }

  /* ---------- tela: orçamentos ---------- */
  var filtro = 'todos';
  function desenhaOrcs() {
    var os = D().orcs.slice().sort(function (a, b) { return b.n - a.n || b.rev - a.rev; }), busca = $('#busca').value.trim().toLowerCase();
    var cont = { todos: os.length }; Object.keys(ST).forEach(function (k) { cont[k] = os.filter(function (o) { return situacao(o) === k; }).length; });
    $('#filtros').innerHTML = ['todos'].concat(Object.keys(ST)).map(function (k) { return '<button type="button" data-filtro="' + k + '" aria-pressed="' + (filtro === k) + '">' + (k === 'todos' ? 'Todos' : ST[k]) + ' <span class="f-n">' + cont[k] + '</span></button>'; }).join('');
    var lista = os.filter(function (o) { return (filtro === 'todos' || situacao(o) === filtro) && (!busca || (nomeCli(o) + ' ' + ambNomes(o) + ' ' + o.n).toLowerCase().indexOf(busca) >= 0); });
    $('#lista-orcs').innerHTML = lista.length ? lista.map(function (o) {
      var s = situacao(o), quando = o.status === 'rascunho' ? 'criado em ' + S.curta(o.criado) : s === 'aprovado' || s === 'recusado' ? (s === 'aprovado' ? 'aprovado em ' : 'recusado em ') + S.curta(o.respondido) : 'enviado em ' + S.curta(o.enviado);
      return '<tr><td class="principal" data-rot="Nº"><b>' + o.n + '</b>' + (o.rev > 1 ? '<span class="dica"> · rev. ' + o.rev + '</span>' : '') + '</td><td data-rot="Cliente"><span class="o-cli"><b>' + esc(nomeCli(o)) + '</b><span class="dica">' + esc(ambNomes(o)) + ' · ' + quando + '</span></span></td>' +
        '<td data-rot="Situação">' + etqSit(o) + (s === 'recusado' ? '<span class="dica"> ' + esc(o.motivo) + '</span>' : '') + (retorno(o) ? ' <span class="etq alerta">' + ico('sino') + 'Retorno</span>' : '') + '</td><td class="num" data-rot="Total">' + R(calc(o).total) + '</td>' +
        '<td class="acao"><button class="btn btn-s btn-sm" type="button" data-abrir="' + o.id + '">' + ico(o.status === 'rascunho' || o.status === 'enviado' ? 'editar' : 'doc') + 'Abrir<span class="sr"> o orçamento ' + numero(o) + '</span></button><button class="btn btn-s btn-sm btn-ico" type="button" data-duplicar="' + o.id + '" aria-label="Duplicar o orçamento ' + numero(o) + ' como revisão">' + ico('copia') + '</button></td></tr>';
    }).join('') : '<tr><td class="vazio" colspan="5">Nenhum orçamento com esse filtro.</td></tr>';
  }
  $('#filtros').addEventListener('click', function (e) { var b = e.target.closest('[data-filtro]'); if (!b) return; filtro = b.dataset.filtro; desenhaOrcs(); $('[data-filtro="' + filtro + '"]').focus(); });
  $('#busca').addEventListener('input', desenhaOrcs);

  /* ---------- editor ---------- */
  var ed = null, aba = 'editar';
  var travado = function (o) { return o.status === 'aprovado' || o.status === 'recusado'; };
  $('#ed-parcelas').innerHTML = [1, 2, 3, 4, 5, 6, 8, 10].map(function (n) { return '<option value="' + n + '">' + (n === 1 ? '1 vez (à vista na entrega)' : n + ' parcelas') + '</option>'; }).join('');
  function opcoesCli(sel) { $('#ed-cliente').innerHTML = '<option value="">Escolha o cliente</option>' + D().clientes.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome); }).map(function (c) { return '<option value="' + c.id + '"' + (c.id === sel ? ' selected' : '') + '>' + esc(c.nome) + '</option>'; }).join(''); }
  function opcoesItens() { return '<option value="">Escolha um item do catálogo</option>' + CATS.map(function (c) { var its = D().catalogo.filter(function (i) { return i.cat === c && i.ativo; }); return its.length ? '<optgroup label="' + c + '">' + its.map(function (i) { return '<option value="' + i.id + '">' + esc(i.nome) + ' · ' + R(i.preco) + '/' + (i.un === 'm2' ? 'm²' : i.un === 'm' ? 'm' : 'un') + '</option>'; }).join('') + '</optgroup>' : ''; }).join(''); }
  function campoNum(a, j, k, rot, v) { var id = 'l-' + a + '-' + j + '-' + k; return '<span class="mini' + (k === 'c' ? ' largo' : '') + '"><label for="' + id + '">' + rot + '</label><input id="' + id + '" type="number" min="0" inputmode="numeric" data-k="' + k + '" value="' + v + '"></span>'; }
  function desenhaAmbientes(focar) {
    $('#ed-ambientes').innerHTML = ed.amb.map(function (a, i) {
      return '<div class="amb" data-a="' + i + '"><div class="amb-topo"><div class="campo"><label for="amb-' + i + '">Ambiente</label><input id="amb-' + i + '" data-amb="' + i + '" value="' + esc(a.nome) + '" autocomplete="off"></div><button class="btn btn-s btn-ico" type="button" data-rm-amb="' + i + '" aria-label="Remover o ambiente ' + esc(a.nome) + '">' + ico('lixo') + '</button></div>' +
        '<ul class="linhas">' + a.linhas.map(function (l, j) {
          var med = l.un === 'm2' ? campoNum(i, j, 'l', 'Largura (cm)', l.l) + campoNum(i, j, 'a', 'Altura (cm)', l.a) + campoNum(i, j, 'q', 'Peças', l.q) : l.un === 'm' ? campoNum(i, j, 'c', 'Comprimento (cm)', l.c) + campoNum(i, j, 'q', 'Peças', l.q) : campoNum(i, j, 'q', 'Quantidade', l.q);
          return '<li class="linha" data-l="' + j + '"><div class="l-nome"><b>' + esc(l.nome) + '</b><span class="dica">' + R(l.preco) + ' por ' + UN[l.un] + (l.tipo === 'mao' ? ' · mão de obra' : '') + '</span></div><div class="l-med">' + med + '</div>' +
            '<div class="l-calc"><span class="l-qtd">' + qtdTxt(l) + '</span><b class="l-val">' + R(valor(l)) + '</b></div><button class="btn btn-s btn-ico l-rm" type="button" data-rm-l aria-label="Tirar ' + esc(l.nome) + ' de ' + esc(a.nome) + '">' + ico('x') + '</button></li>';
        }).join('') + '</ul>' + (a.linhas.length ? '' : '<p class="dica-bloco amb-vazio">Nenhum item neste ambiente ainda.</p>') +
        '<div class="amb-add"><label class="sr" for="add-' + i + '">Item para adicionar em ' + esc(a.nome) + '</label><select id="add-' + i + '">' + opcoesItens() + '</select><button class="btn btn-s" type="button" data-add="' + i + '">' + ico('mais') + 'Adicionar item</button></div>' +
        '<p class="amb-sub">Subtotal de ' + esc(a.nome) + ': <b>' + R(soma(a.linhas, valor)) + '</b></p></div>';
    }).join('');
    if (focar) { var el = $(focar); if (el) el.focus(); }
  }
  function folha(o) {
    var k = calc(o), c = cli(o.cli) || { nome: '—', tel: '', end: '' };
    return '<header class="f-cab"><div class="f-marca"><svg aria-hidden="true"><use href="#logo-r"/></svg><div><b>Respiga Marcenaria</b><span>Móveis sob medida · CNPJ 00.000.000/0001-00</span><span>Rua Exemplo, 300 · Vitória/ES · (27) 0000-0000</span></div></div>' +
      '<div class="f-num"><small>Orçamento</small><b>' + o.n + (o.rev > 1 ? '-R' + o.rev : '') + '</b><span>Emitido em ' + br(o.enviado || o.criado) + '</span></div></header>' +
      '<div class="f-cli"><div><small>Cliente</small><b>' + esc(c.nome) + '</b></div><div><small>WhatsApp</small>' + esc(c.tel || '—') + '</div><div class="f-end"><small>Endereço da obra</small>' + esc(c.end || '—') + '</div></div>' +
      o.amb.map(function (a) {
        return '<h3 class="f-amb">' + esc(a.nome) + '</h3><table class="f-tab"><thead><tr><th>Item</th><th>Medidas</th><th class="n">Qtd.</th><th class="n">Preço</th><th class="n">Total</th></tr></thead><tbody>' +
          (a.linhas.length ? a.linhas.map(function (l) { return '<tr><td>' + esc(l.nome) + (l.tipo === 'mao' ? ' <i>(mão de obra)</i>' : '') + '</td><td>' + medTxt(l) + '</td><td class="n">' + qtdTxt(l) + '</td><td class="n">' + R(l.preco) + '</td><td class="n">' + R(valor(l)) + '</td></tr>'; }).join('') : '<tr><td colspan="5">—</td></tr>') +
          '</tbody></table>';
      }).join('') +
      '<div class="f-baixo"><div class="f-cond">' +
      '<p><b>Condições de pagamento:</b> ' + (o.entrada ? 'entrada de ' + o.entrada + '% (' + R(k.entrada) + ') na aprovação e o restante em ' + (o.parcelas === 1 ? '1 vez, na entrega' : o.parcelas + ' parcelas de ' + R(k.parcela)) : (o.parcelas === 1 ? 'à vista, na entrega' : o.parcelas + ' parcelas de ' + R(k.parcela))) + '.</p>' +
      '<p><b>Prazo:</b> início em ' + br(o.inicio) + ' e término em ' + br(o.termino) + '.</p>' +
      '<p><b>Validade:</b> ' + o.validade + ' dias a partir do recebimento' + (o.enviado ? ' (enviado em ' + br(o.enviado) + ', válido até ' + br(validoAte(o)) + ')' : '') + '. Depois de aprovado, este orçamento só muda em comum acordo entre as partes.</p>' +
      (o.obs ? '<p><b>Observações:</b> ' + esc(o.obs) + '</p>' : '') + '</div>' +
      '<dl class="f-tot"><div><dt>Materiais e equipamentos</dt><dd>' + R(k.mat) + '</dd></div><div><dt>Mão de obra</dt><dd>' + R(k.mao) + '</dd></div>' + (k.desc ? '<div><dt>Desconto' + (o.desc.t === '%' ? ' (' + dec(o.desc.v, 0) + '%)' : '') + '</dt><dd>− ' + R(k.desc) + '</dd></div>' : '') + '<div><dt>Frete</dt><dd>' + R(o.frete) + '</dd></div><div class="f-total"><dt>Total</dt><dd>' + R(k.total) + '</dd></div></dl></div>' +
      '<div class="f-aceite"><span>De acordo: ______________________________</span><span>Data: ____/____/______</span></div>' +
      '<footer class="f-rod">Documento de demonstração · negócio fictício criado pela EstudioHK · Valores conforme o Código de Defesa do Consumidor, art. 40.</footer>';
  }
  function atualizaCalc() {
    var k = calc(ed);
    $('#ed-pag-calc').textContent = ed.entrada ? 'Entrada de ' + R(k.entrada) + ' e o restante em ' + (ed.parcelas === 1 ? '1 vez de ' + R(k.total - k.entrada) : ed.parcelas + '× de ' + R(k.parcela)) + '. Total: ' + R(k.total) + '.' : (ed.parcelas === 1 ? 'À vista: ' + R(k.total) : ed.parcelas + '× de ' + R(k.parcela)) + '. Total: ' + R(k.total) + '.';
    var html = folha(ed); $('#folha').innerHTML = html; $('#impressao').innerHTML = '<div class="folha">' + html + '</div>';
    $('#ed-status').innerHTML = etqSit(ed) + ' <span class="dica">' + numero(ed) + ' · ' + R(k.total) + '</span>' + (travado(ed) ? '' : ' <span class="salvo">' + ico('check') + 'Salvo automaticamente</span>');
  }
  function acoesEditor() {
    var s = situacao(ed), b = [];
    b.push('<button class="btn btn-s" type="button" data-ed="pdf">' + ico('pdf') + 'Baixar PDF</button>');
    if (s === 'rascunho' || s === 'vencido') b.push('<button class="btn btn-p" type="button" data-ed="enviar">' + ico('zap') + (s === 'vencido' ? 'Reenviar com nova validade' : 'Enviar pelo WhatsApp') + '</button>');
    if (s === 'enviado') { b.push('<button class="btn btn-s" type="button" data-ed="enviar">' + ico('zap') + 'Reenviar</button>'); b.push('<button class="btn btn-s" type="button" data-ed="recusar">' + ico('x') + 'Recusado</button>'); b.push('<button class="btn btn-p" type="button" data-ed="aprovar">' + ico('check') + 'Aprovado</button>'); }
    if (s !== 'rascunho') b.push('<button class="btn btn-s" type="button" data-ed="duplicar">' + ico('copia') + 'Duplicar como revisão</button>');
    if (s === 'aprovado' && ed.serv) b.push('<button class="btn btn-s" type="button" data-ed="servico">' + ico('obra') + 'Ver serviço</button>');
    if (s === 'rascunho') b.push('<button class="btn btn-perigo" type="button" data-ed="excluir">Excluir rascunho</button>');
    $('#ed-acoes').innerHTML = b.join('');
  }
  function abreEditor(o, foco) {
    ed = o; aba = 'editar';
    $$('[data-tela]').forEach(function (t) { t.hidden = true; }); $('#editor').hidden = false; $('#editor').dataset.aba = 'editar';
    $$('[data-so-em]').forEach(function (x) { x.hidden = true; });
    $$('.ed-abas [data-aba]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.aba === 'editar'); });
    $('#titulo').textContent = 'Orçamento ' + numero(o); $('#subtitulo').textContent = nomeCli(o) + ' · criado em ' + br(o.criado);
    var t = travado(o);
    $('#ed-campos').disabled = t; $('#ed-trava').hidden = !t;
    $('#ed-trava').innerHTML = ico('info') + (o.status === 'aprovado' ? 'Aprovado em ' + br(o.respondido) + '. Depois de aprovado, o orçamento só muda em comum acordo (CDC, art. 40, § 2º). Para mudar algo, duplique como revisão.' : 'Recusado em ' + br(o.respondido) + ' (motivo: ' + esc(o.motivo) + '). Para tentar de novo, duplique como revisão.');
    opcoesCli(o.cli);
    $('#ed-frete').value = fmtValor(o.frete); $('#ed-desc').value = o.desc.t === '%' ? String(o.desc.v).replace('.', ',') : fmtValor(o.desc.v); $('#ed-desc-tipo').value = o.desc.t;
    $('#ed-inicio').value = o.inicio; $('#ed-termino').value = o.termino; $('#ed-entrada').value = String(o.entrada); $('#ed-parcelas').value = String(o.parcelas); $('#ed-validade').value = o.validade; $('#ed-obs').value = o.obs;
    $('#e-datas').hidden = true; $('#ed-cliente').removeAttribute('aria-invalid');
    desenhaAmbientes(); atualizaCalc(); acoesEditor(); scrollTo(0, 0);
    (foco ? $(foco) : $('#titulo')).focus();
  }
  function fechaEditor() {
    if (ed && ed.status === 'rascunho' && !calc(ed).itens && !ed.cli) D().orcs = D().orcs.filter(function (x) { return x !== ed; });
    ed = null; $('#editor').hidden = true; G.salva();
  }
  function novoOrc(cliId, base) {
    var d = D(), hoje = S.hoje, o;
    if (base) { o = JSON.parse(JSON.stringify(base)); o.id = d.proxId++; o.rev = Math.max.apply(null, d.orcs.filter(function (x) { return x.n === base.n; }).map(function (x) { return x.rev; })) + 1; delete o.serv; }
    else o = { id: d.proxId++, n: d.prox++, rev: 1, cli: cliId || 0, amb: [{ nome: 'Cozinha', linhas: [] }], frete: 25000, desc: { t: '%', v: 0 }, inicio: mais(hoje, 10), termino: mais(hoje, 40), entrada: 40, parcelas: 3, validade: 10, obs: 'Cores e acabamentos conforme o projeto 3D aprovado. Medidas finais confirmadas na medição técnica.' };
    o.criado = hoje; o.enviado = ''; o.status = 'rascunho'; o.motivo = ''; o.respondido = ''; o.cobrado = '';
    d.orcs.push(o); G.salva(); return o;
  }
  function voltaLista() { fechaEditor(); vaiTela('orcamentos', true); }
  $('#ed-voltar').addEventListener('click', voltaLista);
  $('#novo-orc').addEventListener('click', function () { abreEditor(novoOrc(0), '#ed-cliente'); S.aviso('Novo orçamento ' + D().orcs[D().orcs.length - 1].n + ' criado como rascunho.'); });
  $$('.ed-abas [data-aba]').forEach(function (b) { b.addEventListener('click', function () { aba = b.dataset.aba; $('#editor').dataset.aba = aba; $$('.ed-abas [data-aba]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }); });

  // mudanças nos campos
  function mudou() { if (!travado(ed)) { G.salva(); atualizaCalc(); } }
  $('#ed-cliente').addEventListener('change', function () { ed.cli = +this.value || 0; this.removeAttribute('aria-invalid'); $('#subtitulo').textContent = nomeCli(ed) + ' · criado em ' + br(ed.criado); mudou(); });
  $('#ed-frete').addEventListener('input', function () { var v = lerValor(this.value); ed.frete = v >= 0 ? v : 0; mudou(); });
  function desc() { var t = $('#ed-desc-tipo').value, v = t === '%' ? parseFloat(($('#ed-desc').value || '0').replace(',', '.')) : lerValor($('#ed-desc').value); ed.desc = { t: t, v: v >= 0 ? v : 0 }; mudou(); }
  $('#ed-desc').addEventListener('input', desc); $('#ed-desc-tipo').addEventListener('change', desc);
  $('#ed-inicio').addEventListener('change', function () { ed.inicio = this.value; datas(); });
  $('#ed-termino').addEventListener('change', function () { ed.termino = this.value; datas(); });
  function datas() { var mal = ed.inicio && ed.termino && ed.termino <= ed.inicio; $('#e-datas').hidden = !mal; $('#ed-termino').setAttribute('aria-invalid', mal ? 'true' : 'false'); mudou(); }
  $('#ed-entrada').addEventListener('change', function () { ed.entrada = +this.value; mudou(); });
  $('#ed-parcelas').addEventListener('change', function () { ed.parcelas = +this.value; mudou(); });
  $('#ed-validade').addEventListener('input', function () { var v = parseInt(this.value, 10); ed.validade = v > 0 ? Math.min(60, v) : 10; mudou(); });
  $('#ed-obs').addEventListener('input', function () { ed.obs = this.value; mudou(); });
  $('#ed-ambientes').addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset.amb !== undefined) { ed.amb[+t.dataset.amb].nome = t.value; mudou(); return; }
    var li = t.closest('.linha'); if (!li || !t.dataset.k) return;
    var a = +t.closest('.amb').dataset.a, l = ed.amb[a].linhas[+li.dataset.l], v = parseInt(t.value, 10);
    l[t.dataset.k] = v > 0 ? v : 0;
    $('.l-qtd', li).textContent = qtdTxt(l); $('.l-val', li).textContent = R(valor(l));
    $('.amb-sub b', t.closest('.amb')).textContent = R(soma(ed.amb[a].linhas, valor));
    mudou();
  });
  $('#ed-ambientes').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || travado(ed)) return;
    var amb = b.closest('.amb'), a = amb ? +amb.dataset.a : -1;
    if (b.dataset.add !== undefined) {
      var sel = $('#add-' + a), it = itemCat(sel.value); if (!it) { sel.focus(); S.aviso('Escolha um item do catálogo para adicionar.'); return; }
      var l = { id: it.id, nome: it.nome, un: it.un, preco: it.preco, tipo: it.cat === 'Mão de obra' ? 'mao' : 'mat', l: 0, a: 0, c: 0, q: 1 };
      if (it.un === 'm2') { l.l = 100; l.a = 100; } if (it.un === 'm') l.c = 100;
      ed.amb[a].linhas.push(l); G.salva(); desenhaAmbientes('#l-' + a + '-' + (ed.amb[a].linhas.length - 1) + '-' + (it.un === 'm2' ? 'l' : it.un === 'm' ? 'c' : 'q')); atualizaCalc();
      S.aviso(it.nome + ' adicionado em ' + ed.amb[a].nome + '.');
    } else if (b.hasAttribute('data-rm-l')) {
      var j = +b.closest('.linha').dataset.l, nome = ed.amb[a].linhas[j].nome; ed.amb[a].linhas.splice(j, 1); G.salva(); desenhaAmbientes('#add-' + a); atualizaCalc(); S.aviso(nome + ' retirado.');
    } else if (b.dataset.rmAmb !== undefined) {
      var am = ed.amb[a];
      var tira = function () { ed.amb.splice(a, 1); G.salva(); desenhaAmbientes('#ed-add-amb'); $('#ed-add-amb').focus(); atualizaCalc(); S.aviso('Ambiente ' + am.nome + ' removido.'); };
      if (am.linhas.length) S.confirma('O ambiente ' + am.nome + ' e os ' + am.linhas.length + ' itens dele saem do orçamento.', tira); else tira();
    }
  });
  $('#ed-add-amb').addEventListener('click', function () { if (travado(ed)) return; ed.amb.push({ nome: 'Ambiente ' + (ed.amb.length + 1), linhas: [] }); G.salva(); var i = ed.amb.length - 1; desenhaAmbientes('#amb-' + i); $('#amb-' + i).select(); atualizaCalc(); });
  $('#ed-novo-cli').addEventListener('click', function () { abreCliente(null, true); });

  function podeEnviar() {
    if (!ed.cli) { $('#ed-cliente').setAttribute('aria-invalid', 'true'); $('#ed-cliente').focus(); S.aviso('Escolha o cliente antes de enviar.'); return false; }
    if (!calc(ed).itens) { var s = $('#add-0'); if (s) s.focus(); S.aviso('Adicione pelo menos um item antes de enviar.'); return false; }
    if (ed.termino <= ed.inicio) { $('#ed-termino').focus(); return false; }
    return true;
  }
  $('#ed-acoes').addEventListener('click', function (e) {
    var b = e.target.closest('[data-ed]'); if (!b) return;
    var acao = b.dataset.ed;
    if (acao === 'pdf') { atualizaCalc(); window.print(); }
    else if (acao === 'enviar') { if (!podeEnviar()) return; ed.status = 'enviado'; ed.enviado = S.hoje; G.salva(); abreEditor(ed, '[data-ed="pdf"]'); S.demo(msgEnvio(ed), 'Orçamento enviado ao cliente'); }
    else if (acao === 'recusar') { var j = $('#recusar'); j.onclose = function () { if (j.returnValue !== 'sim') return; j.returnValue = ''; ed.status = 'recusado'; ed.motivo = j.querySelector('input[name=motivo]:checked').value; ed.respondido = S.hoje; G.salva(); abreEditor(ed, '[data-ed="duplicar"]'); S.aviso('Orçamento marcado como recusado: ' + ed.motivo.toLowerCase() + '.'); }; S.abre(j); }
    else if (acao === 'aprovar') abreAprovar();
    else if (acao === 'duplicar') { var n = novoOrc(0, ed); abreEditor(n, '#titulo'); S.aviso('Revisão ' + n.rev + ' do orçamento ' + n.n + ' criada como rascunho. Ajuste e envie.'); }
    else if (acao === 'servico') { var sid = ed.serv; fechaEditor(); vaiTela('servicos'); var c = $('#sv-' + sid); if (c) c.focus(); }
    else if (acao === 'excluir') { var o = ed; S.confirma('O rascunho ' + numero(o) + ' será apagado.', function () { D().orcs = D().orcs.filter(function (x) { return x !== o; }); ed = null; $('#editor').hidden = true; G.salva(); vaiTela('orcamentos', true); S.aviso('Rascunho apagado.'); }); }
  });

  /* ---------- aprovar: vira serviço ---------- */
  function abreAprovar() {
    var k = calc(ed);
    $('#ap-texto').textContent = nomeCli(ed) + ' · orçamento ' + numero(ed) + ' · total ' + R(k.total) + '. Entrada combinada: ' + (ed.entrada ? ed.entrada + '% (' + R(k.entrada) + ')' : 'sem entrada') + '.';
    $('#ap-sinal').value = fmtValor(k.entrada); $('#ap-entrega').value = ed.termino; $('#e-sinal').hidden = true; $('#ap-sinal').setAttribute('aria-invalid', 'false');
    S.abre($('#painel-aprovar')); $('#ap-sinal').focus();
  }
  $('#f-aprovar').addEventListener('submit', function (e) {
    e.preventDefault();
    var k = calc(ed), v = lerValor($('#ap-sinal').value), ent = $('#ap-entrega').value || ed.termino;
    var erro = !(v >= 0) ? 'Escreva um valor válido (pode ser zero).' : v > k.total ? 'O sinal não pode passar do total (' + R(k.total) + ').' : '';
    if (erro) { $('#e-sinal').textContent = erro; $('#e-sinal').hidden = false; $('#ap-sinal').setAttribute('aria-invalid', 'true'); $('#ap-sinal').focus(); return; }
    var d = D(), ini = ed.inicio > S.hoje ? ed.inicio : S.dia(2);
    var s = { id: d.proxId++, orc: ed.id, etapa: 0, datas: [ini, mais(ini, 3), mais(ent, -1) > mais(ini, 3) ? mais(ent, -1) : mais(ini, 5), ent > mais(ini, 5) ? ent : mais(ini, 6)], pags: v ? [{ valor: v, forma: this.querySelector('input[name=ap-forma]:checked').value, data: S.hoje }] : [] };
    d.servs.push(s); ed.status = 'aprovado'; ed.respondido = S.hoje; ed.serv = s.id;
    S.fecha($('#painel-aprovar')); fechaEditor(); vaiTela('servicos');
    S.aviso('Orçamento aprovado. Serviço criado com a medição técnica em ' + br(s.datas[0]) + (v ? ' e sinal de ' + R(v) + ' registrado.' : '.'));
    var c = $('#sv-' + s.id); if (c) c.focus();
  });

  /* ---------- tela: serviços ---------- */
  function desenhaServicos() {
    var ss = D().servs.slice().sort(function (a, b) { return (a.etapa === 3) - (b.etapa === 3) || (a.datas[3] < b.datas[3] ? -1 : 1); });
    var and = ss.filter(function (s) { return s.etapa < 3; }), inst = and.filter(function (s) { return s.etapa <= 2; }).sort(function (a, b) { return a.datas[2] < b.datas[2] ? -1 : 1; })[0];
    var mes = soma(D().servs, function (s) { return soma(s.pags.filter(function (p) { return S.entre(p.data, S.hoje) <= 30; }), function (p) { return p.valor; }); });
    $('#resumo-servicos').innerHTML = res('Em andamento', and.length, plural(and.filter(function (s) { return s.etapa === 1; }).length, 'em produção', 'em produção')) +
      res('A receber', R(soma(ss, saldo)), 'saldo dos serviços') + res('Recebido (30 dias)', R(mes), 'sinais e parcelas') +
      res('Próxima instalação', inst ? S.curta(inst.datas[2]) : '—', inst ? esc(nomeCli(orc(inst.orc))) : 'nenhuma marcada');
    $('#servicos').innerHTML = ss.map(function (s) {
      var o = orc(s.orc), k = calc(o), sal = saldo(s);
      return '<article class="servico' + (s.etapa === 3 ? ' feito' : '') + '" id="sv-' + s.id + '" tabindex="-1" aria-labelledby="svt-' + s.id + '">' +
        '<div class="sv-topo"><div><h2 id="svt-' + s.id + '">' + esc(nomeCli(o)) + '</h2><span class="dica">' + esc(ambNomes(o)) + ' · orçamento ' + numero(o) + '</span></div>' + (sal ? '<span class="etq alerta">Saldo ' + R(sal) + '</span>' : '<span class="etq ok">' + ico('check') + 'Quitado</span>') + '</div>' +
        '<ol class="etapas-sv">' + ETAPAS.map(function (n, i) { var cls = i < s.etapa || s.etapa === 3 ? 'feita' : i === s.etapa ? 'atual' : ''; return '<li class="' + cls + '"' + (i === s.etapa ? ' aria-current="step"' : '') + '><span class="e-bola" aria-hidden="true">' + (i < s.etapa || s.etapa === 3 ? '✓' : i + 1) + '</span><b>' + n + '</b><span>' + S.curta(s.datas[i]) + '</span></li>'; }).join('') + '</ol>' +
        '<dl class="sv-val"><div><dt>Total</dt><dd>' + R(k.total) + '</dd></div><div><dt>Recebido</dt><dd>' + R(recebido(s)) + '</dd></div><div><dt>Saldo</dt><dd>' + R(sal) + '</dd></div></dl>' +
        (s.pags.length ? '<details class="sv-pags"><summary>' + plural(s.pags.length, 'pagamento', 'pagamentos') + ' recebido' + (s.pags.length === 1 ? '' : 's') + '</summary><ul>' + s.pags.map(function (p) { return '<li><span>' + br(p.data) + ' · ' + p.forma + '</span><span>' + R(p.valor) + '</span></li>'; }).join('') + '</ul></details>' : '') +
        '<div class="sv-acoes">' + (s.etapa < 3 ? '<button class="btn btn-p btn-sm" type="button" data-avancar="' + s.id + '">' + ico('seta') + (s.etapa === 2 ? 'Marcar como concluído' : 'Avançar para ' + ETAPAS[s.etapa + 1]) + '<span class="sr"> (' + esc(nomeCli(o)) + ')</span></button>' : '') +
        '<button class="btn btn-s btn-sm" type="button" data-avisar="' + s.id + '">' + ico('zap') + 'Avisar cliente<span class="sr"> ' + esc(nomeCli(o)) + '</span></button>' +
        (sal ? '<button class="btn btn-s btn-sm" type="button" data-receber="' + s.id + '">' + ico('moeda') + 'Receber<span class="sr"> de ' + esc(nomeCli(o)) + '</span></button>' : '') +
        '<button class="btn btn-s btn-sm" type="button" data-abrir="' + o.id + '">' + ico('doc') + 'Orçamento<span class="sr"> ' + numero(o) + '</span></button></div></article>';
    }).join('') || '<p class="vazio">Nenhum serviço ainda. Quando um orçamento for aprovado, ele aparece aqui.</p>';
  }
  $('#servicos').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.avancar) { var s = serv(+b.dataset.avancar); s.etapa++; if (S.entre(S.hoje, s.datas[s.etapa]) > 0 && s.etapa > 0) s.datas[s.etapa] = s.etapa === 3 ? S.hoje : s.datas[s.etapa]; salva(); S.aviso(nomeCli(orc(s.orc)) + ': ' + (s.etapa === 3 ? 'serviço concluído.' : 'agora em ' + ETAPAS[s.etapa].toLowerCase() + '.')); var nb = $('#sv-' + s.id + ' [data-avancar]') || $('#sv-' + s.id + ' [data-avisar]'); nb.focus(); }
    else if (b.dataset.avisar) { var s2 = serv(+b.dataset.avisar); S.demo(msgEtapa(s2), 'Aviso de etapa para o cliente'); }
    else if (b.dataset.receber) abreReceber(serv(+b.dataset.receber));
  });
  var recServ = null;
  function abreReceber(s) {
    recServ = s; var o = orc(s.orc), k = calc(o), sal = saldo(s);
    $('#rc-titulo').textContent = 'Receber · ' + nomeCli(o);
    $('#rc-conta').innerHTML = '<dl class="conta-res"><div><dt>Total do serviço</dt><dd>' + R(k.total) + '</dd></div>' + s.pags.map(function (p) { return '<div class="pago"><dt>' + br(p.data) + ' · ' + p.forma + '</dt><dd>− ' + R(p.valor) + '</dd></div>'; }).join('') + '<div class="tot"><dt>Saldo</dt><dd>' + R(sal) + '</dd></div></dl>' + (o.parcelas > 1 ? '<p class="dica-bloco">Parcela combinada: ' + R(k.parcela) + '.</p>' : '');
    $('#rc-valor').value = fmtValor(Math.min(sal, o.parcelas > 1 ? k.parcela : sal)); $('#rc-saldo').textContent = R(sal); $('#e-rc').hidden = true; $('#rc-valor').setAttribute('aria-invalid', 'false');
    S.abre($('#painel-receber')); $('#rc-valor').focus();
  }
  $('#f-receber').addEventListener('submit', function (e) {
    e.preventDefault();
    var s = recServ, sal = saldo(s), v = lerValor($('#rc-valor').value);
    var erro = !(v > 0) ? 'Escreva um valor maior que zero.' : v > sal ? 'O valor passa do saldo (' + R(sal) + ').' : '';
    if (erro) { $('#e-rc').textContent = erro; $('#e-rc').hidden = false; $('#rc-valor').setAttribute('aria-invalid', 'true'); $('#rc-valor').focus(); return; }
    s.pags.push({ valor: v, forma: this.querySelector('input[name=rc-forma]:checked').value, data: S.hoje });
    S.fecha($('#painel-receber')); salva();
    S.aviso('Pagamento de ' + R(v) + ' registrado. ' + (saldo(s) ? 'Saldo: ' + R(saldo(s)) + '.' : 'Serviço quitado.'));
    var c = $('#sv-' + s.id); if (c) c.focus();
  });

  /* ---------- tela: clientes ---------- */
  function histCli(c) { var os = D().orcs.filter(function (o) { return o.cli === c.id; }), ap = os.filter(function (o) { return o.status === 'aprovado'; }); return { os: os, ap: ap, total: soma(ap, function (o) { return calc(o).total; }) }; }
  function desenhaClientes() {
    var busca = $('#busca-cli').value.trim().toLowerCase();
    var cs = D().clientes.filter(function (c) { return !busca || c.nome.toLowerCase().indexOf(busca) >= 0; }).sort(function (a, b) { return a.nome.localeCompare(b.nome); });
    $('#lista-clientes').innerHTML = cs.length ? cs.map(function (c) { var h = histCli(c); return '<tr><td class="principal"><span class="o-cli"><b>' + esc(c.nome) + '</b><span class="dica">' + esc(c.tel || 'sem telefone') + '</span></span></td><td class="num" data-rot="Orçamentos">' + h.os.length + '</td><td class="num" data-rot="Fechados">' + h.ap.length + '</td><td class="num" data-rot="Total fechado">' + R(h.total) + '</td><td class="acao"><button class="btn btn-s btn-sm" type="button" data-ficha="' + c.id + '">Ver ficha<span class="sr"> de ' + esc(c.nome) + '</span></button></td></tr>'; }).join('') : '<tr><td class="vazio" colspan="5">Nenhum cliente com esse nome.</td></tr>';
  }
  $('#busca-cli').addEventListener('input', desenhaClientes);
  var cliEd = null, cliDoEditor = false;
  function abreCliente(c, doEditor) {
    cliEd = c; cliDoEditor = !!doEditor;
    $('#cl-titulo').textContent = c ? c.nome : 'Novo cliente';
    $('#cl-nome').value = c ? c.nome : ''; $('#cl-tel').value = c ? c.tel : ''; $('#cl-end').value = c ? c.end : '';
    $('#cl-salvar').textContent = c ? 'Salvar dados' : 'Salvar cliente'; $('#cl-orc').hidden = !c; $('#e-clnome').hidden = true; $('#cl-nome').setAttribute('aria-invalid', 'false');
    if (c) {
      var h = histCli(c), dec2 = h.os.filter(function (o) { var s = situacao(o); return s === 'aprovado' || s === 'recusado' || s === 'vencido'; }).length;
      $('#cl-ficha').innerHTML = '<dl class="conta-res"><div><dt>Total já fechado</dt><dd>' + R(h.total) + '</dd></div><div><dt>Taxa de aprovação</dt><dd>' + (dec2 ? Math.round(h.ap.length / dec2 * 100) + '%' : '—') + '</dd></div></dl>' +
        '<h3 class="cat-form">Orçamentos e serviços</h3><ul class="hist">' + h.os.sort(function (a, b) { return b.n - a.n || b.rev - a.rev; }).map(function (o) { var s = o.serv && serv(o.serv); return '<li><button class="lnk" type="button" data-abrir="' + o.id + '"><b>' + o.n + (o.rev > 1 ? ' · rev. ' + o.rev : '') + '</b> ' + esc(ambNomes(o)) + '</button>' + etqSit(o) + (s ? '<span class="etq">' + ETAPAS[s.etapa] + '</span>' : '') + '<span class="h-val">' + R(calc(o).total) + '</span></li>'; }).join('') + '</ul><h3 class="cat-form">Dados</h3>';
    } else $('#cl-ficha').innerHTML = '';
    S.abre($('#painel-cli')); (c ? $('#cl-ficha button') || $('#cl-nome') : $('#cl-nome')).focus();
  }
  $('#novo-cliente').addEventListener('click', function () { abreCliente(null); });
  $('#lista-clientes').addEventListener('click', function (e) { var b = e.target.closest('[data-ficha]'); if (b) abreCliente(cli(+b.dataset.ficha)); });
  $('#f-cli').addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = $('#cl-nome').value.trim(); if (nome.length < 2) { $('#e-clnome').hidden = false; $('#cl-nome').setAttribute('aria-invalid', 'true'); $('#cl-nome').focus(); return; }
    var c = cliEd || { id: D().proxId++ }; c.nome = nome; c.tel = $('#cl-tel').value.trim(); c.end = $('#cl-end').value.trim();
    if (!cliEd) D().clientes.push(c);
    S.fecha($('#painel-cli')); G.salva();
    if (cliDoEditor && ed) { ed.cli = c.id; G.salva(); opcoesCli(c.id); $('#subtitulo').textContent = c.nome + ' · criado em ' + br(ed.criado); atualizaCalc(); $('#ed-cliente').focus(); }
    else { desenha(); var b = $('[data-ficha="' + c.id + '"]'); if (b) b.focus(); }
    S.aviso(cliEd ? 'Dados de ' + c.nome + ' atualizados.' : c.nome + ' cadastrado.');
  });
  $('#cl-orc').addEventListener('click', function () { var c = cliEd; S.fecha($('#painel-cli')); abreEditor(novoOrc(c.id), '#amb-0'); });
  $('#painel-cli').addEventListener('click', function (e) { var b = e.target.closest('[data-abrir]'); if (!b) return; S.fecha($('#painel-cli')); abreEditor(orc(+b.dataset.abrir)); });

  /* ---------- tela: catálogo ---------- */
  function desenhaCatalogo() {
    $('#catalogo').innerHTML = CATS.map(function (cat) {
      var its = D().catalogo.filter(function (i) { return i.cat === cat; }); if (!its.length) return '';
      return '<h2 class="tit-bloco">' + cat + '</h2><table class="tabela cat"><thead><tr><th scope="col">Item</th><th scope="col">Cobrado por</th><th scope="col" class="num">Preço</th><th scope="col">Situação</th><th scope="col"><span class="sr">Editar</span></th></tr></thead><tbody>' +
        its.map(function (i) { return '<tr class="' + (i.ativo ? '' : 'inativo') + '"><td class="principal">' + esc(i.nome) + '</td><td data-rot="Cobrado por">' + UN[i.un] + '</td><td class="num" data-rot="Preço">' + R(i.preco) + '</td><td data-rot="Situação"><label class="chave"><input type="checkbox" data-ativo="' + i.id + '"' + (i.ativo ? ' checked' : '') + '><span>' + (i.ativo ? 'Ativo' : 'Desativado') + '</span><span class="sr"> · ' + esc(i.nome) + '</span></label></td><td class="acao"><button class="btn btn-s btn-sm" type="button" data-item="' + i.id + '">' + ico('editar') + 'Editar<span class="sr"> ' + esc(i.nome) + '</span></button></td></tr>'; }).join('') + '</tbody></table>';
    }).join('');
  }
  $('#catalogo').addEventListener('change', function (e) { var id = e.target.dataset.ativo; if (!id) return; var i = itemCat(id); i.ativo = e.target.checked; salva(); S.aviso(i.nome + (i.ativo ? ' ativado.' : ' desativado. Ele some do editor.')); $('[data-ativo="' + id + '"]').focus(); });
  $('#catalogo').addEventListener('click', function (e) { var b = e.target.closest('[data-item]'); if (b) abreItem(itemCat(b.dataset.item)); });
  var itemEd = null;
  $('#it-cat').innerHTML = CATS.map(function (c) { return '<option>' + c + '</option>'; }).join('');
  function abreItem(i) {
    itemEd = i || null; $('#it-titulo').textContent = i ? 'Editar item' : 'Novo item';
    $('#it-nome').value = i ? i.nome : ''; $('#it-cat').value = i ? i.cat : CATS[0]; $('#it-un').value = i ? i.un : 'm2'; $('#it-preco').value = i ? fmtValor(i.preco) : ''; $('#it-ativo').checked = i ? i.ativo : true;
    $('#e-itnome').hidden = $('#e-itpreco').hidden = true; S.abre($('#painel-item')); $('#it-nome').focus();
  }
  $('#novo-item').addEventListener('click', function () { abreItem(null); });
  $('#f-item').addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = $('#it-nome').value.trim(), preco = lerValor($('#it-preco').value), mn = nome.length < 2, mp = !(preco > 0);
    $('#e-itnome').hidden = !mn; $('#it-nome').setAttribute('aria-invalid', mn); $('#e-itpreco').hidden = !mp; $('#it-preco').setAttribute('aria-invalid', mp);
    if (mn) { $('#it-nome').focus(); return; } if (mp) { $('#it-preco').focus(); return; }
    var i = itemEd || { id: 'i' + Date.now().toString(36) }; i.nome = nome; i.cat = $('#it-cat').value; i.un = $('#it-un').value; i.preco = preco; i.ativo = $('#it-ativo').checked;
    if (!itemEd) D().catalogo.push(i);
    S.fecha($('#painel-item')); salva(); S.aviso(itemEd ? i.nome + ' atualizado. Orçamentos já feitos mantêm o preço antigo.' : i.nome + ' entrou no catálogo.');
    var b = $('[data-item="' + i.id + '"]'); if (b) b.focus();
  });

  /* ---------- ações comuns ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.abrir && !b.closest('#painel-cli')) abreEditor(orc(+b.dataset.abrir));
    else if (b.dataset.duplicar) { var n = novoOrc(0, orc(+b.dataset.duplicar)); abreEditor(n, '#titulo'); S.aviso('Revisão ' + n.rev + ' do orçamento ' + n.n + ' criada como rascunho.'); }
    else if (b.dataset.cobrar) { var o = orc(+b.dataset.cobrar); o.cobrado = S.hoje; salva(); S.demo(msgCobrar(o), 'Pedido de retorno ao cliente'); }
  });
  $('.recomecar').addEventListener('click', function () { S.confirma('Recomeçar apaga o que você fez nesta demonstração e volta aos orçamentos de exemplo.', function () { G.recomeca(); if (ed) { ed = null; $('#editor').hidden = true; } vaiTela('inicio', true); S.aviso('Demonstração recomeçada.'); }); });

  var telaAtual = 'inicio';
  function desenha() {
    $('#n-retorno').textContent = D().orcs.filter(retorno).length || '';
    $('#n-servicos').textContent = D().servs.filter(function (s) { return s.etapa < 3; }).length;
    ({ inicio: desenhaInicio, orcamentos: desenhaOrcs, servicos: desenhaServicos, clientes: desenhaClientes, catalogo: desenhaCatalogo })[telaAtual]();
  }
  var SUB = { inicio: S.longa(S.hoje), orcamentos: 'Todos os orçamentos e a situação de cada um', servicos: 'Obras em andamento e o que falta receber', clientes: 'Histórico de cada cliente', catalogo: 'Itens, unidades e preços' };
  var vaiTela = S.telas(function (tela) { if (ed) fechaEditor(); telaAtual = tela; $('#subtitulo').textContent = SUB[tela]; desenha(); });
})();
