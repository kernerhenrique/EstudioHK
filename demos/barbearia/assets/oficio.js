/* Ofício Barbearia · demonstração da EstudioHK. Sem dependências. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;
  var ESTUDIO = 'https://wa.me/5527996950409?text=' + encodeURIComponent('Olá! Vi a demo da barbearia (Ofício) e quero um site assim.');

  /* ---------- dados da demo ---------- */
  var SERVICOS = [
    { id: 'corte', nome: 'Corte', preco: 60, min: 45 },
    { id: 'barba', nome: 'Barba com toalha quente', preco: 45, min: 30 },
    { id: 'combo', nome: 'Corte + barba', preco: 95, min: 75 },
    { id: 'degrade', nome: 'Degradê navalhado', preco: 65, min: 50 },
    { id: 'pigmentacao', nome: 'Pigmentação de barba', preco: 40, min: 30 },
    { id: 'infantil', nome: 'Corte infantil', preco: 50, min: 40 },
    { id: 'sobrancelha', nome: 'Sobrancelha', preco: 20, min: 15 },
    { id: 'pezinho', nome: 'Pezinho', preco: 20, min: 15 }
  ];
  var BARBEIROS = [
    { id: 'leo', nome: 'Léo', esp: 'Degradê e navalhado' },
    { id: 'caio', nome: 'Caio', esp: 'Barba e pigmentação' },
    { id: 'rafa', nome: 'Rafa', esp: 'Clássicos na tesoura' },
    { id: 'qualquer', nome: 'Qualquer um', esp: 'Primeiro horário livre' }
  ];
  var SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var CURTA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  /* ---------- menu do celular e cabeçalho ---------- */
  var topo = $('#topo'), btnMenu = $('.abre-menu'), gaveta = $('#gaveta');
  function menu(abrir) {
    gaveta.classList.toggle('aberta', abrir);
    btnMenu.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    btnMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  }
  btnMenu.addEventListener('click', function () { menu(!gaveta.classList.contains('aberta')); });
  $$('a', gaveta).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gaveta.classList.contains('aberta')) { menu(false); btnMenu.focus(); } });

  /* ---------- rolagem: cabeçalho, link ativo, parallax leve ---------- */
  var secoes = $$('main section[id]'), links = $$('.menu a'), fotoCapa = $('.capa-foto img'), pedido = false;
  function rolar() {
    pedido = false;
    var y = window.scrollY, vh = window.innerHeight;
    topo.classList.toggle('rolou', y > 10);
    var atual = null;
    secoes.forEach(function (s) { if (s.getBoundingClientRect().top < vh * .35) atual = s.id; });
    links.forEach(function (a) { if (a.getAttribute('href') === '#' + atual) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    if (!reduz && fotoCapa && y < vh * 1.2) fotoCapa.style.setProperty('--par', (-Math.min(y, vh) * 0.06).toFixed(1) + 'px');
  }
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(rolar); } }, { passive: true });
  rolar();

  /* ---------- revelar ao rolar ---------- */
  var anim = $$('.revela');
  if (temIO && !reduz) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ok'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    anim.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('ok'); else io.observe(el); });
  } else anim.forEach(function (el) { el.classList.add('ok'); });

  /* ---------- janela "isto é uma demonstração" ---------- */
  var janela = $('#janela'), jMsg = $('#j-msg'), jZap = $('#j-zap'), jTexto = $('#j-texto'), quemAbriu = null;
  function abrirJanela(msg) {
    quemAbriu = document.activeElement;
    if (msg === 'mapa') {
      jTexto.textContent = 'Num site de verdade, este botão abriria o Google Maps com a rota até a barbearia. Aqui o endereço é fictício.';
      jZap.hidden = true;
    } else {
      jTexto.textContent = 'Num site de verdade, este botão abriria o WhatsApp da Ofício com a mensagem pronta:';
      jZap.hidden = false; jMsg.textContent = msg;
    }
    janela.hidden = false; document.body.style.overflow = 'hidden';
    $('#j-titulo').focus();
  }
  function fecharJanela() { janela.hidden = true; document.body.style.overflow = ''; if (quemAbriu) quemAbriu.focus(); }
  $$('[data-contato]').forEach(function (b) { b.addEventListener('click', function () { abrirJanela(b.dataset.contato); }); });
  $('#j-fechar').addEventListener('click', fecharJanela);
  janela.addEventListener('click', function (e) { if (e.target === janela) fecharJanela(); });
  document.addEventListener('keydown', function (e) {
    if (janela.hidden) return;
    if (e.key === 'Escape') fecharJanela();
    if (e.key === 'Tab') { // mantém o foco dentro da janela
      var f = $$('a, button', janela), p = f[0], u = f[f.length - 1];
      if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); }
      else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); }
    }
  });

  /* ---------- agendamento em 3 passos ---------- */
  var form = $('#ag'), etapas = $$('.etapa', form), ind = $$('#passos-ind li'), btnSeguir = $('#ag-seguir'), btnVoltar = $('#ag-voltar'), status = $('#ag-status');
  var estado = { servico: null, barbeiro: null, dia: null, hora: null }, passo = 1;

  function op(nome, valor, html, marcado, desativado) {
    var l = document.createElement('label'); l.className = 'op';
    l.innerHTML = '<input type="radio" name="' + nome + '" value="' + valor + '"' + (marcado ? ' checked' : '') + (desativado ? ' disabled' : '') + '><span>' + html + '</span>';
    return l;
  }
  // serviços e barbeiros
  var opS = $('#op-servicos'), opB = $('#op-barbeiros');
  SERVICOS.forEach(function (s) { opS.appendChild(op('servico', s.id, '<span>' + s.nome + '<small>' + s.min + ' min</small></span><em>R$ ' + s.preco + '</em>')); });
  BARBEIROS.forEach(function (b) { opB.appendChild(op('barbeiro', b.id, '<span>' + b.nome + '<small>' + b.esp + '</small></span>')); });

  // próximos 6 dias de funcionamento (terça a sábado)
  function proximosDias() {
    var d = new Date(), out = [];
    d.setHours(12, 0, 0, 0);
    var agora = new Date();
    while (out.length < 6) {
      var dow = d.getDay(), fecha = dow === 6 ? 18 : 20;
      var hoje = d.toDateString() === agora.toDateString();
      if (dow >= 2 && dow <= 6 && !(hoje && agora.getHours() >= fecha - 1)) out.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }
  function chaveDia(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function ocupado(dia, hora, barb) { // disponibilidade fictícia, mas estável para o mesmo dia
    var s = dia + hora + barb, h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 100 < (barb === 'qualquer' ? 18 : 42);
  }
  var DIAS = proximosDias(), opD = $('#op-dias'), opH = $('#op-horas');
  DIAS.forEach(function (d, i) {
    var rot = i === 0 && d.toDateString() === new Date().toDateString() ? 'hoje' : CURTA[d.getDay()];
    opD.appendChild(op('dia', chaveDia(d), '<small>' + rot + '</small><b>' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '</b>'));
  });
  function montarHoras() {
    opH.textContent = '';
    var d = DIAS.filter(function (x) { return chaveDia(x) === estado.dia; })[0];
    if (!d) { opH.innerHTML = '<p class="sub" style="grid-column:1/-1">Escolha um dia para ver os horários.</p>'; return; }
    var ini = d.getDay() === 6 ? 8 : 9, fim = d.getDay() === 6 ? 17.5 : 19.5, agora = new Date(), hoje = d.toDateString() === agora.toDateString();
    for (var t = ini; t <= fim; t += .5) {
      var hh = String(Math.floor(t)).padStart(2, '0') + ':' + (t % 1 ? '30' : '00');
      var passou = hoje && (Math.floor(t) < agora.getHours() + 1);
      var oc = passou || ocupado(estado.dia, hh, estado.barbeiro || 'qualquer');
      opH.appendChild(op('hora', hh, hh + (oc ? '<span class="sr"> (indisponível)</span>' : ''), estado.hora === hh && !oc, oc));
    }
  }
  function nomeServ() { var s = SERVICOS.filter(function (x) { return x.id === estado.servico; })[0]; return s; }
  function nomeBarb() { var b = BARBEIROS.filter(function (x) { return x.id === estado.barbeiro; })[0]; return b; }
  function textoDia() { var d = DIAS.filter(function (x) { return chaveDia(x) === estado.dia; })[0]; return d ? SEMANA[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') : ''; }
  function mensagem() {
    var s = nomeServ(), b = nomeBarb(), nome = $('#nome').value.trim();
    return 'Olá, Ofício! Quero agendar:\n• ' + s.nome + ' (R$ ' + s.preco + ')\n• ' + (b.id === 'qualquer' ? 'Com qualquer barbeiro' : 'Com o ' + b.nome) + '\n• ' + textoDia() + ', às ' + estado.hora + (nome ? '\nNome: ' + nome : '') + '\nPode confirmar?';
  }
  function podeSeguir() {
    if (passo === 1) return !!estado.servico;
    if (passo === 2) return !!estado.barbeiro;
    if (passo === 3) return !!(estado.dia && estado.hora);
    return true;
  }
  function ir(n, focar) {
    passo = n;
    etapas.forEach(function (e) { e.hidden = +e.dataset.etapa !== n; });
    ind.forEach(function (li, i) { li.classList.toggle('feito', i + 1 < n); li.classList.toggle('atual', i + 1 === n); });
    btnVoltar.hidden = n === 1;
    btnSeguir.disabled = !podeSeguir();
    if (n === 3) montarHoras();
    if (n === 4) {
      var s = nomeServ(), b = nomeBarb();
      $('#resumo').innerHTML = '';
      [['Serviço', s.nome + ' · R$ ' + s.preco], ['Barbeiro', b.nome], ['Quando', textoDia() + ' às ' + estado.hora]].forEach(function (p) {
        var div = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
        dt.textContent = p[0]; dd.textContent = p[1]; div.appendChild(dt); div.appendChild(dd); $('#resumo').appendChild(div);
      });
    }
    if (n === 5) $('#msg-final').textContent = mensagem();
    btnSeguir.innerHTML = n === 4 ? 'Montar pedido <span class="seta" aria-hidden="true">→</span>' : n === 5 ? 'Quero um site assim <span class="seta" aria-hidden="true">→</span>' : 'Continuar <span class="seta" aria-hidden="true">→</span>';
    btnVoltar.textContent = n === 5 ? '↺ Fazer outro agendamento' : '← Voltar';
    status.textContent = n <= 3 ? 'Passo ' + n + ' de 3' : n === 4 ? 'Revise o agendamento' : 'Pedido pronto';
    if (focar) $('h3', etapas[n - 1]).focus({ preventScroll: true });
  }
  form.addEventListener('change', function (e) {
    var t = e.target; if (t.type !== 'radio') return;
    estado[t.name] = t.value;
    if (t.name === 'barbeiro' || t.name === 'dia') { estado.hora = null; if (passo === 3) montarHoras(); }
    btnSeguir.disabled = !podeSeguir();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  btnSeguir.addEventListener('click', function () {
    if (passo === 5) { window.open(ESTUDIO, '_blank', 'noopener'); return; }
    if (podeSeguir()) ir(passo + 1, true);
  });
  btnVoltar.addEventListener('click', function () {
    if (passo === 5) { estado = { servico: null, barbeiro: null, dia: null, hora: null }; $$('input[type=radio]', form).forEach(function (i) { i.checked = false; }); $('#nome').value = ''; ir(1, true); return; }
    ir(passo - 1, true);
  });
  function marcar(nome, valor) {
    var i = $('input[name=' + nome + '][value="' + valor + '"]', form); if (i) { i.checked = true; estado[nome] = valor; }
  }
  function irParaAgenda() { $('#agendar').scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' }); }
  // atalhos: serviço do cardápio e "Agendar com..."
  $$('[data-servico]').forEach(function (b) { b.addEventListener('click', function () { marcar('servico', b.dataset.servico); ir(estado.barbeiro ? 3 : 2, false); irParaAgenda(); setTimeout(function () { $('h3', etapas[passo - 1]).focus({ preventScroll: true }); }, reduz ? 0 : 600); }); });
  $$('[data-barbeiro]').forEach(function (b) { b.addEventListener('click', function () { marcar('barbeiro', b.dataset.barbeiro); estado.hora = null; ir(estado.servico ? 3 : 1, false); irParaAgenda(); setTimeout(function () { $('h3', etapas[passo - 1]).focus({ preventScroll: true }); }, reduz ? 0 : 600); }); });
  ir(1, false);

  /* ---------- galeria com filtro ---------- */
  var filtros = $$('[data-filtro]'), fotos = $$('.fotos li');
  filtros.forEach(function (f) {
    f.addEventListener('click', function () {
      filtros.forEach(function (x) { x.setAttribute('aria-pressed', x === f ? 'true' : 'false'); });
      fotos.forEach(function (li) { li.hidden = !(f.dataset.filtro === 'todos' || li.dataset.tipo === f.dataset.filtro); if (!li.hidden) li.classList.add('ok'); });
    });
  });

  /* ---------- dúvidas ---------- */
  $$('.acc-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.closest('.acc-item'), abrir = !item.classList.contains('aberto');
      $$('.acc-item').forEach(function (it) { it.classList.remove('aberto'); $('.acc-q', it).setAttribute('aria-expanded', 'false'); });
      if (abrir) { item.classList.add('aberto'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- barra fixa no celular: some na capa e no agendamento ---------- */
  var barra = $('#barra-ag');
  if (temIO) {
    var vis = { capa: true, agendar: false };
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.dataset.barra] = e.isIntersecting; });
      var mostra = !vis.capa && !vis.agendar;
      barra.classList.toggle('visivel', mostra); barra.setAttribute('aria-hidden', mostra ? 'false' : 'true');
    });
    var capa = $('.capa'), ag = $('#agendar'); capa.dataset.barra = 'capa'; ag.dataset.barra = 'agendar';
    bio.observe(capa); bio.observe(ag);
  }
})();
