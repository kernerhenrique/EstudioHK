/* Mensalidades, treinos e aulas · FORJA Academia · demonstração da EstudioHK. Valores em centavos. */
(function () {
  'use strict';
  var S = window.SIS, $ = S.$, $$ = S.$$, esc = S.esc;
  var R = function (c) { return S.dinheiro(c / 100); };
  var dois = function (n) { return String(n).padStart(2, '0'); };
  var deIso = function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var iso = function (d) { return d.getFullYear() + '-' + dois(d.getMonth() + 1) + '-' + dois(d.getDate()); };
  var mais = function (s, n) { var d = deIso(s); d.setDate(d.getDate() + n); return iso(d); };
  var mes = function (s, n) { var d = deIso(s), dia = Math.min(d.getDate(), 28); return iso(new Date(d.getFullYear(), d.getMonth() + n, dia)); };
  var br = function (s) { return s ? s.split('-').reverse().join('/') : '—'; };
  var soma = function (a, f) { return a.reduce(function (t, x) { return t + f(x); }, 0); };
  var plural = function (n, um, varios) { return n + ' ' + (n === 1 ? um : varios); };
  var ico = function (id) { return '<svg class="ico" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
  var lerValor = function (t) { t = String(t).trim().replace(/[R$\s]/g, ''); if (/,/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); var v = Math.round(parseFloat(t) * 100); return isFinite(v) ? v : NaN; };
  var fmtValor = function (c) { return (c / 100).toFixed(2).replace('.', ','); };
  var primeiro = function (n) { return n.split(' ')[0]; };
  var res = function (rot, val, det) { return '<div class="res"><small>' + rot + '</small><b>' + val + '</b><span>' + det + '</span></div>'; };
  var hm = function (h) { var p = h.split(':'); return +p[0] + 'h' + (p[1] === '00' ? '' : p[1]); };
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var DIA_CURTO = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  /* ---------- a FORJA (mesmos dados da demo do site) ---------- */
  var MODS = { funcional: 'Funcional', bike: 'Bike indoor', hiit: 'HIIT', boxe: 'Boxe', yoga: 'Yoga e mobilidade' };
  var PROF_AULA = { funcional: 'Ana Lima', hiit: 'Ana Lima', bike: 'Diego Rocha', boxe: 'Marcos Vieira', yoga: 'Júlia Campos' };
  var DUR = { funcional: 45, hiit: 30, bike: 45, boxe: 60, yoga: 60 };
  var VAGAS = { funcional: 16, bike: 20, hiit: 16, boxe: 12, yoga: 14 };
  var GA = [['06:30', 'funcional'], ['07:15', 'bike'], ['12:15', 'hiit'], ['18:00', 'boxe'], ['18:30', 'bike'], ['19:15', 'funcional'], ['20:00', 'yoga']];
  var GB = [['06:30', 'bike'], ['07:15', 'yoga'], ['12:15', 'funcional'], ['18:00', 'hiit'], ['18:30', 'boxe'], ['19:15', 'bike'], ['20:00', 'funcional']];
  var GS = [['08:30', 'funcional'], ['09:30', 'bike'], ['10:30', 'yoga']];
  var GRADE = { 1: GA, 2: GB, 3: GA, 4: GB, 5: GA, 6: GS };
  var PROFS = ['Bruno Sales (musculação)', 'Carla Nunes (musculação)', 'Ana Lima (funcional)'];
  var EXS = {}, GRUPOS = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Cardio', 'Mobilidade'];
  [['supino', 'Supino reto com barra', 'Peito'], ['supino-hal', 'Supino inclinado com halteres', 'Peito'], ['crucifixo', 'Crucifixo na máquina', 'Peito'], ['flexao', 'Flexão de braço', 'Peito'],
   ['puxada', 'Puxada frontal', 'Costas'], ['remada-baixa', 'Remada baixa', 'Costas'], ['remada-curvada', 'Remada curvada com barra', 'Costas'], ['barra', 'Barra fixa assistida', 'Costas'],
   ['agachamento', 'Agachamento livre', 'Pernas'], ['leg', 'Leg press 45°', 'Pernas'], ['extensora', 'Cadeira extensora', 'Pernas'], ['flexora', 'Mesa flexora', 'Pernas'], ['stiff', 'Stiff com halteres', 'Pernas'], ['afundo', 'Afundo com halteres', 'Pernas'], ['panturrilha', 'Panturrilha em pé', 'Pernas'],
   ['desenv', 'Desenvolvimento com halteres', 'Ombros'], ['elevacao', 'Elevação lateral', 'Ombros'], ['facepull', 'Face pull na polia', 'Ombros'],
   ['rosca', 'Rosca direta com barra', 'Braços'], ['martelo', 'Rosca martelo', 'Braços'], ['triceps-polia', 'Tríceps na polia', 'Braços'], ['frances', 'Tríceps francês', 'Braços'],
   ['prancha', 'Prancha', 'Core'], ['abdominal', 'Abdominal supra', 'Core'], ['elev-pernas', 'Elevação de pernas', 'Core'],
   ['esteira', 'Esteira', 'Cardio'], ['bike', 'Bike ergométrica', 'Cardio'], ['eliptico', 'Elíptico', 'Cardio'], ['remo', 'Remo ergométrico', 'Cardio'],
   ['mob-quadril', 'Mobilidade de quadril', 'Mobilidade'], ['along', 'Alongamento de posteriores', 'Mobilidade']
  ].forEach(function (e) { EXS[e[0]] = { id: e[0], nome: e[1], grupo: e[2] }; });
  var X = function (ex, s, r, c, d) { return { ex: ex, s: s, r: String(r), c: c || 0, d: d === undefined ? 60 : d }; };
  var MODELOS = {
    iniciante: { obj: 'Iniciante', divs: [
      { foco: 'Corpo inteiro 1', dias: 'Seg e qui', itens: [X('esteira', 1, '10 min', 0, 0), X('leg', 3, 12, 40), X('supino-hal', 3, 12, 8), X('puxada', 3, 12, 25), X('desenv', 3, 12, 5), X('prancha', 3, '30 s', 0, 45)] },
      { foco: 'Corpo inteiro 2', dias: 'Ter e sex', itens: [X('bike', 1, '10 min', 0, 0), X('agachamento', 3, 12, 0), X('remada-baixa', 3, 12, 25), X('extensora', 3, 12, 20), X('flexora', 3, 12, 15), X('triceps-polia', 3, 12, 10), X('abdominal', 3, 15, 0, 45)] }] },
    hipertrofia: { obj: 'Hipertrofia', divs: [
      { foco: 'Peito e tríceps', dias: 'Seg e qui', itens: [X('supino', 4, '8-10', 40, 90), X('supino-hal', 4, '10', 14, 90), X('crucifixo', 3, '12', 30), X('triceps-polia', 4, '10-12', 20), X('frances', 3, '12', 10)] },
      { foco: 'Costas e bíceps', dias: 'Ter e sex', itens: [X('puxada', 4, '8-10', 45, 90), X('remada-curvada', 4, '10', 30, 90), X('remada-baixa', 3, '12', 40), X('rosca', 4, '10', 20), X('martelo', 3, '12', 10)] },
      { foco: 'Pernas e ombros', dias: 'Qua e sáb', itens: [X('agachamento', 4, '8-10', 40, 120), X('leg', 4, '12', 120, 90), X('stiff', 3, '10', 16), X('panturrilha', 4, '15', 30, 45), X('desenv', 4, '10', 12), X('elevacao', 3, '12-15', 6)] }] },
    emagrecimento: { obj: 'Emagrecimento', divs: [
      { foco: 'Inferiores e cardio', dias: 'Seg, qua e sex', itens: [X('bike', 1, '15 min', 0, 0), X('agachamento', 3, 15, 0, 45), X('afundo', 3, '12 cada perna', 6, 45), X('leg', 3, 15, 60, 45), X('esteira', 1, '20 min', 0, 0)] },
      { foco: 'Superiores e core', dias: 'Ter e qui', itens: [X('remo', 1, '10 min', 0, 0), X('flexao', 3, 12, 0, 45), X('remada-baixa', 3, 15, 25, 45), X('desenv', 3, 15, 5, 45), X('prancha', 3, '40 s', 0, 30), X('elev-pernas', 3, 15, 0, 30), X('eliptico', 1, '15 min', 0, 0)] }] }
  };
  var LETRAS = ['A', 'B', 'C', 'D', 'E'];

  /* ---------- dados de exemplo (recriados a cada dia) ---------- */
  var NOMES = ['Camila Souza', 'Bruno Almeida', 'Larissa Pinto', 'Thiago Rocha', 'Fernanda Lopes', 'Rodrigo Dias', 'Patrícia Moura', 'Gustavo Reis', 'Aline Freitas', 'Eduardo Lima', 'Vanessa Prado', 'Leonardo Costa',
    'Juliana Martins', 'Felipe Araújo', 'Renata Gomes', 'Marcelo Teixeira', 'Beatriz Nunes', 'André Cardoso', 'Natália Ribeiro', 'Ricardo Mendes', 'Isabela Cunha', 'Daniel Barros', 'Mariana Farias', 'Lucas Monteiro',
    'Priscila Duarte', 'Vinícius Castro', 'Tatiane Rocha', 'Rafael Siqueira', 'Carolina Pires', 'Henrique Matos', 'Sabrina Vieira', 'Diego Fonseca', 'Letícia Campos', 'Paulo Sá', 'Elaine Rezende', 'Matheus Correia'];
  function semente() {
    var d = { proxId: 1, planos: [], alunos: [], fichas: [], res: {} };
    d.planos.push({ id: 'essencial', nome: 'Essencial', preco: 9990, aulas: false, personal: 0, aval: 'Na entrada', ativo: true });
    d.planos.push({ id: 'livre', nome: 'Livre', preco: 14990, aulas: true, personal: 0, aval: 'A cada 3 meses', ativo: true });
    d.planos.push({ id: 'plus', nome: 'Plus', preco: 21990, aulas: true, personal: 2, aval: 'Todo mês', ativo: true });
    var PL = ['essencial', 'livre', 'livre', 'plus', 'livre', 'essencial', 'livre', 'plus', 'livre'];
    var ATR = { 3: -12, 9: -6, 15: -4, 22: -2, 30: -1 }, BREVE = { 5: 0, 12: 1, 27: 2, 33: 3 };
    NOMES.forEach(function (nome, i) {
      var off = ATR[i] !== undefined ? ATR[i] : BREVE[i] !== undefined ? BREVE[i] : (i * 7) % 26 + 4;
      var a = { id: d.proxId++, nome: nome, tel: '(27) 99999-' + String(2100 + i * 7), plano: PL[i % PL.length], venc: S.dia(off), tranca: null, cobrado: '', pags: [] };
      if (i === 18) { a.tranca = { desde: S.dia(-10), ate: S.dia(20), motivo: 'Viagem' }; a.venc = S.dia(30); }
      var preco = d.planos.filter(function (p) { return p.id === a.plano; })[0].preco, meses = 2 + (i % 5);
      for (var k = meses; k >= 1; k--) { var dt = mais(mes(a.venc, -k), -(i % 3)); if (dt <= S.hoje) a.pags.push({ valor: preco, forma: ['Pix', 'Cartão', 'Pix', 'Dinheiro'][(i + k) % 4], data: dt }); }
      a.desde = mes(a.venc, -(meses + 1 + (i % 7)));
      d.alunos.push(a);
    });
    var F = function (ai, modelo, prof, criada, obs) { var m = JSON.parse(JSON.stringify(MODELOS[modelo])); d.fichas.push({ id: d.proxId++, aluno: d.alunos[ai].id, prof: prof, obj: m.obj, criada: S.dia(criada), divs: m.divs, obs: obs || 'Aquecer 5 minutos antes. Se sentir dor (diferente do cansaço), pare e chame o professor.' }); };
    F(1, 'hipertrofia', PROFS[0], -50); F(4, 'emagrecimento', PROFS[1], -45); F(2, 'hipertrofia', PROFS[1], -20); F(0, 'iniciante', PROFS[0], -10, 'Primeiro mês: foco na técnica, carga leve. Avaliação física na próxima segunda.');
    F(6, 'emagrecimento', PROFS[2], -3); F(7, 'hipertrofia', PROFS[0], -30); F(10, 'iniciante', PROFS[1], -15); F(13, 'hipertrofia', PROFS[1], -5);
    var f0 = d.fichas[2].divs[0].itens; f0[0].c = 50; f0[0].r = '6-8';   // a Larissa já sobe carga
    // reservas da semana
    var aptos = d.alunos.filter(function (a) { return !a.tranca && d.planos.filter(function (p) { return p.id === a.plano; })[0].aulas; }).map(function (a) { return a.id; });
    var FR = [.45, .6, .75, .9, 1, .55, .85, .5, 1.1, .7];
    semana().forEach(function (dia, di) {
      dia.aulas.forEach(function (au, si) {
        var fr = FR[(di * 7 + si * 3) % FR.length]; if (di === 0 && au.hora === '18:30') fr = 1.1;
        var n = Math.min(au.vagas, Math.round(au.vagas * Math.min(fr, 1)), aptos.length), ini = (di * 5 + si * 11) % aptos.length, lista = [];
        for (var k = 0; k < Math.min(aptos.length, n + (fr > 1 ? 2 : 0)); k++) lista.push(aptos[(ini + k) % aptos.length]);
        d.res[au.id] = { r: lista.slice(0, n), e: lista.slice(n) };
      });
    });
    return d;
  }
  function semana() {   // próximos 6 dias com aula (sem domingo)
    var out = [], k = 0;
    while (out.length < 6) { var dt = S.dia(k++), dow = deIso(dt).getDay(); if (!GRADE[dow]) continue;
      out.push({ data: dt, dow: dow, aulas: GRADE[dow].map(function (g) { return { id: dt + '_' + g[0], data: dt, hora: g[0], mod: g[1], prof: PROF_AULA[g[1]], dur: DUR[g[1]], vagas: VAGAS[g[1]] }; }) }); }
    return out;
  }

  var G = S.guarda('estudiohk-sis-academia-v1', semente, true);
  var D = function () { return G.d; };
  var SEMANA = semana(), AULA = {}; SEMANA.forEach(function (d) { d.aulas.forEach(function (a) { AULA[a.id] = a; }); });
  var plano = function (id) { return D().planos.filter(function (p) { return p.id === id; })[0]; };
  var aluno = function (id) { return D().alunos.filter(function (a) { return a.id === id; })[0]; };
  var fichaDe = function (aid) { return D().fichas.filter(function (f) { return f.aluno === aid; })[0]; };
  var reservas = function (id) { return D().res[id] || (D().res[id] = { r: [], e: [] }); };
  function situacao(a) {
    if (a.tranca && a.tranca.ate > S.hoje) return { k: 'trancado', t: 'Trancado até ' + S.curta(a.tranca.ate), c: 's-trancado' };
    var dd = S.entre(S.hoje, a.venc);
    if (dd < 0) return { k: 'atrasado', t: 'Atrasado há ' + plural(-dd, 'dia', 'dias'), c: 'perigo', dias: -dd };
    if (dd <= 3) return { k: 'breve', t: dd === 0 ? 'Vence hoje' : dd === 1 ? 'Vence amanhã' : 'Vence em ' + dd + ' dias', c: 'alerta' };
    return { k: 'emdia', t: 'Em dia', c: 'ok' };
  }
  var NOME_SIT = { emdia: 'Em dia', breve: 'Vence em breve', atrasado: 'Atrasado', trancado: 'Trancado' };
  var mensal = function (a) { return plano(a.plano).preco; };
  var devido = function (a) { var s = situacao(a); return s.k === 'atrasado' ? mensal(a) * (1 + Math.floor(s.dias / 30)) : 0; };
  var renovarEm = function (f) { return mais(f.criada, 42); };
  function salva() { G.salva(); desenha(); }

  /* ---------- mensagens ---------- */
  function msgCobrar(a) { var s = situacao(a), p = plano(a.plano);
    return s.k === 'atrasado' ? 'Olá, ' + primeiro(a.nome) + '! Tudo bem? Aqui é a Paula, da recepção da FORJA. A mensalidade do plano ' + p.nome + ' (' + R(p.preco) + ') venceu em ' + br(a.venc) + '. Se já pagou, pode desconsiderar. Se quiser, mando a chave Pix por aqui. Bons treinos!'
      : 'Olá, ' + primeiro(a.nome) + '! Aqui é a Paula, da FORJA. Passando para lembrar que a mensalidade do plano ' + p.nome + ' (' + R(p.preco) + ') vence ' + (S.entre(S.hoje, a.venc) === 0 ? 'hoje' : 'em ' + br(a.venc)) + '. Se quiser, já mando a chave Pix por aqui.'; }
  function linhaEx(it) { var e = EXS[it.ex]; return e.nome + ': ' + (it.s > 1 || !/min/.test(it.r) ? it.s + ' × ' + it.r : it.r) + (it.c ? ' · ' + it.c + ' kg' : '') + (it.d ? ' · descanso ' + it.d + ' s' : ''); }
  function msgFicha(f) { var a = aluno(f.aluno);
    return 'Olá, ' + primeiro(a ? a.nome : '') + '! Sua ficha de treino (' + f.obj.toLowerCase() + ', prof. ' + f.prof.replace(/ \(.*\)/, '') + '):\n' + f.divs.map(function (d, i) { return '\nTREINO ' + LETRAS[i] + ' · ' + d.foco + ' (' + d.dias.toLowerCase() + ')\n' + d.itens.map(function (it, j) { return (j + 1) + '. ' + linhaEx(it); }).join('\n'); }).join('\n') + (f.obs ? '\n\n' + f.obs : '') + '\nBons treinos!'; }

  /* ---------- tela: início ---------- */
  function desenhaInicio() {
    var al = D().alunos, ativos = al.filter(function (a) { return situacao(a).k !== 'trancado'; });
    var pags = [].concat.apply([], al.map(function (a) { return a.pags; })).filter(function (p) { return S.entre(p.data, S.hoje) <= 30; });
    var atras = al.filter(function (a) { return situacao(a).k === 'atrasado'; });
    var hoje = SEMANA[0].data === S.hoje ? SEMANA[0].aulas : [], ocup = soma(hoje, function (a) { return reservas(a.id).r.length; }), vag = soma(hoje, function (a) { return a.vagas; });
    $('#resumo-inicio').innerHTML = res('Alunos ativos', ativos.length, plural(al.length - ativos.length, 'trancado', 'trancados')) +
      res('Recebido (30 dias)', R(soma(pags, function (p) { return p.valor; })), plural(pags.length, 'pagamento', 'pagamentos')) +
      res('Em atraso', R(soma(atras, devido)), plural(atras.length, 'aluno', 'alunos')) +
      res('Aulas hoje', hoje.length, hoje.length ? Math.round(ocup / vag * 100) + '% das vagas reservadas' : 'domingo sem aulas');
    var cob = al.filter(function (a) { var k = situacao(a).k; return k === 'atrasado' || k === 'breve'; }).sort(function (a, b) { return a.venc < b.venc ? -1 : 1; });
    $('#cobrar').innerHTML = cob.length ? cob.map(function (a) { var s = situacao(a);
      return '<li><div><b>' + esc(a.nome) + '</b><span class="dica"> · ' + plano(a.plano).nome + ' · ' + R(mensal(a)) + '</span><span class="linha-etq"><span class="etq ' + s.c + '">' + s.t + '</span>' + (a.cobrado === S.hoje ? '<span class="etq">' + ico('check') + 'Cobrado hoje</span>' : '') + '</span></div>' +
        '<div class="r-acoes"><button class="btn btn-s btn-sm" type="button" data-cobrar="' + a.id + '">' + ico('zap') + 'Cobrar<span class="sr"> ' + esc(a.nome) + '</span></button><button class="btn btn-p btn-sm" type="button" data-pagar="' + a.id + '">' + ico('check') + 'Recebi<span class="sr"> de ' + esc(a.nome) + '</span></button></div></li>'; }).join('') : '<li class="vazio">Ninguém para cobrar hoje.</li>';
    $('#aulas-hoje').innerHTML = hoje.length ? hoje.map(cartaoAula).join('') : '<li class="vazio">Domingo: sem aulas coletivas.</li>';
    var ren = D().fichas.filter(function (f) { return renovarEm(f) <= S.hoje; });
    $('#renovar').innerHTML = ren.length ? ren.map(function (f) { var a = aluno(f.aluno); return '<li><div><b>' + esc(a ? a.nome : '—') + '</b><span class="dica"> · ' + f.obj + ' · ' + esc(f.prof.replace(/ \(.*\)/, '')) + '</span><span class="linha-etq"><span class="etq alerta">Ficha de ' + br(f.criada) + ' · há ' + Math.floor(S.entre(f.criada, S.hoje) / 7) + ' semanas</span></span></div><div class="r-acoes"><button class="btn btn-s btn-sm" type="button" data-ficha="' + f.id + '">' + ico('editar') + 'Abrir ficha<span class="sr"> de ' + esc(a ? a.nome : '') + '</span></button></div></li>'; }).join('') : '<li class="vazio">Nenhuma ficha para renovar.</li>';
  }

  /* ---------- tela: alunos ---------- */
  var filtro = 'todos';
  function desenhaAlunos() {
    var al = D().alunos.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome); }), busca = $('#busca').value.trim().toLowerCase();
    var cont = { todos: al.length }; Object.keys(NOME_SIT).forEach(function (k) { cont[k] = al.filter(function (a) { return situacao(a).k === k; }).length; });
    $('#filtros').innerHTML = ['todos', 'emdia', 'breve', 'atrasado', 'trancado'].map(function (k) { return '<button type="button" data-filtro="' + k + '" aria-pressed="' + (filtro === k) + '">' + (k === 'todos' ? 'Todos' : NOME_SIT[k]) + ' <span class="f-n">' + cont[k] + '</span></button>'; }).join('');
    var lista = al.filter(function (a) { return (filtro === 'todos' || situacao(a).k === filtro) && (!busca || a.nome.toLowerCase().indexOf(busca) >= 0); });
    $('#lista-alunos').innerHTML = lista.length ? lista.map(function (a) { var s = situacao(a), k = s.k;
      return '<tr><td class="principal"><span class="o-cli"><b>' + esc(a.nome) + '</b><span class="dica">Plano ' + plano(a.plano).nome + (fichaDe(a.id) ? ' · com ficha de treino' : '') + '</span></span></td><td data-rot="Vencimento">' + (k === 'trancado' ? 'volta em ' + S.curta(a.tranca.ate) : 'todo dia ' + deIso(a.venc).getDate() + ' · próximo ' + S.curta(a.venc)) + '</td>' +
        '<td data-rot="Situação"><span class="etq ' + s.c + '">' + s.t + '</span></td><td class="num" data-rot="Mensalidade">' + R(mensal(a)) + '</td>' +
        '<td class="acao">' + (k === 'atrasado' || k === 'breve' ? '<button class="btn btn-s btn-sm btn-ico" type="button" data-cobrar="' + a.id + '" aria-label="Cobrar ' + esc(a.nome) + ' no WhatsApp">' + ico('zap') + '</button>' : '') + '<button class="btn btn-s btn-sm" type="button" data-aluno="' + a.id + '">Ver ficha<span class="sr"> de ' + esc(a.nome) + '</span></button></td></tr>'; }).join('') : '<tr><td class="vazio" colspan="5">Nenhum aluno com esse filtro.</td></tr>';
  }
  $('#filtros').addEventListener('click', function (e) { var b = e.target.closest('[data-filtro]'); if (!b) return; filtro = b.dataset.filtro; desenhaAlunos(); $('[data-filtro="' + filtro + '"]').focus(); });
  $('#busca').addEventListener('input', desenhaAlunos);

  var alAberto = null;
  function abreAluno(a, foco) {
    alAberto = a; var s = situacao(a), p = plano(a.plano), f = fichaDe(a.id);
    $('#al-titulo').textContent = a.nome;
    $('#al-corpo').innerHTML = '<p><span class="etq ' + s.c + '">' + s.t + '</span>' + (a.tranca && s.k === 'trancado' ? ' <span class="dica">' + esc(a.tranca.motivo) + ', desde ' + br(a.tranca.desde) + '</span>' : '') + '</p>' +
      '<dl class="conta-res"><div><dt>Plano</dt><dd>' + p.nome + ' · ' + R(p.preco) + '/mês</dd></div><div><dt>Vencimento</dt><dd>todo dia ' + deIso(a.venc).getDate() + ' · próximo ' + br(a.venc) + '</dd></div><div><dt>Aluno desde</dt><dd>' + br(a.desde) + '</dd></div><div><dt>WhatsApp</dt><dd>' + esc(a.tel || '—') + '</dd></div></dl>' +
      '<div class="campo"><label for="al-plano">Trocar de plano</label><div class="junto"><select id="al-plano">' + D().planos.filter(function (x) { return x.ativo || x.id === a.plano; }).map(function (x) { return '<option value="' + x.id + '"' + (x.id === a.plano ? ' selected' : '') + '>' + esc(x.nome) + ' · ' + R(x.preco) + '</option>'; }).join('') + '</select><button class="btn btn-s" type="button" data-trocar>Trocar</button></div></div>' +
      '<div class="al-ficha">' + ico('peso') + '<span>' + (f ? 'Ficha de treino: ' + f.obj.toLowerCase() + ', de ' + br(f.criada) : 'Ainda sem ficha de treino.') + '</span><button class="btn btn-s btn-sm" type="button" data-' + (f ? 'ficha="' + f.id + '"' : 'criar-ficha="' + a.id + '"') + '>' + (f ? 'Abrir ficha' : 'Criar ficha') + '</button></div>' +
      '<h3 class="cat-form">Pagamentos</h3><ul class="hist">' + (a.pags.length ? a.pags.slice().reverse().map(function (x) { return '<li><span>' + br(x.data) + ' · ' + x.forma + '</span><span class="h-val">' + R(x.valor) + '</span></li>'; }).join('') : '<li class="vazio">Nenhum pagamento ainda.</li>') + '</ul>';
    $('#al-pe').innerHTML = (s.k === 'trancado' ? '<button class="btn btn-s" type="button" data-destrancar>' + ico('seta') + 'Voltar a treinar agora</button>' : '<button class="btn btn-s" type="button" data-trancar>' + ico('pausa') + 'Trancar</button>') +
      '<span class="pe-dir">' + (s.k === 'atrasado' || s.k === 'breve' ? '<button class="btn btn-s" type="button" data-cobrar="' + a.id + '">' + ico('zap') + 'Cobrar</button>' : '') + (s.k !== 'trancado' ? '<button class="btn btn-p" type="button" data-pagar="' + a.id + '">' + ico('check') + 'Registrar pagamento</button>' : '') + '</span>';
    S.abre($('#painel-aluno')); if (foco) { var el = $(foco, $('#painel-aluno')); if (el) el.focus(); }
  }
  $('#painel-aluno').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var a = alAberto;
    if (b.hasAttribute('data-trocar')) { var np = $('#al-plano').value; if (np === a.plano) return; var velho = plano(a.plano).nome; a.plano = np; salva(); abreAluno(a, '[data-trocar]'); S.aviso('Plano de ' + primeiro(a.nome) + ' trocado de ' + velho + ' para ' + plano(np).nome + '. O novo valor (' + R(plano(np).preco) + ') vale a partir de ' + br(a.venc) + '.'); }
    else if (b.hasAttribute('data-trancar')) abreTranca(a);
    else if (b.hasAttribute('data-destrancar')) { var resta = S.entre(S.hoje, a.tranca.ate); a.venc = mais(a.venc, -resta); a.tranca = null; salva(); abreAluno(a, '[data-trancar]'); S.aviso(primeiro(a.nome) + ' voltou a treinar. Próximo vencimento: ' + br(a.venc) + '.'); }
    else if (b.dataset.ficha || b.dataset.criarFicha) { S.fecha($('#painel-aluno')); abreEditor(b.dataset.ficha ? D().fichas.filter(function (f) { return f.id === +b.dataset.ficha; })[0] : novaFicha(a.id)); }
  });

  // pagamento
  var pagAluno = null;
  function abrePag(a) { pagAluno = a; var p = plano(a.plano), d = deIso(a.venc);
    $('#pg-texto').textContent = a.nome + ' · mensalidade de ' + MESES[d.getMonth()] + ' · plano ' + p.nome + ' · ' + R(p.preco) + ' (vencimento ' + br(a.venc) + ').';
    S.abre($('#painel-pag')); $('#f-pag input[name=pg-forma]:checked').focus(); }
  $('#f-pag').addEventListener('submit', function (e) {
    e.preventDefault(); var a = pagAluno, forma = this.querySelector('input[name=pg-forma]:checked').value;
    a.pags.push({ valor: mensal(a), forma: forma, data: S.hoje }); a.venc = mes(a.venc, 1); a.cobrado = '';
    S.fecha($('#painel-pag')); salva(); S.aviso('Pagamento de ' + R(mensal(a)) + ' (' + forma + ') de ' + primeiro(a.nome) + ' registrado. Próximo vencimento: ' + br(a.venc) + '.');
    if ($('#painel-aluno').open) abreAluno(a, '[data-trancar]');
  });
  // trancar
  var trAluno = null;
  function abreTranca(a) { trAluno = a; $('#tr-volta').value = S.dia(30); $('#tr-volta').min = S.dia(1); $('#tr-volta').max = S.dia(90); $('#e-tr').hidden = true; $('#tr-volta').setAttribute('aria-invalid', 'false'); S.abre($('#painel-tranca')); $('#tr-volta').focus(); }
  $('#f-tranca').addEventListener('submit', function (e) {
    e.preventDefault(); var a = trAluno, ate = $('#tr-volta').value, dias = ate ? S.entre(S.hoje, ate) : 0;
    if (!(dias >= 1 && dias <= 90)) { $('#e-tr').hidden = false; $('#tr-volta').setAttribute('aria-invalid', 'true'); $('#tr-volta').focus(); return; }
    a.tranca = { desde: S.hoje, ate: ate, motivo: this.querySelector('input[name=tr-motivo]:checked').value }; a.venc = mais(a.venc, dias);
    S.fecha($('#painel-tranca')); salva(); abreAluno(a, '[data-destrancar]');
    S.aviso('Plano de ' + primeiro(a.nome) + ' trancado até ' + br(ate) + '. O vencimento andou ' + dias + ' dias: agora é ' + br(a.venc) + '.');
  });
  // novo aluno
  $('#novo-aluno').addEventListener('click', function () {
    $('#na-nome').value = ''; $('#na-tel').value = ''; $('#na-pago').checked = true; $('#e-nanome').hidden = true; $('#na-nome').setAttribute('aria-invalid', 'false');
    $('#na-planos').innerHTML = D().planos.filter(function (p) { return p.ativo; }).map(function (p, i) { return '<label><input type="radio" name="na-plano" value="' + p.id + '"' + (p.id === 'livre' || (i === 0 && !plano('livre').ativo) ? ' checked' : '') + '>' + esc(p.nome) + ' · ' + R(p.preco) + '</label>'; }).join('');
    if (!$('#na-planos input:checked')) $('#na-planos input').checked = true;
    S.abre($('#painel-novo')); $('#na-nome').focus();
  });
  $('#f-novo').addEventListener('submit', function (e) {
    e.preventDefault(); var nome = $('#na-nome').value.trim();
    if (nome.length < 2) { $('#e-nanome').hidden = false; $('#na-nome').setAttribute('aria-invalid', 'true'); $('#na-nome').focus(); return; }
    var a = { id: D().proxId++, nome: nome, tel: $('#na-tel').value.trim(), plano: this.querySelector('input[name=na-plano]:checked').value, desde: S.hoje, tranca: null, cobrado: '', pags: [] };
    if ($('#na-pago').checked) { a.pags.push({ valor: plano(a.plano).preco, forma: 'Pix', data: S.hoje }); a.venc = mes(S.hoje, 1); } else a.venc = S.hoje;
    D().alunos.push(a); S.fecha($('#painel-novo')); salva(); abreAluno(a, '[data-criar-ficha]');
    S.aviso(nome + ' matriculado no plano ' + plano(a.plano).nome + '. Vencimento todo dia ' + deIso(a.venc).getDate() + '.');
  });

  /* ---------- tela: treinos ---------- */
  function desenhaFichas() {
    var fs = D().fichas.slice().sort(function (a, b) { return a.criada < b.criada ? -1 : 1; });
    $('#lista-fichas').innerHTML = fs.length ? fs.map(function (f) { var a = aluno(f.aluno), ren = renovarEm(f), dd = S.entre(S.hoje, ren);
      return '<tr><td class="principal"><span class="o-cli"><b>' + esc(a ? a.nome : 'Aluno não escolhido') + '</b><span class="dica">' + f.divs.map(function (d, i) { return LETRAS[i]; }).join('/') + ' · ' + plural(soma(f.divs, function (d) { return d.itens.length; }), 'exercício', 'exercícios') + '</span></span></td><td data-rot="Objetivo">' + f.obj + '</td><td data-rot="Professor">' + esc(f.prof.replace(/ \(.*\)/, '')) + '</td>' +
        '<td data-rot="Renovar em">' + (dd <= 0 ? '<span class="etq alerta">Renovar agora</span>' : S.curta(ren) + ' <span class="dica">(em ' + plural(dd, 'dia', 'dias') + ')</span>') + '</td><td class="acao"><button class="btn btn-s btn-sm" type="button" data-ficha="' + f.id + '">' + ico('editar') + 'Abrir<span class="sr"> a ficha de ' + esc(a ? a.nome : '') + '</span></button></td></tr>'; }).join('') : '<tr><td class="vazio" colspan="5">Nenhuma ficha ainda.</td></tr>';
  }
  var fe = null;
  function novaFicha(aid) { var f = { id: D().proxId++, aluno: aid || 0, prof: PROFS[0], obj: 'Hipertrofia', criada: S.hoje, divs: [{ foco: 'Treino A', dias: 'Seg e qui', itens: [] }], obs: 'Aquecer 5 minutos antes. Se sentir dor (diferente do cansaço), pare e chame o professor.' }; D().fichas.push(f); G.salva(); return f; }
  $('#nova-ficha').addEventListener('click', function () { abreEditor(novaFicha(0), '#ed-aluno'); });
  function opcoesEx() { return '<option value="">Escolha um exercício</option>' + GRUPOS.map(function (g) { return '<optgroup label="' + g + '">' + Object.keys(EXS).filter(function (k) { return EXS[k].grupo === g; }).map(function (k) { return '<option value="' + k + '">' + EXS[k].nome + '</option>'; }).join('') + '</optgroup>'; }).join(''); }
  function mini(i, j, k, rot, v, tipo) { var id = 'x-' + i + '-' + j + '-' + k; return '<span class="mini' + (k === 'r' ? ' largo' : '') + '"><label for="' + id + '">' + rot + '</label><input id="' + id + '" data-k="' + k + '" ' + (tipo === 'num' ? 'type="number" min="0" inputmode="numeric"' : 'autocomplete="off"') + ' value="' + esc(v) + '"></span>'; }
  function desenhaDivs(focar) {
    $('#ed-divs').innerHTML = fe.divs.map(function (d, i) {
      return '<div class="div" data-d="' + i + '"><div class="div-topo"><span class="letra" aria-hidden="true">' + LETRAS[i] + '</span><div class="campo"><label for="dv-f-' + i + '">Treino ' + LETRAS[i] + ': foco</label><input id="dv-f-' + i + '" data-dk="foco" value="' + esc(d.foco) + '" autocomplete="off"></div><div class="campo dias"><label for="dv-d-' + i + '">Dias</label><input id="dv-d-' + i + '" data-dk="dias" value="' + esc(d.dias) + '" autocomplete="off"></div>' +
        (fe.divs.length > 1 ? '<button class="btn btn-s btn-ico" type="button" data-rm-div aria-label="Remover o treino ' + LETRAS[i] + '">' + ico('lixo') + '</button>' : '') + '</div>' +
        '<ol class="exs">' + d.itens.map(function (it, j) { var e = EXS[it.ex];
          return '<li class="ex" data-e="' + j + '"><div class="ex-nome"><b>' + e.nome + '</b><span class="dica">' + e.grupo + '</span></div><div class="ex-med">' + mini(i, j, 's', 'Séries', it.s, 'num') + mini(i, j, 'r', 'Repetições', it.r) + mini(i, j, 'c', 'Carga (kg)', it.c, 'num') + mini(i, j, 'd', 'Descanso (s)', it.d, 'num') + '</div>' +
            '<div class="ex-ord"><button class="btn btn-s btn-ico" type="button" data-mv="-1" aria-label="Subir ' + e.nome + '"' + (j ? '' : ' disabled') + '>' + ico('cima') + '</button><button class="btn btn-s btn-ico" type="button" data-mv="1" aria-label="Descer ' + e.nome + '"' + (j < d.itens.length - 1 ? '' : ' disabled') + '>' + ico('baixo') + '</button><button class="btn btn-s btn-ico" type="button" data-rm-ex aria-label="Tirar ' + e.nome + ' do treino ' + LETRAS[i] + '">' + ico('x') + '</button></div></li>'; }).join('') + '</ol>' +
        (d.itens.length ? '' : '<p class="dica-bloco">Nenhum exercício neste treino ainda.</p>') +
        '<div class="ex-add"><label class="sr" for="add-' + i + '">Exercício para o treino ' + LETRAS[i] + '</label><select id="add-' + i + '">' + opcoesEx() + '</select><button class="btn btn-s" type="button" data-add>' + ico('mais') + 'Adicionar exercício</button></div></div>';
    }).join('');
    if (focar) { var el = $(focar); if (el) el.focus(); }
  }
  function folha(f) { var a = aluno(f.aluno);
    return '<header class="fi-cab"><span class="forja"><i></i>FORJA</span><div><b>Ficha de treino · ' + esc(a ? a.nome : '') + '</b><span>' + f.obj + ' · prof. ' + esc(f.prof.replace(/ \(.*\)/, '')) + ' · ' + br(f.criada) + ' · renovar em ' + br(renovarEm(f)) + '</span></div></header>' +
      f.divs.map(function (d, i) { return '<h3>Treino ' + LETRAS[i] + ' · ' + esc(d.foco) + ' <small>' + esc(d.dias) + '</small></h3><table><thead><tr><th>Exercício</th><th>Séries</th><th>Repetições</th><th>Carga</th><th>Descanso</th></tr></thead><tbody>' + d.itens.map(function (it) { return '<tr><td>' + EXS[it.ex].nome + '</td><td>' + it.s + '</td><td>' + esc(it.r) + '</td><td>' + (it.c ? it.c + ' kg' : '—') + '</td><td>' + (it.d ? it.d + ' s' : '—') + '</td></tr>'; }).join('') + '</tbody></table>'; }).join('') +
      (f.obs ? '<p class="fi-obs">' + esc(f.obs) + '</p>' : '') + '<footer>Documento de demonstração · academia fictícia criada pela EstudioHK</footer>';
  }
  function atualiza() { G.salva(); contadores(); $('#impressao').innerHTML = '<div class="ficha-imp">' + folha(fe) + '</div>'; var a = aluno(fe.aluno); $('#titulo').textContent = 'Ficha de ' + (a ? a.nome : 'treino'); $('#ed-status').innerHTML = '<span class="dica">' + plural(soma(fe.divs, function (d) { return d.itens.length; }), 'exercício', 'exercícios') + ' em ' + plural(fe.divs.length, 'treino', 'treinos') + '</span> <span class="salvo">' + ico('check') + 'Salvo automaticamente</span>'; }
  function abreEditor(f, foco) {
    fe = f; $$('[data-tela]').forEach(function (t) { t.hidden = true; }); $('#editor').hidden = false; $$('[data-so-em]').forEach(function (x) { x.hidden = true; });
    $('#subtitulo').textContent = 'Criada em ' + br(f.criada) + ' · renovar em ' + br(renovarEm(f));
    $('#ed-aluno').innerHTML = '<option value="">Escolha o aluno</option>' + D().alunos.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome); }).map(function (a) { var outra = fichaDe(a.id); return '<option value="' + a.id + '"' + (a.id === f.aluno ? ' selected' : '') + (outra && outra !== f ? ' disabled' : '') + '>' + esc(a.nome) + (outra && outra !== f ? ' (já tem ficha)' : '') + '</option>'; }).join('');
    $('#ed-prof').innerHTML = PROFS.map(function (p) { return '<option' + (p === f.prof ? ' selected' : '') + '>' + p + '</option>'; }).join('');
    $('#ed-obj').value = f.obj; $('#ed-obs').value = f.obs; $('#ed-modelo').value = '';
    $('#ed-acoes').innerHTML = '<button class="btn btn-perigo" type="button" data-ac="excluir">Excluir ficha</button><button class="btn btn-s" type="button" data-ac="renovar">' + ico('check') + 'Marcar como renovada</button><button class="btn btn-s" type="button" data-ac="imprimir">' + ico('pdf') + 'Imprimir ficha</button><button class="btn btn-p" type="button" data-ac="enviar">' + ico('zap') + 'Enviar pelo WhatsApp</button>';
    desenhaDivs(); atualiza(); scrollTo(0, 0); (foco ? $(foco) : $('#titulo')).focus();
  }
  function fechaEditor() { if (fe && !fe.aluno && !soma(fe.divs, function (d) { return d.itens.length; })) D().fichas = D().fichas.filter(function (x) { return x !== fe; }); fe = null; $('#editor').hidden = true; G.salva(); }
  $('#ed-voltar').addEventListener('click', function () { fechaEditor(); vaiTela('treinos', true); });
  $('#ed-aluno').addEventListener('change', function () { fe.aluno = +this.value || 0; this.removeAttribute('aria-invalid'); atualiza(); });
  $('#ed-prof').addEventListener('change', function () { fe.prof = this.value; atualiza(); });
  $('#ed-obj').addEventListener('change', function () { fe.obj = this.value; atualiza(); });
  $('#ed-obs').addEventListener('input', function () { fe.obs = this.value; atualiza(); });
  $('#ed-aplicar').addEventListener('click', function () {
    var m = MODELOS[$('#ed-modelo').value]; if (!m) { $('#ed-modelo').focus(); S.aviso('Escolha um modelo primeiro.'); return; }
    var usa = function () { fe.divs = JSON.parse(JSON.stringify(m.divs)); fe.obj = m.obj; $('#ed-obj').value = m.obj; desenhaDivs('#dv-f-0'); atualiza(); S.aviso('Modelo aplicado: ' + plural(fe.divs.length, 'treino', 'treinos') + '. Ajuste as cargas para o aluno.'); };
    if (soma(fe.divs, function (d) { return d.itens.length; })) S.confirma('O modelo substitui os treinos que já estão na ficha.', usa); else usa();
  });
  $('#ed-divs').addEventListener('input', function (e) {
    var t = e.target, dv = t.closest('.div'); if (!dv) return; var d = fe.divs[+dv.dataset.d];
    if (t.dataset.dk) { d[t.dataset.dk] = t.value; atualiza(); return; }
    var li = t.closest('.ex'); if (!li || !t.dataset.k) return; var it = d.itens[+li.dataset.e];
    it[t.dataset.k] = t.dataset.k === 'r' ? t.value : Math.max(0, parseInt(t.value, 10) || 0); atualiza();
  });
  $('#ed-divs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var dv = b.closest('.div'), i = +dv.dataset.d, d = fe.divs[i];
    if (b.hasAttribute('data-add')) { var v = $('#add-' + i).value; if (!v) { $('#add-' + i).focus(); S.aviso('Escolha um exercício para adicionar.'); return; } d.itens.push(X(v, 3, 12, 0)); desenhaDivs('#x-' + i + '-' + (d.itens.length - 1) + '-c'); atualiza(); S.aviso(EXS[v].nome + ' adicionado ao treino ' + LETRAS[i] + '.'); }
    else if (b.dataset.mv) { var j = +b.closest('.ex').dataset.e, k = j + +b.dataset.mv, tmp = d.itens[j]; d.itens[j] = d.itens[k]; d.itens[k] = tmp; desenhaDivs(); atualiza(); var nb = $('.div[data-d="' + i + '"] .ex[data-e="' + k + '"] [data-mv="' + b.dataset.mv + '"]'); (nb && !nb.disabled ? nb : $('.div[data-d="' + i + '"] .ex[data-e="' + k + '"] [data-mv="' + -b.dataset.mv + '"]')).focus(); S.aviso(EXS[tmp.ex].nome + ' agora é o ' + (k + 1) + 'º do treino ' + LETRAS[i] + '.'); }
    else if (b.hasAttribute('data-rm-ex')) { var jj = +b.closest('.ex').dataset.e, nome = EXS[d.itens[jj].ex].nome; d.itens.splice(jj, 1); desenhaDivs('#add-' + i); atualiza(); S.aviso(nome + ' retirado.'); }
    else if (b.hasAttribute('data-rm-div')) { var tira = function () { fe.divs.splice(i, 1); desenhaDivs('#ed-add-div'); $('#ed-add-div').focus(); atualiza(); S.aviso('Treino removido.'); }; if (d.itens.length) S.confirma('O treino ' + LETRAS[i] + ' (' + d.foco + ') e os ' + d.itens.length + ' exercícios dele saem da ficha.', tira); else tira(); }
  });
  $('#ed-add-div').addEventListener('click', function () { if (fe.divs.length >= 5) { S.aviso('Até 5 treinos por ficha (A a E).'); return; } fe.divs.push({ foco: 'Treino ' + LETRAS[fe.divs.length], dias: '', itens: [] }); desenhaDivs('#dv-f-' + (fe.divs.length - 1)); atualiza(); });
  $('#ed-acoes').addEventListener('click', function (e) {
    var b = e.target.closest('[data-ac]'); if (!b) return;
    if (b.dataset.ac === 'enviar') { if (!fe.aluno) { $('#ed-aluno').setAttribute('aria-invalid', 'true'); $('#ed-aluno').focus(); S.aviso('Escolha o aluno antes de enviar.'); return; } if (!soma(fe.divs, function (d) { return d.itens.length; })) { $('#add-0').focus(); S.aviso('Adicione pelo menos um exercício.'); return; } S.demo(msgFicha(fe), 'Ficha enviada ao aluno'); }
    else if (b.dataset.ac === 'imprimir') { atualiza(); window.print(); }
    else if (b.dataset.ac === 'renovar') { fe.criada = S.hoje; atualiza(); $('#subtitulo').textContent = 'Criada em ' + br(fe.criada) + ' · renovar em ' + br(renovarEm(fe)); S.aviso('Ficha renovada. Próxima revisão em ' + br(renovarEm(fe)) + '.'); }
    else if (b.dataset.ac === 'excluir') { var f = fe; S.confirma('A ficha de treino será apagada.', function () { D().fichas = D().fichas.filter(function (x) { return x !== f; }); fe = null; $('#editor').hidden = true; G.salva(); vaiTela('treinos', true); S.aviso('Ficha apagada.'); }); }
  });

  /* ---------- tela: aulas ---------- */
  var modVisto = 'todas', diaMob = 0;
  function estado(au) { var r = reservas(au.id), f = r.r.length / au.vagas; return { r: r, cls: r.r.length >= au.vagas ? 'cheia' : f >= .8 ? 'quase' : 'livre' }; }
  function cartaoAula(au) { var e = estado(au), r = e.r;
    return '<li><button class="aula ' + e.cls + '" type="button" data-aula="' + au.id + '"><span class="au-hora">' + hm(au.hora) + ' <small>' + au.dur + ' min</small></span><b>' + MODS[au.mod] + '</b><span class="au-prof">' + au.prof + '</span>' +
      '<span class="au-ocup"><span class="b-trilho" aria-hidden="true"><i style="width:' + Math.min(100, r.r.length / au.vagas * 100).toFixed(0) + '%"></i></span><span>' + r.r.length + '/' + au.vagas + '<span class="sr"> vagas reservadas</span></span></span>' +
      (e.cls === 'cheia' ? '<span class="etq perigo">Lotada' + (r.e.length ? ' · ' + r.e.length + ' na espera' : '') + '</span>' : '') + '</button></li>'; }
  function desenhaAulas() {
    $('#filtro-mod').innerHTML = ['todas'].concat(Object.keys(MODS)).map(function (k) { return '<button type="button" data-mod="' + k + '" aria-pressed="' + (modVisto === k) + '">' + (k === 'todas' ? 'Todas' : MODS[k]) + '</button>'; }).join('');
    $('#dias-mob').innerHTML = SEMANA.map(function (d, i) { return '<button type="button" data-dia-mob="' + i + '" aria-pressed="' + (diaMob === i) + '">' + (d.data === S.hoje ? 'Hoje' : DIA_CURTO[d.dow]) + ' <small>' + S.curta(d.data).slice(0, 2) + '</small></button>'; }).join('');
    $('#grade').innerHTML = SEMANA.map(function (d, i) { var as = d.aulas.filter(function (a) { return modVisto === 'todas' || a.mod === modVisto; });
      return '<section class="dia' + (i === diaMob ? ' ativo' : '') + '" aria-labelledby="dia-' + i + '"><h2 id="dia-' + i + '">' + (d.data === S.hoje ? 'Hoje · ' : '') + DIA_CURTO[d.dow] + ' <small>' + S.curta(d.data) + '</small></h2><ul>' + (as.length ? as.map(cartaoAula).join('') : '<li class="vazio">Sem aulas desta modalidade.</li>') + '</ul></section>'; }).join('');
  }
  $('#filtro-mod').addEventListener('click', function (e) { var b = e.target.closest('[data-mod]'); if (!b) return; modVisto = b.dataset.mod; desenhaAulas(); $('[data-mod="' + modVisto + '"]').focus(); });
  $('#dias-mob').addEventListener('click', function (e) { var b = e.target.closest('[data-dia-mob]'); if (!b) return; diaMob = +b.dataset.diaMob; desenhaAulas(); $('[data-dia-mob="' + diaMob + '"]').focus(); });
  var auAberta = null;
  function abreAula(id, foco) {
    var au = AULA[id]; auAberta = au; var r = reservas(id), dd = deIso(au.data);
    $('#au-titulo').textContent = MODS[au.mod] + ' · ' + (au.data === S.hoje ? 'hoje' : DIA_CURTO[au.dow === undefined ? dd.getDay() : au.dow]) + ', ' + S.curta(au.data) + ', ' + hm(au.hora);
    $('#au-info').innerHTML = esc(au.prof) + ' · ' + au.dur + ' min · <b>' + r.r.length + ' de ' + au.vagas + ' vagas reservadas</b>' + (r.e.length ? ' · ' + plural(r.e.length, 'pessoa', 'pessoas') + ' na espera' : '');
    var linha = function (aid, lista, i) { var a = aluno(aid); return '<li><span>' + esc(a.nome) + ' <span class="dica">· ' + plano(a.plano).nome + '</span></span><button class="btn btn-s btn-sm" type="button" data-tirar="' + aid + '" data-lista="' + lista + '">' + (lista === 'r' ? 'Cancelar' : 'Tirar da espera') + '<span class="sr"> ' + esc(a.nome) + '</span></button></li>'; };
    $('#au-res').innerHTML = r.r.length ? r.r.map(function (x, i) { return linha(x, 'r', i); }).join('') : '<li class="vazio">Nenhuma reserva ainda.</li>';
    $('#au-esp').innerHTML = r.e.length ? r.e.map(function (x, i) { return linha(x, 'e', i); }).join('') : '<li class="vazio">Ninguém na espera.</li>';
    $('#au-t-res').textContent = 'Reservas (' + r.r.length + '/' + au.vagas + ')'; $('#au-t-esp').textContent = 'Lista de espera (' + r.e.length + ')';
    achados(); if (!$('#painel-aula').open) { $('#au-busca').value = ''; $('#au-barrado').hidden = true; achados(); S.abre($('#painel-aula')); }
    if (foco) { var el = $(foco); if (el) el.focus(); }
  }
  function achados() {
    var q = $('#au-busca').value.trim().toLowerCase(), r = auAberta ? reservas(auAberta.id) : { r: [], e: [] };
    if (!q) { $('#au-achados').innerHTML = ''; return; }
    var lista = D().alunos.filter(function (a) { return a.nome.toLowerCase().indexOf(q) >= 0 && r.r.indexOf(a.id) < 0 && r.e.indexOf(a.id) < 0; }).slice(0, 6);
    var cheia = r.r.length >= auAberta.vagas;
    $('#au-achados').innerHTML = lista.length ? lista.map(function (a) { return '<li><span>' + esc(a.nome) + ' <span class="dica">· ' + plano(a.plano).nome + '</span></span><button class="btn btn-' + (cheia ? 's' : 'p') + ' btn-sm" type="button" data-reservar="' + a.id + '">' + (cheia ? 'Pôr na espera' : 'Reservar') + '<span class="sr"> ' + esc(a.nome) + '</span></button></li>'; }).join('') : '<li class="vazio">Nenhum aluno com esse nome (ou já está na lista).</li>';
  }
  $('#au-busca').addEventListener('input', function () { $('#au-barrado').hidden = true; achados(); });
  $('#painel-aula').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !auAberta) return; var au = auAberta, r = reservas(au.id);
    if (b.dataset.reservar) {
      var a = aluno(+b.dataset.reservar), s = situacao(a);
      if (!plano(a.plano).aulas) { var bx = $('#au-barrado'); bx.innerHTML = '<p>' + ico('info') + '<span><b>' + esc(a.nome) + '</b> está no plano ' + plano(a.plano).nome + ', que não inclui aulas coletivas.</span></p><button class="btn btn-p btn-sm" type="button" data-upgrade="' + a.id + '">Trocar para o Livre (' + R(plano('livre').preco) + ') e reservar</button>'; bx.hidden = false; $('[data-upgrade]', bx).focus(); return; }
      if (s.k === 'trancado') { $('#au-barrado').innerHTML = '<p>' + ico('info') + '<span>O plano de <b>' + esc(a.nome) + '</b> está trancado até ' + br(a.tranca.ate) + '.</span></p>'; $('#au-barrado').hidden = false; return; }
      reserva(au, a);
    } else if (b.dataset.upgrade) { var a2 = aluno(+b.dataset.upgrade); a2.plano = 'livre'; G.salva(); $('#au-barrado').hidden = true; reserva(au, a2, ' Plano trocado para o Livre.'); }
    else if (b.dataset.tirar) {
      var aid = +b.dataset.tirar, lista = b.dataset.lista, nome = aluno(aid).nome;
      r[lista] = r[lista].filter(function (x) { return x !== aid; });
      if (lista === 'r' && r.e.length && r.r.length < au.vagas) {
        var sobe = r.e.shift(); r.r.push(sobe); salva(); abreAula(au.id, '#au-busca');
        S.aviso('Reserva de ' + primeiro(nome) + ' cancelada. ' + aluno(sobe).nome + ' saiu da espera e ficou com a vaga.');
        S.demo('Olá, ' + primeiro(aluno(sobe).nome) + '! Abriu uma vaga na aula de ' + MODS[au.mod] + ' de ' + (au.data === S.hoje ? 'hoje' : DIA_CURTO[deIso(au.data).getDay()] + ', ' + S.curta(au.data)) + ' às ' + hm(au.hora) + ' (com ' + au.prof + ') e ela já é sua. Se não puder ir, é só avisar para liberar a vaga. Até lá!', 'Aviso de vaga para a lista de espera');
      } else { salva(); abreAula(au.id, '#au-busca'); S.aviso((lista === 'r' ? 'Reserva de ' : '') + primeiro(nome) + (lista === 'r' ? ' cancelada.' : ' saiu da lista de espera.')); }
    }
  });
  function reserva(au, a, extra) {
    var r = reservas(au.id), cheia = r.r.length >= au.vagas;
    (cheia ? r.e : r.r).push(a.id); $('#au-busca').value = ''; salva(); abreAula(au.id, '#au-busca');
    S.aviso(cheia ? primeiro(a.nome) + ' entrou na lista de espera (' + r.e.length + 'º).' + (extra || '') : primeiro(a.nome) + ' reservou a aula. ' + plural(au.vagas - r.r.length, 'vaga restante', 'vagas restantes') + '.' + (extra || ''));
  }

  /* ---------- tela: planos ---------- */
  function desenhaPlanos() {
    $('#planos').innerHTML = D().planos.map(function (p) { var al = D().alunos.filter(function (a) { return a.plano === p.id && situacao(a).k !== 'trancado'; });
      return '<article class="plano' + (p.ativo ? '' : ' fechado') + '"><div class="pl-topo"><h2>' + esc(p.nome) + '</h2>' + (p.ativo ? '' : '<span class="etq">Fechado para novas matrículas</span>') + '</div><p class="pl-preco">' + R(p.preco) + '<small>/mês</small></p>' +
        '<ul class="pl-inclui"><li class="sim">' + ico('check') + 'Musculação em horário livre</li><li class="' + (p.aulas ? 'sim' : 'nao') + '">' + ico(p.aulas ? 'check' : 'x') + (p.aulas ? 'Aulas coletivas' : 'Sem aulas coletivas') + '</li><li class="' + (p.personal ? 'sim' : 'nao') + '">' + ico(p.personal ? 'check' : 'x') + (p.personal ? plural(p.personal, 'sessão', 'sessões') + ' de personal por mês' : 'Sem personal') + '</li><li class="sim">' + ico('check') + 'Avaliação física: ' + p.aval.toLowerCase() + '</li></ul>' +
        '<dl class="pl-num"><div><dt>Alunos ativos</dt><dd>' + al.length + '</dd></div><div><dt>Receita por mês</dt><dd>' + R(al.length * p.preco) + '</dd></div></dl><button class="btn btn-s" type="button" data-plano="' + p.id + '">' + ico('editar') + 'Editar<span class="sr"> o plano ' + esc(p.nome) + '</span></button></article>'; }).join('');
  }
  var plEd = null;
  function abrePlano(p) { plEd = p || null; $('#pl-titulo').textContent = p ? 'Editar plano ' + p.nome : 'Novo plano';
    $('#pl-nome').value = p ? p.nome : ''; $('#pl-preco').value = p ? fmtValor(p.preco) : ''; $('#pl-aulas').checked = p ? p.aulas : true; $('#pl-personal').value = p ? p.personal : 0; $('#pl-aval').value = p ? p.aval : 'A cada 3 meses'; $('#pl-ativo').checked = p ? p.ativo : true;
    $('#e-plnome').hidden = $('#e-plpreco').hidden = true; S.abre($('#painel-plano')); $('#pl-nome').focus(); }
  $('#novo-plano').addEventListener('click', function () { abrePlano(null); });
  $('#planos').addEventListener('click', function (e) { var b = e.target.closest('[data-plano]'); if (b) abrePlano(plano(b.dataset.plano)); });
  $('#f-plano').addEventListener('submit', function (e) {
    e.preventDefault(); var nome = $('#pl-nome').value.trim(), preco = lerValor($('#pl-preco').value), mn = nome.length < 2, mp = !(preco > 0);
    $('#e-plnome').hidden = !mn; $('#pl-nome').setAttribute('aria-invalid', mn); $('#e-plpreco').hidden = !mp; $('#pl-preco').setAttribute('aria-invalid', mp);
    if (mn) { $('#pl-nome').focus(); return; } if (mp) { $('#pl-preco').focus(); return; }
    var p = plEd || { id: 'p' + Date.now().toString(36) }; p.nome = nome; p.preco = preco; p.aulas = $('#pl-aulas').checked; p.personal = Math.max(0, parseInt($('#pl-personal').value, 10) || 0); p.aval = $('#pl-aval').value; p.ativo = $('#pl-ativo').checked;
    if (!plEd) D().planos.push(p); S.fecha($('#painel-plano')); salva(); S.aviso(plEd ? 'Plano ' + p.nome + ' atualizado. O novo preço vale no próximo vencimento de cada aluno.' : 'Plano ' + p.nome + ' criado.');
    var b = $('[data-plano="' + p.id + '"]'); if (b) b.focus();
  });

  /* ---------- ações comuns ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.cobrar) { var a = aluno(+b.dataset.cobrar); a.cobrado = S.hoje; G.salva(); if (!$('#painel-aluno').open) desenha(); S.demo(msgCobrar(a), 'Lembrete de mensalidade'); }
    else if (b.dataset.pagar) abrePag(aluno(+b.dataset.pagar));
    else if (b.dataset.aluno) abreAluno(aluno(+b.dataset.aluno));
    else if (b.dataset.aula && !b.closest('#painel-aula')) abreAula(b.dataset.aula, '#au-busca');
    else if (b.dataset.ficha && !b.closest('#painel-aluno')) abreEditor(D().fichas.filter(function (f) { return f.id === +b.dataset.ficha; })[0]);
  });
  $('.recomecar').addEventListener('click', function () { S.confirma('Recomeçar apaga o que você fez nesta demonstração e volta aos dados de exemplo.', function () { G.recomeca(); if (fe) { fe = null; $('#editor').hidden = true; } vaiTela('inicio', true); S.aviso('Demonstração recomeçada.'); }); });

  var telaAtual = 'inicio';
  function contadores() {
    $('#n-cobrar').textContent = D().alunos.filter(function (a) { var k = situacao(a).k; return k === 'atrasado' || k === 'breve'; }).length || '';
    $('#n-renovar').textContent = D().fichas.filter(function (f) { return renovarEm(f) <= S.hoje; }).length || '';
  }
  function desenha() {
    contadores();
    ({ inicio: desenhaInicio, alunos: desenhaAlunos, treinos: desenhaFichas, aulas: desenhaAulas, planos: desenhaPlanos })[telaAtual]();
  }
  var SUB = { inicio: S.longa(S.hoje), alunos: 'Quem está em dia, quem vence logo e quem atrasou', treinos: 'Fichas montadas pelos professores', aulas: 'Os próximos 6 dias de aula, com vagas e lista de espera', planos: 'O que cada plano inclui' };
  var vaiTela = S.telas(function (tela) { if (fe) fechaEditor(); telaAtual = tela; $('#subtitulo').textContent = SUB[tela]; desenha(); });
})();
