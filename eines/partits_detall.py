#!/usr/bin/env python3
"""
Detall de cada partit jugat (gols, targetes, canvis i alineació) a partir de l'acta de la FCF.

  python3 eines/partits_detall.py            (normalment, després de partits_fcf.py)

Escriu un fitxer per partit a  partits-detall/<temporada>/<equip>-<jornada>.js  que llegeix
la pàgina  partit/#<equip>/<jornada>  de la web.

PROTECCIÓ DE DADES (important):
- Només es guarden dades del JSPM. Del rival només es guarda el minut dels seus gols
  ("gol en contra"): cap nom, dorsal ni targeta de jugadors d'altres clubs.
- Noms dels jugadors del JSPM (decisió del club, 18/11/2026):
    · equips amb "mostrar_jugadors" a dades/equips.json (panell: Equips → "Es poden publicar
      els noms complets"; ara el Sènior): nom i cognoms tal com surten a la FCF (noms = 1);
    · la resta (equips de menors): NOMÉS nom i inicial del primer cognom ("PAU P."). El cognom
      sencer no es guarda enlloc (noms = 2).
- Si es canvia aquest permís, els detalls d'aquell equip es tornen a generar sols
  a la propera execució.

Funcionament:
- Només baixa els partits que encara no tenen fitxer, els que l'han de refer pel permís i
  els que la FCF ha canviat de resultat des que es va baixar l'acta (cada detall recorda el
  resultat que tenia: camp "res").
- Si l'acta encara no és a la FCF (sense alineació ni gols), no escriu res i ho torna a
  provar a la següent execució (durant 60 dies des del partit).
- Manté partits-detall/<temporada>/index.js (resultat i permís de cada detall). El fa servir
  la pàgina de la fitxa (per no demanar fitxers que no existeixen) i la tasca de l'ordinador
  (per saber què ha de baixar sense llegir tots els fitxers).
- Si la FCF no respon, no toca cap fitxer i surt amb error si no n'ha pogut baixar cap.

Opcions:  --max N          com a molt N pàgines per execució (per defecte 80)
          --refa EQUIP     torna a generar tots els detalls d'un equip (p. ex. --refa a-3cat)
          --tots           prova també partits de fa més de 60 dies sense acta
Requereix: beautifulsoup4.  Proves: FCF_BASE=http://localhost:8000 per llegir pàgines desades.
L'extracció és idèntica a la de eines/detall_fcf.js (la que fa servir la tasca de l'ordinador).
"""
import datetime, hashlib, json, os, re, sys, time, urllib.request
from zoneinfo import ZoneInfo
from bs4 import BeautifulSoup, Tag

ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.environ.get("FCF_BASE", "https://www.fcf.cat").rstrip("/")
UA = "Mozilla/5.0 (compatible; JSPM-web/1.0; +https://www.jspm.es)"
CARPETA = os.path.join(ARREL, "partits-detall")
NOSTRE_RE = re.compile(r"^JOVENTUT SANT PERE MARTIR")
CAP = "/* Detall del partit a partir de l'acta de la FCF. Generat automàticament (eines/partits_detall.py o tasca de l'ordinador). */\n"


# ------------------------------------------------------------------ extracció (mateixa lògica que eines/detall_fcf.js)
def _t(el):
    return re.sub(r"\s+", " ", el.get_text()).strip() if el is not None else ""

def _fills(el):
    return [c for c in el.children if isinstance(c, Tag)]

def _icona(el):
    t = el.find(attrs={"title": True})
    if t is not None:
        v = t.get("title", "")
        if re.search(r"doble", v, re.I): return "yy"
        if re.search(r"groga", v, re.I): return "y"
        if re.search(r"vermella", v, re.I): return "r"
    fills = [(c.get("fill") or "").upper() for c in el.find_all("circle")]
    if "#F30000" in fills: return "pp"
    if "#82E4FF" in fills: return "gp"
    if "#00FF73" in fills: return "g"
    st = [(p.get("stroke") or "").upper() for p in el.find_all("path")]
    if "#007AFF" in st: return "e"
    if "#E50011" in st: return "s"
    return ""

