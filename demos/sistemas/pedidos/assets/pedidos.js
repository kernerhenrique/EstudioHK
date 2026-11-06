/* Sistema de pedidos · Coadouro · demonstração da EstudioHK
   Mesas, retirada e entrega no mesmo quadro; cozinha; caixa com pagamentos; cardápio editável. Valores em centavos. */
(function () {
  'use strict';
  var S = window.SIS, $ = S.$, $$ = S.$$, esc = S.esc;
  var R = function (c) { return S.dinheiro(c / 100); };
  var CATS = ['Cafés', 'Gelados', 'Salgados', 'Doces'];
  var BAIRROS = [['Praia do Canto', 500], ['Santa Lúcia', 600], ['Enseada do Suá', 600], ['Bento Ferreira', 700], ['Jardim da Penha', 800]];
  var TAXA = {}; BAIRROS.forEach(function (b) { TAXA[b[0]] = b[1]; });
  var MESAS = [[1, 2], [2, 2], [3, 4], [4, 4], [5, 4], [6, 2], [7, 6], [8, 4], [9, 2], [10, 8]];
  var LUG = {}; MESAS.forEach(function (x) { LUG[x[0]] = x[1]; });
  var ETAPAS = [{ id: 'novo', nome: 'Novo' }, { id: 'preparando', nome: 'Preparando' }, { id: 'pronto', nome: 'Pronto' }, { id: 'entregue', nome: 'Entregue' }];
  var POS = {}; ETAPAS.forEach(function (e, i) { POS[e.id] = i; });
  var FORMAS = ['Pix', 'Crédito', 'Débito', 'Dinheiro'];
  var INICIO = 9 * 60 + 40;
  var dois = function (n) { return String(n).padStart(2, '0'); };
  var min = function (h) { var p = h.split(':'); return +p[0] * 60 + +p[1]; };
  var hm = function (x) { return Math.floor(x / 60) + 'h' + (x % 60 ? dois(x % 60) : ''); };
  var hstr = function (x) { return dois(Math.floor(x / 60)) + ':' + dois(x % 60); };
  var num = function (p) { return '#' + String(p.n).padStart(4, '0'); };
  var primeiro = function (nome) { return nome.split(/[ (]/)[0]; };
  var soma = function (a, f) { return a.reduce(function (s, x) { return s + f(x); }, 0); };
  var lerValor = function (t) { t = String(t).trim().replace(/[R$\s]/g, ''); if (/,/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); var v = Math.round(parseFloat(t) * 100); return isFinite(v) ? v : NaN; };
  var fmtValor = function (c) { return (c / 100).toFixed(2).replace('.', ','); };

  /* ---------- dados de exemplo (o relógio da demo começa às 9h40) ---------- */
  function semente() {
    var d = { t0: Date.now(), prox: 438, proxConta: 1, itens: [], pedidos: [], contas: [] };
    var I = function (id, nome, cat, preco, det, disp) { d.itens.push({ id: id, nome: nome, cat: cat, preco: preco, det: det || '', disp: disp !== false }); };
    I('coado', 'Coado no pano', 'Cafés', 900, '200 ml'); I('espresso', 'Espresso', 'Cafés', 700); I('cappuccino', 'Cappuccino', 'Cafés', 1200);
    I('coldbrew', 'Cold brew com leite', 'Gelados', 1600, '400 ml'); I('garrafa', 'Garrafa de cold brew', 'Gelados', 2800, '500 ml');
    I('croissant', 'Croissant de manteiga', 'Salgados', 1100); I('paodequeijo', 'Pão de queijo', 'Salgados', 600);
    I('bolo', 'Bolo do dia', 'Doces', 1000, 'fatia'); I('torta', 'Torta de limão', 'Doces', 1400, 'fatia', false);
    var item = {}; d.itens.forEach(function (i) { item[i.id] = i; });
    var linhas = function (o) { return Object.keys(o).map(function (k) { return { id: k, nome: item[k].nome, preco: item[k].preco, q: o[k] }; }); };
    var C = function (tipo, mesa, aberta, extra) { var c = { id: d.proxConta++, tipo: tipo, mesa: mesa || 0, aberta: min(aberta), fechada: 0, servico: tipo === 'mesa', pediuConta: false, pags: [] }; Object.keys(extra || {}).forEach(function (k) { c[k] = extra[k]; }); d.contas.push(c); return c; };
    var P = function (n, tipo, o) {
      var p = { n: n, tipo: tipo, mesa: o.mesa || 0, cli: o.cli || '', tel: '', end: o.end || '', bairro: o.bairro || '', taxa: tipo === 'entrega' ? TAXA[o.bairro] : 0, dia: o.dia || 'hoje', etapa: o.etapa || 'novo', hora: o.hora || '', criado: min(o.criado), itens: linhas(o.itens), obs: o.obs || '', avisado: !!o.avisado, saiu: o.saiu ? min(o.saiu) : 0, cancelado: o.cancelado || '', conta: 0 };
      if (o.conta) p.conta = o.conta.id;
      else if (p.dia === 'hoje' && tipo !== 'mesa') p.conta = C(tipo, 0, o.criado).id;
      d.pedidos.push(p); return p;
    };
    var quita = function (n, forma, h, recebido) { var p = d.pedidos.filter(function (x) { return x.n === n; })[0], c = d.contas.filter(function (x) { return x.id === p.conta; })[0]; var v = calc(d, c).falta; c.pags.push({ forma: forma, valor: v, min: min(h), recebido: recebido || 0 }); c.fechada = min(h); };
    // de manhã cedo: retiradas já pagas, uma entrega e um cancelamento
    P(419, 'retirada', { cli: 'Mateus Pinto', hora: '07:30', criado: '07:20', itens: { espresso: 2 }, cancelado: 'Cliente desistiu' });
    d.contas = d.contas.filter(function (c) { return c.id !== d.pedidos[0].conta; }); d.pedidos[0].conta = 0;
    P(420, 'retirada', { cli: 'Ana Ribeiro', hora: '07:30', criado: '07:25', etapa: 'entregue', avisado: true, itens: { coado: 1, paodequeijo: 1 } }); quita(420, 'Pix', '07:31');
    P(421, 'retirada', { cli: 'Bruno Costa', hora: '07:45', criado: '07:40', etapa: 'entregue', avisado: true, itens: { espresso: 2, croissant: 1 } }); quita(421, 'Dinheiro', '07:46', 3000);
    P(422, 'retirada', { cli: 'Diego Alves', hora: '08:00', criado: '07:55', etapa: 'entregue', avisado: true, itens: { coldbrew: 1, bolo: 1 } }); quita(422, 'Crédito', '08:01');
    P(423, 'retirada', { cli: 'Elisa Prado', hora: '08:10', criado: '08:05', etapa: 'entregue', avisado: true, itens: { cappuccino: 1 } }); quita(423, 'Débito', '08:11');
    P(424, 'entrega', { cli: 'Gabriela Souza', end: 'Rua Exemplo, 45, ap. 302', bairro: 'Jardim da Penha', hora: '08:45', criado: '08:20', etapa: 'entregue', saiu: '08:32', itens: { cappuccino: 2, paodequeijo: 2 } }); quita(424, 'Pix', '08:21');
    // mesas abertas
    var m2 = C('mesa', 2, '09:05', { pediuConta: true }), m4 = C('mesa', 4, '09:20'), m9 = C('mesa', 9, '09:25'), m7 = C('mesa', 7, '09:35');
    P(425, 'mesa', { mesa: 2, conta: m2, criado: '09:07', etapa: 'entregue', itens: { cappuccino: 2, croissant: 2 } });
    m2.pags.push({ forma: 'Pix', valor: 2530, min: min('09:38'), recebido: 0 });
    P(426, 'mesa', { mesa: 4, conta: m4, criado: '09:21', etapa: 'entregue', itens: { coado: 2, paodequeijo: 2 } });
    P(427, 'retirada', { cli: 'Fernando Lima', hora: '09:45', criado: '09:22', etapa: 'pronto', itens: { coado: 1, croissant: 1 } });
    P(428, 'entrega', { cli: 'Helena Rocha', end: 'Av. Exemplo, 900, casa 2', bairro: 'Santa Lúcia', hora: '10:00', criado: '09:24', etapa: 'preparando', itens: { garrafa: 1 } });
    P(429, 'mesa', { mesa: 9, conta: m9, criado: '09:27', etapa: 'pronto', itens: { coldbrew: 1, espresso: 1 } });
    P(430, 'mesa', { mesa: 4, conta: m4, criado: '09:31', etapa: 'preparando', itens: { bolo: 2 }, obs: 'Uma fatia bem quentinha' });
    P(431, 'retirada', { cli: 'Igor Martins', hora: '10:00', criado: '09:34', itens: { coado: 1, bolo: 1 } });
    P(432, 'entrega', { cli: 'Paulo Reis', end: 'Rua Exemplo, 210, ap. 1101', bairro: 'Praia do Canto', hora: '10:15', criado: '09:35', itens: { coldbrew: 2, paodequeijo: 2 } });
    P(433, 'mesa', { mesa: 7, conta: m7, criado: '09:36', itens: { coado: 4, croissant: 2, bolo: 2 } });
    P(434, 'retirada', { cli: 'Júlio Nunes', hora: '10:15', criado: '09:38', itens: { espresso: 3, croissant: 3 }, obs: 'Para o escritório, pode embalar junto' });
    // encomendas de amanhã
    P(435, 'retirada', { cli: 'Escritório Vale Verde', dia: 'amanha', hora: '07:30', criado: '08:50', itens: { garrafa: 2, paodequeijo: 12, bolo: 1 }, obs: 'Quem retira é a Renata' });
    P(436, 'retirada', { cli: 'Lúcia Andrade', dia: 'amanha', hora: '08:00', criado: '09:10', itens: { coado: 2, croissant: 2 } });
    P(437, 'entrega', { cli: 'Clínica Lumar (recepção)', dia: 'amanha', end: 'Rua Exemplo, 77, sala 4', bairro: 'Enseada do Suá', hora: '09:00', criado: '09:30', itens: { coado: 6, paodequeijo: 6 }, obs: 'Para a reunião das 9h30' });
    return d;
  }

  /* ---------- contas ---------- */
  function totalItens(p) { return soma(p.itens, function (l) { return l.preco * l.q; }); }
  function totalPed(p) { return totalItens(p) + (p.taxa || 0); }
  function calc(d, c) {
    var ps = d.pedidos.filter(function (p) { return p.conta === c.id && !p.cancelado; });
    var sub = soma(ps, totalItens), taxa = soma(ps, function (p) { return p.taxa || 0; }), serv = c.servico ? Math.round(sub / 10) : 0;
    var total = sub + taxa + serv, pago = soma(c.pags, function (x) { return x.valor; });
    return { ps: ps, sub: sub, taxa: taxa, serv: serv, total: total, pago: pago, falta: Math.max(0, total - pago) };
  }

  var G = S.guarda('estudiohk-sis-pedidos-v2', semente, true);
  var D = function () { return G.d; };
  var agora = function () { return Math.min(INICIO + Math.floor((Date.now() - D().t0) / 6e4), 18 * 60 + 59); };
  var itemDe = function (id) { return D().itens.filter(function (i) { return i.id === id; })[0]; };
  var acha = function (n) { return D().pedidos.filter(function (p) { return p.n === n; })[0]; };
  var contaDe = function (id) { return D().contas.filter(function (c) { return c.id === id; })[0]; };
  var contaMesa = function (n) { return D().contas.filter(function (c) { return c.tipo === 'mesa' && c.mesa === n && !c.fechada; })[0]; };
  var hoje = function () { return D().pedidos.filter(function (p) { return p.dia === 'hoje' && !p.cancelado; }); };
  var abertas = function () { return D().contas.filter(function (c) { return !c.fechada; }); };
  var nomeConta = function (c) { if (c.tipo === 'mesa') return 'Mesa ' + c.mesa; var p = calc(D(), c).ps[0] || D().pedidos.filter(function (x) { return x.conta === c.id; })[0]; return (c.tipo === 'entrega' ? 'Entrega ' : 'Retirada ') + (p ? num(p) + ' · ' + p.cli : ''); };
  var porHora = function (a, b) { var ha = a.hora ? min(a.hora) : a.criado, hb = b.hora ? min(b.hora) : b.criado; return ha - hb || a.n - b.n; };
  var titulo = function (p) { return p.tipo === 'mesa' ? 'Mesa ' + p.mesa : p.cli; };
  var res = function (rot, val, det) { return '<div class="res"><small>' + rot + '</small><b>' + val + '</b><span>' + det + '</span></div>'; };
  var plural = function (n, um, varios) { return n + ' ' + (n === 1 ? um : varios); };
  var ico = function (id) { return '<svg class="ico" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
  function salva() { G.salva(); desenha(); }

  /* ---------- cartão do pedido ---------- */
  function etqTipo(p) {
    if (p.tipo === 'mesa') return '<span class="etq t-mesa">' + ico('mesa') + 'Mesa ' + p.mesa + '</span>';
    if (p.tipo === 'entrega') return '<span class="etq t-entrega">' + ico('moto') + 'Entrega · ' + esc(p.bairro) + '</span>';
    return '<span class="etq t-retirada">' + ico('sacola') + 'Retirada</span>';
  }
  function cartao(p, modo) {
    var i = POS[p.etapa], ant = ETAPAS[i - 1], prox = ETAPAS[i + 1], c = p.conta ? contaDe(p.conta) : null;
    var quando = p.tipo === 'mesa' ? '<span class="sr">Pedido feito às </span>' + hm(p.criado) : p.tipo === 'entrega' ? '<span class="sr">Entrega prevista às </span>' + hm(min(p.hora)) : '<span class="sr">Retirada às </span>' + hm(min(p.hora));
    var itens = p.itens.map(function (l) { return '<li><b>' + l.q + '×</b> ' + esc(l.nome) + '</li>'; }).join('');
    var etqs = etqTipo(p);
    if (p.tipo === 'retirada' && p.etapa === 'pronto' && p.avisado) etqs += '<span class="etq avisado">Cliente avisado</span>';
    if (p.saiu && p.etapa !== 'entregue') etqs += '<span class="etq avisado">Saiu às ' + hm(p.saiu) + '</span>';
    if (c && p.tipo !== 'mesa') etqs += c.fechada ? '<span class="etq ok">Pago</span>' : (p.etapa === 'entregue' ? '<span class="etq perigo">A receber</span>' : '');
    var b = [], N = num(p);
    if (modo === 'quadro') {
      if (p.etapa === 'pronto' && p.tipo === 'retirada') b.push('<button class="btn btn-s btn-sm linha" type="button" data-avisar>' + ico('zap') + 'Avisar que está pronto<span class="sr"> (' + esc(p.cli) + ', ' + N + ')</span></button>');
      if (p.etapa === 'pronto' && p.tipo === 'entrega' && !p.saiu) b.push('<button class="btn btn-s btn-sm linha" type="button" data-saiu>' + ico('moto') + 'Saiu para entrega<span class="sr"> (' + N + ')</span></button>');
      if (c && !c.fechada && p.tipo !== 'mesa' && p.etapa !== 'novo') b.push('<button class="btn btn-s btn-sm linha" type="button" data-receber="' + c.id + '">' + ico('moeda') + 'Receber ' + R(calc(D(), c).falta) + '<span class="sr"> do pedido ' + N + '</span></button>');
      if (ant) b.push('<button class="btn btn-s btn-ico" type="button" data-move="' + ant.id + '" aria-label="Voltar o pedido ' + N + ' para ' + ant.nome + '">' + ico('volta') + '</button>');
      b.push('<button class="btn btn-s btn-ico" type="button" data-editar aria-label="Editar o pedido ' + N + '">' + ico('editar') + '</button>');
      if (prox) b.push('<button class="btn btn-p btn-sm avanca" type="button" data-move="' + prox.id + '"><span class="sr">Mover o pedido ' + N + ' para </span>' + (prox.id === 'entregue' && p.tipo === 'mesa' ? 'Levado à mesa' : prox.nome) + ico('seta') + '</button>');
      else b.push('<span class="etq ok avanca">' + ico('check') + (p.tipo === 'mesa' ? 'Na mesa' : 'Entregue') + '</span>');
    } else b.push('<button class="btn btn-s btn-sm" type="button" data-editar>' + ico('editar') + 'Editar<span class="sr"> o pedido ' + N + '</span></button>');
    return '<article class="pedido" id="p-' + p.n + '" data-n="' + p.n + '" tabindex="-1" style="--e:var(--e-' + p.etapa + ')"' + (modo === 'quadro' ? ' draggable="true"' : '') + ' aria-labelledby="pt-' + p.n + '">' +
      '<div class="ped-topo"><span class="ped-num">' + N + '</span><span class="ped-hora">' + ico('relogio') + quando + '</span></div>' +
      '<h3 id="pt-' + p.n + '">' + esc(titulo(p)) + '</h3><ul class="ped-itens">' + itens + '</ul>' +
      (p.obs ? '<p class="ped-obs">' + esc(p.obs) + '</p>' : '') +
      '<div class="ped-pe"><span class="etqs">' + etqs + '</span><b class="ped-total">' + R(totalPed(p)) + '</b></div><div class="ped-acoes">' + b.join('') + '</div></article>';
  }

  /* ---------- tela: pedidos ---------- */
  var filtro = 'todos', diaVisto = 'hoje';
  function desenhaPedidos() {
    var hj = hoje(), busca = $('#busca').value.trim().toLowerCase();
    var vendas = soma(D().contas, function (c) { return calc(D(), c).total; });
    var abertos = hj.filter(function (p) { return p.etapa !== 'entregue'; });
    var naCoz = hj.filter(function (p) { return p.etapa === 'novo' || p.etapa === 'preparando'; }).length;
    var ab = abertas(), falta = soma(ab, function (c) { return calc(D(), c).falta; });
    var ocup = MESAS.filter(function (m) { return contaMesa(m[0]); }).length;
    $('#resumo-hoje').innerHTML = res('Vendas de hoje', R(vendas), plural(hj.length, 'pedido', 'pedidos')) +
      res('Em aberto', abertos.length, naCoz + ' na cozinha') +
      res('Mesas ocupadas', ocup + ' de ' + MESAS.length, ocup ? 'com ' + plural(ocup, 'conta aberta', 'contas abertas') : 'todas livres') +
      res('A receber', R(falta), plural(ab.length, 'conta em aberto', 'contas em aberto'));
    var lista = hj.filter(function (p) {
      if (filtro !== 'todos' && p.tipo !== filtro) return false;
      if (!busca) return true;
      return (titulo(p) + ' ' + num(p)).toLowerCase().indexOf(busca) >= 0;
    }).sort(porHora);
    $('#quadro').innerHTML = ETAPAS.map(function (e) {
      var ps = lista.filter(function (p) { return p.etapa === e.id; });
      return '<section class="coluna" data-etapa="' + e.id + '" style="--e:var(--e-' + e.id + ')" aria-labelledby="c-' + e.id + '">' +
        '<header><h2 id="c-' + e.id + '"><i aria-hidden="true"></i>' + e.nome + '</h2><span class="qtd"><span class="sr">' + (ps.length === 1 ? 'pedido: ' : 'pedidos: ') + '</span>' + ps.length + '</span></header>' +
        '<div class="cartoes">' + (ps.length ? ps.map(function (p) { return cartao(p, 'quadro'); }).join('') : '<p class="vazio-col">' + (busca || filtro !== 'todos' ? 'Nada com esse filtro.' : 'Nenhum pedido aqui.') + '</p>') + '</div></section>';
    }).join('');
    // amanhã
    var am = D().pedidos.filter(function (p) { return p.dia === 'amanha' && !p.cancelado; }).sort(porHora), sep = {};
    am.forEach(function (p) { p.itens.forEach(function (l) { sep[l.nome] = (sep[l.nome] || 0) + l.q; }); });
    $('#resumo-amanha').innerHTML = res('Encomendas', am.length, S.longa(S.dia(1))) + res('Total previsto', R(soma(am, totalPed)), 'a receber amanhã') + res('Primeira', am[0] ? hm(min(am[0].hora)) : '—', am[0] ? esc(am[0].cli) : 'Sem encomendas');
    $('#lista-amanha').innerHTML = am.length ? am.map(function (p) { return cartao(p, 'amanha'); }).join('') : '<p class="vazio">Nenhuma encomenda para amanhã.</p>';
    var ks = Object.keys(sep).sort(function (a, b) { return sep[b] - sep[a]; });
    $('#separar').innerHTML = ks.length ? ks.map(function (k) { return '<tr><td class="principal">' + esc(k) + '</td><td class="num" data-rot="Quantidade">' + sep[k] + '</td></tr>'; }).join('') : '<tr><td class="vazio" colspan="2">Nada para separar.</td></tr>';
    $('#n-amanha').textContent = am.length;
  }

  /* ---------- tela: mesas ---------- */
  function estadoMesa(n) {
    var c = contaMesa(n); if (!c) return { livre: true };
    var k = calc(D(), c);
    return { c: c, k: k, pronto: k.ps.some(function (p) { return p.etapa === 'pronto'; }), cozinha: k.ps.some(function (p) { return p.etapa === 'novo' || p.etapa === 'preparando'; }) };
  }
  function desenhaMesas() {
    $('#mesas').innerHTML = MESAS.map(function (m) {
      var n = m[0], e = estadoMesa(n), cls = e.livre ? 'livre' : e.c.pediuConta ? 'conta' : 'ocupada';
      var info = e.livre ? '<span class="m-st">Livre</span>' : '<span class="m-st">' + R(e.k.total) + '</span><span class="m-tempo">há <span data-desde="' + e.c.aberta + '"></span> min</span>';
      var etq = e.livre ? '' : (e.pronto ? '<span class="etq ok">Pedido pronto para levar</span>' : '') + (e.cozinha ? '<span class="etq">Na cozinha</span>' : '') + (e.c.pediuConta ? '<span class="etq alerta">Conta pedida</span>' : '');
      return '<li><button class="mesa ' + cls + '" type="button" data-mesa="' + n + '"><span class="m-num"><span class="sr">Mesa </span>' + n + '</span><span class="m-lug">' + m[1] + ' lugares' + (e.livre ? '' : '<span class="sr">, ' + (e.c.pediuConta ? 'conta pedida' : 'ocupada') + '</span>') + '</span>' + info + '<span class="m-etqs">' + etq + '</span></button></li>';
    }).join('');
    tique();
  }
  var mesaAberta = 0;
  function abreMesa(n) {
    mesaAberta = n;
    var e = estadoMesa(n), corpo = $('#m-corpo'), pe = $('#m-pe');
    $('#m-titulo').textContent = 'Mesa ' + n;
    if (e.livre) {
      corpo.innerHTML = '<p class="m-livre">' + ico('mesa') + 'Mesa livre · ' + LUG[n] + ' lugares.</p><p class="dica-bloco">Ao lançar o primeiro pedido, a conta da mesa abre sozinha.</p>';
      pe.innerHTML = '<span></span><button class="btn btn-p" type="button" data-lancar>' + ico('mais') + 'Lançar pedido</button>';
    } else {
      var k = e.k, c = e.c;
      corpo.innerHTML = '<p class="m-info">' + LUG[n] + ' lugares · aberta às ' + hm(c.aberta) + ' · há <span data-desde="' + c.aberta + '"></span> min</p>' +
        '<ul class="rodadas">' + k.ps.slice().sort(function (a, b) { return a.criado - b.criado; }).map(function (p) {
          return '<li><div class="rod-topo"><b>' + num(p) + ' · ' + hm(p.criado) + '</b><span class="etq e-' + p.etapa + '">' + ETAPAS[POS[p.etapa]].nome + '</span></div><ul>' + p.itens.map(function (l) { return '<li><span>' + l.q + '× ' + esc(l.nome) + '</span><span>' + R(l.q * l.preco) + '</span></li>'; }).join('') + '</ul>' +
            (p.obs ? '<p class="ped-obs">' + esc(p.obs) + '</p>' : '') +
            (p.etapa === 'pronto' ? '<button class="btn btn-p btn-sm" type="button" data-levado="' + p.n + '">' + ico('check') + 'Levado à mesa<span class="sr"> (pedido ' + num(p) + ')</span></button>' : '') + '</li>';
        }).join('') + '</ul>' +
        '<dl class="conta-res"><div><dt>Itens</dt><dd>' + R(k.sub) + '</dd></div>' +
        '<div class="serv"><dt><label class="chave"><input type="checkbox" id="m-serv"' + (c.servico ? ' checked' : '') + '><span>10% de serviço (opcional)</span></label></dt><dd>' + R(k.serv) + '</dd></div>' +
        '<div class="tot"><dt>Total</dt><dd>' + R(k.total) + '</dd></div>' +
        (k.pago ? '<div><dt>Já pago</dt><dd>' + R(k.pago) + '</dd></div><div class="falta"><dt>Falta</dt><dd>' + R(k.falta) + '</dd></div>' : '') + '</dl>';
      pe.innerHTML = '<button class="btn btn-s" type="button" data-lancar>' + ico('mais') + 'Adicionar itens</button>' +
        '<span class="pe-dir"><button class="btn btn-s" type="button" data-pedir-conta aria-pressed="' + c.pediuConta + '">' + (c.pediuConta ? ico('check') + 'Conta pedida' : 'Pedir a conta') + '</button>' +
        '<button class="btn btn-p" type="button" data-receber="' + c.id + '">' + ico('moeda') + 'Receber</button></span>';
    }
    S.abre($('#painel-mesa')); tique();
  }
  $('#painel-mesa').addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    var c = contaMesa(mesaAberta);
    if (b.hasAttribute('data-lancar')) { S.fecha($('#painel-mesa')); abreForm(null, { tipo: 'mesa', mesa: mesaAberta }); }
    else if (b.hasAttribute('data-pedir-conta')) { c.pediuConta = !c.pediuConta; salva(); abreMesa(mesaAberta); $('[data-pedir-conta]').focus(); S.aviso(c.pediuConta ? 'Mesa ' + mesaAberta + ': conta pedida.' : 'Mesa ' + mesaAberta + ': pedido de conta desfeito.'); }
    else if (b.dataset.levado) { var p = acha(+b.dataset.levado); p.etapa = 'entregue'; salva(); abreMesa(mesaAberta); S.aviso('Pedido ' + num(p) + ' levado à mesa ' + p.mesa + '.'); var x = $('#m-corpo button, #m-pe button'); if (x) x.focus(); }
    else if (b.dataset.receber) { S.fecha($('#painel-mesa')); abrePag(+b.dataset.receber, mesaAberta); }
  });
  $('#painel-mesa').addEventListener('change', function (ev) {
    if (ev.target.id !== 'm-serv') return;
    contaMesa(mesaAberta).servico = ev.target.checked; salva(); abreMesa(mesaAberta); $('#m-serv').focus();
  });

  /* ---------- tela: cozinha ---------- */
  function desenhaCozinha() {
    var fila = hoje().filter(function (p) { return p.etapa === 'novo' || p.etapa === 'preparando'; }).sort(function (a, b) { return a.criado - b.criado || a.n - b.n; });
    $('#cozinha').innerHTML = fila.length ? fila.map(function (p) {
      var quem = p.tipo === 'mesa' ? 'Mesa ' + p.mesa : (p.tipo === 'entrega' ? 'Entrega · ' : 'Retirada · ') + p.cli;
      return '<article class="ticket" data-n="' + p.n + '" data-criado="' + p.criado + '" aria-labelledby="k-' + p.n + '">' +
        '<div class="t-topo"><h2 id="k-' + p.n + '">' + esc(quem) + '</h2><span class="t-espera">há <span data-desde="' + p.criado + '"></span> min</span></div>' +
        '<p class="t-info">' + num(p) + ' · chegou às ' + hm(p.criado) + (p.hora ? ' · ' + (p.tipo === 'entrega' ? 'sai até ' : 'retira às ') + hm(min(p.hora) - (p.tipo === 'entrega' ? 20 : 0)) : '') + '</p>' +
        '<ul class="t-itens">' + p.itens.map(function (l) { return '<li><b>' + l.q + '×</b> ' + esc(l.nome) + '</li>'; }).join('') + '</ul>' +
        (p.obs ? '<p class="t-obs">' + ico('info') + esc(p.obs) + '</p>' : '') +
        (p.etapa === 'novo' ? '<button class="btn btn-s" type="button" data-coz="preparando">' + ico('fogo') + 'Começar preparo<span class="sr"> de ' + esc(quem) + '</span></button>' : '<button class="btn btn-p" type="button" data-coz="pronto">' + ico('check') + 'Pronto<span class="sr">: ' + esc(quem) + '</span></button>') +
        '</article>';
    }).join('') : '<p class="vazio">Tudo pronto por aqui. Os pedidos novos aparecem nesta tela assim que forem lançados.</p>';
    tique();
  }
  $('#cozinha').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-coz]'); if (!b) return;
    var t = b.closest('.ticket'), p = acha(+t.dataset.n), lista = $$('.ticket'), i = lista.indexOf(t);
    p.etapa = b.dataset.coz; salva();
    S.aviso(p.etapa === 'pronto' ? titulo(p) + ' (' + num(p) + ') está pronto.' + (p.tipo === 'mesa' ? ' O garçom já vê na tela de mesas.' : '') : 'Começou o preparo de ' + titulo(p) + '.');
    var alvo = $('.ticket[data-n="' + p.n + '"] [data-coz]') || $$('.ticket [data-coz]')[Math.min(i, $$('.ticket').length - 1)];
    if (alvo) alvo.focus(); else $('#titulo').focus();
  });

  /* ---------- tela: caixa ---------- */
  function barras(alvo, linhas, fmt) {
    var max = Math.max.apply(null, linhas.map(function (l) { return l[1]; }).concat([1]));
    $(alvo).innerHTML = '<ul>' + linhas.map(function (l) {
      return '<li><span class="b-rot">' + esc(l[0]) + '</span><span class="b-trilho" aria-hidden="true"><i style="width:' + (l[1] / max * 100).toFixed(1) + '%"></i></span><span class="b-val">' + fmt(l) + '</span></li>';
    }).join('') + '</ul>';
  }
  function fechamento() {
    var d = D(), pags = [], forma = {}, tipo = { mesa: [0, 0], retirada: [0, 0], entrega: [0, 0] }, itens = {};
    d.contas.forEach(function (c) { c.pags.forEach(function (p) { pags.push(p); }); });
    FORMAS.forEach(function (f) { forma[f] = soma(pags.filter(function (p) { return p.forma === f; }), function (p) { return p.valor; }); });
    d.contas.forEach(function (c) { var k = calc(d, c); if (k.ps.length) { tipo[c.tipo][0] += k.total; tipo[c.tipo][1]++; } });
    hoje().forEach(function (p) { p.itens.forEach(function (l) { itens[l.nome] = (itens[l.nome] || 0) + l.q; }); });
    var canc = d.pedidos.filter(function (p) { return p.cancelado && p.dia === 'hoje'; });
    var vendas = tipo.mesa[0] + tipo.retirada[0] + tipo.entrega[0], contas = tipo.mesa[1] + tipo.retirada[1] + tipo.entrega[1];
    var serv = soma(d.contas, function (c) { return calc(d, c).serv; });
    return { forma: forma, tipo: tipo, itens: itens, canc: canc, vendas: vendas, contas: contas, serv: serv, recebido: soma(pags, function (p) { return p.valor; }), falta: soma(abertas(), function (c) { return calc(d, c).falta; }), ab: abertas() };
  }
  function desenhaCaixa() {
    var f = fechamento();
    $('#resumo-caixa').innerHTML = res('Recebido hoje', R(f.recebido), 'em ' + plural(FORMAS.filter(function (x) { return f.forma[x]; }).length, 'forma de pagamento', 'formas de pagamento')) +
      res('A receber', R(f.falta), plural(f.ab.length, 'conta em aberto', 'contas em aberto')) +
      res('Vendas de hoje', R(f.vendas), 'com ' + R(f.serv) + ' de serviço') +
      res('Ticket médio', R(f.contas ? Math.round(f.vendas / f.contas) : 0), 'por conta');
    var ab = f.ab.slice().sort(function (a, b) { return a.aberta - b.aberta; });
    $('#contas').innerHTML = ab.length ? ab.map(function (c) {
      var k = calc(D(), c);
      return '<tr><td class="principal">' + esc(nomeConta(c)) + (c.pediuConta ? ' <span class="etq alerta">Conta pedida</span>' : '') + '</td><td class="num" data-rot="Total">' + R(k.total) + '</td><td class="num" data-rot="Já pago">' + R(k.pago) + '</td><td class="num" data-rot="Falta"><b>' + R(k.falta) + '</b></td><td class="acao"><button class="btn btn-s btn-sm" type="button" data-receber="' + c.id + '">' + ico('moeda') + 'Receber<span class="sr"> ' + esc(nomeConta(c)) + '</span></button></td></tr>';
    }).join('') : '<tr><td class="vazio" colspan="5">Nenhuma conta em aberto.</td></tr>';
    var tot = f.recebido || 1;
    barras('#por-forma', FORMAS.map(function (x) { return [x, f.forma[x]]; }), function (l) { return R(l[1]) + ' <small>' + Math.round(l[1] / tot * 100) + '%</small>'; });
    barras('#por-tipo', [['Mesa', f.tipo.mesa[0], f.tipo.mesa[1]], ['Retirada', f.tipo.retirada[0], f.tipo.retirada[1]], ['Entrega', f.tipo.entrega[0], f.tipo.entrega[1]]], function (l) { return R(l[1]) + ' <small>' + plural(l[2], 'conta', 'contas') + '</small>'; });
    barras('#mais-vendidos', Object.keys(f.itens).sort(function (a, b) { return f.itens[b] - f.itens[a]; }).slice(0, 5).map(function (k) { return [k, f.itens[k]]; }), function (l) { return l[1] + '×'; });
    $('#cancelados').innerHTML = f.canc.length ? '<ul class="canc">' + f.canc.map(function (p) { return '<li><span><b>' + num(p) + '</b> · ' + esc(titulo(p)) + '<small>' + esc(p.cancelado) + '</small></span><span>' + R(totalPed(p)) + '</span></li>'; }).join('') + '</ul>' : '<p class="vazio">Nenhum cancelamento hoje.</p>';
  }
  $('#fechar-caixa').addEventListener('click', function () {
    var f = fechamento();
    var msg = 'Fechamento da Coadouro · ' + S.longa(S.hoje) + '\nVendas: ' + R(f.vendas) + ' em ' + plural(f.contas, 'conta', 'contas') + ' (serviço: ' + R(f.serv) + ')\nRecebido: ' + R(f.recebido) + '\n' + FORMAS.map(function (x) { return '· ' + x + ': ' + R(f.forma[x]); }).join('\n') +
      '\nA receber: ' + R(f.falta) + '\nCancelamentos: ' + f.canc.length + (f.canc.length ? ' (' + R(soma(f.canc, totalPed)) + ')' : '') + '\nMais vendido: ' + (Object.keys(f.itens).sort(function (a, b) { return f.itens[b] - f.itens[a]; })[0] || '—');
    var vai = function () { S.demo(msg, 'Resumo do dia para o dono'); };
    if (f.ab.length) S.confirma('Ainda há ' + plural(f.ab.length, 'conta', 'contas') + ' em aberto (' + R(f.falta) + '). Fechar o caixa assim mesmo? O que estiver em aberto aparece no resumo.', vai); else vai();
  });

  /* ---------- tela: cardápio ---------- */
  function desenhaCardapio() {
    var vendidos = {}; hoje().forEach(function (p) { p.itens.forEach(function (l) { vendidos[l.id] = (vendidos[l.id] || 0) + l.q; }); });
    $('#cardapio').innerHTML = CATS.map(function (cat) {
      var its = D().itens.filter(function (i) { return i.cat === cat; });
      if (!its.length) return '';
      return '<h2 class="tit-bloco">' + cat + '</h2><table class="tabela itens-cardapio"><thead><tr><th scope="col">Item</th><th scope="col" class="num">Preço</th><th scope="col" class="num">Saíram hoje</th><th scope="col">Situação</th><th scope="col"><span class="sr">Editar</span></th></tr></thead><tbody>' +
        its.map(function (i) {
          return '<tr class="' + (i.disp ? '' : 'esgotado') + '"><td class="principal">' + esc(i.nome) + (i.det ? ' <span class="dica">· ' + esc(i.det) + '</span>' : '') + '</td><td class="num" data-rot="Preço">' + R(i.preco) + '</td><td class="num" data-rot="Saíram hoje">' + (vendidos[i.id] || 0) + '</td>' +
            '<td data-rot="Situação"><label class="chave"><input type="checkbox" data-disp="' + i.id + '"' + (i.disp ? ' checked' : '') + '><span>' + (i.disp ? 'Disponível' : 'Esgotado') + '</span><span class="sr"> · ' + esc(i.nome) + '</span></label></td>' +
            '<td class="acao"><button class="btn btn-s btn-sm" type="button" data-item="' + i.id + '">' + ico('editar') + 'Editar<span class="sr"> ' + esc(i.nome) + '</span></button></td></tr>';
        }).join('') + '</tbody></table>';
    }).join('');
  }
  $('#cardapio').addEventListener('change', function (ev) {
    var id = ev.target.dataset.disp; if (!id) return;
    var i = itemDe(id); i.disp = ev.target.checked; salva();
    S.aviso(i.nome + (i.disp ? ' voltou a ficar disponível.' : ' marcado como esgotado. Ele some da hora de pedir.'));
    $('[data-disp="' + id + '"]').focus();
  });
  $('#cardapio').addEventListener('click', function (ev) { var b = ev.target.closest('[data-item]'); if (b) abreItem(itemDe(b.dataset.item)); });

  var itemEd = null;
  $('#i-cat').innerHTML = CATS.map(function (c) { return '<option>' + c + '</option>'; }).join('');
  function abreItem(i) {
    itemEd = i || null;
    $('#i-titulo').textContent = i ? 'Editar item' : 'Novo item';
    $('#i-nome').value = i ? i.nome : ''; $('#i-cat').value = i ? i.cat : 'Cafés'; $('#i-preco').value = i ? fmtValor(i.preco) : ''; $('#i-det').value = i ? i.det : ''; $('#i-disp').checked = i ? i.disp : true;
    $('#i-excluir').hidden = !i;
    ['#i-nome', '#i-preco'].forEach(function (s) { $(s).setAttribute('aria-invalid', 'false'); }); $('#e-inome').hidden = $('#e-ipreco').hidden = true;
    S.abre($('#painel-item')); $('#i-nome').focus();
  }
  $('#novo-item').addEventListener('click', function () { abreItem(null); });
  $('#f-item').addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = $('#i-nome').value.trim(), preco = lerValor($('#i-preco').value);
    var mn = nome.length < 2, mp = !(preco > 0);
    $('#i-nome').setAttribute('aria-invalid', mn); $('#e-inome').hidden = !mn; $('#i-preco').setAttribute('aria-invalid', mp); $('#e-ipreco').hidden = !mp;
    if (mn) { $('#i-nome').focus(); return; } if (mp) { $('#i-preco').focus(); return; }
    var i = itemEd || { id: 'i' + Date.now().toString(36) };
    i.nome = nome; i.cat = $('#i-cat').value; i.preco = preco; i.det = $('#i-det').value.trim(); i.disp = $('#i-disp').checked;
    if (!itemEd) D().itens.push(i);
    S.fecha($('#painel-item')); salva(); S.aviso(itemEd ? i.nome + ' atualizado.' : i.nome + ' entrou no cardápio em ' + i.cat + '.');
    var b = $('[data-item="' + i.id + '"]'); if (b) b.focus();
  });
  $('#i-excluir').addEventListener('click', function () {
    var i = itemEd; S.fecha($('#painel-item'));
    S.confirma(i.nome + ' sai do cardápio. Os pedidos que já têm esse item não mudam.', function () { D().itens = D().itens.filter(function (x) { return x !== i; }); salva(); S.aviso(i.nome + ' saiu do cardápio.'); });
  });

  /* ---------- formulário de pedido ---------- */
  var form = $('#f-pedido'), editando = null, qtd = {}, travado = false;
  $('#f-mesa').innerHTML = MESAS.map(function (m) { return '<option value="' + m[0] + '">Mesa ' + m[0] + ' · ' + m[1] + ' lugares</option>'; }).join('');
  $('#f-bairro').innerHTML = BAIRROS.map(function (b) { return '<option value="' + b[0] + '">' + b[0] + ' · taxa ' + R(b[1]) + '</option>'; }).join('');
  for (var h = 7 * 60; h < 19 * 60; h += 15) { var o = document.createElement('option'); o.value = hstr(h); o.textContent = hm(h); $('#f-hora').appendChild(o); }
  var tipoForm = function () { return form.querySelector('input[name=tipo]:checked').value; };
  function desenhaItensForm() {
    $('#itens-form').innerHTML = CATS.map(function (cat) {
      var its = D().itens.filter(function (i) { return i.cat === cat && (i.disp || qtd[i.id]); });
      if (!its.length) return '';
      return '<h3 class="cat-form">' + cat + '</h3><ul class="itens-form">' + its.map(function (i) {
        return '<li data-id="' + i.id + '"><span class="nome" id="fi-' + i.id + '">' + esc(i.nome) + '<span class="preco">' + R(i.preco) + (i.det ? ' · ' + esc(i.det) : '') + (i.disp ? '' : ' · esgotado') + '</span></span>' +
          '<span class="passo" role="group" aria-labelledby="fi-' + i.id + '"><button type="button" data-d="-1" aria-label="Tirar um ' + esc(i.nome) + '">−</button><output aria-live="polite" aria-label="Quantidade de ' + esc(i.nome) + '">0</output><button type="button" data-d="1" aria-label="Pôr mais um ' + esc(i.nome) + '"' + (i.disp ? '' : ' disabled') + '>+</button></span></li>';
      }).join('') + '</ul>';
    }).join('');
    var esg = D().itens.filter(function (i) { return !i.disp && !qtd[i.id]; });
    if (esg.length) $('#itens-form').insertAdjacentHTML('beforeend', '<p class="dica-bloco esg">Esgotado agora: ' + esg.map(function (i) { return esc(i.nome); }).join(', ') + '.</p>');
  }
  function mostraForm() {
    var t = tipoForm(), sub = 0;
    $$('#f-pedido [data-para]').forEach(function (g) { g.hidden = g.dataset.para.split(' ').indexOf(t) < 0; });
    $('#g-tipo').hidden = travado; if (travado && t === 'mesa') $('#f-mesa').closest('.campo').hidden = true;
    $('#l-hora').textContent = t === 'entrega' ? 'Entrega prevista' : 'Retirada';
    $$('#itens-form li').forEach(function (li) { var n = qtd[li.dataset.id] || 0, i = itemDe(li.dataset.id); $('output', li).textContent = n; $('[data-d="-1"]', li).disabled = !n; li.classList.toggle('tem', n > 0); sub += n * (i ? i.preco : 0); });
    var taxa = t === 'entrega' ? TAXA[$('#f-bairro').value] : 0;
    $('#f-total').textContent = R(sub + taxa);
    $('#f-total-rot').textContent = taxa ? 'Total com entrega (' + R(taxa) + ')' : 'Total';
    $('#salvar').textContent = editando ? 'Salvar alterações' : t === 'mesa' ? 'Enviar para a cozinha' : 'Salvar pedido';
  }
  $('#itens-form').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-d]'); if (!b) return;
    var id = b.closest('li').dataset.id; qtd[id] = Math.max(0, (qtd[id] || 0) + +b.dataset.d); if (!qtd[id]) delete qtd[id];
    mostraForm(); $('#e-itens').hidden = true;
    if (b.disabled) $('[data-d="1"]', b.parentNode).focus();
  });
  form.addEventListener('change', function (e) { if (e.target.name === 'tipo' || e.target.id === 'f-bairro') mostraForm(); });
  function marca(campo, erro, mal) { $(campo).setAttribute('aria-invalid', mal ? 'true' : 'false'); $(erro).hidden = !mal; }
  function abreForm(p, pre) {
    editando = p || null; pre = pre || {};
    var t = p ? p.tipo : pre.tipo || 'retirada';
    $('#p-titulo').textContent = p ? 'Editar pedido ' + num(p) : t === 'mesa' && pre.mesa ? 'Pedido da Mesa ' + pre.mesa : 'Novo pedido';
    form.querySelector('input[name=tipo][value="' + t + '"]').checked = true;
    travado = !!p || !!pre.mesa; $('#g-tipo').disabled = travado; $('#f-mesa').disabled = travado;
    $('#f-mesa').value = String(p ? p.mesa || 1 : pre.mesa || (MESAS.filter(function (m) { return !contaMesa(m[0]); })[0] || [1])[0]);
    $('#f-cliente').value = p ? p.cli : ''; $('#f-tel').value = p ? p.tel : ''; $('#f-end').value = p ? p.end : ''; $('#f-obs').value = p ? p.obs : '';
    $('#f-bairro').value = p && p.bairro ? p.bairro : BAIRROS[0][0];
    var dia = p ? p.dia : diaVisto;
    form.querySelector('input[name=dia][value="' + dia + '"]').checked = true;
    $('#f-hora').value = p && p.hora ? p.hora : hstr(Math.min(18 * 60 + 45, dia === 'amanha' ? 8 * 60 : Math.ceil((agora() + 20) / 15) * 15));
    qtd = {}; if (p) p.itens.forEach(function (l) { qtd[l.id] = l.q; });
    marca('#f-cliente', '#e-cliente', false); marca('#f-end', '#e-end', false); $('#e-itens').hidden = true;
    $('#cancelar-ped').hidden = !p;
    desenhaItensForm(); mostraForm(); S.abre($('#painel'));
    (t === 'mesa' ? $('#itens-form button[data-d="1"]:not(:disabled)') : $('#f-cliente')).focus();
  }
  $('#novo').addEventListener('click', function () { abreForm(null, { tipo: $('[data-tela="mesas"]').hidden ? 'retirada' : 'mesa' }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = tipoForm(), cli = $('#f-cliente').value.trim(), end = $('#f-end').value.trim(), semItens = !Object.keys(qtd).length;
    var mc = t !== 'mesa' && cli.length < 2, me = t === 'entrega' && end.length < 4;
    marca('#f-cliente', '#e-cliente', mc); marca('#f-end', '#e-end', me); $('#e-itens').hidden = !semItens;
    if (mc) { $('#f-cliente').focus(); return; }
    if (me) { $('#f-end').focus(); return; }
    if (semItens) { $('#itens-form button[data-d="1"]:not(:disabled)').focus(); return; }
    var d = D(), p = editando || { n: d.prox++, etapa: 'novo', criado: agora(), avisado: false, saiu: 0, cancelado: '', conta: 0, tipo: t };
    var linhas = Object.keys(qtd).map(function (k) { var i = itemDe(k), velho = editando && editando.itens.filter(function (l) { return l.id === k; })[0]; return { id: k, nome: i ? i.nome : velho.nome, preco: i ? i.preco : velho.preco, q: qtd[k] }; });
    p.itens = linhas; p.obs = $('#f-obs').value.trim();
    if (t === 'mesa') { p.mesa = +$('#f-mesa').value; p.dia = 'hoje'; p.cli = ''; p.hora = ''; p.taxa = 0; }
    else { p.cli = cli; p.tel = $('#f-tel').value.trim(); p.dia = form.querySelector('input[name=dia]:checked').value; p.hora = $('#f-hora').value; p.end = t === 'entrega' ? end : ''; p.bairro = t === 'entrega' ? $('#f-bairro').value : ''; p.taxa = t === 'entrega' ? TAXA[p.bairro] : 0; }
    // conta: mesa usa a conta aberta da mesa; retirada e entrega de hoje têm conta própria
    if (t === 'mesa' && !p.conta) { var c = contaMesa(p.mesa); if (!c) { c = { id: d.proxConta++, tipo: 'mesa', mesa: p.mesa, aberta: agora(), fechada: 0, servico: true, pediuConta: false, pags: [] }; d.contas.push(c); } p.conta = c.id; }
    if (t !== 'mesa') {
      if (p.dia === 'hoje' && !p.conta) { var nc = { id: d.proxConta++, tipo: t, mesa: 0, aberta: agora(), fechada: 0, servico: false, pediuConta: false, pags: [] }; d.contas.push(nc); p.conta = nc.id; }
      if (p.dia === 'amanha' && p.conta && !contaDe(p.conta).pags.length) { d.contas = d.contas.filter(function (x) { return x.id !== p.conta; }); p.conta = 0; }
    }
    if (!editando) d.pedidos.push(p);
    S.fecha($('#painel')); $('#busca').value = ''; salva();
    S.aviso(editando ? 'Pedido ' + num(p) + ' atualizado.' : t === 'mesa' ? 'Pedido da mesa ' + p.mesa + ' enviado para a cozinha (' + num(p) + ').' : 'Pedido ' + num(p) + ' de ' + p.cli + ' criado para ' + (p.dia === 'hoje' ? 'hoje' : 'amanhã') + ', ' + hm(min(p.hora)) + '.');
    var art = $('#p-' + p.n); if (art && !art.closest('[hidden]')) art.focus();
  });
  $('#cancelar-ped').addEventListener('click', function () {
    var p = editando, j = $('#cancelar'); S.fecha($('#painel'));
    $('#x-texto').textContent = 'O pedido ' + num(p) + ' (' + titulo(p) + ', ' + R(totalPed(p)) + ') sai do quadro e da cozinha e fica registrado nos cancelamentos do caixa.';
    j.onclose = function () {
      if (j.returnValue !== 'sim') return; j.returnValue = '';
      p.cancelado = j.querySelector('input[name=motivo]:checked').value;
      var c = p.conta && contaDe(p.conta);
      if (c && !c.pags.length && !calc(D(), c).ps.length) { D().contas = D().contas.filter(function (x) { return x !== c; }); p.conta = 0; }
      salva(); S.aviso('Pedido ' + num(p) + ' cancelado: ' + p.cancelado.toLowerCase() + '.');
    };
    S.abre(j);
  });

  /* ---------- receber (pagamentos, divisão e troco) ---------- */
  var pagConta = null, pessoas = 1, voltaMesa = 0;
  function abrePag(id, daMesa) { pagConta = contaDe(id); pessoas = 1; voltaMesa = daMesa || 0; mostraPag(true); S.abre($('#painel-pag')); $('#r-valor').focus(); }
  function mostraPag(novoValor) {
    var c = pagConta, k = calc(D(), c);
    $('#r-titulo').textContent = 'Receber · ' + nomeConta(c);
    $('#r-conta').innerHTML = '<dl class="conta-res"><div><dt>Itens</dt><dd>' + R(k.sub) + '</dd></div>' + (k.taxa ? '<div><dt>Taxa de entrega</dt><dd>' + R(k.taxa) + '</dd></div>' : '') + (k.serv ? '<div><dt>Serviço (10%)</dt><dd>' + R(k.serv) + '</dd></div>' : '') + '<div class="tot"><dt>Total</dt><dd>' + R(k.total) + '</dd></div>' +
      c.pags.map(function (x) { return '<div class="pago"><dt>Pago · ' + x.forma + ' · ' + hm(x.min) + '</dt><dd>− ' + R(x.valor) + '</dd></div>'; }).join('') + '</dl>';
    $('#r-falta').textContent = R(k.falta);
    $('#r-pessoas').textContent = pessoas;
    $('[data-div="-1"]').disabled = pessoas <= 1;
    var parte = Math.ceil(k.falta / pessoas);
    $('#r-por-pessoa').textContent = pessoas > 1 ? R(parte) + ' por pessoa' : '';
    if (novoValor) $('#r-valor').value = fmtValor(pessoas > 1 ? parte : k.falta);
    $('#r-valor').setAttribute('aria-invalid', 'false'); $('#e-valor').hidden = true;
    mostraTroco();
  }
  function mostraTroco() {
    var din = $('#f-pag').querySelector('input[name=forma]:checked').value === 'Dinheiro';
    $('#g-recebido').hidden = !din;
    var v = lerValor($('#r-valor').value), rec = lerValor($('#r-recebido').value);
    $('#r-troco').textContent = din && rec > 0 && v > 0 ? (rec >= v ? 'Troco: ' + R(rec - v) : 'Faltam ' + R(v - rec) + ' para cobrir o valor') : '';
  }
  $('#f-pag').addEventListener('click', function (e) { var b = e.target.closest('[data-div]'); if (!b) return; pessoas = Math.max(1, Math.min(20, pessoas + +b.dataset.div)); mostraPag(true); if (b.disabled) $('[data-div="1"]').focus(); });
  $('#f-pag').addEventListener('input', mostraTroco);
  $('#f-pag').addEventListener('change', mostraTroco);
  $('#f-pag').addEventListener('submit', function (e) {
    e.preventDefault();
    var c = pagConta, k = calc(D(), c), v = lerValor($('#r-valor').value), forma = this.querySelector('input[name=forma]:checked').value, rec = lerValor($('#r-recebido').value);
    var erro = !(v > 0) ? 'Escreva um valor maior que zero.' : v > k.falta ? 'O valor passa do que falta pagar (' + R(k.falta) + ').' : forma === 'Dinheiro' && !(rec >= v) ? 'O valor recebido em dinheiro precisa cobrir o pagamento.' : '';
    if (erro) { $('#e-valor').textContent = erro; $('#e-valor').hidden = false; var campo = erro.indexOf('dinheiro') > 0 ? '#r-recebido' : '#r-valor'; $(campo).setAttribute('aria-invalid', 'true'); $(campo).focus(); return; }
    c.pags.push({ forma: forma, valor: v, min: agora(), recebido: forma === 'Dinheiro' ? rec : 0 });
    var troco = forma === 'Dinheiro' ? ' Troco: ' + R(rec - v) + '.' : '';
    $('#r-recebido').value = '';
    if (calc(D(), c).falta === 0) {
      c.fechada = agora(); var nome = nomeConta(c);
      S.fecha($('#painel-pag')); voltaMesa = 0; salva();
      S.aviso('Pagamento de ' + R(v) + ' (' + forma + ') registrado.' + troco + ' Conta ' + (c.tipo === 'mesa' ? 'da ' + nome + ' fechada. Mesa liberada.' : 'fechada.'));
    } else {
      if (pessoas > 1) pessoas--;   // uma pessoa já pagou a parte dela
      salva(); mostraPag(true); $('#r-valor').focus();
      S.aviso('Pagamento de ' + R(v) + ' (' + forma + ') registrado.' + troco + ' Falta ' + R(calc(D(), c).falta) + '.');
    }
  });
  $('#painel-pag').addEventListener('close', function () { if (voltaMesa && contaMesa(voltaMesa)) { var n = voltaMesa; voltaMesa = 0; abreMesa(n); } });

  /* ---------- ações nos cartões, mesas e caixa ---------- */
  function move(p, etapa) {
    if (p.etapa === etapa) return;
    p.etapa = etapa; if (POS[etapa] < POS.pronto) { p.avisado = false; p.saiu = 0; }
    salva(); S.aviso('Pedido ' + num(p) + ' (' + titulo(p) + ') foi para ' + ETAPAS[POS[etapa]].nome + '.');
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.mesa) { abreMesa(+b.dataset.mesa); return; }
    if (b.dataset.receber && !b.closest('#painel-mesa')) { abrePag(+b.dataset.receber); return; }
    var art = b.closest('.pedido'); if (!art) return;
    var p = acha(+art.dataset.n);
    if (b.dataset.move) { move(p, b.dataset.move); var novo = $('#p-' + p.n); if (novo) novo.focus(); }
    else if (b.hasAttribute('data-editar')) abreForm(p);
    else if (b.hasAttribute('data-avisar')) { p.avisado = true; salva(); S.demo('Olá, ' + primeiro(p.cli) + '! Seu pedido ' + num(p) + ' da Coadouro está pronto para retirada no balcão.\nTotal: ' + R(totalPed(p)) + '. Até já!', 'Aviso de pedido pronto'); }
    else if (b.hasAttribute('data-saiu')) { p.saiu = agora(); salva(); S.demo('Olá, ' + primeiro(p.cli) + '! Seu pedido ' + num(p) + ' da Coadouro saiu para entrega e chega em cerca de 20 minutos.\nTotal: ' + R(totalPed(p)) + ' (com ' + R(p.taxa) + ' de entrega).', 'Aviso de saída para entrega'); }
  });
  var arrastado = null;
  document.addEventListener('dragstart', function (e) { var a = e.target.closest && e.target.closest('.pedido[draggable]'); if (!a) return; arrastado = +a.dataset.n; a.classList.add('arrastando'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(arrastado)); });
  document.addEventListener('dragend', function () { arrastado = null; $$('.arrastando, .solta').forEach(function (x) { x.classList.remove('arrastando', 'solta'); }); });
  document.addEventListener('dragover', function (e) { var c = e.target.closest && e.target.closest('.coluna'); if (!c || arrastado === null) return; e.preventDefault(); $$('.solta').forEach(function (x) { if (x !== c) x.classList.remove('solta'); }); c.classList.add('solta'); });
  document.addEventListener('drop', function (e) { var c = e.target.closest && e.target.closest('.coluna'); if (!c || arrastado === null) return; e.preventDefault(); move(acha(arrastado), c.dataset.etapa); });

  $('#busca').addEventListener('input', desenhaPedidos);
  $$('.filtros [data-tipo]').forEach(function (b) { b.addEventListener('click', function () { filtro = b.dataset.tipo; $$('.filtros [data-tipo]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); desenhaPedidos(); }); });
  $$('.segm [data-dia]').forEach(function (b) { b.addEventListener('click', function () { diaVisto = b.dataset.dia; $$('.segm [data-dia]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); $('#bloco-hoje').hidden = diaVisto !== 'hoje'; $('#bloco-amanha').hidden = diaVisto !== 'amanha'; }); });

  /* ---------- relógio, contadores e desenho ---------- */
  function tique() {
    var a = agora();
    $('#agora').textContent = hm(a);
    $$('[data-desde]').forEach(function (s) { s.textContent = Math.max(0, a - +s.dataset.desde); });
    $$('.ticket').forEach(function (t) { var e = a - +t.dataset.criado; t.classList.toggle('demora', e > 10 && e <= 15); t.classList.toggle('atraso', e > 15); });
  }
  var telaAtual = 'pedidos';
  function desenha() {
    var hj = hoje(), ab = abertas();
    $('#n-pedidos').textContent = hj.filter(function (p) { return p.etapa !== 'entregue'; }).length;
    $('#n-mesas').textContent = MESAS.filter(function (m) { return contaMesa(m[0]); }).length;
    $('#n-cozinha').textContent = hj.filter(function (p) { return p.etapa === 'novo' || p.etapa === 'preparando'; }).length;
    $('#n-caixa').textContent = ab.length;
    ({ pedidos: desenhaPedidos, mesas: desenhaMesas, cozinha: desenhaCozinha, caixa: desenhaCaixa, cardapio: desenhaCardapio })[telaAtual]();
    tique();
  }
  setInterval(tique, 15000);

  $('.recomecar').addEventListener('click', function () {
    S.confirma('Recomeçar apaga o que você fez nesta demonstração e volta ao início, às 9h40.', function () { G.recomeca(); $('#busca').value = ''; desenha(); S.aviso('Demonstração recomeçada.'); });
  });
  var SUB = { pedidos: S.longa(S.hoje), mesas: 'Toque numa mesa para lançar ou receber', cozinha: S.longa(S.hoje), caixa: S.longa(S.hoje), cardapio: 'Itens, preços e o que está esgotado' };
  S.telas(function (tela) { telaAtual = tela; $('#subtitulo').textContent = SUB[tela]; desenha(); });
})();
