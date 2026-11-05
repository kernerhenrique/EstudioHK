# 02 · Agenda sem faltas

**Demo:** https://estudiohk.com.br/demos/automacoes/agenda-sem-faltas/ (Clínica Lumar)

**O que faz:**
- às 18h, lê a agenda de amanhã e manda um lembrete para cada paciente, com os botões **Confirmo** e **Preciso remarcar**;
- cada resposta atualiza a agenda;
- quem remarca escolhe um horário livre, e a vaga dele vai para a lista de espera;
- às 8h, a recepção recebe só a lista de quem não respondeu;
- número sem WhatsApp: a recepção é avisada na hora para ligar.

Serve para qualquer negócio com hora marcada: clínica, consultório, salão, barbearia, estúdio, escola.

Leia antes o [00-base-comum.md](00-base-comum.md). Esta automação usa as peças `KIT · Enviar WhatsApp`, `KIT · Receber WhatsApp`, `KIT · Dias úteis` e `KIT · Alerta` (base, item 4b) e a planilha Configuração (base, item 4c). WhatsApp: caminho A, número novo (base, item 3).

---

## 1. O que o cliente precisa ter (mandar esta lista)
- [ ] **Agenda:**
  - **Google Agenda**, ou
  - o **sistema** que já usa, com API documentada. Pedir o nome e conferir a documentação **antes da proposta**. Se o sistema já manda lembrete, automatizar só o que falta: lista de espera e lista da recepção.
- [ ] Conta Google (Planilhas, para a lista de espera).
- [ ] WhatsApp oficial montado (caminho A, B ou C do guia base) e cartão na Meta.
- [ ] O WhatsApp de quem liga para os pacientes (recepção).
- [ ] **Aceite do paciente** para receber mensagens. Ele precisa estar registrado em cada marcação: a recepção pergunta ao marcar, ou o formulário de agendamento tem a caixa.
- [ ] As regras da agenda:
  - duração das consultas;
  - quais horários podem ser oferecidos na remarcação;
  - quanto tempo a vaga espera a resposta da lista de espera.

Com essas respostas, preencha a **Configuração**: aba Negócio (nome, endereço, dias de atendimento), Pessoas (`recepcao`), Regras (`agenda.lembrete_hora: 18:00`, `agenda.lista_recepcao_hora: 08:00`, `agenda.vaga_espera_min: 60`, `agenda.opcoes_remarcar: 3`) e Feriados.

## 2. Cuidado com dado de saúde (LGPD)
- **Dado de saúde é "dado pessoal sensível"** (LGPD, art. 5º, II), e o tratamento só pode ocorrer nas hipóteses do art. 11 (texto oficial na Câmara).
- **A mensagem leva só:** primeiro nome, dia, hora e endereço. **Nunca** especialidade, médico, exame, procedimento ou motivo.
- O n8n **não guarda** o conteúdo da agenda. Ele lê, envia e registra só o ID do evento e o resultado.
- A clínica confirma o aviso de privacidade dela e a base legal que usa. Não é papel da EstudioHK dar parecer jurídico. Se houver dúvida, o cliente consulta o advogado ou o encarregado de dados dele.
- Nos ramos de saúde, conferir também as regras do conselho (CFM, CFO, CFP…) sobre comunicação com paciente.

## 3. Estrutura dos dados

**Google Agenda** (um calendário por profissional ou sala):
- **Título:** primeiro nome e inicial do paciente (ex.: `Ana S.`). Nada de procedimento no título.
- **Descrição, uma linha por campo:**
  ```
  whatsapp: 5527900000000
  aceite_whatsapp: sim
  ```
- **Situação:** guardada numa propriedade do evento (*extended property*, via API) ou num prefixo no título (`✓ Ana S.` confirmado, `↺ Ana S.` remarcou). Combine com a recepção qual dos dois é mais fácil de ver.

**Sistema da clínica:** mapear os mesmos campos (paciente, telefone, aceite, data e hora, situação) nos endpoints dele.

**Planilha "Lista de espera":**

| Coluna | Exemplo |
|---|---|
| id | le-0042 |
| nome | Carla N. |
| whatsapp | 5527900000000 |
| aceite_whatsapp | sim |
| pode_quando | manhã / tarde / qualquer horário |
| profissional | (opcional) |
| status | Esperando vaga / Vaga oferecida / Encaixado / Não quis |
| oferta_em | |

**Planilha de controle** (opcional, recomendada): `data`, `evento_id`, `mensagem`, `resultado` (enviado, entregue, falhou), `erro`.

## 4. Modelos de mensagem (criar no 1º dia, categoria Utilidade)
**`lembrete_consulta`**
> Olá, {{1}}! Lembrete da {{2}}: sua consulta é amanhã, {{3}}, às {{4}}. Endereço: {{5}}. Você confirma?
>
> Botões de resposta rápida: **Confirmo** · **Preciso remarcar**

**`vaga_lista_espera`** (para quem pediu para entrar na lista)
> Olá, {{1}}! Abriu um horário na {{2}}: {{3}}, às {{4}}. Quer ficar com ele?
>
> Botões: **Quero** · **Não posso**

**`lista_recepcao`** (para a recepção)
> Bom dia! Pacientes que não responderam o lembrete de hoje: {{1}}. Ligar antes do horário.

**`lembrete_nao_entregue`** (para a recepção)
> O lembrete de {{1}} ({{2}}) não foi entregue: o número não tem WhatsApp ou está errado. Ligar para confirmar.

As respostas dentro da conversa são texto livre ou botões interativos. Elas saem dentro da janela de 24 horas, como atendimento: "Confirmado!", "Estes horários estão livres", "Pronto, sua consulta passou para…".

## 5. Fluxos no n8n

