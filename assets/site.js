/* EstudioHK · comportamento da home. Sem dependências. */
(function () {
  'use strict';

  /* ===== Configuração (preencher antes do lançamento) ===== */
  // Número do WhatsApp com DDI e DDD, só dígitos. Ex.: '5527999999999'.
  // Vazio: o botão do briefing envia por e-mail.
  var WHATSAPP_NUMBER = '5527996950409';
  var EMAIL = 'contato@estudiohk.com.br';

  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var hasIO = 'IntersectionObserver' in window;
  $('#year').textContent = new Date().getFullYear();

  /* ---------- menu do celular ---------- */
  var nav = $('#nav'), prog = $('#prog'), menuBtn = $('#menu-btn'), sheet = $('#sheet');
  function setMenu(open) {
    sheet.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!sheet.classList.contains('is-open')); });
  $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 900) setMenu(false); });

  /* ---------- rolagem: barra de progresso, link ativo, linha do processo ---------- */
  var sections = $$('main section[id]');
  var navLinks = $$('.nav-links a');
  var stepsEl = $('#steps'), stepItems = $$('.step', stepsEl);
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight, h = doc.scrollHeight - vh;
    nav.classList.toggle('is-scrolled', y > 8);
    prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    var cur = null;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < vh * .4) cur = s.id; });
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + cur;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    var r = stepsEl.getBoundingClientRect();
    var k = reduce ? 1 : Math.max(0, Math.min(1, (vh * .6 - r.top) / r.height));
    stepsEl.style.setProperty('--prog', k.toFixed(3));
    stepItems.forEach(function (s) { s.classList.toggle('on', s.getBoundingClientRect().top < vh * .6); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- reveal ao rolar (o que já está na tela aparece direto) ---------- */
  var rvs = $$('.rv');
  if (hasIO && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    rvs.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      else io.observe(el);
    });
  } else rvs.forEach(function (el) { el.classList.add('in'); });

  /* ---------- palavra que gira no título ---------- */
  var rotItems = $$('.rot > span'), ri = 0;
  if (!reduce && rotItems.length) setInterval(function () {
    if (document.hidden) return;
    var cur = rotItems[ri]; ri = (ri + 1) % rotItems.length; var nx = rotItems[ri];
    cur.classList.add('out');
    nx.classList.remove('out'); nx.classList.add('wait');
    requestAnimationFrame(function () { requestAnimationFrame(function () { nx.classList.remove('wait'); }); });
    setTimeout(function () { cur.classList.remove('out'); cur.classList.add('wait'); }, 460);
  }, 2600);

  /* ---------- grade de pontos do hero ----------
     Celular/toque e movimento reduzido: um quadro estático.
     Desktop: anima só enquanto o cursor está no hero e para logo depois que ele sai. */
  var hero = $('.hero'), cv = $('#dots'), ctx = cv.getContext && cv.getContext('2d');
  if (ctx) {
    var W = 0, H = 0, mx = -9999, my = -9999, tmx = -9999, tmy = -9999, raf = 0, idleUntil = 0, t0 = performance.now();
    var size = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };
    var draw = function (t) {
      ctx.clearRect(0, 0, W, H);
      var gap = 26, R = 170, wave = t * 0.00035;
      mx += (tmx - mx) * .12; my += (tmy - my) * .12;
      for (var y = gap / 2; y < H; y += gap) {
        var fade = Math.max(0, 1 - y / H * 0.9);
        for (var x = gap / 2; x < W; x += gap) {
          var dx = x - mx, dy = y - my, d = Math.sqrt(dx * dx + dy * dy);
          var k = d < R ? 1 - d / R : 0;
          if (k > 0.02) {
            var px = x + dx / (d || 1) * k * 7, py = y + dy / (d || 1) * k * 7;
            ctx.fillStyle = 'rgba(198,242,78,' + (0.2 + k * 0.75) * fade + ')';
            ctx.beginPath(); ctx.arc(px, py, 1.1 + k * 1.4, 0, 6.283); ctx.fill();
          } else {
            var amb = t ? (Math.sin(x * 0.012 + wave * 3) + Math.cos(y * 0.015 - wave * 2)) * 0.5 : 0;
            ctx.fillStyle = 'rgba(111,143,224,' + (0.16 + Math.max(0, amb) * 0.14) * fade + ')';
            ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
          }
        }
      }
    };
    var loop = function (t) {
      draw(t - t0);
      if (t < idleUntil && !document.hidden) raf = requestAnimationFrame(loop); else raf = 0;
    };
    var wake = function () { idleUntil = performance.now() + 1200; if (!raf) raf = requestAnimationFrame(loop); };
    if (finePointer && !reduce) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect(); tmx = e.clientX - r.left; tmy = e.clientY - r.top;
        if (mx < -999) { mx = tmx; my = tmy; }
        wake();
      });
      hero.addEventListener('pointerleave', function () { tmx = tmy = -9999; wake(); });
    }
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(size, 150); });
    size();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size); // a altura do hero muda quando a fonte carrega
  }

  /* ---------- demo de automação ---------- */
  var demo = $('#demo'), log = $('#log'), pulse = $('#pulse'), state = $('#demo-state'), runBtn = $('#demo-run');
  var edges = [0, 1, 2, 3].map(function (i) { var p = $('#e' + i); var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return { p: p, L: L }; });
  var running = false, loopTimer = null, heroVisible = true;
  var leads = [
    { seg: 'Clínica odontológica', want: 'Sistema de agendamento' },
    { seg: 'Loja de móveis', want: 'Landing page de campanha' },
    { seg: 'Escritório de advocacia', want: 'Site institucional' },
    { seg: 'Academia', want: 'Automação de matrículas' }
  ], li = 0;
  function now() { var d = new Date(); return [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return String(n).padStart(2, '0'); }).join(':'); }
  function addLog(txt, ok) {
    var el = document.createElement('li'); if (ok) el.className = 'ok';
    var tm = document.createElement('time'); tm.textContent = now();
    var sp = document.createElement('span'); sp.textContent = txt;
    el.appendChild(tm); el.appendChild(sp); log.appendChild(el);
    while (log.children.length > 6) log.removeChild(log.firstChild);
  }
  function hit(id) { var n = $('#' + id); n.classList.add('hit'); setTimeout(function () { n.classList.remove('hit'); }, 900); }
  function travel(e, dur) {
    return new Promise(function (res) {
      if (reduce) { e.p.style.strokeDashoffset = 0; return setTimeout(res, 120); }
      var s = performance.now();
      (function f(t) {
        var k = Math.min(1, (t - s) / dur), ek = 1 - Math.pow(1 - k, 3);
        var pt = e.p.getPointAtLength(e.L * ek);
        pulse.setAttribute('cx', pt.x); pulse.setAttribute('cy', pt.y);
        e.p.style.strokeDashoffset = e.L * (1 - ek);
        if (k < 1) requestAnimationFrame(f); else res();
      })(s);
    });
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 60 : ms); }); }
  // O log só é anunciado ao leitor de tela quando a própria pessoa pede a simulação.
  function run(byUser) {
    if (running) return; running = true;
    log.setAttribute('aria-live', byUser ? 'polite' : 'off');
    var start = performance.now(), L = leads[li++ % leads.length];
    edges.forEach(function (e) { e.p.style.transition = 'none'; e.p.style.strokeDashoffset = e.L; });
    demo.classList.add('is-running'); state.textContent = 'Rodando'; runBtn.disabled = true;
    hit('n0'); addLog('Novo pedido pelo site · ' + L.seg);
    travel(edges[0], 700).then(function () {
      hit('n1'); addLog('Interesse identificado: ' + L.want); return wait(450);
    }).then(function () { return travel(edges[1], 620); })
      .then(function () { hit('n2'); addLog('Aviso enviado no WhatsApp', true); return travel(edges[2], 420); })
      .then(function () { hit('n3'); addLog('Contato criado no CRM', true); return travel(edges[3], 620); })
      .then(function () {
        hit('n4'); addLog('Linha registrada na planilha', true);
        pulse.setAttribute('cx', -20); pulse.setAttribute('cy', -20);
        var secs = ((performance.now() - start) / 1000).toFixed(1).replace('.', ',');
        state.textContent = 'Concluído em ' + secs + ' s'; demo.classList.remove('is-running');
        running = false; runBtn.disabled = false;
        setTimeout(function () { edges.forEach(function (e) { e.p.style.transition = 'stroke-dashoffset .8s'; e.p.style.strokeDashoffset = e.L; }); }, 1600);
      });
  }
  runBtn.addEventListener('click', function () { clearInterval(loopTimer); loopTimer = null; run(true); });
  if (hasIO) new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; }).observe(hero);
  setTimeout(function () { run(false); }, reduce ? 300 : 1400);
  if (!reduce) loopTimer = setInterval(function () { if (heroVisible && !document.hidden) run(false); }, 9000);

  /* ---------- calculadora ---------- */
  var fmtN = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  var fmtR = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  var cIn = { people: $('#c-people'), hours: $('#c-hours'), cost: $('#c-cost'), pct: $('#c-pct') };
  var shown = { h: 0, m: 0, y: 0 }, target, anim = null, first = true;
  function paint(el) { el.style.setProperty('--p', (el.value - el.min) / (el.max - el.min) * 100 + '%'); }
  function render() { $('#r-hours').textContent = fmtN.format(shown.h); $('#r-month').textContent = fmtR.format(shown.m); $('#r-year').textContent = fmtR.format(shown.y); }
  function calc() {
    var p = +cIn.people.value, h = +cIn.hours.value, c = +cIn.cost.value, pc = +cIn.pct.value / 100;
    $('#o-people').textContent = p + (p > 1 ? ' pessoas' : ' pessoa');
    $('#o-hours').textContent = h + ' h/semana';
    $('#o-cost').textContent = fmtR.format(c) + '/h';
    $('#o-pct').textContent = Math.round(pc * 100) + '%';
    Object.keys(cIn).forEach(function (k) { paint(cIn[k]); });
    var hrs = p * h * 4.3 * pc;
    target = { h: hrs, m: hrs * c, y: hrs * c * 12 };
    if (reduce || first) { first = false; shown = target; render(); return; }
    var from = { h: shown.h, m: shown.m, y: shown.y }, s = performance.now();
    cancelAnimationFrame(anim);
    (function f(t) {
      var k = Math.min(1, (t - s) / 500), e = 1 - Math.pow(1 - k, 3);
      shown = { h: from.h + (target.h - from.h) * e, m: from.m + (target.m - from.m) * e, y: from.y + (target.y - from.y) * e };
      render(); if (k < 1) anim = requestAnimationFrame(f);
    })(s);
  }
  Object.keys(cIn).forEach(function (k) { cIn[k].addEventListener('input', calc); });
  $('#calc').addEventListener('submit', function (e) { e.preventDefault(); });
  calc();
  $('#calc-cta').addEventListener('click', function () { $('#w4').checked = true; $('#w1').checked = false; updateBrief(); });
  // "Sob consulta" em cada serviço leva ao briefing com aquele serviço já marcado
  $$('[data-want]').forEach(function (el) {
    el.addEventListener('click', function () {
      $$('input[name=what]').forEach(function (i) { i.checked = i.id === el.dataset.want; });
      updateBrief();
    });
  });

  /* ---------- brilho que segue o cursor ---------- */
  if (finePointer && !reduce) {
    $$('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
    var foot = $('#foot'), wm = $('#wordmark');
    foot.addEventListener('pointermove', function (e) { var r = wm.getBoundingClientRect(); wm.style.setProperty('--mx', (e.clientX - r.left) + 'px'); wm.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    foot.addEventListener('pointerleave', function () { wm.style.setProperty('--mx', '-999px'); });
  }

  /* ---------- FAQ (uma aberta por vez) ---------- */
  $$('.acc-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.closest('.acc-item'), open = !item.classList.contains('open');
      $$('.acc-item').forEach(function (it) { it.classList.remove('open'); it.querySelector('.acc-q').setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- briefing → WhatsApp (ou e-mail) ---------- */
  var form = $('#brief'), bubble = $('#bubble'), wa = $('#wa'), toast = $('#toast');
  if (!WHATSAPP_NUMBER) {
    $('#wa-label').textContent = 'Enviar por e-mail';
    wa.querySelector('use').setAttribute('href', '#i-mail');
  }
  function message() {
    var what = $$('input[name=what]:checked', form).map(function (i) { return i.value; });
    var when = ($('input[name=when]:checked', form) || {}).value;
    var name = $('#f-name').value.trim(), biz = $('#f-biz').value.trim(), msg = $('#f-msg').value.trim();
    var lines = ['Olá! ' + (name ? 'Sou ' + name + (biz ? ', de ' + biz : '') + '.' : (biz ? 'Falo de ' + biz + '.' : 'Vim pelo site da EstudioHK.'))];
    if (what.length) {
      var list = what.length > 1 ? what.slice(0, -1).join(', ') + ' e ' + what[what.length - 1] : what[0];
      lines.push(what.indexOf('Ainda não sei') > -1 && what.length === 1 ? 'Ainda não sei exatamente o que preciso e queria uma orientação.' : 'Tenho interesse em: ' + list.toLowerCase() + '.');
    }
    if (when) lines.push('Prazo: ' + when + '.');
    if (msg) lines.push(msg);
    lines.push('Podemos conversar?');
    return lines.join('\n');
  }
  function updateBrief() {
    var m = message(); bubble.textContent = m;
    wa.href = WHATSAPP_NUMBER
      ? 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(m)
      : 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Pedido de orçamento') + '&body=' + encodeURIComponent(m);
  }
  form.addEventListener('input', updateBrief); form.addEventListener('change', updateBrief);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  updateBrief();
  function selectBubble() { var r = document.createRange(); r.selectNodeContents(bubble); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  $('#copy').addEventListener('click', function () {
    var m = message();
    function done(ok) { toast.textContent = ok ? 'Mensagem copiada. Cole no WhatsApp ou no e-mail.' : 'Selecione o texto ao lado e copie.'; setTimeout(function () { toast.textContent = ''; }, 3500); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m).then(function () { done(true); }, function () { selectBubble(); done(false); });
    else { selectBubble(); done(false); }
  });

  /* ---------- botão fixo no celular: aparece depois do hero, some no contato e no rodapé ---------- */
  var fab = $('#fab');
  if (hasIO && fab) {
    var vis = { hero: true, contato: false, foot: false };
    var setFab = function () {
      var show = !vis.hero && !vis.contato && !vis.foot;
      fab.classList.toggle('show', show);
      fab.setAttribute('aria-hidden', show ? 'false' : 'true');
    };
    var fio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.dataset.fab] = e.isIntersecting; });
      setFab();
    });
    hero.dataset.fab = 'hero'; $('#contato').dataset.fab = 'contato'; $('#foot').dataset.fab = 'foot';
    [hero, $('#contato'), $('#foot')].forEach(function (el) { fio.observe(el); });
    setFab();
  }

  /* ---------- atalho Ctrl/⌘ K: ir para uma seção ---------- */
  var cmdk = $('#cmdk'), q = $('#cmdk-q'), list = $('#cmdk-list'), opener = null, sel = 0, shownOpts = [];
  function go(h) { var el = $(h); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  var OPTS = [
    { t: 'Serviços', i: 'i-grid', a: function () { go('#servicos'); } },
    { t: 'Calculadora de economia', i: 'i-calc', a: function () { go('#calculadora'); } },
    { t: 'Demonstrações', i: 'i-layout', a: function () { go('#demos'); } },
    { t: 'Como funciona', i: 'i-steps', a: function () { go('#processo'); } },
    { t: 'Dúvidas', i: 'i-help', a: function () { go('#faq'); } },
    { t: 'Pedir orçamento', i: 'i-msg', a: function () { go('#contato'); setTimeout(function () { $('#f-name').focus({ preventScroll: true }); }, 500); } },
    { t: 'Simular uma automação', i: 'i-zap', a: function () { go('#topo'); setTimeout(function () { clearInterval(loopTimer); run(true); }, 400); } }
  ];
  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function renderList() {
    var term = norm(q.value.trim());
    shownOpts = OPTS.filter(function (o) { return !term || norm(o.t).indexOf(term) > -1; });
    sel = Math.min(sel, Math.max(0, shownOpts.length - 1));
    list.textContent = '';
    if (!shownOpts.length) { var em = document.createElement('li'); em.className = 'empty'; em.textContent = 'Nada encontrado. Tente “orçamento” ou “serviços”.'; list.appendChild(em); q.removeAttribute('aria-activedescendant'); return; }
    shownOpts.forEach(function (o, i) {
      var li2 = document.createElement('li');
      li2.className = 'opt'; li2.id = 'op' + i; li2.dataset.i = i; li2.setAttribute('role', 'option'); li2.setAttribute('aria-selected', String(i === sel));
      li2.innerHTML = '<span class="oi"><svg class="icon" style="width:16px;height:16px"><use href="#' + o.i + '"/></svg></span>';
      li2.appendChild(document.createTextNode(o.t));
      list.appendChild(li2);
    });
    q.setAttribute('aria-activedescendant', 'op' + sel);
    var a = $('#op' + sel); if (a) a.scrollIntoView({ block: 'nearest' });
  }
  function openK() { opener = document.activeElement; cmdk.hidden = false; q.value = ''; sel = 0; renderList(); q.focus(); document.body.style.overflow = 'hidden'; }
  function closeK() { cmdk.hidden = true; document.body.style.overflow = ''; if (opener && opener.focus) opener.focus({ preventScroll: true }); }
  function exec(i) { var o = shownOpts[i]; if (!o) return; closeK(); o.a(); }
  q.addEventListener('input', function () { sel = 0; renderList(); });
  list.addEventListener('click', function (e) { var o = e.target.closest('.opt'); if (o) exec(+o.dataset.i); });
  cmdk.addEventListener('click', function (e) { if (e.target === cmdk) closeK(); });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (cmdk.hidden) openK(); else closeK(); return; }
    if (cmdk.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeK(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, shownOpts.length); renderList(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shownOpts.length) % Math.max(1, shownOpts.length); renderList(); }
    else if (e.key === 'Enter') { e.preventDefault(); exec(sel); }
    else if (e.key === 'Tab') { e.preventDefault(); q.focus(); }
  });

  onScroll();
})();
