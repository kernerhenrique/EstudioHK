/* EstudioHK · motor das demonstrações de automação (comum às 6 demos). Sem dependências.
   Cada demo tem o próprio roteiro (assets/<roteiro>.js) e usa window.Auto para:
   abas do celular, relógio simulado, etapas, conversas, aviso para leitor de tela,
   custo acumulado na Meta e a conta de custos. Nada é enviado: tudo acontece na página. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var celular = window.matchMedia('(max-width: 1023px)');
  var DIA = 'ter';

  /* espera em ms (quase nada com movimento reduzido) */
  function espera(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 40 : ms); }); }

  /* ---------- abas: no celular, um lado por vez ---------- */
  var abas = $$('.abas [role=tab]');
  function lados() { return abas.map(function (a) { return document.getElementById(a.getAttribute('aria-controls')); }); }
  function aplicaAbas() {
    var ls = lados();
    abas.forEach(function (a, i) {
      var sel = a.getAttribute('aria-selected') === 'true';
      if (celular.matches) ls[i].hidden = !sel; else ls[i].hidden = false;
    });
  }
  function mostra(id, foco) {
    abas.forEach(function (a) {
      var sel = a.id === id;
      a.setAttribute('aria-selected', sel ? 'true' : 'false');
      a.tabIndex = sel ? 0 : -1;
      if (sel) { var p = a.querySelector('.ponto'); if (p) p.hidden = true; if (foco) a.focus(); }
    });
    aplicaAbas();
  }
  abas.forEach(function (a, i) {
    a.addEventListener('click', function () { mostra(a.id); });
    a.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var n = abas[(i + (e.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length];
      mostra(n.id, true);
    });
  });
  if (celular.addEventListener) celular.addEventListener('change', aplicaAbas); else celular.addListener(aplicaAbas);
  aplicaAbas();
  /* marca com um ponto a aba que tem novidade (só no celular e se ela não estiver aberta) */
  function novidade(id) {
    var a = document.getElementById(id); if (!a || !celular.matches || a.getAttribute('aria-selected') === 'true') return;
    var p = a.querySelector('.ponto'); if (p) p.hidden = false;
  }
  function abaAtual() { var a = abas.filter(function (x) { return x.getAttribute('aria-selected') === 'true'; })[0]; return a ? a.id : null; }

  /* ---------- relógio simulado (minutos desde 0h) ---------- */
  var elRel = $('#relogio'), base = 0, agora = 0, anim = 0;
  function hhmm(m) { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function poeHora() { if (elRel) elRel.textContent = DIA + ', ' + hhmm(agora); }
  var relogio = {
    inicia: function (m, dia) { base = agora = m; if (dia) DIA = dia; poeHora(); },
    agora: function () { return agora; },
    hora: function (m) { return hhmm(m == null ? agora : m); },
    // avança o relógio; "dia" troca o dia mostrado ao final (ex.: virar de "seg" para "ter")
    avanca: function (min, dia) {
      var de = agora, ate = agora + min, box = elRel && elRel.parentNode, tok = ++anim;
      var fim = function () { if (dia) { DIA = dia; agora = ate % 1440; } poeHora(); };
      if (box) { box.classList.remove('pulo'); void box.offsetWidth; box.classList.add('pulo'); }
      if (reduce) { agora = ate; fim(); return Promise.resolve(); }
      return new Promise(function (res) {
        var t0 = performance.now(), dur = 900;
        (function f(t) {
          if (tok !== anim) return res(); // recomeçou no meio da animação
          var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          agora = Math.round(de + (ate - de) * e); poeHora();
          if (k < 1) requestAnimationFrame(f); else { fim(); res(); }
        })(t0);
      });
    },
    zera: function (dia) { anim++; agora = base; if (dia) DIA = dia; poeHora(); }
  };

  /* ---------- etapas ---------- */
  var ESTADOS = ['rodando', 'feita', 'erro', 'espera', 'aviso'];
  var textosOriginais = {};
  $$('.etapas li').forEach(function (li) { var d = $('.det', li); textosOriginais[li.dataset.e] = d ? d.textContent : ''; });
  function etapa(n, estado, det, hora) {
    var li = $('.etapas li[data-e="' + n + '"]'); if (!li) return;
    ESTADOS.forEach(function (c) { li.classList.remove(c); });
    if (estado) li.classList.add(estado);
    if (det != null) $('.det', li).textContent = det;
    if (hora !== undefined) $('time', li).textContent = hora || '';
  }
  function zeraEtapas() {
    $$('.etapas li').forEach(function (li) { etapa(li.dataset.e, null, textosOriginais[li.dataset.e], ''); });
  }

  /* ---------- aviso para leitor de tela ---------- */
  var elAnuncio = $('#anuncio');
  function anuncia(t) { if (!elAnuncio) return; elAnuncio.textContent = ''; setTimeout(function () { elAnuncio.textContent = t; }, 60); }

  /* ---------- conversas ---------- */
  // linhas: [texto, ...]; opções: { de, dela, hora, botoes: [{ texto, destaque, acao }] }
  function bolha(conversa, linhas, o) {
    o = o || {};
    var vazio = $('.vazio', conversa); if (vazio) vazio.hidden = true;
    var b = document.createElement('div'); b.className = 'bolha' + (o.dela ? ' dela' : '');
    if (o.de) { var de = document.createElement('span'); de.className = 'de'; de.textContent = o.de; b.appendChild(de); }
    linhas.forEach(function (l, i) {
      if (i) b.appendChild(document.createElement('br'));
      if (typeof l === 'string') b.appendChild(document.createTextNode(l));
      else { var s = document.createElement(l.tag || 'b'); s.textContent = l.texto; b.appendChild(s); }
    });
    if (o.hora) { var h = document.createElement('span'); h.className = 'hora'; h.textContent = o.hora; b.appendChild(h); }
    if (o.botoes) {
      var bts = document.createElement('span'); bts.className = 'bts';
      o.botoes.forEach(function (x) {
        var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'bt' + (x.destaque ? ' destaque' : ''); bt.textContent = x.texto;
        bt.addEventListener('click', function () { x.acao(bt); });
        bts.appendChild(bt);
      });
      b.appendChild(bts);
    }
    conversa.appendChild(b);
    conversa.scrollTop = conversa.scrollHeight;
    return b;
  }
  function limpaConversa(conversa) {
    $$('.bolha', conversa).forEach(function (b) { b.remove(); });
    var vazio = $('.vazio', conversa); if (vazio) vazio.hidden = false;
  }

  /* ---------- custo acumulado na Meta ---------- */
  var reais = function (v, casas) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: casas == null ? 2 : casas, maximumFractionDigits: casas == null ? 2 : casas }); };
  var elGasto = $('#gasto'), msgs = 0, PRECO = 0.035;
  function gasto(n) {
    msgs = n == null ? 0 : msgs + n;
    if (elGasto) elGasto.textContent = msgs + (msgs === 1 ? ' mensagem paga' : ' mensagens pagas') + ' · ' + reais(msgs * PRECO, 3);
  }

  /* ---------- faixas (input range) com a parte preenchida ---------- */
  function faixa(el) { el.style.setProperty('--p', (el.value - el.min) / (el.max - el.min) * 100 + '%'); }

  window.Auto = {
    reduce: reduce, $: $, $$: $$, espera: espera,
    mostra: mostra, novidade: novidade, abaAtual: abaAtual, celular: function () { return celular.matches; },
    relogio: relogio, etapa: etapa, zeraEtapas: zeraEtapas, anuncia: anuncia,
    bolha: bolha, limpaConversa: limpaConversa, gasto: gasto, reais: reais, faixa: faixa
  };
})();
