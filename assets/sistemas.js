/* Página /sistemas/ · "Simule cada sistema" (4 negócios × 3 funcionalidades, os dois lados) e calculadora "quanto devolve". Sem dependências. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var real = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var R = function (v) { return real.format(v).replace(/ /g, ' '); };
  var R0 = function (v) { return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); };
  var hoje = new Date(), d2 = function (n) { return String(n).padStart(2, '0'); };
  var dm = function (mais) { var d = new Date(hoje); d.setDate(d.getDate() + mais); return d2(d.getDate()) + '/' + d2(d.getMonth() + 1); };
  var semana = function (mais) { var d = new Date(hoje); d.setDate(d.getDate() + mais); while (d.getDay() === 0) d.setDate(d.getDate() + 1); return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()] + ', ' + d2(d.getDate()) + '/' + d2(d.getMonth() + 1); };
  var FOTO = '/demos/cafeteria/assets/img/';

  /* pedaços de tela reaproveitados */
  var topo = function (t, kpi, v) { return '<div class="xd-topo"><b>' + t + '</b>' + (kpi ? '<span class="xd-kpi">' + kpi + ' <strong>' + v + '</strong></span>' : '') + '</div>'; };
  var linha = function (tit, sub, selo, novo) { return '<li class="' + (novo ? 'x-novo' : '') + '"><span><b>' + tit + '</b><small>' + sub + '</small></span>' + (selo || '') + '</li>'; };
  var lista = function (itens) { return '<ul class="xd-lista">' + itens.join('') + '</ul>'; };
  var selo = function (cls, t) { return '<i class="' + cls + '">' + t + '</i>'; };
  var barra = function (p, cls) { return '<span class="xd-barra"><i class="' + (cls || '') + '" style="width:' + Math.min(100, p) + '%"></i></span>'; };
  var novo = function (t, a, b) { return '<div class="xd-novo x-novo"><b>' + t + '</b>' + (a ? '<span>' + a + '</span>' : '') + (b ? '<span>' + b + '</span>' : '') + '</div>'; };
  var celTopo = function (t, s) { return '<div class="xt-topo"><b>' + t + '</b><small>' + s + '</small></div>'; };
  var zap = function (nome, sub, msgs) { return '<div class="xt-zap"><span class="xt-av" aria-hidden="true">' + nome[0] + '</span><span><b>' + nome + '</b><small>' + sub + '</small></span></div><ol class="xt-msgs">' + msgs.join('') + '</ol>'; };
  var msg = function (quem, t, h, cls) { return '<li class="' + quem + (cls ? ' ' + cls : '') + '"><span>' + t + '</span><small>' + h + '</small></li>'; };
  var espera = function (t) { return '<div class="xt-vazio">' + t + '</div>'; };

  /* ================= os 4 negócios, 3 funcionalidades cada ================= */
  var CENAS = {
    cafe: { dono: 'Painel da Coadouro', funcs: [
      { nome: 'Pedido pelo QR', desc: 'o cliente pede da mesa', cel: 'Celular do cliente · mesa 5', botao: 'Pedir pelo QR da mesa',
        log: ['O pedido chegou no quadro e na cozinha, sem ninguém anotar.', 'A cozinha começou, e o cliente vê "Preparando" no celular.', 'Ficou pronto: o garçom leva e o cliente já sabe que está chegando.'],
        donoHtml: function (f) {
          var col = function (nome, cards) { return '<div class="xc-col"><span class="xc-ct">' + nome + '</span>' + cards + '</div>'; };
          var card = function (n, t, sub, nv) { return '<div class="xc-card' + (nv ? ' x-novo' : '') + '"><span>' + n + '</span><b>' + t + '</b><small>' + sub + '</small></div>'; };
          var nv = card('#0438', 'Mesa 5', '<i class="x-qr">Pelo QR</i> 1 cappuccino, 1 croissant', true);
          return topo('Pedidos de hoje', 'Vendas hoje', R(f ? 537.7 : 514.7)) +
            '<div class="xc-quadro">' + col('Novo', (f === 1 ? nv : '') + card('#0431', 'Igor Martins', 'Retirada · 10h')) + col('Preparando', (f === 2 ? nv : '') + card('#0430', 'Mesa 4', '2 bolos do dia')) + col('Pronto', (f === 3 ? nv : '') + card('#0429', 'Mesa 9', 'Levar à mesa')) + '</div>';
        },
        celHtml: function (f) {
          if (!f) return celTopo('Coadouro', 'Mesa 5 · você leu o QR code') + '<ul class="xt-itens"><li><img src="' + FOTO + 'm-capuccino-400.webp" alt="" width="44" height="44"><span><b>Cappuccino</b><small>R$ 12,00</small></span><i>1</i></li><li><img src="' + FOTO + 'm-croissant-400.webp" alt="" width="44" height="44"><span><b>Croissant</b><small>R$ 11,00</small></span><i>1</i></li></ul><button class="xt-btn" type="button" data-exp-rodar>Enviar pedido · R$ 23,00</button>';
          var et = ['Recebido', 'Preparando', 'Pronto'];
          return celTopo('Seu pedido · Mesa 5', 'Atualiza sozinho') + '<div class="xt-status"><b>#0438</b><span>1 cappuccino, 1 croissant</span><ol class="xt-passos">' + et.map(function (e, i) { return '<li class="' + (i + 1 < f ? 'feito' : i + 1 === f ? 'agora' : '') + '">' + e + '</li>'; }).join('') + '</ol><p class="xt-agora">' + ['', 'Pedido recebido pela cozinha', 'Preparando o seu pedido…', 'Pronto! O garçom já está levando ☕'][f] + '</p></div>';
        } },
      { nome: 'Conta dividida', desc: 'cada um paga a sua parte', cel: 'Celular de quem paga · mesa 7', botao: 'Dividir a conta da mesa 7',
        log: ['A conta de R$ 96,00 foi dividida em 3 partes de R$ 32,00.', 'Duas pessoas pagaram: uma no Pix pelo celular, outra no cartão.', 'A última pagou R$ 50,00 em dinheiro: o troco de R$ 18,00 já aparece e a mesa fica livre.'],
        donoHtml: function (f) {
          var p = [['Pessoa 1', 'Pix'], ['Pessoa 2', 'Cartão'], ['Pessoa 3', 'Dinheiro · troco R$ 18,00']];
          var pago = [f >= 2, f >= 2, f >= 3];
          return topo('Mesa 7 · conta', 'Total', 'R$ 96,00') + lista(f ? p.map(function (x, i) { return linha(x[0] + ' · R$ 32,00', pago[i] ? x[1] : 'aguardando', pago[i] ? selo('x-ok', 'Pago') : selo('x-azul', 'Aberto'), f === 1 || (f === 2 && i < 2) || (f === 3 && i === 2)); }) :
            [linha('2 cold brew', 'R$ 36,00'), linha('3 pães de queijo', 'R$ 24,00'), linha('2 bolos do dia', 'R$ 36,00')]) +
            (f >= 3 ? novo('Mesa 7 liberada', 'Conta fechada em 3 pagamentos', 'Tudo já entrou no caixa do dia') : '');
        },
        celHtml: function (f) {
          if (!f) return celTopo('Coadouro · Mesa 7', 'Conta da mesa') + espera('O garçom vai dividir a conta…');
          return celTopo('Sua parte · Mesa 7', 'Pessoa 1 de 3') + '<div class="xt-pix"><b>R$ 32,00</b><svg viewBox="0 0 21 21" aria-hidden="true"><path d="M1 1h7v7H1zM13 1h7v7h-7zM1 13h7v7H1zM10 1h2v4h-2zM10 7h2v6h-2zM13 10h3v2h-3zM17 10h3v3h-3zM13 13h2v3h-2zM16 15h4v2h-4zM10 15h2v5h-2zM15 18h5v2h-5z"/></svg>' +
            (f >= 2 ? '<span class="xt-ok x-novo">Pix recebido ✓ Obrigado!</span>' : '<span>Pague com o Pix pelo celular</span>') + '</div>';
        } },
      { nome: 'Fechar o caixa', desc: 'o dia resumido num toque', cel: 'WhatsApp do dono', botao: 'Fechar o caixa de hoje',
        log: ['O sistema somou tudo o que entrou hoje, separado por forma de pagamento.', 'Conferiu o dinheiro da gaveta: o que devia ter e o que tem batem.', 'Caixa fechado. O resumo do dia chegou no WhatsApp do dono.'],
        donoHtml: function (f) {
          var fp = [['Pix', 1240.5], ['Cartão', 986], ['Dinheiro', 310]];
          return topo('Caixa de hoje', 'Total', f ? R(2536.5) : '—') + lista(fp.map(function (x) { return '<li><span><b>' + x[0] + '</b><small>' + (f ? R(x[1]) : 'somando…') + '</small></span>' + barra(f ? x[1] / 12.4 : 0) + '</li>'; })) +
            (f >= 2 ? novo('Gaveta conferida ✓', 'Esperado R$ 310,00 · contado R$ 310,00', '98 pedidos · ticket médio R$ 25,88') : '');
        },
        celHtml: function (f) {
          var m = [msg('cli', 'Bom dia! Caixa aberto às 7h ☕', '07:02')];
          if (f >= 3) m.push(msg('loja', 'Resumo de hoje · Coadouro\nTotal: R$ 2.536,50\nPix R$ 1.240,50 · Cartão R$ 986,00 · Dinheiro R$ 310,00\n98 pedidos · mais vendido: cappuccino', 'agora', 'x-novo'));
          return zap('Coadouro · sistema', 'avisos do caixa', m);
        } }
    ] },

    marc: { dono: 'Painel da Respiga Marcenaria', funcs: [
      { nome: 'Orçamento por ambiente', desc: 'medida vira valor sozinha', cel: 'Celular da cliente', botao: 'Montar o orçamento da cozinha',
        itens: [['Armário superior', 2.4, .7, 1380], ['Armário inferior', 2.4, .85, 1150], ['Torre quente', .6, 2.2, 1450]],
        log: ['Digitou a medida do armário: o sistema calculou o m² e o valor.', 'Os outros móveis entraram do mesmo jeito, sem calculadora.', 'O PDF com a marca saiu pronto e foi para a cliente, com validade e prazo.'],
        donoHtml: function (f) {
          var it = this.itens, n = f >= 2 ? 3 : f, tot = 0;
          var li = it.slice(0, n).map(function (x, i) { var m2 = x[1] * x[2], v = m2 * x[3]; tot += v; return linha(x[0], x[1].toLocaleString('pt-BR') + ' × ' + x[2].toLocaleString('pt-BR') + ' m = ' + m2.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' m² × ' + R0(x[3]), '<i class="x-azul">' + R(v) + '</i>', (f === 1 && i === 0) || (f === 2 && i > 0)); });
          return topo('Orçamento nº 1045 · Cozinha', 'Total', n ? R(tot) : 'R$ 0,00') + lista(n ? li : [linha('Ambiente: Cozinha', 'Cliente: Juliana Prado · medição feita')]) +
            (f >= 3 ? novo('PDF enviado para a cliente', 'Materiais, mão de obra, pagamento e prazo', 'Validade: 10 dias a partir do recebimento') : '');
        },
        celHtml: function (f) {
          if (f < 3) return celTopo('Respiga Marcenaria', 'Juliana Prado') + espera('O orçamento da sua cozinha está sendo preparado…');
          return celTopo('Orçamento nº 1045', 'PDF · Respiga Marcenaria') + '<div class="xt-pdf x-novo"><b>Cozinha</b><span>Armário superior <i>R$ 2.318</i></span><span>Armário inferior <i>R$ 2.346</i></span><span>Torre quente <i>R$ 1.914</i></span><strong>Total <i>R$ 6.578,40</i></strong><small>Entrada de 40% e saldo na instalação · instalação em até 30 dias · válido por 10 dias</small></div>';
        } },
      { nome: 'Aprovação e assinatura', desc: 'a cliente escolhe e assina', cel: 'Celular da cliente · link do orçamento', botao: 'A cliente aprova o orçamento', escolha: 1,
        opcoes: [['Bom', 'MDF branco', 11900], ['Melhor', 'MDF amadeirado e LED', 13450], ['Premium', 'Amadeirado, LED e puxador embutido', 15800]],
        log: [function () { return 'A cliente comparou 3 opções e escolheu a ' + ['mais simples', 'do meio', 'mais completa'][this.escolha] + '.'; }, 'Assinou pelo celular: o orçamento aprovado vale como combinado.', 'O serviço nasceu sozinho: medição marcada e sinal registrado.'],
        donoHtml: function (f) {
          var op = this.opcoes[this.escolha];
          return topo('Orçamentos', 'Aprovado no mês', R0(21852 + (f >= 2 ? op[2] : 0))) +
            lista([linha('1043 · Mariana Couto', 'Cozinha · 3 opções', f >= 2 ? selo('x-ok', 'Aprovado · ' + op[0]) : selo('x-azul', f === 1 ? 'Escolhendo…' : 'Enviado'), f >= 2), linha('1044 · Rafael Lima', 'Quarto do casal', selo('x-azul', 'Enviado'))]) +
            (f >= 3 ? novo('Serviço criado', 'Medição técnica: ' + semana(3), 'Sinal de ' + R0(op[2] * .4) + ' recebido no Pix') : '');
        },
        celHtml: function (f) {
          var c = this;
          return celTopo('Respiga Marcenaria', 'Orçamento nº 1043 · Cozinha') + '<div class="xt-ops" role="group" aria-label="Opções do orçamento">' + c.opcoes.map(function (o, i) { return '<button type="button" class="xt-op' + (i === c.escolha && f ? ' sel' : '') + '" data-op="' + i + '"' + (f >= 2 ? ' disabled' : '') + ' aria-pressed="' + (i === c.escolha && f ? 'true' : 'false') + '"><b>' + o[0] + (i === 1 ? ' <i>mais escolhido</i>' : '') + '</b><small>' + o[1] + '</small><span>' + R0(o[2]) + '</span></button>'; }).join('') + '</div>' +
            (f >= 2 ? '<div class="xt-assin"><svg viewBox="0 0 220 60" aria-hidden="true"><path pathLength="1" d="M8 40c14-26 22-30 26-8 3 18 10 10 16-6 5-14 10-10 12 4 3 16 11 4 18-6 9-12 16 6 24 2 10-6 18-14 30-8 12 6 22 4 34-6 10-8 18 0 34 2"/></svg><span>Assinado por Mariana Couto</span></div>' : '<button class="xt-btn" type="button" data-exp-rodar>Aprovar e assinar</button>');
        } },
      { nome: 'Lembrete de retorno', desc: 'nenhum orçamento esfria', cel: 'WhatsApp do cliente', botao: 'Ver quem não respondeu',
        log: ['O sistema notou: o orçamento do Paulo está sem resposta há 5 dias.', 'Sugeriu uma mensagem gentil, e ela saiu com um toque.', 'O Paulo respondeu e já pediu para marcar a medição.'],
        donoHtml: function (f) {
          return topo('Orçamentos sem resposta', 'Em aberto', R0(f >= 3 ? 9850 : 18250)) +
            lista([linha('1039 · Paulo Siqueira', 'Home office · enviado há 5 dias', f >= 3 ? selo('x-ok', 'Respondeu') : f === 2 ? selo('x-azul', 'Lembrete enviado') : f ? selo('x-lar', 'Sem resposta') : selo('x-azul', 'Enviado'), f === 1 || f === 3), linha('1041 · Renata Alves', 'Lavanderia · enviado há 2 dias', selo('x-azul', 'Enviado'))]) +
            (f >= 3 ? novo('Medição sugerida', 'Paulo Siqueira · ' + semana(2) + ', 9h', 'Valor do orçamento: R$ 8.400') : '');
        },
        celHtml: function (f) {
          var m = [msg('loja', 'Olá, Paulo! Segue o orçamento do seu home office 📎', dm(-5))];
          if (f >= 2) m.push(msg('loja', 'Olá, Paulo! Tudo bem? Conseguiu ver o orçamento do home office? Se quiser, ajusto alguma coisa ou tiro dúvidas. 🙂', 'agora ✓✓', 'x-novo'));
          if (f >= 3) m.push(msg('cli', 'Oi! Vi sim, gostei. Podemos marcar a medição?', 'agora', 'x-novo2'));
          return zap('Paulo Siqueira', 'cliente', m);
        } }
    ] },

    acad: { dono: 'Painel da FORJA Academia', funcs: [
      { nome: 'Aula e lista de espera', desc: 'a vaga anda sozinha', cel: 'Celular da aluna · app da academia', botao: 'Um aluno cancela a aula',
        log: ['A Carla cancelou a bike das 18h30 pelo celular.', 'A vaga foi oferecida na hora para a primeira da lista de espera.', 'A Ana confirmou: a aula voltou a ficar cheia, sem ninguém da recepção mexer.'],
        donoHtml: function (f) {
          var oc = f === 1 || f === 2 ? 19 : 20;
          return topo('Bike indoor · 18h30', 'Vagas', oc + '/20') + '<div class="xd-ocupa">' + barra(oc / 20 * 100, oc >= 20 ? 'cheia' : 'quase') + '</div>' +
            lista([linha('Carla Mendes', f ? 'cancelou pelo app' : 'confirmada', f ? selo('x-lar', 'Cancelou') : selo('x-ok', 'Confirmada'), f === 1),
              linha('Ana Ribeiro', f >= 3 ? 'entrou pela lista de espera' : f === 2 ? 'vaga oferecida · aguardando' : '1ª da lista de espera', f >= 3 ? selo('x-ok', 'Confirmada') : selo('x-azul', f === 2 ? 'Avisada' : 'Espera'), f >= 2),
              linha('Bruno Teles', (f >= 3 ? '1ª' : '2ª') + ' da lista de espera', selo('x-azul', 'Espera'))]);
        },
        celHtml: function (f) {
          if (f < 2) return celTopo('FORJA', 'Olá, Ana!') + '<div class="xt-aula"><span><b>Bike indoor · 18h30</b><small>Você é a 1ª da lista de espera</small></span></div>';
          return celTopo('FORJA', 'Olá, Ana!') + '<div class="xt-aviso x-novo"><b>Abriu uma vaga! 🎉</b><span>Bike indoor hoje, 18h30</span></div><div class="xt-aula"><span><b>Bike indoor · 18h30</b><small>' + (f >= 3 ? 'Reservado ✓ · lembrete 1 h antes' : 'Confirme em até 30 min') + '</small></span>' + (f >= 3 ? '' : '<span class="xt-btn mini">Confirmar</span>') + '</div>';
        } },
      { nome: 'Ficha de treino', desc: 'treino do dia e evolução', cel: 'Celular do aluno · app da academia', botao: 'O aluno faz o treino de hoje',
        log: ['O Lucas abriu o treino do dia no celular, sem ficha de papel.', 'Marcou os exercícios feitos, e a carga nova já foi para a ficha.', 'Ele vê a própria evolução, e o professor também.'],
        donoHtml: function (f) {
          return topo('Treinando agora', 'Treinos feitos hoje', f >= 3 ? 24 : 23) +
            lista([linha('Lucas Andrade', 'Treino B · costas e bíceps', f ? selo(f >= 3 ? 'x-ok' : 'x-azul', f >= 3 ? 'Concluído' : 'Treinando') : selo('x-azul', 'Chegou'), f === 1 || f === 3), linha('Marina Costa', 'Treino A · pernas', selo('x-azul', 'Treinando')), linha('Diego Rocha', 'Treino C · peito e tríceps', selo('x-ok', 'Concluído'))]) +
            (f >= 2 ? novo('Carga atualizada', 'Lucas · puxada frontal: 45 → 47,5 kg', 'Professor Paulo recebe o aviso') : '');
        },
        celHtml: function (f) {
          var feitos = f >= 3 ? 3 : f >= 2 ? 2 : 0;
          var ex = [['Puxada frontal', '4 × 10 · ' + (f >= 2 ? '47,5' : '45') + ' kg'], ['Remada baixa', '3 × 12 · 40 kg'], ['Rosca direta', '4 × 10 · 20 kg']];
          if (!f) return celTopo('FORJA', 'Olá, Lucas!') + espera('Toque para abrir o treino de hoje');
          return celTopo('FORJA', 'Treino B · costas e bíceps') + '<ul class="xt-ex">' + ex.map(function (e, i) { var ok = i < feitos; return '<li class="' + (ok ? 'feito' : '') + '"><i aria-hidden="true">' + (ok ? '✓' : '') + '</i><span><b>' + e[0] + '</b><small>' + e[1] + '</small></span></li>'; }).join('') + '</ul>' +
            (f >= 3 ? '<div class="xt-evo"><b>Sua evolução na puxada</b><svg viewBox="0 0 200 50" aria-hidden="true"><polyline pathLength="1" points="4,44 40,40 76,34 112,30 148,22 196,8"/></svg><small>40 kg → 47,5 kg em 6 semanas</small></div>' : '');
        } },
      { nome: 'Mensalidade atrasada', desc: 'cobrança educada e Pix', cel: 'WhatsApp do aluno', botao: 'Ver quem está atrasado',
        log: ['O sistema separou quem passou do vencimento: o Diego, há 3 dias.', 'Mandou um lembrete educado, com o Pix pronto para pagar.', 'O Pix caiu, o Diego ficou em dia e ninguém precisou cobrar no balcão.'],
        donoHtml: function (f) {
          return topo('Mensalidades', 'Em dia', (f >= 3 ? 183 : 182) + ' alunos') +
            lista([linha('Diego Rocha', 'Plano Livre · R$ 149,90 · venceu ' + dm(-3), f >= 3 ? selo('x-ok', 'Pago no Pix') : f === 2 ? selo('x-azul', 'Lembrete enviado') : f ? selo('x-lar', '3 dias de atraso') : selo('x-azul', 'Vencida'), f === 1 || f === 3), linha('Sofia Lima', 'Plano Plus · vence amanhã', selo('x-azul', 'Lembrete agendado')), linha('Igor Nunes', 'Plano Essencial · em dia', selo('x-ok', 'Pago'))]) +
            (f >= 3 ? novo('Recebido: R$ 149,90', 'Diego Rocha · Pix', 'Baixa automática, sem conferir extrato') : '');
        },
        celHtml: function (f) {
          var m = [msg('cli', 'Valeu, até amanhã! 💪', dm(-4))];
          if (f >= 2) m.push(msg('loja', 'Oi, Diego! Tudo certo? A mensalidade do Plano Livre (R$ 149,90) venceu em ' + dm(-3) + '. Se já pagou, desconsidere. Pix copia e cola abaixo 👇', 'agora ✓✓', 'x-novo'));
          if (f >= 3) m.push(msg('cli', 'Opa, tinha esquecido! Pago ✅', 'agora', 'x-novo2'));
          return zap('Diego Rocha', 'aluno', m);
        } }
    ] },

    barb: { dono: 'Painel da Ofício Barbearia', funcs: [
      { nome: 'Venda no balcão', desc: 'o estoque baixa sozinho', cel: 'Celular do barbeiro · balcão', botao: 'Vender uma pomada no balcão',
        log: ['A venda no balcão já baixou o estoque da pomada.', 'O sistema viu que ela chegou no mínimo e avisou: acaba em 5 dias.', 'A pomada entrou sozinha na lista de compras.'],
        donoHtml: function (f) {
          var item = function (n, q, min, cls, nv) { return '<li class="' + (nv ? 'x-novo' : '') + '"><span><b>' + n + '</b><small>' + q + ' un · mínimo ' + min + '</small></span>' + barra(q / (min * 2.4) * 100, cls) + (cls === 'quase' ? selo('x-lar', 'Acabando') : '') + '</li>'; };
          return topo('Estoque e balcão', 'Vendas hoje', R(f ? 285 : 236)) + lista([item('Pomada efeito brilho', f ? 6 : 7, 6, f >= 2 ? 'quase' : '', f === 1), item('Óleo para barba', 9, 5, ''), item('Balm para barba', 7, 4, '')]) +
            (f >= 3 ? novo('Lista de compras', '+ 6 pomadas efeito brilho', 'Previsão: acaba em 5 dias no ritmo atual') : '');
        },
        celHtml: function (f) {
          return celTopo('Ofício · Balcão', 'Rafa') + '<ul class="xt-itens"><li><span><b>Pomada efeito brilho</b><small>R$ 49,00</small></span><i>1</i></li></ul>' +
            (f ? '<span class="xt-ok x-novo">Venda registrada ✓ Pix R$ 49,00</span>' : '<button class="xt-btn" type="button" data-exp-rodar>Registrar venda · R$ 49,00</button>');
        } },
      { nome: 'Controle de validade', desc: 'sai primeiro o que vence antes', cel: 'Celular do barbeiro', botao: 'Conferir as validades',
        log: ['O sistema achou 8 frascos de óleo que vencem em 14 dias.', 'Avisou a equipe: usar esse lote primeiro nos serviços.', 'No atendimento seguinte, o frasco certo já saiu do lote que vence antes.'],
        donoHtml: function (f) {
          return topo('Óleo para barba', 'Em estoque', (f >= 3 ? 17 : 18) + ' un') +
            lista([linha('Lote A · vence ' + dm(14), (f >= 3 ? 7 : 8) + ' frascos', f ? selo('x-lar', 'Vence em 14 dias') : selo('x-azul', 'Lote A'), f === 1 || f === 3), linha('Lote B · vence 03/2027', '10 frascos', selo('x-ok', 'OK'))]) +
            (f >= 2 ? novo('Usar primeiro: lote A', 'Avisado para Rafa e Teo', 'Evita jogar fora R$ 264,00 em produto') : '');
        },
        celHtml: function (f) {
          if (f < 2) return celTopo('Ofício', 'Agenda de hoje') + '<div class="xt-aula"><span><b>14h · Barba completa</b><small>Cliente: João Pedro</small></span></div>';
          return celTopo('Ofício', 'Agenda de hoje') + '<div class="xt-aviso x-novo"><b>Use o óleo do lote A</b><span>Vence em ' + dm(14) + ' · prateleira de cima</span></div><div class="xt-aula"><span><b>14h · Barba completa</b><small>' + (f >= 3 ? 'Atendido ✓ · 1 frasco do lote A' : 'Cliente: João Pedro') + '</small></span></div>';
        } },
      { nome: 'Pedido ao fornecedor', desc: 'pronto no WhatsApp', cel: 'WhatsApp do fornecedor', botao: 'Fazer o pedido de compras',
        log: ['A lista de compras juntou tudo o que está acabando.', 'O sistema montou o pedido com as quantidades e o total.', 'O fornecedor recebeu o pedido pronto no WhatsApp e confirmou a entrega.'],
        donoHtml: function (f) {
          return topo('Compras', 'Pedido', f >= 2 ? 'R$ 228,00' : '—') +
            lista([linha('Pomada efeito brilho', '6 un · R$ 22,00 cada', f ? selo('x-azul', 'Na lista') : '', f === 1), linha('Óleo para barba', '4 un · R$ 24,00 cada', f ? selo('x-azul', 'Na lista') : '', f === 1)]) +
            (f >= 2 ? novo(f >= 3 ? 'Pedido nº 18 · entrega amanhã' : 'Pedido nº 18 montado', 'Cosméticos Exemplo · 10 itens', f >= 3 ? 'Confirmado pelo fornecedor' : 'Pronto para enviar') : '');
        },
        celHtml: function (f) {
          var m = [msg('cli', 'Pedido nº 16 entregue ✓ Obrigado!', '31/10')];
          if (f >= 3) m.push(msg('loja', 'Olá, Sandra! Aqui é o Rafa, da Ofício. Pedido nº 18:\n• 6 un · Pomada efeito brilho\n• 4 un · Óleo para barba\nPode me passar o prazo?', 'agora ✓✓', 'x-novo'), msg('cli', 'Pode deixar! Entrego amanhã cedo 👍', 'agora', 'x-novo2'));
          return zap('Cosméticos Exemplo', 'fornecedor', m);
        } }
    ] }
  };

  /* ================= o palco ================= */
  var exp = $('#exp');
  if (exp) (function () {
    var abas = $$('[role=tab]', exp), funcs = $('#exp-funcs'), dono = $('#exp-dono'), cel = $('#exp-cel'), log = $('#exp-log'), rodar = $('#exp-rodar'), deNovo = $('#exp-de-novo');
    var cena = 'cafe', fi = 0, fase = 0, timers = [];
    var F = function () { return CENAS[cena].funcs[fi]; };
    function desenha() { var c = F(); dono.innerHTML = c.donoHtml(fase); cel.innerHTML = c.celHtml(fase); }
    function botoes() {
      funcs.innerHTML = CENAS[cena].funcs.map(function (c, i) { return '<button type="button" data-f="' + i + '" aria-pressed="' + (i === fi) + '"><b>' + c.nome + '</b><small>' + c.desc + '</small></button>'; }).join('');
    }
    function reinicia() {
      timers.forEach(clearTimeout); timers = []; fase = 0; var c = F(); if (c.escolha !== undefined) c.escolha = 1;
      $('#exp-rot-dono').textContent = CENAS[cena].dono; $('#exp-rot-cel').textContent = c.cel; $('#exp-rodar-txt').textContent = c.botao;
      $$('button', funcs).forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.f === fi ? 'true' : 'false'); });
      rodar.disabled = false; rodar.hidden = false; deNovo.hidden = true; log.innerHTML = ''; desenha();
    }
    function roda() {
      // na aprovação, escolher uma opção à mão já é o passo 1
      if (rodar.disabled) return; if (F().escolha !== undefined && fase === 1) fase = 0; if (fase) return;
      var c = F(), passo = reduz ? 60 : 1300; rodar.disabled = true;
      [1, 2, 3].forEach(function (f, i) {
        timers.push(setTimeout(function () {
          fase = f; desenha(); var li = document.createElement('li'); li.textContent = typeof c.log[i] === 'function' ? c.log[i].call(c) : c.log[i]; log.appendChild(li);
          if (f === 3) { rodar.hidden = true; deNovo.hidden = false; deNovo.focus({ preventScroll: true }); }
        }, i * passo + (i ? 0 : 150)));
      });
    }
    function escolheAba(b, foco) {
      abas.forEach(function (x) { var s = x === b; x.setAttribute('aria-selected', s ? 'true' : 'false'); x.tabIndex = s ? 0 : -1; });
      $('#exp-painel').setAttribute('aria-labelledby', b.id); cena = exp.dataset.cena = b.dataset.cena; fi = 0; botoes(); reinicia(); if (foco) b.focus();
    }
    abas.forEach(function (b, i) {
      b.addEventListener('click', function () { escolheAba(b); });
      b.addEventListener('keydown', function (e) { var k = e.key, n = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? abas.length - 1 : null; if (n === null) return; e.preventDefault(); escolheAba(abas[(n + abas.length) % abas.length], true); });
    });
    funcs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; fi = +b.dataset.f; reinicia(); });
    rodar.addEventListener('click', roda);
    deNovo.addEventListener('click', function () { reinicia(); rodar.focus(); });
    cel.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var c = F();
      if (b.hasAttribute('data-exp-rodar')) roda();
      else if (b.dataset.op !== undefined && c.escolha !== undefined && fase < 2 && !rodar.disabled) { c.escolha = +b.dataset.op; fase = 1; desenha(); var nb = $('[data-op="' + b.dataset.op + '"]', cel); if (nb) nb.focus(); }
    });
    exp.dataset.cena = 'cafe'; botoes(); reinicia();
  })();

  /* ================= calculadora ================= */
  var calc = $('#s-calc');
  if (calc) (function () {
    var P = {
      cafe: { nome: 'Cafeteria ou restaurante', q: ['Pedidos por dia', 120, 10, 400, 10, 26, ' pedidos'], m: ['Minutos para anotar e conferir cada pedido', 2, .5, 10, .5], p: ['Pedidos esquecidos ou errados por semana', 6, 0, 40, 1, 4.3], v: ['Valor médio do pedido', 24, 10, 200, 2], f: 1, nota: 'pedidos por dia × minutos × 26 dias, com o sistema eliminando 60% desse trabalho; mais pedidos perdidos por semana × 4,3 × valor médio.' },
      marc: { nome: 'Marcenaria ou serviços', q: ['Orçamentos por mês', 20, 2, 100, 1, 1, ' orçamentos'], m: ['Minutos para montar e mandar cada orçamento', 90, 10, 240, 5], p: ['Orçamentos que esfriam sem retorno, por mês', 4, 0, 30, 1, 1], v: ['Valor médio de um orçamento', 9000, 1000, 40000, 500], f: .25, nota: 'orçamentos por mês × minutos, com o sistema eliminando 60% desse trabalho; mais orçamentos que esfriam × valor médio, considerando que 1 em cada 4 fecharia com um lembrete na hora certa.' },
      acad: { nome: 'Academia ou estúdio', q: ['Atendimentos na recepção por dia', 60, 10, 300, 5, 26, ' atendimentos'], m: ['Minutos em cada um (cobrar, reservar, tirar dúvida)', 3, .5, 10, .5], p: ['Alunos que atrasam ou cancelam sem ninguém perceber, por mês', 8, 0, 60, 1, 1], v: ['Mensalidade média', 149, 50, 500, 5], f: 1, nota: 'atendimentos por dia × minutos × 26 dias, com o sistema eliminando 60% desse trabalho; mais mensalidades que deixam de se perder por mês.' },
      barb: { nome: 'Barbearia ou salão', q: ['Atendimentos por dia', 40, 5, 150, 5, 26, ' atendimentos'], m: ['Minutos com estoque e caixa por atendimento', 1, .5, 5, .5], p: ['Produtos que vencem, somem ou faltam por mês', 6, 0, 40, 1, 1], v: ['Valor médio do produto', 45, 10, 200, 5], f: 1, nota: 'atendimentos por dia × minutos × 26 dias, com o sistema eliminando 60% desse trabalho; mais produtos perdidos por mês × valor médio.' },
      outro: { nome: 'Outro negócio', q: ['Pedidos ou atendimentos por dia', 50, 5, 400, 5, 26, ' por dia'], m: ['Minutos anotando, conferindo ou cobrando cada um', 3, .5, 15, .5], p: ['Coisas esquecidas ou erradas por semana', 4, 0, 40, 1, 4.3], v: ['Valor médio de cada uma', 80, 10, 3000, 10], f: 1, nota: 'quantidade por dia × minutos × 26 dias, com o sistema eliminando 60% desse trabalho; mais perdas por semana × 4,3 × valor médio.' }
    };
    var tipo = 'cafe', mostrado = { h: 0, m: 0 }, anim = null;
    $('#s-tipos').innerHTML = Object.keys(P).map(function (k) { return '<label><input type="radio" name="s-tipo" value="' + k + '"' + (k === tipo ? ' checked' : '') + '><span>' + P[k].nome + '</span></label>'; }).join('');
    var campo = function (id, cfg) { var i = $('#s-' + id); i.min = cfg[2]; i.max = cfg[3]; i.step = cfg[4]; i.value = cfg[1]; $('#s-' + id + '-rot').textContent = cfg[0]; };
    function aplica() { var c = P[tipo]; campo('qtd', c.q); campo('min', c.m); campo('perda', c.p); campo('valor', c.v); $('.calc-note').textContent = 'Estimativa simples: ' + c.nota + ' O número real sai da conversa sobre o seu processo.'; conta(); }
    function conta() {
      var c = P[tipo], q = +$('#s-qtd').value, m = +$('#s-min').value, p = +$('#s-perda').value, v = +$('#s-valor').value;
      $('#so-qtd').textContent = q.toLocaleString('pt-BR') + (c.q[5] === 26 ? '/dia' : '/mês');
      $('#so-min').textContent = (m < 1 ? '30 s' : m.toLocaleString('pt-BR') + ' min');
      $('#so-perda').textContent = p + (c.p[5] === 1 ? '/mês' : '/semana');
      $('#so-valor').textContent = R0(v);
      var horas = Math.round(q * c.q[5] * m * .6 / 60), mes = Math.round(p * c.p[5] * v * c.f);
      anima({ h: horas, m: mes });
    }
    function mostra() { $('#sr-horas').textContent = Math.round(mostrado.h).toLocaleString('pt-BR'); $('#sr-mes').textContent = R0(mostrado.m); $('#sr-ano').textContent = R0(mostrado.m * 12); }
    function anima(alvo) {
      if (reduz) { mostrado = alvo; mostra(); return; }
      var de = { h: mostrado.h, m: mostrado.m }, t0 = performance.now(); cancelAnimationFrame(anim);
      (function f(t) { var k = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - k, 3); mostrado = { h: de.h + (alvo.h - de.h) * e, m: de.m + (alvo.m - de.m) * e }; mostra(); if (k < 1) anim = requestAnimationFrame(f); })(t0);
    }
    calc.addEventListener('input', function (e) { if (e.target.name === 's-tipo') return; conta(); });
    calc.addEventListener('change', function (e) { if (e.target.name === 's-tipo') { tipo = e.target.value; aplica(); } });
    calc.addEventListener('submit', function (e) { e.preventDefault(); });
    aplica();
  })();

  /* "Quero um sistema" marca o pedido de orçamento como sistema */
  $$('[data-quero-sistema]').forEach(function (a) { a.addEventListener('click', function () { var w = $('#w3'); if (w && !w.checked) { w.checked = true; w.dispatchEvent(new Event('change', { bubbles: true })); } }); });
})();
