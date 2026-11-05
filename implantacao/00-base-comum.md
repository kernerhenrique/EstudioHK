# 00 · Base comum a todas as automações

Leia antes de qualquer cliente. Os guias de cada automação partem daqui.

---

## 1. Mapeamento (antes da proposta)

Conversa de 30 a 60 minutos. Saia dela com as respostas abaixo por escrito.

**O processo hoje**
- Como a informação chega? Formulário, WhatsApp, telefone, Instagram, sistema?
- Quem faz o quê, em qual ferramenta, e quanto tempo leva por semana?
- Onde a informação se perde? É exatamente isso que a automação resolve.
- Quantos casos por mês? Contatos, consultas, cobranças… Esse número entra na conta de custos.

**As ferramentas que o cliente já tem**
- Conta Google (Gmail pessoal ou Google Workspace)?
- Sistema próprio (agenda, financeiro, CRM)? Ele tem API ou integração documentada? Peça o nome do sistema e confira a documentação **antes** de fechar.
- **WhatsApp:** qual número usa hoje? No aplicativo WhatsApp comum ou no WhatsApp Business? Quem atende por ele? (Isso define o caminho do item 3.)
- Tem empresa aberta (CNPJ)? A Meta pede dados da empresa para verificar a conta. Sem verificação a conta funciona, mas com limites menores.

**Regras do ramo**
- **Saúde:** dado de saúde é "dado pessoal sensível" (LGPD, art. 5º, II) e só pode ser tratado nas hipóteses do art. 11. Na prática:
  - mensagem sem especialidade, médico ou motivo;
  - a clínica confirma o aviso de privacidade dela.
- **Advocacia, psicologia e outros conselhos:** conferir as regras de publicidade e sigilo do conselho antes de escrever mensagens.

**Na proposta, sempre:**
- valor da criação, fechado;
- manutenção mensal (inclui o n8n e o acompanhamento);
- custos de terceiros estimados (Meta, IA, parceiro), pagos pelo cliente direto a eles;
- prazo e o que o cliente precisa providenciar (lista do item 2);
- "E se eu parar": contas no nome do cliente, fluxos exportados e ajuda para migrar.

---

## 2. Contas do cliente (sempre no nome dele)

Mande esta lista ao cliente logo depois do aceite:

- [ ] Conta Google do negócio (de preferência um e-mail do negócio, não o pessoal do dono).
- [ ] Portfólio empresarial na Meta (business.facebook.com) em nome do negócio, com o Henrique adicionado como **administrador**.
- [ ] Cartão de crédito cadastrado na Meta (Billing Hub) para as mensagens do WhatsApp. Sem forma de pagamento, a Meta não entrega mensagens além da faixa grátis.
- [ ] O número de WhatsApp que será usado (ver item 3) com acesso ao chip para receber o código.
- [ ] Acesso de leitura e escrita aos sistemas que vão ser ligados (agenda, planilha, CRM).
- [ ] Texto ou print do aviso de privacidade do site ou do formulário (para conferir o opt-in).

O Henrique trabalha como **convidado/administrador** nas contas do cliente. Nunca crie as contas no nome da EstudioHK.

---

## 3. WhatsApp oficial: escolher o caminho do número

**Regra da Meta (página oficial "Migrate an existing WhatsApp number", atualizada em 16/jun/2026):**
- para usar na Cloud API um número que já está no WhatsApp, é preciso **apagar a conta do aplicativo** antes;
- para um número do **WhatsApp Business**, a outra opção é fazer a ligação por um **parceiro que suporte a "coexistência"**.

| Caminho | Como fica | Quando usar |
|---|---|---|
| **A. Número novo só para a automação** (recomendado para começar) | Chip novo registrado direto na Cloud API. O número atual continua no app, como sempre. | Avisos, lembretes e confirmações. O cliente continua conversando pelo número de sempre. |
| **B. Migrar o número atual** | Apaga a conta do app e registra o número na Cloud API. **Perde o histórico** e o número **para de funcionar no aplicativo**. Para conversar à mão, precisa de uma ferramenta de atendimento ligada à API. | Só se o cliente quiser tudo num número só e aceitar uma ferramenta de atendimento. |
| **C. Coexistência por parceiro oficial** | O número continua no app WhatsApp Business (versão 2.24.17 ou superior) e também na API. O parceiro cobra à parte. Algumas funções do app mudam, como as listas de transmissão, que viram só leitura. | O cliente faz questão do mesmo número e do aplicativo. |
| **D. EstudioHK como Tech Provider** (futuro) | O Henrique oferece a coexistência direto pelo "Embedded Signup". Exige empresa verificada na Meta e aprovação do app (App Review) com acesso avançado a `whatsapp_business_messaging` e `whatsapp_business_management`. | Quando houver vários clientes de WhatsApp. Avaliar à parte. |

