"""Gera /sites/, /automacoes/ e /sistemas/ a partir da home (cabeçalho, ícones, orçamento, rodapé e Ctrl+K vêm do index.html).
Uso: python3 hk_paginas.py   (rodar de novo sempre que mudar o cabeçalho/rodapé da home ou o conteúdo abaixo)"""
import pathlib, re
R = pathlib.Path(__file__).resolve().parents[2]; T = pathlib.Path(__file__).resolve().parent / 'modelos'
home = (R / 'index.html').read_text()
def entre(a, b, inclui_b=False):
    i = home.index(a); j = home.index(b, i)
    return home[i:j + (len(b) if inclui_b else 0)]
HEAD = entre('<link rel="icon"', '</head>')                    # favicon, fontes, css, js
TOPO = entre('<a class="skip"', '<main id="conteudo">')        # pular, ícones, barra, cabeçalho
ORC = entre('  <!-- BRIEFING -->', '</main>')                   # pedir orçamento
FIM = entre('</main>', '</html>', True)                         # rodapé, botão fixo, Ctrl+K
PROC = entre('  <!-- PROCESSO -->', '  <!-- DIFERENCIAIS -->')
SVC_SITES = (T / 'svc_sites.html').read_text()   # cards de site e landing page (guardados ao virar carrossel na home)
DEMO_FLUXO = entre('      <div class="demo" id="demo"', '    </div>\n  </section>')
CD = (T / 'calc_demos.html').read_text()
CALC = CD[CD.index('  <!-- CALCULADORA -->'):CD.index('  <!-- DEMONSTRAÇÕES -->')]
DEMOS_SITES = CD[CD.index('  <!-- DEMONSTRAÇÕES -->'):]
# em /automacoes/ a calculadora vem antes das demos e ganha um botão para elas
_cta = CALC[CALC.index('          <a class="btn btn-volt" href="#contato" id="calc-cta">'):]
_cta = _cta[:_cta.index('</a>') + 4]
CALC_AUTO = CALC.replace(_cta, '          <div class="calc-acoes">\n  ' + _cta + '\n            <a class="btn btn-ghost-dark" href="#demos">Ver automações funcionando</a>\n          </div>')

def pagina(slug, titulo, desc, og_titulo, og_desc, corpo):
    url = f'https://estudiohk.com.br/{slug}/'
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{titulo}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0B1222">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="EstudioHK">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{og_titulo}">
<meta property="og:description" content="{og_desc}">
<meta property="og:image" content="https://estudiohk.com.br/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="EstudioHK: sites, sistemas e automações que trabalham por você.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{og_titulo}">
<meta name="twitter:description" content="{og_desc}">
<meta name="twitter:image" content="https://estudiohk.com.br/og-image.png">
{HEAD}</head>
<body data-pagina="{slug}">
{TOPO}<main id="conteudo">
{corpo}
{ORC}{FIM}
'''

def le(nome):
    s = (T / nome).read_text()
    return (s.replace('{{SVC_SITES}}', SVC_SITES)
             .replace('{{DEMOS_SITES}}', DEMOS_SITES).replace('{{CALC}}', CALC_AUTO)
             .replace('{{PROC}}', PROC).replace('{{DEMO_FLUXO}}', DEMO_FLUXO))

(R / 'sites').mkdir(exist_ok=True); (R / 'automacoes').mkdir(exist_ok=True); (R / 'sistemas').mkdir(exist_ok=True)
(R / 'sites/index.html').write_text(pagina('sites',
    'Sites e landing pages · EstudioHK',
    'Sites institucionais e landing pages sob medida: rápidos no celular, prontos para o Google e feitos para trazer contato. Veja 6 demonstrações.',
    'Sites e landing pages · EstudioHK', 'Site que passa confiança e landing page que traz contato. Veja 6 demonstrações navegáveis.',
    le('sites.main.html')))
(R / 'automacoes/index.html').write_text(pagina('automacoes',
    'Automações para pequenos negócios · EstudioHK',
    'Automações que conectam site, WhatsApp oficial, planilhas e e-mail. Veja demonstrações funcionando e saiba antes quais ferramentas usa e quanto custa cada uma.',
    'Automações · EstudioHK', 'O site, o WhatsApp, as planilhas e o e-mail conversando sozinhos. Com cada ferramenta e cada custo mostrados antes.',
    le('automacoes.main.html')))
(R / 'sistemas/index.html').write_text(pagina('sistemas',
    'Sistemas sob medida · EstudioHK',
    'Sistemas sob medida para pedidos, orçamentos, alunos e estoque: funcionam no celular, sem instalar, e o seu cliente participa do outro lado. Simule as funcionalidades de 4 tipos de negócio.',
    'Sistemas sob medida · EstudioHK', 'Seu negócio organizado e seu cliente encantado. Toque num botão e veja os dois lados funcionando.',
    le('sistemas.main.html')))
print('ok')
