/* Taipa Arquitetura · demonstração da EstudioHK. Sem dependências.
   Cada cena presa calcula o próprio progresso (0 a 1) no scroll e cada desenho reage a ele. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var raiz = document.documentElement;
  var anima = raiz.classList.contains('anima');
  var temIO = 'IntersectionObserver' in window;
  var cl = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var suave = function (t) { return 1 - Math.pow(1 - t, 3); };
  var volta = function (t) { var c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  var fmt = function (v, casas) { return v.toFixed(casas).replace('.', ','); };

  /* ---------- menu ---------- */
  var btnMenu = $('.abre-menu'), gaveta = $('#gaveta');
  function menu(a) { gaveta.classList.toggle('aberta', a); btnMenu.setAttribute('aria-expanded', a ? 'true' : 'false'); btnMenu.setAttribute('aria-label', a ? 'Fechar menu' : 'Abrir menu'); }
  btnMenu.addEventListener('click', function () { menu(!gaveta.classList.contains('aberta')); });
  $$('a', gaveta).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gaveta.classList.contains('aberta')) { menu(false); btnMenu.focus(); } });

  /* ---------- cenas ---------- */
  var cenas = $$('[data-cena]').map(function (el) {
    return {
      el: el,
      itens: $$('[data-a]', el).map(function (n) {
        return { n: n, tipo: n.getAttribute('data-a'), de: +n.getAttribute('data-de'), ate: +n.getAttribute('data-ate'), max: n.hasAttribute('data-max') ? +n.getAttribute('data-max') : 1,
                 valor: +n.getAttribute('data-valor') || 0, casas: +n.getAttribute('data-casas') || 0, ult: -1 };
      }),
      etapas: $$('[data-etapa]', el).map(function (n) { var f = n.getAttribute('data-etapa').split(','); return { n: n, de: +f[0], ate: +f[1] }; }),
      p: -1
    };
  });
  var sol = $('#sol'), contador = $('#contador-sala b');

  function aplica(it, p) {
    var q = cl((p - it.de) / (it.ate - it.de));
    if (q === it.ult) return;
    it.ult = q;
    var s = it.n.style, e = suave(q);
    switch (it.tipo) {
      case 'traco': s.strokeDashoffset = 1 - e; break;
      case 'surge': s.opacity = e * it.max; s.transform = 'translateY(' + ((1 - e) * 8) + 'px)'; break;
      case 'acende': s.opacity = e * it.max; break;
      case 'escala': s.opacity = Math.min(1, q * 3); s.transform = 'scale(' + volta(q) + ')'; break;
      case 'cresce': s.opacity = q > 0 ? 1 : 0; s.transform = 'scaleY(' + e + ')'; break;
      case 'larga': s.opacity = q > 0 ? 1 : 0; s.transform = 'scaleX(' + e + ')'; break;
      case 'cai': s.opacity = Math.min(1, q * 2.5); s.transform = 'translateY(' + ((1 - volta(q)) * -70) + 'px)'; break;
      case 'gira': s.opacity = Math.min(1, q * 2.5); s.transform = 'rotate(' + ((1 - volta(q)) * -14) + 'deg)'; break;
      case 'zona': s.opacity = e * (1 - .72 * cl((p - .36) / .14)); break;
      case 'zonatxt': s.opacity = e * (1 - cl((p - .3) / .08)); break;
      case 'croqui': s.opacity = .55 * (1 - cl((p - it.de) / (it.ate - it.de))); break;
      case 'conta': it.n.textContent = fmt(it.valor * e, it.casas); break;
    }
  }

  function desenha(c, p) {
    if (p === c.p) return;
    c.p = p;
    c.el.style.setProperty('--p', p);
    for (var i = 0; i < c.itens.length; i++) aplica(c.itens[i], p);
    c.etapas.forEach(function (e) {
      var at = p >= e.de && p < e.ate, feita = p >= e.ate;
      e.n.classList.toggle('ativa', at); e.n.classList.toggle('feita', feita && !at);
    });
    if (c.el.id === 'capa' && sol) {
      // o sol atravessa o céu enquanto a casa sobe e se põe antes da noite
      var t = cl(p / .86), x = 120 + t * 520, y = 150 - Math.sin(t * Math.PI) * 100 + Math.max(0, (p - .8) * 900);
      sol.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      sol.style.opacity = 1 - cl((p - .84) / .06);
    }
    if (c.el.id === 'interiores' && contador) {
      contador.textContent = c.etapas.filter(function (e) { return p >= e.de; }).length;
    }
  }

  function progresso(el) {
    var r = el.getBoundingClientRect(), total = el.offsetHeight - (innerHeight - topo());
    return total <= 0 ? 1 : cl((topo() - r.top) / total);
  }
  function topo() { var h = $('.topo'); return h ? h.offsetHeight : 0; }

  /* ---------- galeria horizontal ---------- */
  var gal = $('[data-galeria]'), trilho = $('#trilho'), projs = $$('.proj', gal);
  function medeGaleria() {
    if (!anima) return;
    var extra = Math.max(0, trilho.scrollWidth - innerWidth);
    gal.style.setProperty('--gh', (extra + innerHeight) + 'px');
    gal._extra = extra;
  }
  function moveGaleria() {
    var r = gal.getBoundingClientRect(), total = gal.offsetHeight - (innerHeight - topo());
    var p = total <= 0 ? 0 : cl((topo() - r.top) / total);
    trilho.style.transform = 'translateX(' + (-p * (gal._extra || 0)) + 'px)';
    projs.forEach(function (pj) {
      var b = pj.getBoundingClientRect(), q = cl((innerWidth - b.left) / (innerWidth * .55));
      var e = suave(q);
      pj.style.setProperty('--c', (1 - e).toFixed(3));
      pj.style.setProperty('--z', (1.12 - .12 * e).toFixed(3));
    });
  }

  /* ---------- menu ativo ---------- */
  var secoes = $$('main section[id]'), links = $$('.menu a');
  function marcaMenu() {
    var at = null;
    secoes.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * .4) at = s.id; });
    links.forEach(function (a) { if (a.getAttribute('href') === '#' + at) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }

  /* ---------- laço de quadros ---------- */
  var pedido = false;
  function quadro() {
    pedido = false;
    cenas.forEach(function (c) {
      var r = c.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) {
        // fora da tela: deixa no estado coerente (antes = vazio, depois = pronto)
        var alvo = r.top > 0 ? 0 : 1;
        if (c.p !== alvo) desenha(c, alvo);
        return;
      }
      desenha(c, progresso(c.el));
    });
    if (anima && gal) moveGaleria();
    marcaMenu();
  }
  function agenda() { if (!pedido) { pedido = true; requestAnimationFrame(quadro); } }
  if (anima) {
    medeGaleria();
    addEventListener('scroll', agenda, { passive: true });
    addEventListener('resize', function () { medeGaleria(); agenda(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { medeGaleria(); agenda(); });
    quadro();
  } else {
    addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(function () { pedido = false; marcaMenu(); }); } }, { passive: true });
  }

  /* ---------- cômodos da planta ---------- */
  var dica = $('#dica-comodo'), caixaPlanta = $('.proc-des');
  $$('.planta .comodo').forEach(function (r) {
    function mostra(ev) {
      $$('.planta .comodo.marcado').forEach(function (x) { x.classList.remove('marcado'); });
      r.classList.add('marcado');
      dica.textContent = r.getAttribute('data-nome') + ' · ' + r.getAttribute('data-area') + ' m²';
      var b = caixaPlanta.getBoundingClientRect(), rb = r.getBoundingClientRect();
      var x = ev && ev.clientX ? ev.clientX : rb.left + rb.width / 2, y = ev && ev.clientY ? ev.clientY : rb.top + rb.height / 2;
      dica.style.left = (x - b.left) + 'px'; dica.style.top = (y - b.top) + 'px';
      dica.classList.add('visivel');
    }
    r.addEventListener('pointerenter', mostra);
    r.addEventListener('pointermove', mostra);
    r.addEventListener('click', mostra);
    r.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') { r.classList.remove('marcado'); dica.classList.remove('visivel'); } });
  });

  /* ---------- antes e depois ---------- */
  var comp = $('#comparador'), range = $('#comp-range');
  if (comp && range) {
    var poe = function () { comp.style.setProperty('--x', range.value + '%'); range.setAttribute('aria-valuetext', range.value + '% mostrando a planta reformada'); };
    range.addEventListener('input', poe); poe();
  }

  /* ---------- janela de demonstração ---------- */
  var janela = $('#janela'), quem = null;
  function abrir(t) { quem = document.activeElement; $('#j-texto').textContent = t; janela.hidden = false; document.body.style.overflow = 'hidden'; $('#j-titulo').focus(); }
  function fechar() { janela.hidden = true; document.body.style.overflow = ''; if (quem) quem.focus(); }
  $$('[data-demo]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); abrir(b.getAttribute('data-demo')); }); });
  $('#j-fechar').addEventListener('click', fechar);
  janela.addEventListener('click', function (e) { if (e.target === janela) fechar(); });
  document.addEventListener('keydown', function (e) {
    if (janela.hidden) return;
    if (e.key === 'Escape') fechar();
    if (e.key === 'Tab') { var f = $$('a, button', janela), p = f[0], u = f[f.length - 1]; if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); } else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); } }
  });

  /* ---------- formulário ---------- */
  var form = $('#form-arq'), nome = $('#f-nome'), cidade = $('#f-cidade'), btn = $('#f-enviar'), saida = $('#f-saida');
  function marcado(n) { var i = $('input[name=' + n + ']:checked', form); return i ? i.value : ''; }
  function pronto() { return marcado('tipo') && marcado('terreno') && cidade.value.trim().length > 1 && nome.value.trim().length > 1; }
  function atualiza() { btn.disabled = !pronto(); saida.hidden = true; }
  form.addEventListener('input', atualiza); form.addEventListener('change', atualiza);
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (!pronto()) return;
    $('#f-msg').textContent = 'Olá, Laís! Meu nome é ' + nome.value.trim() + ' e quero conversar sobre ' + marcado('tipo') + ' em ' + cidade.value.trim() + '.\nJá tenho o terreno ou o imóvel: ' + marcado('terreno') + '.';
    saida.hidden = false; $('#f-saida-t').focus();
  });

  /* ---------- barra do celular ---------- */
  var barra = $('#barra-m');
  if (temIO) {
    var vis = { capa: true, contato: false };
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.id] = e.isIntersecting; });
      var m = !vis.capa && !vis.contato; barra.classList.toggle('visivel', m); barra.setAttribute('aria-hidden', m ? 'false' : 'true'); $('a', barra).tabIndex = m ? 0 : -1;
    }, { rootMargin: '0px 0px -40% 0px' });
    bio.observe($('#capa')); bio.observe($('#contato'));
  }
})();
