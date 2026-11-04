/* Amanda Ribeiro · Psicóloga infantojuvenil · site feito pela EstudioHK. Sem dependências. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;
  var ZAP = '5527998142609';

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

  /* ---------- abas de atendimento: pílula que desliza e troca suave do card ---------- */
  var abas = $$('.abas [role=tab]'), barraAbas = $('.abas'), paineis = $('.paineis'), atual = null;
  var ind = document.createElement('span'); ind.className = 'indicador'; ind.setAttribute('aria-hidden', 'true');
  barraAbas.insertBefore(ind, barraAbas.firstChild); barraAbas.classList.add('com-indicador');
  function posicionar(aba) {
    ind.style.width = aba.offsetWidth + 'px'; ind.style.height = aba.offsetHeight + 'px';
    ind.style.transform = 'translate(' + aba.offsetLeft + 'px,' + aba.offsetTop + 'px)';
  }
  function semTransicao(fn) { barraAbas.classList.add('sem-transicao'); fn(); void ind.offsetWidth; barraAbas.classList.toggle('sem-transicao', false); }
  function escolher(aba, focar, animar) {
    if (aba === atual) { if (focar) aba.focus(); return; }
    var h0 = paineis.offsetHeight;
    abas.forEach(function (a) {
      var sel = a === aba;
      a.setAttribute('aria-selected', sel ? 'true' : 'false'); a.tabIndex = sel ? 0 : -1;
      $('#' + a.getAttribute('aria-controls')).hidden = !sel;
    });
    atual = aba;
    if (animar) {
      posicionar(aba);
      var novo = $('#' + aba.getAttribute('aria-controls'));
      novo.classList.toggle('entrando', false); void novo.offsetWidth; novo.classList.add('entrando');
      var h1 = paineis.offsetHeight;
      if (h0 !== h1) {
        paineis.classList.add('animando'); paineis.style.height = h0 + 'px'; void paineis.offsetHeight; paineis.style.height = h1 + 'px';
        var fim = function () { paineis.style.height = ''; paineis.classList.toggle('animando', false); paineis.removeEventListener('transitionend', fim); };
        paineis.addEventListener('transitionend', fim); setTimeout(fim, 700);
      }
    } else semTransicao(function () { posicionar(aba); });
    if (focar) aba.focus();
  }
  escolher(abas[0], false, false);
  addEventListener('resize', function () { semTransicao(function () { posicionar(atual); }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { semTransicao(function () { posicionar(atual); }); });
  abas.forEach(function (a, i) {
    a.addEventListener('click', function () { escolher(a, false, true); });
    a.addEventListener('keydown', function (e) {
      var k = e.key, n = abas.length, j = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % n;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i + n - 1) % n;
      else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
      if (j === null) return;
      e.preventDefault(); escolher(abas[j], true, true);
    });
  });

  /* ---------- dúvidas ---------- */
  $$('.acc-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.closest('.acc-item'), a = !it.classList.contains('aberto');
      $$('.acc-item').forEach(function (x) { x.classList.remove('aberto'); $('.acc-q', x).setAttribute('aria-expanded', 'false'); });
      if (a) { it.classList.add('aberto'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- formulário: abre o WhatsApp com a mensagem pronta ---------- */
  var form = $('#form-ag'), nome = $('#ag-nome'), btn = $('#ag-enviar'), online = $('#serv-online'), nota = $('#nota-online');
  function marcado(n) { var i = $('input[name=' + n + ']:checked', form); return i ? i.value : ''; }
  function atualizar() {
    var quem = marcado('quem'), jovem = quem.indexOf('jovem') === 0 || quem.indexOf('um(a) jovem') === 0;
    var bloq = !!quem && !jovem;
    online.disabled = bloq; nota.hidden = !bloq;
    if (bloq && online.checked) online.checked = false;
    btn.disabled = !(nome.value.trim().length > 1 && quem && marcado('serv'));
  }
  form.addEventListener('input', atualizar); form.addEventListener('change', atualizar);
  form.addEventListener('submit', function (e) {
    e.preventDefault(); atualizar(); if (btn.disabled) return;
    var t = 'Olá, Amanda! Meu nome é ' + nome.value.trim() + ' e vim pelo site. Gostaria de agendar ' + marcado('serv') + ' para ' + marcado('quem') + '.';
    window.open('https://wa.me/' + ZAP + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
  });
  atualizar();

  /* ---------- barra fixa no celular ---------- */
  var barra = $('#barra-m');
  if (temIO) {
    var vis = { capa: true, contato: false };
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.dataset.barra] = e.isIntersecting; });
      var m = !vis.capa && !vis.contato; barra.classList.toggle('visivel', m); barra.setAttribute('aria-hidden', m ? 'false' : 'true');
      $('a', barra).tabIndex = m ? 0 : -1;
    });
    var c = $('.capa'), g = $('#contato'); c.dataset.barra = 'capa'; g.dataset.barra = 'contato'; bio.observe(c); bio.observe(g);
  }
  rolar();
})();
