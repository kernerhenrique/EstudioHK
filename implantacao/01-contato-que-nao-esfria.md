# 01 · Contato que não esfria

**Demo:** https://estudiohk.com.br/demos/automacoes/contato-que-nao-esfria/ (Taipa Arquitetura)

**O que faz:**
- quem pede orçamento pelo formulário do site recebe a confirmação na hora no WhatsApp;
- o pedido vira uma linha na planilha;
- quem atende recebe um aviso no WhatsApp;
- se ninguém responder em 2 horas, a automação manda um lembrete.

**Se a planilha falhar:** o n8n tenta de novo, guarda o pedido no e-mail de reserva e avisa a EstudioHK.

Leia antes o [00-base-comum.md](00-base-comum.md). Esta automação usa as peças `KIT · Enviar WhatsApp`, `KIT · Receber WhatsApp` e `KIT · Alerta` (base, item 4b) e a planilha Configuração (base, item 4c). WhatsApp: caminho A, número novo (base, item 3).

---

## 1. O que o cliente precisa ter (mandar esta lista)
- [ ] Site com formulário que a EstudioHK possa editar (se o site for de outra pessoa, precisamos de acesso ao código ou ao construtor).
- [ ] Conta Google do negócio (Planilhas e Gmail).
- [ ] WhatsApp oficial montado (caminho A, B ou C do guia base) e cartão na Meta.
- [ ] O WhatsApp **pessoal** de quem atende (recebe os avisos).
- [ ] Horário de atendimento (para o texto da confirmação e para o lembrete não sair de madrugada).

Com essas respostas, preencha a **Configuração**: aba Negócio (nome, horário), Pessoas (`atendimento`: WhatsApp de quem atende), Textos (`prazo_resposta`, ex.: "A Laís responde no mesmo dia útil") e Regras (`contato.lembrete_horas: 2`).

## 2. Formulário do site
- **Campos:**
  - nome;
  - WhatsApp, com DDD;
  - tipo de pedido (do ramo do cliente);
  - cidade (opcional);
  - mensagem (opcional);
  - **aceite do WhatsApp:** caixa desmarcada, texto "Aceito receber a resposta pelo WhatsApp. Meus dados só serão usados para responder este pedido."
- O formulário faz `POST` (JSON) para o **Webhook** do n8n.
- **Proteção contra spam:**
  - um campo escondido ("honeypot"): se vier preenchido, descartar;
  - validar o telefone (10 ou 11 dígitos);
  - limitar o tamanho dos textos.
- Não colocar chave secreta no código do site, porque qualquer pessoa vê. A proteção é a validação no n8n.
- Depois de enviar, o site mostra: "Pedido recebido! Mandamos uma confirmação no seu WhatsApp."
- Se o Webhook não responder, o site mostra o botão de WhatsApp comum como reserva.

## 3. Planilha "Contatos <negócio>" (Google Planilhas)
| Coluna | Exemplo | Observação |
|---|---|---|
| id | 2026-11-04-1042-7f3a | gerado no n8n (data + 4 letras), usado nos botões |
| recebido_em | 04/11/2026 10:42 | |
| nome | Júlia Santos | |
| whatsapp | 5527900000000 | só dígitos, com 55 |
| tipo | Reforma | |
| cidade | Vitória | |
| mensagem | … | |
| aceite_whatsapp | sim | sem "sim", não envia confirmação |
| status | Novo / Sem resposta / Respondido | |
| respondido_em | 04/11/2026 10:56 | |
| tempo_resposta | 14 min | fórmula ou n8n |
| lembrete_em | | preenchido quando o lembrete sai |

Proteja a planilha: só a conta do negócio e a conta de serviço do n8n editam.

## 4. Modelos de mensagem (criar no 1º dia, categoria Utilidade)
**`aviso_novo_pedido`** (para quem atende)
> Novo pedido de orçamento: {{1}} · {{2}} · {{3}}. Mensagem: "{{4}}". WhatsApp: {{5}}.
>
> Botão de resposta rápida: **Já respondi**

**`confirmacao_pedido`** (para o cliente, só com aceite)
> Olá, {{1}}! Recebemos seu pedido de {{2}}. {{3}} responde no mesmo dia útil. Esta é uma mensagem automática.

**`lembrete_sem_resposta`** (para quem atende)
> Lembrete: o pedido de {{1}} ({{2}}) está sem resposta há 2 horas.
>
> Botão: **Já respondi**

