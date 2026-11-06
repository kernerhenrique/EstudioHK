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
 *   [data-palavras]   título que entra palavra por palavra entre data-de e data-ate (dentro de uma cena ou passagem)
 *   [data-empilha]    seções filhas que sobem por cima da anterior (a de baixo escurece e encolhe um pouco)
 *   [data-entrada]    entra ao abrir a página, com desfoque de movimento (só CSS; atraso em style="--d:200ms")
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
    conta:  function (s, q, e, it) { it.n.textContent = fmt(it.valor * e, it.casas); },
    escorre:function (s, q, e) { s.opacity = q > 0 ? 1 : 0; s.transform = 'scaleY(' + e + ')'; },   // de cima para baixo (líquido, fio)
    enche:  function (s, q, e) { s.clipPath = 'inset(' + ((1 - e) * 100) + '% 0 0 0)'; },            // enche de baixo para cima (copo, barra)
    barra:  function (s, q, e) { s.transform = 'scaleX(' + e + ')'; },                                 // barra que cresce da esquerda (largura final no CSS)
    foco:   function (s, q, e) { s.opacity = e; s.transform = 'translateY(' + ((1 - e) * .4) + 'em) rotateX(' + ((1 - e) * -70) + 'deg)'; s.filter = e < 1 ? 'blur(' + ((1 - e) * 6).toFixed(2) + 'px)' : ''; },
    // movimento livre: vai de (data-x, data-y, data-r, data-s, data-o) até (data-x2, data-y2, data-r2, data-s2, data-o2)
    move:   function (s, q, e, it) {
      var t = it.m.linear ? q : e, v = function (k) { return it.m[k][0] + (it.m[k + '2'][0] - it.m[k][0]) * t; };
      s.transform = 'translate(' + v('x').toFixed(2) + it.m.x[1] + ',' + v('y').toFixed(2) + it.m.y[1] + ') rotate(' + v('r').toFixed(2) + 'deg) scale(' + v('s').toFixed(4) + ')';
      s.opacity = v('o').toFixed(3);
    }
  };
  // "zona": aparece e depois esmaece (ex.: manchas de zoneamento antes das paredes). data-some="0.4"
  TIPOS.zona = function (s, q, e, it, p) { s.opacity = e * it.max * (1 - .8 * cl((p - it.some) / .12)); };

  // lê "12" ou "-40%" → [12, 'px'] ou [-40, '%']
  function num(n, nome, padrao) { var v = n.getAttribute(nome); if (v === null) return null; return [parseFloat(v) || 0, /%$/.test(v.trim()) ? '%' : 'px']; }
  function leMove(n) {
    var m = { linear: n.hasAttribute('data-linear') }, padrao = { x: 0, y: 0, r: 0, s: 1, o: 1 };
    Object.keys(padrao).forEach(function (k) {
      var a = num(n, 'data-' + k), b = num(n, 'data-' + k + '2');
      var u = (a && a[1] === '%') || (b && b[1] === '%') ? '%' : 'px';
      m[k] = [a ? a[0] : padrao[k], u]; m[k + '2'] = [b ? b[0] : padrao[k], u];
    });
    return m;
  }

  // [data-palavras]: quebra o texto em palavras (mantém <em>, <strong>…) e distribui a entrada entre data-de e data-ate
  function quebraPalavras(el) {
    var de = +el.getAttribute('data-de') || 0, ate = el.hasAttribute('data-ate') ? +el.getAttribute('data-ate') : 1, spans = [];
    (function anda(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (pd) {
            if (!pd) return;
            if (/^\s+$/.test(pd)) { frag.appendChild(document.createTextNode(pd)); return; }
            var sp = document.createElement('span'); sp.className = 'kit-palavra'; sp.textContent = pd; frag.appendChild(sp); spans.push(sp);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1) anda(c);
      });
    })(el);
    var n = spans.length, passo = (ate - de) / Math.max(n, 1), dur = Math.min(passo * 2.5, ate - de);
    spans.forEach(function (sp, i) {
      var d0 = de + passo * i;
      sp.setAttribute('data-a', 'foco'); sp.setAttribute('data-de', d0.toFixed(4)); sp.setAttribute('data-ate', Math.min(ate, d0 + dur).toFixed(4));
    });
  }
  if (anima) $$('[data-palavras]').forEach(quebraPalavras);

  function prepara(bloco) {
    return {
      el: bloco,
      itens: $$('[data-a]', bloco).map(function (n) {
        return { n: n, tipo: n.getAttribute('data-a'), de: +n.getAttribute('data-de') || 0, ate: n.hasAttribute('data-ate') ? +n.getAttribute('data-ate') : 1,
                 max: n.hasAttribute('data-max') ? +n.getAttribute('data-max') : 1, valor: +n.getAttribute('data-valor') || 0,
                 casas: +n.getAttribute('data-casas') || 0, some: n.hasAttribute('data-some') ? +n.getAttribute('data-some') : 2, ult: -1,
                 m: n.getAttribute('data-a') === 'move' ? leMove(n) : null };
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

  // progresso a partir de medidas já lidas (r = retângulo do bloco, h = altura, t = altura do cabeçalho fixo)
  function progresso(c, r, h, t) {
    if (c.preso) { var total = h - (innerHeight - t); return total <= 0 ? 1 : cl((t - r.top) / total); }
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

  /* ---------- seções empilhadas: a próxima sobe por cima ---------- */
  var pilhas = $$('[data-empilha]').map(function (pl) { return Array.prototype.slice.call(pl.children); });
  function medePilhas(t) {
    var alt = innerHeight - t, res = [];
    pilhas.forEach(function (filhos) {
      for (var i = 0; i < filhos.length - 1; i++) res.push([filhos[i], cl(1 - (filhos[i + 1].getBoundingClientRect().top - t) / alt)]);
    });
    return res;
  }

  /* ---------- laço ---------- */
  var pedido = false;
  function quadro() {
    pedido = false;
    // 1) só leituras
    var t = topo();
    var med = blocos.map(function (c) { return { r: c.el.getBoundingClientRect(), h: c.preso ? c.el.offsetHeight : 0 }; });
    var pil = medePilhas(t);
    // 2) só escritas
    blocos.forEach(function (c, i) {
      var r = med[i].r;
      if (r.bottom < -200 || r.top > innerHeight + 200) { var alvo = r.top > 0 ? 0 : 1; if (c.p !== alvo) desenha(c, alvo); return; }
      desenha(c, progresso(c, r, med[i].h, t));
    });
    pil.forEach(function (x) { var v = x[1].toFixed(3); if (x[0]._cobre !== v) { x[0]._cobre = v; x[0].style.setProperty('--kit-cobre', v); } });
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
