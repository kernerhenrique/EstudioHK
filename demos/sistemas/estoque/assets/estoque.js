/* Estoque e balcão · Ofício Barbearia · demonstração da EstudioHK
   Lotes com validade (sai primeiro o que vence antes), venda no balcão, gasto por serviço e pedido ao fornecedor. Valores em centavos. */
(function () {
  'use strict';
  var S = window.SIS, $ = S.$, $$ = S.$$, esc = S.esc;
  var R = function (c) { return S.dinheiro(c / 100); };
  var dois = function (n) { return String(n).padStart(2, '0'); };
  var br = function (s) { return s ? s.split('-').reverse().join('/') : '—'; };
  var soma = function (a, f) { return a.reduce(function (t, x) { return t + f(x); }, 0); };
  var plural = function (n, um, varios) { return n + ' ' + (n === 1 ? um : varios); };
  var ico = function (id) { return '<svg class="ico" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
  var lerValor = function (t) { t = String(t).trim().replace(/[R$\s]/g, ''); if (!t) return NaN; if (/,/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); var v = Math.round(parseFloat(t) * 100); return isFinite(v) ? v : NaN; };
  var fmtValor = function (c) { return (c / 100).toFixed(2).replace('.', ','); };
  var dec = function (x, c) { return x.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: c === undefined ? 1 : c }); };
  var res = function (rot, val, det) { return '<div class="res"><small>' + rot + '</small><b>' + val + '</b><span>' + det + '</span></div>'; };
  var agoraHora = function () { var d = new Date(); return dois(d.getHours()) + ':' + dois(d.getMinutes()); };
  var hm = function (h) { var p = h.split(':'); return +p[0] + 'h' + p[1]; };

  /* ---------- a Ofício (mesmos serviços e barbeiros da demo do site) ---------- */
  var SERVICOS = [
    { id: 'corte', nome: 'Corte', preco: 6000 }, { id: 'barba', nome: 'Barba com toalha quente', preco: 4500 }, { id: 'combo', nome: 'Corte + barba', preco: 9500 },
    { id: 'degrade', nome: 'Degradê navalhado', preco: 6500 }, { id: 'pigmentacao', nome: 'Pigmentação de barba', preco: 4000 }, { id: 'infantil', nome: 'Corte infantil', preco: 5000 },
    { id: 'sobrancelha', nome: 'Sobrancelha', preco: 2000 }, { id: 'pezinho', nome: 'Pezinho', preco: 2000 }];
  var SERV = {}; SERVICOS.forEach(function (s) { SERV[s.id] = s; });
  var BARBEIROS = ['Léo', 'Caio', 'Rafa'];
  var UN = { un: 'un', ml: 'ml', g: 'g' };

  function semente() {
    var d = { proxId: 1, proxPed: 18, forns: [], prods: [], receitas: {}, atends: [], vendas: [], peds: [], movs: [] };
    d.forns = [{ id: 'cos', nome: 'Cosméticos Exemplo', tel: '(27) 3000-0001', contato: 'Sandra' }, { id: 'desc', nome: 'Descartáveis Exemplo', tel: '(27) 3000-0002', contato: 'Marcos' }, { id: 'mad', nome: 'Ateliê Exemplo (madeira)', tel: '(27) 3000-0003', contato: 'Jonas' }];
    var P = function (id, nome, tipo, un, emb, embNome, custo, preco, min, forn, lotes, vence) { d.prods.push({ id: id, nome: nome, tipo: tipo, un: un, emb: emb, embNome: embNome, custo: custo, preco: preco, min: min, forn: forn, vence: vence !== false, lotes: lotes.map(function (l) { return { q: l[0], val: l[1] === null ? '' : S.dia(l[1]) }; }) }); };
    // uso no salão
    P('shampoo', 'Shampoo profissional', 'uso', 'ml', 1000, 'galão', 4500, 0, 1000, 'cos', [[2300, 210]]);
    P('espuma', 'Espuma de barbear', 'uso', 'ml', 500, 'frasco', 2800, 0, 1000, 'cos', [[600, 300]]);
    P('posbarba', 'Pós-barba (loção)', 'uso', 'ml', 500, 'frasco', 3200, 0, 500, 'cos', [[400, 55], [1000, 400]]);
    P('gel', 'Gel de barbear transparente', 'uso', 'ml', 500, 'frasco', 3500, 0, 500, 'cos', [[900, 260]]);
    P('talco', 'Talco', 'uso', 'g', 200, 'pote', 1200, 0, 200, 'cos', [[350, 500]]);
    P('pigmento', 'Pigmento para barba (preto)', 'uso', 'ml', 30, 'frasco', 6500, 0, 30, 'cos', [[10, 20], [12, 240]]);
    P('lamina', 'Lâmina descartável', 'uso', 'un', 100, 'caixa', 4900, 0, 100, 'desc', [[140, null]], false);
    P('toalha', 'Toalha descartável', 'uso', 'un', 100, 'pacote', 3800, 0, 150, 'desc', [[60, null]], false);
    P('gola', 'Gola higiênica', 'uso', 'un', 500, 'rolo', 2500, 0, 200, 'desc', [[420, null]], false);
    P('alcool', 'Álcool 70%', 'uso', 'ml', 1000, 'litro', 1400, 0, 1000, 'desc', [[3000, 600]]);
    // venda no balcão
    P('pomada', 'Pomada modeladora efeito seco', 'venda', 'un', 1, 'un', 2200, 4900, 6, 'cos', [[14, 420]]);
    P('pomadabr', 'Pomada modeladora efeito brilho', 'venda', 'un', 1, 'un', 2200, 4900, 6, 'cos', [[4, 380]]);
    P('oleo', 'Óleo para barba 30 ml', 'venda', 'un', 1, 'un', 2600, 5900, 5, 'cos', [[3, 45], [6, 330]]);
    P('balm', 'Balm para barba', 'venda', 'un', 1, 'un', 2400, 5400, 4, 'cos', [[7, 290]]);
    P('shbarba', 'Shampoo para barba 120 ml', 'venda', 'un', 1, 'un', 1900, 3900, 4, 'cos', []);
    P('pente', 'Pente de madeira', 'venda', 'un', 1, 'un', 900, 2500, 4, 'mad', [[12, null]], false);
    d.receitas = {
      corte: [['shampoo', 15], ['toalha', 1], ['gola', 1], ['talco', 3], ['alcool', 5]],
      barba: [['espuma', 20], ['lamina', 1], ['posbarba', 10], ['toalha', 2], ['alcool', 5]],
      combo: [['shampoo', 15], ['espuma', 20], ['lamina', 1], ['posbarba', 10], ['toalha', 2], ['gola', 1], ['talco', 3], ['alcool', 5]],
      degrade: [['shampoo', 15], ['lamina', 1], ['toalha', 1], ['gola', 1], ['talco', 3], ['alcool', 5]],
      pigmentacao: [['pigmento', 1], ['toalha', 1]],
      infantil: [['shampoo', 10], ['toalha', 1], ['gola', 1], ['talco', 2]],
      sobrancelha: [['lamina', 1]],
      pezinho: [['lamina', 1], ['talco', 2]]
    };
    Object.keys(d.receitas).forEach(function (k) { d.receitas[k] = d.receitas[k].map(function (x) { return { p: x[0], q: x[1] }; }); });
    var M = function (dia, hora, p, q, tipo, det) { d.movs.push({ id: d.proxId++, data: S.dia(dia), hora: hora, p: p, q: q, tipo: tipo, det: det || '' }); };
    // atendimentos de hoje (o estoque acima já está depois deles)
    [['09:00', 'Léo', 'degrade'], ['09:15', 'Caio', 'barba'], ['10:00', 'Rafa', 'corte'], ['10:30', 'Léo', 'combo'], ['11:00', 'Caio', 'pigmentacao'], ['11:15', 'Rafa', 'infantil'], ['13:30', 'Léo', 'pezinho'], ['14:00', 'Caio', 'combo']].forEach(function (a) {
      var gasto = d.receitas[a[2]].map(function (x) { return { p: x.p, q: x.q }; });
      d.atends.push({ id: d.proxId++, hora: a[0], barb: a[1], serv: a[2], gasto: gasto });
      gasto.forEach(function (g) { M(0, a[0], g.p, -g.q, 'Atendimento', SERV[a[2]].nome + ' · ' + a[1]); });
    });
    var V = function (hora, itens, forma, cli) { var its = itens.map(function (x) { var p = d.prods.filter(function (y) { return y.id === x[0]; })[0]; return { p: x[0], q: x[1], preco: p.preco, custo: p.custo }; }); d.vendas.push({ id: d.proxId++, hora: hora, itens: its, total: soma(its, function (i) { return i.q * i.preco; }), forma: forma, cli: cli || '' }); its.forEach(function (i) { M(0, hora, i.p, -i.q, 'Venda', 'balcão'); }); };
    V('10:20', [['pomada', 1]], 'Pix', 'Gustavo'); V('11:40', [['oleo', 1], ['balm', 1]], 'Cartão'); V('14:10', [['pente', 1], ['pomada', 1]], 'Dinheiro', 'Henrique');
    d.peds.push({ id: d.proxId++, n: 16, forn: 'desc', itens: [{ p: 'lamina', emb: 2 }, { p: 'gola', emb: 1 }], status: 'recebido', criado: S.dia(-9), recebido: S.dia(-6), chegou: [2, 1] });
    M(-6, '15:20', 'lamina', 200, 'Compra', 'pedido nº 16'); M(-6, '15:20', 'gola', 500, 'Compra', 'pedido nº 16');
    M(-3, '18:40', 'posbarba', -100, 'Saída', 'Perda ou quebra');
    d.peds.push({ id: d.proxId++, n: 17, forn: 'cos', itens: [{ p: 'shbarba', emb: 6 }, { p: 'pomadabr', emb: 6 }], status: 'enviado', criado: S.dia(-2), recebido: '', chegou: [] });
    return d;
  }

  var G = S.guarda('estudiohk-sis-estoque-v1', semente, true);
  var D = function () { return G.d; };
  var prod = function (id) { return D().prods.filter(function (p) { return p.id === id; })[0]; };
  var forn = function (id) { return D().forns.filter(function (f) { return f.id === id; })[0]; };
  var estoque = function (p) { return soma(p.lotes, function (l) { return l.q; }); };
  var custoBase = function (p) { return p.custo / p.emb; };
  var valorParado = function (p) { return Math.round(estoque(p) * custoBase(p)); };
  var qtdTxt = function (p, q) { return p.un === 'un' ? plural(dec(q, 0), 'un', 'un') : dec(q, 0) + ' ' + UN[p.un]; };
  var embTxt = function (p, n) { return p.emb === 1 ? plural(n, 'un', 'un') : n + ' ' + p.embNome + (n === 1 ? '' : 's') + ' de ' + dec(p.emb, 0) + ' ' + UN[p.un]; };
  var proxVal = function (p) { var ls = p.lotes.filter(function (l) { return l.q > 0 && l.val; }).sort(function (a, b) { return a.val < b.val ? -1 : 1; }); return ls[0] || null; };
  var vencendo = function (p) { var l = proxVal(p); return l && S.entre(S.hoje, l.val) <= 60 ? l : null; };
  var aCaminho = function (p) { return D().peds.some(function (o) { return o.status === 'enviado' && o.itens.some(function (i) { return i.p === p.id; }); }); };
  function sit(p) { var e = estoque(p); return e <= 0 ? { k: 'zerado', t: 'Zerado', c: 'perigo' } : e <= p.min ? { k: 'acabando', t: 'Acabando', c: 'alerta' } : { k: 'ok', t: 'Ok', c: 'ok' }; }
  var sugestao = function (p) { return Math.max(1, Math.ceil((p.min * 2 - estoque(p)) / p.emb)); };
  function salva() { G.salva(); desenha(); }

  /* ---------- baixa e entrada (sai primeiro o lote que vence antes) ---------- */
  function baixa(p, q) {
    var falta = q;
    p.lotes.sort(function (a, b) { return (a.val || '9999') < (b.val || '9999') ? -1 : 1; });
    p.lotes.forEach(function (l) { var t = Math.min(l.q, falta); l.q -= t; falta -= t; });
    p.lotes = p.lotes.filter(function (l) { return l.q > 0; });
    return q - falta;
  }
  function entrada(p, q, val) { var l = p.lotes.filter(function (x) { return x.val === (val || ''); })[0]; if (l) l.q += q; else p.lotes.push({ q: q, val: val || '' }); }
  function mov(p, q, tipo, det) { D().movs.push({ id: D().proxId++, data: S.hoje, hora: agoraHora(), p: p.id, q: q, tipo: tipo, det: det || '' }); }
  function avisoMinimo(antes, p) { var e = estoque(p); if (antes > p.min && e <= p.min) return ' ' + p.nome + (e <= 0 ? ' zerou' : ' chegou no mínimo') + ' e entrou na lista de compras.'; return ''; }

  /* ---------- tela: início ---------- */
  function desenhaInicio() {
    var ps = D().prods, ac = ps.filter(function (p) { return sit(p).k !== 'ok'; }), ven = ps.filter(vencendo);
    var vh = D().vendas, total = soma(vh, function (v) { return v.total; }), lucro = soma(vh, function (v) { return soma(v.itens, function (i) { return i.q * (i.preco - i.custo); }); });
    var at = D().atends, custoAt = soma(at, function (a) { return soma(a.gasto, function (g) { var p = prod(g.p); return p ? g.q * custoBase(p) : 0; }); });
    $('#resumo-inicio').innerHTML = res('Valor em estoque', R(soma(ps, valorParado)), 'pelo custo, ' + plural(ps.length, 'produto', 'produtos')) +
      res('Acabando', ac.length, plural(ac.filter(aCaminho).length, 'já com pedido a caminho', 'já com pedido a caminho')) +
      res('Vendas de hoje', R(total), 'lucro de ' + R(lucro)) +
      res('Atendimentos hoje', at.length, at.length ? R(Math.round(custoAt / at.length)) + ' de produto por atendimento' : 'nenhum ainda');
    $('#acabando').innerHTML = ac.length ? ac.map(function (p) { var s = sit(p);
      return '<li><div><b>' + esc(p.nome) + '</b><span class="dica">' + qtdTxt(p, estoque(p)) + ' de mínimo ' + qtdTxt(p, p.min) + '</span><span class="linha-etq"><span class="etq ' + s.c + '">' + s.t + '</span>' + (aCaminho(p) ? '<span class="etq s-caminho">' + ico('caminhao') + 'Pedido a caminho</span>' : '<span class="etq">Na lista de compras</span>') + '</span></div></li>'; }).join('') + '<li class="mais"><button class="btn btn-s btn-sm" type="button" data-ir="compras">Ver lista de compras' + ico('seta') + '</button></li>' : '<li class="vazio">Nada acabando.</li>';
    $('#vencendo').innerHTML = ven.length ? ven.sort(function (a, b) { return vencendo(a).val < vencendo(b).val ? -1 : 1; }).map(function (p) { var l = vencendo(p), dd = S.entre(S.hoje, l.val);
      return '<li><div><b>' + esc(p.nome) + '</b><span class="dica">' + qtdTxt(p, l.q) + ' vencem em ' + br(l.val) + '</span><span class="linha-etq"><span class="etq ' + (dd <= 30 ? 'perigo' : 'alerta') + '">' + (dd <= 0 ? 'Vence hoje' : 'Faltam ' + plural(dd, 'dia', 'dias')) + '</span>' + (p.tipo === 'venda' ? '<span class="etq">Ofereça no balcão</span>' : '<span class="etq">Usar primeiro</span>') + '</span></div></li>'; }).join('') : '<li class="vazio">Nada vencendo nos próximos 60 dias.</li>';
    var cam = D().peds.filter(function (o) { return o.status === 'enviado'; });
    $('#caminho').innerHTML = cam.length ? cam.map(function (o) { return '<li><div><b>Pedido nº ' + o.n + ' · ' + esc(forn(o.forn).nome) + '</b><span class="dica">' + o.itens.map(function (i) { return embTxt(prod(i.p), i.emb) + ' de ' + prod(i.p).nome.toLowerCase(); }).join(', ') + '</span><span class="linha-etq"><span class="etq s-caminho">Enviado em ' + S.curta(o.criado) + '</span></span></div><div class="r-acoes"><button class="btn btn-p btn-sm" type="button" data-receber="' + o.id + '">' + ico('check') + 'Chegou: conferir<span class="sr"> o pedido ' + o.n + '</span></button></div></li>'; }).join('') : '<li class="vazio">Nenhum pedido a caminho.</li>';
  }

  /* ---------- tela: produtos ---------- */
  var filtro = 'todos', aba = 'lista', filtroMov = 'todos';
  function barra(p) { var e = estoque(p), max = Math.max(p.min * 2, e, 1); return '<span class="e-trilho" aria-hidden="true"><i class="' + sit(p).k + '" style="width:' + (e / max * 100).toFixed(0) + '%"></i><b style="left:' + (p.min / max * 100).toFixed(0) + '%"></b></span>'; }
  function desenhaProdutos() {
    var ps = D().prods.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome); }), busca = $('#busca').value.trim().toLowerCase();
    var F = { todos: ['Todos', function () { return true; }], uso: ['Uso no salão', function (p) { return p.tipo === 'uso'; }], venda: ['Venda no balcão', function (p) { return p.tipo === 'venda'; }], acabando: ['Acabando', function (p) { return sit(p).k !== 'ok'; }], vencendo: ['Vencendo', function (p) { return !!vencendo(p); }] };
    $('#filtros').innerHTML = Object.keys(F).map(function (k) { return '<button type="button" data-filtro="' + k + '" aria-pressed="' + (filtro === k) + '">' + F[k][0] + ' <span class="f-n">' + ps.filter(F[k][1]).length + '</span></button>'; }).join('');
    var lista = ps.filter(F[filtro][1]).filter(function (p) { return !busca || p.nome.toLowerCase().indexOf(busca) >= 0; });
    $('#lista-produtos').innerHTML = lista.length ? lista.map(function (p) { var s = sit(p), e = estoque(p), l = proxVal(p), v = vencendo(p);
      return '<tr><td class="principal"><span class="o-cli"><b>' + esc(p.nome) + '</b><span class="dica">' + (p.tipo === 'venda' ? 'Venda · ' + R(p.preco) : 'Uso no salão') + ' · ' + esc(forn(p.forn).nome) + '</span></span></td>' +
        '<td data-rot="Em estoque"><span class="est"><span><b>' + qtdTxt(p, e) + '</b>' + (p.emb > 1 ? '<span class="dica"> · ' + dec(e / p.emb) + ' ' + p.embNome + (e / p.emb === 1 ? '' : 's') + '</span>' : '') + '</span>' + barra(p) + '<span class="linha-etq"><span class="etq ' + s.c + '">' + s.t + '</span><span class="dica">mínimo ' + qtdTxt(p, p.min) + '</span></span></span></td>' +
        '<td data-rot="Validade">' + (l ? br(l.val) + (v ? ' <span class="etq ' + (S.entre(S.hoje, v.val) <= 30 ? 'perigo' : 'alerta') + '">vence logo</span>' : '') : '<span class="dica">' + (p.vence ? 'sem estoque' : 'não vence') + '</span>') + '</td>' +
        '<td class="num" data-rot="Valor parado">' + R(valorParado(p)) + '</td>' +
        '<td class="acao"><button class="btn btn-s btn-sm btn-ico" type="button" data-mov="entrada" data-p="' + p.id + '" aria-label="Entrada de ' + esc(p.nome) + '">' + ico('entra') + '</button><button class="btn btn-s btn-sm btn-ico" type="button" data-mov="saida" data-p="' + p.id + '" aria-label="Saída de ' + esc(p.nome) + '"' + (e ? '' : ' disabled') + '>' + ico('sai') + '</button><button class="btn btn-s btn-sm btn-ico" type="button" data-editar="' + p.id + '" aria-label="Editar ' + esc(p.nome) + '">' + ico('editar') + '</button></td></tr>'; }).join('') : '<tr><td class="vazio" colspan="5">Nenhum produto com esse filtro.</td></tr>';
    // movimentos
    var TM = ['todos', 'Atendimento', 'Venda', 'Compra', 'Entrada', 'Saída'];
    var ms = D().movs.slice().sort(function (a, b) { return (b.data + b.hora) < (a.data + a.hora) ? -1 : (b.data + b.hora) > (a.data + a.hora) ? 1 : b.id - a.id; });
    $('#filtros-mov').innerHTML = TM.map(function (k) { return '<button type="button" data-fmov="' + k + '" aria-pressed="' + (filtroMov === k) + '">' + (k === 'todos' ? 'Todos' : k) + '</button>'; }).join('');
    var ml = ms.filter(function (m) { return filtroMov === 'todos' || m.tipo === filtroMov; }).slice(0, 60);
    $('#lista-movs').innerHTML = ml.length ? ml.map(function (m) { var p = prod(m.p) || { nome: '(produto removido)', un: 'un' };
      return '<tr><td data-rot="Quando">' + (m.data === S.hoje ? 'hoje' : S.curta(m.data)) + ' · ' + hm(m.hora) + '</td><td class="principal">' + esc(p.nome) + '</td><td data-rot="Movimento"><span class="etq m-' + m.tipo.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') + '">' + m.tipo + '</span>' + (m.det ? ' <span class="dica">' + esc(m.det) + '</span>' : '') + '</td><td class="num ' + (m.q > 0 ? 'mais' : 'menos') + '" data-rot="Quantidade">' + (m.q > 0 ? '+' : '−') + qtdTxt(p, Math.abs(m.q)) + '</td></tr>'; }).join('') : '<tr><td class="vazio" colspan="4">Nenhum movimento desse tipo.</td></tr>';
  }
  $('#filtros').addEventListener('click', function (e) { var b = e.target.closest('[data-filtro]'); if (!b) return; filtro = b.dataset.filtro; desenhaProdutos(); $('[data-filtro="' + filtro + '"]').focus(); });
  $('#filtros-mov').addEventListener('click', function (e) { var b = e.target.closest('[data-fmov]'); if (!b) return; filtroMov = b.dataset.fmov; desenhaProdutos(); $('[data-fmov="' + filtroMov + '"]').focus(); });
  $('#busca').addEventListener('input', desenhaProdutos);
  $$('[data-aba]').forEach(function (b) { b.addEventListener('click', function () { aba = b.dataset.aba; $$('[data-aba]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); $('#aba-lista').hidden = aba !== 'lista'; $('#aba-mov').hidden = aba !== 'mov'; }); });

  // entrada e saída manual
  var mvP = null;
  function abreMov(p, tipo) {
    mvP = p; $('#mv-titulo').textContent = p.nome;
    $('#mv-info').innerHTML = 'Em estoque: <b>' + qtdTxt(p, estoque(p)) + '</b>' + (p.emb > 1 ? ' (' + dec(estoque(p) / p.emb) + ' ' + p.embNome + 's)' : '') + '.';
    $('#f-mov').querySelector('input[name=mv-tipo][value="' + tipo + '"]').checked = true;
    $('#mv-qtd').value = tipo === 'entrada' ? 1 : ''; $('#mv-val').value = p.vence ? S.dia(365) : ''; $('#e-mv').hidden = true; $('#mv-qtd').setAttribute('aria-invalid', 'false');
    mostraMov(); S.abre($('#painel-mov')); $('#mv-qtd').focus();
  }
  function mostraMov() {
    var t = $('#f-mov').querySelector('input[name=mv-tipo]:checked').value, p = mvP;
    $('#g-mv-motivo').hidden = t !== 'saida'; $('#g-mv-val').hidden = t !== 'entrada' || !p.vence;
    $('#mv-qtd-rot').textContent = t === 'entrada' ? (p.emb > 1 ? 'Quantos ' + p.embNome + 's de ' + dec(p.emb, 0) + ' ' + UN[p.un] + ' chegaram' : 'Quantas unidades chegaram') : 'Quanto saiu (' + (p.un === 'un' ? 'unidades' : UN[p.un]) + ')';
  }
  $('#mv-tipos').addEventListener('change', mostraMov);
  $('#f-mov').addEventListener('submit', function (e) {
    e.preventDefault(); var p = mvP, t = this.querySelector('input[name=mv-tipo]:checked').value, n = parseInt($('#mv-qtd').value, 10), e0 = estoque(p);
    var erro = !(n > 0) ? 'Escreva uma quantidade maior que zero.' : t === 'saida' && n > e0 ? 'Só tem ' + qtdTxt(p, e0) + ' em estoque.' : '';
    if (erro) { $('#e-mv').textContent = erro; $('#e-mv').hidden = false; $('#mv-qtd').setAttribute('aria-invalid', 'true'); $('#mv-qtd').focus(); return; }
    if (t === 'entrada') { var q = n * p.emb; entrada(p, q, p.vence ? $('#mv-val').value : ''); mov(p, q, 'Entrada', 'compra avulsa'); S.fecha($('#painel-mov')); salva(); S.aviso('Entrada de ' + embTxt(p, n) + ' de ' + p.nome + '. Agora: ' + qtdTxt(p, estoque(p)) + '.'); }
    else { var motivo = $('#mv-motivo').value; baixa(p, n); mov(p, -n, 'Saída', motivo); S.fecha($('#painel-mov')); salva(); S.aviso('Saída de ' + qtdTxt(p, n) + ' de ' + p.nome + ' (' + motivo.toLowerCase() + '). Agora: ' + qtdTxt(p, estoque(p)) + '.' + avisoMinimo(e0, p)); }
    var b = $('[data-mov="' + t + '"][data-p="' + p.id + '"]'); if (b && !b.disabled) b.focus();
  });

  // produto novo e edição
  var prEd = null;
  $('#pr-forn').innerHTML = D().forns.map(function (f) { return '<option value="' + f.id + '">' + esc(f.nome) + '</option>'; }).join('');
  function abreProd(p) {
    prEd = p || null; $('#pr-titulo').textContent = p ? 'Editar ' + p.nome : 'Novo produto';
    $('#pr-nome').value = p ? p.nome : ''; $('#f-prod').querySelector('input[name=pr-tipo][value="' + (p ? p.tipo : 'venda') + '"]').checked = true;
    $('#pr-un').value = p ? p.un : 'un'; $('#pr-emb').value = p ? p.emb : 1; $('#pr-custo').value = p ? fmtValor(p.custo) : ''; $('#pr-preco').value = p && p.preco ? fmtValor(p.preco) : '';
    $('#pr-min').value = p ? p.min : 4; $('#pr-forn').value = p ? p.forn : 'cos'; $('#pr-vence').checked = p ? p.vence : true;
    $('#e-prnome').hidden = $('#e-prcusto').hidden = true; mostraProd(); S.abre($('#painel-prod')); $('#pr-nome').focus();
  }
  function mostraProd() { var venda = $('#f-prod').querySelector('input[name=pr-tipo]:checked').value === 'venda', un = $('#pr-un').value; $('#g-preco').hidden = !venda;
    $('#pr-dica').textContent = 'O estoque e o mínimo são contados em ' + (un === 'un' ? 'unidades' : UN[un]) + '. A lista de compras sugere em embalagens de ' + ($('#pr-emb').value || 1) + ' ' + UN[un] + '.'; }
  $('#f-prod').addEventListener('input', mostraProd); $('#f-prod').addEventListener('change', mostraProd);
  $('#novo-produto').addEventListener('click', function () { abreProd(null); });
  $('#f-prod').addEventListener('submit', function (e) {
    e.preventDefault(); var nome = $('#pr-nome').value.trim(), custo = lerValor($('#pr-custo').value), venda = this.querySelector('input[name=pr-tipo]:checked').value === 'venda';
    var mn = nome.length < 2, mc = !(custo > 0);
    $('#e-prnome').hidden = !mn; $('#pr-nome').setAttribute('aria-invalid', mn); $('#e-prcusto').hidden = !mc; $('#pr-custo').setAttribute('aria-invalid', mc);
    if (mn) { $('#pr-nome').focus(); return; } if (mc) { $('#pr-custo').focus(); return; }
    var p = prEd || { id: 'p' + Date.now().toString(36), lotes: [] };
    p.nome = nome; p.tipo = venda ? 'venda' : 'uso'; p.un = $('#pr-un').value; p.emb = Math.max(1, parseInt($('#pr-emb').value, 10) || 1); p.embNome = p.emb === 1 ? 'un' : (p.embNome && p.embNome !== 'un' ? p.embNome : 'embalagem');
    p.custo = custo; p.preco = venda ? (lerValor($('#pr-preco').value) || 0) : 0; p.min = Math.max(0, parseInt($('#pr-min').value, 10) || 0); p.forn = $('#pr-forn').value; p.vence = $('#pr-vence').checked;
    if (!prEd) D().prods.push(p);
    S.fecha($('#painel-prod')); filtro = 'todos'; $('#busca').value = ''; salva(); S.aviso(prEd ? p.nome + ' atualizado.' : p.nome + ' cadastrado com estoque zero. Use a entrada para lançar o que chegou.');
    var b = $('[data-editar="' + p.id + '"]'); if (b) b.focus();
  });

  /* ---------- tela: balcão ---------- */
  var carrinho = {};
  function desenhaBalcao() {
    var vs = D().prods.filter(function (p) { return p.tipo === 'venda'; }).sort(function (a, b) { return a.nome.localeCompare(b.nome); });
    $('#vitrine').innerHTML = vs.map(function (p) { var e = estoque(p) - (carrinho[p.id] || 0);
      return '<li class="vt' + (estoque(p) ? '' : ' sem') + '"><b>' + esc(p.nome) + '</b><span class="vt-preco">' + R(p.preco) + '</span><span class="dica">' + (estoque(p) ? plural(estoque(p), 'em estoque', 'em estoque') : 'Sem estoque' + (aCaminho(p) ? ' · pedido a caminho' : '')) + '</span><button class="btn btn-s btn-sm" type="button" data-por="' + p.id + '"' + (e > 0 ? '' : ' disabled') + '>' + ico('mais') + 'Pôr na venda<span class="sr"> ' + esc(p.nome) + '</span></button></li>'; }).join('');
    var ids = Object.keys(carrinho);
    $('#itens-venda').innerHTML = ids.length ? ids.map(function (id) { var p = prod(id), q = carrinho[id];
      return '<li data-id="' + id + '"><span class="iv-nome">' + esc(p.nome) + '<span class="dica">' + R(p.preco) + ' cada</span></span><span class="passo" role="group" aria-label="Quantidade de ' + esc(p.nome) + '"><button type="button" data-d="-1" aria-label="Tirar um ' + esc(p.nome) + '">−</button><output>' + q + '</output><button type="button" data-d="1" aria-label="Pôr mais um ' + esc(p.nome) + '"' + (q < estoque(p) ? '' : ' disabled') + '>+</button></span><b>' + R(q * p.preco) + '</b></li>'; }).join('') : '<li class="vazio">Toque em "Pôr na venda" nos produtos ao lado.</li>';
    $('#v-total').textContent = R(soma(ids, function (id) { return carrinho[id] * prod(id).preco; }));
    var vh = D().vendas, total = soma(vh, function (v) { return v.total; }), lucro = soma(vh, function (v) { return soma(v.itens, function (i) { return i.q * (i.preco - i.custo); }); });
    $('#resumo-vendas').innerHTML = res('Vendido hoje', R(total), plural(vh.length, 'venda', 'vendas')) + res('Lucro bruto', R(lucro), 'preço menos custo') + res('Itens vendidos', soma(vh, function (v) { return soma(v.itens, function (i) { return i.q; }); }), 'no balcão');
    $('#lista-vendas').innerHTML = vh.length ? vh.slice().reverse().map(function (v) { return '<tr><td data-rot="Hora">' + hm(v.hora) + '</td><td class="principal">' + v.itens.map(function (i) { return i.q + '× ' + esc(prod(i.p) ? prod(i.p).nome : 'produto'); }).join(', ') + (v.cli ? ' <span class="dica">· ' + esc(v.cli) + '</span>' : '') + '</td><td data-rot="Pagamento">' + v.forma + '</td><td class="num" data-rot="Total">' + R(v.total) + '</td></tr>'; }).join('') : '<tr><td class="vazio" colspan="4">Nenhuma venda hoje.</td></tr>';
  }
  $('#vitrine').addEventListener('click', function (e) { var b = e.target.closest('[data-por]'); if (!b) return; var id = b.dataset.por; carrinho[id] = (carrinho[id] || 0) + 1; desenhaBalcao(); S.aviso(prod(id).nome + ' na venda (' + carrinho[id] + ').'); var nb = $('[data-por="' + id + '"]'); (nb && !nb.disabled ? nb : $('#v-fechar')).focus(); });
  $('#itens-venda').addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (!b) return; var id = b.closest('li').dataset.id; carrinho[id] += +b.dataset.d; if (carrinho[id] <= 0) delete carrinho[id]; desenhaBalcao(); var li = $('#itens-venda li[data-id="' + id + '"]'); (li ? $('[data-d="' + b.dataset.d + '"]:not(:disabled)', li) || $('[data-d]', li) : $('#v-fechar')).focus(); });
  $('#f-venda').addEventListener('submit', function (e) {
    e.preventDefault(); var ids = Object.keys(carrinho);
    if (!ids.length) { S.aviso('Ponha pelo menos um produto na venda.'); var b0 = $('#vitrine [data-por]:not(:disabled)'); if (b0) b0.focus(); return; }
    var avisos = '', its = ids.map(function (id) { var p = prod(id), e0 = estoque(p), q = baixa(p, carrinho[id]); mov(p, -q, 'Venda', 'balcão'); avisos += avisoMinimo(e0, p); return { p: id, q: q, preco: p.preco, custo: p.custo }; });
    var v = { id: D().proxId++, hora: agoraHora(), itens: its, total: soma(its, function (i) { return i.q * i.preco; }), forma: this.querySelector('input[name=v-forma]:checked').value, cli: $('#v-cliente').value.trim() };
    D().vendas.push(v); carrinho = {}; $('#v-cliente').value = ''; salva();
    S.aviso('Venda de ' + R(v.total) + ' (' + v.forma + ') registrada. Estoque atualizado.' + avisos);
    $('#vitrine [data-por]:not(:disabled)') && $('#vitrine [data-por]:not(:disabled)').focus();
  });

  /* ---------- tela: serviços ---------- */
  var abaS = 'hoje';
  $('#at-barbeiro').innerHTML = BARBEIROS.map(function (b) { return '<option>' + b + '</option>'; }).join('');
  $('#at-servico').innerHTML = SERVICOS.map(function (s) { return '<option value="' + s.id + '">' + s.nome + ' · ' + R(s.preco) + '</option>'; }).join('');
  function gastoTxt(gasto) { return gasto.map(function (g) { var p = prod(g.p); return p ? qtdTxt(p, g.q) + ' de ' + p.nome.toLowerCase() : ''; }).filter(Boolean).join(', '); }
  function prevAtend() { var r = D().receitas[$('#at-servico').value] || []; $('#at-prev').textContent = r.length ? 'Vai sair do estoque: ' + gastoTxt(r) + '.' : 'Este serviço não gasta produto cadastrado.'; }
  $('#at-servico').addEventListener('change', prevAtend);
  function desenhaServicos() {
    prevAtend();
    var at = D().atends, por = {}; BARBEIROS.forEach(function (b) { por[b] = 0; }); at.forEach(function (a) { por[a.barb] = (por[a.barb] || 0) + 1; });
    var custo = soma(at, function (a) { return soma(a.gasto, function (g) { var p = prod(g.p); return p ? g.q * custoBase(p) : 0; }); });
    $('#resumo-atend').innerHTML = res('Atendimentos hoje', at.length, BARBEIROS.map(function (b) { return b + ' ' + por[b]; }).join(' · ')) + res('Custo de produto', R(Math.round(custo)), 'gasto nos atendimentos de hoje') + res('Por atendimento', R(at.length ? Math.round(custo / at.length) : 0), 'em média');
    $('#lista-atend').innerHTML = at.length ? at.slice().reverse().map(function (a) { return '<tr><td data-rot="Hora">' + hm(a.hora) + '</td><td class="principal">' + SERV[a.serv].nome + ' <span class="dica">· ' + a.barb + '</span></td><td data-rot="Saiu">' + (gastoTxt(a.gasto) || '—') + '</td></tr>'; }).join('') : '<tr><td class="vazio" colspan="3">Nenhum atendimento hoje.</td></tr>';
    var usos = D().prods.filter(function (p) { return p.tipo === 'uso'; });
    $('#receitas').innerHTML = SERVICOS.map(function (s) { var r = D().receitas[s.id] || [];
      return '<div class="receita" data-s="' + s.id + '"><h2>' + s.nome + '</h2><ul>' + (r.length ? r.map(function (g, j) { var p = prod(g.p); if (!p) return ''; var id = 'rc-' + s.id + '-' + j;
        return '<li data-j="' + j + '"><label for="' + id + '">' + esc(p.nome) + '</label><span class="rc-q"><input id="' + id + '" type="number" min="1" inputmode="numeric" value="' + g.q + '"><span>' + (p.un === 'un' ? 'un' : UN[p.un]) + '</span></span><button class="btn btn-s btn-ico" type="button" data-rm-rc aria-label="Tirar ' + esc(p.nome) + ' de ' + s.nome + '">' + ico('x') + '</button></li>'; }).join('') : '<li class="vazio">Não gasta produto.</li>') + '</ul>' +
        '<div class="rc-add"><label class="sr" for="rca-' + s.id + '">Produto para ' + s.nome + '</label><select id="rca-' + s.id + '"><option value="">Adicionar produto</option>' + usos.filter(function (p) { return !r.some(function (g) { return g.p === p.id; }); }).map(function (p) { return '<option value="' + p.id + '">' + esc(p.nome) + '</option>'; }).join('') + '</select><button class="btn btn-s btn-sm" type="button" data-add-rc>' + ico('mais') + 'Pôr</button></div></div>'; }).join('');
  }
  $$('[data-aba-s]').forEach(function (b) { b.addEventListener('click', function () { abaS = b.dataset.abaS; $$('[data-aba-s]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); $('#aba-hoje').hidden = abaS !== 'hoje'; $('#aba-receitas').hidden = abaS !== 'receitas'; }); });
  $('#f-atend').addEventListener('submit', function (e) {
    e.preventDefault(); var sid = $('#at-servico').value, barb = $('#at-barbeiro').value, r = D().receitas[sid] || [], avisos = '';
    var gasto = r.map(function (g) { var p = prod(g.p); if (!p) return null; var e0 = estoque(p), q = baixa(p, g.q); if (q < g.q) avisos += ' Faltou ' + p.nome.toLowerCase() + ': confira o estoque.'; else avisos += avisoMinimo(e0, p); if (q) mov(p, -q, 'Atendimento', SERV[sid].nome + ' · ' + barb); return { p: g.p, q: q }; }).filter(Boolean);
    D().atends.push({ id: D().proxId++, hora: agoraHora(), barb: barb, serv: sid, gasto: gasto }); salva();
    S.aviso(SERV[sid].nome + ' com ' + barb + ' registrado. Saiu do estoque: ' + (gastoTxt(gasto) || 'nada') + '.' + avisos);
  });
  $('#receitas').addEventListener('input', function (e) { var li = e.target.closest('li[data-j]'); if (!li) return; var s = e.target.closest('.receita').dataset.s, g = D().receitas[s][+li.dataset.j]; g.q = Math.max(1, parseInt(e.target.value, 10) || 1); G.salva(); prevAtend(); });
  $('#receitas').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var s = b.closest('.receita').dataset.s, r = D().receitas[s] || (D().receitas[s] = []);
    if (b.hasAttribute('data-rm-rc')) { var j = +b.closest('li').dataset.j, nome = prod(r[j].p).nome; r.splice(j, 1); salva(); $('#rca-' + s).focus(); S.aviso(nome + ' não sai mais em ' + SERV[s].nome.toLowerCase() + '.'); }
    else if (b.hasAttribute('data-add-rc')) { var sel = $('#rca-' + s); if (!sel.value) { sel.focus(); S.aviso('Escolha o produto.'); return; } var p = prod(sel.value); r.push({ p: p.id, q: p.un === 'un' ? 1 : 5 }); salva(); $('#rc-' + s + '-' + (r.length - 1)).focus(); S.aviso(p.nome + ' agora sai em ' + SERV[s].nome.toLowerCase() + '.'); }
  });

  /* ---------- tela: compras ---------- */
  function desenhaCompras() {
    var falta = D().prods.filter(function (p) { return sit(p).k !== 'ok' && !aCaminho(p); });
    var fs = D().forns.filter(function (f) { return falta.some(function (p) { return p.forn === f.id; }); });
    $('#lista-compras').innerHTML = fs.length ? fs.map(function (f) { var ps = falta.filter(function (p) { return p.forn === f.id; });
      return '<article class="forn" data-f="' + f.id + '" aria-labelledby="ft-' + f.id + '"><div class="forn-topo"><h3 id="ft-' + f.id + '">' + esc(f.nome) + '</h3><span class="dica">' + esc(f.contato) + ' · ' + esc(f.tel) + '</span></div><ul>' + ps.map(function (p) { var id = 'lc-' + p.id;
        return '<li data-p="' + p.id + '"><span class="lc-nome"><b>' + esc(p.nome) + '</b><span class="dica">tem ' + qtdTxt(p, estoque(p)) + ' · mínimo ' + qtdTxt(p, p.min) + '</span></span><span class="lc-q"><label for="' + id + '">' + (p.emb > 1 ? p.embNome.charAt(0).toUpperCase() + p.embNome.slice(1) + 's de ' + dec(p.emb, 0) + ' ' + UN[p.un] : 'Unidades') + '</label><input id="' + id + '" type="number" min="0" inputmode="numeric" value="' + sugestao(p) + '"></span><span class="lc-custo">' + R(sugestao(p) * p.custo) + '</span></li>'; }).join('') + '</ul>' +
        '<div class="forn-pe"><span>Estimado: <b class="lc-total">' + R(soma(ps, function (p) { return sugestao(p) * p.custo; })) + '</b></span><button class="btn btn-p" type="button" data-pedir="' + f.id + '">' + ico('zap') + 'Fazer pedido pelo WhatsApp<span class="sr"> para ' + esc(f.nome) + '</span></button></div></article>'; }).join('') : '<p class="vazio">Nada para comprar agora. Tudo acima do mínimo ou com pedido a caminho.</p>';
    var ps = D().peds.slice().sort(function (a, b) { return b.n - a.n; });
    $('#pedidos').innerHTML = ps.map(function (o) { var f = forn(o.forn), aberto = o.status === 'enviado';
      return '<article class="ped' + (aberto ? ' aberto' : '') + '" id="pd-' + o.id + '" tabindex="-1"><div class="forn-topo"><h3>Pedido nº ' + o.n + ' · ' + esc(f.nome) + '</h3><span class="etq ' + (aberto ? 's-caminho' : 'ok') + '">' + (aberto ? ico('caminhao') + 'A caminho desde ' + S.curta(o.criado) : ico('check') + 'Recebido em ' + S.curta(o.recebido)) + '</span></div><ul class="ped-itens">' +
        o.itens.map(function (i, k) { var p = prod(i.p); return '<li><span>' + embTxt(p, i.emb) + ' · ' + esc(p.nome) + '</span>' + (!aberto && o.chegou[k] !== i.emb ? '<span class="etq alerta">chegou ' + o.chegou[k] + '</span>' : '') + '</li>'; }).join('') + '</ul>' +
        (aberto ? '<div class="forn-pe"><span class="dica">Custo estimado ' + R(soma(o.itens, function (i) { return i.emb * prod(i.p).custo; })) + '</span><button class="btn btn-p btn-sm" type="button" data-receber="' + o.id + '">' + ico('check') + 'Chegou: conferir<span class="sr"> o pedido ' + o.n + '</span></button></div>' : '') + '</article>'; }).join('') || '<p class="vazio">Nenhum pedido ainda.</p>';
  }
  $('#lista-compras').addEventListener('input', function (e) { var li = e.target.closest('li[data-p]'); if (!li) return; var p = prod(li.dataset.p), n = Math.max(0, parseInt(e.target.value, 10) || 0); $('.lc-custo', li).textContent = R(n * p.custo);
    var art = li.closest('.forn'); $('.lc-total', art).textContent = R(soma($$('li[data-p]', art), function (x) { return (Math.max(0, parseInt($('input', x).value, 10) || 0)) * prod(x.dataset.p).custo; })); });
  $('#lista-compras').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pedir]'); if (!b) return; var art = b.closest('.forn'), f = forn(b.dataset.pedir);
    var itens = $$('li[data-p]', art).map(function (li) { return { p: li.dataset.p, emb: Math.max(0, parseInt($('input', li).value, 10) || 0) }; }).filter(function (i) { return i.emb > 0; });
    if (!itens.length) { $('input', art).focus(); S.aviso('Escolha a quantidade de pelo menos um produto.'); return; }
    var o = { id: D().proxId++, n: D().proxPed++, forn: f.id, itens: itens, status: 'enviado', criado: S.hoje, recebido: '', chegou: [] }; D().peds.push(o); salva();
    S.demo('Olá, ' + f.contato + '! Aqui é o Rafa, da Ofício Barbearia. Gostaria de fazer um pedido (nº ' + o.n + '):\n' + itens.map(function (i) { var p = prod(i.p); return '• ' + embTxt(p, i.emb) + ' · ' + p.nome; }).join('\n') + '\nPode me passar o valor e o prazo de entrega? Obrigado!', 'Pedido ao fornecedor');
    var c = $('#pd-' + o.id); if (c) c.focus();
  });
  var recPed = null;
  function abreRec(o) {
    recPed = o; $('#rc-titulo').textContent = 'Conferir pedido nº ' + o.n;
    $('#rc-itens').innerHTML = o.itens.map(function (i, k) { var p = prod(i.p);
      return '<li><b>' + esc(p.nome) + '</b><span class="dica">Pedido: ' + embTxt(p, i.emb) + '</span><div class="duas"><div class="campo"><label for="rq-' + k + '">Chegou (' + (p.emb > 1 ? p.embNome + 's' : 'unidades') + ')</label><input id="rq-' + k + '" type="number" min="0" inputmode="numeric" value="' + i.emb + '"></div>' +
        (p.vence ? '<div class="campo"><label for="rv-' + k + '">Validade do lote</label><input id="rv-' + k + '" type="date" value="' + S.dia(365) + '"></div>' : '') + '</div></li>'; }).join('');
    S.abre($('#painel-rec')); $('#rq-0').focus();
  }
  $('#f-rec').addEventListener('submit', function (e) {
    e.preventDefault(); var o = recPed, dif = [];
    o.chegou = o.itens.map(function (i, k) { var p = prod(i.p), n = Math.max(0, parseInt($('#rq-' + k).value, 10) || 0), v = $('#rv-' + k);
      if (n) { entrada(p, n * p.emb, v ? v.value : ''); mov(p, n * p.emb, 'Compra', 'pedido nº ' + o.n); }
      if (n !== i.emb) dif.push(p.nome + ': chegou ' + n + ' de ' + i.emb); return n; });
    o.status = 'recebido'; o.recebido = S.hoje; S.fecha($('#painel-rec')); salva();
    S.aviso('Pedido nº ' + o.n + ' conferido e estoque atualizado.' + (dif.length ? ' Diferença: ' + dif.join('; ') + '.' : ''));
    var c = $('#pd-' + o.id); if (c) c.focus();
  });

  /* ---------- ações comuns ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.mov) abreMov(prod(b.dataset.p), b.dataset.mov);
    else if (b.dataset.editar) abreProd(prod(b.dataset.editar));
    else if (b.dataset.receber) abreRec(D().peds.filter(function (o) { return o.id === +b.dataset.receber; })[0]);
    else if (b.dataset.ir) vaiTela(b.dataset.ir, true);
  });
  $('.recomecar').addEventListener('click', function () { S.confirma('Recomeçar apaga o que você fez nesta demonstração e volta aos dados de exemplo.', function () { G.recomeca(); carrinho = {}; vaiTela('inicio', true); S.aviso('Demonstração recomeçada.'); }); });

  var telaAtual = 'inicio';
  function desenha() {
    var al = D().prods.filter(function (p) { return sit(p).k !== 'ok' || vencendo(p); }).length;
    $('#n-alertas').textContent = al || '';
    $('#n-compras').textContent = D().prods.filter(function (p) { return sit(p).k !== 'ok' && !aCaminho(p); }).length || '';
    ({ inicio: desenhaInicio, produtos: desenhaProdutos, balcao: desenhaBalcao, servicos: desenhaServicos, compras: desenhaCompras })[telaAtual]();
  }
  var SUB = { inicio: S.longa(S.hoje), produtos: 'O que tem, o que está acabando e o que vence logo', balcao: 'Produtos à venda e o caixa de hoje', servicos: 'Cada atendimento baixa o produto sozinho', compras: 'O que comprar e os pedidos aos fornecedores' };
  var vaiTela = S.telas(function (tela) { telaAtual = tela; $('#subtitulo').textContent = SUB[tela]; desenha(); });
})();
