#!/usr/bin/env python3
"""
Actualitza els preus de botiga.js llegint la fitxa pública de cada producte a TC Equipacions.

Pensat per a GitHub Actions (.github/workflows/actualitza-web.yml). També a mà:
    python3 eines/preus_tc.py

- Només canvia els preus. Fotos, noms i la resta queden igual.
- Si llegeix menys de la meitat dels preus (la botiga ha canviat les pàgines o no respon),
  SURT AMB ERROR i no toca botiga.js.
Opcions:  --si-no-avui       no fa res si botiga.js ja és d'avui (reintents)
          --nomes-si-canvia  només desa el fitxer si algun preu ha canviat (estalvia publicacions)
Proves: TC_SUBSTITUEIX="https://tcequipacions.cat=>http://localhost:8000"
"""
import datetime, json, os, re, sys, time, urllib.request
from zoneinfo import ZoneInfo

ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FITXER = os.path.join(ARREL, "botiga.js")
UA = "Mozilla/5.0 (compatible; JSPM-web/1.0; +https://www.jspm.es)"

def url_real(u):
    sub = os.environ.get("TC_SUBSTITUEIX", "")
    if "=>" in sub:
        a, b = sub.split("=>", 1); return u.replace(a, b)
    return u

def preu(url):
    for i in range(3):
        try:
            req = urllib.request.Request(url_real(url), headers={"User-Agent": UA, "Accept-Language": "ca"})
            with urllib.request.urlopen(req, timeout=30) as r:
                h = r.read().decode("utf-8", "replace")
            m = (re.search(r'<meta[^>]+property="product:price:amount"[^>]+content="([\d.,]+)"', h)
                 or re.search(r'itemprop="price"[^>]+content="([\d.,]+)"', h))
            if not m: return None
            v = float(m.group(1).replace(",", "."))
            return int(v) if v.is_integer() else round(v, 2)
        except Exception:
            if i == 2: return None
            time.sleep(4 * (i + 1))

def main():
    avui = datetime.datetime.now(ZoneInfo("Europe/Madrid")).date().isoformat()
    src = open(FITXER, encoding="utf-8").read()
    cap = src[:src.index("window.JSPM_BOTIGA")]
    B = json.loads(src[src.index("{", src.index("window.JSPM_BOTIGA")):src.rindex("}") + 1])
    if "--si-no-avui" in sys.argv and B.get("actualitzat") == avui:
        print("botiga.js ja és d'avui: no cal fer res."); return
    trobats, canvis = 0, []
    for k, p in enumerate(B["productes"]):
        if k >= 4 and trobats == 0:
            sys.exit("ERROR: la botiga no respon (0 preus dels primers 4 productes). No s'ha tocat botiga.js.")
        n = preu(p["url"])
        if n is None or n <= 0: continue
        trobats += 1
        if n != p["preu"]:
            canvis.append("%s: %s € → %s €" % (p["nom"], p["preu"], n)); p["preu"] = n
    print("Preus llegits: %d de %d" % (trobats, len(B["productes"])))
    if trobats * 2 < len(B["productes"]):
        sys.exit("ERROR: s'han llegit massa pocs preus (la botiga potser ha canviat les pàgines). No s'ha tocat botiga.js.")
    if not canvis and "--nomes-si-canvia" in sys.argv:
        print("Cap preu ha canviat: no es desa res."); return
    B["actualitzat"] = avui
    cos = ",\n".join("    " + json.dumps(p, ensure_ascii=False, separators=(",", ":")) for p in B["productes"])
    txt = (cap + "window.JSPM_BOTIGA = {\n" +
           '  "botiga": ' + json.dumps(B["botiga"], ensure_ascii=False) + ",\n" +
           '  "actualitzat": "' + avui + '",\n' +
           '  "categories": ' + json.dumps(B["categories"], ensure_ascii=False) + ",\n" +
           '  "productes": [\n' + cos + "\n  ]\n};\n")
    open(FITXER, "w", encoding="utf-8").write(txt)
    print("Canvis de preu:", "; ".join(canvis) if canvis else "cap")
    if canvis and os.environ.get("GITHUB_STEP_SUMMARY"):
        open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8").write("### Preus de la botiga canviats\n" + "\n".join("- " + c for c in canvis) + "\n")

if __name__ == "__main__":
    main()
