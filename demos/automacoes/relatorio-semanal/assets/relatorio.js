/* Roteiro da demo "Relatório da semana" (FORJA Academia, fictícia). Usa window.Auto (../assets/auto.js).
   Segunda, 8h: lê os dados da semana → confere → calcula e compara → manda o resumo no WhatsApp,
   o relatório completo por e-mail e guarda uma linha no histórico. Sem IA: números do sistema e regras fixas.
   "Simular dado faltando": os check-ins de domingo não chegam; o relatório marca "sem dados", não inventa,
   e a EstudioHK é avisada. Nada é enviado. */
(function () {
  'use strict';
  var A = window.Auto; if (!A) return;
  var $ = A.$, $$ = A.$$;
  A.relogio.inicia(7 * 60 + 59, 'seg');

  var D = {
    semana: '27/10 a 02/11', curta: '27/10–02/11',
    ativos: 2412, ativosAnt: 2398, novos: 38, novosAnt: 31, cancel: 24, cancelAnt: 22, checkinsAnt: 10120,
    dias: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    diasLongos: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'],
    checkins: [1920, 1780, 1840, 1690, 1410, 730, 500],
    aulas: [['Bike indoor 19h', 97], ['Funcional 7h', 94], ['Boxe 20h', 91], ['HIIT 18h', 78], ['Yoga 20h30', 41]],
    atrasados: 31, atrasadosValor: 'R$ 4.026,90', sumidos: 187, aulasSemana: 142
  };
  var n = function (x) { return x.toLocaleString('pt-BR'); };
  var delta = function (a, b) { var d = a - b; return (d > 0 ? '▲ ' : d < 0 ? '▼ ' : '') + n(Math.abs(d)); };
  var pct = function (a, b) { var p = (a - b) / b * 100; return (p > 0 ? '▲ ' : '▼ ') + Math.abs(p).toFixed(1).replace('.', ',') + '%'; };

  var corpo = $('#er-corpo'), vazio = $('#er-vazio'), conv = $('#conv-dono'), hist = $('#hist-linhas');
  var zEspera = $('#z-espera'), zHoje = $('#z-hoje'), cRodar = $('#c-rodar'), zRodar = $('#z-rodar'), cRecomecar = $('#c-recomecar'), cFalha = $('#c-falha');
  var alerta = $('#alerta-hk'), alertaTxt = $('#alerta-txt'), custo = $('#custo');
  var S = { id: 0, fase: 'pronto' };

  function fonte(f, txt, falta) { var li = $('#fontes-lista li[data-f="' + f + '"]'); $('b', li).textContent = txt; li.classList.toggle('falta', !!falta); }
  function zeraFontes() { $$('#fontes-lista li').forEach(function (li) { $('b', li).textContent = '·'; li.classList.remove('falta'); }); }
  function vivo(id) { return S.id === id; }
  function h() { return A.relogio.hora(); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  /* ---------- relatório por e-mail ---------- */
  function relatorio(falta) {
    var ck = D.checkins.slice(); if (falta) ck[6] = null;
    var total = ck.reduce(function (s, v) { return s + (v || 0); }, 0);
    corpo.textContent = '';
    var cab = el('p', 'er-cab anima-in'); cab.innerHTML = '<b>Para:</b> dono@forja (fictício) · <b>Assunto:</b> FORJA · semana de ' + D.semana; corpo.appendChild(cab);
    if (falta) corpo.appendChild(el('p', 'er-aviso anima-in', 'Atenção: os check-ins de domingo (02/11) não chegaram do sistema. O domingo aparece como "sem dados" e o total de check-ins não é comparado com a semana passada.'));

    var k = el('div', 'er-kpis anima-in');
    [['Alunos ativos', n(D.ativos), delta(D.ativos, D.ativosAnt) + ' na semana'],
     ['Novas matrículas', n(D.novos), delta(D.novos, D.novosAnt) + ' vs semana passada'],
     ['Cancelamentos', n(D.cancel), delta(D.cancel, D.cancelAnt) + ' vs semana passada'],
     ['Check-ins', n(total), falta ? 'sem domingo' : pct(total, D.checkinsAnt) + ' vs semana passada']
    ].forEach(function (x) { var d = el('div', 'er-kpi'); d.appendChild(el('span', null, x[0])); d.appendChild(el('b', null, x[1])); d.appendChild(el('small', null, x[2])); k.appendChild(d); });
    corpo.appendChild(k);

    // check-ins por dia: uma série, rótulo só no maior e no menor; dica no mouse/foco; tabela
    var g1 = el('div', 'er-graf anima-in'); g1.appendChild(el('h4')).innerHTML = 'Check-ins por dia <small>catraca</small>';
    var max = Math.max.apply(null, ck.filter(Boolean)), validos = ck.filter(function (v) { return v != null; }), min = Math.min.apply(null, validos);
    var cols = el('div', 'colunas'); cols.setAttribute('role', 'group'); cols.setAttribute('aria-label', 'Check-ins por dia da semana');
    ck.forEach(function (v, i) {
      var c = el('span', 'col dica-alvo' + (v == null ? ' sem' : '')); c.tabIndex = 0;
      var txt = D.diasLongos[i] + ': ' + (v == null ? 'sem dados' : n(v) + ' check-ins');
      c.setAttribute('data-dica', txt); c.setAttribute('aria-label', txt);
      c.style.setProperty('--h', v == null ? '30%' : (v / max * 100) + '%');
      c.appendChild(el('i'));
      if (v == null) c.appendChild(el('span', 'rot', 'sem dados'));
      else if (v === max || v === min) c.appendChild(el('span', 'rot', n(v)));
      cols.appendChild(c);
    });
    g1.appendChild(cols);
    var x = el('div', 'colunas-x'); x.setAttribute('aria-hidden', 'true'); D.dias.forEach(function (d) { x.appendChild(el('span', null, d)); }); g1.appendChild(x);
    g1.appendChild(tabela('Ver em tabela', ['Dia', 'Check-ins'], D.dias.map(function (d, i) { return [d, ck[i] == null ? 'sem dados' : n(ck[i])]; })));
    corpo.appendChild(g1);

    // ocupação das aulas
    var g2 = el('div', 'er-graf anima-in'); g2.appendChild(el('h4')).innerHTML = 'Ocupação média das aulas <small>reservas ÷ vagas</small>';
    var br = el('div', 'barras'); br.setAttribute('role', 'group'); br.setAttribute('aria-label', 'Ocupação média das aulas');
    var vmax = D.aulas[0][1], vmin = D.aulas[D.aulas.length - 1][1];
    D.aulas.forEach(function (a) {
      var l = el('span', 'barra-l dica-alvo'); l.tabIndex = 0; l.setAttribute('data-dica', a[0] + ': ' + a[1] + '% das vagas'); l.setAttribute('aria-label', a[0] + ': ' + a[1] + '% das vagas');
      l.appendChild(el('span', null, a[0]));
      var t = el('span', 'trilho'), i = el('i'); i.style.setProperty('--w', a[1] + '%'); t.appendChild(i); l.appendChild(t);
      l.appendChild(el('span', 'v', a[1] === vmax || a[1] === vmin ? a[1] + '%' : ''));
      br.appendChild(l);
    });
    g2.appendChild(br);
    g2.appendChild(tabela('Ver em tabela', ['Aula', 'Ocupação'], D.aulas.map(function (a) { return [a[0], a[1] + '%']; })));
    corpo.appendChild(g2);

    var dest = el('div', 'er-graf anima-in'); dest.appendChild(el('h4', null, 'Destaques da semana'));
    var ul = el('ul', 'er-dest');
    ['Bike indoor 19h acima de 90% pela 3ª semana seguida: vale pensar em mais uma turma.',
     'Yoga 20h30 com 41%: a menor ocupação da semana.',
     'Cancelamentos por preço: 6 (eram 3 na semana passada).'].forEach(function (t) { ul.appendChild(el('li', null, t)); });
    dest.appendChild(ul); corpo.appendChild(dest);

    var li = el('div', 'er-listas anima-in');
    li.innerHTML = '<span>Mensalidades em atraso: <b>' + D.atrasados + ' alunos · ' + D.atrasadosValor + '</b> (lista em anexo)</span><span>Sem treinar há 14 dias ou mais: <b>' + D.sumidos + ' alunos</b> (lista em anexo, para a recepção)</span>';
    corpo.appendChild(li);
    return total;
  }
  function tabela(rotulo, cab, linhas) {
    var d = el('details'), s = el('summary', null, rotulo), t = el('table'), th = el('tr');
    cab.forEach(function (c) { var e = el('th', null, c); e.scope = 'col'; th.appendChild(e); });
    var thead = el('thead'); thead.appendChild(th); t.appendChild(thead);
    var tb = el('tbody'); linhas.forEach(function (l) { var tr = el('tr'); l.forEach(function (c) { tr.appendChild(el('td', null, c)); }); tb.appendChild(tr); }); t.appendChild(tb);
    d.appendChild(s); d.appendChild(t); return d;
  }

  /* ---------- rodar ---------- */
  function roda() {
    if (S.fase !== 'pronto') return;
    var id = ++S.id, falta = cFalha.checked; S.fase = 'rodando';
    cRodar.disabled = true; zRodar.disabled = true; cFalha.disabled = true;
    A.novidade('aba-bas');
    A.relogio.avanca(1).then(function () {
      if (!vivo(id)) return;
      A.etapa(1, 'feita', 'Segunda, 8h: começou sozinho.', h());
      A.etapa(2, 'rodando', null, h());
      return A.espera(500);
    }).then(function () {
      if (!vivo(id)) return;
      fonte('alunos', n(D.ativos) + ' ativos'); return A.espera(350);
    }).then(function () {
      if (!vivo(id)) return;
      fonte('checkins', falta ? 'domingo: não chegou' : n(9870) + ' registros', falta); return A.espera(350);
    }).then(function () {
      if (!vivo(id)) return;
      fonte('aulas', D.aulasSemana + ' aulas'); return A.espera(350);
    }).then(function () {
      if (!vivo(id)) return;
      fonte('pagamentos', n(D.ativos - D.atrasados) + ' em dia · ' + D.atrasados + ' em atraso');
      A.etapa(2, 'feita', 'Leu alunos, check-ins, aulas e pagamentos da semana de ' + D.semana + '.', h());
      A.etapa(3, 'rodando', null, h());
      return A.espera(700);
    }).then(function () {
      if (!vivo(id)) return;
      if (falta) {
        A.etapa(3, 'aviso', 'Faltam os check-ins de domingo (02/11). O relatório sai com o domingo marcado como "sem dados", sem inventar número, e a EstudioHK foi avisada.', h());
        alertaTxt.textContent = 'Relatório da FORJA de ' + D.semana + ': os check-ins de domingo não chegaram do sistema. Conferir a integração da catraca.';
        alerta.hidden = false;
      } else A.etapa(3, 'feita', 'Todos os 7 dias chegaram e nenhum número saiu do normal.', h());
      A.etapa(4, 'rodando', null, h());
      return A.espera(700);
    }).then(function () {
      if (!vivo(id)) return;
      vazio.hidden = true;
      S.total = relatorio(falta);
      A.etapa(4, 'feita', 'Calculou totais, variação, ocupação das aulas, atrasos e quem sumiu. Destaques por regras fixas, sem IA.', h());
      A.etapa(5, 'rodando', null, h());
      return A.espera(600);
    }).then(function () {
      if (!vivo(id)) return;
      zEspera.hidden = true; zHoje.hidden = false;
      A.bolha(conv, [
        { texto: 'Resumo da semana · ' + D.semana },
        'Alunos ativos: ' + n(D.ativos) + ' (' + delta(D.ativos, D.ativosAnt) + ')',
        'Novos: ' + D.novos + ' · Cancelamentos: ' + D.cancel,
        'Check-ins: ' + n(S.total) + (falta ? ' (sem domingo: o dado não chegou)' : ' (' + pct(S.total, D.checkinsAnt) + ')'),
        'Aulas mais cheias: Bike 19h (97%), Funcional 7h (94%)',
        'Em atraso: ' + D.atrasados + ' alunos',
        'Relatório completo no seu e-mail.'
      ], { de: 'Automação FORJA', hora: '08:00' });
      A.novidade('aba-cli');
      var tr = el('tr', 'nova'); [D.curta, n(D.ativos), n(S.total) + (falta ? '*' : ''), String(D.cancel)].forEach(function (c) { tr.appendChild(el('td', null, c)); }); hist.appendChild(tr);
      custo.textContent = 'Meta R$ 0,035 (1 resumo) · e-mail grátis · sem IA';
      A.etapa(5, 'feita', 'Resumo no WhatsApp do dono, relatório completo no e-mail e uma linha nova no histórico.', '08:00');
      S.fase = 'fim';
      A.anuncia('Relatório da semana enviado: resumo no WhatsApp e relatório completo no e-mail.');
    });
  }
  cRodar.addEventListener('click', roda); zRodar.addEventListener('click', roda);

  cRecomecar.addEventListener('click', function () {
    S = { id: S.id + 1, fase: 'pronto' };
    corpo.textContent = ''; corpo.appendChild(vazio); vazio.hidden = false;
    $$('.bolha', conv).slice(1).forEach(function (b) { b.remove(); });
    zEspera.hidden = false; zHoje.hidden = true;
    $$('tr.nova', hist).forEach(function (tr) { tr.remove(); });
    zeraFontes(); alerta.hidden = true;
    A.zeraEtapas(); A.relogio.zera('seg');
    custo.textContent = 'Meta R$ 0,000 · e-mail grátis · sem IA';
    cRodar.disabled = false; zRodar.disabled = false; cFalha.disabled = false;
    A.mostra('aba-cli');
    A.anuncia('Simulação recomeçada.');
  });

  /* ---------- conta ---------- */
  var kp = $('#k-pessoas');
  if (kp) {
    var conta = function () {
      var p = +kp.value, v = p * 4.3 * 0.035;
      $('#k-o-pessoas').textContent = p;
      $('#k-total').textContent = A.reais(v);
      $('#k-detalhe').textContent = p ? p + (p > 1 ? ' pessoas' : ' pessoa') + ' × 4,3 semanas × R$ 0,035 por mês' : 'Só por e-mail: nenhum custo de terceiros';
      A.faixa(kp);
    };
    kp.addEventListener('input', conta); conta();
  }
})();
