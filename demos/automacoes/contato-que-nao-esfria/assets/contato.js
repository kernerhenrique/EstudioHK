/* Roteiro da demo "Contato que não esfria" (Taipa Arquitetura, fictícia). Usa window.Auto (../assets/auto.js).
   Fluxo: formulário → planilha → aviso para a Laís → confirmação ao cliente → espera 2 h → lembrete.
   Com "Simular falha na planilha": 3 tentativas, e-mail de reserva, alerta para a EstudioHK e a linha entra quando a planilha volta. */
(function () {
  'use strict';
  var A = window.Auto; if (!A) return;
  var $ = A.$, $$ = A.$$;
  var INICIO = 10 * 60 + 42; // ter, 10:42
  A.relogio.inicia(INICIO, 'ter');

  var form = $('#t-form'), erro = $('#t-erro'), enviar = $('#t-enviar'), ok = $('#t-ok');
  var notif = $('#notif-cli'), notifTxt = $('#notif-cli-txt');
  var linhas = $('#pl-linhas'), fora = $('#pl-fora'), conversa = $('#conversa');
  var alerta = $('#alerta-hk'), alertaTxt = $('#alerta-txt');
  var cPular = $('#c-pular'), cRecomecar = $('#c-recomecar'), cFalha = $('#c-falha');

  var S; // estado da simulação
  function novo() { return { fase: 'form', id: 0, dados: null, enviadoEm: 0, respondido: false, lembrete: false, planilhaFora: false, linha: null, botoes: [] }; }
  S = novo();

  /* ---------- formulário ---------- */
  var EXEMPLO = { tipo: 'Reforma', nome: 'Júlia Santos', zap: '(27) 90000-0000', cidade: 'Vitória', msg: 'Quero reformar a cozinha e integrar com a sala. Apartamento de 70 m².' };
  $('#t-exemplo').addEventListener('click', function () {
    $$('input[name=tipo]', form).forEach(function (i) { i.checked = i.value === EXEMPLO.tipo; });
    $('#t-nome').value = EXEMPLO.nome; $('#t-zap').value = EXEMPLO.zap; $('#t-cidade').value = EXEMPLO.cidade; $('#t-msg').value = EXEMPLO.msg;
    $('#t-aceite').checked = true; erro.textContent = '';
    enviar.focus();
  });
  function le() {
    var t = $('input[name=tipo]:checked', form);
    return { tipo: t ? t.value : '', nome: $('#t-nome').value.trim(), zap: $('#t-zap').value.trim(), cidade: $('#t-cidade').value.trim(), msg: $('#t-msg').value.trim(), aceite: $('#t-aceite').checked };
  }
  function valida(d) {
    var faltas = [], primeiro = null;
    if (!d.tipo) { faltas.push('o tipo de projeto'); primeiro = primeiro || $('input[name=tipo]', form); }
    if (!d.nome) { faltas.push('o seu nome'); primeiro = primeiro || $('#t-nome'); }
    var dig = d.zap.replace(/\D/g, '');
    if (dig.length < 10 || dig.length > 11) { faltas.push('um WhatsApp com DDD'); primeiro = primeiro || $('#t-zap'); }
    if (!d.aceite) { faltas.push('o aceite para receber a resposta pelo WhatsApp'); primeiro = primeiro || $('#t-aceite'); }
    return { ok: !faltas.length, msg: faltas.length ? 'Falta ' + (faltas.length > 1 ? faltas.slice(0, -1).join(', ') + ' e ' + faltas[faltas.length - 1] : faltas[0]) + '.' : '', primeiro: primeiro };
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (S.fase !== 'form') return;
    var d = le(), v = valida(d);
    $$('input, textarea', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
    if (!v.ok) { erro.textContent = v.msg; if (v.primeiro) { v.primeiro.setAttribute('aria-invalid', 'true'); v.primeiro.focus(); } return; }
    erro.textContent = '';
    roda(d);
  });

  /* ---------- planilha ---------- */
  function poeStatus(classe, texto) {
    if (!S.linha) return;
    var s = $('.stt', S.linha); s.className = 'stt ' + classe; s.textContent = texto;
  }
  function insereLinha(status) {
    var d = S.dados, tr = document.createElement('tr'); tr.className = 'nova';
    ['04/11', d.nome.split(' ')[0] + (d.nome.split(' ')[1] ? ' ' + d.nome.split(' ')[1][0] + '.' : ''), d.tipo, d.cidade || '·'].forEach(function (c) { var td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
    var td = document.createElement('td'), s = document.createElement('span'); s.className = 'stt'; td.appendChild(s); tr.appendChild(td);
    linhas.insertBefore(tr, linhas.firstChild); S.linha = tr;
    poeStatus(status[0], status[1]);
  }
  function tempo(min) { return min < 60 ? min + ' min' : Math.floor(min / 60) + ' h' + (min % 60 ? ' ' + String(min % 60).padStart(2, '0') : ''); }

  /* ---------- fluxo ---------- */
  function vivo(id) { return S.id === id; } // ignora passos de uma simulação que foi recomeçada
  function roda(d) {
    var id = ++S.id, falha = cFalha.checked, h = A.relogio.hora;
    S.fase = 'rodando'; S.dados = d; S.enviadoEm = A.relogio.agora();
    enviar.disabled = true;
    form.hidden = true; ok.hidden = false; $('#t-ok-t').focus();
    if (A.celular()) setTimeout(function () { if (vivo(id)) { A.mostra('aba-bas'); A.anuncia('Mostrando os bastidores: veja o que a automação faz.'); } }, A.reduce ? 0 : 1400);
    else A.anuncia('Pedido enviado. Acompanhe os bastidores.');

    A.etapa(1, 'rodando', null, h());
    A.espera(800).then(function () {
      if (!vivo(id)) return;
      A.etapa(1, 'feita', d.nome + ' · ' + d.tipo + (d.cidade ? ' · ' + d.cidade : '') + '.', h());
      A.etapa(2, 'rodando', null, h());
      return A.espera(900);
    }).then(function () {
      if (!vivo(id)) return;
      if (!falha) { insereLinha(['novo', 'Novo']); A.etapa(2, 'feita', 'Linha nova no topo da planilha, com o status "Novo".', h()); A.anuncia('Pedido salvo na planilha.'); return; }
      S.planilhaFora = true; fora.hidden = false;
      var n = 0;
      return (function tenta() {
        n++;
        A.etapa(2, 'erro', 'A planilha não respondeu. Tentando de novo (' + n + ' de 3)…', h());
        return A.espera(1100).then(function () {
          if (!vivo(id)) return;
          if (n < 3) return tenta();
          A.etapa(2, 'aviso', 'Planilha fora do ar. O pedido foi guardado no e-mail de reserva e a EstudioHK foi avisada. A linha entra sozinha quando a planilha voltar.', h());
          alertaTxt.textContent = 'Falha ao salvar na planilha da Taipa às ' + h() + '. O pedido de ' + d.nome + ' está guardado no e-mail de reserva. Nova tentativa automática a cada 15 minutos.';
          alerta.hidden = false;
          A.anuncia('Falha na planilha: pedido guardado no e-mail de reserva e a EstudioHK foi avisada.');
        });
      })();
    }).then(function () {
      if (!vivo(id)) return;
      A.etapa(3, 'rodando', null, h());
      return A.espera(800);
    }).then(function () {
      if (!vivo(id)) return;
      var b = A.bolha(conversa, [
        { texto: 'Novo pedido de orçamento' },
        d.nome + ' · ' + d.tipo + (d.cidade ? ' · ' + d.cidade : ''),
        d.msg ? '"' + (d.msg.length > 90 ? d.msg.slice(0, 88) + '…' : d.msg) + '"' : 'Sem mensagem.',
        'WhatsApp: ' + d.zap
      ], { de: 'Automação Taipa', hora: h(), botoes: [{ texto: 'Já respondi', destaque: true, acao: respondeu }] });
      S.botoes.push($('.bt', b));
      A.gasto(1);
      A.etapa(3, 'feita', 'Chegou em 1 segundo, com o resumo e o botão "Já respondi".', h());
      A.novidade('aba-bas');
      A.etapa(4, 'rodando', null, h());
      return A.espera(800);
    }).then(function () {
      if (!vivo(id)) return;
      var primeiro = d.nome.split(' ')[0], tipo = d.tipo === 'Casa nova' ? 'casa nova' : d.tipo === 'Reforma' ? 'reforma' : 'interiores';
      notifTxt.textContent = 'Olá, ' + primeiro + '! Recebemos seu pedido de ' + tipo + '. A Laís responde no mesmo dia útil. (mensagem automática)';
      notif.hidden = false;
      A.gasto(1);
      A.etapa(4, 'feita', 'Mensagem automática no WhatsApp do cliente. Ele marcou o aceite no formulário.', h());
      A.novidade('aba-cli');
      A.etapa(5, 'espera', 'Lembrete às ' + A.relogio.hora(S.enviadoEm + 120) + ' se ninguém responder. Toque em "Já respondi" na conversa da Laís ou pule 2 horas.', '');
      S.fase = 'esperando'; cPular.disabled = false;
      A.anuncia('Aviso enviado para a Laís e confirmação enviada ao cliente. Agora a automação espera a resposta.');
    });
  }

  function respondeu(bt) {
    if (S.fase !== 'esperando' && S.fase !== 'lembrado') return;
    S.botoes.forEach(function (b) { b.disabled = true; });
    var antes = S.fase === 'lembrado';
    var p = antes ? A.relogio.avanca(5) : A.relogio.avanca(14);
    p.then(function () {
      var h = A.relogio.hora(), passou = A.relogio.agora() - S.enviadoEm;
      A.bolha(conversa, ['Já respondi'], { dela: true, hora: h });
      S.respondido = true; S.fase = 'fim'; cPular.disabled = true;
      if (S.planilhaFora) {
        // a planilha volta logo depois e a linha entra já com a resposta
        S.planilhaFora = false; fora.hidden = true;
        var volta = A.relogio.hora(Math.max(A.relogio.agora(), S.enviadoEm + 15) + 1);
        insereLinha(['ok', 'Respondido em ' + tempo(passou)]);
        A.etapa(2, 'feita', 'A planilha voltou às ' + volta + ' e a linha entrou sozinha, vinda da reserva.', '');
        alertaTxt.textContent = 'Resolvido às ' + volta + ': a planilha voltou e o pedido de ' + S.dados.nome + ' foi incluído. Nenhum dado perdido.';
      } else poeStatus('ok', 'Respondido em ' + tempo(passou));
      A.etapa(5, 'feita', antes ? 'A Laís respondeu às ' + h + ', depois do lembrete. Status atualizado na planilha.' : 'A Laís respondeu às ' + h + '. Lembrete cancelado e status atualizado na planilha.', '');
      A.anuncia('A Laís respondeu em ' + tempo(passou) + '. Fim da simulação. Use Recomeçar para testar de novo.');
    });
  }

  cPular.addEventListener('click', function () {
    if (S.fase !== 'esperando') return;
    cPular.disabled = true;
    var id = S.id;
    A.relogio.avanca(120).then(function () {
      if (!vivo(id)) return;
      var h = A.relogio.hora();
      if (S.planilhaFora) {
        S.planilhaFora = false; fora.hidden = true;
        var volta = A.relogio.hora(S.enviadoEm + 15);
        insereLinha(['sem', 'Sem resposta há 2 h']);
        A.etapa(2, 'feita', 'A planilha voltou às ' + volta + ' e a linha entrou sozinha, vinda da reserva.', '');
        alertaTxt.textContent = 'Resolvido às ' + volta + ': a planilha voltou e o pedido de ' + S.dados.nome + ' foi incluído. Nenhum dado perdido.';
      } else poeStatus('sem', 'Sem resposta há 2 h');
      var b = A.bolha(conversa, [{ texto: 'Lembrete' }, 'O pedido de ' + S.dados.nome + ' (' + S.dados.tipo + ') está sem resposta há 2 horas.'],
        { de: 'Automação Taipa', hora: h, botoes: [{ texto: 'Já respondi', destaque: true, acao: respondeu }] });
      S.botoes.push($('.bt', b));
      A.gasto(1);
      S.fase = 'lembrado';
      A.etapa(5, 'aviso', 'Ninguém respondeu em 2 horas: lembrete enviado às ' + h + '. Toque em "Já respondi" na conversa da Laís.', h);
      A.anuncia('Duas horas sem resposta: a automação mandou um lembrete para a Laís.');
    });
  });

  cRecomecar.addEventListener('click', function () {
    S.id++; var id = S.id; S = novo(); S.id = id;
    form.reset(); form.hidden = false; ok.hidden = true; notif.hidden = true; enviar.disabled = false; erro.textContent = '';
    $$('tr.nova', linhas).forEach(function (tr) { tr.remove(); });
    fora.hidden = true; alerta.hidden = true;
    A.limpaConversa(conversa); A.zeraEtapas(); A.relogio.zera(); A.gasto(null);
    cPular.disabled = true;
    A.mostra('aba-cli');
    A.anuncia('Simulação recomeçada.');
    $('#t-exemplo').focus();
  });
  A.gasto(null);

  /* ---------- conta de custos ---------- */
  var kc = $('#k-contatos'), ks = $('#k-sem');
  if (kc && ks) {
    var conta = function () {
      var c = +kc.value, s = +ks.value / 100, m = Math.round(c * 2 + c * s), v = m * 0.035;
      $('#k-o-contatos').textContent = c; $('#k-o-sem').textContent = Math.round(s * 100) + '%';
      $('#k-total').textContent = A.reais(v);
      $('#k-detalhe').textContent = m.toLocaleString('pt-BR') + ' mensagens × R$ 0,035 por mês';
      A.faixa(kc); A.faixa(ks);
    };
    kc.addEventListener('input', conta); ks.addEventListener('input', conta); conta();
  }
})();
