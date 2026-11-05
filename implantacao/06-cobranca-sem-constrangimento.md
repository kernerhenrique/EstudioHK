# 06 · Cobrança sem constrangimento

**Demo:** https://estudiohk.com.br/demos/automacoes/cobranca-sem-constrangimento/ (FORJA Academia)

**O que faz:**
- **3 dias antes do vencimento**, cria a cobrança com Pix na conta de cobrança do cliente (ex.: Asaas), com código só daquele aluno;
- manda no WhatsApp um **aviso curto com o botão "Copiar código Pix"**;
- quando o Pix cai, **dá baixa** na planilha e manda o **recibo em PDF**;
- **antes de cada lembrete, confere o pagamento de novo**: nunca cobra quem já pagou;
- se atrasar: **1º lembrete 1 dia útil depois** e **2º lembrete 3 dias úteis depois**;
- depois disso, **para de mandar mensagem** e avisa a recepção, que conversa pessoalmente;
- o aluno pode responder "Já paguei" ou "Preciso de mais prazo": os lembretes pausam e a recepção é avisada.

**Sem IA.** **O dinheiro cai direto na conta do cliente: a EstudioHK nunca toca nele.**

Serve para academia, escola, curso, condomínio, clínica com pacote: qualquer negócio com mensalidade.

Leia antes o [00-base-comum.md](00-base-comum.md).

---

## 1. Antes da proposta: o que levantar
- **Como cobra hoje:** boleto, cartão recorrente, Pix na chave, dinheiro? Quantos alunos, quantos atrasam?
- **Lista de alunos:** de onde vem (sistema da academia com API ou exportação, ou planilha), com nome, WhatsApp, plano, valor e dia de vencimento.
- **Conta de cobrança com Pix e API:** o cliente já tem? Opções:
  1. **Asaas** (o da demo): Pix com API, aviso de pagamento por webhook, sem mensalidade;
  2. o **banco atual**, se oferecer Pix Cobrança com API e webhook;
  3. outra conta de pagamento com API.
- **Multa e juros:** só se estiverem **no contrato do aluno**. A automação não inventa valor. Na demo, não há multa.
- **Régua:** dias dos lembretes, horário (dia útil, horário comercial) e quando passa para a recepção.
- **Quem na recepção** recebe os avisos.
- **Pix Automático** (Banco Central): o aluno autoriza uma vez e paga sozinho todo mês. Vale oferecer. Quem aderir não recebe o aviso com código, só o recibo.

## 2. Regras de cobrança (Código de Defesa do Consumidor)
Texto oficial na Câmara, consultado em 5/nov/2026:
- **Art. 42:** "Na cobrança de débitos, o consumidor inadimplente não será exposto a ridículo, nem será submetido a qualquer tipo de constrangimento ou ameaça."
- **Art. 42, parágrafo único:** quem é cobrado em quantia indevida tem direito à devolução **em dobro** do que pagou a mais, salvo engano justificável. Por isso a conferência antes de cada lembrete é obrigatória.
- **Art. 42-A:** todo documento de cobrança traz o **nome, o endereço e o CPF ou CNPJ do fornecedor**. Por isso o rodapé de toda mensagem e do recibo.

**Regras da automação:**
- mensagem **só para o aluno** (nunca em grupo, nunca para outra pessoa);
- tom educado, sem ameaça, sem "último aviso", sem falar em SPC, Serasa ou protesto;
- só em **dia útil, das 9h às 18h**, pulando feriados;
- **no máximo 2 lembretes** por mensalidade. Depois, conversa humana.

## 3. O que o cliente precisa ter (mandar esta lista)
- [ ] **Conta de cobrança com Pix e API** no CNPJ do negócio (ex.: Asaas). Eu ajudo a abrir e a gerar a chave de API.
- [ ] **Lista de alunos** com WhatsApp, plano, valor e vencimento (sistema ou planilha).
- [ ] **Permissão do aluno** para receber mensagens da academia no WhatsApp (opt-in): no cadastro ou na matrícula.
- [ ] **WhatsApp oficial** (caminhos do guia base):
  - **A. número só para financeiro:** simples e separa o assunto;
  - **C. número de sempre, com parceiro de coexistência:** se a academia quer tudo num número só.
- [ ] Conta Google (planilha do painel e modelo do recibo).
- [ ] Nome, endereço e CNPJ que aparecem nas mensagens e no recibo.

## 4. Planilha "Mensalidades" (Google Planilhas)
Uma aba por mês, uma linha por aluno:

