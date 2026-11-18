#!/usr/bin/env python3
"""Retalls verticals de les fotos de la portada per a mòbils (img/mobil/...).
En un mòbil la portada només ensenya una franja vertical de cada foto apaïsada; servir-ne
només aquesta franja manté la mateixa nitidesa i pesa unes 6 vegades menys (LCP més ràpid).
Ús: python3 eines/imatges_mobil.py   (cal Pillow). Torna-ho a executar si canvies les fotos de la portada."""
import os, re
from PIL import Image
ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ARREL, "src/pagines/inici.html"), encoding="utf-8").read()
for m in re.finditer(r'<img class="hero-foto[^"]*" (?:data-)?src="img/([^"]+)\.webp"[^>]*--pos:([0-9a-z%]+)', html):
    ruta, posx = m.group(1), m.group(2)
    fx = 0.5 if posx in ("center", "") else float(posx.rstrip("%")) / 100
    im = Image.open(os.path.join(ARREL, "img", ruta + ".webp")).convert("RGB")
    W, H = im.size
    if H > 1100: im = im.resize((round(W * 1100 / H), 1100), Image.LANCZOS); W, H = im.size
    w = min(W, round(H * 0.8))                       # proporció 4:5 o més estreta
    x = round(max(0, min(W - w, fx * W - w / 2)))
    sortida = os.path.join(ARREL, "img/mobil", ruta + ".webp")
    os.makedirs(os.path.dirname(sortida), exist_ok=True)
    im.crop((x, 0, x + w, H)).save(sortida, "WEBP", quality=74, method=6)
    print("%-45s %4dx%-4d %6.1f KB" % (sortida.replace(ARREL + "/", ""), w, H, os.path.getsize(sortida) / 1024))