Sem ofertas nem promoções nos textos, para não virar Marketing.

## 5. Fluxos no n8n

### Fluxo A · Novo pedido
1. **Webhook** (POST): recebe o formulário. Responde 200 logo que validar, sem esperar o resto.
2. **Code / Set:**
   - valida (honeypot vazio, telefone com 10 ou 11 dígitos, nome preenchido);
   - normaliza o telefone para `55DDDNNNNNNNNN`;
   - gera o `id`.
3. **Google Sheets › Append row:** grava com status `Novo`. *Retry On Fail* ligado (3 vezes, 5 s).
   - **Saída de erro** (*On Error › Continue using error output*): vai para **Gmail › Send**, assunto `[Reserva] Novo pedido <id>`, com os dados, para o e-mail do negócio. Depois, **KIT · Alerta**.
4. **KIT · Enviar WhatsApp:** modelo `aviso_novo_pedido` para quem atende (telefone `atendimento` da aba Pessoas), botão com id `contato:<id>`.
5. **KIT · Enviar WhatsApp:** modelo `confirmacao_pedido` para o cliente, com `exige_aceite = sim` (a peça confere o aceite e não envia sem ele).
6. **Google Sheets › Update row:** registra o envio (o registro detalhado já fica na planilha de controle do kit).

### Fluxo B · Lembrete de 2 horas
1. **Schedule Trigger** a cada 15 min. Lê a Configuração e só segue no horário de atendimento (aba Negócio) e em dia útil (**KIT · Dias úteis**).
2. **Google Sheets › Get rows** com status `Novo`, `recebido_em` há mais de `contato.lembrete_horas` (aba Regras) e `lembrete_em` vazio.
3. Para cada linha:
   - **KIT · Enviar WhatsApp:** modelo `lembrete_sem_resposta` para quem atende, botão `contato:<id>`;
   - **Update row:** status `Sem resposta`, `lembrete_em` preenchido.

Por que um Schedule e não um "Wait" de 2 horas no Fluxo A: se o servidor reiniciar, nada se perde, e o "Já respondi" só precisa mudar a planilha.

### Fluxo C · "Já respondi"
1. Chega pelo **KIT · Receber WhatsApp** quando alguém toca no botão `contato:<id>`. O `id` do pedido já vem separado.
2. **Google Sheets › Update row:** status `Respondido`, `respondido_em` = agora.
3. Opcional: **KIT · Enviar WhatsApp** com texto livre "Anotado ✓" (dentro da janela; atendimento, grátis até 1.000 por mês).

### Fluxo D · Reserva de volta para a planilha
- **Na prática:** uma vez por dia, quem cuida da manutenção confere o e-mail com `[Reserva]` e cola as linhas na planilha.
- **Opcional:** um Schedule a cada hora que lê os e-mails com esse assunto (Gmail › Get many) e tenta gravar de novo.

## 6. Testes (antes de ligar)
- [ ] Pedido completo → linha na planilha, aviso para quem atende, confirmação para o cliente.
- [ ] Sem aceite → linha e aviso, **sem** confirmação para o cliente.
- [ ] Telefone inválido → não grava e o site mostra o erro.
- [ ] Planilha sem permissão por 1 min → e-mail de reserva e alerta para o Henrique.
- [ ] "Já respondi" → status Respondido e o lembrete não sai.
- [ ] Sem resposta → lembrete depois de 2 h, só no horário de atendimento.
- [ ] Honeypot preenchido → descartado.

## 7. Entregar ao cliente
- O documento de 1 página (base, item 6), com:
  - print do aviso que chega;
  - o que fazer: responder o cliente e tocar em **Já respondi**.
- Onde fica a planilha e o que cada status quer dizer.

## 8. Custos de terceiros (Meta, BRL, desde 1º/10/2026)
- **Por pedido:** aviso + confirmação = 2 × R$ 0,035; mais 1 lembrete quando não há resposta.
- **Conta da demo:** pedidos × 2 + (pedidos × % sem resposta) × R$ 0,035. Exemplo: 60 pedidos e 20% sem resposta = 132 mensagens = **R$ 4,62/mês**.
- **Google:** grátis na conta gratuita (o Gmail envia até 500 e-mails por dia).
- **n8n:** incluso na manutenção.
- **Caminho C:** somar a mensalidade do parceiro.
