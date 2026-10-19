/* =====================================================================
   CONFIGURAÇÃO DA PÁGINA DE VENDAS: NUTRIÇÃO
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
    eyebrow: "Para nutricionistas",
    titulo: "Anamnese, evolução e documentos no padrão do CFN, prontos em minutos.",
    subtitulo:
      "Skills para o Claude que transformam as suas anotações em registros de prontuário, relatórios e orientações claras para o paciente. Leve só a que você precisa ou monte um combo com desconto. Sem inventar dado e sem montar dieta por você.",
    cta: "Ver as skills",
    confianca: ["Garantia de 7 dias", "Acesso imediato", "Funciona no Claude"],
  },

  demo: {
    rotuloEntrada: "Suas anotações",
    entrada:
      "Retorno hoje, 15h. Paciente B, 38 anos. Seguiu o plano 5 de 7 dias, diz que \"o lanche da tarde ficou difícil no trabalho\". Sem queixas digestivas. Peso 82,4 kg (era 85,1 em setembro), estatura 1,68 m. Glicemia de jejum 98 mg/dL (exame de 10/10). Mantenho o plano, troco o lanche da tarde por opção que leva pronta de casa. Retorno em 30 dias.",
    botao: "Gerar registro",
    tituloDocumento: "Evolução Nutricional — Retorno",
    secoes: [
      {
        titulo: "Data e modalidade",
        texto:
          "[PREENCHER: data], 15h — Retorno — [PREENCHER: presencial ou telenutrição].",
      },
      {
        titulo: "Aceitação e tolerância",
        texto:
          "Adesão ao plano em 5 de 7 dias. Paciente refere que \"o lanche da tarde ficou difícil no trabalho\" (SIC). Sem queixas digestivas.",
      },
      {
        titulo: "Antropometria e bioquímica",
        texto:
          "Peso 82,4 kg (85,1 kg em setembro de 2026); estatura 1,68 m; IMC 29,2 kg/m² (calculado a partir dos valores informados; conferir). Glicemia de jejum 98 mg/dL (exame de 10/10/2026).",
      },
      {
        titulo: "Exame físico, capacidade funcional e diagnóstico",
        texto:
          "Exame físico nutricional e capacidade funcional: [PREENCHER ou NÃO REALIZADO NESTE RETORNO]. Diagnóstico nutricional da reavaliação: [PREENCHER].",
      },
      {
        titulo: "Conduta",
        texto:
          "Plano alimentar mantido, com substituição do lanche da tarde por opção levada pronta de casa. Retorno em 30 dias.",
      },
    ],
    assinatura: "[PREENCHER: nome e sobrenome] — Nutricionista — CRN-[região] [nº]",
  },

  paraQuem: {
    sim: [
      "Nutricionistas que deixam o prontuário dos retornos para o fim do dia",
      "Quem passa o plano do software para uma orientação que o paciente entende",
      "Quem já usa o Claude ou quer começar a usar no consultório",
    ],
    nao: [
      "Quem quer que a IA calcule ou monte a dieta",
      "Quem não pretende revisar o que vai assinar",
    ],
  },

  comparacao: {
    titulo: "A mesma tarefa, com e sem o kit",
    subtitulo: "Pedimos a evolução de um retorno com as mesmas anotações.",
    rotuloComum: "IA sem instrução",
    rotuloKit: "Com o kit",
    comum: [
      { texto: "Paciente com obesidade grau I e resistência à insulina.", nota: "Diagnóstico que ninguém informou." },
      { texto: "Ajustado o plano para 1.600 kcal com 30% de proteína.", nota: "Prescrição inventada pela IA." },
      { texto: "Paciente disse que tá difícil comer no trampo.", nota: "Linguagem informal e sem aspas ou SIC." },
      { texto: "Nutricionista responsável.", nota: "Sem nome, CRN e jurisdição." },
    ],
    kit: [
      { texto: "Paciente refere que \"o lanche da tarde ficou difícil no trabalho\" (SIC).", nota: "Fala do paciente marcada, como pede a Res. CFN 594/2017." },
      { texto: "Plano alimentar mantido, com substituição do lanche da tarde.", nota: "Só a conduta que a nutricionista decidiu." },
      { texto: "IMC 29,2 kg/m² (calculado a partir dos valores informados; conferir).", nota: "Conta simples, sinalizada para conferir." },
      { texto: "[Nome] — Nutricionista — CRN-[região] [nº].", nota: "Identificação profissional completa." },
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
    rotulo: "Registros e materiais que você escreve por semana",
    rotuloTempo: "Quanto tempo cada um leva hoje",
    min: 2, max: 60, padrao: 15,
    opcoesMinutos: [10, 15, 20, 40], minutosAntes: 15, minutosDepois: 5,
    unidade: "registros",
    nota: "Estimativa. Considera cerca de 5 minutos para revisar cada rascunho; o tempo real varia com o tipo de registro.",
  },

  // A seção de depoimentos só aparece com mostrarDepoimentos: true.
  // Nunca publique depoimento inventado.
  mostrarDepoimentos: false,
  depoimentos: [
    { nome: "Nome da cliente", cargo: "Nutricionista, cidade", texto: "Cole aqui o depoimento real da sua primeira cliente.", exemplo: true },
  ],

  passos: [
    { titulo: "Compre", texto: "O acesso chega no seu e-mail logo após o pagamento." },
    { titulo: "Instale no Claude", texto: "Siga o vídeo de 5 minutos. Não precisa saber programar." },
    { titulo: "Peça o registro", texto: "Escreva as anotações do jeito que você já faz e diga o que precisa: anamnese, evolução, documento ou orientações." },
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
      { id: "documentos", nome: "Documentos da nutricionista", preco: 47, texto: "Relatório nutricional, encaminhamento e declaração de comparecimento.", checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-DOCUMENTOS" },
      { id: "evolucao", nome: "Evolução nutricional", preco: 37, texto: "Retornos, atendimentos fora do protocolo e encerramento, de acordo com a Res. CFN 594/2017.", checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-EVOLUCAO" },
      { id: "anamnese", nome: "Anamnese nutricional", preco: 37, texto: "Roteiro da primeira consulta e registro com os itens do art. 4º da Res. CFN 594/2017.", checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-ANAMNESE" },
      { id: "orientacoes", nome: "Orientações ao paciente", preco: 37, texto: "O seu plano vira orientação clara, lista de compras e substituições que você definiu.", checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-ORIENTACOES" },
    ],
    combos: {
      "documentos+evolucao":                     { nome: "Documentos + Evolução", preco: 67, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-DOC-EVO" },
      "documentos+anamnese":                     { nome: "Documentos + Anamnese", preco: 67, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-DOC-ANA" },
      "documentos+orientacoes":                  { nome: "Documentos + Orientações", preco: 67, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-DOC-ORI" },
      "evolucao+anamnese":                       { nome: "Anamnese + Evolução", preco: 57, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-EVO-ANA" },
      "evolucao+orientacoes":                    { nome: "Evolução + Orientações", preco: 57, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-EVO-ORI" },
      "anamnese+orientacoes":                    { nome: "Anamnese + Orientações", preco: 57, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-ANA-ORI" },
      "documentos+evolucao+anamnese":            { nome: "Kit Prontuário", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-DOC-EVO-ANA" },
      "documentos+evolucao+orientacoes":         { nome: "Documentos + Evolução + Orientações", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-DOC-EVO-ORI" },
      "documentos+anamnese+orientacoes":         { nome: "Documentos + Anamnese + Orientações", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-DOC-ANA-ORI" },
      "evolucao+anamnese+orientacoes":           { nome: "Anamnese + Evolução + Orientações", preco: 77, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-EVO-ANA-ORI" },
      "documentos+evolucao+anamnese+orientacoes": { nome: "Completo", preco: 107, checkoutUrl: "https://pay.kiwify.com.br/LINK-NUTRI-COMPLETO" },
    },
    toleranciaKit: 10,
    selecaoInicial: ["documentos", "evolucao", "anamnese", "orientacoes"],
  },

  faq: [
    { p: "Preciso saber programar?", r: "Não. Você baixa um arquivo e envia para o Claude seguindo o vídeo. Leva poucos minutos." },
    { p: "Posso comprar só uma skill?", r: "Sim. Cada skill tem o próprio preço. O combo é só para quem quer mais de uma e pagar menos." },
    { p: "Posso comprar outra skill depois?", r: "Pode. As skills funcionam de forma independente, então dá para começar por uma e completar depois." },
    { p: "Em quais planos do Claude funciona?", r: "Em todos, inclusive no gratuito. Basta ativar \"Execução de código e criação de arquivos\" nas configurações do Claude, como mostra o vídeo de instalação. Em contas de empresa (Team ou Enterprise), o administrador precisa liberar o uso de skills." },
    { p: "A IA vai montar a dieta?", r: "Não. A prescrição é sua. A skill organiza o que você avaliou e decidiu e transforma o plano que você montou em orientação para o paciente. O novo Código de Ética do CFN, que entra em vigor em janeiro de 2027, deixa claro que a IA é apoio e não substitui a análise técnica da nutricionista." },
    { p: "E o sigilo?", r: "A skill trabalha sem o nome do paciente e deixa nome, documento e endereço para você completar fora do chat. Também lembra de registrar o consentimento do paciente para o uso de IA e de desativar o uso das conversas para treinamento." },
    { p: "Quem é responsável pelo registro?", r: "Você. A skill é um apoio de redação. A avaliação, a prescrição, a revisão e a assinatura continuam sendo da(o) nutricionista." },
  ],

  final: {
    titulo: "Escolha a skill que mais pesa na sua semana.",
    texto: "Acesso imediato e garantia de 7 dias.",
    cta: "Ver as skills",
  },

  rodape: "Ferramenta de apoio à redação. A responsabilidade técnica e ética pelo registro é da(o) nutricionista que o assina.",

  // Identificação do vendedor no rodapé (Decreto 7.962/2013).
  vendedor: {
    nome: "Henrique Kerner",
    documento: "CPF 177.695.957-46",
    endereco: "Vitória/ES",
    email: "contato@estudiohk.com.br",
  },
};
