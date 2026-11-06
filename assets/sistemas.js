/* Página /sistemas/ · "Experimente em 10 segundos" (4 cenas, os dois lados) e calculadora "quanto devolve". Sem dependências. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var real = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var R = function (v) { return real.format(v).replace(/ /g, ' '); };
  var R0 = function (v) { return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); };
  var hoje = new Date(), d2 = function (n) { return String(n).padStart(2, '0'); };
  var dataCurta = function (mais) { var d = new Date(hoje); d.setDate(d.getDate() + mais); while (d.getDay() === 0) d.setDate(d.getDate() + 1); return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()] + ', ' + d2(d.getDate()) + '/' + d2(d.getMonth() + 1); };
  var FOTO = '/demos/cafeteria/assets/img/';

  /* ================= as 4 cenas ================= */
  var CENAS = {
    cafe: {
      dono: 'Painel da Coadouro', cel: 'Celular do cliente · mesa 5', botao: 'Pedir pelo QR da mesa', abrir: '/demos/sistemas/pedidos/',
      log: ['O pedido chegou no quadro e na cozinha, sem ninguém anotar.', 'A cozinha começou, e o cliente vê "Preparando" no celular.', 'Ficou pronto: o garçom leva e o cliente já sabe que está chegando.'],
      donoHtml: function (f) {
        var col = function (nome, cards) { return '<div class="xc-col"><span class="xc-ct">' + nome + '</span>' + cards + '</div>'; };
        var card = function (n, t, sub, novo) { return '<div class="xc-card' + (novo ? ' x-novo' : '') + '"><span>' + n + '</span><b>' + t + '</b><small>' + sub + '</small></div>'; };
        var nv = card('#0438', 'Mesa 5', '<i class="x-qr">Pelo QR</i> 1 cappuccino, 1 croissant', true);
        return '<div class="xd-topo"><b>Pedidos de hoje</b><span class="xd-kpi">Vendas hoje <strong data-conta="' + (f ? 537.7 : 514.7) + '">' + R(f ? 537.7 : 514.7) + '</strong></span></div>' +
          '<div class="xc-quadro">' + col('Novo', (f === 1 ? nv : '') + card('#0431', 'Igor Martins', 'Retirada · 10h')) + col('Preparando', (f === 2 ? nv : '') + card('#0430', 'Mesa 4', '2 bolos do dia')) + col('Pronto', (f === 3 ? nv : '') + card('#0429', 'Mesa 9', 'Levar à mesa')) + '</div>';
      },
      celHtml: function (f) {
        if (!f) return '<div class="xt-topo"><b>Coadouro</b><small>Mesa 5 · você leu o QR code</small></div><ul class="xt-itens"><li><img src="' + FOTO + 'm-capuccino-400.webp" alt="" width="44" height="44"><span><b>Cappuccino</b><small>R$ 12,00</small></span><i>1</i></li><li><img src="' + FOTO + 'm-croissant-400.webp" alt="" width="44" height="44"><span><b>Croissant</b><small>R$ 11,00</small></span><i>1</i></li></ul><button class="xt-btn" type="button" data-exp-rodar>Enviar pedido · R$ 23,00</button>';
        var et = ['Recebido', 'Preparando', 'Pronto'];
        return '<div class="xt-topo"><b>Seu pedido · Mesa 5</b><small>Atualiza sozinho</small></div><div class="xt-status"><b>#0438</b><span>1 cappuccino, 1 croissant</span><ol class="xt-passos">' + et.map(function (e, i) { return '<li class="' + (i + 1 < f ? 'feito' : i + 1 === f ? 'agora' : '') + '">' + e + '</li>'; }).join('') + '</ol><p class="xt-agora">' + ['', 'Pedido recebido pela cozinha', 'Preparando o seu pedido…', 'Pronto! O garçom já está levando ☕'][f] + '</p></div>';
      }
    },
    marc: {
      dono: 'Painel da Respiga Marcenaria', cel: 'Celular da cliente · link do orçamento', botao: 'A cliente aprova o orçamento', abrir: '/demos/sistemas/orcamento/', escolha: 1,
      log: [function () { return 'A cliente comparou 3 opções e escolheu a ' + ['mais simples', 'do meio', 'mais completa'][this.escolha] + '.'; }, 'Assinou pelo celular: o orçamento aprovado vale como combinado.', 'O serviço nasceu sozinho: medição marcada e sinal registrado.'],
      opcoes: [['Bom', 'MDF branco', 11900], ['Melhor', 'MDF amadeirado e LED', 13450], ['Premium', 'Amadeirado, LED e puxador embutido', 15800]],
      donoHtml: function (f) {
        var c = this, op = c.opcoes[c.escolha], aprov = 21852 + (f >= 2 ? op[2] : 0);
        return '<div class="xd-topo"><b>Orçamentos</b><span class="xd-kpi">Aprovado no mês <strong>' + R0(aprov) + '</strong></span></div>' +
          '<ul class="xd-lista"><li class="' + (f >= 2 ? 'x-novo' : '') + '"><span><b>1043 · Mariana Couto</b><small>Cozinha · 3 opções</small></span>' + (f >= 2 ? '<i class="x-ok">Aprovado · ' + op[0] + '</i>' : f === 1 ? '<i class="x-azul">Escolhendo…</i>' : '<i class="x-azul">Enviado</i>') + '</li><li><span><b>1044 · Rafael Lima</b><small>Quarto do casal</small></span><i class="x-azul">Enviado</i></li></ul>' +
          (f >= 3 ? '<div class="xd-novo x-novo"><b>Serviço criado</b><span>Medição técnica: ' + dataCurta(3) + '</span><span>Sinal de ' + R0(op[2] * .4) + ' recebido no Pix</span></div>' : '');
      },
      celHtml: function (f) {
        var c = this;
        return '<div class="xt-topo"><b>Respiga Marcenaria</b><small>Orçamento nº 1043 · Cozinha</small></div><div class="xt-ops" role="group" aria-label="Opções do orçamento">' + c.opcoes.map(function (o, i) { return '<button type="button" class="xt-op' + (i === c.escolha && f ? ' sel' : '') + '" data-op="' + i + '"' + (f >= 2 ? ' disabled' : '') + ' aria-pressed="' + (i === c.escolha && f ? 'true' : 'false') + '"><b>' + o[0] + (i === 1 ? ' <i>mais escolhido</i>' : '') + '</b><small>' + o[1] + '</small><span>' + R0(o[2]) + '</span></button>'; }).join('') + '</div>' +
          (f >= 2 ? '<div class="xt-assin"><svg viewBox="0 0 220 60" aria-hidden="true"><path pathLength="1" d="M8 40c14-26 22-30 26-8 3 18 10 10 16-6 5-14 10-10 12 4 3 16 11 4 18-6 9-12 16 6 24 2 10-6 18-14 30-8 12 6 22 4 34-6 10-8 18 0 34 2"/></svg><span>Assinado por Mariana Couto</span></div>' : '<button class="xt-btn" type="button" data-exp-rodar>Aprovar e assinar</button>');
      }
    },
    acad: {
      dono: 'Painel da FORJA Academia', cel: 'Celular do aluno · app da academia', botao: 'O aluno reserva a aula', abrir: '/demos/sistemas/academia/',
      log: ['O aluno reservou a última vaga da bike pelo celular.', 'Marcou os exercícios feitos, e a carga nova já vai para a ficha.', 'Ele vê a própria evolução, e o professor também.'],
      donoHtml: function (f) {
        var aula = function (h, m, oc, v, novo) { var p = oc / v; return '<li class="' + (novo ? 'x-novo' : '') + '"><span><b>' + h + ' · ' + m + '</b><small>' + oc + '/' + v + ' vagas</small></span><span class="xd-barra"><i class="' + (p >= 1 ? 'cheia' : p >= .8 ? 'quase' : '') + '" style="width:' + Math.min(100, p * 100) + '%"></i></span>' + (p >= 1 ? '<i class="x-lar">Lotada</i>' : '') + '</li>'; };
        return '<div class="xd-topo"><b>Aulas de hoje</b><span class="xd-kpi">Treinos feitos hoje <strong>' + (f >= 2 ? 24 : 23) + '</strong></span></div><ul class="xd-lista">' + aula('18h', 'Boxe', 8, 12) + aula('18h30', 'Bike indoor', f ? 20 : 19, 20, f === 1) + aula('19h15', 'Funcional', 9, 16) + '</ul>' +
          (f >= 2 ? '<div class="xd-novo x-novo"><b>Lucas Andrade treinou</b><span>Puxada frontal: carga subiu para 47,5 kg</span><span>3 treinos nesta semana</span></div>' : '');
      },
      celHtml: function (f) {
        var ex = [['Puxada frontal', '4 × 10 · ' + (f >= 2 ? '47,5' : '45') + ' kg'], ['Remada baixa', '3 × 12 · 40 kg'], ['Rosca direta', '4 × 10 · 20 kg']];
        return '<div class="xt-topo"><b>FORJA</b><small>Olá, Lucas! Treino B · costas e bíceps</small></div><ul class="xt-ex">' + ex.map(function (e, i) { return '<li class="' + (f >= 2 && i < (f >= 3 ? 3 : 2) ? 'feito' : '') + '"><i aria-hidden="true">' + (f >= 2 && i < (f >= 3 ? 3 : 2) ? '✓' : '') + '</i><span><b>' + e[0] + '</b><small>' + e[1] + '</small></span></li>'; }).join('') + '</ul>' +
          (f >= 3 ? '<div class="xt-evo"><b>Sua evolução na puxada</b><svg viewBox="0 0 200 50" aria-hidden="true"><polyline pathLength="1" points="4,44 40,40 76,34 112,30 148,22 196,8"/></svg><small>40 kg → 47,5 kg em 6 semanas</small></div>' :
            '<div class="xt-aula"><span><b>Bike indoor · 18h30</b><small>' + (f ? 'Reservado ✓ · lembrete 1 h antes' : 'Resta 1 vaga') + '</small></span>' + (f ? '' : '<button class="xt-btn mini" type="button" data-exp-rodar>Reservar</button>') + '</div>');
      }
    },
    barb: {
      dono: 'Painel da Ofício Barbearia', cel: 'WhatsApp do fornecedor', botao: 'Vender uma pomada no balcão', abrir: '/demos/sistemas/estoque/',
      log: ['A venda no balcão já baixou o estoque.', 'O sistema viu que a pomada vai acabar e sugeriu o pedido.', 'O fornecedor recebeu o pedido pronto no WhatsApp.'],
      donoHtml: function (f) {
        var item = function (n, q, min, cls, novo) { var max = min * 2.4; return '<li class="' + (novo ? 'x-novo' : '') + '"><span><b>' + n + '</b><small>' + q + ' un · mínimo ' + min + '</small></span><span class="xd-barra"><i class="' + cls + '" style="width:' + Math.min(100, q / max * 100) + '%"></i></span>' + (cls === 'quase' ? '<i class="x-lar">Acabando</i>' : '') + '</li>'; };
        return '<div class="xd-topo"><b>Estoque e balcão</b><span class="xd-kpi">Vendas hoje <strong>' + R(f ? 285 : 236) + '</strong></span></div><ul class="xd-lista">' + item('Pomada efeito brilho', f ? 6 : 7, 6, f ? 'quase' : '', f === 1) + item('Óleo para barba', 9, 5, '') + item('Balm para barba', 7, 4, '') + '</ul>' +
          (f >= 2 ? '<div class="xd-novo x-novo"><b>Previsão: acaba em 5 dias</b><span>No ritmo das últimas semanas</span><span>Pedido sugerido: 6 pomadas · R$ 132,00</span></div>' : '');
      },
      celHtml: function (f) {
        var msgs = '<li class="cli"><span>Pedido nº 16 entregue ✓ Obrigado!</span><small>31/10</small></li>';
        if (f >= 3) msgs += '<li class="loja x-novo"><span>Olá, Sandra! Aqui é o Rafa, da Ofício. Pedido nº 18:\n• 6 un · Pomada modeladora efeito brilho\nPode me passar o prazo?</span><small>agora ✓✓</small></li><li class="cli x-novo2"><span>Pode deixar! Entrego amanhã cedo 👍</span><small>agora</small></li>';
        return '<div class="xt-zap"><span class="xt-av" aria-hidden="true">C</span><span><b>Cosméticos Exemplo</b><small>fornecedor</small></span></div><ol class="xt-msgs">' + msgs + '</ol>';
      }
    }
  };

  /* ================= o palco ================= */
  var exp = $('#exp');
  if (exp) (function () {
    var abas = $$('[role=tab]', exp), dono = $('#exp-dono'), cel = $('#exp-cel'), log = $('#exp-log'), rodar = $('#exp-rodar'), deNovo = $('#exp-de-novo');
    var cena = 'cafe', fase = 0, timers = [];
    function desenha() { var c = CENAS[cena]; dono.innerHTML = c.donoHtml(fase); cel.innerHTML = c.celHtml(fase); }
    function para() { timers.forEach(clearTimeout); timers = []; }
    function reinicia() {
      para(); fase = 0; var c = CENAS[cena]; if (c.escolha !== undefined) c.escolha = 1;
      $('#exp-rot-dono').textContent = c.dono; $('#exp-rot-cel').textContent = c.cel; $('#exp-rodar-txt').textContent = c.botao; $('#exp-abrir').href = c.abrir;
      rodar.disabled = false; rodar.hidden = false; deNovo.hidden = true; log.innerHTML = ''; exp.classList.remove('rodou'); desenha();
    }
    function roda() {
      // na marcenaria, escolher uma opção à mão já é o passo 1
      if (rodar.disabled) return; if (cena === 'marc' && fase === 1) fase = 0; if (fase) return; var c = CENAS[cena], passo = reduz ? 60 : 1300;
      rodar.disabled = true; exp.classList.add('rodou');
      [1, 2, 3].forEach(function (f, i) {
        timers.push(setTimeout(function () { fase = f; desenha(); var li = document.createElement('li'); li.textContent = typeof c.log[i] === 'function' ? c.log[i].call(c) : c.log[i]; log.appendChild(li); if (f === 3) { rodar.hidden = true; deNovo.hidden = false; deNovo.focus({ preventScroll: true }); } }, i * passo + (i ? 0 : 150)));
      });
    }
    function escolheAba(b, foco) {
      abas.forEach(function (x) { var s = x === b; x.setAttribute('aria-selected', s ? 'true' : 'false'); x.tabIndex = s ? 0 : -1; });
      $('#exp-painel').setAttribute('aria-labelledby', b.id); exp.dataset.cena = b.dataset.cena; cena = b.dataset.cena; reinicia(); if (foco) b.focus();
    }
    abas.forEach(function (b, i) {
      b.addEventListener('click', function () { escolheAba(b); });
      b.addEventListener('keydown', function (e) { var k = e.key, n = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? abas.length - 1 : null; if (n === null) return; e.preventDefault(); escolheAba(abas[(n + abas.length) % abas.length], true); });
    });
    rodar.addEventListener('click', roda);
    deNovo.addEventListener('click', function () { reinicia(); rodar.focus(); });
    cel.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-exp-rodar')) roda();
      else if (b.dataset.op !== undefined && cena === 'marc' && fase < 2) { CENAS.marc.escolha = +b.dataset.op; if (!fase) fase = 1; desenha(); var nb = $('[data-op="' + b.dataset.op + '"]', cel); if (nb) nb.focus(); }
    });
    exp.dataset.cena = 'cafe'; reinicia();
  })();

  /* ================= calculadora ================= */
  var calc = $('#s-calc');
  if (calc) (function () {
    var P = {
      cafe: { nome: 'Cafeteria ou restaurante', q: ['Pedidos por dia', 120, 10, 400, 10, 26, ' pedidos'], m: ['Minutos para anotar e conferir cada pedido', 2, .5, 10, .5], p: ['Pedidos esquecidos ou errados por semana', 6, 0, 40, 1, 4.3], v: ['Valor médio do pedido', 24, 10, 200, 2], f: 1, nota: 'pedidos por dia × minutos × 26 dias, com o sistema eliminando 60% desse trabalho; mais pedidos perdidos por semana × 4,3 × valor médio.' },
      marc: { nome: 'Marcenaria ou serviços', q: ['Orçamentos por mês', 20, 2, 100, 1, 1, ' orçamentos'], m: ['Minutos para montar e mandar cada orçamento', 90, 10, 240, 5], p: ['Orçamentos que esfriam sem retorno, por mês', 4, 0, 30, 1, 1], v: ['Valor médio de um orçamento', 9000, 1000, 40000, 500], f: .25, nota: 'orçamentos por mês × minutos, com o sistema eliminando 60% desse trabalho; mais orçamentos que esfriam × valor médio, considerando que 1 em cada 4 fecharia com um lembrete na hora certa.' },
      acad: { nome: 'Academia ou estúdio', q: ['Atendimentos na recepção por dia', 60, 10, 300, 5, 26, ' atendimentos'], m: ['Minutos em cada um (cobrar, reservar, tirar dúvida)', 3, .5, 10, .5], p: ['Alunos que atrasam ou cancelam sem ninguém perceber, por mês', 8, 0, 60, 1, 1], v: ['Mensalidade média', 149, 50, 500, 5], f: 1, nota: 'atendimentos por dia × minutos × 26 dias, com o sistema eliminando 60% desse trabalho; mais mensalidades que deixam de se perder por mês.' },
      barb: { nome: 'Barbearia ou salão', q: ['Atendimentos por dia', 40, 5, 150, 5, 26, ' atendimentos'], m: ['Minutos com estoque e caixa por atendimento', 1, .5, 5, .5], p: ['Produtos que vencem, somem ou faltam por mês', 6, 0, 40, 1, 1], v: ['Valor médio do produto', 45, 10, 200, 5], f: 1, nota: 'atendimentos por dia × minutos × 26 dias, com o sistema eliminando 60% desse trabalho; mais produtos perdidos por mês × valor médio.' },
      outro: { nome: 'Outro negócio', q: ['Pedidos ou atendimentos por dia', 50, 5, 400, 5, 26, ' por dia'], m: ['Minutos anotando, conferindo ou cobrando cada um', 3, .5, 15, .5], p: ['Coisas esquecidas ou erradas por semana', 4, 0, 40, 1, 4.3], v: ['Valor médio de cada uma', 80, 10, 3000, 10], f: 1, nota: 'quantidade por dia × minutos × 26 dias, com o sistema eliminando 60% desse trabalho; mais perdas por semana × 4,3 × valor médio.' }
    };
    var tipo = 'cafe', mostrado = { h: 0, m: 0 }, anim = null;
    $('#s-tipos').innerHTML = Object.keys(P).map(function (k) { return '<label><input type="radio" name="s-tipo" value="' + k + '"' + (k === tipo ? ' checked' : '') + '><span>' + P[k].nome + '</span></label>'; }).join('');
    var campo = function (id, cfg) { var i = $('#s-' + id); i.min = cfg[2]; i.max = cfg[3]; i.step = cfg[4]; i.value = cfg[1]; $('#s-' + id + '-rot').textContent = cfg[0]; };
    function aplica() { var c = P[tipo]; campo('qtd', c.q); campo('min', c.m); campo('perda', c.p); campo('valor', c.v); $('.calc-note').textContent = 'Estimativa simples: ' + c.nota + ' O número real sai da conversa sobre o seu processo.'; conta(); }
    function conta() {
      var c = P[tipo], q = +$('#s-qtd').value, m = +$('#s-min').value, p = +$('#s-perda').value, v = +$('#s-valor').value;
      $('#so-qtd').textContent = q.toLocaleString('pt-BR') + (c.q[5] === 26 ? '/dia' : '/mês');
      $('#so-min').textContent = (m < 1 ? '30 s' : m.toLocaleString('pt-BR') + ' min');
      $('#so-perda').textContent = p + (c.p[5] === 1 ? '/mês' : '/semana');
      $('#so-valor').textContent = R0(v);
      var horas = Math.round(q * c.q[5] * m * .6 / 60), mes = Math.round(p * c.p[5] * v * c.f);
      anima({ h: horas, m: mes });
    }
    function mostra() { $('#sr-horas').textContent = Math.round(mostrado.h).toLocaleString('pt-BR'); $('#sr-mes').textContent = R0(mostrado.m); $('#sr-ano').textContent = R0(mostrado.m * 12); }
    function anima(alvo) {
      if (reduz) { mostrado = alvo; mostra(); return; }
      var de = { h: mostrado.h, m: mostrado.m }, t0 = performance.now(); cancelAnimationFrame(anim);
      (function f(t) { var k = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - k, 3); mostrado = { h: de.h + (alvo.h - de.h) * e, m: de.m + (alvo.m - de.m) * e }; mostra(); if (k < 1) anim = requestAnimationFrame(f); })(t0);
    }
    calc.addEventListener('input', function (e) { if (e.target.name === 's-tipo') return; conta(); });
    calc.addEventListener('change', function (e) { if (e.target.name === 's-tipo') { tipo = e.target.value; aplica(); } });
    calc.addEventListener('submit', function (e) { e.preventDefault(); });
    aplica();
  })();

  /* "Quero um sistema" marca o pedido de orçamento como sistema */
  $$('[data-quero-sistema]').forEach(function (a) { a.addEventListener('click', function () { var w = $('#w3'); if (w && !w.checked) { w.checked = true; w.dispatchEvent(new Event('change', { bubbles: true })); } }); });
})();