| Coluna | Exemplo |
|---|---|
| `aluno` | Lucas Andrade |
| `whatsapp` | +5527900000000 |
| `plano` / `valor` | Livre · 149,90 |
| `vencimento` | 2026-11-12 |
| `id_cobranca` | id da cobrança no Asaas |
| `situacao` | a vencer · aviso enviado · pago · atrasado · 1º lembrete · 2º lembrete · falar na recepção · pediu prazo · conferir comprovante · Pix Automático |
| `pago_em` | data e hora do Pix |
| `lembretes` | 0, 1 ou 2 |
| `recibo` | link do PDF no Drive |

Em cima: **recebido no mês × previsto**.

## 5. Modelos de mensagem do WhatsApp (criar no 1º dia)
Todos **Utilidade**. A Meta dá como exemplo de utilidade o lembrete de pagamento de um serviço contratado, desde que **sem oferta, sem propaganda e sem tentar renovar**.

**`mensalidade_aviso`** (com o botão **Copiar código Pix**, pelo modelo de "order details" da Meta para o Brasil):
> Oi, {{1}}! Sua mensalidade da {{2}} de {{3}} (plano {{4}}, R$ {{5}}) vence {{6}}. Se quiser, já pode pagar pelo Pix: é só copiar o código e colar no app do seu banco.
> Rodapé: {{nome}} · CNPJ {{cnpj}} · {{endereço}}

**`mensalidade_recibo`** (com o PDF anexado):
> Recebemos seu Pix de R$ {{1}}, {{2}}. Obrigado! O recibo da mensalidade de {{3}} está em anexo.

**`mensalidade_lembrete_1`** (com Copiar código Pix + respostas rápidas "Já paguei" e "Preciso de mais prazo"):
> Oi, {{1}}. Ainda não identificamos o pagamento da mensalidade que venceu {{2}}. Se já pagou, pode desconsiderar. O código Pix continua valendo. Se precisar de mais prazo, é só dizer.

**`mensalidade_lembrete_2`** (mesmos botões):
> Oi, {{1}}. A mensalidade de {{2}} (R$ {{3}}, vencida em {{4}}) continua em aberto. Se estiver passando por algum aperto, responda aqui que a recepção combina uma data com você. Sem problema nenhum.

**Documentação oficial do Pix no WhatsApp:**
- [Payments API Brasil](https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/overview);
- [Pix com código dinâmico](https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/offsite-pix);
- [modelo "order details"](https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orderdetailstemplate).

O WhatsApp **não faz a conciliação**: quem confirma o pagamento é a conta de cobrança, pelo `reference_id` da cobrança.

Se a conta da Meta ainda não tiver o recurso de pagamentos liberado, use um **modelo comum com o código Pix "copia e cola" no texto** e o link da fatura da conta de cobrança no botão.

## 6. Fluxos no n8n

### Fluxo A · Gerar cobranças e avisar (todo dia útil, 9h)
1. **Schedule Trigger:** segunda a sexta, às 9h, no fuso de Brasília. Feriados numa aba da planilha.
2. Ler os alunos com **vencimento daqui a 3 dias** e sem cobrança criada (contando dias corridos; se cair em fim de semana ou feriado, mandar no dia útil anterior).
3. Para cada aluno:
   - **HTTP Request** para a API da conta de cobrança: criar a cobrança Pix (valor, vencimento, cliente, descrição `Mensalidade nov/2026 · plano Livre`) e pegar o **código copia e cola**. Seguir a documentação oficial da conta (no Asaas, cliente + cobrança com forma de pagamento Pix);
   - salvar `id_cobranca` na planilha;
   - **WhatsApp › Send Template** `mensalidade_aviso` com o código no botão;
   - situação = `aviso enviado`.
4. Alunos em **Pix Automático**: não mandar aviso (o banco do aluno já avisa).

### Fluxo B · Pagamento recebido (webhook)
1. **Webhook** da conta de cobrança (evento de pagamento recebido ou confirmado). Conferir a assinatura ou o token do webhook.
2. Achar a linha pelo `id_cobranca`. **Se já estiver paga, parar** (o webhook pode chegar repetido).
3. Situação = `pago`, `pago_em`, recebido do mês.
4. **Recibo:**
   - **Google Drive › Copy** do modelo;
   - **Google Docs › Update**: nome, valor por extenso, mês, plano, data e hora do Pix, nº do recibo;
   - **Download** em PDF e **Upload** na pasta "Recibos/2026-11".
5. **WhatsApp › Media › Upload** do PDF e **Send Template** `mensalidade_recibo` com o documento.
6. Se o aluno estava com a recepção (`falar na recepção`, `pediu prazo`, `conferir comprovante`): avisar a recepção que **já pagou**.

