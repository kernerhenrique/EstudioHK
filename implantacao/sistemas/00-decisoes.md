# Sistemas sob medida: decisões (6/nov/2026)

Decidido pelo Henrique em 6/nov/2026. **Ainda não construir nada:** esperar ele pedir.

## As 4 demos de sistemas escolhidas

| # | Sistema | Para quem | O que faz |
|---|---|---|---|
| 1 | Quadro de pedidos e encomendas | Cafeteria, confeitaria, marmitaria, padaria | Pedidos em colunas (novo → preparando → pronto → entregue), com cliente, itens, valor e horário de retirada. Total do dia e pedidos de amanhã. Pode usar a Coadouro (demo de cafeteria). |
| 2 | Orçamento em PDF | Marcenaria, reforma, arquitetura, eventos, gráfica | Catálogo de itens com preço, orçamento montado em minutos, PDF com a marca e status (enviado, aprovado, recusado, vencido). |
| 4 | Mensalidades e alunos | Academia, escola de música, personal, curso | Alunos com plano e vencimento, quem está em dia ou atrasado, botão de cobrança pelo WhatsApp. Pode usar a FORJA Academia (combina com a automação de cobrança). |
| 6 | Estoque simples | Loja pequena, salão (produtos), distribuidora | Entradas e saídas, aviso de estoque mínimo e lista de compras automática. |

Ficaram de fora: 3 (ordem de serviço) e 5 (agenda e ficha do cliente).

## Como vão aparecer no site

- Página nova **"Sistemas"** (`/sistemas/`), como as de Sites e Automações, com os cartões das demos, item "Sistemas" no menu e na página inicial.
- Valor: **"Pedir orçamento"**, igual aos outros serviços (botão para o WhatsApp 5527996950409 com mensagem pronta "Tenho interesse em: <sistema>").

## Como cada demo deve funcionar

- Dados fictícios, tudo clicável no navegador, sem login.
- Aviso de que no sistema real os dados ficam salvos, com acesso por senha.
- Mesmas regras das outras demos: ramo curto para prévia, publicar só com o OK dele.

## Atualização (6/nov/2026, depois da primeira prévia)

O Henrique achou o quadro de pedidos básico demais e pediu algo mais completo, mas ainda simples. Decidido:

- **Pedidos (Coadouro)** ganhou:
  - mesas, com o garçom lançando pelo celular;
  - tela da cozinha;
  - cardápio editável (categorias, preço, esgotado);
  - pagamento com divisão da conta e troco;
  - fechamento do caixa;
  - entrega com bairro e taxa.
- Perfis (garçom, cozinha, caixa) ficaram de fora da demo.
- **Os outros 3 sistemas** seguem o mesmo nível. Antes de montar cada um, mostrar a lista do que ele vai ter para o Henrique aprovar.

## Atualização (6/nov/2026): academia

- O check-in na recepção saiu. Motivo dado pelo Henrique: em academia, quem marca a entrada é a catraca.
- O sistema da FORJA ficou com três partes:
  - mensalidades (com planos editáveis e trancamento);
  - fichas de treino A/B/C montadas pelo professor;
  - aulas com vagas, reserva e lista de espera.
- **Estoque (Ofício):** ele ficou sem preferência sobre os extras. Entram os 4 recomendados: venda no balcão, gasto por serviço, validade e pedido ao fornecedor.

## Atualização (6/nov/2026): apresentação dos sistemas

- O Henrique gostou das ideias, mas achou o visual e as funções simples demais para vender.
- Decidido: as 4 demos ficam cada uma na sua prévia (ramos `sis-pedidos`, `sis-orcamento`, `sis-academia`, `sis-estoque`), e a página `/sistemas/` fica **pendente**.
- **Piloto "uau"** no sistema de pedidos da Coadouro (ramo `sis-uau`). Se ele aprovar, o padrão vai para os outros três:
  - tela dividida com o celular do cliente;
  - passeio guiado;
  - quadro "quanto te devolve";
  - coisas acontecendo sozinhas;
  - fotos e gráficos;
  - cardápio por QR code na mesa.

