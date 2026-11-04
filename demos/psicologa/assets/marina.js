/* Marina Coutinho, psicóloga · demonstração da EstudioHK. Sem dependências. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;

  /* ---------- menu ---------- */
  var btnMenu = $('.abre-menu'), gaveta = $('#gaveta');
  function menu(a) { gaveta.classList.toggle('aberta', a); btnMenu.setAttribute('aria-expanded', a ? 'true' : 'false'); btnMenu.setAttribute('aria-label', a ? 'Fechar menu' : 'Abrir menu'); }
  btnMenu.addEventListener('click', function () { menu(!gaveta.classList.contains('aberta')); });
  $$('a', gaveta).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gaveta.classList.contains('aberta')) { menu(false); btnMenu.focus(); } });

  var secoes = $$('main section[id]'), links = $$('.menu a'), pedido = false;
  function rolar() {
    pedido = false; var at = null;
    secoes.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * .35) at = s.id; });
    links.forEach(function (a) { if (a.getAttribute('href') === '#' + at) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(rolar); } }, { passive: true });

  /* ---------- revelar ao rolar ---------- */
  var rv = $$('.revela');
  if (temIO && !reduz) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ok'); io.unobserve(e.target); } }); }, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
    rv.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('ok'); else io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('ok'); });

  /* ---------- janela de demonstração ---------- */
  var janela = $('#janela'), quem = null;
  function abrir(t) { quem = document.activeElement; $('#j-texto').textContent = t; janela.hidden = false; document.body.style.overflow = 'hidden'; $('#j-titulo').focus(); }
  function fechar() { janela.hidden = true; document.body.style.overflow = ''; if (quem) quem.focus(); }
  $$('[data-demo]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); abrir(b.dataset.demo); }); });
  $('#j-fechar').addEventListener('click', fechar);
  janela.addEventListener('click', function (e) { if (e.target === janela) fechar(); });
  document.addEventListener('keydown', function (e) {
    if (janela.hidden) return;
    if (e.key === 'Escape') fechar();
    if (e.key === 'Tab') { var f = $$('a, button', janela), p = f[0], u = f[f.length - 1]; if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); } else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); } }
  });

  /* ---------- presencial ou online ---------- */
  var abas = $$('.modo-abas [role=tab]');
  function escolher(aba, focar) {
    abas.forEach(function (a) {
      var sel = a === aba;
      a.setAttribute('aria-selected', sel ? 'true' : 'false'); a.tabIndex = sel ? 0 : -1;
      $('#' + a.getAttribute('aria-controls')).hidden = !sel;
    });
    if (focar) aba.focus();
  }
  escolher(abas[0]);
  abas.forEach(function (a, i) {
    a.addEventListener('click', function () { escolher(a); });
    a.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); escolher(abas[(i + 1) % abas.length], true);
    });
  });

  /* ---------- formulário: monta a mensagem do WhatsApp ---------- */
  var form = $('#form-ag'), nome = $('#ag-nome'), extra = $('#ag-msg-in'), btn = $('#ag-montar'), saida = $('#ag-saida'), msg = $('#ag-msg');
  function marcado(n) { var i = $('input[name=' + n + ']:checked', form); return i ? i.value : ''; }
  function pronto() { return nome.value.trim().length > 1 && marcado('modo') && marcado('periodo'); }
  function atualizar() { btn.disabled = !pronto(); saida.hidden = true; }
  form.addEventListener('input', atualizar); form.addEventListener('change', atualizar);
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (!pronto()) return;
    var t = 'Olá, Marina! Gostaria de agendar uma primeira sessão.\n• Formato: ' + marcado('modo') + '\n• Melhor período: ' + marcado('periodo') + '\nNome: ' + nome.value.trim();
    if (extra.value.trim()) t += '\n\n' + extra.value.trim();
    msg.textContent = t; saida.hidden = false; $('#ag-saida-t').focus({ preventScroll: false });
  });

  /* ---------- dúvidas ---------- */
  $$('.acc-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.closest('.acc-item'), a = !it.classList.contains('aberto');
      $$('.acc-item').forEach(function (x) { x.classList.remove('aberto'); $('.acc-q', x).setAttribute('aria-expanded', 'false'); });
      if (a) { it.classList.add('aberto'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- barra fixa no celular ---------- */
  var barra = $('#barra-m');
  if (temIO) {
    var vis = { capa: true, contato: false };
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.dataset.barra] = e.isIntersecting; });
      var m = !vis.capa && !vis.contato; barra.classList.toggle('visivel', m); barra.setAttribute('aria-hidden', m ? 'false' : 'true');
    });
    var c = $('.capa'), g = $('#contato'); c.dataset.barra = 'capa'; g.dataset.barra = 'contato'; bio.observe(c); bio.observe(g);
  }
  rolar();
})();