### Fluxo C · Lembretes (todo dia útil, 9h)
1. Ler os alunos com situação `aviso enviado`, `1º lembrete` ou `2º lembrete` e vencimento passado.
2. **Para cada um, antes de qualquer mensagem: consultar a cobrança na API.** Se estiver paga, rodar o Fluxo B e **não lembrar**.
3. Conforme os dias úteis desde o vencimento:
   - 1 dia útil: `mensalidade_lembrete_1`;
   - 3 dias úteis: `mensalidade_lembrete_2`;
   - 5 dias úteis: **não manda nada ao aluno**; manda à recepção: nome, plano, valor, dias de atraso, "conversa pessoal, com discrição".
4. Atualizar `lembretes` e `situacao`.

### Fluxo D · Respostas do aluno
1. **WhatsApp Trigger:** botões "Já paguei" e "Preciso de mais prazo" (e texto livre com "paguei", "comprovante", "prazo").
2. **Já paguei:** consultar a API.
   - Pago: Fluxo B.
   - Não pago: responder (grátis, dentro das 24 h) que ainda não apareceu e pedir o comprovante; situação `conferir comprovante`; avisar a recepção. Lembretes pausados.
3. **Preciso de mais prazo:** responder que a recepção vai combinar a data; situação `pediu prazo`; avisar a recepção. Lembretes pausados.
4. Foto ou PDF de comprovante: salvar na pasta e avisar a recepção. **Não tentar "ler" o comprovante automaticamente.**

### Fluxo E · Conferência de hora em hora
1. **Schedule Trigger:** de hora em hora, das 8h às 20h.
2. Consultar na API as cobranças `aviso enviado` ou atrasadas que **já constam como pagas**. Para cada uma: rodar o Fluxo B.
3. Se achar alguma, **alerta para a EstudioHK**: o webhook falhou (conferir a URL e o token).

### Segurança
- A chave de API da conta de cobrança fica nas credenciais do n8n, nunca em texto no fluxo.
- **A automação só cria cobranças e consulta pagamentos.** Nunca faz transferência nem saque: se a conta permitir chaves com permissão limitada, usar só as de cobrança.
- Não guardar dados das execuções que deram certo (configuração do fluxo).

## 7. Testes (antes de ligar)
Usar o **ambiente de testes (sandbox)** da conta de cobrança.
- [ ] Cobrança criada com valor, vencimento e descrição certos.
- [ ] Aviso chega com o botão e o código funciona no app do banco (no sandbox, simular o pagamento).
- [ ] Pago: baixa, recibo com os dados certos e mensagem com o PDF.
- [ ] **Webhook repetido:** não manda 2 recibos.
- [ ] **Webhook desligado:** a conferência de hora em hora acha o pagamento e alerta.
- [ ] **Pago na véspera do lembrete:** o lembrete não sai.
- [ ] Lembrete 1, lembrete 2 e recepção nos dias úteis certos, pulando fim de semana e feriado.
- [ ] "Já paguei" e "Preciso de mais prazo" pausam os lembretes e avisam a recepção.
- [ ] Rodar **1 mês junto** com o controle que a academia já faz e comparar aluno por aluno.

## 8. Entregar ao cliente
- Documento de 1 página (guia base, item 6):
  - como ler a planilha e o que significa cada situação;
  - o que a recepção faz quando recebe um aviso;
  - como marcar um acordo de prazo ou um pagamento em dinheiro (situação `pago · balcão`, para a automação não cobrar).
- **Na manutenção:** ajustar a régua, os textos e os feriados; conferir a qualidade do número na Meta.

## 9. Custos de terceiros (fontes oficiais)
- **Asaas** ([preços e taxas](https://www.asaas.com/precos-e-taxas), consultado em 5/nov/2026):
  - **R$ 1,99 por cobrança Pix recebida** (R$ 0,99 nos 3 primeiros meses);
  - cobrança não paga não tem taxa ([página do Pix no Asaas](https://www.asaas.com/pix-asaas));
  - sem mensalidade;
  - as notificações do próprio Asaas custam R$ 0,99 cada: **não usar**, porque a automação já avisa pelo WhatsApp.
- **Meta:** utilidade R$ 0,035 por mensagem (tabela BRL desde 1º/10/2026). Por aluno: aviso + recibo = 2; quem atrasa, mais 2 lembretes.
- **Google:** grátis.
- **IA:** não usa.
- **n8n:** incluso na manutenção.
- **Exemplo, 400 alunos, 15% atrasam:**
  - Asaas: 400 × R$ 1,99 = R$ 796,00;
  - Meta: (800 + 120) × R$ 0,035 = R$ 32,20;
  - **total: R$ 828,20 por mês**, cerca de 1,4% de uma mensalidade de R$ 149,90.
- **Pix Automático** ([Banco Central](https://www.bcb.gov.br/estabilidadefinanceira/pix-automatico)): sem tarifa para quem paga; para quem recebe, a tarifa depende da conta de cobrança. Conferir na proposta.
