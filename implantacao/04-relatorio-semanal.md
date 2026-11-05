# 04 · Relatório da semana

**Demo:** https://estudiohk.com.br/demos/automacoes/relatorio-semanal/ (FORJA Academia)

**O que faz:**
- toda segunda às 8h, lê os dados da semana anterior, confere se está tudo lá, calcula e compara com a semana passada;
- manda um **resumo curto no WhatsApp** do dono e o **relatório completo por e-mail**, com gráficos, destaques e listas;
- guarda uma linha no histórico.

**Se faltar dado:** não inventa número. Marca "sem dados" e avisa a EstudioHK.

**Sem IA:** números do sistema e regras fixas. Serve para academia, clínica, escola, loja, restaurante.

Leia antes o [00-base-comum.md](00-base-comum.md).

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

## 3. Modelo de mensagem do WhatsApp (criar no 1º dia)
**`resumo_semanal`** (pedir categoria Utilidade):
> Resumo da semana {{1}}: {{2}} alunos ativos ({{3}}), {{4}} novos, {{5}} cancelamentos, {{6}} check-ins ({{7}}). Aulas mais cheias: {{8}}. Em atraso: {{9}} alunos. Relatório completo no seu e-mail.

- A Meta decide a categoria pelo conteúdo. Se não aceitar como utilidade, **o resumo vai só por e-mail** e o custo de terceiros fica zero.
- Sem oferta nem propaganda no texto.

## 4. Fluxos no n8n

### Fluxo A · Segunda, 8h
1. **Schedule Trigger:** segunda às 8h, no fuso de Brasília.
2. **Período:** de segunda a domingo da semana anterior (Code, com datas no fuso certo).
3. **Ler os dados:**
   - HTTP Request para a API do sistema, ou Google Sheets › Get rows, ou o arquivo da exportação;
   - um bloco por fonte (cadastro, catraca, reservas, financeiro);
   - *Retry On Fail* ligado.
4. **Conferir (Code), antes de calcular:**
   - todos os dias do período têm registro? Os dias sem dado viram `null`, **nunca zero**;
   - algum número está fora do normal (exemplo: check-ins 50% abaixo da média das 4 semanas)? Marcar para conferência;
   - alguma fonte não respondeu? Seguir com as outras e marcar o que faltou.
5. **Calcular (Code):**
   - os números do item 1;
   - a variação contra a última linha do **Histórico**;
   - as regras de destaque.
6. **Montar:**
   - o **e-mail em HTML**: cabeçalho, 4 números com a variação, gráfico de check-ins por dia, ocupação das aulas, destaques, aviso de dado faltando se houver, e as listas de atrasados e de quem sumiu **em anexo** (CSV), não no corpo;
   - as variáveis do modelo `resumo_semanal`.
7. **Enviar:**
   - **Gmail › Send** (com os anexos);
   - **WhatsApp Business Cloud › Send Template** `resumo_semanal`, para cada pessoa que recebe.
8. **Histórico:** Google Sheets › Append row (`semana`, `ativos`, `novos`, `cancelamentos`, `checkins`, `faltou_dado`).
9. **Faltou dado ou algum bloco falhou:** alerta para a EstudioHK (fluxo de erro do guia base) dizendo qual fonte e qual dia.

### Gráficos no e-mail
Muitos programas de e-mail não executam JavaScript e cortam SVG. Use:
- **barras feitas com tabelas HTML** (largura em %), ou
- **imagens PNG** geradas no n8n.

**Regras:**
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
- **Na manutenção:** ajustar regras de destaque e incluir ou trocar números, até 5.

## 7. Custos de terceiros (fontes oficiais, 4/nov/2026)
- **Meta (opcional):** 1 mensagem de utilidade por pessoa por semana = R$ 0,035 × 4,3 semanas ≈ **R$ 0,15 por pessoa por mês**.
- **Google:** grátis na conta gratuita (o Gmail envia até 500 e-mails por dia).
- **IA:** não usa.
- **n8n:** incluso na manutenção.
- **Só por e-mail:** custo de terceiros R$ 0.
