#!/usr/bin/env python3
"""
JSPM — genera les imatges per compartir (Open Graph, 1200x630) de cada secció
i les icones de la web a partir de les fotos del club i l'escut.

  python3 eines/imatges_og.py      (necessita: pip install pillow fonttools brotli)
"""
import json, os, io
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fontTools.ttLib import TTFont

ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *x: os.path.join(ARREL, *x)
FOTO = {"inici":"img/portada/banner-1.webp","club":"img/galeria/club-2.webp","equips":"img/galeria/equips-2.webp",
        "partits":"img/galeria/ascens-2025.webp","que-fem":"img/galeria/que-fem-2.webp","galeria":"img/galeria/final-temporada-2526-4.webp",
        "patrocinadors":"img/galeria/final-temporada-2526-3.webp","botiga":"img/galeria/samarreta-3.webp",
        "inscripcions":"img/galeria/partit-2.webp","contacte":"img/galeria/partit-1.webp"}
TITOL = {"inici":"Som Sant Pere","club":"El club","equips":"Els nostres equips","partits":"Partits i resultats","que-fem":"Què fem",
         "galeria":"Galeria","patrocinadors":"Patrocinadors","botiga":"Botiga oficial","inscripcions":"Vull jugar al JSPM","contacte":"Contacte"}

def font(nom, mida):
    f = TTFont(P("fonts", nom)); buf = io.BytesIO(); f.flavor = None; f.save(buf); buf.seek(0)
    return ImageFont.truetype(buf, mida)

def cobreix(im, w, h):
    r = max(w/im.width, h/im.height); im = im.resize((round(im.width*r), round(im.height*r)), Image.LANCZOS)
    x = (im.width-w)//2; y = int((im.height-h)*0.4); return im.crop((x, y, x+w, y+h))

def main():
    os.makedirs(P("img/og"), exist_ok=True)
    escut = Image.open(P("img/club/escut.webp")).convert("RGBA")
    f_titol = font("barlow-condensed-latin-800-italic.woff2", 104)
    f_nom = font("barlow-condensed-latin-700-normal.woff2", 34)
    for ruta, foto in FOTO.items():
        W, H = 1200, 630
        base = cobreix(Image.open(P(foto)).convert("RGB"), W, H)
        capa = Image.new("RGBA", (W, H))
        d = ImageDraw.Draw(capa)
        for x in range(W):  # degradat blau d'esquerra a dreta
            a = int(235 - 175 * (x / W)); d.line([(x, 0), (x, H)], fill=(10, 30, 70, a))
        im = Image.alpha_composite(base.convert("RGBA"), capa)
        d = ImageDraw.Draw(im)
        for x in range(0, W, 36):  # franja de ratlles blau i blanc
            d.rectangle([x, H-16, x+17, H], fill=(255, 255, 255, 255)); d.rectangle([x+18, H-16, x+35, H], fill=(23, 66, 138, 255))
        e = escut.resize((150, 150), Image.LANCZOS); im.alpha_composite(e, (70, 70))
        d.text((240, 112), "JOVENTUT SANT PERE MÀRTIR · OLOT", font=f_nom, fill=(220, 230, 248, 255))
        t = TITOL[ruta].upper(); y = 330
        # banda blanca inclinada amb el títol, com a la portada
        bb = d.textbbox((0, 0), t, font=f_titol); tw = bb[2]-bb[0]
        banda = Image.new("RGBA", (tw+90, 150), (0, 0, 0, 0)); db = ImageDraw.Draw(banda)
        db.polygon([(18, 0), (tw+90, 0), (tw+72, 150), (0, 150)], fill=(255, 255, 255, 255))
        db.text((45, 8), t, font=f_titol, fill=(23, 66, 138, 255))
        im.alpha_composite(banda, (64, y))
        im.convert("RGB").save(P("img/og", ruta + ".jpg"), "JPEG", quality=84, optimize=True, progressive=True)
    # icones
    for mida, nom in [(180, "apple-touch-icon.png"), (192, "icona-192.png"), (512, "icona-512.png")]:
        fons = Image.new("RGBA", (mida, mida), (255, 255, 255, 255))
        e = escut.resize((int(mida*0.86), int(mida*0.86)), Image.LANCZOS)
        fons.alpha_composite(e, ((mida-e.width)//2, (mida-e.height)//2)); fons.convert("RGB").save(P("img", nom), "PNG", optimize=True)
    print("Imatges OG i icones generades")

if __name__ == "__main__":
    main()
