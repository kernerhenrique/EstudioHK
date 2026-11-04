#!/usr/bin/env python3
"""Transforma uma foto (do cliente ou da internet) num desenho em linhas, para o efeito
"do esboço à foto" do kit de animações da EstudioHK.

Uso:
    python3 esboco.py FOTO.jpg PASTA_SAIDA NOME [--larguras 600,1000] [--tinta 1A1B19] [--papel F7F6F2]
                      [--detalhe 1.0] [--proporcao 4:3] [--y 0.5]

Gera, para cada largura:
    NOME-<largura>.webp          a foto (recortada na proporção pedida)
    NOME-esboco-<largura>.webp   a mesma imagem como desenho de linhas, nas cores da marca

Dicas:
- --detalhe maior (1.4) traz mais linhas; menor (0.7) deixa o desenho mais limpo.
- Fotos com bom contraste e linhas retas (fachadas, interiores, produtos) dão o melhor resultado.
- Confira sempre o resultado: marcas d'água ou textos na foto também viram linhas. Recorte antes.
"""
import argparse
import os
from PIL import Image, ImageChops, ImageFilter, ImageOps


def cor(hexa):
    hexa = hexa.lstrip('#')
    return tuple(int(hexa[i:i + 2], 16) for i in (0, 2, 4))


def recorta(im, proporcao, yc):
    if not proporcao:
        return im
    a, b = (float(x) for x in proporcao.split(':'))
    r = a / b
    w, h = im.size
    th = int(w / r)
    if th <= h:
        top = int((h - th) * yc)
        return im.crop((0, top, w, top + th))
    tw = int(h * r)
    left = (w - tw) // 2
    return im.crop((left, 0, left + tw, h))


def esboco(im, tinta, papel, detalhe):
    g = ImageOps.grayscale(im).filter(ImageFilter.MedianFilter(3))  # tira granulado e textura fina
    # diferença de dois desfoques: realça contornos e ignora texturas finas
    fino = g.filter(ImageFilter.GaussianBlur(0.8))
    largo = g.filter(ImageFilter.GaussianBlur(2.6))
    bordas = ImageChops.difference(fino, largo)
    bordas = ImageOps.autocontrast(bordas, cutoff=1)
    limite = int(60 / max(detalhe, .1))
    linhas = bordas.point(lambda v: 255 if v > limite else int(v * 255 / max(limite, 1) * .15))
    linhas = linhas.filter(ImageFilter.GaussianBlur(0.4))
    return ImageOps.colorize(ImageOps.invert(linhas), black=tinta, white=papel)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('foto')
    ap.add_argument('saida')
    ap.add_argument('nome')
    ap.add_argument('--larguras', default='600,1000')
    ap.add_argument('--tinta', default='1A1B19')
    ap.add_argument('--papel', default='F7F6F2')
    ap.add_argument('--detalhe', type=float, default=1.0)
    ap.add_argument('--proporcao', default='')
    ap.add_argument('--y', type=float, default=.5, help='posição vertical do recorte (0 = topo, 1 = base)')
    a = ap.parse_args()

    os.makedirs(a.saida, exist_ok=True)
    im = recorta(Image.open(a.foto).convert('RGB'), a.proporcao, a.y)
    desenho = esboco(im, cor(a.tinta), cor(a.papel), a.detalhe)
    for lw in (int(x) for x in a.larguras.split(',')):
        lw = min(lw, im.width)
        alt = round(im.height * lw / im.width)
        im.resize((lw, alt), Image.LANCZOS).save(os.path.join(a.saida, f'{a.nome}-{lw}.webp'), quality=80, method=6)
        desenho.resize((lw, alt), Image.LANCZOS).save(os.path.join(a.saida, f'{a.nome}-esboco-{lw}.webp'), quality=82, method=6)
        print('ok', f'{a.nome}-{lw}.webp', f'{a.nome}-esboco-{lw}.webp', f'{lw}x{alt}')


if __name__ == '__main__':
    main()
