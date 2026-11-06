/* Quadro de pedidos · Coadouro · demonstração da EstudioHK */
(function () {
  'use strict';
  var S = window.SIS, $ = S.$, $$ = S.$$, esc = S.esc;

  var CARDAPIO = [
    { id: 'coado', nome: 'Coado no pano', det: '200 ml', preco: 9 },
    { id: 'espresso', nome: 'Espresso', det: '', preco: 7 },
    { id: 'cappuccino', nome: 'Cappuccino', det: '', preco: 12 },
    { id: 'coldbrew', nome: 'Cold brew com leite', det: '400 ml', preco: 16 },
    { id: 'garrafa', nome: 'Garrafa de cold brew', det: '500 ml', preco: 28 },
    { id: 'croissant', nome: 'Croissant de manteiga', det: '', preco: 11 },
    { id: 'paodequeijo', nome: 'Pão de queijo', det: '', preco: 6 },
    { id: 'bolo', nome: 'Bolo do dia', det: 'fatia', preco: 10 }
  ];
  var ITEM = {}; CARDAPIO.forEach(function (i) { ITEM[i.id] = i; });
  var ETAPAS = [
    { id: 'novo', nome: 'Novo' }, { id: 'preparando', nome: 'Preparando' },
    { id: 'pronto', nome: 'Pronto' }, { id: 'entregue', nome: 'Entregue' }
  ];
  var POS = {}; ETAPAS.forEach(function (e, i) { POS[e.id] = i; });

  function semente() {
    var p = function (n, cli, dia, etapa, hora, origem, itens, obs) { return { n: n, cli: cli, tel: '', dia: dia, etapa: etapa, hora: hora, origem: origem, itens: itens, obs: obs || '', avisado: etapa === 'entregue' }; };
    return {
      prox: 435,
      pedidos: [
        p(423, 'Ana Ribeiro', 'hoje', 'entregue', '07:30', 'Balcão', { coado: 1, paodequeijo: 1 }),
        p(424, 'Bruno Costa', 'hoje', 'entregue', '07:45', 'Balcão', { espresso: 2, croissant: 1 }),
        p(425, 'Diego Alves', 'hoje', 'entregue', '08:00', 'Instagram', { coldbrew: 1, bolo: 1 }),
        p(426, 'Elisa Prado', 'hoje', 'entregue', '08:10', 'Balcão', { cappuccino: 1 }),
        p(427, 'Fernando Lima', 'hoje', 'pronto', '08:15', 'WhatsApp', { coado: 1, croissant: 1 }),
        p(428, 'Gabriela Souza', 'hoje', 'preparando', '08:30', 'WhatsApp', { cappuccino: 2, paodequeijo: 2 }, 'Um dos cappuccinos com leite de aveia'),
        p(429, 'Helena Rocha', 'hoje', 'preparando', '08:45', 'Instagram', { garrafa: 1 }),
        p(430, 'Igor Martins', 'hoje', 'novo', '09:00', 'WhatsApp', { coado: 1, bolo: 1 }),
        p(431, 'Júlio Nunes', 'hoje', 'novo', '09:30', 'WhatsApp', { espresso: 3, croissant: 3 }, 'Para o escritório, pode embalar junto'),
        p(432, 'Escritório Vale Verde', 'amanha', 'novo', '07:30', 'WhatsApp', { garrafa: 2, paodequeijo: 12, bolo: 1 }, 'Quem retira é a Renata'),
        p(433, 'Lúcia Andrade', 'amanha', 'novo', '08:00', 'Instagram', { coado: 2, croissant: 2 }),
        p(434, 'Clínica Lumar (recepção)', 'amanha', 'novo', '09:00', 'WhatsApp', { coado: 6, paodequeijo: 6 }, 'Para a reunião das 9h30')
      ]
    };
  }
  var G = S.guarda('estudiohk-sis-pedidos-v1', semente, true);
  var D = function () { return G.d; };

  var total = function (p) { return Object.keys(p.itens).reduce(function (s, k) { return s + ITEM[k].preco * p.itens[k]; }, 0); };
  var hora = function (h) { var p = h.split(':'); return +p[0] + 'h' + (p[1] === '00' ? '' : p[1]); };
  var num = function (p) { return '#' + String(p.n).padStart(4, '0'); };
  var primeiro = function (nome) { return nome.split(/[ (]/)[0]; };
  var porHora = function (a, b) { return a.hora < b.hora ? -1 : a.hora > b.hora ? 1 : a.n - b.n; };
  var doDia = function (dia) { return D().pedidos.filter(function (p) { return p.dia === dia; }).sort(porHora); };
  var acha = function (n) { return D().pedidos.filter(function (p) { return p.n === n; })[0]; };

  /* ---------- quadro de hoje ---------- */
  function cartao(p, comAcoes) {
    var e = ETAPAS[POS[p.etapa]], i = POS[p.etapa], ant = ETAPAS[i - 1], prox = ETAPAS[i + 1];
    var itens = Object.keys(p.itens).map(function (k) { return '<li><b>' + p.itens[k] + '×</b> ' + esc(ITEM[k].nome) + '</li>'; }).join('');
    var etqs = '<span class="etq">' + esc(p.origem) + '</span>' + (p.proxima ? '<span class="etq proxima">Próxima retirada</span>' : '') + (p.etapa === 'pronto' && p.avisado ? '<span class="etq avisado">Cliente avisado</span>' : '');
    var acoes = '';
    if (comAcoes) {
      acoes = '<div class="ped-acoes">' +
        (ant ? '<button class="btn btn-s btn-ico" type="button" data-move="' + ant.id + '" aria-label="Voltar o pedido ' + num(p) + ' para ' + ant.nome + '"><svg class="ico" aria-hidden="true"><use href="#i-volta"/></svg></button>' : '') +
        '<button class="btn btn-s btn-ico" type="button" data-editar aria-label="Editar o pedido ' + num(p) + '"><svg class="ico" aria-hidden="true"><use href="#i-editar"/></svg></button>' +
        (p.etapa === 'pronto' ? '<button class="btn btn-s btn-sm" type="button" data-avisar><svg class="ico" aria-hidden="true"><use href="#i-zap"/></svg>Avisar<span class="sr"> ' + esc(p.cli) + ' que o pedido ' + num(p) + ' está pronto</span></button>' : '') +
        (prox ? '<button class="btn btn-p btn-sm avanca" type="button" data-move="' + prox.id + '"><span class="sr">Mover o pedido ' + num(p) + ' para </span>' + prox.nome + '<svg class="ico" aria-hidden="true"><use href="#i-seta"/></svg></button>' : '<span class="etq ok avanca"><svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>Retirado</span>') +
        '</div>';
    } else {
      acoes = '<div class="ped-acoes"><button class="btn btn-s btn-sm" type="button" data-editar><svg class="ico" aria-hidden="true"><use href="#i-editar"/></svg>Editar<span class="sr"> o pedido ' + num(p) + '</span></button></div>';
    }
    return '<article class="pedido" id="p-' + p.n + '" data-n="' + p.n + '" tabindex="-1" style="--e:var(--e-' + e.id + ')"' + (comAcoes ? ' draggable="true"' : '') + ' aria-labelledby="pt-' + p.n + '">' +
      '<div class="ped-topo"><span class="ped-num">' + num(p) + '</span><span class="ped-hora"><svg class="ico" aria-hidden="true"><use href="#i-relogio"/></svg><span class="sr">Retirada às </span>' + hora(p.hora) + '</span></div>' +
      '<h3 id="pt-' + p.n + '">' + esc(p.cli) + '</h3><ul class="ped-itens">' + itens + '</ul>' +
      (p.obs ? '<p class="ped-obs">' + esc(p.obs) + '</p>' : '') +
      '<div class="ped-pe"><span class="etqs">' + etqs + '</span><b class="ped-total">' + S.dinheiro(total(p)) + '</b></div>' + acoes + '</article>';
  }

  function desenhaHoje() {
    var hoje = doDia('hoje'), busca = $('#busca').value.trim().toLowerCase();
    var abertos = hoje.filter(function (p) { return p.etapa !== 'entregue'; });
    hoje.forEach(function (p) { p.proxima = false; });
    if (abertos[0]) abertos[0].proxima = true;
    var vendido = hoje.reduce(function (s, p) { return s + total(p); }, 0);
    var prontos = hoje.filter(function (p) { return p.etapa === 'pronto'; }).length;
    $('#resumo-hoje').innerHTML =
      res('Vendido hoje', S.dinheiro(vendido), hoje.length + (hoje.length === 1 ? ' pedido' : ' pedidos')) +
      res('Em aberto', abertos.length, prontos + (prontos === 1 ? ' pronto esperando retirada' : ' prontos esperando retirada')) +
      res('Próxima retirada', abertos[0] ? hora(abertos[0].hora) : '—', abertos[0] ? esc(abertos[0].cli) : 'Nenhum pedido em aberto') +
      res('Ticket médio', S.dinheiro(hoje.length ? vendido / hoje.length : 0), 'valor médio por pedido');
    var lista = busca ? hoje.filter(function (p) { return p.cli.toLowerCase().indexOf(busca) >= 0; }) : hoje;
    $('#quadro').innerHTML = ETAPAS.map(function (e) {
      var ps = lista.filter(function (p) { return p.etapa === e.id; });
      return '<section class="coluna" data-etapa="' + e.id + '" style="--e:var(--e-' + e.id + ')" aria-labelledby="c-' + e.id + '">' +
        '<header><h2 id="c-' + e.id + '"><i aria-hidden="true"></i>' + e.nome + '</h2><span class="qtd" aria-label="' + ps.length + (ps.length === 1 ? ' pedido' : ' pedidos') + '">' + ps.length + '</span></header>' +
        '<div class="cartoes">' + (ps.length ? ps.map(function (p) { return cartao(p, true); }).join('') : '<p class="vazio-col">' + (busca ? 'Nenhum pedido com esse nome.' : 'Nenhum pedido aqui.') + '</p>') + '</div></section>';
    }).join('');
    $('#n-hoje').textContent = abertos.length;
  }
  function res(rot, val, det) { return '<div class="res"><small>' + rot + '</small><b>' + val + '</b><span>' + det + '</span></div>'; }

  /* ---------- amanhã ---------- */
  function desenhaAmanha() {
    var am = doDia('amanha'), soma = {};
    am.forEach(function (p) { Object.keys(p.itens).forEach(function (k) { soma[k] = (soma[k] || 0) + p.itens[k]; }); });
    var tot = am.reduce(function (s, p) { return s + total(p); }, 0);
    $('#resumo-amanha').innerHTML =
      res('Encomendas', am.length, S.longa(S.dia(1))) +
      res('Total previsto', S.dinheiro(tot), 'a receber na retirada') +
      res('Primeira retirada', am[0] ? hora(am[0].hora) : '—', am[0] ? esc(am[0].cli) : 'Sem encomendas');
    $('#lista-amanha').innerHTML = am.length ? am.map(function (p) { return cartao(p, false); }).join('') : '<p class="vazio">Nenhuma encomenda para amanhã.</p>';
    var ks = Object.keys(soma).sort(function (a, b) { return soma[b] - soma[a]; });
    $('#separar').innerHTML = ks.length ? ks.map(function (k) { return '<tr><td class="principal">' + esc(ITEM[k].nome) + '</td><td class="num" data-rot="Quantidade">' + soma[k] + '</td></tr>'; }).join('') : '<tr><td class="vazio" colspan="2">Nada para separar.</td></tr>';
    $('#n-amanha').textContent = am.length;
  }

  /* ---------- cardápio e vendas ---------- */
  function desenhaCardapio() {
    var hoje = doDia('hoje'), q = {}, itens = 0, tot = 0;
    hoje.forEach(function (p) { Object.keys(p.itens).forEach(function (k) { q[k] = (q[k] || 0) + p.itens[k]; }); });
    var mais = CARDAPIO.slice().sort(function (a, b) { return (q[b.id] || 0) * b.preco - (q[a.id] || 0) * a.preco; })[0];
    $('#cardapio').innerHTML = CARDAPIO.map(function (i) {
      var n = q[i.id] || 0; itens += n; tot += n * i.preco;
      return '<tr><td class="principal">' + esc(i.nome) + (i.det ? ' <span class="dica">· ' + i.det + '</span>' : '') + (i === mais && n ? ' <span class="etq ok">Mais vendido</span>' : '') + '</td><td class="num" data-rot="Preço">' + S.dinheiro(i.preco) + '</td><td class="num" data-rot="Saíram hoje">' + n + '</td><td class="num" data-rot="Total hoje">' + S.dinheiro(n * i.preco) + '</td></tr>';
    }).join('');
    $('#c-itens').textContent = itens; $('#c-total').textContent = S.dinheiro(tot);
  }

  function desenha() { desenhaHoje(); desenhaAmanha(); desenhaCardapio(); var t = $('#subtitulo'); if (!$('[data-tela="quadro"]').hidden) t.textContent = S.longa(S.hoje); }

  /* ---------- mover, avisar, editar ---------- */
  function move(p, etapa) {
    if (p.etapa === etapa) return;
    p.etapa = etapa; if (etapa !== 'pronto' && etapa !== 'entregue') p.avisado = false;
    G.salva(); desenha();
    S.aviso('Pedido ' + num(p) + ' de ' + p.cli + ' foi para ' + ETAPAS[POS[etapa]].nome + '.');
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    var art = b.closest('.pedido'); if (!art) return;
    var p = acha(+art.dataset.n);
    if (b.dataset.move) { move(p, b.dataset.move); var novo = $('#p-' + p.n); if (novo) novo.focus(); }
    else if (b.hasAttribute('data-editar')) abreForm(p);
    else if (b.hasAttribute('data-avisar')) {
      p.avisado = true; G.salva(); desenha();
      S.demo('Olá, ' + primeiro(p.cli) + '! Seu pedido ' + num(p) + ' da Coadouro está pronto para retirada no balcão.\nTotal: ' + S.dinheiro(total(p)) + '. Até já!', 'Aviso de pedido pronto');
    }
  });
  // arrastar entre colunas (extra no computador; os botões fazem o mesmo)
  var arrastado = null;
  document.addEventListener('dragstart', function (e) { var a = e.target.closest && e.target.closest('.pedido[draggable]'); if (!a) return; arrastado = +a.dataset.n; a.classList.add('arrastando'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(arrastado)); });
  document.addEventListener('dragend', function () { arrastado = null; $$('.arrastando, .solta').forEach(function (x) { x.classList.remove('arrastando', 'solta'); }); });
  document.addEventListener('dragover', function (e) { var c = e.target.closest && e.target.closest('.coluna'); if (!c || arrastado === null) return; e.preventDefault(); $$('.solta').forEach(function (x) { if (x !== c) x.classList.remove('solta'); }); c.classList.add('solta'); });
  document.addEventListener('drop', function (e) { var c = e.target.closest && e.target.closest('.coluna'); if (!c || arrastado === null) return; e.preventDefault(); move(acha(arrastado), c.dataset.etapa); });

  $('#busca').addEventListener('input', desenhaHoje);

  /* ---------- formulário de pedido ---------- */
  var painel = $('#painel'), form = $('#f-pedido'), editando = null, qtd = {};
  var sel = $('#f-hora');
  for (var h = 7; h < 19; h++) for (var m = 0; m < 60; m += 15) { var v = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); var o = document.createElement('option'); o.value = v; o.textContent = hora(v); sel.appendChild(o); }
  $('#itens-form').innerHTML = CARDAPIO.map(function (i) {
    return '<li data-id="' + i.id + '"><span class="nome" id="fi-' + i.id + '">' + esc(i.nome) + '<span class="preco">' + S.dinheiro(i.preco) + (i.det ? ' · ' + i.det : '') + '</span></span>' +
      '<span class="passo" role="group" aria-labelledby="fi-' + i.id + '"><button type="button" data-d="-1" aria-label="Tirar um ' + esc(i.nome) + '">−</button><output aria-live="polite" aria-label="Quantidade de ' + esc(i.nome) + '">0</output><button type="button" data-d="1" aria-label="Pôr mais um ' + esc(i.nome) + '">+</button></span></li>';
  }).join('');
  function mostraQtd() {
    var t = 0;
    $$('#itens-form li').forEach(function (li) { var n = qtd[li.dataset.id] || 0; $('output', li).textContent = n; $('[data-d="-1"]', li).disabled = !n; li.classList.toggle('tem', n > 0); t += n * ITEM[li.dataset.id].preco; });
    $('#f-total').textContent = S.dinheiro(t);
  }
  $('#itens-form').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-d]'); if (!b) return;
    var id = b.closest('li').dataset.id; qtd[id] = Math.max(0, (qtd[id] || 0) + +b.dataset.d); if (!qtd[id]) delete qtd[id];
    mostraQtd(); $('#e-itens').hidden = true;
    if (b.disabled) $('[data-d="1"]', b.parentNode).focus();
  });
  function marca(campo, erro, mal) { campo.setAttribute('aria-invalid', mal ? 'true' : 'false'); $(erro).hidden = !mal; }
  function abreForm(p) {
    editando = p || null;
    $('#p-titulo').textContent = p ? 'Editar pedido ' + num(p) : 'Novo pedido';
    $('#salvar').textContent = p ? 'Salvar alterações' : 'Salvar pedido';
    $('#excluir').hidden = !p;
    $('#f-cliente').value = p ? p.cli : ''; $('#f-tel').value = p ? p.tel : ''; $('#f-obs').value = p ? p.obs : '';
    var naTela = $('[data-tela="amanha"]').hidden ? 'hoje' : 'amanha';
    form.querySelector('input[name=dia][value="' + (p ? p.dia : naTela) + '"]').checked = true;
    form.querySelector('input[name=origem][value="' + (p ? p.origem : 'Balcão') + '"]').checked = true;
    sel.value = p ? p.hora : (naTela === 'amanha' ? '08:00' : '09:45');
    qtd = p ? JSON.parse(JSON.stringify(p.itens)) : {};
    marca($('#f-cliente'), '#e-cliente', false); $('#e-itens').hidden = true;
    mostraQtd(); S.abre(painel); $('#f-cliente').focus();
  }
  $('#novo').addEventListener('click', function () { abreForm(null); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var cli = $('#f-cliente').value.trim(), semItens = !Object.keys(qtd).length;
    marca($('#f-cliente'), '#e-cliente', cli.length < 2); $('#e-itens').hidden = !semItens;
    if (cli.length < 2) { $('#f-cliente').focus(); return; }
    if (semItens) { $('#itens-form button[data-d="1"]').focus(); return; }
    var dados = { cli: cli, tel: $('#f-tel').value.trim(), obs: $('#f-obs').value.trim(), dia: form.querySelector('input[name=dia]:checked').value, origem: form.querySelector('input[name=origem]:checked').value, hora: sel.value, itens: qtd };
    var p = editando;
    if (p) Object.keys(dados).forEach(function (k) { p[k] = dados[k]; });
    else { p = dados; p.n = D().prox++; p.etapa = 'novo'; p.avisado = false; D().pedidos.push(p); }
    G.salva(); S.fecha(painel); $('#busca').value = ''; desenha();
    S.aviso((editando ? 'Pedido ' + num(p) + ' atualizado.' : 'Pedido ' + num(p) + ' de ' + p.cli + ' criado para ' + (p.dia === 'hoje' ? 'hoje' : 'amanhã') + ', ' + hora(p.hora) + '.'));
    var art = $('#p-' + p.n); if (art && !art.closest('[hidden]')) art.focus();
  });
  $('#excluir').addEventListener('click', function () {
    var p = editando;
    S.fecha(painel);
    S.confirma('O pedido ' + num(p) + ' de ' + p.cli + ' sai do quadro.', function () {
      D().pedidos = D().pedidos.filter(function (x) { return x !== p; }); G.salva(); desenha(); S.aviso('Pedido ' + num(p) + ' excluído.');
    });
  });

  $('.recomecar').addEventListener('click', function () {
    S.confirma('Recomeçar apaga o que você fez nesta demonstração e volta aos pedidos de exemplo.', function () { G.recomeca(); $('#busca').value = ''; desenha(); S.aviso('Demonstração recomeçada.'); });
  });

  S.telas(function (tela) { desenha(); $('#subtitulo').textContent = tela === 'amanha' ? S.longa(S.dia(1)) : tela === 'quadro' ? S.longa(S.hoje) : 'Preços do cardápio e o que saiu hoje'; });
})();
