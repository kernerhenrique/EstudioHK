/* Roteiro da demo "Escritório sem papelada" (Prates & Arruda Advogados, fictício). Usa window.Auto (../assets/auto.js).
   Cadastro → contrato e procuração preenchidos nos modelos do escritório → pasta no Drive + OK do advogado →
   link de assinatura no WhatsApp → assinatura → pede os documentos um por vez e lembra a cada 2 dias úteis.
   "Simular ferramenta de assinatura fora do ar": falha, avisa e tenta de novo 15 min depois. Sem IA. Nada é enviado. */
(function () {
  'use strict';
  var A = window.Auto; if (!A) return;
  var $ = A.$, $$ = A.$$;
  var INICIO = 10 * 60 + 10, DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
  A.relogio.inicia(INICIO, 'ter');

  var ESCRITORIO = 'Prates & Arruda Advogados, Av. Exemplo, 1000, sala 1201, Enseada do Suá, Vitória/ES';
  var AREAS = {
    trabalhista: { nome: 'Direito do Trabalho', curta: 'Trabalhista', adv: 'Dr. Rafael Prates', advNome: 'Rafael Prates', tit: 'advogado',
      docs: [['RG ou CNH', 'uma foto da frente e do verso'], ['Comprovante de residência', 'conta de luz, água ou telefone dos últimos 3 meses'], ['Carteira de trabalho (CTPS)', 'a página da foto e a do contrato, ou o PDF da Carteira Digital']] },
    familia: { nome: 'Família e Sucessões', curta: 'Família', adv: 'Dra. Helena Duarte', advNome: 'Helena Duarte', tit: 'advogada',
      docs: [['RG ou CNH', 'uma foto da frente e do verso'], ['Comprovante de residência', 'conta de luz, água ou telefone dos últimos 3 meses'], ['Certidão de casamento ou de nascimento', 'foto ou PDF da certidão']] },
    empresarial: { nome: 'Direito Empresarial', curta: 'Empresarial', adv: 'Dra. Beatriz Arruda', advNome: 'Beatriz Arruda', tit: 'advogada',
      docs: [['RG ou CNH do sócio', 'uma foto da frente e do verso'], ['Contrato social', 'com as alterações registradas, em PDF'], ['Cartão CNPJ', 'o comprovante de inscrição, em PDF']] }
  };
  var EXEMPLO = { nome: 'Ana Lúcia Ferreira', cpf: '123.456.789-09', civil: 'solteiro(a)', prof: 'auxiliar administrativa',
    end: 'Rua das Palmeiras, 120, ap. 302, Jardim da Penha, Vitória/ES', email: 'ana@exemplo.com', zap: '(27) 90000-0000',
    emp: 'Ferreira Comércio de Alimentos Ltda.', cnpj: '12.345.678/0001-95',
    assunto: { trabalhista: 'Rescisão sem pagamento das verbas', familia: 'Revisão de pensão alimentícia', empresarial: 'Revisão do contrato social' } };
  var NUM = '2026-014';

  var form = $('#pa-form'), erro = $('#pa-erro'), site = $('#pa-site'), ok = $('#pa-ok'), papel = $('#pa-papel'), btAprovar = $('#pa-aprovar');
  var chat = $('#pa-chat'), conv = $('#conv-cli'), compor = $('#pa-compor'), chips = $('#pa-chips');
  var assina = $('#pa-assina'), prev = $('#pa-as-prev'), li = $('#pa-li'), asErro = $('#pa-as-erro'), btAssinar = $('#pa-assinar');
  var notif = $('#notif-cli'), notifTxt = $('#notif-cli-txt'), sub = $('#lado-cli-sub');
  var convEq = $('#conv-equipe'), eqQuem = $('#eq-quem'), arv = $('#drive-arv'), driveVazio = $('#drive-vazio');
  var docVazio = $('#doc-vazio'), docAbas = $('#doc-abas'), docLeg = $('#doc-leg'), pagC = $('#doc-contrato'), pagP = $('#doc-proc');
  var cPular = $('#c-pular'), cRecomecar = $('#c-recomecar'), cFalha = $('#c-falha'), alerta = $('#alerta-hk'), alertaTxt = $('#alerta-txt'), custo = $('#custo');
  var campo = function (id) { return $('#pa-' + id); };
  var S;
  function novoEstado(id) { return { id: id || 0, fase: 'cadastro', abs: INICIO, dia: 1, janCli: -1e9, janEq: -1e9, pagas: 0, gratis: 0, franquia: 0, lembretes: 0, faltam: [], falhou: false }; }
  S = novoEstado();

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function h() { return A.relogio.hora(); }
  function vivo(id) { return S.id === id; }
  function primeiro(n) { return n.split(' ')[0]; }
  function passa(min, dia) { S.abs += min; return A.relogio.avanca(min, dia); }
  function lista(xs) { return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' e ' + xs[xs.length - 1]; }

  /* ---------- custo: mensagem iniciada pelo escritório fora da janela de 24h é paga ---------- */
  function cobra(quem) {
    var jan = quem === 'cli' ? S.janCli : S.janEq;
    if (S.abs - jan > 1440) S.pagas++; else S.gratis++;
    poeCusto();
  }
  function poeCusto() {
    custo.textContent = 'Meta ' + A.reais(S.pagas * 0.035, 3) + ' (' + S.pagas + (S.pagas === 1 ? ' paga' : ' pagas') + (S.gratis ? ', ' + S.gratis + ' grátis' : '') + ') · assinatura: ' + S.franquia + ' documentos da franquia · sem IA';
  }

  /* ---------- formulário ---------- */
  function area() { var r = $('input[name=area]:checked', form); return r ? r.value : ''; }
  $$('input[name=area]', form).forEach(function (r) { r.addEventListener('change', function () { $('#pa-empresa').hidden = area() !== 'empresarial'; }); });
  $('#pa-exemplo').addEventListener('click', function () {
    var a = area() || 'trabalhista';
    $('input[name=area][value="' + a + '"]', form).checked = true; $('#pa-empresa').hidden = a !== 'empresarial';
    ['nome', 'cpf', 'civil', 'prof', 'end', 'email', 'zap', 'emp', 'cnpj'].forEach(function (k) { campo(k).value = EXEMPLO[k]; });
    campo('assunto').value = EXEMPLO.assunto[a];
    $('#pa-aceite').checked = true; erro.textContent = '';
  });
  var dig = function (v) { return v.replace(/\D/g, ''); };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (S.fase !== 'cadastro') return;
    var a = area(), v = function (k) { return campo(k).value.trim(); }, falta = [];
    if (!a) falta.push('a área');
    if (v('nome').split(/\s+/).length < 2) falta.push('o nome completo');
    if (dig(v('cpf')).length !== 11) falta.push('o CPF (11 números)');
    if (!v('civil')) falta.push('o estado civil');
    if (!v('prof')) falta.push('a profissão');
    if (v('end').length < 10) falta.push('o endereço completo');
    if (a === 'empresarial' && !v('emp')) falta.push('o nome da empresa');
    if (a === 'empresarial' && dig(v('cnpj')).length !== 14) falta.push('o CNPJ (14 números)');
    if (!v('assunto')) falta.push('o assunto');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('email'))) falta.push('um e-mail válido');
    if (dig(v('zap')).length < 10) falta.push('o WhatsApp com DDD');
    if (falta.length) { erro.textContent = 'Falta preencher: ' + lista(falta) + '.'; return; }
    if (!$('#pa-aceite').checked) { erro.textContent = 'Para continuar, marque a autorização de uso dos dados.'; return; }
    erro.textContent = '';
    S.d = { area: a, A: AREAS[a], nome: v('nome'), cpf: v('cpf'), civil: v('civil'), prof: v('prof'), end: v('end'), email: v('email'), zap: v('zap'), emp: v('emp'), cnpj: v('cnpj'), assunto: v('assunto') };
    S.faltam = S.d.A.docs.slice();
    recebe();
  });

  /* ---------- documentos preenchidos ---------- */
  // partes: textos e { m: 'campo preenchido' }
  function para(partes, cls) {
    var p = el('p', cls);
    partes.forEach(function (x) { if (typeof x === 'string') p.appendChild(document.createTextNode(x)); else p.appendChild(el('mark', null, x.m)); });
    return p;
  }
  function qualif(d, papelTxt) {
    if (d.area === 'empresarial') return [papelTxt, { m: d.emp }, ', CNPJ ', { m: d.cnpj }, ', representada por ', { m: d.nome }, ', ', { m: d.prof }, ', CPF ', { m: d.cpf }, ', com endereço em ', { m: d.end }, '.'];
    return [papelTxt, { m: d.nome }, ', ', { m: d.civil }, ', ', { m: d.prof }, ', CPF ', { m: d.cpf }, ', residente em ', { m: d.end }, ', e-mail ', { m: d.email }, '.'];
  }
  function contrato(d) {
    var f = document.createDocumentFragment();
    f.appendChild(el('h4', null, 'Contrato de prestação de serviços advocatícios'));
    f.appendChild(para(qualif(d, 'CONTRATANTE: ')));
    f.appendChild(para(['CONTRATADA: ' + ESCRITORIO + '.']));
    f.appendChild(para(['1. Objeto: atuação em ', { m: d.A.nome }, ', no assunto: ', { m: d.assunto }, '.']));
    f.appendChild(para(['2. Honorários: os combinados na consulta, descritos no Anexo I, que o advogado confere antes do envio.']));
    f.appendChild(para(['3. Responsável: ', { m: d.A.adv + ', OAB/ES 00.000' }, '.']));
    f.appendChild(para(['Vitória/ES, na data da assinatura eletrônica.'], 'doc-fim'));
    return f;
  }
  function procuracao(d) {
    var f = document.createDocumentFragment();
    f.appendChild(el('h4', null, 'Procuração'));
    f.appendChild(para(qualif(d, 'OUTORGANTE: ')));
    f.appendChild(para(['OUTORGADO: ', { m: d.A.advNome }, ', ' + d.A.tit + ', OAB/ES 00.000, de ' + ESCRITORIO + '.']));
    f.appendChild(para(['PODERES: os da cláusula ad judicia, para o foro em geral, para atuar em ', { m: d.A.nome }, ', no assunto: ', { m: d.assunto }, '. Poderes especiais só entram se o advogado incluir, em cláusula própria.']));
    f.appendChild(para(['Vitória/ES, na data da assinatura eletrônica.'], 'doc-fim'));
    return f;
  }
  function mostraDocs(d) {
    pagC.textContent = ''; pagP.textContent = '';
    pagC.appendChild(contrato(d)); pagP.appendChild(procuracao(d));
    docVazio.hidden = true; docAbas.hidden = false; docLeg.hidden = false;
    abaDoc('doc-t-contrato');
  }
  var tabsDoc = $$('[role=tab]', docAbas);
  function abaDoc(id, foco) {
    tabsDoc.forEach(function (t) {
      var sel = t.id === id; t.setAttribute('aria-selected', sel ? 'true' : 'false'); t.tabIndex = sel ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !sel;
      if (sel && foco) t.focus();
    });
  }
  tabsDoc.forEach(function (t, i) {
    t.addEventListener('click', function () { abaDoc(t.id); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); abaDoc(tabsDoc[(i + 1) % tabsDoc.length].id, true);
    });
  });

  /* ---------- pasta no Drive ---------- */
  function item(k, nome, nivel, ic, st, cls, escondido) {
    var l = el('li', cls); l.dataset.k = k; l.style.setProperty('--n', nivel); if (escondido) l.hidden = true;
    l.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#' + ic + '"/></svg>';
    l.appendChild(el('span', 'nm', nome)); l.appendChild(el('span', 'stt ' + st[1], st[0]));
    arv.appendChild(l);
  }
  function montaPasta(d) {
    arv.textContent = '';
    item('pasta', NUM + ' · ' + d.nome + ' · ' + d.A.curta, 0, 'i-pasta', ['em andamento', 'novo'], 'pasta nova');
    item('contrato', '01 Contrato de honorários.pdf', 1, 'i-doc', ['rascunho', 'env'], 'nova');
    item('proc', '02 Procuração.pdf', 1, 'i-doc', ['rascunho', 'env'], 'nova');
    item('registro', '03 Registro das assinaturas.pdf', 1, 'i-doc', ['da ferramenta', 'ok'], '', true);
    item('docs', '04 Documentos do cliente', 1, 'i-pasta', ['0 de ' + d.A.docs.length, 'sem'], 'pasta nova');
    d.A.docs.forEach(function (x, i) { item('d' + i, '04-' + (i + 1) + ' ' + x[0], 2, 'i-foto', ['falta', 'sem'], 'nova'); });
    driveVazio.hidden = true; arv.hidden = false;
  }
  function st(k, txt, cls, nome) {
    var l = $('li[data-k="' + k + '"]', arv); if (!l) return;
    var s = $('.stt', l); s.textContent = txt; s.className = 'stt ' + cls;
    if (nome) $('.nm', l).textContent = nome;
    l.hidden = false; l.classList.remove('nova'); void l.offsetWidth; l.classList.add('nova');
  }

  /* ---------- 1 a 3: recebe, preenche, cria a pasta e pede o OK ---------- */
  var btEqAprovar = null;
  function recebe() {
    var id = ++S.id, d = S.d; S.fase = 'rodando';
    form.hidden = true; ok.hidden = false; papel.hidden = true; $('#pa-ok-t').focus();
    $('#pa-ok-sub').textContent = 'O ' + (d.A.tit === 'advogado' ? 'advogado' : 'a advogada') + ' confere o contrato e a procuração e eles chegam no seu WhatsApp para assinar.';
    cFalha.disabled = false;
    A.novidade('aba-bas');
    passa(2).then(function () {
      if (!vivo(id)) return;
      A.etapa(1, 'feita', 'Cadastro de ' + d.nome + ' (' + d.A.curta + ') recebido.', h());
      A.etapa(2, 'rodando', null, h());
      return A.espera(800);
    }).then(function () {
      if (!vivo(id)) return;
      mostraDocs(d);
      A.etapa(2, 'feita', 'Contrato e procuração preenchidos com os dados do cadastro, nos modelos do escritório, e salvos em PDF.', h());
      A.etapa(3, 'rodando', null, h());
      return A.espera(700);
    }).then(function () {
      if (!vivo(id)) return;
      montaPasta(d);
      eqQuem.textContent = 'WhatsApp ' + (d.A.tit === 'advogado' ? 'do ' : 'da ') + d.A.adv;
      cobra('eq');
      var b = A.bolha(convEq, [
        { texto: 'Cliente novo: ' + d.nome + ' · ' + d.A.curta },
        'Contrato e procuração prontos na pasta ' + NUM + '.',
        'Confira e aprove o envio para assinatura.'
      ], { de: 'Automação P&A', hora: h(), botoes: [{ texto: 'Aprovar e enviar', destaque: true, acao: aprova }] });
      btEqAprovar = $('.bt', b);
      A.etapa(3, 'espera', 'Pasta ' + NUM + ' criada. Esperando o OK ' + (d.A.tit === 'advogado' ? 'do ' : 'da ') + d.A.adv + '.', h());
      papel.hidden = false; btAprovar.disabled = false;
      S.fase = 'aprovar';
      A.anuncia('Contrato e procuração preenchidos. Esperando o OK do advogado.');
    });
  }

  /* ---------- 4: aprova e envia para assinatura ---------- */
  function aprova() {
    if (S.fase !== 'aprovar') return;
    var id = S.id, d = S.d, falha = cFalha.checked; S.fase = 'rodando';
    btAprovar.disabled = true; if (btEqAprovar) { btEqAprovar.disabled = true; btEqAprovar.classList.add('escolhida'); }
    cFalha.disabled = true;
    A.bolha(convEq, ['Aprovado.'], { dela: true, hora: h() });
    S.janEq = S.abs;
    passa(3).then(function () {
      if (!vivo(id)) return;
      A.etapa(3, 'feita', 'Aprovado por ' + d.A.adv + ' às ' + h() + '.', h());
      st('contrato', 'aprovado', 'novo'); st('proc', 'aprovado', 'novo');
      A.etapa(4, 'rodando', null, h());
      return A.espera(800);
    }).then(function () {
      if (!vivo(id)) return;
      if (!falha) return enviaAssinatura(id, false);
      S.falhou = true;
      A.etapa(4, 'erro', 'A ferramenta de assinatura não respondeu (3 tentativas). Os PDFs estão salvos na pasta. Nova tentativa em 15 minutos.', h());
      alertaTxt.textContent = 'Ferramenta de assinatura fora do ar às ' + h() + '. Envio de ' + d.nome + ' (' + NUM + ') em espera; nova tentativa automática em 15 min.';
      alerta.hidden = false;
      cobra('eq');
      A.bolha(convEq, ['A ferramenta de assinatura está fora do ar. Os documentos de ' + primeiro(d.nome) + ' estão na pasta e a automação tenta de novo em 15 minutos. Você não precisa fazer nada.'], { de: 'Automação P&A', hora: h() });
      A.anuncia('A ferramenta de assinatura está fora do ar. Nova tentativa em 15 minutos.');
      return A.espera(1800).then(function () { if (vivo(id)) return passa(15); }).then(function () {
        if (!vivo(id)) return;
        A.etapa(4, 'rodando', 'Tentando de novo…', h());
        return A.espera(700);
      }).then(function () { if (vivo(id)) return enviaAssinatura(id, true); });
    });
  }
  function enviaAssinatura(id, segunda) {
    var d = S.d;
    S.franquia = 2; poeCusto();
    st('contrato', 'para assinar', 'sem'); st('proc', 'para assinar', 'sem');
    if (segunda) { alerta.hidden = true; }
    A.etapa(4, 'espera', 'Enviado para ' + primeiro(d.nome) + ' às ' + h() + (segunda ? ', na nova tentativa' : '') + '. Esperando a assinatura.', h());
    notifTxt.textContent = 'Seu contrato e sua procuração estão prontos para assinar.';
    notif.hidden = false;
    A.novidade('aba-cli');
    return A.espera(1300).then(function () {
      if (!vivo(id)) return;
      notif.hidden = true; site.hidden = true; chat.hidden = false; sub.textContent = 'no WhatsApp, pelo celular';
      cobra('cli');
      A.bolha(conv, [
        'Olá, ' + primeiro(d.nome) + '! Aqui é do escritório Prates & Arruda.',
        (d.A.tit === 'advogado' ? 'O ' : 'A ') + d.A.adv + ' conferiu seu contrato de honorários e sua procuração. Eles estão prontos para você assinar pelo celular.'
      ], { de: 'Prates & Arruda', hora: h(), botoes: [{ texto: 'Ver e assinar', destaque: true, acao: abreAssinatura }] });
      S.fase = 'assinar';
      A.anuncia('Documentos enviados para assinatura no WhatsApp do cliente.');
    });
  }

  /* ---------- ferramenta de assinatura ---------- */
  function abreAssinatura(bt) {
    if (S.fase !== 'assinar') return;
    S.btVer = bt;
    prev.textContent = ''; prev.appendChild(procuracao(S.d));
    li.checked = false; asErro.textContent = '';
    assina.hidden = false;
    var t = $('#pa-assina-t'); t.tabIndex = -1; t.focus();
  }
  btAssinar.addEventListener('click', function () {
    if (S.fase !== 'assinar') return;
    if (!li.checked) { asErro.textContent = 'Marque que leu os documentos para assinar.'; return; }
    var id = S.id, d = S.d; S.fase = 'rodando';
    assina.hidden = true;
    if (S.btVer) { S.btVer.disabled = true; S.btVer.textContent = 'Assinado'; }
    A.novidade('aba-bas');
    passa(16).then(function () {
      if (!vivo(id)) return;
      st('contrato', 'assinado', 'ok', '01 Contrato de honorários (assinado).pdf');
      st('proc', 'assinado', 'ok', '02 Procuração (assinada).pdf');
      st('registro', 'da ferramenta', 'ok');
      A.etapa(4, 'feita', primeiro(d.nome) + ' assinou às ' + h() + '. Os PDFs assinados e o registro das assinaturas foram para a pasta.', h());
      cobra('eq');
      A.bolha(convEq, [d.nome + ' assinou o contrato e a procuração (' + h() + ').'], { de: 'Automação P&A', hora: h() });
      A.etapa(5, 'rodando', null, h());
      return A.espera(700);
    }).then(function () {
      if (!vivo(id)) return;
      cobra('cli');
      var b = A.bolha(conv, [
        'Obrigado, ' + primeiro(d.nome) + '! Contrato e procuração assinados.',
        'Para começar, precisamos de ' + d.A.docs.length + ' documentos:'
      ], { de: 'Prates & Arruda', hora: h() });
      var ul = el('ul'); d.A.docs.forEach(function (x) { ul.appendChild(el('li', null, x[0])); });
      b.insertBefore(ul, $('.hora', b));
      b.insertBefore(el('span', 'bl', 'Pode mandar foto aqui mesmo, um de cada vez. Comece por: ' + S.faltam[0][0] + ' (' + S.faltam[0][1] + ').'), $('.hora', b));
      poeChips();
      st('docs', '0 de ' + d.A.docs.length, 'sem');
      S.fase = 'docs'; cPular.disabled = false;
      A.etapa(5, 'espera', 'Pediu ' + d.A.docs.length + ' documentos. Recebidos: 0 de ' + d.A.docs.length + '.', h());
      A.anuncia('Assinatura concluída. A automação pediu os documentos.');
    });
  });

  /* ---------- 5: documentos, um por vez, e lembretes ---------- */
  function pedeProximo() {
    var x = S.faltam[0];
    cobra('cli');
    A.bolha(conv, ['Agora mande: ' + x[0] + ' (' + x[1] + ').'], { de: 'Prates & Arruda', hora: h() });
    poeChips();
  }
  function poeChips() {
    chips.textContent = '';
    if (S.fase === 'fim' || !S.faltam.length) { compor.hidden = true; return; }
    var b1 = el('button', 'prin'); b1.type = 'button';
    b1.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-foto"/></svg>';
    b1.appendChild(document.createTextNode('Enviar foto: ' + S.faltam[0][0]));
    b1.addEventListener('click', enviaFoto); chips.appendChild(b1);
    if (S.lembretes < 2) {
      var b2 = el('button'); b2.type = 'button';
      b2.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-skip"/></svg>';
      b2.appendChild(document.createTextNode('Não mandar e pular 2 dias úteis'));
      b2.addEventListener('click', pula); chips.appendChild(b2);
    }
    compor.hidden = false;
  }
  function travaChips(t) { $$('button', chips).forEach(function (b) { b.disabled = t; }); cPular.disabled = t || S.lembretes >= 2; }
  function enviaFoto() {
    if (S.fase !== 'docs') return;
    var id = S.id, d = S.d, x = S.faltam.shift(), i = d.A.docs.indexOf(x), n = d.A.docs.length - S.faltam.length;
    S.fase = 'rodando'; travaChips(true);
    var b = A.bolha(conv, [], { dela: true, hora: h() });
    var f = el('span', 'foto'); f.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-foto"/></svg>'; f.appendChild(el('span', null, x[0] + ' (fictício)'));
    b.insertBefore(f, b.firstChild);
    S.janCli = S.abs;
    A.novidade('aba-bas');
    passa(2).then(function () {
      if (!vivo(id)) return;
      st('d' + i, 'recebido', 'ok', '04-' + (i + 1) + ' ' + x[0] + '.jpg');
      st('docs', n + ' de ' + d.A.docs.length, n === d.A.docs.length ? 'ok' : 'sem');
      return A.espera(500);
    }).then(function () {
      if (!vivo(id)) return;
      if (!S.faltam.length) return completo(id);
      cobra('cli');
      A.bolha(conv, ['Recebido: ' + x[0] + '.'], { de: 'Prates & Arruda', hora: h() });
      S.fase = 'docs';
      pedeProximo();
      A.etapa(5, S.lembretes >= 2 ? 'aviso' : 'espera', 'Recebidos: ' + n + ' de ' + d.A.docs.length + '. Falta: ' + lista(S.faltam.map(function (y) { return y[0]; })) + '.', h());
      travaChips(false);
    });
  }
  function completo(id) {
    var d = S.d;
    S.fase = 'fim'; compor.hidden = true; cPular.disabled = true;
    cobra('cli');
    A.bolha(conv, ['Recebemos todos os documentos, ' + primeiro(d.nome) + '. Obrigado!', (d.A.tit === 'advogado' ? 'O ' : 'A ') + d.A.adv + ' já pode começar e fala com você por aqui.'], { de: 'Prates & Arruda', hora: h() });
    cobra('eq');
    A.bolha(convEq, [{ texto: 'Pasta ' + NUM + ' completa' }, 'Contrato e procuração assinados e os ' + d.A.docs.length + ' documentos de ' + primeiro(d.nome) + '. Pode começar.'], { de: 'Automação P&A', hora: h() });
    st('pasta', 'completa', 'ok');
    A.etapa(5, 'feita', 'Todos os documentos chegaram' + (S.lembretes ? ', depois de ' + S.lembretes + (S.lembretes === 1 ? ' lembrete' : ' lembretes') : '') + '. Pasta completa e advogado avisado.', h());
    A.novidade('aba-bas');
    A.anuncia('Pasta completa. O advogado foi avisado.');
  }
  function pula() {
    if (S.fase !== 'docs' || S.lembretes >= 2) return;
    var id = S.id, d = S.d, k = 0, dia = S.dia;
    while (k < 2) { dia = (dia + 1) % 7; if (dia < 5) k++; }
    var dias = (dia - S.dia + 7) % 7, agora = A.relogio.agora();
    var min = dias * 1440 - agora + 600;
    S.dia = dia; S.fase = 'rodando'; S.lembretes++; travaChips(true);
    passa(min, DIAS[dia]).then(function () {
      if (!vivo(id)) return;
      var nomes = S.faltam.map(function (y) { return y[0]; });
      cobra('cli');
      A.bolha(conv, ['Oi, ' + primeiro(d.nome) + '! Para o escritório começar, ' + (nomes.length > 1 ? 'ainda faltam: ' : 'ainda falta: ') + lista(nomes) + '.', 'Pode mandar foto aqui mesmo, quando puder.'], { de: 'Prates & Arruda', hora: h() });
      A.novidade('aba-cli');
      if (S.lembretes >= 2) {
        cobra('eq');
        A.bolha(convEq, [d.nome + ' ainda não mandou: ' + lista(nomes) + '.', 'Já foram 2 lembretes. A automação parou de cobrar; talvez valha uma ligação.'], { de: 'Automação P&A', hora: h() });
        A.etapa(5, 'aviso', '2º lembrete enviado (' + DIAS[dia] + ', ' + h() + '). A automação para de cobrar e avisa o advogado. Falta: ' + lista(nomes) + '.', h());
        A.novidade('aba-bas');
      } else {
        A.etapa(5, 'espera', 'Lembrete enviado (' + DIAS[dia] + ', ' + h() + '). Falta: ' + lista(nomes) + '.', h());
      }
      S.fase = 'docs'; poeChips(); travaChips(false);
      A.anuncia('Dois dias úteis depois: lembrete enviado ao cliente.');
    });
  }
  cPular.addEventListener('click', pula);
  btAprovar.addEventListener('click', aprova);

  /* ---------- recomeçar ---------- */
  cRecomecar.addEventListener('click', function () {
    S = novoEstado(S.id + 1);
    form.reset(); form.hidden = false; ok.hidden = true; papel.hidden = true; erro.textContent = ''; $('#pa-empresa').hidden = true;
    site.hidden = false; site.scrollTop = 0; chat.hidden = true; assina.hidden = true; notif.hidden = true; compor.hidden = true; chips.textContent = '';
    sub.textContent = 'no link do cadastro, pelo celular';
    A.limpaConversa(conv); A.limpaConversa(convEq); eqQuem.textContent = 'WhatsApp do advogado'; btEqAprovar = null;
    pagC.textContent = ''; pagP.textContent = ''; pagC.hidden = true; pagP.hidden = true; docAbas.hidden = true; docLeg.hidden = true; docVazio.hidden = false;
    arv.textContent = ''; arv.hidden = true; driveVazio.hidden = false;
    alerta.hidden = true; cFalha.disabled = false; cPular.disabled = true;
    A.zeraEtapas(); A.relogio.zera('ter'); poeCusto();
    A.mostra('aba-cli');
    A.anuncia('Simulação recomeçada.');
  });
  poeCusto();

  /* ---------- conta ---------- */
  var kc = $('#k-clientes');
  if (kc) {
    var PLANOS = [[20, 69.90], [80, 119.90], [200, 259.90]];
    var conta = function () {
      var c = +kc.value, docs = c * 2, meta = c * 4 * 0.035, p = PLANOS.filter(function (x) { return docs <= x[0]; })[0];
      $('#k-o-clientes').textContent = c;
      if (p) {
        $('#k-total').textContent = A.reais(p[1] + meta);
        $('#k-detalhe').textContent = 'Assinatura ' + A.reais(p[1]) + ' (até ' + p[0] + ' documentos) + Meta ' + A.reais(meta);
      } else {
        $('#k-total').textContent = 'Sob consulta';
        $('#k-detalhe').textContent = docs + ' documentos por mês: plano Enterprise da ZapSign, a partir de R$ 500 + Meta ' + A.reais(meta);
      }
      A.faixa(kc);
    };
    kc.addEventListener('input', conta); conta();
  }
})();
