/* Clínica Lumar · demonstração da EstudioHK. Sem dependências. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;
  function rolarAte(sel) { var el = $(sel); if (el) el.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' }); }
  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9+]/g, ''); }

  /* ---------- dados da demo (fictícios) ---------- */
  var ESP = {
    clinica: { nome: 'Clínica geral', trata: 'Check-up, pressão alta, diabetes, infecções do dia a dia e encaminhamento para outros especialistas quando for preciso.', medico: 'Dr. Ricardo Alves', titulo: 'Médico · Clínica Médica', reg: 'CRM-ES 00000 · RQE 00000', foto: 'd-ricardo', dias: 'Segunda a sexta', dur: '30 minutos', levar: 'Documento com foto, carteirinha do convênio, exames recentes e a lista dos remédios que você usa.' },
    cardiologia: { nome: 'Cardiologia', trata: 'Pressão alta, palpitação, falta de ar ao esforço e avaliação antes de começar atividade física.', medico: 'Dr. Paulo Neves', titulo: 'Médico · Cardiologia', reg: 'CRM-ES 00000 · RQE 00000', foto: 'd-paulo', dias: 'Terça e quinta', dur: '40 minutos', levar: 'Exames do coração que você já tenha feito (eletrocardiograma, ecocardiograma) e a lista de remédios.' },
    dermatologia: { nome: 'Dermatologia', trata: 'Manchas, acne, queda de cabelo, alergias de pele e avaliação de pintas.', medico: 'Dra. Laura Mendes', titulo: 'Médica · Dermatologia', reg: 'CRM-ES 00000 · RQE 00000', foto: 'd-laura', dias: 'Segunda e quarta', dur: '30 minutos', levar: 'Fotos de como a lesão estava antes, se tiver, e os produtos que usa na pele.' },
    ginecologia: { nome: 'Ginecologia', trata: 'Consulta de rotina, preventivo, contracepção, sintomas da menopausa e acompanhamento da saúde da mulher.', medico: 'Dra. Beatriz Souza', titulo: 'Médica · Ginecologia e Obstetrícia', reg: 'CRM-ES 00000 · RQE 00000', foto: 'd-beatriz', dias: 'Terça e sexta', dur: '30 minutos', levar: 'Exames anteriores, como preventivo e ultrassom, e a data da última menstruação.' },
    pediatria: { nome: 'Pediatria', trata: 'Consultas de rotina, crescimento e desenvolvimento, febre e doenças comuns da infância, do recém-nascido aos 12 anos.', medico: 'Dra. Camila Rocha', titulo: 'Médica · Pediatria', reg: 'CRM-ES 00000 · RQE 00000', foto: 'd-camila', dias: 'Segunda a sexta, de manhã', dur: '30 minutos', levar: 'Caderneta de saúde da criança e documento do responsável.' },
    ortopedia: { nome: 'Ortopedia', trata: 'Dor nas costas, no joelho e no ombro, lesões do esporte e problemas nas articulações.', medico: 'Dr. André Lima', titulo: 'Médico · Ortopedia e Traumatologia', reg: 'CRM-ES 00000 · RQE 00000', foto: 'd-andre', dias: 'Quarta e sexta', dur: '30 minutos', levar: 'Exames de imagem (raio-x, ressonância) e laudos, se tiver.' }
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
  var secoes = $$('main section[id]'), links = $$('.menu a'), pedido = false;
  function rolar() { pedido = false; var vh = innerHeight, at = null; secoes.forEach(function (s) { if (s.getBoundingClientRect().top < vh * .35) at = s.id; }); links.forEach(function (a) { if (a.getAttribute('href') === '#' + at) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
  addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(rolar); } }, { passive: true });

  /* ---------- revelar ---------- */
  var rv = $$('.revela');
  if (temIO && !reduz) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ok'); io.unobserve(e.target); } }); }, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
    rv.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('ok'); else io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('ok'); });

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

  /* ---------- atende o meu convênio? ---------- */
  var conv = $('#conv'), resp = $('#conv-resp');
  function checar(valor) {
    var v = norm(valor || conv.value), achou = null;
    resp.className = 'resposta'; resp.textContent = '';
    if (v.length < 2) return;
    Object.keys(CONV).forEach(function (k) { if (norm(k).indexOf(v) === 0 || norm(k) === v) achou = achou || k; });
    var ic = document.createElement('span'); ic.setAttribute('aria-hidden', 'true');
    var txt = document.createElement('div'), b = document.createElement('b'), s = document.createElement('span');
    if (achou) {
      resp.classList.add('sim'); ic.textContent = '✓'; b.textContent = 'Sim, atendemos ' + achou + '.'; s.textContent = 'Cobre ' + CONV[achou] + '. Leve a carteirinha e um documento com foto.';
      resp.dataset.conv = achou;
    } else {
      resp.classList.add('nao'); ic.textContent = '!'; b.textContent = 'Não encontramos esse convênio.'; s.textContent = 'Você pode consultar como particular e pedir reembolso ao seu plano com o recibo que entregamos.';
      delete resp.dataset.conv;
    }
    txt.appendChild(b); txt.appendChild(s); resp.appendChild(ic); resp.appendChild(txt);
  }
  conv.addEventListener('input', function () { checar(); });
  $$('#sugestoes button').forEach(function (b) { b.addEventListener('click', function () { conv.value = b.textContent; checar(); }); });

  /* ---------- especialidades ---------- */
  var lista = $('#esp-lista'), ficha = $('#ficha'), atual = 'clinica';
  function mostrarEsp(id, focar) {
    atual = id; var e = ESP[id];
    $$('button', lista).forEach(function (b) { var on = b.dataset.esp === id; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
    $('h3', ficha).textContent = e.nome; $('.trata', ficha).textContent = e.trata;
    $('.medico img', ficha).src = 'assets/img/' + e.foto + '-200.webp'; $('.medico img', ficha).alt = 'Foto de ' + e.medico + '.';
    $('.medico b', ficha).textContent = e.medico; $('.medico .t', ficha).textContent = e.titulo; $('.medico .r', ficha).innerHTML = e.reg.split(' · ').map(function (t) { return '<span class="nw">' + t + '</span>'; }).join(' · ');
    $('[data-f=dias]', ficha).textContent = e.dias; $('[data-f=dur]', ficha).textContent = e.dur; $('[data-f=levar]', ficha).textContent = e.levar;
    $('[data-f=agendar]', ficha).textContent = 'Agendar ' + e.nome.toLowerCase();
    if (focar) $('h3', ficha).focus({ preventScroll: true });
  }
  lista.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) mostrarEsp(b.dataset.esp); });
  lista.addEventListener('keydown', function (ev) {
    var ids = Object.keys(ESP), i = ids.indexOf(atual), k = ev.key;
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].indexOf(k) < 0) return;
    ev.preventDefault(); i = (i + (k === 'ArrowDown' || k === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length;
    mostrarEsp(ids[i]); $('button[data-esp="' + ids[i] + '"]', lista).focus();
  });
  $('[data-f=agendar]', ficha).addEventListener('click', function () { preencher({ esp: atual }); });
  mostrarEsp('clinica');

  /* ---------- agendamento ---------- */
  var form = $('#form-ag'), selEsp = $('#ag-esp'), selConv = $('#ag-conv'), nome = $('#ag-nome'), msg = $('#ag-msg'), btn = $('#ag-montar'), saida = $('#ag-saida');
  Object.keys(ESP).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = ESP[k].nome; selEsp.appendChild(o); });
  Object.keys(CONV).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = k; selConv.appendChild(o); });
  function periodo() { var i = $('input[name=periodo]:checked', form); return i ? i.value : ''; }
  function pronto() { return selEsp.value && selConv.value && periodo() && nome.value.trim().length > 1; }
  function atualizar() { btn.disabled = !pronto(); saida.hidden = true; }
  form.addEventListener('input', atualizar); form.addEventListener('change', atualizar);
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (!pronto()) return;
    msg.textContent = 'Olá, Clínica Lumar! Quero agendar uma consulta.\n• Especialidade: ' + ESP[selEsp.value].nome + '\n• ' + (selConv.value === 'particular' ? 'Particular' : 'Convênio: ' + selConv.value) + '\n• Período: ' + periodo() + '\nNome: ' + nome.value.trim();
    saida.hidden = false; $('#ag-saida-t').focus({ preventScroll: false });
  });
  function preencher(o) {
    if (o.esp) selEsp.value = o.esp;
    if (o.conv) selConv.value = o.conv;
    atualizar(); rolarAte('#agendar');
    setTimeout(function () { (o.esp && o.conv ? $('input[name=periodo]', form) : o.esp ? selConv : selEsp).focus({ preventScroll: true }); }, reduz ? 0 : 700);
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
    var bio = new IntersectionObserver(function (es) { es.forEach(function (e) { vis[e.target.dataset.barra] = e.isIntersecting; }); var m = !vis.capa && !vis.ag; barra.classList.toggle('visivel', m); barra.setAttribute('aria-hidden', m ? 'false' : 'true'); });
    var c = $('.capa'), g = $('#agendar'); c.dataset.barra = 'capa'; g.dataset.barra = 'ag'; bio.observe(c); bio.observe(g);
  }
  rolar();
})();
