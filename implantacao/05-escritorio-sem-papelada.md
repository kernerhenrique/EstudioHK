# 05 · Escritório sem papelada

**Demo:** https://estudiohk.com.br/demos/automacoes/escritorio-sem-papelada/ (Prates & Arruda Advogados)

**O que faz:**
- o cliente novo preenche o **cadastro** (link mandado depois da consulta);
- o **contrato de honorários** e a **procuração** saem preenchidos a partir dos modelos do escritório, guardados na ferramenta de assinatura, já em PDF e com o link de assinatura;
- cria a **pasta do cliente** no Drive, com número e nomes padrão;
- pede o **OK do advogado responsável** pelo WhatsApp. Nada vai para o cliente sem esse OK;
- com o OK, manda o link de **assinatura eletrônica** no WhatsApp do cliente;
- quando o cliente assina, guarda os PDFs assinados e o registro das assinaturas na pasta;
- **pede os documentos um por vez** pelo WhatsApp, salva cada foto na pasta com o nome certo e **lembra a cada 2 dias úteis**;
- depois de 2 lembretes, para de cobrar e avisa o advogado. Com tudo recebido, avisa que a pasta está completa.

**Sem IA:** o texto jurídico é sempre o do modelo do escritório. A automação só coloca os dados nos campos.

Serve também para contabilidade, imobiliária, despachante: qualquer negócio que começa com cadastro, contrato e documentos.

Leia antes o [00-base-comum.md](00-base-comum.md). Esta automação usa as peças `KIT · Enviar WhatsApp`, `KIT · Receber WhatsApp`, `KIT · Dias úteis` e `KIT · Alerta` (base, item 4b) e a planilha Configuração (base, item 4c). WhatsApp: caminho A, número novo "documentos" (base, item 3).

---

## 1. Antes da proposta: o que levantar com o escritório
- **Modelos atuais** de contrato de honorários e de procuração, **um por área** se forem diferentes.
- **Áreas** e o **advogado responsável** por cada uma (quem recebe o pedido de OK).
- **Lista de documentos por área.** Modelo da demo:

  | Área | Documentos |
  |---|---|
  | Trabalhista | RG ou CNH · comprovante de residência · carteira de trabalho (CTPS) |
  | Família | RG ou CNH · comprovante de residência · certidão de casamento ou de nascimento |
  | Empresarial | RG ou CNH do sócio · contrato social com alterações · cartão CNPJ |

- **Honorários:** como o valor entra no contrato hoje? Opções:
  1. anexo que o advogado preenche antes de aprovar (o da demo);
  2. campo no pedido de OK ("valor combinado"), que o advogado digita na resposta;
  3. tabela fixa por tipo de serviço.

  **A automação nunca inventa nem sugere valor.**
- **Poderes especiais** da procuração (receber, dar quitação, transigir…): ficam em cláusula própria, só quando o advogado marca (CPC, art. 105).
- **Tipo de assinatura** que o escritório aceita: eletrônica simples, com selfie ou documento, ou com certificado ICP-Brasil. **Quem escolhe é o escritório**, caso a caso.
- **Numeração das pastas** (ex.: `2026-014`) e onde ficam (pasta raiz no Drive).

## 2. O que o cliente precisa ter (mandar esta lista)
- [ ] **Conta Google** do escritório (Drive), com uma pasta raiz "Clientes" compartilhada só com a equipe.
- [ ] **Ferramenta de assinatura eletrônica com API** (ZapSign, Clicksign, D4Sign ou outra), na conta do escritório.
  - Na ZapSign, o plano com API é o **Equipe**. O Profissional não tem API.
  - Se o escritório já usa uma ferramenta, conferir se ela tem API, **criação de documento a partir de modelo** e webhook (aviso de "documento assinado").
- [ ] **WhatsApp oficial** (caminhos do guia base):
  - **A. número só para documentos:** simples, porque a automação só manda mensagens e recebe fotos;
  - **C. número de sempre, com parceiro de coexistência:** se o escritório quer tudo num número só.
- [ ] **Números de WhatsApp dos advogados** que aprovam (um por área).
- [ ] Os **modelos** em Word (DOCX).

Com essas respostas, preencha a **Configuração**: aba Negócio (nome, endereço), Pessoas (`advogado_trabalhista`, `advogado_familia`, `advogado_empresarial`), Regras (códigos dos modelos, `docs.lembrete_dias_uteis: 2`) e Feriados.

