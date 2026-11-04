/* Kit de animações EstudioHK · cena.js (sem dependências)
 * Manual completo: kit/LEIAME.md
 *
 * Coloque no <head>, antes deste arquivo:
 *   <script>document.documentElement.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('anima');</script>
 * Sem a classe "anima" (sem JS ou com movimento reduzido), nada é escondido: tudo aparece pronto.
 *
 * Blocos que este arquivo entende:
 *   [data-cena]       seção presa ao scroll; o progresso (0 a 1) vai para --p. Altura em telas: style="--h:300".
 *   [data-passagem]   bloco normal (não preso); o progresso vai de 0 (entrando por baixo) a 1 (chegando no alto da tela).
 *   [data-a]          peça animada dentro de uma cena ou passagem: data-a="tipo" data-de="0.2" data-ate="0.4" [data-max="0.8"]
 *   [data-etapa]      item de lista que fica .ativa entre "de,ate" e .feita depois: data-etapa=".2,.4"
 *   [data-contador]   recebe quantas etapas da cena já começaram
 *   [data-galeria]    galeria horizontal presa; filhos em [data-trilho]; cada [data-card] abre com máscara
 *   [data-comparador] antes e depois; precisa de um <input type="range"> dentro
 * Para efeitos sob medida: escute o evento "cena:progresso" no bloco (detail.p de 0 a 1).
 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var raiz = document.documentElement;
  var anima = raiz.classList.contains('anima');
  var cl = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var suave = function (t) { return 1 - Math.pow(1 - t, 3); };
  var volta = function (t) { var c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  var fmt = function (v, casas) { return v.toFixed(casas).replace('.', ','); };
  var topo = function () { var h = $('[data-topo-fixo]') || $('header'); return h && getComputedStyle(h).position === 'sticky' || h && getComputedStyle(h).position === 'fixed' ? h.offsetHeight : 0; };

  /* ---------- tipos de animação ---------- */
  var TIPOS = {
    traco:  function (s, q, e) { s.strokeDashoffset = 1 - e; },                       // linha se desenha (precisa de pathLength="1")
    surge:  function (s, q, e, it) { s.opacity = e * it.max; s.transform = 'translateY(' + ((1 - e) * 8) + 'px)'; },
    acende: function (s, q, e, it) { s.opacity = e * it.max; },                      // luz, noite, brilho
    escala: function (s, q) { s.opacity = Math.min(1, q * 3); s.transform = 'scale(' + volta(q) + ')'; },
    cresce: function (s, q, e) { s.opacity = q > 0 ? 1 : 0; s.transform = 'scaleY(' + e + ')'; },   // de baixo para cima
    larga:  function (s, q, e) { s.opacity = q > 0 ? 1 : 0; s.transform = 'scaleX(' + e + ')'; },   // do centro para os lados
    cai:    function (s, q) { s.opacity = Math.min(1, q * 2.5); s.transform = 'translateY(' + ((1 - volta(q)) * -70) + 'px)'; },
    gira:   function (s, q) { s.opacity = Math.min(1, q * 2.5); s.transform = 'rotate(' + ((1 - volta(q)) * -14) + 'deg)'; },
    croqui: function (s, q, e, it) { s.opacity = it.max * (1 - q); },               // esboço que some enquanto o real aparece
    revela: function (s, q, e) { s.clipPath = 'inset(0 ' + ((1 - e) * 50) + '% 0 ' + ((1 - e) * 50) + '%)'; },
    cortina:function (s, q, e, it) { s.clipPath = 'inset(0 ' + ((1 - e) * 100) + '% 0 0)'; it.n.parentNode.style.setProperty('--cortina', (e * 100) + '%'); },
    conta:  function (s, q, e, it) { it.n.textContent = fmt(it.valor * e, it.casas); }
  };
  // "zona": aparece e depois esmaece (ex.: manchas de zoneamento antes das paredes). data-some="0.4"
  TIPOS.zona = function (s, q, e, it, p) { s.opacity = e * it.max * (1 - .8 * cl((p - it.some) / .12)); };

  function prepara(bloco) {
    return {
      el: bloco,
      itens: $$('[data-a]', bloco).map(function (n) {
        return { n: n, tipo: n.getAttribute('data-a'), de: +n.getAttribute('data-de') || 0, ate: n.hasAttribute('data-ate') ? +n.getAttribute('data-ate') : 1,
                 max: n.hasAttribute('data-max') ? +n.getAttribute('data-max') : 1, valor: +n.getAttribute('data-valor') || 0,
                 casas: +n.getAttribute('data-casas') || 0, some: n.hasAttribute('data-some') ? +n.getAttribute('data-some') : 2, ult: -1 };
      }),
      etapas: $$('[data-etapa]', bloco).map(function (n) { var f = n.getAttribute('data-etapa').split(','); return { n: n, de: +f[0], ate: +f[1] }; }),
      contador: $('[data-contador]', bloco),
      preso: bloco.hasAttribute('data-cena'),
      p: -1
    };
  }

  function desenha(c, p) {
    if (p === c.p) return;
    c.p = p;
    c.el.style.setProperty('--p', p.toFixed(4));
    for (var i = 0; i < c.itens.length; i++) {
      var it = c.itens[i], q = cl((p - it.de) / ((it.ate - it.de) || 1));
      if (q === it.ult && it.tipo !== 'zona') continue;
      it.ult = q;
      var f = TIPOS[it.tipo];
      if (f) f(it.n.style, q, suave(q), it, p);
    }
    c.etapas.forEach(function (e) {
      var at = p >= e.de && p < e.ate;
      e.n.classList.toggle('ativa', at); e.n.classList.toggle('feita', p >= e.ate && !at);
    });
    if (c.contador) c.contador.textContent = c.etapas.filter(function (e) { return p >= e.de; }).length;
    c.el.dispatchEvent(new CustomEvent('cena:progresso', { detail: { p: p } }));
  }

  function progresso(c) {
    var r = c.el.getBoundingClientRect(), t = topo();
    if (c.preso) { var total = c.el.offsetHeight - (innerHeight - t); return total <= 0 ? 1 : cl((t - r.top) / total); }
    return cl((innerHeight * .9 - r.top) / (innerHeight * .9 - t - innerHeight * .05));   // passagem: entra por baixo até chegar no alto
  }

  var blocos = $$('[data-cena], [data-passagem]').map(prepara);

  /* ---------- galeria horizontal presa ---------- */
  var galerias = $$('[data-galeria]').map(function (g) { return { el: g, trilho: $('[data-trilho]', g), cards: $$('[data-card]', g), extra: 0 }; });
  function medeGalerias() {
    galerias.forEach(function (g) { g.extra = Math.max(0, g.trilho.scrollWidth - innerWidth); g.el.style.setProperty('--gh', (g.extra + innerHeight) + 'px'); });
  }
  function moveGalerias() {
    galerias.forEach(function (g) {
      var r = g.el.getBoundingClientRect(), t = topo(), total = g.el.offsetHeight - (innerHeight - t), p = total <= 0 ? 0 : cl((t - r.top) / total);
      g.trilho.style.transform = 'translateX(' + (-p * g.extra) + 'px)';
      g.cards.forEach(function (cd) {
        var b = cd.getBoundingClientRect(), e = suave(cl((innerWidth - b.left) / (innerWidth * .55)));
        cd.style.setProperty('--c', (1 - e).toFixed(3)); cd.style.setProperty('--z', (1.12 - .12 * e).toFixed(3));
      });
    });
  }

  /* ---------- laço ---------- */
  var pedido = false;
  function quadro() {
    pedido = false;
    blocos.forEach(function (c) {
      var r = c.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) { var alvo = r.top > 0 ? 0 : 1; if (c.p !== alvo) desenha(c, alvo); return; }
      desenha(c, progresso(c));
    });
    moveGalerias();
  }
  function agenda() { if (!pedido) { pedido = true; requestAnimationFrame(quadro); } }
  if (anima) {
    medeGalerias();
    addEventListener('scroll', agenda, { passive: true });
    addEventListener('resize', function () { medeGalerias(); agenda(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { medeGalerias(); agenda(); });
    addEventListener('load', function () { medeGalerias(); agenda(); });
    quadro();
  }

  /* ---------- antes e depois ---------- */
  $$('[data-comparador]').forEach(function (comp) {
    var range = $('input[type=range]', comp);
    if (!range) return;
    var rot = comp.getAttribute('data-rotulo') || 'mostrando o depois';
    var poe = function () { comp.style.setProperty('--x', range.value + '%'); range.setAttribute('aria-valuetext', range.value + '% ' + rot); };
    range.addEventListener('input', poe); poe();
  });

  window.Cena = { tipos: TIPOS, atualiza: function () { medeGalerias(); quadro(); } };
})();
