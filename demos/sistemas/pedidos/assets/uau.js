/* Piloto "uau" do sistema de pedidos da Coadouro · demonstração da EstudioHK
   Celular do cliente (cardápio por QR na mesa e WhatsApp), passeio guiado, pedidos chegando sozinhos,
   alertas antes do problema, "quanto te devolve" e gráfico por hora. Usa a API window.COADOURO do pedidos.js. */
(function () {
  'use strict';
  var S = window.SIS, $ = S.$, $$ = S.$$, esc = S.esc;
  function inicia() {
    var C = window.COADOURO, D = C.D, R = C.R, hm = C.hm;
    var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var lembra = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
    var hstrA = function () { return C.hstr(C.agora()); };
    var MESA = 5;

    /* ================= celular do cliente ================= */
    var cel = $('#celular'), abre = $('#abre-cel'), aba = 'qr', qrCarrinho = {}, qrTela = 'menu', conversa = null, naoLidas = 0;
    var largo = function () { return matchMedia('(min-width: 1240px)').matches; };
    function mostraCel(sim, foco) {
      document.documentElement.classList.toggle('cel-aberto', sim); abre.setAttribute('aria-expanded', sim ? 'true' : 'false');
      if (sim) { naoLidas = 0; marcaNaoLidas(); if (foco) { var b = $('.cel-abas [aria-pressed="true"]'); if (b) b.focus(); } }
      else if (foco) abre.focus();
    }
    function marcaNaoLidas() { [$('#cel-n'), $('#abre-cel-n')].forEach(function (n) { n.hidden = !naoLidas; n.textContent = naoLidas; }); }
    abre.addEventListener('click', function () { mostraCel(!document.documentElement.classList.contains('cel-aberto'), true); });
    $('#cel-fechar').addEventListener('click', function () { mostraCel(false, true); });
    $$('[data-cel]').forEach(function (b) { b.addEventListener('click', function () { trocaAba(b.dataset.cel); }); });
    function trocaAba(a) { aba = a; $$('[data-cel]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.cel === a ? 'true' : 'false'); }); if (a === 'zap') { naoLidas = 0; marcaNaoLidas(); } desenhaCel(); }

    var FOTO = C.FOTO;
    function foto(i, cls) { return FOTO[i.id] ? '<img class="' + cls + '" src="/demos/cafeteria/assets/img/' + FOTO[i.id] + '-400.webp" alt="" width="64" height="64" loading="lazy">' : '<span class="' + cls + ' ilu c-' + i.cat.normalize('NFD').replace(/[^a-z]/gi, '').toLowerCase() + '" aria-hidden="true">' + i.nome.charAt(0) + '</span>'; }
    var contaQr = function () { return C.contaMesa(MESA); };
    var ETAPA_CLI = { novo: 'Recebido', preparando: 'Preparando', pronto: 'Pronto, já vai para a mesa', entregue: 'Na mesa' };

    function telaQrMenu() {
      var total = 0, n = 0;
      Object.keys(qrCarrinho).forEach(function (k) { total += qrCarrinho[k] * C.itemDe(k).preco; n += qrCarrinho[k]; });
      return '<div class="qr-topo"><b>Coadouro</b><span>Mesa ' + MESA + ' · você leu o QR code da mesa</span></div>' +
        C.CATS.map(function (cat) { var its = D().itens.filter(function (i) { return i.cat === cat && i.disp; }); if (!its.length) return '';
          return '<h3 class="qr-cat">' + cat + '</h3><ul class="qr-itens">' + its.map(function (i) { var q = qrCarrinho[i.id] || 0;
            return '<li>' + foto(i, 'qr-foto') + '<span class="qr-nome"><b id="qn-' + i.id + '">' + esc(i.nome) + '</b><span>' + R(i.preco) + (i.det ? ' · ' + esc(i.det) : '') + '</span></span>' +
              (q ? '<span class="qr-passo" role="group" aria-labelledby="qn-' + i.id + '"><button type="button" data-qr="-1" data-id="' + i.id + '" aria-label="Tirar um ' + esc(i.nome) + '">−</button><output>' + q + '</output><button type="button" data-qr="1" data-id="' + i.id + '" aria-label="Pôr mais um ' + esc(i.nome) + '">+</button></span>'
                : '<button class="qr-add" type="button" data-qr="1" data-id="' + i.id + '" aria-label="Pôr ' + esc(i.nome) + ' no pedido">+</button>') + '</li>'; }).join('') + '</ul>'; }).join('') +
        '<div class="qr-pe">' + (contaQr() ? '<button class="qr-link" type="button" data-qr-ir="acompanhar">Ver meu pedido</button>' : '') +
        '<button class="qr-enviar" type="button" id="qr-enviar"' + (n ? '' : ' disabled') + '>' + (n ? 'Enviar pedido · ' + C.plural(n, 'item', 'itens') + ' · ' + R(total) : 'Escolha o que quer pedir') + '</button></div>';
    }
    function telaQrAcompanhar() {
      var c = contaQr(); if (!c) { qrTela = 'menu'; return telaQrMenu(); }
      var k = C.calc(c), ps = k.ps.slice().sort(function (a, b) { return a.criado - b.criado; });
      return '<div class="qr-topo"><b>Seu pedido · Mesa ' + MESA + '</b><span>Atualiza sozinho, não precisa chamar o garçom</span></div><ul class="qr-acomp">' + ps.map(function (p) {
        var ord = ['novo', 'preparando', 'pronto', 'entregue'], i = ord.indexOf(p.etapa);
        return '<li><div class="qa-topo"><b>' + C.num(p) + '</b><span>' + p.itens.map(function (l) { return l.q + '× ' + esc(l.nome); }).join(', ') + '</span></div><ol class="qa-passos">' +
          ord.map(function (e, j) { return '<li class="' + (j < i ? 'feito' : j === i ? 'agora' : '') + '">' + ETAPA_CLI[e].split(',')[0] + '</li>'; }).join('') + '</ol><p class="qa-agora">' + ETAPA_CLI[p.etapa] + '</p></li>'; }).join('') + '</ul>' +
        '<div class="qr-conta"><span>Total da mesa' + (k.serv ? ' (com 10% de serviço)' : '') + '</span><b>' + R(k.total) + '</b></div>' +
        '<div class="qr-pe">' + (c.pediuConta ? '<button class="qr-enviar" type="button" data-qr-ir="pix">Pagar ' + R(k.falta) + ' com Pix</button>' : '<button class="qr-link" type="button" data-qr-ir="menu">Pedir mais coisas</button><button class="qr-enviar" type="button" id="qr-conta">Pedir a conta</button>') + '</div>';
    }
    function telaQrPix() {
      var c = contaQr(); if (!c) { qrTela = 'fim'; return telaQrFim(); }
      var k = C.calc(c), cel = '';
      for (var y = 0; y < 11; y++) for (var x = 0; x < 11; x++) if (((x * 7 + y * 13 + x * y) % 5 < 2) || (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7)) cel += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
      return '<div class="qr-topo"><b>Pagar com Pix</b><span>Mesa ' + MESA + ' · ' + R(k.falta) + '</span></div><div class="pix"><svg viewBox="-1 -1 13 13" role="img" aria-label="Código Pix de exemplo">' + cel + '</svg><p>Abra o app do banco e leia o código, ou copie e cole.</p><button class="qr-link" type="button" id="pix-copiar">Copiar código Pix</button></div>' +
        '<div class="qr-pe"><button class="qr-enviar" type="button" id="pix-pago">Já paguei</button></div>';
    }
    function telaQrFim() { return '<div class="qr-fim"><span class="qf-ok" aria-hidden="true">✓</span><b>Pagamento recebido. Obrigado!</b><p>A Coadouro já recebeu. Volte sempre ☕</p><button class="qr-link" type="button" id="qr-novo">Fazer um novo pedido</button></div>'; }

    function conversas() { var g = {}; D().chat.forEach(function (m) { (g[m.cli] = g[m.cli] || []).push(m); }); return Object.keys(g).map(function (k) { return { cli: k, ms: g[k], ult: g[k][g[k].length - 1] }; }).sort(function (a, b) { return D().chat.indexOf(b.ult) - D().chat.indexOf(a.ult); }); }
    function telaZap() {
      if (conversa) {
        var ms = D().chat.filter(function (m) { return m.cli === conversa; });
        return '<div class="zap-topo"><button type="button" class="zap-volta" id="zap-volta" aria-label="Voltar para as conversas">‹</button><span class="zap-av" aria-hidden="true">' + conversa.charAt(0) + '</span><span><b>' + esc(conversa) + '</b><small>visto pela Coadouro</small></span></div>' +
          '<ol class="zap-msgs">' + ms.map(function (m) { return '<li class="' + m.de + (m.novo ? ' nova' : '') + '"><span>' + esc(m.t) + '</span><small>' + hm(C.min(m.h)) + (m.de === 'loja' ? ' ✓✓' : '') + '</small></li>'; }).join('') + '</ol>';
      }
      var cs = conversas();
      return '<div class="zap-topo"><b>WhatsApp da Coadouro</b></div><p class="zap-dica">As conversas dos clientes com a cafeteria. As mensagens que o sistema manda aparecem aqui.</p><ul class="zap-lista">' + (cs.length ? cs.map(function (c) { return '<li><button type="button" data-conversa="' + esc(c.cli) + '"><span class="zap-av" aria-hidden="true">' + c.cli.charAt(0) + '</span><span class="zl-txt"><b>' + esc(c.cli) + '</b><span>' + esc(c.ult.t) + '</span></span><small>' + hm(C.min(c.ult.h)) + '</small></button></li>'; }).join('') : '<li class="vazio">Nenhuma conversa ainda.</li>') + '</ul>';
    }
    function desenhaCel() {
      var focoId = document.activeElement && cel.contains(document.activeElement) ? (document.activeElement.id || (document.activeElement.dataset.qr ? 'qr:' + document.activeElement.dataset.id + ':' + document.activeElement.dataset.qr : '')) : '';
      $('#cel-hora').textContent = hm(C.agora()).replace('h', ':').replace(/:$/, ':00');
      $('#cel-conteudo').innerHTML = aba === 'zap' ? telaZap() : qrTela === 'acompanhar' ? telaQrAcompanhar() : qrTela === 'pix' ? telaQrPix() : qrTela === 'fim' ? telaQrFim() : telaQrMenu();
      if (aba === 'zap' && conversa) { var l = $('.zap-msgs'); if (l) l.scrollTop = l.scrollHeight; }
      if (focoId) { var el = focoId.indexOf('qr:') === 0 ? $('[data-id="' + focoId.split(':')[1] + '"][data-qr="' + focoId.split(':')[2] + '"]') || $('[data-id="' + focoId.split(':')[1] + '"]') : document.getElementById(focoId); if (el) el.focus(); }
    }
    $('#cel-conteudo').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.qr) { var id = b.dataset.id; qrCarrinho[id] = Math.max(0, (qrCarrinho[id] || 0) + +b.dataset.qr); if (!qrCarrinho[id]) delete qrCarrinho[id]; desenhaCel(); var nb = $('[data-id="' + id + '"][data-qr="' + b.dataset.qr + '"]') || $('[data-id="' + id + '"]'); if (nb) nb.focus(); }
      else if (b.id === 'qr-enviar') enviaQr();
      else if (b.dataset.qrIr) { qrTela = b.dataset.qrIr; desenhaCel(); var f = $('#cel-conteudo button'); if (f) f.focus(); }
      else if (b.id === 'qr-conta') { var c = contaQr(); c.pediuConta = true; C.salva(); S.aviso('A mesa ' + MESA + ' pediu a conta pelo celular.'); var pb = $('[data-qr-ir="pix"]'); if (pb) pb.focus(); }
      else if (b.id === 'pix-copiar') S.aviso('Código Pix copiado (exemplo).');
      else if (b.id === 'pix-pago') pagaPix();
      else if (b.id === 'qr-novo') { qrTela = 'menu'; qrCarrinho = {}; desenhaCel(); }
      else if (b.dataset.conversa) { conversa = b.dataset.conversa; desenhaCel(); $('#zap-volta').focus(); }
      else if (b.id === 'zap-volta') { conversa = null; desenhaCel(); }
    });
    function enviaQr(auto) {
      if (!Object.keys(qrCarrinho).length) qrCarrinho = { cappuccino: 1, croissant: 1 };
      var p = C.criaPedido({ tipo: 'mesa', mesa: MESA, itens: qrCarrinho, origem: 'QR da mesa' });
      qrCarrinho = {}; qrTela = 'acompanhar'; desenhaCel(); destaca(p);
      S.aviso('Novo pedido pelo QR code: Mesa ' + MESA + ' (' + C.num(p) + '). Já está no quadro e na cozinha.');
      document.dispatchEvent(new CustomEvent('uau:qr', { detail: p }));
      return p;
    }
    function pagaPix() {
      var c = contaQr(); if (!c) return; var k = C.calc(c);
      c.pags.push({ forma: 'Pix', valor: k.falta, min: C.agora(), recebido: 0 }); c.fechada = C.agora();
      qrTela = 'fim'; C.salva(); S.aviso('Mesa ' + MESA + ' pagou ' + R(k.falta) + ' no Pix pelo celular. Conta fechada e mesa liberada.');
      var f = $('#qr-novo'); if (f) f.focus();
    }

    // mensagens que o sistema manda vão para o WhatsApp do celular
    var demoOriginal = S.demo;
    S.demo = function (msg, titulo) {
      var m = /^Olá, ([^!]+)!/.exec(msg), nome = null;
      if (m) { var cli = C.hoje().map(function (p) { return p.cli; }).filter(function (n) { return n && n.split(' ')[0] === m[1]; })[0]; nome = cli || null; }
      if (!nome) { demoOriginal(msg, titulo); return; }
      zap(nome, 'loja', msg);
      if (/pronto para retirada/.test(msg)) setTimeout(function () { zap(nome, 'cli', 'Show! Já tô chegando 🙌'); }, 2500);
      if (/saiu para entrega/.test(msg)) setTimeout(function () { zap(nome, 'cli', 'Oba, obrigado!'); }, 2500);
      S.aviso('Mensagem enviada para ' + nome + ' no WhatsApp. Veja no celular do cliente.');
    };
    function zap(cli, de, t) {
      D().chat.forEach(function (x) { x.novo = false; });
      D().chat.push({ cli: cli, de: de, h: hstrA(), t: t, novo: true }); C.G.salva();
      aba = 'zap'; conversa = cli; $$('[data-cel]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.cel === 'zap' ? 'true' : 'false'); });
      if (!document.documentElement.classList.contains('cel-aberto')) { if (largo()) mostraCel(true); else { naoLidas++; marcaNaoLidas(); } }
      desenhaCel();
    }

    /* ================= pedidos chegando sozinhos ================= */
    var CHEGADAS = [
      { tipo: 'retirada', cli: 'Marina Alves', itens: { cappuccino: 1, paodequeijo: 2 }, t: 'Oi! Me separa 1 cappuccino e 2 pães de queijo? Chego em uns 20 minutos.' },
      { tipo: 'mesa', itens: { coldbrew: 2 } },
      { tipo: 'retirada', cli: 'Pedro Henrique', itens: { coado: 2, bolo: 1 }, t: 'Bom dia! 2 coados e 1 fatia de bolo pra viagem, por favor.' },
      { tipo: 'mesa', itens: { espresso: 2, croissant: 1 } },
      { tipo: 'retirada', cli: 'Luana Freitas', itens: { garrafa: 1 }, t: 'Vocês têm a garrafa de cold brew? Quero 1 pra levar.' },
      { tipo: 'mesa', itens: { cappuccino: 2, paodequeijo: 2 } }
    ];
    var aoVivo = lembra('coadouro-ao-vivo') !== 'nao', proxima = Date.now() + 25000;
    var botaoVivo = $('#ao-vivo');
    function marcaVivo() { botaoVivo.setAttribute('aria-pressed', aoVivo ? 'true' : 'false'); botaoVivo.classList.toggle('pausado', !aoVivo); }
    botaoVivo.addEventListener('click', function () { aoVivo = !aoVivo; lembra('coadouro-ao-vivo', aoVivo ? 'sim' : 'nao'); marcaVivo(); proxima = Date.now() + 15000; S.aviso(aoVivo ? 'Ao vivo: novos pedidos vão chegar sozinhos.' : 'Pausado: nenhum pedido novo vai chegar sozinho.'); });
    marcaVivo();
    function chegaUm() {
      var d = D(), c = CHEGADAS[d.chegadas % CHEGADAS.length]; d.chegadas++;
      if (c.tipo === 'mesa') {
        var livre = C.MESAS.map(function (m) { return m[0]; }).filter(function (n) { return n !== MESA && !C.contaMesa(n); })[0] || 8;
        var p = C.criaPedido({ tipo: 'mesa', mesa: livre, itens: c.itens, origem: 'QR da mesa' });
        S.aviso('Novo pedido pelo QR code: Mesa ' + livre + ' (' + C.num(p) + ').');
      } else {
        var nome = c.cli + (d.chegadas > CHEGADAS.length ? ' ' + Math.ceil(d.chegadas / CHEGADAS.length) : '');
        d.chat.push({ cli: nome, de: 'cli', h: hstrA(), t: c.t });
        var p2 = C.criaPedido({ tipo: 'retirada', cli: nome, itens: c.itens, origem: 'WhatsApp' });
        zap(nome, 'loja', 'Oi, ' + nome.split(' ')[0] + '! Anotado: pedido ' + C.num(p2) + ', ' + R(C.totalPed(p2)) + ', retirada às ' + hm(C.min(p2.hora)) + '. Te aviso quando estiver pronto ☕ (resposta automática)');
        S.aviso('Novo pedido pelo WhatsApp: ' + nome + ' (' + C.num(p2) + '). O atendente automático já respondeu.');
        p = p2;
      }
      destaca(p);
    }
    function ocupado() { return passeio.ativo || $$('dialog').some(function (d) { return d.open; }) || document.hidden; }
    setInterval(function () { if (!aoVivo || D().chegadas >= 12) return; if (Date.now() < proxima) return; if (ocupado()) { proxima = Date.now() + 8000; return; } chegaUm(); proxima = Date.now() + 50000; }, 2000);
    function destaca(p) { var a = $('#p-' + p.n); if (a) { a.classList.remove('chegou'); void a.offsetWidth; a.classList.add('chegou'); } }

    /* ================= alertas antes do problema ================= */
    var dispensados = {};
    function alertas() {
      var out = [], ag = C.agora();
      C.hoje().filter(function (p) { return (p.etapa === 'novo' || p.etapa === 'preparando') && ag - p.criado > 15 && !dispensados['a' + p.n]; }).sort(function (a, b) { return a.criado - b.criado; }).slice(0, 2).forEach(function (p) {
        out.push({ k: 'a' + p.n, nivel: 'perigo', ic: 'relogio', t: '<b>' + esc(C.titulo(p)) + '</b> espera há ' + (ag - p.criado) + ' min (' + C.num(p) + ').', b: p.cli ? 'Avisar o cliente do atraso' : 'Avisar o garçom', fn: function () {
          if (p.cli) S.demo('Olá, ' + C.primeiro(p.cli) + '! Seu pedido ' + C.num(p) + ' está saindo em até 10 minutos. Desculpe a demora!', 'Aviso de atraso'); else S.aviso('Garçom avisado: a mesa ' + p.mesa + ' está esperando.'); } });
      });
      D().contas.filter(function (c) { return c.tipo === 'mesa' && c.pediuConta && !c.fechada && !dispensados['c' + c.id]; }).forEach(function (c) {
        out.push({ k: 'c' + c.id, nivel: 'alerta', ic: 'moeda', t: '<b>Mesa ' + c.mesa + '</b> pediu a conta: ' + R(C.calc(c).falta) + '.', b: 'Receber', fn: function () { C.abrePag(c.id); }, fica: true });
      });
      var vend = {}; C.hoje().forEach(function (p) { p.itens.forEach(function (l) { vend[l.id] = (vend[l.id] || 0) + l.q; }); });
      var prev = D().itens.filter(function (i) { return i.ini && i.disp && !dispensados['e' + i.id]; }).map(function (i) { var v = vend[i.id] || 0, resta = i.ini - v, ritmo = v / Math.max(30, ag - 7 * 60); return { i: i, resta: resta, quando: resta <= 0 ? ag : ritmo > 0 ? ag + resta / ritmo : 9999 }; }).sort(function (a, b) { return a.quando - b.quando; })[0];
      if (prev && prev.quando < 15 * 60) out.push({ k: 'e' + prev.i.id, nivel: 'alerta', ic: 'fogo', t: prev.resta <= 0 ? '<b>' + esc(prev.i.nome) + '</b> acabou.' : 'No ritmo de hoje, o <b>' + esc(prev.i.nome.toLowerCase()) + '</b> acaba por volta das <b>' + hm(Math.round(prev.quando / 5) * 5) + '</b> (restam ' + prev.resta + ').', b: prev.resta <= 0 ? 'Marcar como esgotado' : 'Pedir para a cozinha fazer mais', fn: function () { if (prev.resta <= 0) { prev.i.disp = false; C.salva(); S.aviso(prev.i.nome + ' marcado como esgotado. Ele some do cardápio do QR.'); } else S.aviso('Cozinha avisada: fazer mais ' + prev.i.nome.toLowerCase() + '.'); } });
      $('#alertas').innerHTML = out.length ? '<h2 class="al-tit"><i aria-hidden="true"></i>Atenção agora</h2><ul>' + out.slice(0, 3).map(function (a, j) { return '<li class="al-' + a.nivel + '"><svg class="ico" aria-hidden="true"><use href="#i-' + a.ic + '"/></svg><span>' + a.t + '</span><button class="btn btn-s btn-sm" type="button" data-alerta="' + j + '">' + a.b + '</button></li>'; }).join('') + '</ul>' : '';
      alertas.lista = out.slice(0, 3);
    }
    $('#alertas').addEventListener('click', function (e) { var b = e.target.closest('[data-alerta]'); if (!b) return; var a = alertas.lista[+b.dataset.alerta]; if (!a.fica) dispensados[a.k] = true; a.fn(); alertas(); var nb = $('#alertas button'); if (nb) nb.focus(); });

    /* ================= quanto devolve e gráfico por hora ================= */
    function devolve() {
      var n = function (id) { return Math.max(0, parseFloat(($(id).value || '0').replace(',', '.')) || 0); };
      var horas = Math.round(n('#dv-ped') * n('#dv-min') * 26 * 0.6 / 60), reais = Math.round(n('#dv-esq') * 4.3 * n('#dv-tic'));
      conta($('#dv-horas'), horas, function (v) { return v + ' h'; }); conta($('#dv-reais'), reais, function (v) { return 'R$ ' + v.toLocaleString('pt-BR'); });
    }
    function conta(el, alvo, fmt) {
      var de = +el.dataset.v || 0; el.dataset.v = alvo;
      if (reduz || de === alvo) { el.textContent = fmt(alvo); return; }
      var t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(de + (alvo - de) * e)); if (k < 1) requestAnimationFrame(f); })(t0);
    }
    $('#devolve').addEventListener('input', devolve);
    function porHora() {
      var ag = C.agora(), h0 = 7, h1 = Math.floor(ag / 60), cont = {};
      C.hoje().forEach(function (p) { var h = Math.floor(p.criado / 60); cont[h] = (cont[h] || 0) + 1; });
      var hs = []; for (var h = h0; h <= h1; h++) hs.push(h);
      var max = Math.max.apply(null, hs.map(function (h) { return cont[h] || 0; }).concat([1])), pico = hs.filter(function (h) { return (cont[h] || 0) === max; })[0];
      $('#por-hora').innerHTML = '<ol>' + hs.map(function (h) { var v = cont[h] || 0; return '<li class="' + (h === pico ? 'pico' : '') + '"><span class="ph-v">' + v + '</span><i style="height:' + (v / max * 100).toFixed(0) + '%" aria-hidden="true"></i><span class="ph-h">' + h + 'h</span><span class="sr">: ' + C.plural(v, 'pedido', 'pedidos') + '</span></li>'; }).join('') + '</ol><p class="dica-bloco">Pico até agora: <b>' + pico + 'h</b>, com ' + C.plural(max, 'pedido', 'pedidos') + '. Bom horário para ter mais gente no balcão.</p>';
    }

    /* ================= passeio guiado ================= */
    var passeio = { ativo: false, i: 0 };
    var luz = document.createElement('div'); luz.className = 'ps-luz'; luz.hidden = true; document.body.appendChild(luz);
    var caixa = document.createElement('div'); caixa.className = 'ps-caixa'; caixa.hidden = true; caixa.setAttribute('role', 'dialog'); caixa.setAttribute('aria-labelledby', 'ps-tit'); caixa.setAttribute('aria-describedby', 'ps-txt'); document.body.appendChild(caixa);
    var novoP = null;
    var PASSOS = [
      { alvo: function () { return $('#quadro'); }, tela: 'pedidos', tit: 'Uma manhã na Coadouro', txt: 'São 9h40. Este é o quadro de pedidos: tudo o que chega (mesa, balcão e WhatsApp) cai aqui, na ordem.' },
      { alvo: function () { return $('#celular .aparelho'); }, cel: 'qr', tit: 'Agora você é o cliente', txt: 'Na mesa 5, o cliente leu o QR code e está pedindo pelo celular. Toque em + num item e depois em "Enviar pedido".', espera: 'uau:qr', faz: function () { enviaQr(); } },
      { alvo: function () { return novoP && $('#p-' + novoP.n); }, tela: 'pedidos', tit: 'Chegou na hora', txt: 'O pedido caiu no quadro e na cozinha, sem ninguém anotar. Toque em "Preparando" para a cozinha começar.', espera: 'uau:move', faz: function () { C.move(novoP, 'preparando'); document.dispatchEvent(new CustomEvent('uau:move')); } },
      { alvo: function () { return $('#celular .aparelho'); }, cel: 'qr', tit: 'O cliente acompanha', txt: 'No celular, o cliente já vê "Preparando". Ninguém precisa chamar o garçom para perguntar se vai demorar.' },
      { alvo: function () { return $('#alertas'); }, tela: 'pedidos', tit: 'Avisa antes do problema', txt: 'O sistema mostra o que precisa de atenção: pedido atrasado, mesa pedindo a conta, salgado que vai acabar antes do almoço.' },
      { alvo: function () { return $('#devolve'); }, tela: 'caixa', tit: 'O que importa para o dono', txt: 'Quanto o sistema devolve em tempo e dinheiro. Troque pelos números do seu negócio. Depois explore à vontade: novos pedidos continuam chegando sozinhos. Lembrando: esta é uma prévia das funcionalidades, não o sistema final. O seu é feito sob medida.' }
    ];
    function posiciona() {
      if (!passeio.ativo) return; var p = PASSOS[passeio.i], el = p.alvo();
      if (!el) { luz.hidden = true; return; }
      var r = el.getBoundingClientRect(), m = 6;
      luz.hidden = false; luz.style.width = (r.width + 2 * m) + 'px'; luz.style.height = (r.height + 2 * m) + 'px'; luz.style.transform = 'translate(' + Math.round(r.left - m) + 'px,' + Math.round(r.top - m) + 'px)';
      var cw = caixa.offsetWidth, ch = caixa.offsetHeight, vw = innerWidth, vh = innerHeight, x, y;
      if (r.right + 16 + cw < vw) { x = r.right + 16; y = Math.min(Math.max(16, r.top), vh - ch - 16); }
      else if (r.left - 16 - cw > 0) { x = r.left - 16 - cw; y = Math.min(Math.max(16, r.top), vh - ch - 16); }
      else { x = Math.max(16, Math.min(vw - cw - 16, r.left)); y = r.bottom + 16 + ch < vh ? r.bottom + 16 : Math.max(16, r.top - ch - 16); if (y + ch > vh - 16) y = vh - ch - 16; }
      caixa.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    }
    function passo(i) {
      passeio.i = i; var p = PASSOS[i];
      if (p.tela && C.tela() !== p.tela) C.vaiTela(p.tela);
      if (p.cel) { trocaAba(p.cel); if (p.cel === 'qr' && qrTela === 'fim') qrTela = 'menu'; mostraCel(true); desenhaCel(); }
      else if (!largo()) mostraCel(false);
      var el = p.alvo(); if (el) el.scrollIntoView({ block: 'center', behavior: reduz ? 'auto' : 'smooth' });
      caixa.innerHTML = '<p class="ps-n">Passo ' + (i + 1) + ' de ' + PASSOS.length + '</p><h2 id="ps-tit" tabindex="-1">' + p.tit + '</h2><p id="ps-txt">' + p.txt + '</p><div class="ps-botoes"><button class="btn btn-s btn-sm" type="button" data-ps="sair">Sair do passeio</button>' +
        (p.espera ? '<button class="btn btn-s btn-sm" type="button" data-ps="faz">Fazer por mim</button>' : '<button class="btn btn-p btn-sm" type="button" data-ps="prox">' + (i === PASSOS.length - 1 ? 'Explorar sozinho' : 'Próximo') + '</button>') + '</div>';
      caixa.hidden = false; setTimeout(function () { posiciona(); $('#ps-tit').focus({ preventScroll: true }); }, reduz ? 0 : 380);
    }
    function comecaPasseio() { passeio.ativo = true; document.body.classList.add('em-passeio'); lembra('coadouro-passeio', 'visto'); passo(0); }
    function terminaPasseio() { passeio.ativo = false; document.body.classList.remove('em-passeio'); luz.hidden = true; caixa.hidden = true; proxima = Date.now() + 20000; $('#ver-passeio').focus(); }
    caixa.addEventListener('click', function (e) { var b = e.target.closest('[data-ps]'); if (!b) return;
      if (b.dataset.ps === 'sair') terminaPasseio();
      else if (b.dataset.ps === 'prox') { if (passeio.i >= PASSOS.length - 1) terminaPasseio(); else passo(passeio.i + 1); }
      else if (b.dataset.ps === 'faz') { PASSOS[passeio.i].faz(); } });
    document.addEventListener('uau:qr', function (e) { novoP = e.detail; if (passeio.ativo && PASSOS[passeio.i].espera === 'uau:qr') setTimeout(function () { passo(passeio.i + 1); }, 500); });
    document.addEventListener('uau:move', function () { if (passeio.ativo && PASSOS[passeio.i].espera === 'uau:move') setTimeout(function () { passo(passeio.i + 1); }, 400); });
    document.addEventListener('click', function (e) { var b = e.target.closest('[data-move]'); if (b && novoP && passeio.ativo && b.closest('#p-' + novoP.n)) setTimeout(function () { document.dispatchEvent(new CustomEvent('uau:move')); }, 50); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && passeio.ativo && !$$('dialog').some(function (d) { return d.open; })) terminaPasseio(); });
    addEventListener('resize', posiciona); addEventListener('scroll', posiciona, { passive: true });
    $('#ver-passeio').addEventListener('click', comecaPasseio);

    /* ================= ligar tudo ================= */
    function atualiza() { alertas(); if (C.tela() === 'caixa') { devolve(); porHora(); } desenhaCel(); if (passeio.ativo) setTimeout(posiciona, 30); }
    C.EV.push(atualiza);
    setInterval(function () { alertas(); if (aba === 'qr' && qrTela !== 'menu') desenhaCel(); }, 15000);
    if (largo()) mostraCel(true);
    atualiza(); devolve();
    if (!lembra('coadouro-passeio') && !/[?&]sem-passeio/.test(location.search)) setTimeout(comecaPasseio, 900);
    window.UAU = { chegaUm: chegaUm, enviaQr: enviaQr, passeio: passeio, comecaPasseio: comecaPasseio };
  }
  if (window.COADOURO) inicia(); else document.addEventListener('coadouro:pronto', inicia);
})();