def _minut(s):
    m = re.search(r"(\d+(?:\s*\+\s*\d+)?)", str(s))
    return re.sub(r"\s+", "", m.group(1)) if m else ""

def _caixa(col, nom):
    h = next((x for x in col.find_all("h3") if _t(x) == nom), None)
    return h.parent.parent if h is not None else None

def _es_nostre(col):
    if col.select_one('a[href*="/clubs/joventut-sant-pere-martir/"]') is not None: return True
    im = col.find("img", alt=True) if col.find("h3") is not None else None
    return bool(im is not None and NOSTRE_RE.match(im.get("alt", "")))

PARTICULES = re.compile(r"^(DE|DEL|DELS|LA|LES|EL|ELS|I|Y|D'|L'|DA|DO|DOS|DAS|VAN|VON|DER)$", re.I)

def inicial(nom):
    """'GRABOLEDA SAMANIEGO, MARTÍ' → 'G., MARTÍ'; 'LUCAS BARRANCO' → 'B., LUCAS' (nom i inicial del primer cognom). Igual que a detall_fcf.js."""
    p = str(nom).split(",")
    if len(p) < 2:   # sense coma ("LUCAS BARRANCO"): primera paraula = nom, la resta = cognoms
        ws = str(nom).split()
        if len(ws) < 2: return nom
        resta = [w for w in ws[1:] if not PARTICULES.match(w)]
        return (resta[0][:1] + "., " + ws[0]) if resta else ws[0]
    cg = [w for w in p[0].strip().split() if not PARTICULES.match(w)]
    w = cg[0] if cg else p[0].strip()
    return w[:1] + "., " + ",".join(p[1:]).strip()

def abreuja(det):
    """Deixa només nom i inicial del cognom a tots els jugadors (equips de menors)."""
    for j in det["tit"] + det["sup"]:
        if j[1]: j[1] = inicial(j[1])
    for g in det["gols"]:
        if len(g) > 4 and g[4]: g[4] = inicial(g[4])
    det["noms"] = 2
    return det

def extreu(html, casa, noms):
    """Detall d'una pàgina de partit de la FCF, o None si l'acta encara no hi és."""
    sopa = BeautifulSoup(html, "html.parser")
    grid = next((d for d in sopa.find_all("div") if "lg:grid-cols-12" in " ".join(d.get("class") or [])), None)
    if grid is None or len(_fills(grid)) < 3: return None
    cols = _fills(grid)
    nostra = cols[0] if _es_nostre(cols[0]) else (cols[2] if _es_nostre(cols[2]) else None)

    def jugadors(nom):
        b = _caixa(nostra, nom) if nostra is not None else None
        if b is None or len(_fills(b)) < 2: return []
        out = []
        for r in _fills(_fills(b)[1]):
            fr = _fills(r)
            if not fr: continue
            a = fr[0]
            ns = [s for s in a.find_all("span", attrs={"title": True}) if s.get("title") != "Capità"]
            if not ns: continue
            dors = next((s for s in a.find_all("span") if re.match(r"^\d+$", _t(s))), None)
            cap = 1 if a.find("span", attrs={"title": "Capità"}) is not None else 0
            ev = []
            if len(fr) > 1:
                for x in _fills(fr[1]):
                    c = _icona(x)
                    if c: ev.append([_minut(_t(x.find("span"))), c])
            out.append([_t(dors) if dors is not None else "",
                        re.sub(r"\s+", " ", ns[0].get("title", "")).strip() if noms else "", cap, ev])
        return out

    tit, sup = jugadors("TITULARS"), jugadors("SUPLENTS")
    gols, pl, pv = [], 0, 0
    gb = _caixa(cols[1], "GOLS")
    if gb is not None and len(_fills(gb)) > 1:
        for r in _fills(_fills(gb)[1]):
            textos = [_t(s) for s in r.find_all("span")]
            sc = next((x for x in textos if re.match(r"^\d+\s*-\s*\d+$", x)), None)
            if not sc: continue
            l, v = [int(x.strip()) for x in sc.split("-")]
            local = True if (l == pl + 1 and v == pv) else (False if (v == pv + 1 and l == pl) else None)
            pl, pv = l, v
            if local is not None:
                nostre = (local == bool(casa))
            else:
                im = r.find("img", alt=True)
                nostre = bool(im is not None and NOSTRE_RE.match(im.get("alt", "")))
            mi = _minut(next((x for x in textos if re.match(r"^\(.*\)$", x)), ""))
            tipus = _icona(r) or "g"
            g = [mi, 1 if nostre else 0, tipus]
            if nostre and tipus != "pp":
                d = next((x for x in textos if re.match(r"^\d+$", x)), "")
                n = r.find("span", attrs={"title": True})
                g += [d or "", re.sub(r"\s+", " ", n.get("title", "")).strip() if (noms and n is not None) else ""]
            gols.append(g)
    if not tit and not sup and not gols: return None
    camp = ""
    ca = next((a for a in sopa.select('a[href*="/camps/"]') if re.match(r"^ESTADI\b", _t(a))), None)
    if ca is not None: camp = re.sub(r"^ESTADI:?\s*", "", _t(ca))
    return {"v": 1, "noms": 1 if noms else 0, "camp": camp, "gols": gols, "tit": tit, "sup": sup}


