#!/usr/bin/env python3
"""
Actualitza partits.js amb el calendari i els resultats de la FCF (fcf.cat).

Pensat per executar-se sol a GitHub Actions (.github/workflows/actualitza-web.yml), sense
dependre de cap ordinador. També es pot executar a mà:  python3 eines/partits_fcf.py

- La llista d'equips (codi FCF, nom, categoria, bloc) es llegeix del mateix partits.js:
  si la temporada vinent canvien els equips, editeu-la allà (vegeu docs/ACTIVAR-GITHUB.md).
- Si la FCF no respon o canvia la pàgina, el script SURT AMB ERROR i NO toca partits.js
  (GitHub envia un correu i la web avisa als 10 dies que les dades són antigues).
- Descarrega els escuts nous a img/escuts/ (si falla, la web els carrega de la FCF).

Opcions:  --si-no-avui     no fa res si partits.js ja és d'avui (per als reintents)
          --accepta-menys  accepta que hi hagi molts menys partits que abans (canvi de temporada)
Requereix: beautifulsoup4 (i Pillow per als escuts nous).
Proves: FCF_BASE=http://localhost:8000 per llegir pàgines desades.
"""
import datetime, io, json, os, re, sys, time, urllib.request
from zoneinfo import ZoneInfo
from bs4 import BeautifulSoup

ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FITXER = os.path.join(ARREL, "partits.js")
BASE = os.environ.get("FCF_BASE", "https://www.fcf.cat").rstrip("/")
CLUB = "joventut-sant-pere-martir"
ESCUTS_URL = "https://files.fcf.cat/escudos/clubes/escudos/"
UA = "Mozilla/5.0 (compatible; JSPM-web/1.0; +https://www.jspm.es)"
CAP = ("/* =====================================================================\n"
       "   PARTITS JSPM — dades del calendari de tots els equips federats\n"
       "   Font: Federació Catalana de Futbol (fcf.cat), club 5076\n"
       "   Generat automàticament (eines/partits_fcf.py). Cada partit és:\n"
       "   [jornada, \"rival\", casa(1)/fora(0), \"resultat local-visitant\", \"AAAA-MM-DD\", \"hora\", \"partit a la FCF\", escut]\n"
       "   ===================================================================== */\n")

def llegeix_actual():
    s = open(FITXER, encoding="utf-8").read()
    return json.loads(s[s.index("{", s.index("window.JSPM_PARTITS")):s.rindex("}") + 1])

def baixa(url, intents=3):
    for i in range(intents):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ca,es;q=0.8"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception as e:
            if i == intents - 1: raise
            time.sleep(5 * (i + 1))

def iso(d):
    if not d: return ""
    a, b, c = d.split("/")
    return "20" + c + "-" + b + "-" + a

def es_nostre(nom):
    return re.match(r"^JOVENTUT SANT PERE MARTIR", nom or "") is not None

def analitza(html):
    """Retorna (g, grup, files) d'una pàgina de categoria del club."""
    sopa = BeautifulSoup(html, "html.parser")
    comp = next((a for a in sopa.find_all("a") if "VEURE TOTS ELS PARTITS" in a.get_text()), None)
    href = comp.get("href", "") if comp else ""
    m = re.search(r"/competicio/([^/]+)/([^/]+)/([^/]+)", href)
    g = "/".join(m.groups()) if m else ""
    grup = m.group(3).replace("-", " ").capitalize() if m else ""
    files = []
    for fila in sopa.find_all("div", class_=lambda c: c and "grid-cols-[28px_minmax" in c):
        noms = [s.get("title", "") for s in fila.find_all("span", title=True)]
        imgs = [i.get("src", "") for i in fila.find_all("img")]
        jsp = next((s for s in fila.find_all("span") if re.match(r"^J\.\s*\d+$", s.get_text().strip())), None)
        pl = fila.find("a", href=re.compile(r"/partit/"))
        sc = re.sub(r"\s+", "", pl.get_text()) if pl else ""
        txt = fila.get_text()
        dt = re.search(r"(\d{2}/\d{2}/\d{2})", txt)
        hr = re.search(r"(\d{2}:\d{2})", txt)
        files.append([int(re.sub(r"\D", "", jsp.get_text())) if jsp else None, noms[0] if noms else "", noms[1] if len(noms) > 1 else "",
                      sc if re.match(r"^\d+-\d+$", sc) else "", dt.group(1) if dt else "", hr.group(1) if hr else "",
                      pl.get("href", "") if pl else "", imgs[0] if imgs else "", imgs[-1] if imgs else ""])
    return g, grup, files

def nom_escut_local(f):
    return re.sub(r"[^a-z0-9]+", "-", re.sub(r"\.[a-z]+$", "", f, flags=re.I), flags=re.I).lower() + ".webp"

