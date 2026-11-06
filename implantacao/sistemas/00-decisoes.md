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