# ------------------------------------------------------------------ fitxers
def clau(eq, j): return "%s/%s" % (eq, j)
def ruta(temporada, eq, j): return os.path.join(CARPETA, temporada, "%s-%s.js" % (eq, j))

def text_fitxer(eq, j, det):
    return CAP + "(window.JSPM_DETALLS=window.JSPM_DETALLS||{})[%s]=%s;\n" % (
        json.dumps(clau(eq, j)), json.dumps(det, ensure_ascii=False, separators=(",", ":")))

def llegeix_fitxer(p):
    try:
        s = open(p, encoding="utf-8").read()
        return json.loads(s[s.index("]=", s.index("JSPM_DETALLS")) + 2:s.rindex(";")])
    except Exception:
        return None

CAP_INDEX = "/* Índex dels detalls de partits (resultat de l'acta baixada i permís de noms). Generat automàticament. */\n"

def firma_resultats(P):
    """Empremta curta de tots els resultats de partits.js (la fa servir l'actualització del cap de
    setmana per saber si hi ha res de nou sense llegir partits.js sencer). Igual que a detall_fcf.js."""
    t = "|".join("|".join("%s-%s:%s" % (e["id"], r[0], r[3]) for r in e["m"] if r[3]) for e in P["equips"])
    return hashlib.sha1(t.encode("utf-8")).hexdigest()[:12]

def llegeix_partits():
    s = open(os.path.join(ARREL, "partits.js"), encoding="utf-8").read()
    return json.loads(s[s.index("{", s.index("window.JSPM_PARTITS")):s.rindex("}") + 1])

def text_index(temporada):
    """index.js: window.JSPM_DETALLS_INDEX={"partits": {"<equip>-<jornada>": ["resultat", noms]}, "resultats": empremta, "temporada": ...}"""
    d = os.path.join(CARPETA, temporada); idx = {}
    for f in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        if not f.endswith(".js"): continue
        det = llegeix_fitxer(os.path.join(d, f))
        if det is not None: idx[f[:-3]] = [det.get("res", ""), det.get("noms", 0)]
    return CAP_INDEX + "window.JSPM_DETALLS_INDEX=" + json.dumps({"temporada": temporada, "partits": idx, "resultats": firma_resultats(llegeix_partits())},
                                                                  ensure_ascii=False, separators=(",", ":"), sort_keys=True) + ";\n"

