/* =====================================================================
   CONFIGURAÇÃO DA PÁGINA DE VENDAS: FISIOTERAPIA
   ---------------------------------------------------------------------
   Mesma estrutura de psicologia/config.js. O título, a descrição e a
   imagem de compartilhamento ficam no <head> do index.html.

   Links de compra: enquanto algum checkoutUrl tiver "LINK-", a página
   fica em prévia (online, o botão mostra "As vendas abrem em breve").
   ===================================================================== */

window.PAGE_CONFIG = {
  marca: "Documento Certo",

  // Cores da identidade EstudioHK (guia de marca v1). Violeta = detalhes; índigo = brilho.
  tema: { acento: "#796CBF", acentoEscuro: "#9184D9", aurora: "#262A60", auroraEscuro: "#9184D9" },

  hero: {
    eyebrow: "Para fisioterapeutas",
    titulo: "Avaliação, evolução e documentos no padrão do COFFITO, prontos em minutos.",
    subtitulo:
      "Skills para o Claude que transformam as suas anotações em avaliações, evoluções, atestados e relatórios organizados. Leve só a que você precisa ou monte um combo com desconto. Sem inventar dado clínico.",
    cta: "Ver as skills",
    confianca: ["Garantia de 7 dias", "Acesso imediato", "Funciona no Claude"],
  },

  demo: {
    rotuloEntrada: "Suas anotações",
    entrada:
      "Relatório para o ortopedista. Paciente A, 54 anos, pós-operatório de reconstrução do LCA do joelho direito (cirurgia em 03/06, conforme relatório médico). Atendo desde 20/06, 2x por semana, 24 atendimentos. Fortalecimento, treino de marcha e crioterapia. Flexão passou de 70° para 125°; força de quadríceps de grau 3 para 4. Anda sem muletas desde agosto. Ainda refere dor 3/10 ao descer escada. Indico continuar por mais 8 semanas.",
    botao: "Gerar documento",
    tituloDocumento: "Relatório Técnico Fisioterapêutico",
    secoes: [
      {
        titulo: "Identificação e finalidade",
        texto:
          "Paciente: [NOME COMPLETO], 54 anos. Destinatário: [PREENCHER: nome do médico ortopedista]. Finalidade: informar a evolução do tratamento fisioterapêutico no pós-operatório de reconstrução do ligamento cruzado anterior do joelho direito, realizada em 03/06/2026, conforme relatório médico.",
      },
      {
        titulo: "Acompanhamento",
        texto:
          "Atendimentos desde 20/06/2026, duas vezes por semana, totalizando 24 atendimentos.",
      },
      {
        titulo: "Condutas realizadas",
        texto:
          "Exercícios de fortalecimento, treino de marcha e crioterapia.",
      },
      {
        titulo: "Evolução e situação funcional",
        texto:
          "Flexão do joelho direito de 70° para 125°; força muscular do quadríceps de grau 3 para grau 4. Marcha sem auxílio de muletas desde agosto de 2026. Paciente refere dor 3/10 ao descer escadas.",
      },
      {
        titulo: "Conclusão",
        texto:
          "Indica-se a continuidade do tratamento fisioterapêutico por mais oito semanas.",
      },
    ],
    assinatura: "[PREENCHER: cidade], [PREENCHER: data]. [PREENCHER: nome] — Fisioterapeuta — CREFITO [nº]",
  },

  paraQuem: {
    sim: [
      "Fisioterapeutas que atendem muitos pacientes por dia e deixam as evoluções para depois",
      "Quem escreve relatórios para médico, convênio ou empresa",
      "Quem já usa o Claude ou quer começar a usar no consultório",
    ],
    nao: [
      "Quem espera que a IA escolha a conduta ou monte o tratamento",
      "Quem não pretende revisar o que vai assinar",
    ],
  },

  comparacao: {
    titulo: "A mesma tarefa, com e sem o kit",
    subtitulo: "Pedimos um relatório para o médico com as mesmas anotações.",
    rotuloComum: "IA sem instrução",
    rotuloKit: "Com o kit",
    comum: [
      { texto: "Diagnóstico: lesão do LCA grau III com condropatia patelar.", nota: "Diagnóstico que ninguém informou." },
      { texto: "Realizado TENS a 100 Hz por 20 minutos em todas as sessões.", nota: "Recurso e parâmetro inventados." },
      { texto: "O paciente estará 100% recuperado em dois meses.", nota: "Promessa de resultado." },
      { texto: "Atenciosamente, a fisioterapeuta.", nota: "Sem nome completo, CREFITO e data." },
    ],
    kit: [
      { texto: "Reconstrução do LCA realizada em 03/06/2026, conforme relatório médico.", nota: "Informação de outro profissional, com a fonte." },
      { texto: "Exercícios de fortalecimento, treino de marcha e crioterapia.", nota: "Só as condutas informadas." },
      { texto: "Flexão do joelho direito de 70° para 125°.", nota: "Só as medidas informadas, com unidade." },
      { texto: "[Nome] — Fisioterapeuta — CREFITO [nº], [data].", nota: "Identificação profissional completa." },
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

  // Estimativa: a pessoa escolhe quantos registros faz e quanto tempo leva hoje.
  // minutosDepois = tempo estimado para revisar o rascunho gerado pela skill.
  calculadora: {
    titulo: "Quanto tempo você pode recuperar",
    rotulo: "Evoluções e documentos que você escreve por semana",
    rotuloTempo: "Quanto tempo cada um leva hoje",
    min: 5, max: 120, padrao: 40,
    opcoesMinutos: [5, 10, 15, 30], minutosAntes: 10, minutosDepois: 4,
    unidade: "registros",
    nota: "Estimativa. Considera cerca de 4 minutos para revisar cada rascunho; o tempo real varia com o tipo de registro.",
  },

  // A seção de depoimentos só aparece com mostrarDepoimentos: true.
  // Nunca publique depoimento inventado.
  mostrarDepoimentos: false,
  depoimentos: [
    { nome: "Nome da cliente", cargo: "Fisioterapeuta, cidade", texto: "Cole aqui o depoimento real da sua primeira cliente.", exemplo: true },
  ],

  passos: [
    { titulo: "Compre", texto: "O acesso chega no seu e-mail logo após o pagamento." },
    { titulo: "Instale no Claude", texto: "Siga o vídeo de 5 minutos. Não precisa saber programar." },
    { titulo: "Peça o registro", texto: "Escreva as anotações do jeito que você já faz e diga o que precisa: avaliação, evolução, documento ou orientações." },
  ],

  // Loja: skills avulsas + "monte seu combo". A chave do combo são os ids das avulsas,
  // na ordem da lista, unidos por "+". Troque cada "LINK-" pelo link da Kiwify.
  loja: {
    titulo: "Escolha suas skills",
    subtitulo: "Leve só a que você precisa ou marque mais de uma e pague menos no combo.",
    ctaAvulsa: "Comprar",
    ctaCombo: "Comprar combo",
    ctaVerOpcoes: "Ver opções",
    garantia: "Garantia de 7 dias em qualquer compra: se não valer, devolvemos 100% do valor pela Kiwify.",
    avulsas: [
      { id: "documentos", nome: "Documentos fisioterapêuticos", preco: 47, texto: "Atestado, relatório técnico e parecer de capacidade funcional (Res. COFFITO 464/2016) e declaração de comparecimento.", checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-DOCUMENTOS" },
      { id: "evolucao", nome: "Evolução fisioterapêutica", preco: 37, texto: "Evolução de cada atendimento, reavaliação e alta, de acordo com a Res. COFFITO 414/2012.", checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-EVOLUCAO" },
      { id: "avaliacao", nome: "Avaliação fisioterapêutica", preco: 37, texto: "Roteiro da avaliação e registro de abertura com os itens mínimos do prontuário.", checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-AVALIACAO" },
      { id: "orientacoes", nome: "Orientações domiciliares", preco: 37, texto: "A sua prescrição vira uma folha de exercícios clara para o paciente fazer em casa.", checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-ORIENTACOES" },
    ],
    combos: {
      "documentos+evolucao":                       { nome: "Documentos + Evolução", preco: 67, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-DOC-EVO" },
      "documentos+avaliacao":                      { nome: "Documentos + Avaliação", preco: 67, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-DOC-AVA" },
      "documentos+orientacoes":                    { nome: "Documentos + Orientações", preco: 67, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-DOC-ORI" },
      "evolucao+avaliacao":                        { nome: "Avaliação + Evolução", preco: 57, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-EVO-AVA" },
      "evolucao+orientacoes":                      { nome: "Evolução + Orientações", preco: 57, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-EVO-ORI" },
      "avaliacao+orientacoes":                     { nome: "Avaliação + Orientações", preco: 57, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-AVA-ORI" },
      "documentos+evolucao+avaliacao":             { nome: "Kit Prontuário", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-DOC-EVO-AVA" },
      "documentos+evolucao+orientacoes":           { nome: "Documentos + Evolução + Orientações", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-DOC-EVO-ORI" },
      "documentos+avaliacao+orientacoes":          { nome: "Documentos + Avaliação + Orientações", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-DOC-AVA-ORI" },
      "evolucao+avaliacao+orientacoes":            { nome: "Avaliação + Evolução + Orientações", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-EVO-AVA-ORI" },
      "documentos+evolucao+avaliacao+orientacoes": { nome: "Completo", preco: 107, checkoutUrl: "https://pay.kiwify.com.br/LINK-FISIO-COMPLETO" },
    },
    toleranciaKit: 10,
    selecaoInicial: ["documentos", "evolucao", "avaliacao", "orientacoes"],
  },

  faq: [
    { p: "Preciso saber programar?", r: "Não. Você baixa um arquivo e envia para o Claude seguindo o vídeo. Leva poucos minutos." },
    { p: "Posso comprar só uma skill?", r: "Sim. Cada skill tem o próprio preço. O combo é só para quem quer mais de uma e pagar menos." },
    { p: "Posso comprar outra skill depois?", r: "Pode. As skills funcionam de forma independente, então dá para começar por uma e completar depois." },
    { p: "Em quais planos do Claude funciona?", r: "Em todos, inclusive no gratuito. Basta ativar \"Execução de código e criação de arquivos\" nas configurações do Claude, como mostra o vídeo de instalação. Em contas de empresa (Team ou Enterprise), o administrador precisa liberar o uso de skills." },
    { p: "A IA vai escolher exercícios ou a conduta?", r: "Não. A skill só organiza o que você avaliou e decidiu. Exercícios, cargas e condutas vêm sempre de você; o que faltar fica marcado para completar." },
    { p: "E o sigilo?", r: "A skill trabalha sem o nome do paciente e deixa nome, documento e endereço para você completar fora do chat. Também lembra de desativar o uso das conversas para treinamento nas configurações do Claude." },
    { p: "Quem é responsável pelo registro?", r: "Você. A skill é um apoio de redação. A avaliação, as decisões, a revisão e a assinatura continuam sendo da(o) fisioterapeuta." },
  ],

  final: {
    titulo: "Escolha a skill que mais pesa na sua semana.",
    texto: "Acesso imediato e garantia de 7 dias.",
    cta: "Ver as skills",
  },

  rodape: "Ferramenta de apoio à redação. A responsabilidade técnica e ética pelo registro é da(o) fisioterapeuta que o assina.",

  // Identificação do vendedor no rodapé (Decreto 7.962/2013).
  vendedor: {
    nome: "Henrique Kerner",
    documento: "CPF 177.695.957-46",
    endereco: "Vitória/ES",
    email: "contato@estudiohk.com.br",
  },
};