## 3. Montar os modelos (na ferramenta de assinatura)
Os modelos ficam **na própria ferramenta de assinatura**. Ela preenche o documento e gera o PDF e o link de assinatura numa chamada só, sem passar pelo Google Docs.

1. Passar cada modelo do escritório para **Word (DOCX)**, um por área e por documento (contrato e procuração).
2. Trocar cada dado do cliente por uma **variável**, no formato que a ferramenta pede:
   - nome, CPF, estado civil, profissão, endereço, e-mail;
   - empresa e CNPJ (só no modelo empresarial);
   - área, assunto, advogado, OAB.
3. **ZapSign:** cadastrar em **Modelos** como modelo dinâmico **DOCX**. A criação pela API não funciona com modelo em PDF ([documentação oficial](https://docs.zapsign.com.br/documentos/criar-documento-via-modelo)). Os modelos vêm no plano Equipe ("Modelos e formulários").
   - Outra ferramenta: a Clicksign também cria documento a partir de modelo pela API. Para qualquer outra, conferir na documentação dela antes da proposta.
4. Guardar o código (token) de cada modelo na aba **Regras** da Configuração: `docs.modelo_contrato_trabalhista`, `docs.modelo_procuracao_trabalhista` etc.
5. A procuração precisa ter **nome do advogado, número da OAB e endereço completo** (CPC, art. 105, § 2º). Esses dados ficam fixos no modelo de cada advogado.
6. **O texto jurídico não muda.** Qualquer ajuste de cláusula é feito pelo escritório no modelo; a automação só preenche.
7. Gerar um documento de teste por modelo e conferir com o sócio, campo por campo, **antes de ligar**.

## 4. Formulário de cadastro
- Página com o visual do escritório (no site, se for nosso, ou link próprio), ou Tally/Google Forms.
- Campos: área, nome completo, CPF, estado civil, profissão, endereço completo, assunto, e-mail, WhatsApp.
  - Empresarial: mais nome da empresa e CNPJ.
- **Validar** no próprio formulário: CPF com 11 números (e dígito verificador), CNPJ com 14, e-mail, WhatsApp com DDD.
- **Aviso e aceite (LGPD e opt-in da Meta):**
  > Autorizo o uso destes dados para preparar meu contrato e minha procuração e para receber mensagens do escritório sobre este atendimento pelo WhatsApp.
- Não pedir documento pelo formulário: os documentos vêm depois, pelo WhatsApp, um por vez.

## 5. Modelos de mensagem do WhatsApp (criar no 1º dia)
Todos na categoria **Utilidade** (a Meta confirma ao aprovar). Sem propaganda no texto.

**`docs_aprovar`** (para o advogado, com botão de resposta rápida "Aprovar e enviar"):
> Cliente novo: {{1}} · {{2}}. Contrato e procuração prontos na pasta {{3}}. Confira e aprove o envio para assinatura.

**`docs_assinar`** (para o cliente, com botão de link para a assinatura):
> Olá, {{1}}! Aqui é do escritório {{2}}. {{3}} conferiu seu contrato de honorários e sua procuração. Eles estão prontos para você assinar pelo celular.

**`docs_lista`** (para o cliente, depois da assinatura):
> Obrigado, {{1}}! Contrato e procuração assinados. Para começar, precisamos de: {{2}}. Pode mandar foto aqui mesmo, um de cada vez. Comece por: {{3}}.

**`docs_lembrete`**:
> Oi, {{1}}! Para o escritório começar, ainda falta: {{2}}. Pode mandar foto aqui mesmo, quando puder.

**`docs_aviso_equipe`** (pasta completa, cliente parado, ferramenta fora do ar):
> {{1}}

Use texto curto e fixo por tipo de aviso, se a Meta não aprovar a variável aberta.

**Dentro das 24 horas** depois que a pessoa responde (o advogado aperta o botão, o cliente manda foto), as mensagens podem ser texto livre e são grátis.

## 6. Fluxos no n8n

### Fluxo A · Cadastro → documentos → OK do advogado
1. **Webhook** (ou o gatilho do formulário) recebe o cadastro.
2. **Code:** limpar e conferir os dados (CPF, CNPJ, WhatsApp no formato +55…). Escolher pela área os modelos (aba Regras) e o advogado (aba Pessoas, `advogado_<area>`).
3. **Número do cliente:** ler o último da planilha "Clientes" (Google Sheets) e somar 1.
4. **Google Drive › Create Folder:** `{{numero}} · {{nome}} · {{area}}` dentro da pasta raiz, com a subpasta `04 Documentos do cliente`.
5. **Gerar contrato e procuração na ferramenta de assinatura** (um **HTTP Request** para cada documento). Na ZapSign: `POST https://api.zapsign.com.br/api/v1/models/create-doc/` com:
   - o código do modelo;
   - o signatário (nome, e-mail e WhatsApp do cliente);
   - a lista de variáveis com os dados do cadastro.

   A resposta traz o código do documento, o **PDF preenchido** (`original_file`) e o **link de assinatura** do cliente (`sign_url`).
   - Se a ferramenta tiver envio automático de e-mail ou WhatsApp ao signatário, **deixar desligado**: nada sai para o cliente antes do OK.
   - *Retry On Fail* ligado (3 tentativas). Se falhar mesmo assim: status `documentos em espera` na planilha, aviso ao advogado ("os dados estão salvos; nova tentativa em 15 minutos"), **KIT · Alerta**, e **nova tentativa a cada 15 min** (Fluxo D).
6. **HTTP Request** para baixar o `original_file` e **Google Drive › Upload** na pasta (`01 Contrato de honorários.pdf`, `02 Procuração.pdf`).
7. **Google Sheets › Append row** na planilha "Clientes": número, nome, área, advogado, status `aguardando OK`, link da pasta, códigos dos documentos e `sign_url`.
8. **KIT · Enviar WhatsApp:** modelo `docs_aprovar` para o advogado da área, com os links dos PDFs e o botão `docs:aprovar:<numero>`.

### Fluxo B · OK do advogado → link de assinatura
1. Chega pelo **KIT · Receber WhatsApp** (botão `docs:aprovar:<numero>`).
2. Ler o `sign_url` na planilha "Clientes".
3. **KIT · Enviar WhatsApp:** modelo `docs_assinar` para o cliente, com o link de assinatura no botão. No modelo, o botão de link tem o começo fixo (`https://app.zapsign.com.br/verificar/`) e o final variável (o código do signatário).
4. Planilha: status `aguardando assinatura`.

### Fluxo C · Assinado → pedir documentos → receber fotos
1. **Webhook** da ferramenta de assinatura (evento de documento assinado), configurado no painel dela apontando para o n8n.
2. Baixar os PDFs assinados e o registro das assinaturas e salvar na pasta (`01 Contrato de honorários (assinado).pdf`, `02 Procuração (assinada).pdf`, `03 Registro das assinaturas.pdf`).
3. Aviso ao advogado ("{{nome}} assinou") e **KIT · Enviar WhatsApp** com `docs_lista` para o cliente.
4. Planilha: status `aguardando documentos`, colunas `falta` (lista) e `lembretes` (0).
5. Foto ou PDF do cliente, que chega pelo **KIT · Receber WhatsApp** (mídia, numa conversa desta automação):
   - achar o cliente pelo número de WhatsApp na planilha;
   - **WhatsApp Business Cloud › Media › Download** do arquivo;
   - **Google Drive › Upload** na subpasta, com o nome do **primeiro documento que falta** (`04-1 RG ou CNH.jpg`);
   - tirar o item da coluna `falta`;
   - responder pelo **KIT · Enviar WhatsApp** (texto livre, dentro das 24 h): "Recebido: X. Agora mande: Y (como enviar)".
   - Arquivo ilegível ou errado: o advogado vê na pasta e pede de novo à mão. Não tentar "ler" o documento automaticamente.
6. Lista vazia: mensagem final ao cliente, aviso "pasta completa" ao advogado, status `completa`.

### Fluxo D · Lembretes (todo dia útil, 10h)
1. **Schedule Trigger:** todo dia às 10h, no fuso de Brasília. Só segue em dia útil (**KIT · Dias úteis**, que já pula os feriados da Configuração).
2. Planilha: clientes `aguardando documentos` sem arquivo novo há `docs.lembrete_dias_uteis` (aba Regras, padrão 2) dias úteis ou mais.
3. Se `lembretes` < 2: **KIT · Enviar WhatsApp** com `docs_lembrete` e somar 1.
4. No 2º lembrete: avisar também o advogado ("já foram 2 lembretes; talvez valha uma ligação") e **parar de cobrar** aquele cliente.
5. A cada 15 min (Schedule separado): tentar de novo o que ficou em `documentos em espera` (Fluxo A, passo 5 em diante).

### Dados e segurança (LGPD)
- Os arquivos ficam **no Drive do escritório**, com acesso apenas da equipe. A ferramenta de assinatura também guarda os documentos, na conta do escritório.
- No n8n, nos fluxos A a C: **não salvar os dados das execuções que deram certo** (configuração do fluxo) e apagar os arquivos temporários. Assim, CPF e documentos não ficam guardados no servidor da EstudioHK.
- A planilha "Clientes" guarda só o necessário para o controle: número, nome, área, advogado, status, faltas, lembretes e os códigos dos documentos. Não guardar CPF nem endereço.
- **KIT · Alerta**: sem dados pessoais (só número da pasta e etapa).

## 7. Testes (antes de ligar)
- [ ] Um cadastro de teste por área: conferir **campo por campo** o contrato e a procuração com o sócio.
- [ ] Nome com acento e apóstrofo, endereço longo, empresa com "&": nada quebra no documento.
- [ ] Sem o OK do advogado, nada sai para o cliente.
- [ ] Ferramenta de assinatura fora do ar (usar uma chave de API errada no teste): aviso, alerta e nova tentativa.
- [ ] Assinatura concluída: PDFs assinados e registro na pasta certa.
- [ ] Foto, PDF e arquivo grande pelo WhatsApp: todos chegam na pasta com o nome certo.
- [ ] Cliente parado: 1º lembrete em 2 dias úteis, 2º lembrete com aviso ao advogado, depois para. Testar com feriado no meio.
- [ ] As execuções que deram certo não ficam salvas no n8n.

## 8. Entregar ao cliente
- Documento de 1 página (guia base, item 6):
  - como mandar o link do cadastro depois da consulta;
  - como aprovar (o botão no WhatsApp);
  - onde fica cada pasta e o que significa cada status da planilha;
  - como pedir ajuste em modelo ou lista de documentos.
- **Na manutenção:** atualizar modelos e listas de documentos, incluir área ou advogado, conferir a qualidade do número na Meta.

## 9. Base legal (texto oficial, consultado em 5/nov/2026)
- **CPC (Lei 13.105/2015), art. 105, § 1º:** "A procuração pode ser assinada digitalmente, na forma da lei." O § 2º exige nome do advogado, número da OAB e endereço completo. [Texto atualizado na Câmara](https://www2.camara.leg.br/legin/fed/lei/2015/lei-13105-16-marco-2015-780273-normaatualizada-pl.html)
- **MP 2.200-2/2001, art. 10, § 2º:** permite outro meio de comprovar autoria e integridade de documentos eletrônicos, inclusive com certificados fora da ICP-Brasil, "desde que admitido pelas partes como válido ou aceito pela pessoa a quem for oposto o documento". [Texto na Câmara](https://www2.camara.leg.br/legin/fed/medpro/2001/medidaprovisoria-2200-2-24-agosto-2001-391394-publicacaooriginal-1-pe.html)
- Na demo e na proposta: **não prometer** que todo juízo aceita qualquer tipo de assinatura. O tipo de assinatura de cada caso é decisão do escritório.

## 10. Custos de terceiros (fontes oficiais)
- **Assinatura eletrônica (exemplo: ZapSign, plano Equipe, que tem API)**, [página oficial](https://zapsign.com.br/planos-pre%C3%A7os) consultada em 5/nov/2026:
  - mensal: R$ 69,90 (20 documentos), R$ 119,90 (80), R$ 259,90 (200);
  - anual à vista: equivale a R$ 49,90, R$ 99,90 e R$ 239,90 por mês;
  - acima de 200: Enterprise, a partir de R$ 500 por mês;
  - **cada cliente usa 2 documentos** (contrato e procuração).
- **Meta:** utilidade R$ 0,035 por mensagem (tabela BRL desde 1º/10/2026). Estimativa: **até 4 mensagens pagas por cliente** (pedido de OK, link de assinatura, lista de documentos, 1 lembrete). As respostas dentro de 24 h são grátis.
- **Google:** grátis até 15 GB na conta pessoal ([ajuda oficial](https://support.google.com/drive/answer/6374270?hl=pt-br)), ou no Workspace que o escritório já paga.
- **IA:** não usa.
- **n8n:** incluso na manutenção.
- **Exemplo, 10 clientes novos por mês:** R$ 69,90 + 10 × 4 × R$ 0,035 = **R$ 71,30 por mês**.