def escriu_index(temporada):
    p = os.path.join(CARPETA, temporada, "index.js"); t = text_index(temporada)
    if os.path.isdir(os.path.dirname(p)) and (not os.path.exists(p) or open(p, encoding="utf-8").read() != t):
        open(p, "w", encoding="utf-8", newline="\n").write(t)

def baixa(url, intents=3):
    for i in range(intents):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ca,es;q=0.8"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "replace")
        except Exception:
            if i == intents - 1: raise
            time.sleep(5 * (i + 1))

def arg(nom, defecte=None):
    return sys.argv[sys.argv.index(nom) + 1] if nom in sys.argv and sys.argv.index(nom) + 1 < len(sys.argv) else defecte

def main():
    avui = datetime.datetime.now(ZoneInfo("Europe/Madrid")).date()
    P = llegeix_partits()
    temporada = P.get("temporada") or ""
    if not re.match(r"^\d{4}-\d{4}$", temporada): sys.exit("ERROR: partits.js no té una temporada vàlida")
    equips_club = json.load(open(os.path.join(ARREL, "dades/equips.json"), encoding="utf-8"))["equips"]
    permis = {e["fcf"]: bool(e.get("mostrar_jugadors")) for e in equips_club if e.get("fcf")}
    # nivell de noms: 1 = nom complet (equips amb permís), 2 = nom i inicial del cognom (la resta)
    maxim, refa, tots = int(arg("--max", "80")), arg("--refa"), "--tots" in sys.argv

    pendents = []
    for eq in P["equips"]:
        g = eq.get("g") or ""
        if not re.match(r"^\d{4}-\d{4}/", g): continue      # format antic: sense enllaços de partit
        nivell = 1 if permis.get(eq["id"], False) else 2
        for r in eq["m"]:
            j, casa, res, data, slug = r[0], r[2], r[3], r[4], r[6]
            if not res or not slug or re.match(r"^\d+$", str(slug)): continue
            p = ruta(temporada, eq["id"], j)
            ara = llegeix_fitxer(p) if os.path.exists(p) else None
            if ara is not None and ara.get("noms") == nivell and ara.get("res") == res and refa != eq["id"]: continue
            if ara is None and not tots and data:
                try:
                    if (avui - datetime.date.fromisoformat(data)).days > 60: continue
                except ValueError: pass
            url = "%s/ca/partit/%s/jornada-%s/%s" % (BASE, g, j, slug) if not str(slug).startswith("/") else BASE + slug
            pendents.append((eq["id"], j, casa, nivell, url, p, res))

    fets, sense_acta, errors = [], [], []
    for k, (eq, j, casa, nivell, url, p, res) in enumerate(pendents[:maxim]):
        if k: time.sleep(1.5)
        try:
            det = extreu(baixa(url), casa, True)
        except Exception as ex:
            errors.append("%s J%s (%s)" % (eq, j, ex)); continue
        if det is None:
            sense_acta.append("%s J%s" % (eq, j)); continue
        if nivell == 2: abreuja(det)
        det["res"] = res
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, "w", encoding="utf-8", newline="\n").write(text_fitxer(eq, j, det))
        fets.append("%s J%s" % (eq, j))

    escriu_index(temporada)
    resum = ["Detalls de partits: %d nous o refets, %d sense acta encara, %d errors, %d pendents per a la propera vegada." % (
        len(fets), len(sense_acta), len(errors), max(0, len(pendents) - maxim))]
    if fets: resum.append("Fets: " + ", ".join(fets))
    if sense_acta: resum.append("Sense acta a la FCF (es tornarà a provar): " + ", ".join(sense_acta))
    if errors: resum.append("Errors: " + "; ".join(errors))
    print("\n".join(resum))
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8").write("\n".join("- " + x for x in resum) + "\n")
    if errors and not fets and not sense_acta:
        sys.exit("ERROR: no s'ha pogut llegir cap acta de la FCF.")

if __name__ == "__main__":
    main()
