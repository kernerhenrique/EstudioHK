# 04 · Relatório da semana

**Demo:** https://estudiohk.com.br/demos/automacoes/relatorio-semanal/ (FORJA Academia)

**O que faz:**
- toda segunda às 8h, lê os dados da semana anterior, confere se está tudo lá, calcula e compara com a semana passada;
- manda um **resumo curto no WhatsApp** do dono e o **relatório completo por e-mail**, com gráficos, destaques e listas;
- guarda uma linha no histórico.

**Se faltar dado:** não inventa número. Marca "sem dados" e avisa a EstudioHK.

**Sem IA:** números do sistema e regras fixas. Serve para academia, clínica, escola, loja, restaurante.

Leia antes o [00-base-comum.md](00-base-comum.md). Esta automação usa as peças `KIT · Enviar WhatsApp` e `KIT · Alerta` (base, item 4b) e a planilha Configuração (base, item 4c). WhatsApp (opcional): caminho A, número novo (base, item 3).

---

## 1. Antes da proposta: os números que importam
Escolha com o dono **no máximo 5 números** e **3 regras de destaque**. Relatório com 20 números não é lido.

Modelo para academia (o da demo):
| Número | De onde vem | Como calcular |
|---|---|---|
| Alunos ativos | cadastro | contrato ativo no último dia da semana |
| Novas matrículas | cadastro | data de início dentro da semana |
| Cancelamentos (e motivo) | cadastro | data de cancelamento dentro da semana |
| Check-ins por dia | catraca | registros de entrada por dia |
| Ocupação das aulas | reservas | reservas ÷ vagas, média da semana, por aula |
| Em atraso | financeiro | mensalidade vencida e não paga (quantidade e valor) |
| Sem treinar há 14+ dias | catraca + cadastro | ativos sem check-in nos últimos 14 dias |

**Regras de destaque** (exemplos, ajustar com o dono):
- aula acima de 90% por 3 semanas seguidas: "vale pensar em mais uma turma";
- a aula com a menor ocupação;
- motivo de cancelamento que subiu em relação à semana anterior.

## 2. O que o cliente precisa ter (mandar esta lista)
- [ ] **Acesso aos dados**, por ordem de preferência:
  1. API do sistema (pedir a documentação);
  2. exportação automática que o sistema já faça (por e-mail ou pasta);
  3. planilhas que a equipe já preenche.

  Conferir **antes da proposta**: sem acesso aos dados, não há relatório.
- [ ] Conta Google do negócio (Gmail para enviar, Planilhas para o histórico).
- [ ] **Quem recebe** (e-mail e, se quiser, WhatsApp) e em que dia e hora.
- [ ] **Opcional:** WhatsApp oficial (caminhos do guia base). Como a mensagem vai só para o dono e a equipe, pode ser um **número novo só para isso** (caminho A).
- [ ] Os relatórios ou contas que o dono já faz hoje (para comparar no teste).

Com essas respostas, preencha a **Configuração**: aba Negócio (nome), Pessoas (`relatorio_email`, `relatorio_whatsapp`) e Regras (`relatorio.dia_hora: seg 08:00`).

## 3. Modelo de mensagem do WhatsApp (criar no 1º dia)
**`resumo_semanal`** (pedir categoria Utilidade):
> Resumo da semana {{1}}: {{2}} alunos ativos ({{3}}), {{4}} novos, {{5}} cancelamentos, {{6}} check-ins ({{7}}). Aulas mais cheias: {{8}}. Em atraso: {{9}} alunos. Relatório completo no seu e-mail.

- A Meta decide a categoria pelo conteúdo. Se não aceitar como utilidade, **o resumo vai só por e-mail** e o custo de terceiros fica zero.
- Sem oferta nem propaganda no texto.

## 4. A planilha calcula, o n8n entrega
**Ideia:** o n8n só **copia os dados crus** da semana para a planilha. As **fórmulas** fazem as contas. O n8n **lê o resumo pronto** e envia num e-mail-modelo fixo.

**Por que:** mudar um número do relatório é mudar uma fórmula, não o fluxo. E o dono pode abrir a planilha e ver de onde vem cada conta.

### Planilha "Relatório <negócio>" (Google Planilhas)
| Aba | Quem escreve | O que tem |
|---|---|---|
| **Dados** | o n8n (toda segunda, apaga e cola de novo) | os dados crus da semana, uma linha por registro: `fonte`, `data`, `aluno_id`, `tipo` (check-in, matrícula, cancelamento, reserva, pagamento), `valor`, `aula`, `vagas`, `motivo` |
| **Resumo** | **fórmulas** | uma linha por número do relatório: `numero`, `valor`, `semana_passada`, `variacao`, `texto` |
| **Dias** | **fórmulas** | os 7 dias da semana com o total de cada um e a coluna `sem_dados` |
| **Aulas** | **fórmulas** | ocupação média por aula |
| **Destaques** | **fórmulas** | as regras de destaque, uma por linha, com a coluna `aparece` (sim/não) e o texto pronto |
| **Histórico** | o n8n (Append, 1 linha por semana) | `semana`, `ativos`, `novos`, `cancelamentos`, `checkins`, `faltou_dado` |

