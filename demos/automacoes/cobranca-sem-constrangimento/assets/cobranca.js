/* Roteiro da demo "Cobrança sem constrangimento" (FORJA Academia, fictícia). Usa window.Auto (../assets/auto.js).
   3 dias antes do vencimento: cria a cobrança Pix e avisa no WhatsApp com "Copiar código Pix".
   Pagou: baixa na planilha e recibo em PDF. Não pagou: lembrete 1 e 3 dias úteis depois; depois disso,
   para de mandar mensagem e passa para a recepção. Antes de cada lembrete confere o pagamento de novo.
   "Simular aviso de pagamento que não chegou": a conferência de hora em hora acha o Pix. Sem IA. Nada é enviado. */
(function () {
  'use strict';
  var A = window.Auto; if (!A) return;
  var $ = A.$, $$ = A.$$;
  A.relogio.inicia(8 * 60 + 59, 'seg 09/11');
  var VALOR = 149.90, RODAPE = 'FORJA Academia · CNPJ 00.000.000/0001-00 · Av. Exemplo, 1000, Vitória/ES (dados fictícios)';
  var LEMBRETES = [[13, 'sex 13/11'], [17, 'ter 17/11'], [19, 'qui 19/11']];
  var PAGAVEL = ['aberto', 'prazo', 'conferir', 'recepcao'];

  var conv = $('#conv-cli'), convRec = $('#conv-rec'), zEspera = $('#z-espera'), zHoje = $('#z-hoje');
  var compor = $('#cb-compor'), chips = $('#cb-chips'), banco = $('#ov-banco'), notif = $('#notif-cli');
  var cRodar = $('#c-rodar'), zRodar = $('#z-rodar'), cPular = $('#c-pular'), cRecomecar = $('#c-recomecar'), cFalha = $('#c-falha');
  var stLucas = $('#st-lucas'), recebido = $('#recebido'), reciboVazio = $('#recibo-vazio'), reciboCorpo = $('#recibo-corpo');
  var alerta = $('#alerta-hk'), alertaTxt = $('#alerta-txt'), custo = $('#custo');
  var S;
  function novo(id) { return { id: id || 0, fase: 'pronto', dia: 9, abs: 0, janCli: -1e9, janRec: -1e9, pagas: 0, gratis: 0, asaas: 0, lembretes: 0, passo: 0, recepcao: false, bts: [] }; }
  S = novo();

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function h() { return A.relogio.hora(); }
  function vivo(id) { return S.id === id; }
  function data() { return String(S.dia).padStart(2, '0') + '/11'; }
  function passa(min, dia) { S.abs += min; return A.relogio.avanca(min, dia); }
  function ate(diaNum, rotulo) { var min = (diaNum - S.dia) * 1440 + 540 - A.relogio.agora(); S.dia = diaNum; return passa(min, rotulo); }
  function pagavel() { return PAGAVEL.indexOf(S.fase) >= 0; }

  /* ---------- custo ---------- */
  function cobra(quem) {
    var jan = quem === 'cli' ? S.janCli : S.janRec;
    if (S.abs - jan > 1440) S.pagas++; else S.gratis++;
    poeCusto();
  }
  function poeCusto() {
    custo.textContent = 'Asaas ' + A.reais(S.asaas * 1.99) + ' · Meta ' + A.reais(S.pagas * 0.035, 3) + ' (' + S.pagas + (S.pagas === 1 ? ' paga' : ' pagas') + (S.gratis ? ', ' + S.gratis + ' grátis' : '') + ') · sem IA';
  }
  function situacao(txt, cls) { stLucas.textContent = txt; stLucas.className = 'stt ' + cls; var tr = $('#linha-lucas'); tr.classList.remove('nova'); void tr.offsetWidth; tr.classList.add('nova'); }

  /* ---------- mensagens ---------- */
  function msgAluno(linhas, botoes) {
    cobra('cli');
    var b = A.bolha(conv, linhas.concat([{ tag: 'small', texto: RODAPE }]), { de: 'FORJA Academia', hora: h(), botoes: botoes });
    $$('.bt', b).forEach(function (x) { S.bts.push(x); });
    return b;
  }
  function msgRecepcao(linhas) { cobra('rec'); A.bolha(convRec, linhas, { de: 'Automação FORJA', hora: h() }); A.novidade('aba-bas'); }
  function botoesPix(extras) {
    var bs = [{ texto: 'Copiar código Pix', destaque: true, acao: copia }];
    if (extras) bs.push({ texto: 'Já paguei', acao: jaPaguei }, { texto: 'Preciso de mais prazo', acao: prazo });
    return bs;
  }
  function travaRespostas() { S.bts.forEach(function (b) { if (b.textContent !== 'Copiar código Pix') b.disabled = true; }); }
  function poeChips() {
    chips.textContent = '';
    if (S.fase !== 'aberto') { compor.hidden = true; cPular.disabled = true; return; }
    var b = el('button'); b.type = 'button';
    b.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-skip"/></svg>';
    b.appendChild(document.createTextNode('Não pagar: ir ao próximo lembrete'));
    b.addEventListener('click', pula); chips.appendChild(b);
    compor.hidden = false; cPular.disabled = false;
  }
  function trava() { compor.hidden = true; cPular.disabled = true; }

  /* ---------- 1 e 2: cobrança e aviso antes de vencer ---------- */
  function roda() {
    if (S.fase !== 'pronto') return;
    var id = ++S.id; S.fase = 'rodando';
    cRodar.disabled = true; zRodar.disabled = true;
    A.novidade('aba-bas');
    passa(1).then(function () {
      if (!vivo(id)) return;
      A.etapa(1, 'feita', 'Cobrança de R$ 149,90 criada para Lucas Andrade, vencimento 12/11, com código Pix só dele.', h());
      A.etapa(2, 'rodando', null, h());
      return A.espera(700);
    }).then(function () {
      if (!vivo(id)) return;
      zEspera.hidden = true; zHoje.hidden = false;
      msgAluno(['Oi, Lucas! Sua mensalidade da FORJA de novembro (plano Livre, R$ 149,90) vence na quinta, 12/11.', 'Se quiser, já pode pagar pelo Pix: é só copiar o código e colar no app do seu banco.'], botoesPix(false));
      A.novidade('aba-cli');
      A.etapa(2, 'feita', 'Aviso enviado às ' + h() + ', 3 dias antes de vencer.', h());
      A.etapa(3, 'espera', 'Esperando o Pix. Vence em 12/11.', h());
      situacao('aviso enviado', 'env');
      S.fase = 'aberto'; poeChips();
      A.anuncia('Aviso da mensalidade enviado ao aluno, com o código Pix.');
    });
  }
  cRodar.addEventListener('click', roda); zRodar.addEventListener('click', roda);

  /* ---------- pagar pelo app do banco ---------- */
  function copia() {
    if (!pagavel()) return;
    notif.hidden = false; setTimeout(function () { notif.hidden = true; }, 1400);
    banco.hidden = false; $('#ov-banco-t').focus();
  }
  $('#ob-cancelar').addEventListener('click', function () { banco.hidden = true; });
  $('#ob-pagar').addEventListener('click', function () {
    if (!pagavel()) return;
    var id = S.id, falha = cFalha.checked, comRecepcao = S.recepcao;
    S.fase = 'rodando'; banco.hidden = true; trava(); travaRespostas(); cFalha.disabled = true;
    S.asaas = 1; poeCusto();
    A.novidade('aba-bas');
    passa(4).then(function () {
      if (!vivo(id)) return;
      S.pagoAs = h();
      if (!falha) return baixa(id, false, comRecepcao);
      A.etapa(3, 'espera', 'O Pix caiu na conta às ' + S.pagoAs + ', mas o aviso automático do Asaas não chegou.', h());
      return A.espera(1600).then(function () { if (vivo(id)) return passa(60 - (A.relogio.agora() % 60)); }).then(function () {
        if (!vivo(id)) return;
        A.etapa(3, 'rodando', 'Conferência de hora em hora no Asaas…', h());
        return A.espera(700);
      }).then(function () { if (vivo(id)) return baixa(id, true, comRecepcao); });
    });
  });
  function baixa(id, viaConferencia, comRecepcao) {
    A.etapa(3, 'feita', viaConferencia ? 'A conferência das ' + h() + ' achou o Pix de R$ 149,90 (pago às ' + S.pagoAs + ') e deu baixa na planilha.' : 'Pix de R$ 149,90 recebido às ' + S.pagoAs + '. Baixa feita na planilha.', h());
    if (viaConferencia) {
      alertaTxt.textContent = 'O aviso de pagamento do Asaas não chegou para a cobrança de Lucas Andrade (12/11). A conferência de hora em hora achou o Pix e resolveu. Verificar o webhook.';
      alerta.hidden = false;
    }
    situacao('pago · Pix', 'ok');
    recebido.textContent = A.reais(469.70 + VALOR);
    A.etapa(4, 'rodando', null, h());
    return A.espera(700).then(function () {
      if (!vivo(id)) return;
      recibo();
      var b = msgAluno(['Recebemos seu Pix de R$ 149,90, Lucas. Obrigado!', 'O recibo da mensalidade de novembro está em anexo.']);
      var an = el('span', 'anexo'); an.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-doc"/></svg>';
      an.appendChild(el('span', null, 'Recibo-FORJA-nov-2026.pdf')); an.appendChild(el('small', null, 'PDF'));
      b.insertBefore(an, $('small', b));
      S.bts.forEach(function (x) { x.disabled = true; });
      A.etapa(4, 'feita', 'Recibo nº 2026-11-0412 enviado às ' + h() + '.', h());
      if (comRecepcao) msgRecepcao(['Lucas Andrade pagou a mensalidade de 12/11 (R$ 149,90). Não precisa mais falar com ele sobre isso.']);
      A.etapa(5, 'feita', S.lembretes ? 'Pago depois de ' + S.lembretes + (S.lembretes === 1 ? ' lembrete' : ' lembretes') + '. A régua parou sozinha.' : 'Não foi preciso lembrar: pago antes de vencer.', h());
      S.fase = 'pago';
      A.novidade('aba-cli');
      A.anuncia('Pagamento recebido: baixa feita e recibo enviado.');
    });
  }
  function recibo() {
    reciboCorpo.textContent = '';
    reciboCorpo.appendChild(el('h4', null, 'Recibo'));
    reciboCorpo.appendChild(el('p', 'rc-num', 'nº 2026-11-0412'));
    reciboCorpo.appendChild(el('p', null, 'Recebemos de Lucas Andrade a quantia de R$ 149,90 (cento e quarenta e nove reais e noventa centavos), referente à mensalidade de novembro de 2026 do plano Livre, paga por Pix em ' + data() + '/2026, às ' + S.pagoAs + '.'));
    reciboCorpo.appendChild(el('p', 'rc-rod', 'FORJA Academia Ltda. · CNPJ 00.000.000/0001-00 · Av. Exemplo, 1000, Jardim da Penha, Vitória/ES. Dados fictícios. Recibo gerado automaticamente.'));
    reciboVazio.hidden = true; reciboCorpo.hidden = false;
  }

  /* ---------- 5: lembretes de atraso ---------- */
  function pula() {
    if (S.fase !== 'aberto' || S.passo >= LEMBRETES.length) return;
    var id = S.id, n = S.passo++, alvo = LEMBRETES[n];
    S.fase = 'rodando'; trava(); cFalha.disabled = true;
    ate(alvo[0], alvo[1]).then(function () {
      if (!vivo(id)) return;
      cFalha.disabled = false;
      A.etapa(3, 'rodando', 'Conferindo no Asaas antes de lembrar…', h());
      return A.espera(600);
    }).then(function () {
      if (!vivo(id)) return;
      A.etapa(3, 'espera', 'Conferiu em ' + data() + ', às ' + h() + ': ainda sem pagamento.', h());
      if (n < 2) S.lembretes++;
      if (n === 0) {
        msgAluno(['Oi, Lucas. Ainda não identificamos o pagamento da mensalidade que venceu ontem (12/11). Se já pagou, pode desconsiderar.', 'O código Pix continua valendo. Se precisar de mais prazo, é só dizer.'], botoesPix(true));
        A.etapa(5, 'espera', '1º lembrete enviado em ' + data() + ' (1 dia útil depois do vencimento).', h());
        situacao('atrasado · 1º lembrete', 'sem');
      } else if (n === 1) {
        msgAluno(['Oi, Lucas. A mensalidade de novembro (R$ 149,90, vencida em 12/11) continua em aberto.', 'Se estiver passando por algum aperto, responda aqui que a recepção combina uma data com você. Sem problema nenhum.'], botoesPix(true));
        A.etapa(5, 'aviso', '2º lembrete enviado em ' + data() + ' (3 dias úteis depois). É o último por mensagem.', h());
        situacao('atrasado · 2º lembrete', 'sem');
      } else {
        S.recepcao = true;
        msgRecepcao([{ texto: 'Lucas Andrade · plano Livre' }, 'Mensalidade de 12/11 (R$ 149,90) em aberto há 7 dias, 2 lembretes sem resposta.', 'Melhor uma conversa pessoal, com discrição, na próxima vez que ele vier treinar.']);
        A.etapa(5, 'aviso', 'Parou de mandar mensagens ao aluno. A recepção conversa pessoalmente.', h());
        situacao('falar na recepção', 'sem');
      }
      A.novidade(n < 2 ? 'aba-cli' : 'aba-bas');
      S.fase = n < 2 ? 'aberto' : 'recepcao';
      poeChips();
      A.anuncia(n < 2 ? 'Lembrete educado enviado ao aluno.' : 'A automação parou de cobrar e avisou a recepção.');
    });
  }
  cPular.addEventListener('click', pula);

  function resposta(texto, cb) {
    if (!pagavel() || S.fase === 'prazo' || S.fase === 'conferir') return;
    var id = S.id; S.fase = 'rodando'; trava(); travaRespostas();
    A.bolha(conv, [texto], { dela: true, hora: h() });
    S.janCli = S.abs;
    passa(2).then(function () { if (vivo(id)) cb(id); });
  }
  function jaPaguei() {
    resposta('Já paguei.', function (id) {
      A.etapa(3, 'rodando', 'O aluno disse que pagou. Conferindo no Asaas…', h());
      A.espera(700).then(function () {
        if (!vivo(id)) return;
        A.etapa(3, 'espera', 'Conferiu às ' + h() + ': nenhum Pix ainda. A recepção vai conferir o comprovante.', h());
        msgAluno(['Conferimos agora e o pagamento ainda não apareceu. Se pagou há pouco, pode levar alguns minutos.', 'Se tiver o comprovante, mande aqui que a recepção confere. Enquanto isso, não enviamos mais lembretes.']);
        S.recepcao = true;
        msgRecepcao(['Lucas Andrade diz que já pagou a mensalidade de 12/11, mas o Pix não apareceu no Asaas. Conferir o comprovante com ele.']);
        A.etapa(5, 'espera', 'Lembretes pausados até a recepção conferir.', h());
        situacao('conferir comprovante', 'res');
        S.fase = 'conferir'; poeChips();
      });
    });
  }
  function prazo() {
    resposta('Preciso de mais prazo.', function (id) {
      msgAluno(['Sem problema, Lucas. A recepção vai falar com você hoje para combinar uma nova data.', 'Até lá, não mandamos mais lembretes.']);
      S.recepcao = true;
      msgRecepcao(['Lucas Andrade pediu mais prazo para a mensalidade de 12/11 (R$ 149,90). Combinar uma nova data com ele.']);
      A.etapa(5, 'espera', 'Lucas pediu prazo. Os lembretes pausaram e a recepção combina a data.', h());
      situacao('pediu prazo', 'res');
      S.fase = 'prazo'; poeChips();
      A.anuncia('O aluno pediu prazo. A recepção foi avisada.');
    });
  }

  /* ---------- recomeçar ---------- */
  cRecomecar.addEventListener('click', function () {
    S = novo(S.id + 1);
    $$('.bolha', conv).slice(1).forEach(function (b) { b.remove(); });
    zEspera.hidden = false; zHoje.hidden = true; compor.hidden = true; chips.textContent = '';
    banco.hidden = true; notif.hidden = true;
    A.limpaConversa(convRec);
    reciboCorpo.textContent = ''; reciboCorpo.hidden = true; reciboVazio.hidden = false;
    stLucas.textContent = 'a vencer'; stLucas.className = 'stt env'; recebido.textContent = A.reais(469.70);
    alerta.hidden = true;
    cRodar.disabled = false; zRodar.disabled = false; cPular.disabled = true; cFalha.disabled = false;
    A.zeraEtapas(); A.relogio.zera('seg 09/11'); poeCusto();
    A.mostra('aba-cli');
    A.anuncia('Simulação recomeçada.');
  });
  poeCusto();

  /* ---------- conta ---------- */
  var ka = $('#k-alunos'), kt = $('#k-atraso');
  if (ka && kt) {
    var conta = function () {
      var a = +ka.value, p = +kt.value, atrasados = Math.round(a * p / 100);
      var asaas = a * 1.99, meta = (a * 2 + atrasados * 2) * 0.035;
      $('#k-o-alunos').textContent = a.toLocaleString('pt-BR');
      $('#k-o-atraso').textContent = p + '%';
      $('#k-total').textContent = A.reais(asaas + meta);
      $('#k-detalhe').textContent = 'Asaas ' + A.reais(asaas) + ' + Meta ' + A.reais(meta);
      A.faixa(ka); A.faixa(kt);
    };
    ka.addEventListener('input', conta); kt.addEventListener('input', conta); conta();
  }
})();
