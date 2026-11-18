# Com obrir, modificar, construir i publicar la web

## Obrir-la a l'ordinador
Doble clic a `index.html`. Funciona sense internet ni servidor: totes les pàgines
(`partits/index.html`, `equips/senior/index.html`…) es poden obrir igual.
Per provar-la com en un servidor: `python3 -m http.server 8000` dins la carpeta i obrir
`http://localhost:8000`.

## Estructura
```
src/plantilla.html        capçalera, menú, peu i scripts comuns a TOTES les pàgines
src/pagines/*.html        contingut de cada secció (inici, club, equips, partits…, legals)
src/equip.html            plantilla de la pàgina de cada equip
dades/*.json              dades editables (també des del panell)
js/app.js                 funcionament · js/config.js adreça, formulari, correu (sense secrets)
js/traduccions.js         castellà (clau = text català)
css/estil.css             estils
partits.js · botiga.js    dades automàtiques (tasques programades)
insta.js                  instantània d'Instagram (vegeu SERVEIS-EXTERNS.md)
img/                      fotos · img/mini miniatures · img/mobil retalls de portada · img/og per compartir
admin/                    panell d'administració (Decap CMS)
eines/construeix.py       GENERA totes les pàgines, dades/club.js, sitemap, robots, _headers, .htaccess
eines/minifica.mjs        redueix CSS/JS (Node) · eines/imatges_og.py · eines/imatges_mobil.py
eines/instagram_api.py    Instagram amb l'API oficial (necessita token)
eines/partits_fcf.py      partits i resultats de la FCF · eines/preus_tc.py preus de TC Equipacions
.github/workflows/        actualització automàtica a GitHub (vegeu ACTIVAR-GITHUB.md)
docs/                     documentació
```
**Fitxers GENERATS (no s'editen a mà)**: `index.html`, `404.html`, totes les carpetes de
secció/equip/notícia, `dades/club.js`, `sitemap.xml`, `robots.txt`, `site.webmanifest`,
`_headers`, `.htaccess`, `css/estil.min.css`, `js/*.min.js`.

## Després de canviar alguna cosa
```
npm install            # només la primera vegada (eines de reducció de CSS/JS)
python3 eines/construeix.py
```
Sense Node la web es genera igual, però amb CSS/JS sense reduir (avís a la consola).
- Fotos noves de la portada → `python3 eines/imatges_mobil.py` (retalls per a mòbil).
- Imatges per compartir → `pip install pillow fonttools brotli` i `python3 eines/imatges_og.py`.
- Fotos noves d'equips o galeria: posar-ne també la miniatura a `img/mini/…` (720 px d'ample).
- Textos nous en català: afegir la traducció a `js/traduccions.js`. A la consola del
  navegador, `JSPM_PENDENTS` llista els textos sense traduir.

## Publicar
### A) Allotjament actual de jspm.es (Apache, FTP)
1. Fer còpia de seguretat del web actual.
2. Pujar tot el contingut de la carpeta a l'arrel del domini **excepte** `node_modules/`
   (també es poden ometre `src/`, `eines/`, `docs/`, `.github/`: `.htaccess` ja en bloqueja l'accés).
3. Comprovar que `.htaccess` s'ha pujat (és un fitxer ocult). Activa capçaleres de seguretat,
   compressió, memòria cau i la pàgina 404. Provat amb Apache 2.4 (mòduls headers i deflate).
4. HTTPS: activar el certificat (Let's Encrypt) al tauler de l'allotjament.
Amb aquesta opció el formulari només prepara un correu (no envia res sol) i el panell no
funciona: vegeu `SERVEIS-EXTERNS.md` (Formspree) i `PANELL-ADMIN.md`. Si la web va en una
subcarpeta i no a l'arrel del domini, cal canviar `ErrorDocument` a `eines/construeix.py`.

### B) GitHub + Netlify (recomanat: formulari real, panell i actualització sense ordinador)
Vegeu `ACTIVAR-GITHUB.md`. `netlify.toml`, `_headers` i les automatitzacions ja estan preparats.
`_redirects` fa que les carpetes de treball (`docs/`, `eines/`, `src/`, `node_modules/`, `.github/`) no es
vegin a la web publicada (responen 404). Tutorial complet pas a pas: document «Com penjar la web del JSPM».
En un build de Netlify el formulari passa sol a Netlify Forms.

### C) Artifact de Claude (com ara)
És la versió que s'actualitza sola cada setmana. Serveix per veure-la i compartir-la, però no té
domini propi, ni formulari real, ni panell.

## Després de publicar
- Comprovar que `js/config.js` → `url` és l'adreça real (ara `https://www.jspm.es`). Si canvia,
  `python3 eines/construeix.py` (canonical, sitemap i imatges per compartir en depenen).
- Google Search Console: donar d'alta el domini i enviar `sitemap.xml`.
- Provar un enllaç a WhatsApp (p. ex. `https://www.jspm.es/inscripcions/`).
- Validar i completar els textos legals (`LEGAL-PENDENT.md`).
