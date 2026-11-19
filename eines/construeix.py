#!/usr/bin/env python3
"""
JSPM — construeix la web a partir de les fonts.

  python3 eines/construeix.py

Fonts (el que s'edita):
  src/plantilla.html        capçalera, menú, peu i finestres comunes
  src/pagines/<pàgina>.html contingut de cada pàgina
  dades/*.json              dades del club (equips, notícies, patrocinadors…)
  css/estil.css, js/*.js    disseny i funcionament

Genera (no s'editen a mà):
  index.html i <pàgina>/index.html   una pàgina HTML independent per secció
  equips/<equip>/index.html          una pàgina per equip
  partit/index.html                  fitxa de cada partit (partit/#equip/jornada; dades a partits-detall/)
  noticies/…                         pàgines de notícies (si n'hi ha)
  dades/club.js                      dades per a la web (funciona també sense servidor)
  css/estil.min.css, js/*.min.js     versions reduïdes (si hi ha Node.js; si no, còpies)
  sitemap.xml, robots.txt, site.webmanifest, _headers (Netlify)

Només cal Python 3. Node.js és opcional (per reduir CSS i JS).
"""
import json, os, re, sys, html, shutil, subprocess, datetime

ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def camí(*p): return os.path.join(ARREL, *p)
def llegeix(p): return open(camí(p), encoding="utf-8").read()
def escriu(p, txt):
    d = os.path.dirname(camí(p))
    if d: os.makedirs(d, exist_ok=True)
    open(camí(p), "w", encoding="utf-8", newline="\n").write(txt)
def e(s): return html.escape(str(s), quote=True)

NOM = "Joventut Sant Pere Màrtir"
FITXERS_CLUB = ["equips.json", "patrocinadors.json", "galeria.json", "noticies.json", "contacte.json", "seo.json",
                "partits-manuals.json", "classificacions.json", "botiga-extra.json"]
ORDRE = ["inici", "club", "himne", "equips", "partits", "que-fem", "galeria", "patrocinadors", "botiga", "inscripcions",
         "contacte", "noticies", "privacitat", "avis-legal", "cookies"]

# ------------------------------------------------------------------ dades
def construeix_club():
    dades = {}
    for f in FITXERS_CLUB:
        d = json.loads(llegeix("dades/" + f)); d.pop("_info", None); dades.update(d)
    escriu("dades/club.js",
           "/* =====================================================================\n"
           "   DADES DEL CLUB — FITXER GENERAT, NO L'EDITIS A MÀ.\n"
           "   S'edita a dades/*.json (o des del panell d'administració)\n"
           "   i es regenera amb: python3 eines/construeix.py\n"
           "   ===================================================================== */\n"
           "window.JSPM_CLUB = " + json.dumps(dades, ensure_ascii=False, indent=1) + ";\n")
    return dades

def config_url():
    m = re.search(r'url:\s*"([^"]+)"', llegeix("js/config.js"))
    return (m.group(1) if m else "https://www.jspm.es").rstrip("/")

def partits_fcf():
    s = llegeix("partits.js")
    return json.loads(s[s.index("{", s.index("window.JSPM_PARTITS")):s.rindex("}") + 1])