## Pendência: imagens e vídeos de IA nas demos de site (6/nov/2026)

- O Henrique mandou imagens de IA (cold brew, copos, moedor, coador, prédio). A ideia **não** é mostrar o produto exato do cliente, e sim usar imagens bonitas para dar vida às animações.
- **Avaliação feita:**
  - moedor, coador e copo cheio servem, recortados, para a cena MOER / COAR / SERVIR;
  - copos em sequência só funcionam com mesma câmera (gerar um e editar o mesmo);
  - jarras derramando no balcão não servem;
  - o prédio serve só como foto de capa, porque o zoom borra;
  - o nome "VIVENCE" aparece nas fotos e precisa sair.
- **Para quando voltar ao assunto, pedir:**
  - imagens com 2.000 px ou mais, sem texto, com fundo liso (creme para os vidros);
  - sequências editando a mesma imagem;
  - de preferência, **vídeo de IA de 3 a 6 s com a câmera parada** (café enchendo, câmera entrando no prédio).
- **Como mandar:** ZIP no chat com os arquivos originais, ou upload em `materiais/fotos/` pelo GitHub.
- **A fazer no kit quando voltar:** bloco "vídeo na rolagem" (sequência de quadros, menos quadros no celular).

## Página /sistemas/ (6/11/2026, ramo pg-sistemas, aguardando aprovação)
- Seções: topo · "Experimente em 10 segundos" (4 cenas: cafeteria, marcenaria, academia e barbearia, com o painel do dono e o celular do cliente lado a lado) · calculadora "quanto devolve" por tipo de negócio · 4 prévias completas · o que vem em todo sistema · custos (Vercel Pro US$ 20, Supabase Pro US$ 25, Registro.br R$ 40/ano, Meta R$ 0,035; consultados em 6/11/2026) · como funciona · dúvidas · pedido de orçamento.
- Aviso de prévia (regra 3) na página e nas 4 demos: "Prévia das funcionalidades: este não é o sistema final." Também aparece no último passo do passeio do piloto.
- Home: "Sistemas" no menu, 3ª porta, "Ver demonstrações" no cartão de serviço, rodapé e Ctrl+K.
- Arquivos: `assets/sistemas.js`, os estilos `/* página /sistemas/ */` em `assets/site.css`, o modelo `scratchpad/tools/paginas/sistemas.main.html` (gerado por `hk_paginas.py`), e as miniaturas `demos/sistemas/*/assets/thumb-{480,800}.webp`.
- Próximo passo, depois do OK: levar orçamento, academia e estoque ao nível do piloto, um por vez.

## Mudança na página /sistemas/ (6/11/2026, pedido do Henrique) · publicada no main em 7/11/2026
- **Sem demos no site.** A página só tem simulações curtas: 4 abas (cafeteria, marcenaria, academia e barbearia) × 3 funcionalidades cada.
  - Cafeteria: pedido pelo QR, conta dividida, fechar o caixa.
  - Marcenaria: orçamento por ambiente, aprovação e assinatura, lembrete de retorno.
  - Academia: aula e lista de espera, ficha de treino, mensalidade atrasada.
  - Barbearia: venda no balcão, controle de validade, pedido ao fornecedor.
- Seções novas: "O que é sob medida" (3 colunas e o comparativo planilha × app pronto × sob medida) e "Funcionalidades possíveis" (4 grupos e os segmentos).
- A tabela de custos saiu.
- As 4 demos completas ficam **guardadas fora do site**: nenhum link no site e `noindex` (já existia). Servem para mostrar numa reunião:
  - /demos/sistemas/pedidos/ · /demos/sistemas/orcamento/ · /demos/sistemas/academia/ · /demos/sistemas/estoque/
- O plano de levar as demos ao nível do piloto fica suspenso, porque elas não vão para o site.
