/* Peças comuns das demos de sistemas da EstudioHK: dados no navegador, telas, painéis, avisos e janela de demonstração. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var dois = function (n) { return String(n).padStart(2, '0'); };
  var iso = function (d) { return d.getFullYear() + '-' + dois(d.getMonth() + 1) + '-' + dois(d.getDate()); };
  var deIso = function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);

  var SIS = {
    $: $, $$: $$,
    dinheiro: function (n) { return moeda.format(n).replace(/ /g, ' '); },
    hoje: iso(hoje),
    dia: function (soma) { var d = new Date(hoje); d.setDate(d.getDate() + soma); return iso(d); },
    entre: function (a, b) { return Math.round((deIso(b) - deIso(a)) / 864e5); },   // dias de a até b
    curta: function (s) { var d = deIso(s); return dois(d.getDate()) + '/' + dois(d.getMonth() + 1); },
    longa: function (s) { var d = deIso(s); return DIAS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()]; },
    semana: function (s) { return DIAS[deIso(s).getDay()]; },
    esc: function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); },

    /* dados guardados só neste navegador; se o navegador bloquear, a demo funciona igual, sem guardar */
    guarda: function (chave, semente, porDia) {
      var lido = null;
      try { lido = JSON.parse(localStorage.getItem(chave)); } catch (e) { lido = null; }
      if (!lido || (porDia && lido.dia !== SIS.hoje)) { lido = semente(); lido.dia = SIS.hoje; }
      var g = {
        d: lido,
        salva: function () { try { localStorage.setItem(chave, JSON.stringify(g.d)); } catch (e) { /* sem armazenamento: segue só na memória */ } },
        recomeca: function () { try { localStorage.removeItem(chave); } catch (e) { } g.d = semente(); g.d.dia = SIS.hoje; }
      };
      return g;
    },

    /* aviso rápido, lido pelo leitor de tela */
    aviso: function (texto) {
      var caixa = $('#avisos'); if (!caixa) return;
      var el = document.createElement('div'); el.textContent = texto; caixa.appendChild(el);
      setTimeout(function () { el.remove(); }, 3200);
    },

    /* painéis e janelas: <dialog> nativo (prende o foco e fecha com Esc) */
    abre: function (dlg) { if (!dlg.open) dlg.showModal(); },
    fecha: function (dlg) { if (dlg.open) dlg.close(); },

    /* janela de demonstração: mostra a mensagem que iria pelo WhatsApp */
    demo: function (mensagem, titulo) {
      var j = $('#janela');
      $('#j-titulo', j).textContent = titulo || 'Isto é uma demonstração';
      $('#j-msg', j).textContent = mensagem;
      SIS.abre(j);
    },

    confirma: function (texto, sim) {
      var j = $('#confirma');
      $('#c-texto', j).textContent = texto;
      j.onclose = function () { if (j.returnValue === 'sim') sim(); j.returnValue = ''; };
      SIS.abre(j);
    },

    /* telas do menu lateral */
    telas: function (aoTrocar) {
      var botoes = $$('.vista[data-vista]');
      function vai(nome, foca) {
        var alvo = $('[data-tela="' + nome + '"]') ? nome : botoes[0].dataset.vista;
        botoes.forEach(function (b) { if (b.dataset.vista === alvo) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
        $$('[data-tela]').forEach(function (t) { t.hidden = t.dataset.tela !== alvo; });
        var tela = $('[data-tela="' + alvo + '"]');
        $('#titulo').textContent = tela.dataset.titulo;
        $('#subtitulo').textContent = tela.dataset.sub || '';
        $$('[data-so-em]').forEach(function (el) { el.hidden = el.dataset.soEm.split(' ').indexOf(alvo) < 0; });
        if (aoTrocar) aoTrocar(alvo);
        if (foca) { $('#titulo').focus(); scrollTo(0, 0); }
      }
      botoes.forEach(function (b) { b.addEventListener('click', function () { history.replaceState(null, '', '#' + b.dataset.vista); vai(b.dataset.vista, true); }); });
      vai(location.hash.slice(1) || botoes[0].dataset.vista, false);
      document.documentElement.classList.remove('carregando');
      return vai;
    }
  };

  /* fechar painéis: botões [data-fechar] e clique fora */
  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    $$('[data-fechar]', d).forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
  });
  window.SIS = SIS;
})();
