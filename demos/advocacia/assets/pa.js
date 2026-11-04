/* Prates & Arruda Advogados · demonstração da EstudioHK. Sem dependências. */
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
    pedido = false; if (!secoes.length) return; var at = null;
    secoes.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * .35) at = s.id; });
    links.forEach(function (a) { if (a.getAttribute('href') === '#' + at) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(rolar); } }, { passive: true });

  /* ---------- revelar (só opacidade) ---------- */
  var rv = $$('.revela');
  if (temIO && !reduz) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ok'); io.unobserve(e.target); } }); }, { threshold: .08 });
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

  /* ---------- áreas de atuação (uma aberta por vez) ---------- */
  $$('.area-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.closest('.area'), abrirEsta = !it.classList.contains('aberta');
      $$('.area').forEach(function (x) { x.classList.remove('aberta'); $('.area-q', x).setAttribute('aria-expanded', 'false'); });
      if (abrirEsta) { it.classList.add('aberta'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- filtro de artigos ---------- */
  var filtros = $$('.filtros button'), status = $('#art-status');
  filtros.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.f, n = 0;
      filtros.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $$('#lista-artigos .artigo-card').forEach(function (c) { var mostra = f === 'todos' || c.dataset.area === f; c.hidden = !mostra; if (mostra) { n++; c.classList.add('ok'); } });
      if (status) status.textContent = n === 1 ? '1 artigo' : n + ' artigos';
    });
  });

  /* ---------- formulário de contato ---------- */
  var form = $('#form-contato');
  if (form) {
    var nome = $('#c-nome'), contato = $('#c-contato'), area = $('#c-area'), msg = $('#c-msg'), btn = $('#c-enviar'), ok = $('#c-ok');
    var pronto = function () { return nome.value.trim().length > 1 && contato.value.trim().length > 5 && area.value && msg.value.trim().length > 5; };
    var atualizar = function () { btn.disabled = !pronto(); ok.hidden = true; };
    form.addEventListener('input', atualizar); form.addEventListener('change', atualizar);
    form.addEventListener('submit', function (e) {
      e.preventDefault(); if (!pronto()) return;
      var assunto = area.options[area.selectedIndex].text;
      $('#c-ok-txt').textContent = nome.value.trim() + ', sua mensagem sobre “' + assunto + '” seria enviada ao escritório, e a resposta chegaria em ' + contato.value.trim() + ' em até um dia útil.';
      ok.hidden = false; $('#c-ok-t').focus();
    });
  }

  /* ---------- barra fixa no celular ---------- */
  var barra = $('#barra-m'), topoPag = $('.capa') || $('.interna-topo'), cont = $('#contato');
  if (temIO && barra && topoPag) {
    var vis = { topo: true, contato: false };
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.dataset.barra] = e.isIntersecting; });
      var m = !vis.topo && !vis.contato; barra.classList.toggle('visivel', m); barra.setAttribute('aria-hidden', m ? 'false' : 'true');
    });
    topoPag.dataset.barra = 'topo'; bio.observe(topoPag);
    if (cont) { cont.dataset.barra = 'contato'; bio.observe(cont); }
  }
  rolar();
})();
