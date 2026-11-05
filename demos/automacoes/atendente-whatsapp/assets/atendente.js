/* Roteiro da demo "Atendente com IA no WhatsApp" (Ofício Barbearia, fictícia). Usa window.Auto (../assets/auto.js).
   Não há IA de verdade aqui: as respostas são prontas e escolhidas por palavras-chave, imitando o que a IA faz
   no cliente real (responder só pela ficha, ver e marcar horário, recusar assunto de fora, chamar uma pessoa).
   Nada é enviado. */
(function () {
  'use strict';
  var A = window.Auto; if (!A) return;
  var $ = A.$, $$ = A.$$;
  var INICIO = 21 * 60 + 10; // ter, 21:10 (barbearia fechada)
  A.relogio.inicia(INICIO, 'ter');
  var CLIENTE = 'Thiago';
  var CUSTO_IA = 0.0005; // US$ por resposta, Claude Haiku 5.5 (~4 mil tokens de entrada e 150 de saída)

  /* ---------- ficha da barbearia (o dono edita) ---------- */
  var FICHA = [
    { id: 'corte', item: 'Corte', txt: 'R$ 60 · 45 min · tesoura ou máquina, lavagem e finalização', nome: 'corte', preco: 60, min: 45 },
    { id: 'barba', item: 'Barba com toalha quente', txt: 'R$ 45 · 30 min · navalha, espuma quente e balm', nome: 'barba com toalha quente', preco: 45, min: 30 },
    { id: 'combo', item: 'Corte + barba', txt: '', nome: 'corte + barba', preco: 95, min: 75 },
    { id: 'degrade', item: 'Degradê navalhado', txt: 'R$ 65 · 50 min', nome: 'degradê navalhado', preco: 65, min: 50 },
    { id: 'pigment', item: 'Pigmentação de barba', txt: 'R$ 40 · 30 min', nome: 'pigmentação de barba', preco: 40, min: 30 },
    { id: 'infantil', item: 'Corte infantil', txt: 'R$ 50 · 40 min · até 12 anos, com um responsável', nome: 'corte infantil', preco: 50, min: 40 },
    { id: 'sobrancelha', item: 'Sobrancelha', txt: 'R$ 20 · 15 min', nome: 'sobrancelha', preco: 20, min: 15 },
    { id: 'pezinho', item: 'Pezinho', txt: 'R$ 20 · 15 min', nome: 'pezinho', preco: 20, min: 15 },
    { id: 'horarios', item: 'Horários', txt: 'ter a sex, 9h às 20h · sáb, 8h às 18h · dom e seg, fechado · último atendimento 30 min antes' },
    { id: 'endereco', item: 'Endereço', txt: 'Rua Exemplo, 123 · Praia do Canto · Vitória/ES · estacionamento conveniado na rua de trás' },
    { id: 'pagamento', item: 'Pagamento', txt: 'Pix, cartão de débito e de crédito' },
    { id: 'atraso', item: 'Atraso', txt: 'espera até 10 min; depois, tenta encaixar no próximo horário livre' },
    { id: 'cancelar', item: 'Cancelar ou remarcar', txt: 'pelo WhatsApp, até 2 h antes' },
    { id: 'barbeiros', item: 'Barbeiros', txt: 'Léo (degradê e navalhado) · Caio (barba e pigmentação) · Rafa (tesoura e cabelo longo)' },
    { id: 'clube', item: 'Clube Ofício', txt: 'R$ 149/mês · cortes ilimitados de ter a qui · 1 barba com toalha quente por mês' },
    { id: 'telefone', item: 'Telefone', txt: '(27) 0000-0000 (fictício)' }
  ];
  var AGENDA = [
    { h: '09:00', b: 'Léo', livre: false }, { h: '10:30', b: 'Caio', livre: false },
    { h: '14:00', b: 'Léo', livre: true }, { h: '15:30', b: 'Caio', livre: true },
    { h: '16:00', b: 'Rafa', livre: false }, { h: '17:00', b: 'Rafa', livre: true }
  ];
  function f(id) { return FICHA.filter(function (x) { return x.id === id; })[0]; }
  function real(n) { return 'R$ ' + n; }

  var fichaLinhas = $('#ficha-linhas'), agLinhas = $('#ag-linhas');
  var conv = $('#conv-cli'), convDono = $('#conv-dono');
  var chips = $$('#chips button'), form = $('#z-form'), texto = $('#z-texto'), enviar = $('button', form);
  var cFora = $('#c-fora'), cPreco = $('#c-preco'), cRecomecar = $('#c-recomecar'), cFalha = $('#c-falha');
  var alerta = $('#alerta-hk'), alertaTxt = $('#alerta-txt'), elCusto = $('#custo');
  var S;

  function montaFicha() {
    fichaLinhas.textContent = '';
    FICHA.forEach(function (x) {
      var tr = document.createElement('tr'), a = document.createElement('td'), b = document.createElement('td');
      a.textContent = x.item; b.textContent = x.txt; tr.appendChild(a); tr.appendChild(b); x.tr = tr; x.td = b;
      fichaLinhas.appendChild(tr);
    });
    pintaCombo(false);
  }
  function pintaCombo(editado) {
    var c = f('combo'); c.txt = real(c.preco) + ' · 75 min · com toalha quente';
    c.td.textContent = c.txt;
    if (editado) { var s = document.createElement('span'); s.className = 'editado'; s.textContent = 'editado agora'; c.td.appendChild(s); }
  }
  function montaAgenda() {
    agLinhas.textContent = '';
    AGENDA.forEach(function (x) {
      var tr = document.createElement('tr');
      [x.h, x.b].forEach(function (t) { var td = document.createElement('td'); td.textContent = t; tr.appendChild(td); });
      var td = document.createElement('td'), s = document.createElement('span'); s.className = 'stt ' + (x.livre ? 'ok' : 'env'); s.textContent = x.livre ? 'Livre' : 'Ocupado';
      td.appendChild(s); tr.appendChild(td); x.tr = tr; x.td = td; agLinhas.appendChild(tr);
    });
  }
  function destaca(linhas) {
    $$('tr.usada').forEach(function (tr) { tr.classList.remove('usada'); });
    (linhas || []).forEach(function (tr) { if (tr) tr.classList.add('usada'); });
    var primeira = (linhas || [])[0];
    if (primeira && primeira.closest('.pl-rolar')) { var r = primeira.closest('.pl-rolar'); r.scrollTop = primeira.offsetTop - 40; }
  }

  function novo() { return { id: (S ? S.id : 0) + 1, fase: 'ia', respostas: 0, ia: 0, ocupado: false, slot: null }; }

  /* ---------- custo ---------- */
  function poeCusto() {
    var r = S.respostas;
    elCusto.textContent = r + (r === 1 ? ' resposta' : ' respostas') + ' · Meta: grátis (dentro das 1.000 do mês) · IA: US$ ' + (S.ia * CUSTO_IA).toFixed(4).replace('.', ',');
  }

  /* ---------- entender a mensagem (no cliente real quem faz isso é a IA) ---------- */
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function servico(t) {
    var temCorte = /corte|cortar|cabelo/.test(t), temBarba = /barba/.test(t);
    if (/pigment/.test(t)) return 'pigment';
    if (/degrad|navalhad/.test(t)) return 'degrade';
    if (/infantil|crianca|filho|menino/.test(t)) return 'infantil';
    if (/sobrancelha/.test(t)) return 'sobrancelha';
    if (/pezinho/.test(t)) return 'pezinho';
    if ((temCorte && temBarba) || /completo|combo/.test(t)) return 'combo';
    if (temBarba) return 'barba';
    if (temCorte) return 'corte';
    return null;
  }
  function entende(msg) {
    var t = norm(msg);
    if (/poema|piada|futebol|\bjogo\b|receita|redacao|escrev|codigo|programa|politic|chatgpt|tradu|noticia|previsao do tempo/.test(t)) return { tipo: 'fora' };
    if (/(quais|quem sao|que|tem quantos) barbeiros/.test(t)) return { tipo: 'info', id: 'barbeiros' };
    if (/humano|atendente|pessoa|falar com|barbeiro|reclama|problema|gerente|dono/.test(t)) return { tipo: 'humano' };
    if (/tem horario|horario livre|horarios livres|vaga|marcar|agendar|agenda|disponivel|encaixe|amanha/.test(t)) return { tipo: 'agenda', tarde: /tarde/.test(t) };
    var sv = servico(t);
    if (/quanto|preco|valor|custa|r\$|precos/.test(t)) return sv ? { tipo: 'preco', id: sv } : { tipo: 'precos' };
    if (/atras/.test(t)) return { tipo: 'info', id: 'atraso' };
    if (/cancel|remarc|desmarc/.test(t)) return { tipo: 'info', id: 'cancelar' };
    if (/pix|cartao|credito|debito|pagamento|pagar|dinheiro/.test(t)) return { tipo: 'info', id: 'pagamento' };
    if (/endereco|onde fica|onde e|localiza|estaciona|como chego/.test(t)) return { tipo: 'info', id: 'endereco' };
    if (/abre|fecha|funciona|horario|domingo|segunda|sabado|feriado|que horas/.test(t)) return { tipo: 'info', id: 'horarios', sab: /sabado/.test(t), dom: /domingo|segunda/.test(t) };
    if (/clube|assinatura|plano|mensal/.test(t)) return { tipo: 'info', id: 'clube' };
    if (sv) return { tipo: 'preco', id: sv };
    if (/obrigad|valeu|show|beleza/.test(t)) return { tipo: 'obrigado' };
    if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai|opa)\b/.test(t)) return { tipo: 'oi' };
    return { tipo: 'naosei' };
  }

  /* ---------- respostas (sempre pela ficha) ---------- */
  function responde(r) {
    var x;
    switch (r.tipo) {
      case 'preco':
        x = f(r.id);
        return { txt: [x.item + ' sai por ' + real(x.preco) + ' e leva uns ' + x.min + ' minutos' + (r.id === 'combo' ? ', com toalha quente' : '') + '.', 'Quer que eu veja um horário para você?'],
          linhas: [x.tr], det: 'Usou da ficha: "' + x.item + '" (' + real(x.preco) + ').', botoes: [{ texto: 'Ver horários', acao: function () { roda('Tem horário amanhã?'); } }] };
      case 'precos':
        return { txt: ['Os principais: corte ' + real(f('corte').preco) + ', barba ' + real(f('barba').preco) + ', corte + barba ' + real(f('combo').preco) + ', degradê navalhado ' + real(f('degrade').preco) + '.', 'Quer o preço de outro serviço?'],
          linhas: [f('corte').tr, f('barba').tr, f('combo').tr, f('degrade').tr], det: 'Usou da ficha: 4 serviços e preços.' };
      case 'info':
        x = f(r.id);
        var txt;
        if (r.id === 'horarios') txt = r.sab ? ['Sábado abrimos das 8h às 18h, com último atendimento às 17h30.', 'Domingo e segunda ficamos fechados.'] : r.dom ? ['Domingo e segunda a barbearia fica fechada.', 'De terça a sexta, das 9h às 20h; sábado, das 8h às 18h.'] : ['Terça a sexta, das 9h às 20h; sábado, das 8h às 18h. Domingo e segunda, fechado.', 'O último atendimento é 30 minutos antes de fechar.'];
        else if (r.id === 'pagamento') txt = ['Aceitamos Pix, cartão de débito e de crédito.'];
        else if (r.id === 'endereco') txt = ['Fica na Rua Exemplo, 123, Praia do Canto, Vitória.', 'Tem estacionamento conveniado na rua de trás.'];
        else if (r.id === 'atraso') txt = ['A gente espera até 10 minutos. Depois disso, tenta encaixar no próximo horário livre do dia.'];
        else if (r.id === 'cancelar') txt = ['Pode cancelar ou remarcar por aqui mesmo, até 2 horas antes.'];
        else if (r.id === 'barbeiros') txt = ['Temos o Léo (degradê e navalhado), o Caio (barba e pigmentação) e o Rafa (tesoura e cabelo longo).'];
        else txt = ['O Clube Ofício custa R$ 149 por mês: cortes ilimitados de terça a quinta e uma barba com toalha quente por mês.'];
        return { txt: txt, linhas: [x.tr], det: 'Usou da ficha: "' + x.item + '".' };
      case 'fora':
        return { txt: ['Aqui eu só consigo ajudar com a Ofício: serviços, preços, horários e agendamento. 🙂', 'Quer ver os horários livres de amanhã?'], linhas: [],
          det: 'Fora do assunto: recusou com educação. O atendente só fala da barbearia.', botoes: [{ texto: 'Ver horários', acao: function () { roda('Tem horário amanhã?'); } }] };
      case 'obrigado':
        return { txt: ['Por nada! Qualquer coisa, é só chamar por aqui.'], linhas: [], det: 'Agradecimento: resposta curta.' };
      case 'oi':
        return { txt: ['Oi! Posso ajudar com serviços, preços, horários e agendamento. O que você precisa?'], linhas: [], det: 'Cumprimento: apresentou o que sabe fazer.' };
    }
    return null;
  }

  /* ---------- conversa ---------- */
  function trava(t) {
    chips.forEach(function (b) { b.disabled = t; }); texto.disabled = t; enviar.disabled = t; cFora.disabled = t;
  }
  function digitando() {
    var b = document.createElement('div'); b.className = 'bolha'; b.setAttribute('aria-hidden', 'true');
    b.innerHTML = '<span class="digitando"><i></i><i></i><i></i></span>';
    conv.appendChild(b); conv.scrollTop = conv.scrollHeight; return b;
  }
  function vivo(id) { return S.id === id; }
  function h() { return A.relogio.hora(); }

  function roda(msg) {
    if (S.ocupado || !msg) return;
    var id = S.id; S.ocupado = true; trava(true);
    A.relogio.avanca(1);
    A.bolha(conv, [msg], { dela: true, hora: h() });
    A.etapa(1, 'rodando', null, h()); A.novidade('aba-bas');
    var r = entende(msg), dig;
    A.espera(450).then(function () {
      if (!vivo(id)) return;
      A.etapa(1, 'feita', 'Mensagem do ' + CLIENTE + ': "' + (msg.length > 60 ? msg.slice(0, 58) + '…' : msg) + '"', h());
      if (S.fase === 'humano') {
        A.etapa(5, 'aviso', 'A conversa está com a equipe: a IA não responde mais aqui. O dono vê a mensagem no aplicativo.', h());
        A.bolha(convDono, [{ texto: CLIENTE + ' escreveu' }, '"' + msg + '"', 'A conversa está com você.'], { de: 'Atendimento Ofício', hora: h() });
        A.anuncia('A conversa está com a equipe. A IA não responde.');
        return 'fim';
      }
      A.etapa(2, 'rodando', null, h());
      return A.espera(450);
    }).then(function (fim) {
      if (fim === 'fim' || !vivo(id)) return fim;
      A.etapa(2, 'feita', 'Ficha (' + FICHA.length + ' itens) + as últimas mensagens do ' + CLIENTE + '.', h());
      A.etapa(3, 'rodando', null, h()); A.etapa(4, null, null, '');
      dig = digitando();
      return A.espera(cFalha.checked ? 1600 : 900);
    }).then(function (fim) {
      if (dig) dig.remove();
      if (fim === 'fim' || !vivo(id)) return;
      if (cFalha.checked) return foraDoAr();
      if (r.tipo === 'agenda') return horarios(r);
      if (r.tipo === 'humano' || r.tipo === 'naosei') return humano(r);
      var resp = responde(r);
      destaca(resp.linhas);
      var b = A.bolha(conv, resp.txt, { de: 'Ofício Barbearia', hora: h(), botoes: resp.botoes });
      S.respostas++; S.ia++; poeCusto();
      A.etapa(3, 'feita', resp.det, h());
      A.novidade('aba-cli');
      A.anuncia('Resposta enviada. ' + resp.det);
      return b;
    }).then(function () { S.ocupado = false; trava(false); });
  }

  function foraDoAr() {
    A.etapa(3, 'erro', 'A IA não respondeu (2 tentativas). Mandou a mensagem de reserva e avisou o dono e a EstudioHK.', h());
    A.bolha(conv, ['Recebemos sua mensagem! Já te respondemos por aqui.'], { de: 'Ofício Barbearia', hora: h() });
    S.respostas++; poeCusto();
    A.bolha(convDono, [{ texto: 'Atendimento automático fora do ar' }, CLIENTE + ' está esperando resposta no WhatsApp.'], { de: 'Atendimento Ofício', hora: h() });
    alertaTxt.textContent = 'A IA não respondeu às ' + h() + '. A mensagem de reserva saiu e o dono foi avisado. Nova tentativa automática a cada 5 minutos.';
    alerta.hidden = false;
    A.anuncia('IA fora do ar: mensagem de reserva enviada e o dono avisado.');
  }

  function humano(r) {
    var naosei = r.tipo === 'naosei';
    destaca([f('horarios').tr, f('telefone').tr]);
    A.etapa(3, 'feita', naosei ? 'Não está na ficha: em vez de chutar, chamou a equipe.' : 'Pedido de falar com uma pessoa: chamou a equipe.', h());
    A.etapa(5, 'rodando', null, h());
    A.bolha(conv, [naosei ? 'Essa eu não tenho aqui na ficha e prefiro não chutar.' : 'Claro!', 'Já avisei a equipe. Como a barbearia já fechou, um barbeiro te responde amanhã a partir das 9h.', 'Se for urgente, liga: (27) 0000-0000.'], { de: 'Ofício Barbearia', hora: h() });
    S.respostas++; S.ia++; poeCusto();
    A.bolha(convDono, [{ texto: CLIENTE + ' quer falar com uma pessoa' }, 'Última mensagem no WhatsApp da barbearia.', 'A IA parou nesta conversa: é só responder pelo aplicativo.'], { de: 'Atendimento Ofício', hora: h() });
    S.fase = 'humano';
    A.etapa(5, 'feita', 'A equipe foi avisada. A partir daqui a IA não responde a este cliente; o dono continua pelo aplicativo WhatsApp Business.', h());
    A.novidade('aba-cli');
    A.anuncia('A conversa foi passada para a equipe. A IA parou.');
  }

  function horarios(r) {
    var livres = AGENDA.filter(function (x) { return x.livre && (!r.tarde || x.h >= '12:00'); });
    destaca(livres.map(function (x) { return x.tr; }));
    A.etapa(3, 'feita', 'Pediu a ferramenta "ver horários livres".', h());
    A.etapa(4, 'rodando', 'Consultou a agenda de amanhã: ' + livres.length + ' horários livres' + (r.tarde ? ' à tarde.' : '.'), h());
    var b = A.bolha(conv, ['Amanhã (quarta)' + (r.tarde ? ' à tarde' : '') + ' tenho: ' + livres.map(function (x) { return x.h.replace(':00', 'h').replace(':30', 'h30') + ' com o ' + x.b; }).join(', ') + '.', 'Qual fica melhor?'],
      { de: 'Ofício Barbearia', hora: h(), botoes: livres.map(function (x) { return { texto: x.h.replace(':00', 'h').replace(':30', 'h30') + ' · ' + x.b, acao: function (bt) { escolheHora(x, bt, b); } }; }) });
    S.respostas++; S.ia++; poeCusto();
    A.anuncia('A IA mostrou os horários livres de amanhã.');
  }
  function escolheHora(x, bt, bolhaOpcoes) {
    if (S.ocupado || !x.livre || S.fase === 'humano') return;
    $$('.bt', bolhaOpcoes).forEach(function (b) { b.disabled = true; }); bt.classList.add('escolhida');
    S.ocupado = true; trava(true); var id = S.id;
    var rot = x.h.replace(':00', 'h').replace(':30', 'h30');
    A.bolha(conv, [rot + ' · ' + x.b], { dela: true, hora: h() });
    A.espera(800).then(function () {
      if (!vivo(id)) return;
      var b = A.bolha(conv, ['Fechado, ' + rot + ' com o ' + x.b + '. Qual serviço?'], { de: 'Ofício Barbearia', hora: h(),
        botoes: ['corte', 'barba', 'combo'].map(function (s) { var sv = f(s); return { texto: sv.item, acao: function (bt2) { marca(x, sv, bt2, b); } }; }) });
      S.respostas++; S.ia++; poeCusto();
      S.ocupado = false; trava(false);
    });
  }
  function marca(x, sv, bt, bolhaOpcoes) {
    if (S.ocupado || !x.livre || S.fase === 'humano') return;
    $$('.bt', bolhaOpcoes).forEach(function (b) { b.disabled = true; }); bt.classList.add('escolhida');
    S.ocupado = true; trava(true); var id = S.id;
    var rot = x.h.replace(':00', 'h').replace(':30', 'h30');
    A.bolha(conv, [sv.item], { dela: true, hora: h() });
    A.espera(900).then(function () {
      if (!vivo(id)) return;
      x.livre = false; x.tr.classList.add('marcado');
      x.td.textContent = ''; var s = document.createElement('span'); s.className = 'stt novo'; s.textContent = CLIENTE + ' · ' + sv.item; x.td.appendChild(s);
      destaca([x.tr, sv.tr]);
      A.bolha(conv, ['Marcado! Quarta, ' + rot + ', com o ' + x.b + ': ' + sv.nome + ' (' + real(sv.preco) + ', ' + sv.min + ' min).', 'Endereço: Rua Exemplo, 123, Praia do Canto.', 'Se precisar remarcar, é só falar aqui até 2 horas antes.'], { de: 'Ofício Barbearia', hora: h() });
      S.respostas++; S.ia++; poeCusto();
      A.bolha(convDono, [{ texto: 'Novo horário marcado pelo atendimento' }, 'qua, ' + rot + ' · ' + x.b + ' · ' + sv.nome + ' · ' + CLIENTE], { de: 'Atendimento Ofício', hora: h() });
      A.etapa(4, 'feita', 'Marcou na agenda: qua, ' + rot + ', ' + x.b + ', ' + sv.nome + '. O barbeiro recebeu o aviso.', h());
      A.novidade('aba-bas');
      A.anuncia('Horário marcado na agenda e o barbeiro avisado.');
      S.ocupado = false; trava(false);
    });
  }

  /* ---------- controles ---------- */
  chips.forEach(function (b) { b.addEventListener('click', function () { roda(b.dataset.msg); }); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = texto.value.trim(); if (!v) return; texto.value = ''; roda(v); });
  cFora.addEventListener('click', function () { A.mostra('aba-cli'); roda('Me escreve um poema sobre futebol?'); });
  cPreco.addEventListener('click', function () {
    var c = f('combo'), editado = c.preco === 95;
    c.preco = editado ? 100 : 95; pintaCombo(editado);
    cPreco.setAttribute('aria-pressed', editado ? 'true' : 'false');
    destaca([c.tr]);
    A.anuncia('Na ficha, corte + barba agora custa ' + real(c.preco) + '. Pergunte o preço de novo.');
  });
  cRecomecar.addEventListener('click', function () {
    S = novo(); f('combo').preco = 95;
    montaFicha(); montaAgenda();
    $$('.bolha', conv).slice(1).forEach(function (b) { b.remove(); });
    A.limpaConversa(convDono); alerta.hidden = true; cFalha.checked = false; cPreco.setAttribute('aria-pressed', 'false');
    A.zeraEtapas(); A.relogio.zera('ter'); poeCusto(); trava(false);
    A.mostra('aba-cli');
    A.anuncia('Simulação recomeçada.');
  });
  S = novo(); montaFicha(); montaAgenda(); poeCusto();

  /* ---------- conta de custos ---------- */
  var kc = $('#k-conversas'), kr = $('#k-resp');
  if (kc && kr) {
    var conta = function () {
      var c = +kc.value, r = +kr.value, total = c * r, extra = Math.max(0, total - 1000);
      var son = ($('input[name=modelo]:checked') || {}).value === 'sonnet', ia = total * (son ? 0.01 : CUSTO_IA);
      $('#k-o-conversas').textContent = c.toLocaleString('pt-BR'); $('#k-o-resp').textContent = r;
      $('#k-total').textContent = A.reais(extra * 0.035) + ' + US$ ' + ia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      $('#k-detalhe').textContent = 'Meta: ' + total.toLocaleString('pt-BR') + ' respostas' + (extra ? ', ' + extra.toLocaleString('pt-BR') + ' acima das 1.000 grátis × R$ 0,035' : ', dentro das 1.000 grátis') + ' · IA: ' + total.toLocaleString('pt-BR') + ' × US$ ' + (son ? '0,01' : '0,0005');
      A.faixa(kc); A.faixa(kr);
    };
    kc.addEventListener('input', conta); kr.addEventListener('input', conta);
    $$('input[name=modelo]').forEach(function (i) { i.addEventListener('change', conta); });
    conta();
  }
})();