### Fluxo A · Lembretes às 18h
1. **Schedule Trigger:** todo dia no horário de `agenda.lembrete_hora` (aba Regras). Só segue se amanhã for dia de atendimento (aba Negócio) e não for feriado (**KIT · Dias úteis**).
2. **Google Calendar › Get many events:** de amanhã 00:00 a 23:59, um por calendário (ou o endpoint do sistema).
3. **Code:** lê `whatsapp` e `aceite_whatsapp` da descrição e pula quem não tem aceite. Esses vão direto para a lista da recepção.
4. Para cada evento: **KIT · Enviar WhatsApp** com o modelo `lembrete_consulta`.
   - Variáveis: primeiro nome, nome da clínica (aba Negócio), dia da semana, hora, endereço.
   - Botões com id `agenda:confirmo:<evento>` e `agenda:remarcar:<evento>`.
   - A peça já tenta de novo e guarda o ID da mensagem na planilha de controle; aqui, guarde também o ID do evento junto.
5. Se a peça devolver `erro` (número inválido): **KIT · Enviar WhatsApp** com `lembrete_nao_entregue` para a `recepcao` (aba Pessoas).

### Fluxo B · Respostas do paciente
1. Chega pelo **KIT · Receber WhatsApp**: respostas dos botões `agenda:…` e também os **status** de entrega das mensagens que esta automação enviou.
2. **Switch** pela ação:
   - **Status `failed`** de um lembrete: procurar o evento pelo ID da mensagem e mandar `lembrete_nao_entregue` para a recepção (**KIT · Enviar**).
   - **Botão "Confirmo":**
     - marcar o evento como confirmado;
     - responder "Confirmado! Até amanhã às {{hora}}. Se precisar remarcar, é só responder aqui." (texto livre, dentro da janela).
   - **Botão "Preciso remarcar":**
     - buscar horários livres (Google Calendar › *Get availability* / free-busy, ou regra fixa do cliente);
     - mandar até `agenda.opcoes_remarcar` opções como **botões interativos** pelo **KIT · Enviar WhatsApp** (texto livre, dentro da janela), com ids `agenda:horario:<data-hora>`. A peça monta o botão interativo pela Cloud API.
   - **Escolha de horário:**
     - criar o evento novo;
     - marcar o antigo como remarcado e liberar o horário;
     - responder "Pronto! Sua consulta passou para…";
     - chamar o **Fluxo C** (vaga).
   - **Texto livre** ("posso ir mais tarde?"): avisar a recepção. Sem IA nesta automação.

### Fluxo C · Vaga para a lista de espera
1. Recebe o horário que abriu (subfluxo, *Execute Workflow*).
2. **Google Sheets › Get rows:** o primeiro da lista com status `Esperando vaga`, que pode no período (manhã/tarde) e tem aceite.
3. **KIT · Enviar WhatsApp** com `vaga_lista_espera`, botões `agenda:quero:<id>` e `agenda:naoposso:<id>`. Status `Vaga oferecida`, `oferta_em` = agora.
4. **Resposta "Quero"** (chega pelo Fluxo B):
   - criar o evento;
   - status `Encaixado`;
   - responder confirmando.

   **"Não posso" ou sem resposta em `agenda.vaga_espera_min` minutos** (Schedule a cada 10 min conferindo `oferta_em`): status `Não quis`, oferecer ao próximo.
5. Lista vazia: nada a fazer, a vaga fica livre na agenda.

### Fluxo D · Lista da recepção às 8h
1. **Schedule Trigger:** no horário de `agenda.lista_recepcao_hora`, nos dias de atendimento que não são feriado.
2. Eventos de hoje que **não** estão confirmados nem remarcados.
3. Se houver algum, **KIT · Enviar WhatsApp** com `lista_recepcao` para a `recepcao`, com "11:00 Rita S., 14:00 Paulo M.…" (horário e primeiro nome).

## 6. Testes (antes de ligar)
- [ ] Evento de amanhã com aceite → lembrete sai às 18h, com dia, hora e endereço **e nada de saúde**.
- [ ] Sem aceite → não sai lembrete; o paciente entra na lista da recepção.
- [ ] Confirmo → evento confirmado e resposta "Confirmado!".
- [ ] Preciso remarcar → 3 horários livres de verdade → escolha → evento novo e horário antigo liberado.
- [ ] Vaga → primeiro da lista recebe → "Quero" → encaixado. "Não posso" → próximo da lista.
- [ ] Número inexistente → recepção avisada na hora.
- [ ] 8h → lista só com quem não respondeu.
- [ ] Feriado ou dia sem atendimento → nada sai.
- [ ] Rodar junto com a confirmação manual por 1 semana.

## 7. Entregar ao cliente
- O documento de 1 página (base, item 6), com:
  - print do lembrete;
  - o que a recepção faz com cada aviso (lista das 8h, número sem WhatsApp, texto livre);
  - como colocar alguém na lista de espera.
- Combinar quem atualiza a planilha da lista de espera.

## 8. Custos de terceiros (Meta, BRL, desde 1º/10/2026)
- **Mensagens que a clínica inicia (R$ 0,035 cada):**
  - 1 lembrete por consulta;
  - 1 aviso de vaga por remarcação;
  - 1 lista da recepção por dia.
- **Respostas dentro da conversa** (confirmação, horários, remarcação): atendimento, **1.000 grátis por mês por número**. Acima disso, R$ 0,035 cada.
- **Conta da demo:** 400 consultas, 10% de remarcação e 22 dias = 462 mensagens = **R$ 16,17/mês**, com cerca de 480 respostas, dentro das 1.000 grátis.
- **Google:** grátis na conta gratuita.
- **n8n:** incluso na manutenção.
- **Caminho C:** somar a mensalidade do parceiro.
