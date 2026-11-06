/* Barlavento Camburi · demonstração da EstudioHK. As animações de rolagem vêm do cena.js (kit da EstudioHK). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var anima = document.documentElement.classList.contains('anima');

  /* ---------- da fachada para dentro: a sala se abre num círculo a partir da janela ---------- */
  var dentro = $('section.dentro'), moldura = $('#interior'), caixa = $('.zoom-caixa');
  if (anima && dentro) {
    // geometria medida só ao carregar e ao redimensionar: ponto da janela do 12º andar em relação à moldura
    var geo = null, ultimo = 0;
    var mede = function () {
      var c = caixa.getBoundingClientRect(), m = moldura.getBoundingClientRect(), w = c.width, h = c.height;
      var bw = Math.min(w, h * 600 / 760), bh = bw * 760 / 600;
      var jx = c.left + (w - bw) / 2 + .441 * bw, jy = c.top + (h - bh) / 2 + .366 * bh;   // a janela fica parada durante o zoom (é a origem)
      var x = jx - m.left, y = jy - m.top;
      geo = { x: x, y: y, r: Math.hypot(Math.max(x, m.width - x), Math.max(y, m.height - y)) };
    };
    var abre = function (p) {
      if (!geo) mede();
      var q = Math.max(0, Math.min(1, (p - .32) / .12)), e = 1 - Math.pow(1 - q, 3);
      moldura.style.clipPath = 'circle(' + (e * geo.r).toFixed(1) + 'px at ' + geo.x.toFixed(1) + 'px ' + geo.y.toFixed(1) + 'px)';
    };
    dentro.addEventListener('cena:progresso', function (ev) { ultimo = ev.detail.p; abre(ultimo); });
    addEventListener('resize', function () { geo = null; abre(ultimo); });
    abre(0);
  }

  /* ---------- abas das plantas ---------- */
  var abas = $$('.abas [role=tab]');
  function aba(b, foco) {
    abas.forEach(function (x) {
      var sel = x === b; x.setAttribute('aria-selected', sel ? 'true' : 'false'); x.tabIndex = sel ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !sel;
      document.getElementById('lista-' + x.id.slice(4)).hidden = !sel;
    });
    if (foco) b.focus();
  }
  abas.forEach(function (b, i) {
    b.addEventListener('click', function () { aba(b); });
    b.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); aba(abas[(i + d + abas.length) % abas.length], true); } });
  });

  /* ---------- escolha o andar ---------- */
  var estado = { andar: 12, pos: 'frente' };
  var TOTAL = 18;
  function desenhaAndar() {
    var a = estado.andar, frente = estado.pos === 'frente';
    $$('.torre button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.andar === a ? 'true' : 'false'); });
    $$('.posicao button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.pos === estado.pos ? 'true' : 'false'); });
    var desce = (a - 1) / (TOTAL - 1) * 240;   // os prédios vizinhos "afundam" conforme o andar sobe
    $('#v-predios').style.transform = 'translateY(' + desce.toFixed(0) + 'px)';
    $('#v-horizonte').style.opacity = frente ? '1' : '0';
    $('#v-sol').style.transform = frente ? 'translate(0,0)' : 'translate(300px, 30px)';
    var vista;
    if (frente) vista = a >= 8 ? 'Vista para o mar acima dos prédios vizinhos.' : a >= 4 ? 'Vista parcial do mar entre os prédios.' : 'Vista para a rua arborizada.';
    else vista = a >= 10 ? 'Vista aberta para o bairro.' : 'Vista para o bairro, entre prédios.';
    $('#andar-titulo').textContent = a + 'º andar · ' + (frente ? 'frente' : 'fundos');
    $('#andar-texto').textContent = vista + (frente ? ' Sol da manhã, que entra até o meio-dia.' : ' Sol da tarde, a partir das 14h.');
  }
  $$('.torre button').forEach(function (b) { b.addEventListener('click', function () { estado.andar = +b.dataset.andar; desenhaAndar(); }); });
  $$('.posicao button').forEach(function (b) { b.addEventListener('click', function () { estado.pos = b.dataset.pos; desenhaAndar(); }); });
  desenhaAndar();

  /* ---------- agendar visita ---------- */
  var dia = $('#v-dia'), DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var d = new Date(); var n = 0;
  while (n < 6) { d.setDate(d.getDate() + 1); if (d.getDay() === 0) continue; var t = DIAS[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); var o = document.createElement('option'); o.value = t; o.textContent = t.charAt(0).toUpperCase() + t.slice(1); dia.appendChild(o); n++; }
  $('#form-visita').addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = $('#v-nome'), tel = $('#v-tel'), ruim = null;
    [nome, tel].forEach(function (c) { var mal = c === tel ? c.value.replace(/\D/g, '').length < 10 : c.value.trim().length < 2; c.setAttribute('aria-invalid', mal ? 'true' : 'false'); if (mal && !ruim) ruim = c; });
    if (ruim) { ruim.focus(); return; }
    var periodo = $('input[name=periodo]:checked').value;
    $('#v-msg').textContent = 'Olá! Sou ' + nome.value.trim() + '. Quero agendar uma visita ao decorado do Barlavento Camburi.\nInteresse: ' + $('#v-tipo').value + '.\nDia: ' + dia.value + ', período da ' + periodo + '.\nMeu WhatsApp: ' + tel.value.trim() + '.';
    $('#v-previa').hidden = false;
  });

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
})();