**Fórmulas de exemplo** (Google Planilhas; ajustar os nomes das colunas ao cliente):
- check-ins de um dia: `=CONT.SES(Dados!D:D;"checkin";Dados!B:B;A2)`;
- dia sem dados: `=SE(CONT.SES(Dados!A:A;"catraca";Dados!B:B;A2)=0;"sem dados";"")`. **Nunca transformar dia vazio em zero**;
- variação: `=SE(OU(B2="";C2="");"";(B2-C2)/C2)`, com C vindo da última linha do Histórico (`=ÍNDICE(Histórico!E:E;CONT.VALORES(Histórico!E:E))`);
- ocupação de uma aula: `=SOMA.SE(Dados!F:F;A2;Dados!E:E)/SOMA.SE(Dados!F:F;A2;Dados!G:G)`;
- destaque "aula acima de 90%": `=SE(B2>0,9;"sim";"não")` e o texto em outra coluna.

Monte as fórmulas **uma vez** numa planilha-modelo; para um cliente novo, copie a planilha e ajuste só as colunas de origem.

### Fluxo A · Segunda, 8h
1. **Schedule Trigger:** no dia e hora de `relatorio.dia_hora` (aba Regras da Configuração), no fuso de Brasília.
2. **Período:** de segunda a domingo da semana anterior.
3. **Ler os dados**, um bloco por fonte (API do sistema por **HTTP Request**, **Google Sheets › Get rows** ou o arquivo da exportação), com *Retry On Fail*.
   - Fonte que não respondeu: seguir com as outras e anotar qual faltou.
4. **Google Sheets:** limpar a aba **Dados** e colar tudo (*Clear* + *Append*).
5. **Esperar 10 segundos** (bloco *Wait*) para as fórmulas recalcularem.
6. **Google Sheets › Get rows** das abas Resumo, Dias, Aulas e Destaques.
7. **Montar o e-mail:** um **modelo HTML fixo** (o mesmo para todos os clientes), preenchido com os valores lidos:
   - cabeçalho, 4 números com a variação;
   - check-ins por dia e ocupação das aulas como **barras feitas com tabela HTML** (largura em %);
   - destaques (só os que têm `aparece = sim`);
   - aviso de dado faltando, se algum dia tiver `sem dados`;
   - as listas de atrasados e de quem sumiu **em anexo** (CSV), não no corpo.
8. **Enviar:**
   - **Gmail › Send** (com os anexos);
   - **KIT · Enviar WhatsApp** com o modelo `resumo_semanal` para cada pessoa da aba Pessoas (`relatorio_whatsapp`), se houver.
9. **Histórico:** **Google Sheets › Append row** com os números do Resumo.
10. **Faltou dado ou alguma fonte falhou:** **KIT · Alerta**, dizendo qual fonte e qual dia.

### Regras dos gráficos no e-mail
Muitos programas de e-mail não executam JavaScript e cortam SVG. Por isso, barras em tabela HTML (ou imagens PNG). Regras:
- uma cor só por gráfico;
- rótulo só no maior e no menor valor;
- os números completos numa tabela logo abaixo;
- nada de dois eixos no mesmo gráfico.

## 5. Testes (antes de ligar)
- [ ] **Rodar 2 semanas junto** com a conta que o dono já faz: cada número tem que bater. Diferença = regra de cálculo errada ou dado diferente; corrigir antes de seguir.
- [ ] Semana com um dia sem dado: o relatório marca "sem dados", não compara aquele total e alerta a EstudioHK.
- [ ] Fonte fora do ar: o relatório sai com o que tem, marcado, e o alerta é enviado.
- [ ] Semana com feriado: os números caem, mas a conferência não pode tratar isso como erro (deixar o feriado como exceção).
- [ ] O e-mail abre bem no Gmail do celular e do computador.
- [ ] O WhatsApp chega às 8h, no fuso certo.

## 6. Entregar ao cliente
- Documento de 1 página (guia base, item 6):
  - o que cada número quer dizer;
  - de onde vem;
  - o que fazer com cada destaque;
  - o que significa o aviso de "sem dados".
- Onde fica o histórico, que é dele, no Google Planilhas.
- **Na manutenção:** ajustar regras de destaque e incluir ou trocar números, até 5. Quase sempre é mudar uma fórmula na planilha, sem mexer no n8n.

## 7. Custos de terceiros (fontes oficiais, 4/nov/2026)
- **Meta (opcional):** 1 mensagem de utilidade por pessoa por semana = R$ 0,035 × 4,3 semanas ≈ **R$ 0,15 por pessoa por mês**.
- **Google:** grátis na conta gratuita (o Gmail envia até 500 e-mails por dia).
- **IA:** não usa.
- **n8n:** incluso na manutenção.
- **Só por e-mail:** custo de terceiros R$ 0.
