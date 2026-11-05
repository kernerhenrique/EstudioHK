/* Roteiro da demo "Agenda sem faltas" (Clínica Lumar, fictícia). Usa window.Auto (../assets/auto.js).
   18h: lê a agenda de amanhã → lembrete para cada paciente → respostas atualizam a agenda →
   vaga de quem remarca vai para a lista de espera → 8h: a recepção recebe quem não respondeu.
   A visitante é a Ana (9h) e responde pelo celular. Os outros pacientes respondem sozinhos.
   "Simular paciente sem WhatsApp": o lembrete do Sérgio não é entregue e a recepção é avisada na hora. */
(function () {
  'use strict';
  var A = window.Auto; if (!A) return;
  var $ = A.$, $$ = A.$$;
  var INICIO = 17 * 60 + 59; // seg, 17:59
  A.relogio.inicia(INICIO, 'seg');

  var PACIENTES = [
    { h: '08:00', n: 'Marcos A.', resp: { min: 3, tipo: 'confirma' } },
    { h: '09:00', n: 'Ana', voce: true },
    { h: '09:30', n: 'Bruno C.', resp: { min: 5, tipo: 'confirma' } },
    { h: '10:30', n: 'Helena P.', resp: { min: 11, tipo: 'remarca', para: 'qui, 10h' } },
    { h: '11:00', n: 'Rita S.' },
    { h: '14:00', n: 'Paulo M.' },
    { h: '15:00', n: 'Júlia R.', resp: { min: 20, tipo: 'confirma' } },
    { h: '16:00', n: 'Sérgio T.', semZapNaFalha: true }
  ];
  var LISTA = [{ n: 'Carla N.', pode: 'manhã' }, { n: 'Diego F.', pode: 'qualquer horário' }];

  var agLinhas = $('#ag-linhas'), leLinhas = $('#le-linhas');
  var convPac = $('#conv-pac'), convRec = $('#conv-rec');
  var zHoje = $('#z-hoje'), zEspera = $('#z-espera');
  var cRodar = $('#c-rodar'), zRodar = $('#z-rodar'), cPular = $('#c-pular'), cRecomecar = $('#c-recomecar'), cFalha = $('#c-falha');
  var S;

  /* ---------- tabelas ---------- */
  function celula(tr, txt, cls) { var td = document.createElement('td'); if (cls) td.className = cls; td.textContent = txt; tr.appendChild(td); return td; }
  function status(td, cls, txt) { td.textContent = ''; var s = document.createElement('span'); s.className = 'stt ' + cls; s.textContent = txt; td.appendChild(s); }
  function montaTabelas() {
    agLinhas.textContent = ''; leLinhas.textContent = '';
    PACIENTES.forEach(function (p) {
      var tr = document.createElement('tr'); if (p.voce) tr.className = 'voce';
      celula(tr, p.h); p.tdNome = celula(tr, p.voce ? 'Ana (você)' : p.n); p.tdSt = celula(tr, '');
      status(p.tdSt, 'env', 'Na agenda');
      p.tr = tr; agLinhas.appendChild(tr);
    });
    LISTA.forEach(function (l) {
      var tr = document.createElement('tr'); celula(tr, l.n); celula(tr, l.pode); l.tdSt = celula(tr, ''); status(l.tdSt, 'env', 'Esperando vaga');
      l.tr = tr; leLinhas.appendChild(tr);
    });
  }
  function pisca(tr) { tr.classList.remove('nova'); void tr.offsetWidth; tr.classList.add('nova'); }
  function poe(p, cls, txt) { status(p.tdSt, cls, txt); pisca(p.tr); }

  function novo() {
    PACIENTES.forEach(function (p) { p.estado = 'agenda'; });
    LISTA.forEach(function (l) { l.usada = false; });
    return { id: (S ? S.id : 0) + 1, fase: 'pronto', falha: false, vagas: 0, respostas: 0, entregues: 0, botoes: [] };
  }
  S = novo(); montaTabelas();

  function vivo(id) { return S.id === id; }
  function hora() { return A.relogio.hora(); }
  function semResposta() { return PACIENTES.filter(function (p) { return p.estado === 'enviado'; }); }
  function contaRespostas() { A.etapa(3, S.fase === 'fim' ? 'feita' : 'espera', S.respostas + ' de ' + S.entregues + ' pacientes responderam' + (S.fase === 'fim' ? ' até as 8h.' : '. Cada resposta muda a agenda na hora.'), ''); }

  /* ---------- rodar às 18h ---------- */
  function roda() {
    if (S.fase !== 'pronto') return;
    var id = S.id; S.fase = 'rodando'; S.falha = cFalha.checked;
    cRodar.disabled = true; zRodar.disabled = true; cFalha.disabled = true;
    A.anuncia('A automação começou: lendo a agenda de amanhã.');
    A.relogio.avanca(1).then(function () {
      if (!vivo(id)) return;
      A.etapa(1, 'rodando', null, hora()); A.novidade('aba-bas');
      return A.espera(800);
    }).then(function () {
      if (!vivo(id)) return;
      A.etapa(1, 'feita', PACIENTES.length + ' consultas amanhã, das 8h às 16h.', hora());
      A.etapa(2, 'rodando', null, hora());
      var i = 0;
      return (function proximo() {
        if (!vivo(id) || i >= PACIENTES.length) return;
        var p = PACIENTES[i++];
        if (S.falha && p.semZapNaFalha) {
          p.estado = 'falhou'; poe(p, 'err', 'Não entregue: sem WhatsApp');
          A.bolha(convRec, [{ texto: 'Lembrete não entregue' }, p.n + ' (' + p.h + ') não tem WhatsApp neste número. Ligar para confirmar a consulta de amanhã.'], { de: 'Automação Lumar', hora: hora() });
          A.gasto(1); A.novidade('aba-bas');
        } else {
          p.estado = 'enviado'; S.entregues++; poe(p, 'novo', 'Lembrete enviado'); A.gasto(1);
          if (p.voce) lembreteDaAna();
        }
        return A.espera(220).then(proximo);
      })();
    }).then(function () {
      if (!vivo(id)) return;
      A.etapa(2, S.falha ? 'aviso' : 'feita', S.falha ? S.entregues + ' lembretes entregues às 18:00. Um número não tem WhatsApp: a recepção já foi avisada para ligar.' : S.entregues + ' lembretes enviados às 18:00. Nenhum fala de especialidade, médico ou motivo.', '18:00');
      S.fase = 'respostas'; contaRespostas();
      A.anuncia('Lembretes enviados. Responda como a Ana no celular e veja a agenda mudar.');
      // os outros pacientes respondem ao longo da noite
      var eventos = PACIENTES.filter(function (p) { return p.resp; }).sort(function (a, b) { return a.resp.min - b.resp.min; });
      var desde = 0;
      return eventos.reduce(function (cad, p) {
        return cad.then(function () {
          if (!vivo(id)) return;
          var passo = p.resp.min - desde; desde = p.resp.min;
          return A.espera(1300).then(function () { return vivo(id) && A.relogio.avanca(passo); }).then(function () {
            if (!vivo(id) || p.estado !== 'enviado') return;
            S.respostas++;
            if (p.resp.tipo === 'confirma') { p.estado = 'ok'; poe(p, 'ok', 'Confirmou às ' + hora()); }
            else { p.estado = 'remarcou'; poe(p, 'res', 'Remarcou para ' + p.resp.para); return vaga(p, id); }
            contaRespostas();
          }).then(function () { contaRespostas(); });
        });
      }, Promise.resolve());
    }).then(function () {
      if (!vivo(id)) return;
      cPular.disabled = false; S.fase = 'esperando';
      A.anuncia('A noite passou para os outros pacientes. Agora você pode pular para amanhã às 8h.');
    });
  }
  cRodar.addEventListener('click', roda);
  zRodar.addEventListener('click', roda);

  /* ---------- vaga para a lista de espera ---------- */
  function vaga(quem, id) {
    var l = LISTA.filter(function (x) { return !x.usada; })[0];
    if (!l) { A.etapa(4, 'aviso', 'Vaga das ' + quem.h + ' aberta, mas a lista de espera está vazia: fica livre na agenda.', hora()); return Promise.resolve(); }
    l.usada = true;
    A.etapa(4, 'rodando', 'Vaga das ' + quem.h + ' aberta: oferecida a ' + l.n + ', da lista de espera.', hora());
    status(l.tdSt, 'novo', 'Vaga oferecida: ' + quem.h); pisca(l.tr);
    A.gasto(1);
    return A.espera(1500).then(function () {
      if (!vivo(id)) return;
      S.vagas++;
      status(l.tdSt, 'ok', 'Encaixado: ter, ' + quem.h); pisca(l.tr);
      // a linha da agenda passa a ser de quem veio da lista
      var tr = document.createElement('tr'), tdH = celula(tr, quem.h), tdN = celula(tr, l.n + ' · lista de espera'), tdS = celula(tr, '');
      status(tdS, 'ok', 'Confirmou às ' + hora()); tr.className = 'nova';
      quem.tr.parentNode.insertBefore(tr, quem.tr.nextSibling);
      A.etapa(4, 'feita', (S.vagas > 1 ? S.vagas + ' vagas preenchidas' : 'Vaga das ' + quem.h + ' preenchida') + ' pela lista de espera. ' + l.n + ' aceitou às ' + hora() + '.', hora());
      A.anuncia('A vaga das ' + quem.h + ' foi preenchida pela lista de espera.');
    });
  }

  /* ---------- a Ana responde ---------- */
  function trava() { S.botoes.forEach(function (b) { b.disabled = true; }); }
  function lembreteDaAna() {
    zEspera.hidden = true; zHoje.hidden = false;
    var b = A.bolha(convPac, ['Olá, Ana! Lembrete da Clínica Lumar: sua consulta é amanhã, terça, às 9h.', 'Endereço: Rua Exemplo, 500, sala 301, Praia do Canto.', 'Você confirma?'],
      { de: 'Clínica Lumar', hora: hora(), botoes: [{ texto: 'Confirmo', destaque: true, acao: confirma }, { texto: 'Preciso remarcar', acao: remarca }] });
    S.botoes = $$('.bt', b);
    A.novidade('aba-cli');
    A.anuncia('Chegou o lembrete no celular da Ana.');
  }
  var ana = PACIENTES[1];
  function podeResponder() { return ana.estado === 'enviado' || ana.estado === 'ligar'; }
  function confirma(bt) {
    if (!podeResponder()) return;
    trava(); bt.classList.add('escolhida');
    A.bolha(convPac, ['Confirmo'], { dela: true, hora: hora() });
    ana.estado = 'ok'; S.respostas++;
    A.espera(700).then(function () {
      A.bolha(convPac, ['Confirmado! Até amanhã às 9h. Se precisar remarcar, é só responder aqui.'], { de: 'Clínica Lumar', hora: hora() });
      poe(ana, 'ok', 'Confirmou às ' + hora()); contaRespostas();
      A.novidade('aba-bas');
      A.anuncia('Consulta da Ana confirmada. A agenda foi atualizada.');
    });
  }
  function remarca(bt) {
    if (!podeResponder()) return;
    trava(); bt.classList.add('escolhida');
    A.bolha(convPac, ['Preciso remarcar'], { dela: true, hora: hora() });
    ana.estado = 'escolhendo';
    A.espera(700).then(function () {
      var b = A.bolha(convPac, ['Sem problema! Estes horários estão livres. Qual fica melhor?'], { de: 'Clínica Lumar', hora: hora(),
        botoes: ['qua, 9h', 'qua, 14h', 'qui, 11h'].map(function (h) { return { texto: h, acao: function (x) { escolhe(h, x, b); } }; }) });
      A.anuncia('A clínica mandou os horários livres.');
    });
  }
  function escolhe(h, bt, bolhaOpcoes) {
    if (ana.estado !== 'escolhendo') return;
    $$('.bt', bolhaOpcoes).forEach(function (b) { b.disabled = true; }); bt.classList.add('escolhida');
    A.bolha(convPac, [h], { dela: true, hora: hora() });
    ana.estado = 'remarcou'; S.respostas++;
    var id = S.id;
    A.espera(700).then(function () {
      if (!vivo(id)) return;
      A.bolha(convPac, ['Pronto! Sua consulta passou para ' + h + '. O horário de amanhã foi liberado.'], { de: 'Clínica Lumar', hora: hora() });
      poe(ana, 'res', 'Remarcou para ' + h); contaRespostas();
      A.novidade('aba-bas');
      return vaga(ana, id);
    });
  }

  /* ---------- pular para amanhã, 8h ---------- */
  cPular.addEventListener('click', function () {
    if (S.fase !== 'esperando') return;
    cPular.disabled = true; var id = S.id;
    var ate = (1440 - A.relogio.agora() % 1440) + 8 * 60;
    A.relogio.avanca(ate, 'ter').then(function () {
      if (!vivo(id)) return;
      var lista = semResposta();
      A.etapa(5, 'rodando', null, hora());
      if (!lista.length) {
        A.etapa(5, 'feita', 'Todos responderam: nenhuma ligação para fazer hoje.', '08:00');
      } else {
        lista.forEach(function (p) { p.estado = 'ligar'; poe(p, 'sem', 'Sem resposta: ligar'); });
        A.bolha(convRec, [{ texto: 'Bom dia! Ligar antes do horário:' }].concat(lista.map(function (p) { return p.h + '  ' + (p.voce ? 'Ana' : p.n); })), { de: 'Automação Lumar', hora: '08:00' });
        A.gasto(1);
        A.etapa(5, 'feita', 'Lista enviada às 8h: ' + lista.length + (lista.length > 1 ? ' pacientes para ligar.' : ' paciente para ligar.'), '08:00');
      }
      S.fase = 'fim'; contaRespostas();
      A.novidade('aba-bas');
      A.anuncia('Oito horas: a recepção recebeu a lista de quem não respondeu.');
    });
  });

  /* ---------- recomeçar ---------- */
  cRecomecar.addEventListener('click', function () {
    S = novo(); montaTabelas();
    A.limpaConversa(convRec);
    $$('.bolha', convPac).slice(1).forEach(function (b) { b.remove(); });
    zHoje.hidden = true; zEspera.hidden = false;
    A.zeraEtapas(); A.relogio.zera('seg'); A.gasto(null);
    cRodar.disabled = false; zRodar.disabled = false; cFalha.disabled = false; cPular.disabled = true;
    A.mostra('aba-cli');
    A.anuncia('Simulação recomeçada.');
  });
  A.gasto(null);

  /* ---------- conta de custos ---------- */
  var kc = $('#k-consultas'), kr = $('#k-remarcam'), kd = $('#k-dias');
  if (kc && kr && kd) {
    var conta = function () {
      var c = +kc.value, r = +kr.value / 100, d = +kd.value;
      var rem = Math.round(c * r), pagas = c + rem + d, resp = c + rem * 2, extra = Math.max(0, resp - 1000);
      var v = (pagas + extra) * 0.035;
      $('#k-o-consultas').textContent = c.toLocaleString('pt-BR'); $('#k-o-remarcam').textContent = Math.round(r * 100) + '%'; $('#k-o-dias').textContent = d;
      $('#k-total').textContent = A.reais(v);
      $('#k-detalhe').textContent = (pagas + extra).toLocaleString('pt-BR') + ' mensagens × R$ 0,035 por mês';
      $('#k-resp').textContent = 'Cerca de ' + resp.toLocaleString('pt-BR') + ' respostas: ' + (extra ? extra.toLocaleString('pt-BR') + ' passam das 1.000 grátis e já estão na conta' : 'dentro das 1.000 grátis');
      A.faixa(kc); A.faixa(kr); A.faixa(kd);
    };
    [kc, kr, kd].forEach(function (k) { k.addEventListener('input', conta); }); conta();
  }
})();
