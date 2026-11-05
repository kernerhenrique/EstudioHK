# Guias de implantação das automações (EstudioHK)

Passo a passo para montar, **num cliente de verdade**, cada automação que aparece em
[estudiohk.com.br/automacoes](https://estudiohk.com.br/automacoes/).
A demo do site mostra *o que* acontece; o guia mostra *como* montar, testar e entregar.

Esta pasta **não vai para o ar** (está no `.vercelignore`).

## Como usar

1. Leia o **[00-base-comum.md](00-base-comum.md)** antes de qualquer cliente. Ele cobre o que se
   repete em todas as automações:
   - mapeamento e proposta;
   - contas do cliente e WhatsApp oficial;
   - modelos de mensagem;
   - n8n, testes, entrega, manutenção e saída do cliente.
2. Abra o guia da automação vendida e siga na ordem. Cada guia tem:
   - o que o cliente precisa ter (checklist para mandar a ele);
   - a estrutura dos dados (planilha, agenda);
   - os modelos de mensagem para aprovar na Meta;
   - os fluxos do n8n, bloco por bloco;
   - os testes antes de ligar;
   - o que entregar ao cliente;
   - os custos de terceiros.
3. Adapte nomes, horários e textos ao negócio do cliente. O desenho do fluxo é o mesmo.

## Guias

| Nº | Automação | Demo | Guia |
|---|---|---|---|
| 1 | Contato que não esfria | [demo](https://estudiohk.com.br/demos/automacoes/contato-que-nao-esfria/) | [01-contato-que-nao-esfria.md](01-contato-que-nao-esfria.md) |
| 2 | Agenda sem faltas | [demo](https://estudiohk.com.br/demos/automacoes/agenda-sem-faltas/) | [02-agenda-sem-faltas.md](02-agenda-sem-faltas.md) |
| 3 | Atendente com IA no WhatsApp | [demo](https://estudiohk.com.br/demos/automacoes/atendente-whatsapp/) | [03-atendente-whatsapp-ia.md](03-atendente-whatsapp-ia.md) |

## Regra
**Toda automação nova que entrar no site ganha o seu guia aqui, no mesmo dia.**
- O guia segue o modelo dos que já existem.
- O guia entra na tabela acima.
- Valores e regras de terceiros (Meta, Google, n8n) só entram com fonte oficial e data da consulta.

## Fontes oficiais usadas (consultadas em 4 e 5/nov/2026)
- **Preços do WhatsApp:**
  - [página oficial da Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing);
  - tabela em BRL vigente desde 1º/10/2026: utilidade e atendimento R$ 0,035; marketing R$ 0,3217; 1.000 mensagens de atendimento grátis por mês por número.
- [Categorias de modelo (utilidade × marketing)](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization)
- [Permissão do cliente (opt-in)](https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in)
- [Usar um número que já está no WhatsApp](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/migrate-existing-whatsapp-number-to-a-business-account)
- [Registrar o número na Cloud API](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration)
- [Coexistência com o app WhatsApp Business](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users)
- [Virar Tech Provider](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/get-started-for-tech-providers)
- [Licença do n8n para consultores](https://docs.n8n.io/n8n-community-license/community-license/license-faq)
- **Blocos do n8n:**
  - [WhatsApp Business Cloud](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.whatsapp/);
  - [WhatsApp Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.whatsapptrigger/);
  - [fluxo de erro](https://docs.n8n.io/flow-logic/error-handling/).
- [Limite de envio do Gmail](https://support.google.com/mail/answer/22839?hl=pt-BR)
- [Termos da Meta para a WhatsApp Business Platform](https://www.whatsapp.com/legal/business-solution-terms): cláusula 4.7, "AI Providers".
- [Política de mensagens do WhatsApp Business](https://business.whatsapp.com/policy): automação com escalonamento para uma pessoa, opt-in e penalidades.
- [Meta Business Agent e preços de atendimento](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages)
- [Preços da API do Claude (Anthropic)](https://platform.claude.com/docs/en/about-claude/pricing): Haiku 5.5 a US$ 0,10 / US$ 0,50 e Sonnet 5.5 a US$ 2 / US$ 10 por milhão de tokens.
- [LGPD, texto oficial na Câmara](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html)

Preços e regras mudam. Antes de cada proposta, confira de novo as páginas acima.
