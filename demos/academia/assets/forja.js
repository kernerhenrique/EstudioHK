/* FORJA Academia · demonstração da EstudioHK. Sem dependências. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;
  var ESTUDIO = 'https://wa.me/5527996950409?text=' + encodeURIComponent('Olá! Vi a demo da academia (FORJA) e quero um site assim.');
  function rolarAte(sel) { var el = $(sel); if (el) el.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' }); }

  /* ---------- dados da demo ---------- */
  var MODS = {
    musculacao: { nome: 'Musculação', int: 2 }, funcional: { nome: 'Funcional', int: 3 }, bike: { nome: 'Bike indoor', int: 3 },
    boxe: { nome: 'Boxe', int: 3 }, hiit: { nome: 'HIIT', int: 3 }, yoga: { nome: 'Yoga e mobilidade', int: 1 }
  };
  var PROF = { funcional: 'Ana Lima', hiit: 'Ana Lima', bike: 'Diego Rocha', boxe: 'Marcos Vieira', yoga: 'Júlia Campos' };
  var DUR = { funcional: 45, hiit: 30, bike: 45, boxe: 60, yoga: 60 };
  var A = [['06:30', 'funcional'], ['07:15', 'bike'], ['12:15', 'hiit'], ['18:00', 'boxe'], ['18:30', 'bike'], ['19:15', 'funcional'], ['20:00', 'yoga']];
  var B = [['06:30', 'bike'], ['07:15', 'yoga'], ['12:15', 'funcional'], ['18:00', 'hiit'], ['18:30', 'boxe'], ['19:15', 'bike'], ['20:00', 'funcional']];
  var S = [['08:30', 'funcional'], ['09:30', 'bike'], ['10:30', 'yoga']];
  var GRADE = { 1: A, 2: B, 3: A, 4: B, 5: A, 6: S };
  var DIA_NOME = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  var DIA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  /* ---------- menu e cabeçalho ---------- */
  var btnMenu = $('.abre-menu'), gaveta = $('#gaveta');
  function menu(abrir) { gaveta.classList.toggle('aberta', abrir); btnMenu.setAttribute('aria-expanded', abrir ? 'true' : 'false'); btnMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu'); }
  btnMenu.addEventListener('click', function () { menu(!gaveta.classList.contains('aberta')); });
  $$('a', gaveta).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gaveta.classList.contains('aberta')) { menu(false); btnMenu.focus(); } });
  var secoes = $$('main section[id]'), links = $$('.menu a'), pedido = false;
  function rolar() {
    pedido = false; var vh = window.innerHeight, atual = null;
    secoes.forEach(function (s) { if (s.getBoundingClientRect().top < vh * .35) atual = s.id; });
    links.forEach(function (a) { if (a.getAttribute('href') === '#' + atual) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(rolar); } }, { passive: true });

  /* ---------- revelar e contadores ---------- */
  var fmt = new Intl.NumberFormat('pt-BR');
  function contar(el) {
    var alvo = +el.dataset.alvo, suf = el.dataset.suf || '';
    if (reduz) { el.textContent = fmt.format(alvo) + suf; return; }
    var t0 = performance.now(), dur = 1200;
    (function f(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt.format(Math.round(alvo * e)) + suf; if (k < 1) requestAnimationFrame(f); })(t0);
  }
  var revela = $$('.revela'), conts = $$('[data-alvo]');
  if (temIO && !reduz) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ok'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    revela.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('ok'); else io.observe(el); });
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { contar(e.target); cio.unobserve(e.target); } }); }, { threshold: .6 });
    conts.forEach(function (c) { c.textContent = '0' + (c.dataset.suf || ''); cio.observe(c); });
  } else { revela.forEach(function (el) { el.classList.add('ok'); }); conts.forEach(contar); }

  /* ---------- janela "isto é uma demonstração" ---------- */
  var janela = $('#janela'), jTexto = $('#j-texto'), quem = null;
  function abrirJanela(txt) { quem = document.activeElement; jTexto.textContent = txt; janela.hidden = false; document.body.style.overflow = 'hidden'; $('#j-titulo').focus(); }
  function fecharJanela() { janela.hidden = true; document.body.style.overflow = ''; if (quem) quem.focus(); }
  $$('[data-demo]').forEach(function (b) { b.addEventListener('click', function () { abrirJanela(b.dataset.demo); }); });
  $('#j-fechar').addEventListener('click', fecharJanela);
  janela.addEventListener('click', function (e) { if (e.target === janela) fecharJanela(); });
  document.addEventListener('keydown', function (e) {
    if (janela.hidden) return;
    if (e.key === 'Escape') fecharJanela();
    if (e.key === 'Tab') { var f = $$('a, button', janela), p = f[0], u = f[f.length - 1]; if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); } else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); } }
  });

  /* ---------- grade de horários ---------- */
  var tabs = $('#dias-tab'), lista = $('#grade-aulas'), chips = $$('#chips-mod button'), diaSel, modSel = 'todas';
  var hojeDow = new Date().getDay();
  [1, 2, 3, 4, 5, 6].forEach(function (d) {
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.dia = d;
    b.innerHTML = '<b>' + DIA_CURTO[d] + '</b><small>' + (d === hojeDow ? 'hoje' : DIA_NOME[d].toLowerCase()) + '</small>';
    b.setAttribute('aria-label', DIA_NOME[d] + (d === hojeDow ? ', hoje' : ''));
    tabs.appendChild(b);
  });
  function barras(n) { var h = '<span class="int" role="img" aria-label="Intensidade ' + n + ' de 3">'; for (var i = 1; i <= 3; i++) h += '<i class="' + (i <= n ? 'on' : '') + '"></i>'; return h + '</span>'; }
  function mostrarDia(d) {
    diaSel = d;
    $$('button', tabs).forEach(function (b) { var on = +b.dataset.dia === d; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
    var aulas = GRADE[d].filter(function (a) { return modSel === 'todas' || a[1] === modSel; });
    lista.textContent = '';
    $('#grade-status').textContent = aulas.length + (aulas.length === 1 ? ' aula' : ' aulas') + (modSel === 'todas' ? '' : ' de ' + MODS[modSel].nome) + ' na ' + DIA_NOME[d].toLowerCase().replace('sábado', 'sábado');
    if (!aulas.length) { var v = document.createElement('li'); v.className = 'vazio'; v.textContent = 'Sem aulas de ' + MODS[modSel].nome.toLowerCase() + ' neste dia. Tente outro dia.'; lista.appendChild(v); return; }
    aulas.forEach(function (a) {
      var li = document.createElement('li'); li.className = 'aula';
      li.innerHTML = '<span class="h">' + a[0] + '</span><span class="m"><b>' + MODS[a[1]].nome + '</b><small>' + DUR[a[1]] + ' min</small></span><span class="prof">' + PROF[a[1]] + '</span>' + barras(MODS[a[1]].int) +
        '<button class="btn btn-e reservar" type="button">Reservar</button>';
      $('.reservar', li).setAttribute('aria-label', 'Reservar aula grátis de ' + MODS[a[1]].nome + ', ' + DIA_NOME[d].toLowerCase() + ' às ' + a[0]);
      $('.reservar', li).addEventListener('click', function () { preencher({ mod: a[1], dia: d, hora: a[0] }); });
      lista.appendChild(li);
    });
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) mostrarDia(+b.dataset.dia); });
  tabs.addEventListener('keydown', function (e) {
    var ds = [1, 2, 3, 4, 5, 6], i = ds.indexOf(diaSel);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); i = (i + (e.key === 'ArrowRight' ? 1 : 5)) % 6; mostrarDia(ds[i]); $('button[data-dia="' + ds[i] + '"]', tabs).focus(); }
  });
  function filtrar(m) { modSel = m; chips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.mod === m ? 'true' : 'false'); }); mostrarDia(diaSel); }
  chips.forEach(function (c) { c.addEventListener('click', function () { filtrar(c.dataset.mod); }); });
  mostrarDia(hojeDow >= 1 ? hojeDow : 1);
  $$('[data-ver-horarios]').forEach(function (b) {
    b.addEventListener('click', function () { var m = b.dataset.verHorarios; if (m === 'musculacao') { rolarAte('#horarios'); return; } filtrar(m); rolarAte('#horarios'); });
  });

  /* ---------- planos: mensal ou anual ---------- */
  var chave = $$('#chave-planos button');
  function plano(tipo) {
    chave.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tipo === tipo ? 'true' : 'false'); });
    $$('.plano').forEach(function (p) {
      var anual = tipo === 'anual';
      $('.preco b', p).firstChild.nodeValue = 'R$ ' + p.dataset[anual ? 'anual' : 'mensal'] + ' ';
      $('.preco s', p).hidden = !anual; $('.preco s', p).textContent = 'R$ ' + p.dataset.mensal;
      $('.fid', p).textContent = anual ? '12 meses' : 'Sem fidelidade';
      $('.preco span', p).textContent = anual ? 'por mês, no plano anual' : 'por mês, cancele quando quiser';
    });
  }
  chave.forEach(function (b) { b.addEventListener('click', function () { plano(b.dataset.tipo); }); });

  /* ---------- quiz: qual treino combina com você ---------- */
  var PERG = [
    { t: 'Qual é o seu objetivo agora?', o: [['peso', 'Perder peso'], ['forca', 'Ganhar força'], ['folego', 'Ter mais fôlego'], ['estresse', 'Aliviar o estresse']] },
    { t: 'Como você prefere treinar?', o: [['grupo', 'Em grupo, com professor', 'aula com hora marcada'], ['sozinho', 'No meu ritmo', 'com treino montado para mim']] },
    { t: 'Qual intensidade você topa?', o: [['leve', 'Leve', 'estou começando'], ['moderada', 'Moderada', 'quero suar sem exagero'], ['intensa', 'Intensa', 'quero sair destruído']] }
  ];
  var PESO = {
    peso: { hiit: 3, bike: 3, funcional: 2, boxe: 1, musculacao: 1 }, forca: { musculacao: 3, funcional: 2, boxe: 1 },
    folego: { bike: 3, boxe: 2, hiit: 2, funcional: 1 }, estresse: { yoga: 3, boxe: 2, bike: 1 },
    grupo: { funcional: 2, bike: 2, boxe: 2, hiit: 2, yoga: 2 }, sozinho: { musculacao: 4 },
    leve: { yoga: 3, musculacao: 2, funcional: 1 }, moderada: { funcional: 2, bike: 2, musculacao: 1 }, intensa: { hiit: 3, boxe: 2, bike: 1 }
  };
  var POR_QUE = {
    musculacao: 'Treino montado pelo professor na avaliação, no seu horário e no seu ritmo, com acompanhamento no salão.',
    funcional: 'Aulas em grupo que trabalham força e condicionamento juntos, com adaptação para quem está começando.',
    bike: 'Música alta, luz baixa e um treino de fôlego que cada um faz no próprio ritmo.',
    boxe: 'Técnica, condicionamento e um ótimo jeito de descarregar o dia, sem contato no começo.',
    hiit: 'Treino curto e intenso: 30 minutos que rendem como uma hora.',
    yoga: 'Mobilidade, respiração e alongamento para destravar o corpo e a cabeça.'
  };
  var quizEl = $('#quiz'), resp = [];
  function quizPasso(i) {
    quizEl.textContent = '';
    var prog = document.createElement('div'); prog.className = 'prog'; prog.setAttribute('aria-hidden', 'true');
    for (var k = 0; k < 3; k++) { var t = document.createElement('i'); if (k <= i) t.className = 'on'; prog.appendChild(t); }
    quizEl.appendChild(prog);
    if (i < 3) {
      var h = document.createElement('h3'); h.tabIndex = -1; h.textContent = PERG[i].t; quizEl.appendChild(h);
      var p = document.createElement('p'); p.className = 'sr'; p.textContent = 'Pergunta ' + (i + 1) + ' de 3'; quizEl.appendChild(p);
      var g = document.createElement('div'); g.className = 'opcoes';
      PERG[i].o.forEach(function (o) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = o[1];
        if (o[2]) { var s = document.createElement('small'); s.textContent = o[2]; b.appendChild(s); }
        b.addEventListener('click', function () { resp[i] = o[0]; quizPasso(i + 1); $('h3', quizEl).focus({ preventScroll: true }); });
        g.appendChild(b);
      });
      quizEl.appendChild(g);
      return;
    }
    var pts = {};
    resp.forEach(function (r) { var m = PESO[r] || {}; Object.keys(m).forEach(function (k) { pts[k] = (pts[k] || 0) + m[k]; }); });
    var melhor = Object.keys(pts).sort(function (a, b) { return pts[b] - pts[a]; })[0] || 'funcional';
    var box = document.createElement('div'); box.className = 'resultado';
    box.innerHTML = '<span class="tag">Seu treino ideal</span><h3 tabindex="-1"></h3><p></p><div class="linha-btn"><button class="btn btn-s" type="button" data-q="agendar">Agendar aula grátis <span class="seta" aria-hidden="true">→</span></button><button class="refazer" type="button" data-q="refazer">Refazer o teste</button></div>';
    $('h3', box).textContent = MODS[melhor].nome; $('p', box).textContent = POR_QUE[melhor];
    $('[data-q=agendar]', box).addEventListener('click', function () { preencher({ mod: melhor }); });
    $('[data-q=refazer]', box).addEventListener('click', function () { resp = []; quizPasso(0); $('h3', quizEl).focus({ preventScroll: true }); });
    quizEl.appendChild(box);
  }
  quizPasso(0);

  /* ---------- aula grátis em 2 passos ---------- */
  var form = $('#form-ag'), passos = $$('.passo', form), seguir = $('#ag-seguir'), voltar = $('#ag-voltar'), passo = 1, st = $('#ag-status');
  var diasEl = $('#ag-dias'), proximos = [];
  (function () {
    var d = new Date(); d.setHours(12, 0, 0, 0); var agora = new Date();
    while (proximos.length < 5) {
      var dow = d.getDay(), hoje = d.toDateString() === agora.toDateString();
      if (dow !== 0 && !(hoje && agora.getHours() >= 19)) proximos.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    proximos.forEach(function (x, i) {
      var rot = (i === 0 && x.toDateString() === agora.toDateString()) ? 'Hoje' : DIA_CURTO[x.getDay()];
      var l = document.createElement('label'); l.className = 'pilula';
      l.innerHTML = '<input type="radio" name="dia" value="' + x.getDay() + '|' + x.getDate() + '/' + (x.getMonth() + 1) + '"><span>' + rot + '<small>' + String(x.getDate()).padStart(2, '0') + '/' + String(x.getMonth() + 1).padStart(2, '0') + '</small></span>';
      diasEl.appendChild(l);
    });
  })();
  function val(nome) { var i = $('input[name=' + nome + ']:checked', form); return i ? i.value : ''; }
  function podeSeguir() {
    if (passo === 1) return !!(val('mod') && val('periodo') && val('dia'));
    if (passo === 2) return $('#ag-nome').value.trim().length > 1 && $('#ag-zap').value.replace(/\D/g, '').length >= 10;
    return true;
  }
  function mensagem() {
    var dia = val('dia').split('|'), dow = +dia[0];
    return 'Olá, FORJA! Quero agendar minha aula experimental grátis.\n• Modalidade: ' + MODS[val('mod')].nome + '\n• Dia: ' + DIA_NOME[dow].toLowerCase() + ', ' + dia[1] + '\n• Período: ' + val('periodo') + '\nNome: ' + $('#ag-nome').value.trim() + '\nWhatsApp: ' + $('#ag-zap').value.trim();
  }
  function ir(n, focar) {
    passo = n;
    passos.forEach(function (p) { p.hidden = +p.dataset.passo !== n; });
    voltar.hidden = n === 1;
    seguir.disabled = !podeSeguir();
    seguir.innerHTML = n === 1 ? 'Continuar <span class="seta" aria-hidden="true">→</span>' : n === 2 ? 'Montar mensagem <span class="seta" aria-hidden="true">→</span>' : 'Quero um site assim <span class="seta" aria-hidden="true">→</span>';
    voltar.textContent = n === 3 ? '↺ Agendar outra aula' : '← Voltar';
    if (n === 3) $('#ag-msg').textContent = mensagem();
    st.textContent = n === 1 ? 'Passo 1 de 2' : n === 2 ? 'Passo 2 de 2' : 'Mensagem pronta';
    if (focar) $('h3', passos[n - 1]).focus({ preventScroll: true });
  }
  form.addEventListener('change', function () { seguir.disabled = !podeSeguir(); });
  form.addEventListener('input', function (e) {
    if (e.target.id === 'ag-zap') { // máscara (27) 99999-9999
      var d = e.target.value.replace(/\D/g, '').slice(0, 11), o = d;
      if (d.length > 2) o = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) o = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length === 11 ? 7 : 6) + '-' + d.slice(d.length === 11 ? 7 : 6);
      e.target.value = o;
    }
    seguir.disabled = !podeSeguir();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  seguir.addEventListener('click', function () {
    if (passo === 3) { window.open(ESTUDIO, '_blank', 'noopener'); return; }
    if (passo === 2 && !podeSeguir()) { $('#erro-zap').textContent = 'Digite o WhatsApp com DDD.'; return; }
    if (podeSeguir()) ir(passo + 1, true);
  });
  $('#ag-zap').addEventListener('blur', function () { var n = this.value.replace(/\D/g, '').length; $('#erro-zap').textContent = n && n < 10 ? 'Digite o WhatsApp com DDD.' : ''; });
  voltar.addEventListener('click', function () {
    if (passo === 3) { form.reset(); ir(1, true); return; }
    ir(passo - 1, true);
  });
  function marcar(nome, valor) { var i = $('input[name=' + nome + '][value="' + valor + '"]', form); if (i) i.checked = true; }
  function preencher(o) {
    if (o.mod) marcar('mod', o.mod);
    if (o.hora) { var h = +o.hora.slice(0, 2); marcar('periodo', h < 12 ? 'manhã' : h < 18 ? 'tarde' : 'noite'); }
    if (o.dia) { var x = $$('input[name=dia]', form).filter(function (i) { return +i.value.split('|')[0] === o.dia; })[0]; if (x) x.checked = true; }
    ir(1, false); seguir.disabled = !podeSeguir();
    rolarAte('#aula-gratis');
    setTimeout(function () { $('h3', passos[0]).focus({ preventScroll: true }); }, reduz ? 0 : 700);
  }
  ir(1, false);

  /* ---------- dúvidas ---------- */
  $$('.acc-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.closest('.acc-item'), abrir = !item.classList.contains('aberto');
      $$('.acc-item').forEach(function (it) { it.classList.remove('aberto'); $('.acc-q', it).setAttribute('aria-expanded', 'false'); });
      if (abrir) { item.classList.add('aberto'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- barra fixa no celular ---------- */
  var barra = $('#barra-m');
  if (temIO) {
    var vis = { capa: true, ag: false };
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.dataset.barra] = e.isIntersecting; });
      var m = !vis.capa && !vis.ag; barra.classList.toggle('visivel', m); barra.setAttribute('aria-hidden', m ? 'false' : 'true');
    });
    var c = $('.capa'), g = $('#aula-gratis'); c.dataset.barra = 'capa'; g.dataset.barra = 'ag'; bio.observe(c); bio.observe(g);
  }
  rolar();
})();
