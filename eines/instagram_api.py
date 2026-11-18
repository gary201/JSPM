#!/usr/bin/env python3
"""
Actualitza insta.js i img/instagram/ amb l'API OFICIAL d'Instagram
(Instagram API with Instagram Login, graph.instagram.com).

NO és scraping: fa servir un testimoni (token) del compte professional del club,
que l'administrador del compte @olotjspm genera una sola vegada (docs/SERVEIS-EXTERNS.md).

El token NO va mai al codi ni a la web pública: es llegeix de la variable d'entorn
IG_TOKEN (un «secret» de GitHub Actions o de Netlify).

Ús:  IG_TOKEN=... python3 eines/instagram_api.py
Opcional: IG_API_BASE (per a proves), IG_POSTS (per defecte 6), IG_REFRESH=1 per allargar el token 60 dies.
Opcions: --nomes-si-nous (només desa si hi ha publicacions noves), --si-no-avui (no fa res si ja és d'avui).
Requereix: Pillow (pip install pillow).

Si alguna cosa falla, surt amb error i NO toca els fitxers existents.
"""
import io, json, os, sys, datetime, urllib.error, urllib.parse, urllib.request
from PIL import Image

ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.environ.get("IG_API_BASE", "https://graph.instagram.com/v26.0").rstrip("/")
TOKEN = os.environ.get("IG_TOKEN", "").strip()
N = int(os.environ.get("IG_POSTS", "6"))

def get(url, params=None, binari=False):
    if params: url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "jspm-web/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    return data if binari else json.loads(data.decode("utf-8"))

def main():
    if not TOKEN:
        sys.exit("Falta IG_TOKEN (token del compte d'Instagram del club). No s'ha canviat res.")
    if "--si-no-avui" in sys.argv:
        try:
            if '"actualitzat": "%s"' % datetime.date.today().isoformat() in open(os.path.join(ARREL, "insta.js"), encoding="utf-8").read():
                print("insta.js ja és d'avui: no cal fer res."); return
        except OSError:
            pass
    if os.environ.get("IG_REFRESH") == "1":
        # Allarga 60 dies la validesa del token de llarga durada (cal que tingui més de 24 h)
        r = get(BASE.rsplit("/v", 1)[0] + "/refresh_access_token", {"grant_type": "ig_refresh_token", "access_token": TOKEN})
        print("Token allargat; caduca d'aquí a %s dies" % round(r.get("expires_in", 0) / 86400))
    jo = get(BASE + "/me", {"fields": "username,name,followers_count,media_count", "access_token": TOKEN})
    media = get(BASE + "/me/media", {"fields": "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count",
                                    "limit": N, "access_token": TOKEN}).get("data", [])[:N]
    if len(media) < min(N, 3):
        sys.exit("L'API ha retornat només %d publicacions; no s'ha canviat res." % len(media))
    posts, imatges = [], []
    for i, m in enumerate(media, 1):
        url_img = m.get("thumbnail_url") if m.get("media_type") == "VIDEO" else m.get("media_url")
        if not url_img: sys.exit("Publicació %s sense imatge; no s'ha canviat res." % m.get("id"))
        im = Image.open(io.BytesIO(get(url_img, binari=True))).convert("RGB")
        amp = 900 if i == 1 else 640
        if im.width > amp: im = im.resize((amp, round(im.height * amp / im.width)), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=80, method=6); imatges.append(buf.getvalue())
        sc = (m.get("permalink") or "").rstrip("/").split("/")[-1]
        ts = int(datetime.datetime.strptime(m["timestamp"][:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=datetime.timezone.utc).timestamp())
        posts.append({"sc": sc, "tipus": {"VIDEO": "video", "CAROUSEL_ALBUM": "album"}.get(m.get("media_type"), "imatge"),
                      "ts": ts, "likes": m.get("like_count"), "text": m.get("caption") or "",
                      "img": "img/instagram/ig-%d.webp" % i, "w": im.width, "h": im.height})
    # Dijous: si no hi ha publicacions noves no cal desar res (estalvia una publicació a Netlify)
    if "--nomes-si-nous" in sys.argv:
        try:
            ant = open(os.path.join(ARREL, "insta.js"), encoding="utf-8").read()
            ant = json.loads(ant[ant.index("{", ant.index("window.JSPM_INSTAGRAM")):ant.rindex("}") + 1])
            if [x["sc"] for x in ant.get("posts", [])] == [x["sc"] for x in posts]:
                print("Instagram: cap publicació nova; no es desa res."); return
        except Exception:
            pass
    # Tot ha anat bé: ara sí, escrivim
    os.makedirs(os.path.join(ARREL, "img/instagram"), exist_ok=True)
    for i, b in enumerate(imatges, 1):
        open(os.path.join(ARREL, "img/instagram/ig-%d.webp" % i), "wb").write(b)
    dades = {"actualitzat": datetime.date.today().isoformat(), "usuari": jo.get("username", "olotjspm"),
             "nom": jo.get("name") or "Joventut Sant Pere Màrtir", "seguidors": jo.get("followers_count"),
             "publicacions": jo.get("media_count"), "posts": posts}
    js = ("/* =====================================================================\n"
          "   INSTAGRAM JSPM — últimes publicacions de @%s\n"
          "   Generat per eines/instagram_api.py amb l'API oficial d'Instagram.\n"
          "   ===================================================================== */\n"
          "window.JSPM_INSTAGRAM = %s;\n") % (dades["usuari"], json.dumps(dades, ensure_ascii=False, indent=1))
    open(os.path.join(ARREL, "insta.js"), "w", encoding="utf-8").write(js)
    print("insta.js actualitzat: %d publicacions (@%s)" % (len(posts), dades["usuari"]))

if __name__ == "__main__":
    try:
        main()
    except urllib.error.HTTPError as e:
        cos = e.read().decode("utf-8", "replace")[:300]
        sys.exit("Error de l'API d'Instagram (%s): %s — no s'ha canviat res." % (e.code, cos))
