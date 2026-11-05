/* Clínica Lumar · demonstração da EstudioHK. Sem dependências. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;
  function rolarAte(sel) { var el = $(sel); if (el) el.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' }); }
  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9+]/g, ''); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function svg(id, cls) { var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'ico' + (cls ? ' ' + cls : '')); s.setAttribute('aria-hidden', 'true'); var u = document.createElementNS('http://www.w3.org/2000/svg', 'use'); u.setAttribute('href', '#' + id); s.appendChild(u); return s; }

  /* ---------- dados da demo (fictícios) ---------- */
  // diasN: 1 = segunda … 6 = sábado
  var ESP = {
    clinica: { nome: 'Clínica geral', curto: 'Clínica geral', quando: 'Check-up, pressão alta, diabetes, infecções do dia a dia e encaminhamento para outros especialistas quando for preciso.', medico: 'Dr. Ricardo Alves', titulo: 'Médico · Clínica Médica', foto: 'd-ricardo', dias: 'Segunda a sexta', diasN: [1, 2, 3, 4, 5], horas: ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00'], dur: '30 min', valor: 250, levar: 'Documento com foto, carteirinha do convênio, exames recentes e a lista dos remédios que você usa.' },
    cardiologia: { nome: 'Cardiologia', curto: 'Cardiologia', quando: 'Pressão alta, palpitação, falta de ar ao esforço e avaliação antes de começar atividade física.', medico: 'Dr. Paulo Neves', titulo: 'Médico · Cardiologia', foto: 'd-paulo', dias: 'Terça e quinta', diasN: [2, 4], horas: ['08:30', '10:10', '14:00', '15:40', '17:20'], dur: '40 min', valor: 320, levar: 'Exames do coração que você já tenha feito (eletrocardiograma, ecocardiograma) e a lista de remédios.' },
    dermatologia: { nome: 'Dermatologia', curto: 'Dermato', quando: 'Manchas, acne, queda de cabelo, alergias de pele e avaliação de pintas.', medico: 'Dra. Laura Mendes', titulo: 'Médica · Dermatologia', foto: 'd-laura', dias: 'Segunda e quarta', diasN: [1, 3], horas: ['09:00', '10:30', '13:30', '15:00', '16:30'], dur: '30 min', valor: 300, levar: 'Fotos de como a lesão estava antes, se tiver, e os produtos que usa na pele.' },
    ginecologia: { nome: 'Ginecologia', curto: 'Gineco', quando: 'Consulta de rotina, preventivo, contracepção, sintomas da menopausa e acompanhamento da saúde da mulher.', medico: 'Dra. Beatriz Souza', titulo: 'Médica · Ginecologia e Obstetrícia', foto: 'd-beatriz', dias: 'Terça e sexta', diasN: [2, 5], horas: ['08:00', '09:30', '11:00', '14:30', '16:00'], dur: '30 min', valor: 300, levar: 'Exames anteriores, como preventivo e ultrassom, e a data da última menstruação.' },
    pediatria: { nome: 'Pediatria', curto: 'Pediatria', quando: 'Consultas de rotina, crescimento e desenvolvimento, febre e doenças comuns da infância, do recém-nascido aos 12 anos.', medico: 'Dra. Camila Rocha', titulo: 'Médica · Pediatria', foto: 'd-camila', dias: 'Segunda a sábado, de manhã', diasN: [1, 2, 3, 4, 5, 6], horas: ['08:00', '08:40', '09:20', '10:00', '10:40', '11:20'], dur: '30 min', valor: 260, levar: 'Caderneta de saúde da criança e documento do responsável.' },
    ortopedia: { nome: 'Ortopedia', curto: 'Ortopedia', quando: 'Dor nas costas, no joelho e no ombro, lesões do esporte e problemas nas articulações.', medico: 'Dr. André Lima', titulo: 'Médico · Ortopedia e Traumatologia', foto: 'd-andre', dias: 'Quarta e sexta', diasN: [3, 5], horas: ['08:30', '10:00', '13:30', '15:00', '16:30'], dur: '30 min', valor: 320, levar: 'Exames de imagem (raio-x, ressonância) e laudos, se tiver.' }
  };
  var CONV = {
    'Vida+ Saúde': 'todas as especialidades',
    'Plena Seguros': 'todas as especialidades, exceto dermatologia',
    'Bem Viver Saúde': 'todas as especialidades',
    'Mais Cuidado': 'clínica geral, pediatria e ginecologia',
    'Horizonte Saúde': 'todas as especialidades',
    'Elo Saúde': 'todas as especialidades, exceto ortopedia'
  };

  /* ---------- menu ---------- */
  var btnMenu = $('.abre-menu'), gaveta = $('#gaveta');
  function menu(a) { gaveta.classList.toggle('aberta', a); btnMenu.setAttribute('aria-expanded', a ? 'true' : 'false'); btnMenu.setAttribute('aria-label', a ? 'Fechar menu' : 'Abrir menu'); }
  btnMenu.addEventListener('click', function () { menu(!gaveta.classList.contains('aberta')); });
  $$('a', gaveta).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gaveta.classList.contains('aberta')) { menu(false); btnMenu.focus(); } });
  var secoes = $$('main section[id]'), links = $$('.menu a');

  /* ---------- especialidades: o HTML já vem pronto; aqui só o botão de agendar ---------- */
  $$('[data-agendar]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); preencher({ esp: a.dataset.agendar }); }); });

  /* ---------- revelar ---------- */
  var rv = $$('.revela');
  if (temIO && !reduz) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ok'); io.unobserve(e.target); } }); }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    rv.forEach(function (x) { if (x.getBoundingClientRect().top < innerHeight) x.classList.add('ok'); else io.observe(x); });
  } else rv.forEach(function (x) { x.classList.add('ok'); });

  /* ---------- parallax discreto (só computador, sem "reduzir movimento") ---------- */
  var plx = $$('[data-paralaxe]'), grande = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
  function paralaxe() {
    var vh = innerHeight;
    plx.forEach(function (box) {
      var img = $('img', box), r = box.getBoundingClientRect();
      if (!grande.matches) { img.style.transform = ''; return; }
      if (r.bottom < -100 || r.top > vh + 100) return;
      var f = parseFloat(box.dataset.paralaxe) || .1, d = (r.top + r.height / 2 - vh / 2) * f, lim = Math.max(0, (img.offsetHeight - r.height) / 2 - 2);
      d = Math.max(-lim, Math.min(lim, d)); // nunca deixa aparecer a borda da foto
      img.style.transform = 'translate3d(0,' + d.toFixed(1) + 'px,0)';
    });
  }

  var pedido = false;
  function rolar() {
    pedido = false; var vh = innerHeight, at = null;
    secoes.forEach(function (s) { if (s.getBoundingClientRect().top < vh * .35) at = s.id; });
    links.forEach(function (a) { if (a.getAttribute('href') === '#' + at) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    if (!reduz) paralaxe();
  }
  addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(rolar); } }, { passive: true });
  addEventListener('resize', function () { if (!pedido) { pedido = true; requestAnimationFrame(rolar); } });

  /* ---------- janela de demonstração ---------- */
  var janela = $('#janela'), quem = null;
  function abrir(t) { quem = document.activeElement; $('#j-texto').textContent = t; janela.hidden = false; document.body.style.overflow = 'hidden'; $('#j-titulo').focus(); }
  function fechar() { janela.hidden = true; document.body.style.overflow = ''; if (quem) quem.focus(); }
  $$('[data-demo]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); abrir(b.dataset.demo); }); });
  $('#j-fechar').addEventListener('click', fechar);
  janela.addEventListener('click', function (e) { if (e.target === janela) fechar(); });
  document.addEventListener('keydown', function (e) {
    if (janela.hidden) return;
    if (e.key === 'Escape') fechar();
    if (e.key === 'Tab') { var f = $$('a, button', janela), p = f[0], u = f[f.length - 1]; if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); } else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); } }
  });

  /* ---------- próximos horários livres (simulados a partir de hoje) ---------- */
  var DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  function ocupado(data, hora, k) { var s = data.getDate() * 31 + data.getMonth() * 7 + hora.charCodeAt(1) + hora.charCodeAt(3) + k.length; return s % 3 === 0; }
  function proximos(k) {
    var e = ESP[k], out = [], d = new Date(); d.setHours(12, 0, 0, 0);
    for (var n = 1; n < 30 && out.length < 3; n++) {
      var dia = new Date(d.getTime() + n * 864e5);
      if (e.diasN.indexOf(dia.getDay()) < 0) continue;
      for (var i = 0; i < e.horas.length && out.length < 3; i++) {
        if (ocupado(dia, e.horas[i], k)) continue;
        out.push({ dia: DIAS[dia.getDay()] + ' ' + String(dia.getDate()).padStart(2, '0') + '/' + String(dia.getMonth() + 1).padStart(2, '0'), hora: e.horas[i] });
        if (out.length && out.filter(function (x) { return x.dia === out[out.length - 1].dia; }).length >= 2) break; // no máximo 2 por dia
      }
    }
    return out;
  }
  var hlEsp = $('#hl-esp'), hlSlots = $('#hl-slots'), espHL = 'clinica';
  function mostraSlots(k) {
    espHL = k;
    $$('button', hlEsp).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.esp === k ? 'true' : 'false'); });
    hlSlots.textContent = '';
    proximos(k).forEach(function (s) {
      var b = el('button'); b.type = 'button';
      b.appendChild(el('small', null, s.dia)); b.appendChild(el('b', null, s.hora)); b.appendChild(el('span', 'quem', ESP[k].medico.replace('Dra. ', 'Dra. ').split(' ').slice(0, 2).join(' ')));
      b.setAttribute('aria-label', s.dia + ' ' + s.hora + ' ' + b.lastChild.textContent + ', ' + ESP[k].nome + '. Escolher este horário.');
      b.addEventListener('click', function () { preencher({ esp: k, slot: s.dia + ' às ' + s.hora, quem: ESP[k].medico }); });
      hlSlots.appendChild(b);
    });
  }
  Object.keys(ESP).forEach(function (k) {
    var b = el('button', null, ESP[k].curto); b.type = 'button'; b.dataset.esp = k;
    b.addEventListener('click', function () { mostraSlots(k); });
    hlEsp.appendChild(b);
  });
  mostraSlots('clinica');

  /* ---------- atende o meu convênio? ---------- */
  var conv = $('#conv'), resp = $('#conv-resp');
  function checar() {
    var v = norm(conv.value), achou = null;
    resp.className = 'resposta'; resp.textContent = '';
    if (v.length < 2) return;
    Object.keys(CONV).forEach(function (k) { if (norm(k).indexOf(v) === 0 || norm(k) === v) achou = achou || k; });
    var ic = el('span'); ic.setAttribute('aria-hidden', 'true');
    var txt = el('div'), b = el('b'), s = el('span');
    if (achou) {
      resp.classList.add('sim'); ic.textContent = '✓'; b.textContent = 'Sim, atendemos ' + achou + '.'; s.textContent = 'Cobre ' + CONV[achou] + '. Leve a carteirinha e um documento com foto.';
      resp.dataset.conv = achou;
    } else {
      resp.classList.add('nao'); ic.textContent = '!'; b.textContent = 'Não encontramos esse convênio.'; s.textContent = 'Você pode consultar como particular e pedir reembolso ao seu plano com o recibo que entregamos.';
      delete resp.dataset.conv;
    }
    txt.appendChild(b); txt.appendChild(s); resp.appendChild(ic); resp.appendChild(txt);
  }
  conv.addEventListener('input', checar);
  $$('#sugestoes button').forEach(function (b) { b.addEventListener('click', function () { conv.value = b.textContent; checar(); }); });

  /* ---------- agendamento ---------- */
  var form = $('#form-ag'), selEsp = $('#ag-esp'), selConv = $('#ag-conv'), nome = $('#ag-nome'), msg = $('#ag-msg'), btn = $('#ag-montar'), saida = $('#ag-saida'), escolhido = $('#ag-escolhido');
  var slot = null;
  Object.keys(ESP).forEach(function (k) { var o = el('option', null, ESP[k].nome); o.value = k; selEsp.appendChild(o); });
  Object.keys(CONV).forEach(function (k) { var o = el('option', null, k); o.value = k; selConv.appendChild(o); });
  function periodo() { var i = $('input[name=periodo]:checked', form); return i ? i.value : ''; }
  function pronto() { return selEsp.value && selConv.value && (periodo() || slot) && nome.value.trim().length > 1; }
  function atualizar() { btn.disabled = !pronto(); saida.hidden = true; }
  function mostraEscolhido() {
    escolhido.textContent = '';
    if (!slot) { escolhido.hidden = true; $('fieldset', form).hidden = false; return; }
    escolhido.appendChild(svg('i-cal'));
    escolhido.appendChild(el('span', null, 'Horário escolhido: ' + slot.texto + ', com ' + slot.quem + '.'));
    var x = el('button', null, 'Trocar'); x.type = 'button'; x.addEventListener('click', function () { slot = null; mostraEscolhido(); atualizar(); }); escolhido.appendChild(x);
    escolhido.hidden = false; $('fieldset', form).hidden = true;
  }
  form.addEventListener('input', atualizar); form.addEventListener('change', function (e) { if (e.target === selEsp && slot && slot.esp !== selEsp.value) { slot = null; mostraEscolhido(); } atualizar(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (!pronto()) return;
    msg.textContent = 'Olá, Clínica Lumar! Quero agendar uma consulta.\n• Especialidade: ' + ESP[selEsp.value].nome + '\n• ' + (selConv.value === 'particular' ? 'Particular' : 'Convênio: ' + selConv.value) + '\n• ' + (slot ? 'Horário que vi no site: ' + slot.texto + ' (' + slot.quem + ')' : 'Período: ' + periodo()) + '\nNome: ' + nome.value.trim();
    saida.hidden = false; $('#ag-saida-t').focus({ preventScroll: false });
  });
  function preencher(o) {
    if (o.esp) selEsp.value = o.esp;
    if (o.conv) selConv.value = o.conv;
    if (o.slot) slot = { esp: o.esp, texto: o.slot, quem: o.quem }; else if (o.esp && slot && slot.esp !== o.esp) slot = null;
    mostraEscolhido(); atualizar(); rolarAte('#agendar');
    setTimeout(function () { (selEsp.value && !selConv.value ? selConv : !selEsp.value ? selEsp : nome).focus({ preventScroll: true }); }, reduz ? 0 : 700);
  }
  $('#conv-agendar').addEventListener('click', function () { preencher({ conv: resp.dataset.conv || 'particular' }); });

  /* ---------- dúvidas ---------- */
  $$('.acc-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.closest('.acc-item'), a = !it.classList.contains('aberto');
      $$('.acc-item').forEach(function (x) { x.classList.remove('aberto'); $('.acc-q', x).setAttribute('aria-expanded', 'false'); });
      if (a) { it.classList.add('aberto'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- barra fixa no celular ---------- */
  var barra = $('#barra-m');
  if (temIO) {
    var vis = { capa: true, ag: false };
    var bio = new IntersectionObserver(function (es) { es.forEach(function (e) { vis[e.target.dataset.barra] = e.isIntersecting; }); var m = !vis.capa && !vis.ag; barra.classList.toggle('visivel', m); barra.setAttribute('aria-hidden', m ? 'false' : 'true'); $('a', barra).tabIndex = m ? 0 : -1; });
    var c = $('.capa'), g = $('#agendar'); c.dataset.barra = 'capa'; g.dataset.barra = 'ag'; bio.observe(c); bio.observe(g);
  }
  rolar();
})();
