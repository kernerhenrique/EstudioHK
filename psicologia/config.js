/* =====================================================================
   CONFIGURAÇÃO DA PÁGINA DE VENDAS (um arquivo por nicho)
   ---------------------------------------------------------------------
   Para criar a página de outro nicho: duplique a pasta do site inteira
   e troque os textos, preços e links deste arquivo.

   O título, a descrição e a imagem que aparecem quando o link é
   compartilhado ficam no <head> do index.html (os aplicativos de
   mensagem não leem este arquivo).

   Na demonstração, tudo que estiver como [PREENCHER: ...] aparece
   marcado com marca-texto, igual à skill faz.
   ===================================================================== */

window.PAGE_CONFIG = {
  marca: "Documento Certo",

  // Cores da identidade EstudioHK (guia de marca v1). Violeta = detalhes; índigo = brilho.
  tema: { acento: "#796CBF", acentoEscuro: "#9184D9", aurora: "#262A60", auroraEscuro: "#9184D9" },

  hero: {
    eyebrow: "Para psicólogas e psicólogos",
    titulo: "Documentos, prontuário e anamnese no padrão do CFP, prontos em minutos.",
    subtitulo:
      "Skills para o Claude que transformam as suas anotações em documentos, evoluções e anamneses organizadas. Leve só a que você precisa ou monte um combo com desconto. Sem inventar dado clínico.",
    cta: "Ver as skills",
    confianca: ["Garantia de 7 dias", "Acesso imediato", "Funciona no Claude"],
  },

  demo: {
    rotuloEntrada: "Suas anotações",
    entrada:
      "J.P.M., 7 anos, 2º ano. Mãe pediu, a escola quer entender como ajudar. Atendo desde abril, 22 sessões semanais de 50 min, mais 3 encontros com a mãe e 1 com o pai. TCC infantil, recursos lúdicos. Chegou por explosões de raiva, bateu num colega em março. Hoje perde jogo sem explodir na maioria das vezes. Mãe diz que caiu de quase todo dia para 1 a 2 vezes por semana. Validade 6 meses.",
    botao: "Gerar documento",
    tituloDocumento: "Relatório Psicológico",
    secoes: [
      {
        titulo: "Identificação",
        texto:
          "Atendido: J.P.M., 7 anos, 2º ano do Ensino Fundamental, [PREENCHER: nome da escola]. Solicitante: responsável legal (mãe), a pedido da coordenação escolar. Finalidade: informar a escola sobre o acompanhamento e oferecer orientações.",
      },
      {
        titulo: "Descrição da demanda",
        texto:
          "Segundo relato da mãe, a busca pelo atendimento ocorreu em razão de episódios frequentes de raiva em casa e na escola, incluindo agressão física a um colega em março de 2026.",
      },
      {
        titulo: "Procedimento",
        texto:
          "Acompanhamento fundamentado na Terapia Cognitivo-Comportamental infantil, com 22 sessões semanais de 50 minutos desde abril de 2026, três encontros com a mãe e um com o pai.",
      },
      {
        titulo: "Análise",
        texto:
          "Observou-se, nas sessões, ampliação gradual da tolerância à frustração em atividades lúdicas. Conforme relato da mãe, os episódios em casa passaram de quase diários para uma a duas vezes por semana.",
      },
      {
        titulo: "Conclusão",
        texto:
          "Recomenda-se a continuidade do acompanhamento. O conteúdo deste relatório tem validade de seis meses.",
      },
    ],
    assinatura: "Vitória, [PREENCHER: data]. [PREENCHER: nome e CRP]",
  },

  paraQuem: {
    sim: [
      "Psicólogas e psicólogos que escrevem relatórios para escola, médico ou justiça",
      "Quem já usa o Claude ou quer começar a usar no consultório",
      "Quem perde noites formatando documento depois do expediente",
    ],
    nao: [
      "Quem espera que a IA decida o diagnóstico",
      "Quem não pretende revisar o que vai assinar",
    ],
  },

  comparacao: {
    titulo: "A mesma tarefa, com e sem o kit",
    subtitulo: "Pedimos um relatório escolar com as mesmas anotações.",
    rotuloComum: "IA sem instrução",
    rotuloKit: "Com o kit",
    comum: [
      { texto: "Eu atendi o paciente durante 22 sessões e percebi que ele melhorou.", nota: "Primeira pessoa. A Resolução pede texto impessoal." },
      { texto: "O paciente apresenta TDAH e transtorno opositor desafiador.", nota: "Diagnóstico que ninguém informou, num documento que não tem essa finalidade." },
      { texto: "Na sessão do dia 12 ele disse: “eu odeio a escola”.", nota: "Transcrição literal de sessão." },
      { texto: "Atenciosamente, a psicóloga.", nota: "Sem prazo de validade e sem CRP." },
    ],
    kit: [
      { texto: "Acompanhamento realizado em 22 sessões semanais de 50 minutos, desde abril de 2026.", nota: "Terceira pessoa, com número de encontros e duração." },
      { texto: "Observou-se ampliação gradual da tolerância à frustração em atividades lúdicas.", nota: "Descreve o processo, sem diagnóstico." },
      { texto: "Conforme relato da mãe, os episódios diminuíram para uma a duas vezes por semana.", nota: "Toda afirmação tem fonte." },
      { texto: "O conteúdo deste relatório tem validade de seis meses.", nota: "Prazo de validade no último parágrafo." },
    ],
  },

  kit: {
    titulo: "Em cada skill você recebe",
    itens: [
      { nome: "A skill pronta para instalar", texto: "Um arquivo que você envia para o Claude uma vez e usa sempre." },
      { nome: "Vídeo de instalação", texto: "Do download ao primeiro uso em menos de 5 minutos." },
      { nome: "Pedidos de exemplo", texto: "Modelos de pedido para os casos mais comuns do consultório." },
      { nome: "Nenhum dado inventado", texto: "O que faltar fica marcado para você completar. A revisão e a assinatura são suas." },
    ],
  },

  // Estimativa: a pessoa escolhe quantos documentos faz e quanto tempo leva hoje.
  // minutosDepois = tempo estimado para revisar o rascunho gerado pela skill.
  calculadora: {
    titulo: "Quanto tempo você pode recuperar",
    rotulo: "Documentos e registros que você escreve por semana",
    rotuloTempo: "Quanto tempo cada um leva hoje",
    min: 1, max: 30, padrao: 6,
    opcoesMinutos: [20, 40, 60, 90], minutosAntes: 40, minutosDepois: 10,
    unidade: "documentos",
    nota: "Estimativa. Considera cerca de 10 minutos para revisar cada rascunho; o tempo real varia com o tipo de documento.",
  },

  // A seção de depoimentos só aparece com mostrarDepoimentos: true.
  // Troque os exemplos pelos depoimentos reais antes de ligar. Com "exemplo: true"
  // o card mostra a etiqueta "Exemplo". Nunca publique depoimento inventado.
  mostrarDepoimentos: false,
  depoimentos: [
    { nome: "Nome da cliente", cargo: "Psicóloga infantil, cidade", texto: "Cole aqui o depoimento real da sua primeira cliente. Os que mais convencem dizem quanto tempo ela economizou e o que mudou na rotina.", exemplo: true },
    { nome: "Nome do cliente", cargo: "Psicólogo clínico, cidade", texto: "Segundo depoimento real. Peça um print do WhatsApp ou um vídeo curto: prova concreta vende mais que elogio genérico.", exemplo: true },
  ],

  passos: [
    { titulo: "Compre", texto: "O acesso chega no seu e-mail logo após o pagamento." },
    { titulo: "Instale no Claude", texto: "Siga o vídeo de 5 minutos. Não precisa saber programar." },
    { titulo: "Peça o documento", texto: "Escreva as anotações do jeito que você já faz e diga qual documento precisa." },
  ],

  // Loja: skills avulsas + "monte seu combo".
  // Todas as combinações existem na Kiwify, cada uma com o próprio link.
  // Se algum dia apagar um combo daqui, a página sugere o kit mais barato que contém a seleção.
  // A chave do combo são os ids das avulsas, na ordem da lista, unidos por "+".
  loja: {
    titulo: "Escolha suas skills",
    subtitulo: "Leve só a que você precisa ou marque mais de uma e pague menos no combo.",
    ctaAvulsa: "Comprar",
    ctaCombo: "Comprar combo",
    ctaVerOpcoes: "Ver opções",
    garantia: "Garantia de 7 dias em qualquer compra: se não valer, devolvemos 100% do valor pela Kiwify.",
    avulsas: [
      { id: "documentos", nome: "Documentos CFP", preco: 47, texto: "Declaração, atestado, relatório, laudo e parecer na Resolução 06/2019.", checkoutUrl: "https://pay.kiwify.com.br/y4paXAN" },
      { id: "evolucao", nome: "Evolução de prontuário", preco: 37, texto: "Abertura, evolução e encerramento de acordo com a Resolução CFP 01/2009.", checkoutUrl: "https://pay.kiwify.com.br/55pJoxt" },
      { id: "infantil", nome: "Anamnese infantil", preco: 37, texto: "Roteiro da entrevista com os pais e registro organizado.", checkoutUrl: "https://pay.kiwify.com.br/LdlORH1" },
      { id: "adulto", nome: "Anamnese adulto", preco: 37, texto: "Roteiro da entrevista inicial, com avaliação de risco, e registro organizado.", checkoutUrl: "https://pay.kiwify.com.br/GbxAe5c" },
    ],
    combos: {
      "documentos+evolucao":                   { nome: "Documentos + Evolução", preco: 67, checkoutUrl: "https://pay.kiwify.com.br/gOAIfX1" },
      "documentos+infantil":                   { nome: "Documentos + Anamnese infantil", preco: 67, checkoutUrl: "https://pay.kiwify.com.br/PQcG5yI" },
      "documentos+adulto":                     { nome: "Documentos + Anamnese adulto", preco: 67, checkoutUrl: "https://pay.kiwify.com.br/4isgJom" },
      "evolucao+infantil":                     { nome: "Evolução + Anamnese infantil", preco: 57, checkoutUrl: "https://pay.kiwify.com.br/kNfA7ZX" },
      "evolucao+adulto":                       { nome: "Evolução + Anamnese adulto", preco: 57, checkoutUrl: "https://pay.kiwify.com.br/MFcqJZl" },
      "infantil+adulto":                       { nome: "Anamneses infantil + adulto", preco: 57, checkoutUrl: "https://pay.kiwify.com.br/hkq90Dj" },
      "documentos+evolucao+infantil":          { nome: "Kit Infantil", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/EJCe1By" },
      "documentos+evolucao+adulto":            { nome: "Kit Adulto", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/9p3hOSe" },
      "documentos+infantil+adulto":            { nome: "Documentos + Anamneses", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/GMGPMxb" },
      "evolucao+infantil+adulto":              { nome: "Evolução + Anamneses", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/CaXAqYI" },
      "documentos+evolucao+infantil+adulto":   { nome: "Completo", preco: 107, checkoutUrl: "https://pay.kiwify.com.br/aTaReS6" },
    },
    // Se a combinação marcada não existir, a página sugere o kit que a contém
    // mesmo que custe até este valor (R$) a mais que comprar separado.
    toleranciaKit: 10,
    // Skills que já aparecem marcadas no "monte seu combo" (apague para marcar todas)
    selecaoInicial: ["documentos", "evolucao", "infantil", "adulto"],
  },

  faq: [
    { p: "Preciso saber programar?", r: "Não. Você baixa um arquivo e envia para o Claude seguindo o vídeo. Leva poucos minutos." },
    { p: "Posso comprar só uma skill?", r: "Sim. Cada skill tem o próprio preço. O combo é só para quem quer mais de uma e pagar menos." },
    { p: "Posso comprar outra skill depois?", r: "Pode. As skills funcionam de forma independente, então dá para começar por uma e completar depois." },
    { p: "Em quais planos do Claude funciona?", r: "Em todos, inclusive no gratuito. Basta ativar \"Execução de código e criação de arquivos\" nas configurações do Claude, como mostra o vídeo de instalação. Em contas de empresa (Team ou Enterprise), o administrador precisa liberar o uso de skills." },
    { p: "A IA vai inventar dados do meu paciente?", r: "Não. A skill só usa o que você informa. Onde falta informação obrigatória, ela marca o campo para você completar." },
    { p: "E o sigilo?", r: "A skill pede só o necessário para o documento e sugere usar iniciais no rascunho. Siga também as regras de dados do Claude e do seu CRP." },
    { p: "Quem é responsável pelo documento?", r: "Você. A skill é um apoio de redação e conformidade. A autoria, a revisão e a assinatura continuam sendo da(o) psicóloga(o)." },
  ],

  final: {
    titulo: "Escolha a skill que mais pesa na sua semana.",
    texto: "Acesso imediato e garantia de 7 dias.",
    cta: "Ver as skills",
  },

  rodape: "Ferramenta de apoio à redação. A responsabilidade técnica e ética pelo documento é da(o) psicóloga(o) que o assina.",

  // Identificação do vendedor no rodapé (Decreto 7.962/2013).
  // Campos vazios não aparecem na página.
  vendedor: {
    nome: "Henrique Kerner",
    documento: "CPF 177.695.957-46",
    endereco: "Vitória/ES",
    email: "contato@estudiohk.com.br",
  },
};
