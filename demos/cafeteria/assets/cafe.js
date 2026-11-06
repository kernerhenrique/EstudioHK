/* Coadouro · demonstração da EstudioHK. As animações de rolagem vêm do cena.js (kit da EstudioHK). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* revelar suave fora das cenas */
  var rv = $$('.rv'), reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduz) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ok'); io.unobserve(e.target); } }); }, { threshold: .1 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('ok'); });

  /* janela de demonstração */
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
})();