# ------------------------------------------------------------------ SEO
def bloc_seo(d, url_base, url, titol, desc, imatge, molles, extra_ld=None):
    c = d["contacte"]
    club = {"@context": "https://schema.org", "@type": "SportsClub", "@id": url_base + "/#club",
            "name": NOM, "alternateName": "JSPM", "url": url_base + "/", "logo": url_base + "/img/icona-512.png",
            "image": url_base + "/img/og/inici.jpg", "description": d["seo"]["inici"]["descripcio"],
            "foundingDate": "1968", "sport": "Futbol", "email": c["email"],
            "address": {"@type": "PostalAddress", "streetAddress": c["adreca"], "postalCode": c["cp"],
                        "addressLocality": c["poblacio"], "addressRegion": c["provincia"], "addressCountry": "ES"},
            "sameAs": [c["instagram"], c["x"], "https://www.fcf.cat/ca/clubs/joventut-sant-pere-martir"]}
    ld = [club] + (extra_ld or [])
    if molles:
        ld.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": k + 1, "name": n, "item": u} for k, (n, u) in enumerate(molles)]})
    L = ['<title>%s</title>' % e(titol),
         '<meta name="description" content="%s">' % e(desc),
         '<link rel="canonical" href="%s">' % e(url),
         '<meta name="theme-color" content="#0c2554">',
         '<link rel="icon" href="logo.webp" type="image/webp">',
         '<link rel="apple-touch-icon" href="img/apple-touch-icon.png">',
         '<link rel="manifest" href="site.webmanifest">',
         '<meta property="og:type" content="website">',
         '<meta property="og:site_name" content="%s">' % NOM,
         '<meta property="og:locale" content="ca_ES">',
         '<meta property="og:locale:alternate" content="es_ES">',
         '<meta property="og:title" content="%s">' % e(titol),
         '<meta property="og:description" content="%s">' % e(desc),
         '<meta property="og:url" content="%s">' % e(url),
         '<meta property="og:image" content="%s">' % e(imatge),
         '<meta property="og:image:width" content="1200">',
         '<meta property="og:image:height" content="630">',
         '<meta name="twitter:card" content="summary_large_image">',
         '<meta name="twitter:site" content="@olotjspm">',
         '<meta name="twitter:title" content="%s">' % e(titol),
         '<meta name="twitter:description" content="%s">' % e(desc),
         '<meta name="twitter:image" content="%s">' % e(imatge)]
    for x in ld:
        L.append('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + '</script>')
    return "\n".join(L)

def molles_html(molles):
    if len(molles) < 2: return ""
    items = []
    for k, (n, rel) in enumerate(molles):
        items.append('<li aria-current="page">%s</li>' % e(n) if k == len(molles) - 1 else '<li><a href="%s">%s</a></li>' % (e(rel), e(n)))
    return '<nav class="molles" aria-label="Ruta de navegació"><ol>%s</ol></nav>' % "".join(items)

def pagina(tpl, contingut, base, pagina_id, seo, seccio_menu, molles_rel, extra_body=""):
    h = tpl.replace("{{BASE}}", base).replace("{{PAGINA}}", pagina_id)
    h = re.sub(r"<!-- SEO:INICI -->.*?<!-- SEO:FI -->", lambda m: "<!-- SEO:INICI -->\n" + seo + "\n<!-- SEO:FI -->", h, flags=re.S)
    if extra_body: h = h.replace('<body data-pagina="%s">' % pagina_id, '<body data-pagina="%s" %s>' % (pagina_id, extra_body), 1)
    # menú: marca la secció actual
    href = "./" if seccio_menu == "inici" else seccio_menu + "/"
    h = h.replace('<a href="%s">' % href, '<a href="%s" aria-current="page">' % href, 1)
    h = h.replace('<a class="botiga" href="%s">' % href, '<a class="botiga" href="%s" aria-current="page">' % href, 1)
    if seccio_menu in ("club", "himne"): h = h.replace('class="submenu-boto"', 'class="submenu-boto actiu"', 1)
    # molla de pa visible a la capçalera de la pàgina
    mh = molles_html(molles_rel)
    if mh:
        contingut = re.sub(r'(<div class="cap-pag[^"]*">(?:<img[^>]*>)?<div class="wrap">)', lambda m: m.group(1) + "\n    " + mh, contingut, count=1)
    # Cada pàgina carrega només les dades que fa servir (menys bytes al mòbil)
    if pagina_id not in ("inici", "partits", "equips", "partit"): h = h.replace('<script src="partits.js" defer></script>\n', "")
    if pagina_id != "botiga": h = h.replace('<script src="botiga.js" defer></script>\n', "")
    if pagina_id != "inici": h = h.replace('<script src="insta.js" defer></script>\n', "")
    # Dades servides també des de GitHub Pages (js/config.js → dades): primer la còpia local i després
    # la de GitHub Pages, que és més nova i la substitueix (si no es pot carregar, queda la local).
    rem = dades_remotes()
    if rem:
        for f in ("partits.js", "botiga.js", "insta.js"):
            h = h.replace('<script src="%s" defer></script>\n' % f, '<script src="%s" defer></script>\n<script src="%s%s" defer></script>\n' % (f, rem, f))
    return h.replace("<!-- CONTINGUT -->", contingut)

def dades_remotes():
    m = re.search(r'dades:\s*"(https://[^"]+)"', llegeix("js/config.js"))
    return (m.group(1).rstrip("/") + "/") if m else ""

# ------------------------------------------------------------------ pàgines
def construeix_pagines(d):
    url_base = config_url()
    tpl = llegeix("src/plantilla.html")
    seo = d["seo"]; fcf = partits_fcf(); fcf_per_id = {x["id"]: x for x in fcf["equips"]}
    urls = []
    def entrada(ruta, titol_seccio, desc, imatge_rel, contingut, profunditat, molles, extra_ld=None, extra_body="", seccio_menu=None, prioritat="0.7"):
        base = "./" if profunditat == 0 else "../" * profunditat
        url = url_base + "/" + ("" if ruta == "" else ruta + "/")
        titol = (titol_seccio + " · " + NOM) if titol_seccio else NOM + " · Club de futbol a Olot"
        molles_abs = [(n, url_base + "/" + (r if r != "./" else "")) for n, r in molles]
        s = bloc_seo(d, url_base, url, titol, desc, url_base + "/" + imatge_rel, molles_abs if len(molles) > 1 else None, extra_ld)
        h = pagina(tpl, contingut, base, (ruta.split("/")[0] or "inici") if not extra_body else ruta.split("/")[0], s,
                   seccio_menu or (ruta.split("/")[0] or "inici"), molles, extra_body)
        escriu((ruta + "/" if ruta else "") + "index.html", h)
        urls.append((url, prioritat))

    for r in ORDRE:
        if r not in seo or not os.path.exists(camí("src/pagines", r + ".html")): continue
        if r == "noticies" and not d.get("noticies"): continue
        cont = llegeix("src/pagines/%s.html" % r)
        s = seo[r]
        molles = [("Inici", "./")] + ([(s["titol"], r + "/")] if r != "inici" else [])
        entrada("" if r == "inici" else r, s["titol"], s["descripcio"], s["imatge"], cont, 0 if r == "inici" else 1, molles,
                prioritat="1.0" if r == "inici" else ("0.3" if r in ("privacitat", "avis-legal", "cookies") else "0.8"))

    # pàgines d'equip
    eq_tpl = llegeix("src/equip.html")
    for t in d["equips"]:
        f = fcf_per_id.get(t.get("fcf") or "")
        nom = t["nom"].replace(" Masculí", "")
        comp = (f["categoria"] + " · " + f["grup"]) if f else ("Iniciació al futbol" if t["bloc"] == "Escoleta" else "Futbol 7 · equip sense competició federada publicada")
        desc = t.get("descripcio") or ("%s del Joventut Sant Pere Màrtir (Olot), temporada %s: %s. Calendari, resultats i foto de l'equip." % (nom, d["temporada"], comp))
        foto = "img/equips/" + t["foto"]; mini = "img/mini/equips/" + t["foto"]
        info = ['<li><span>Bloc</span><b>%s</b></li>' % e(t["bloc"]), '<li><span>Competició</span><b>%s</b></li>' % e(comp)]
        if t.get("entrenador"): info.append('<li><span>Entrenador/a</span><b>%s</b></li>' % e(t["entrenador"]))
        info.append('<li><span>Camp</span><b>%s</b></li>' % e(d["contacte"]["camp"] + " · " + d["contacte"]["adreca"]))
        cont = (eq_tpl.replace("{{NOM}}", e(nom)).replace("{{BLOC}}", e(t["bloc"])).replace("{{COMP}}", e(comp))
                .replace("{{FOTO}}", e(foto)).replace("{{MINI}}", e(mini)).replace("{{INFO}}", "\n".join(info))
                .replace("{{DESC}}", e(t.get("descripcio") or "")))
        team_ld = {"@context": "https://schema.org", "@type": "SportsTeam", "name": NOM + " " + nom, "sport": "Futbol",
                   "url": url_base + "/equips/" + t["slug"] + "/", "image": url_base + "/" + foto,
                   "memberOf": {"@id": url_base + "/#club"}}
        if t.get("entrenador"): team_ld["coach"] = {"@type": "Person", "name": t["entrenador"]}
        entrada("equips/" + t["slug"], nom, desc, "img/og/equips.jpg", cont, 2,
                [("Inici", "./"), ("Equips", "equips/"), (nom, "equips/" + t["slug"] + "/")], [team_ld],
                extra_body='data-equip="%s"' % e(t["slug"]), seccio_menu="equips", prioritat="0.6")

    # neteja: les notícies o equips esborrats al panell no han de quedar publicats
    if os.path.isdir(camí("noticies")): shutil.rmtree(camí("noticies"))
    slugs = {t["slug"] for t in d["equips"]}
    for x in (os.listdir(camí("equips")) if os.path.isdir(camí("equips")) else []):
        if os.path.isdir(camí("equips", x)) and x not in slugs: shutil.rmtree(camí("equips", x))

    # notícies: una pàgina per notícia + pàgina índex (només si n'hi ha)
    def data_txt(x):
        m = re.match(r"^(\d{4})-(\d{2})-(\d{2})", str(x or ""))
        return ('<time datetime="%s-%s-%s">%s/%s/%s</time>' % (m.group(1), m.group(2), m.group(3), m.group(3), m.group(2), m.group(1))) if m else ""
    noticies = sorted([n for n in d.get("noticies", []) if n.get("slug") and n.get("titol")], key=lambda n: str(n.get("data", "")), reverse=True)
    for n in noticies:
        cos = "".join("<p>%s</p>" % e(p).replace("\n", "<br>") for p in str(n.get("text", "")).split("\n\n") if p.strip()) or "<p>%s</p>" % e(n.get("resum", ""))
        img = ('<img class="noticia-img" src="%s" alt="" width="1200" height="675">' % e(n["imatge"].lstrip("/"))) if n.get("imatge") else ""
        cont = ('<section data-ruta="noticia" aria-label="Notícia"><div class="cap-pag"><div class="wrap"><span class="etiqueta">%s</span><h1>%s</h1></div></div>'
                '<article class="bloc wrap noticia">%s%s%s<p><a class="enllac" href="noticies/">← Totes les notícies</a></p></article></section>') % (
                data_txt(n.get("data")) or "Notícia", e(n["titol"]), img, cos,
                ('<p><a class="enllac" href="%s" target="_blank" rel="noopener">%s ↗</a></p>' % (e(n["enllac"]), e(n.get("text_enllac") or "Més informació"))) if n.get("enllac") else "")
        art = {"@context": "https://schema.org", "@type": "NewsArticle", "headline": n["titol"][:110],
               "description": n.get("resum") or n["titol"], "inLanguage": "ca",
               "mainEntityOfPage": url_base + "/noticies/" + n["slug"] + "/",
               "author": {"@id": url_base + "/#club"}, "publisher": {"@id": url_base + "/#club"}}
        if n.get("data"): art["datePublished"] = str(n["data"])[:10]
        if n.get("imatge"): art["image"] = url_base + "/" + n["imatge"].lstrip("/")
        entrada("noticies/" + n["slug"], n["titol"], n.get("resum") or n["titol"], (n.get("imatge") or "img/og/inici.jpg").lstrip("/"), cont, 2,
                [("Inici", "./"), ("Notícies", "noticies/"), (n["titol"], "noticies/" + n["slug"] + "/")], [art],
                extra_body='data-noticia="%s"' % e(n["slug"]), seccio_menu="noticies", prioritat="0.5")
    if noticies:
        sn = seo.get("noticies") or {"titol": "Notícies", "descripcio": "Notícies i avisos del Joventut Sant Pere Màrtir, club de futbol del barri de Sant Pere Màrtir d'Olot.", "imatge": "img/og/inici.jpg"}
        items = "".join('<article class="avis">%s<div><span class="etiqueta">%s</span><h2 class="h3"><a href="noticies/%s/">%s</a></h2>%s</div></article>' % (
            ('<img src="%s" alt="" loading="lazy" width="96" height="96">' % e(n["imatge"].lstrip("/"))) if n.get("imatge") else "",
            data_txt(n.get("data")) or "Notícia", e(n["slug"]), e(n["titol"]), ("<p>%s</p>" % e(n["resum"])) if n.get("resum") else "") for n in noticies)
        cont = ('<section data-ruta="noticies" aria-labelledby="t-noticies"><div class="cap-pag"><div class="wrap"><span class="etiqueta">El club</span>'
                '<h1 id="t-noticies">%s</h1><p>%s</p></div></div><div class="bloc wrap"><div class="graella-avisos llista-noticies">%s</div></div></section>') % (
                e(sn["titol"]), e(sn["descripcio"]), items)
        entrada("noticies", sn["titol"], sn["descripcio"], sn.get("imatge", "img/og/inici.jpg"), cont, 1,
                [("Inici", "./"), (sn["titol"], "noticies/")], prioritat="0.6")

    # fitxa del partit: una sola pàgina; el partit es tria amb #equip/jornada i les dades són a partits-detall/
    # (no indexable ni al sitemap: el contingut depèn del partit i es pinta amb JavaScript)
    sp = bloc_seo(d, url_base, url_base + "/partit/", "Fitxa del partit · " + NOM,
                  "Gols, targetes, canvis i alineació dels partits del Joventut Sant Pere Màrtir.", url_base + "/img/og/partits.jpg",
                  [("Inici", url_base + "/"), ("Partits", url_base + "/partits/"), ("Fitxa del partit", url_base + "/partit/")]
                  ).replace('<link rel="canonical" href="%s/partit/">' % url_base, '<meta name="robots" content="noindex">')
    cp = ('<section data-ruta="partit" aria-labelledby="t-partit"><div class="cap-pag"><div class="wrap">'
          '<span class="etiqueta" id="partit-comp">Partit</span><h1 id="t-partit">Fitxa del partit</h1></div></div>'
          '<div class="bloc wrap"><div id="vista-partit"><div class="buit">Carregant el partit…</div></div>'
          '<noscript><p>Per veure la fitxa del partit cal tenir el JavaScript activat. <a href="partits/">Tornar als partits</a></p></noscript></div></section>')
    escriu("partit/index.html", pagina(tpl, cp, "../", "partit", sp, "partits",
                                        [("Inici", "./"), ("Partits", "partits/"), ("Fitxa del partit", "partit/")]))

    # pàgina 404 (base absoluta perquè es pot servir des de qualsevol ruta; no indexable; fora del sitemap)
    s404 = bloc_seo(d, url_base, url_base + "/404.html", "Pàgina no trobada · " + NOM, "Aquesta pàgina no existeix o s'ha mogut.",
                    url_base + "/img/og/inici.jpg", None).replace('<link rel="canonical" href="%s/404.html">' % url_base, '<meta name="robots" content="noindex">')
    c404 = ('<section data-ruta="404" aria-labelledby="t-404"><div class="cap-pag"><div class="wrap"><span class="etiqueta">Error 404</span>'
            '<h1 id="t-404">Pàgina no trobada</h1><p>Aquesta pàgina no existeix o s\'ha mogut. Pots tornar a l\'inici o anar directament a:</p></div></div>'
            '<div class="bloc wrap"><ul class="llista-404"><li><a href="./">Inici</a></li><li><a href="partits/">Partits i resultats</a></li>'
            '<li><a href="equips/">Equips</a></li><li><a href="inscripcions/">Inscripcions</a></li><li><a href="contacte/">Contacte</a></li></ul></div></section>')
    escriu("404.html", pagina(tpl, c404, "/", "404", s404, "404", []))

    # sitemap, robots, manifest
    avui = datetime.date.today().isoformat()
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u, p in urls:
        sm.append("  <url><loc>%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>" % (e(u), avui, p))
    sm.append("</urlset>")
    escriu("sitemap.xml", "\n".join(sm) + "\n")
    escriu("robots.txt", "User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: %s/sitemap.xml\n" % url_base)
    escriu("site.webmanifest", json.dumps({"name": NOM, "short_name": "JSPM", "lang": "ca", "start_url": "./", "display": "standalone",
        "background_color": "#ffffff", "theme_color": "#0c2554", "icons": [
            {"src": "img/icona-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "img/icona-512.png", "sizes": "512x512", "type": "image/png"}]}, ensure_ascii=False, indent=1) + "\n")
    return urls

# ------------------------------------------------------------------ capçaleres de seguretat
def csp():
    """CSP estricta. Si js/config.js té un endpoint de formulari extern (p. ex. Formspree), s'hi afegeix el seu domini."""
    m = re.search(r'endpoint:\s*"(https://[^/"]+)', llegeix("js/config.js"))
    ext = (" " + m.group(1)) if m else ""
    # Instagram amb Behold: lectura del feed i fotos des dels seus servidors
    bh = re.search(r'behold:\s*"(https://[^"]+)"', llegeix("js/config.js"))
    con_bh, img_bh = (" https://feeds.behold.so", " https://behold.pictures https://*.behold.pictures") if bh else ("", "")
    # Dades a GitHub Pages: cal permetre carregar-ne els scripts
    rem = re.match(r"https://[^/]+", dades_remotes() or "")
    scr = (" " + rem.group(0)) if rem else ""
    return ("default-src 'self'; script-src 'self'%s; style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https://files.fcf.cat https://tcequipacions.cat%s; font-src 'self'; "
            "frame-src https://www.youtube-nocookie.com; connect-src 'self'%s%s; form-action 'self'%s; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; "
            "upgrade-insecure-requests" % (scr, img_bh, ext, con_bh, ext))
COMUNS = {"X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin",
          "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          "X-Frame-Options": "DENY", "Strict-Transport-Security": "max-age=31536000"}
def construeix_capcaleres():
    L = ["/*"] + ["  %s: %s" % kv for kv in COMUNS.items()]
    # CSP estricta a totes les pàgines excepte /admin/ (que carrega el panell des de fora)
    for ruta in ["/", "/*.html", "/club/*", "/himne/*", "/equips/*", "/partits/*", "/partit/*", "/que-fem/*", "/galeria/*", "/patrocinadors/*",
                 "/botiga/*", "/inscripcions/*", "/contacte/*", "/noticies/*", "/privacitat/*", "/avis-legal/*", "/cookies/*"]:
        L += [ruta, "  Content-Security-Policy: " + csp()]
    L += ["/fonts/*", "  Cache-Control: public, max-age=31536000, immutable", "/img/*", "  Cache-Control: public, max-age=604800",
          "/css/*", "  Cache-Control: public, max-age=0, must-revalidate", "/js/*", "  Cache-Control: public, max-age=0, must-revalidate"]
    escriu("_headers", "\n".join(L) + "\n")
    # El mateix per a allotjaments Apache (la majoria d'allotjaments compartits)
    H = ["# Generat per eines/construeix.py — no l'editeu a mà",
         "Options -Indexes", "DirectoryIndex index.html", "ErrorDocument 404 /404.html", "AddDefaultCharset utf-8",
         "AddType application/manifest+json .webmanifest", "AddType image/avif .avif", "AddType image/webp .webp",
         "<IfModule mod_headers.c>"]
    H += ['  Header always set %s "%s"' % kv for kv in COMUNS.items()]
    H += ['  <If "%{REQUEST_URI} !~ m#^/admin/#">', '    Header always set Content-Security-Policy "%s"' % csp(), "  </If>",
          '  <If "%{REQUEST_URI} =~ m#^/admin/#">', '    Header always set X-Robots-Tag "noindex, nofollow"', "  </If>",
          '  <FilesMatch "\\.(woff2|woff)$">', '    Header set Cache-Control "public, max-age=31536000, immutable"', "  </FilesMatch>",
          '  <FilesMatch "\\.(webp|avif|jpg|jpeg|png|svg|ico)$">', '    Header set Cache-Control "public, max-age=604800"', "  </FilesMatch>",
          '  <FilesMatch "\\.(css|js)$">', '    Header set Cache-Control "public, max-age=0, must-revalidate"', "  </FilesMatch>",
          '  <FilesMatch "\\.(html|xml|txt)$">', '    Header set Cache-Control "public, max-age=0, must-revalidate"', "  </FilesMatch>",
          "</IfModule>",
          "<IfModule mod_deflate.c>",
          "  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json application/xml image/svg+xml application/manifest+json",
          "</IfModule>",
          "# Fitxers de treball que no s'han de servir",
          '<FilesMatch "^(package(-lock)?\\.json|netlify\\.toml|_headers|_redirects|LLEGEIX-ME\\.txt)$">', "  Require all denied", "</FilesMatch>",
          "RedirectMatch 404 ^/(eines|src|docs|node_modules|\\.github)(/|$)"]
    escriu(".htaccess", "\n".join(H) + "\n")

# ------------------------------------------------------------------ CSS i JS reduïts
def redueix():
    parells = [("css/estil.css", "css/estil.min.css"), ("js/app.js", "js/app.min.js"),
               ("js/traduccions.js", "js/traduccions.min.js"), ("js/config.js", "js/config.min.js")]
    script = camí("eines", "minifica.mjs")
    if shutil.which("node") and os.path.exists(camí("node_modules")):
        r = subprocess.run(["node", script], cwd=ARREL)
        if r.returncode == 0: return "reduïts amb Node.js"
    for a, b in parells: shutil.copy(camí(a), camí(b))
    return "copiats sense reduir (no hi ha Node.js o falta 'npm install')"

# ------------------------------------------------------------------ versions de CSS/JS
def versiona():
    """Afegeix ?v=<empremta> als CSS/JS reduïts de cada pàgina: quan un fitxer canvia, el navegador
    el torna a baixar encara que en tingui una còpia antiga a la memòria cau."""
    import hashlib
    emp = {}
    for f in ("css/estil.min.css", "js/app.min.js", "js/traduccions.min.js", "js/config.min.js"):
        if os.path.exists(camí(f)):
            emp[f] = hashlib.sha1(open(camí(f), "rb").read()).hexdigest()[:10]
    patró = re.compile(r'((?:css|js)/(?:estil|app|traduccions|config)\.min\.(?:css|js))(?:\?v=[0-9a-f]+)?"')
    n = 0
    for arrel, dirs, fitxers in os.walk(ARREL):
        dirs[:] = [x for x in dirs if x not in ("node_modules", ".git", "src", "eines", "docs", "admin", ".github")]
        for nom in fitxers:
            if not nom.endswith(".html"): continue
            ruta = os.path.join(arrel, nom); txt = open(ruta, encoding="utf-8").read()
            nou = patró.sub(lambda m: m.group(1) + ("?v=" + emp[m.group(1)] if m.group(1) in emp else "") + '"', txt)
            if nou != txt:
                open(ruta, "w", encoding="utf-8").write(nou); n += 1
    return n

if __name__ == "__main__":
    d = construeix_club()
    urls = construeix_pagines(d)
    construeix_capcaleres()
    print("dades/club.js · %d pàgines · sitemap.xml · robots.txt · _headers" % len(urls))
    print("CSS/JS:", redueix())
    # Publicació a Netlify (Netlify posa NETLIFY=true durant el build): el formulari fa servir Netlify Forms
    if os.environ.get("NETLIFY") == "true":
        c = llegeix("js/config.min.js")
        c2 = re.sub(r'servei:\s*"correu"', 'servei:"netlify"', c)
        if c2 != c:
            escriu("js/config.min.js", c2); print("Formulari: Netlify Forms (build de Netlify)")
    print("Versions CSS/JS a %d pàgines" % versiona())
