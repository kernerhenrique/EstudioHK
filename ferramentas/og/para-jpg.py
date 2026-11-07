"""Converte a captura bruta (og-raw.png) na imagem de compartilhamento: 1200 × 630, JPEG.
Uso: python3 para-jpg.py ../.saida/auto-og-raw.png ../../demos/automacoes/contato-que-nao-esfria/assets/og.jpg"""
import sys
from PIL import Image
ent, sai = sys.argv[1], sys.argv[2]
im = Image.open(ent).convert('RGB')
w, h = im.size; alvo = 1200 / 630
if w / h > alvo: nw = round(h * alvo); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
else: nh = round(w / alvo); im = im.crop((0, 0, w, nh))
im.resize((1200, 630), Image.LANCZOS).save(sai, 'JPEG', quality=85, optimize=True, progressive=True)
print('ok', sai)