def baixa_escuts(escuts):
    try:
        from PIL import Image
    except ImportError:
        print("Pillow no instal·lat: els escuts nous es carregaran de la FCF"); return
    for f in escuts:
        desti = os.path.join(ARREL, "img/escuts", nom_escut_local(f))
        if os.path.exists(desti): continue
        try:
            im = Image.open(io.BytesIO(baixa(ESCUTS_URL + urllib.request.quote(f), 2))).convert("RGBA")
            im.thumbnail((128, 128))
            im.save(desti, "WEBP", quality=85, method=6)
            print("Escut nou:", f)
        except Exception as e:
            print("No s'ha pogut baixar l'escut", f, "-", e)

def main():
    avui = datetime.datetime.now(ZoneInfo("Europe/Madrid")).date()
    actual = llegeix_actual()
    if "--si-no-avui" in sys.argv and actual.get("actualitzat") == avui.isoformat():
        print("partits.js ja és d'avui: no cal fer res."); return
    equips_llista = [{k: e[k] for k in ("id", "nom", "categoria", "bloc")} for e in actual["equips"]]
    escuts, equips, errors = [], [], []
    def ci(src):
        f = src.replace(ESCUTS_URL, "")
        if f not in escuts: escuts.append(f)
        return escuts.index(f)
    for e in equips_llista:
        url = "%s/ca/clubs/%s/categories/%s-%s" % (BASE, CLUB, CLUB, e["id"])
        try:
            g, grup, files = analitza(baixa(url).decode("utf-8", "replace"))
        except Exception as ex:
            errors.append("%s (%s)" % (e["id"], ex)); continue
        prefix = "/ca/partit/" + g + "/jornada-"
        rows, perj = [], {}
        for j, hn, an, sc, dt, hr, href, esc_casa, esc_fora in files:
            casa = es_nostre(hn)
            rival = re.sub(r'\s+"', ' "', re.sub(r"\s+", " ", an if casa else hn).strip())
            acta = href[len(prefix) + len(str(j)) + 1:] if href.startswith(prefix + str(j) + "/") else href
            fila = [j, rival, 1 if casa else 0, sc, iso(dt), hr, acta, ci(esc_fora if casa else esc_casa)]
            if j in perj: rows[perj[j]] = None   # jornada repetida (canvi de data): val la darrera
            perj[j] = len(rows); rows.append(fila)
        m = [r for r in rows if r]
        if not g or not m:
            errors.append("%s (sense partits o sense competició: potser la FCF ha canviat la pàgina o l'equip ja no existeix)" % e["id"])
        equips.append(dict(e, grup=grup, g=g, m=m))
    if errors:
        sys.exit("ERROR: no s'ha actualitzat partits.js. Equips amb problemes: " + "; ".join(errors))
    y = avui.year
    temporada = "%d-%d" % (y, y + 1) if avui.month >= 7 else "%d-%d" % (y - 1, y)
    linies = [CAP + "window.JSPM_PARTITS = {", '  "actualitzat": "%s",' % avui.isoformat(), '  "temporada": "%s",' % temporada,
              '  "escuts": ' + json.dumps(escuts, ensure_ascii=False, separators=(",", ":")) + ",", '  "equips": [']
    for i, e in enumerate(equips):
        meta = json.dumps({k: e[k] for k in ("id", "nom", "categoria", "grup", "g", "bloc")}, ensure_ascii=False, separators=(",", ":"))
        linies.append("    " + meta[:-1] + ',"m":' + json.dumps(e["m"], ensure_ascii=False, separators=(",", ":")) + "}" + ("," if i < len(equips) - 1 else ""))
    linies += ["  ]", "};", ""]
    nou = "\n".join(linies)
    n_abans = sum(len(e["m"]) for e in actual["equips"]); n_ara = sum(len(e["m"]) for e in equips)
    if n_ara < n_abans / 2 and "--accepta-menys" not in sys.argv:
        sys.exit("ERROR: ara hi ha %d partits i abans %d. Pot ser un canvi de la FCF; no s'ha tocat partits.js. "
                 "(Si és correcte, p. ex. canvi de temporada, executeu-lo amb --accepta-menys.)" % (n_ara, n_abans))
    abans = sum(1 for e in actual["equips"] for r in e["m"] if r[3])
    despres = sum(1 for e in equips for r in e["m"] if r[3])
    open(FITXER, "w", encoding="utf-8").write(nou)
    baixa_escuts(escuts)
    print("partits.js actualitzat: %d equips, %d partits, %d resultats (abans %d)." % (len(equips), sum(len(e["m"]) for e in equips), despres, abans))

if __name__ == "__main__":
    main()