No caminho C, os parceiros estão na [vitrine de parceiros da Meta](https://business.facebook.com/messaging/partner-showcase). Confira se o parceiro suporta "business app number onboarding" e qual é o preço dele.

### Caminho padrão por automação (decidido em 5/nov/2026)
Para não decidir de novo a cada venda:

| Automação | Caminho padrão | Por quê |
|---|---|---|
| 1 · Contato que não esfria | **A. Número novo** | Só manda avisos e confirmações; a conversa continua no número de sempre. |
| 2 · Agenda sem faltas | **A. Número novo** | Lembretes e respostas de botão. |
| 3 · Atendente com IA | **C. Parceiro com coexistência** | O atendente precisa responder no número que os clientes já usam, e o dono assume pelo app. |
| 4 · Relatório da semana | **A. Número novo** (ou só e-mail) | Só manda para o dono e a equipe. |
| 5 · Escritório sem papelada | **A. Número novo** ("documentos") | Link de assinatura, pedido de documentos e fotos. |
| 6 · Cobrança sem constrangimento | **A. Número novo** ("financeiro") | Avisos, recibos e lembretes; separa o assunto. |

Mude de caminho só se o cliente pedir. **Um cliente com várias automações usa o mesmo número para todas** (as respostas são separadas pelo `KIT · Receber WhatsApp`, item 4b).

### Montar o WhatsApp oficial (caminhos A e B, direto na Meta)
1. No portfólio do cliente, crie um **app** em developers.facebook.com, do tipo Business, e adicione o produto **WhatsApp**. Use **um app por cliente**: cada app da Meta tem um único endereço de webhook.
2. Adicione o número em **WhatsApp Manager** e verifique por SMS ou ligação.
3. **Registre** o número na Cloud API. A Meta só permite isso **pela API** (endpoint `/<PHONE_NUMBER_ID>/register`, com um PIN de 6 dígitos de verificação em duas etapas). Guarde o PIN no cofre de senhas da EstudioHK, numa entrada com o nome do cliente.
4. Crie um **usuário do sistema** no portfólio, dê a ele acesso ao app e à conta do WhatsApp e gere um **token permanente**, com as permissões `whatsapp_business_messaging` e `whatsapp_business_management`. Esse token vai para a credencial do n8n.
5. Cadastre o **cartão** do cliente (Billing Hub) e escolha **BRL** como moeda.
6. No n8n, crie as credenciais `WhatsApp API` (para enviar) e `WhatsApp OAuth API` (para o WhatsApp Trigger receber). Siga a página de cada bloco na documentação do n8n. Elas são usadas só pelas peças `KIT · Enviar WhatsApp` e `KIT · Receber WhatsApp` (item 4b).
7. Mande uma mensagem de teste para o celular do Henrique.

### Modelos de mensagem (templates)
- **Mensagem que o negócio inicia só sai com modelo aprovado.** Resposta livre só dentro de 24 horas da última mensagem do cliente.
- Crie os modelos no **WhatsApp Manager › Modelos de mensagem**, em português (pt_BR), com variáveis `{{1}}`, `{{2}}`… e um exemplo de cada variável.
- **Categoria:** peça **Utilidade** para avisos ligados a algo que o cliente pediu (pedido, consulta, cobrança). **A Meta decide a categoria pelo conteúdo** e pode mudá-la: nada de oferta, desconto ou "aproveite" num modelo de utilidade, senão ele vira Marketing (R$ 0,3217 em vez de R$ 0,035).
- **Botões de resposta rápida** ("Confirmo", "Já respondi") abrem a janela de 24 h quando a pessoa toca. A resposta seguinte é de atendimento: as 1.000 primeiras do mês são grátis.
- **Crie os modelos no primeiro dia:** a aprovação depende da Meta e é o item que mais pode atrasar a entrega.

### Permissão (opt-in)
A Meta exige a permissão da pessoa antes de mandar mensagem.
- No formulário: caixa "Aceito receber a resposta pelo WhatsApp" (não pode vir marcada).
- Na marcação de consulta: a recepção pergunta e registra.
- **Sem aceite registrado, não envia.** O fluxo confere esse campo antes de cada envio.

---

## 4. n8n (servidor da EstudioHK)

- A licença do n8n permite rodar fluxos de clientes no servidor da EstudioHK. **O cliente não acessa o n8n**: ele recebe só os resultados.
- **Organização:**
  - um projeto, ou pasta e etiqueta, por cliente, com o nome `CLIENTE-<nome>`, com a cópia do kit (item 4b) e a planilha Configuração dele (item 4c);
  - credenciais com o nome do cliente no começo (`Lumar · Google`, `Lumar · WhatsApp`).
- **Todo fluxo tem:**
  - **Fluxo de erro:** a peça `KIT · Alerta` (item 4b), que começa com **Error Trigger** e manda WhatsApp ou e-mail para o Henrique com o nome do fluxo, o cliente e a mensagem de erro. Em cada fluxo do cliente, ligue em *Settings › Error workflow*.
  - **Nova tentativa:** nos blocos que falam com Google ou Meta, ligar *Retry On Fail* (3 tentativas, 5 s entre elas).
  - **Plano B:** onde perder dado é grave (pedido de cliente), usar a saída de erro do bloco (*On Error › Continue using error output*) para guardar o dado em outro lugar (e-mail de reserva).
  - **Registro:** guardar data, hora e resultado do que foi enviado (planilha de controle ou coluna na própria planilha).
  - **Sem dado sensível em texto livre** nos logs e nas mensagens de alerta. Use o ID da linha, não o nome e o telefone.
- **Backup:** exportar os fluxos de cada cliente (JSON) uma vez por mês e a cada mudança. Guardar com data.
- **Saída do cliente:** entregar os JSON dos fluxos, a lista de credenciais que ele precisa recriar e uma hora de ajuda para colocar no n8n ou servidor dele.

---

## 4b. Kit de peças EstudioHK (montar uma vez, usar em todas)
Cada peça é um **subfluxo** do n8n (começa com *Execute Workflow Trigger*). As automações chamam a peça com o bloco **Execute Workflow**, mandando os dados de entrada. Monte as peças **uma vez** no servidor e, a cada cliente, duplique a pasta do kit e troque só as credenciais e o id da planilha Configuração.

**Por que:** a montagem de cada automação vira juntar peças; um ajuste numa peça (ex.: regra da Meta que mudou) vale para todas.

### `KIT · Enviar WhatsApp`
- **Entra:** `cliente`, `telefone` (só dígitos, com 55), `modelo` (nome do modelo aprovado), `variaveis` (lista), `botoes` (opcional, ids com prefixo, ver abaixo), `texto_livre` (opcional), `anexo` (opcional: link ou id de mídia), `exige_aceite` (sim/não).
- **Faz:**
  1. confere o aceite na planilha do cliente, quando `exige_aceite = sim` (sem aceite: não envia e devolve `sem_aceite`);
  2. confere a **janela de 24 h** (última mensagem recebida daquele telefone, guardada pelo `KIT · Receber`): dentro dela, pode mandar `texto_livre`; fora dela, **só o modelo aprovado**;
  3. envia pelo bloco **WhatsApp Business Cloud** (*Send Template* ou *Send*; anexo por *Media › Upload*); botões interativos que o bloco não tem, por **HTTP Request** com a mesma credencial (*Predefined Credential Type*);
  4. *Retry On Fail*: 3 tentativas, 5 s;
  5. registra na planilha de controle: data, cliente, modelo, id da mensagem, `paga` ou `gratis`, resultado.
- **Devolve:** `id_mensagem`, `resultado` (`enviado`, `sem_aceite`, `fora_da_janela`, `erro`), `paga` (sim/não).
- **Erro depois das tentativas:** chama o `KIT · Alerta` e devolve `erro`, para o fluxo decidir o plano B.

### `KIT · Receber WhatsApp`
- **É o único WhatsApp Trigger do cliente.** Cada app da Meta tem um único endereço de webhook; com o kit, várias automações do mesmo cliente dividem o mesmo número sem uma atrapalhar a outra.
- **Faz:**
  1. guarda a hora da última mensagem de cada telefone (para a janela de 24 h do `KIT · Enviar`);
  2. separa o que chegou: **resposta de botão**, **texto**, **mídia** (foto, PDF) ou **status de entrega** (`failed`, `read`…);
  3. **botão:** o id do botão começa com o nome da automação, e a peça manda para o fluxo certo:
     - `contato:<id>`, `agenda:<id>`, `atendente:`, `relatorio:`, `docs:<id>`, `cobranca:<id>`;
  4. **texto ou mídia sem botão:** vai para a automação "dona da conversa" naquele telefone (a última que mandou mensagem para ele, guardada na planilha de controle); se nenhuma, para o atendente (automação 3) ou para o aviso à equipe;
  5. **status `failed`:** devolve para a automação que enviou (pelo id da mensagem).
- **Chama** o fluxo da automação com **Execute Workflow**, passando: `telefone`, `tipo`, `acao` (o que vem depois do prefixo), `texto`, `id_midia`.

### `KIT · Alerta`
- É o fluxo de erro do item 4, padronizado: começa com **Error Trigger** e também pode ser chamado direto.
- **Entra:** `cliente`, `fluxo`, `etapa`, `id` (da linha, do evento ou da cobrança) e `erro`.
- **Faz:** manda WhatsApp ou e-mail para o Henrique. **Sem nome, telefone ou dado pessoal**: só o id.

### `KIT · Dias úteis`
- **Entra:** `data` e `dias` (número, pode ser negativo).
- **Faz:** pula sábado, domingo e as datas da aba **Feriados** da Configuração.
- **Devolve:** `data_resultado` e `hoje_e_dia_util` (sim/não).
- Usado nos lembretes das automações 2, 5 e 6 e para não mandar nada em feriado.

### `KIT · PDF de modelo`
- **Entra:** `id_modelo` (Google Docs com marcadores `{{campo}}`), `campos` (nome → valor), `pasta` (id no Drive), `nome_arquivo`.
- **Faz:** **Google Drive › Copy** do modelo → **Google Docs › Update** (substituir cada `{{campo}}`) → **Google Drive › Download** convertendo para PDF → **Upload** na pasta → apaga a cópia em Docs.
- **Devolve:** `id_pdf` e `link_pdf`.
- Usado no recibo da automação 6. Os nomes exatos das opções podem mudar entre versões do n8n: conferir na versão instalada.

---

## 4c. Planilha "Configuração" (uma por cliente)
Tudo o que é **do cliente** fica nesta planilha. Os fluxos leem a Configuração no começo (**Google Sheets › Get rows**) e não têm nome, telefone, horário ou texto escrito dentro deles.

**Por que:** adaptar uma automação a um cliente novo é **preencher a planilha**, sem mexer no n8n. Os ajustes da manutenção ("muda o horário do lembrete") também são feitos aqui.

| Aba | O que tem | Exemplo |
|---|---|---|
| **Negócio** | nome, CNPJ, endereço, telefone, horário de atendimento, fuso | `nome: FORJA Academia` · `horario: seg-sex 6h-22h` |
| **Pessoas** | quem recebe cada aviso, por função | `recepcao: 5527900000000` · `advogado_trabalhista: 55279…` |
| **Textos** | variáveis fixas dos modelos de mensagem | `assinatura: Equipe FORJA` · `rodape: FORJA · CNPJ … · endereço` |
| **Regras** | prazos e réguas de cada automação, uma linha por regra | `contato.lembrete_horas: 2` · `agenda.lembrete_hora: 18:00` · `cobranca.aviso_dias_antes: 3` |
| **Feriados** | datas sem envio | `2026-11-15` · `2026-11-20` |

- **Regras de nome:** chave `automacao.regra`, valor numa coluna só. O fluxo procura pela chave.
- **Quem edita:** a EstudioHK. O cliente pode ver, mas pede as mudanças pelo WhatsApp (o combinado do site: "você pede, eu faço").
- **Feriados:** preencher os nacionais do ano e os municipais da cidade do cliente na entrega; conferir em dezembro para o ano seguinte.

---

## 5. Testes antes de ligar

1. **Teste de mesa:** rodar cada caminho com dados falsos e o celular do Henrique como destinatário:
   - caminho feliz;
   - pessoa sem aceite;
   - número inválido;
   - planilha ou agenda fora (tirar a permissão por 1 minuto);
   - resposta fora da janela de 24 h.
2. **Teste com o cliente:** o dono testa no próprio celular, com a demo do site aberta ao lado para comparar.
3. **Rodar junto** com o jeito antigo por 3 a 7 dias. A recepção continua fazendo o processo à mão e compara com o que a automação fez.
4. Só então **desligar o processo manual**.

---

## 6. Entrega ao cliente

- Um documento de 1 página, com prints:
  - o que a automação faz;
  - o que muda para a equipe;
  - o que fazer quando receber cada aviso;
  - quem chamar se algo parecer errado.
- 30 minutos de treinamento com quem usa no dia a dia.
- Os textos dos modelos aprovados e onde ficam as planilhas.
- A estimativa de custo mensal na Meta (conta do guia) e onde ver a fatura (Billing Hub).

## 7. Manutenção mensal (o que entra)
- Olhar alertas e execuções com erro toda semana.
- Conferir uma vez por mês:
  - a qualidade do número no WhatsApp Manager;
  - a fatura da Meta;
  - se algum modelo foi recategorizado.
- Ajustes pequenos de texto e de horário.
- Exportar os fluxos (backup).
- Mudanças de processo maiores são orçadas à parte.
