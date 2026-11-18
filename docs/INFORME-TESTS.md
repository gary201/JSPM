# Informe de proves (18/11/2026)

Eines: Playwright 1.63 + Chrome 153, axe-core 4.14, Lighthouse 12.8 (mòbil, xarxa 4G lenta
simulada), Apache 2.4.58 (amb el `.htaccess` real), Decap CMS 3.17 + decap-server.
Totes les proves s'han executat sobre la versió final. Res del que segueix és estimat.

## 1. Totes les pàgines (30) × 6 amplades (360, 390, 768, 1024, 1440, 1920)
| Prova | Resultat |
|---|---|
| Errors JavaScript | **0** |
| Imatges trencades | **0** |
| Enllaços interns trencats | **0** |
| Desbordament horitzontal | **0** |
| Controls tàctils < 24 px | **0** |
| axe-core (WCAG 2.x A/AA) a 390 i 1440 px | **0 errors** |
| Consola | Només en obrir la web des de la carpeta (`file://`): avís de Chrome per la precàrrega de 2 tipografies. Les tipografies es carreguen igualment (comprovat). Al servidor no surt. |

## 2. Servidor real (Apache + `.htaccess`)
- Totes les pàgines responen 200; `/no-existeix/` respon **404** amb la pàgina 404 pròpia.
- **CSP estricta activa i 0 violacions** a totes les pàgines (amb interacció: fitxa de producte,
  visor de fotos, canvi d'idioma).
- Capçaleres comprovades: CSP, `X-Frame-Options`, `nosniff`, HSTS, `Referrer-Policy`,
  `Permissions-Policy`; compressió gzip; memòria cau per tipus; `/admin/` amb `noindex` i sense CSP.
- `/eines/…`, `/src/` → 404; `/package.json` → 403.

## 3. Lighthouse mòbil
| Pàgina | Rendiment | Accessib. | Bones pràct. | SEO | FCP | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| / | 86 | 100 | 100 | 100 | 1,5 s | 4,2 s | 0,001 | 80 ms |
| /partits/ | 94 | 100 | 100 | 100 | 1,4 s | 3,1 s | 0 | 20 ms |
| /equips/ | 95 | 100 | 100 | 100 | 1,4 s | 3,0 s | 0 | 20 ms |
| /equips/senior/ | 89 | 100 | 100 | 100 | 1,4 s | 3,7 s | 0 | 30 ms |
| /botiga/ | 95 | 100 | 100 | 100 | 1,4 s | 2,8 s | 0,039 | 20 ms |
| /inscripcions/ | 93 | 100 | 100 | 100 | 1,5 s | 2,9 s | 0,077 | 0 ms |
| /galeria/ | 96 | 100 | 100 | 100 | 1,4 s | 2,7 s | 0 | 20 ms |
| /club/ | 95 | 100 | 100 | 100 | 1,4 s | 2,9 s | 0 | 10 ms |
| /contacte/ | 96 | 100 | 100 | 100 | 1,4 s | 2,8 s | 0 | 10 ms |
| /privacitat/ | 96 | 100 | 100 | 100 | 1,4 s | 2,7 s | 0,001 | 0 ms |
Abans (mateixa prova): inici 78, partits 72, botiga 67, inscripcions 71, galeria 72; CLS fins a 0,65.

## 4. Funcionalitat
- **Partits**: filtres per categoria, categories d'un sol equip obren l'equip, enllaç directe
  `#equip`, pestanyes propers/resultats, estats V/E/D, fitxer .ics correcte.
- **Pàgina d'equip**: 18 partits, 6 resultats, .ics de tota la temporada (18 esdeveniments),
  foto ampliable, missatge correcte per a l'escoleta (sense competició federada).
- **Moviment**: amb `prefers-reduced-motion` no es mou res (fotos, paraula, cinta, xifres);
  els botons de pausa aturen el passi i la cinta.
- **Teclat**: «Salta al contingut» porta al contingut; menú mòbil s'obre amb Enter i es tanca amb
  Escape tornant el focus al botó; la fitxa de producte s'obre amb Enter, té el focus a dins i en
  tancar-la el focus torna al producte.
- **Formulari**: el camp de tutor apareix per a menors i és obligatori; sense tutor mostra l'error;
  mode correu: «Encara no s'ha enviat res» + opcions; el text del correu inclou els consentiments.
  Netlify Forms (simulat en local): envia amb `form-name` i mostra «Preinscripció enviada».
  Servei extern: resposta 200 → «enviada»; resposta 500 o error de xarxa → «No s'ha pogut enviar»
  + opcions de correu (mai un èxit fals). La CSP s'adapta sola al domini del servei configurat.
- **Botiga**: descripció i «amagar» des del panell funcionen; enllaç «Tens dubtes? Escriu-nos»
  amb el nom del producte a l'assumpte; traduït al castellà.
- **Traduccions**: totes les pàgines en castellà; només queden sense traduir noms propis, marques
  i textos d'Instagram (74 cadenes, totes d'aquest tipus).
- **Navegació local** (`file://`) i per servidor: els enllaços de carpeta obren la pàgina correcta.

## 4b. Afegit el 18/11 (tarda)
- Instagram amb Behold (feed simulat): mostra les 3 publicacions més noves amb fotos; la CSP
  inclou els dominis de Behold només si està configurat; si Behold respon amb error, es manté la instantània.
- Formulari (Netlify simulat): l'enviament inclou `subject` = «Preinscripció JSPM · Cadet · Pau Prova»;
  el correu preparat (mode correu) porta el mateix assumpte.

## 4c. Afegit el 18/11 (vespre): actualització sense ordinador
- La FCF va canviar la web el 18/11: els resultats ja no surten als enllaços «/acta/» sinó als de
  «/partit/». La tasca programada de l'ordinador s'ha adaptat i s'ha provat al navegador real:
  12 equips, 312 partits, 85 resultats, cap error. Els enllaços «Acta» antics (que ja no obrien res)
  s'amaguen fins a la propera actualització.
- `eines/partits_fcf.py`, `eines/preus_tc.py`, `instagram_api.py` i el flux de GitHub Actions:
  vegeu els detalls a `ACTIVAR-GITHUB.md`.
- La web enllaça cada resultat a la pàgina nova del partit a la FCF (comprovat: l'adreça respon 200).

## 4d. Afegit el 18/11 (nit): fitxa de cada partit
- 79 fitxes generades des de les actes reals de la FCF (85 partits jugats; 6 encara sense acta a la FCF).
- Comprovat a les 79: als 70 partits dels equips de base, només nom i inicial del cognom («Pau P.»,
  decisió del club, vegeu `LEGAL-PENDENT.md`), cap cognom complet; noms complets només als 9 del Sènior;
  cap dada de jugadors rivals (només el minut dels gols en contra). 75 quadren exactament amb el resultat; 4 no, perquè l'acta de la FCF
  no coincideix amb el resultat oficial (marcadors limitats en futbol base o actes incompletes): la fitxa ho indica.
- Extracció idèntica al navegador (JavaScript) i a GitHub (Python): mateixos fitxers byte a byte.
- Pàgina `partit/#equip/jornada` provada a 1280 i 390 px: Sènior amb noms complets, Juvenil amb nom i inicial,
  partit sense acta (missatge), partit no jugat, adreça incorrecta; català i castellà; clic a la targeta
  del resultat i botó «Fitxa»; obrint la web des de l'ordinador (file://). axe-core: 0 violacions
  (fitxa, partits i pàgina d'equip). Sense errors a la consola ni de CSP (Apache amb `.htaccess`).
- Lighthouse mòbil de la fitxa: rendiment 92, accessibilitat 100, bones pràctiques 100 (SEO baix
  a propòsit: la fitxa és `noindex` perquè el contingut depèn de l'adreça). Regressió: 33 pàgines a 390 i
  1280 px sense errors ni desbordaments.

## 4e. Afegit el 18/11 (nit): resultats del cap de setmana
- Noms dels equips de base: provats també els noms que la FCF escriu sense coma («NOM COGNOM»), que
  abans haurien mostrat el cognom complet. Funció idèntica al navegador i a GitHub.
- Empremta dels resultats publicats (`index.js` → `resultats`): mateix valor calculat al navegador i
  a Python; si no canvia cap resultat ni fitxa, la tasca no publica res.
- Dades des de GitHub Pages (`js/config.js` → `dades`): web construïda amb l'adreça configurada i
  servidor remot simulat. Amb el servidor actiu llegeix partits, índex i fitxes remots; amb el servidor
  caigut fa servir les còpies de la web; cap error a la consola ni de CSP.
- `eines/netlify_ignora.sh`: només dades → no publica; dades + un altre fitxer → publica; primera
  publicació → publica; sense `dades` configurat → publica.
- Flux de GitHub (`actualitza-web.yml`) revisat amb `actionlint`: cap error.
- Repetides després dels canvis: fitxa (1280 i 390 px, català i castellà), regressió de 33 pàgines,
  axe-core (0 violacions).
- **No provat**: l'execució real de la tasca del cap de setmana (la primera és el dissabte 21/11 a les
  9:05) ni GitHub Pages real (cal crear el repositori).

## 5. Panell d'administració
Provat amb decap-server (mode git): 8 col·leccions carreguen les dades; notícia amb foto creada
→ esborrany → llest → publicada (commit); botiga editada i publicada; després de construir, la
notícia té pàgina, surt a la portada i al sitemap. Sense errors JavaScript. Vegeu `PANELL-ADMIN.md`.

## 6. Actualització automàtica
- Script nou de preus: provat amb preus correctes (detecta el canvi 33 → 35 € i conserva
  la personalització) i amb preus buits (surt amb error i no escriu res).
- Script d'Instagram amb API oficial: provat contra un servidor simulat (sense token, token
  dolent, correcte). No provat contra l'API real (cal el token del compte).

## 7. Enllaços externs (65 comprovats des del navegador del club)
- 62 responen: patrocinadors, FCF, TC Equipacions (18 fitxes i 18 fotos: totes 200),
  Instagram, Facebook, campus.
- **fusteriapau.com no respon** → cal revisar-lo amb Fusteria Pau (no s'ha tret).
- x.com i Google Maps no es poden comprovar així (bloquegen aquestes peticions); són enllaços
  estàndard.

## 8. Què NO s'ha pogut provar
- Inici de sessió real al panell (Netlify Identity / GitHub) i previsualitzacions de Netlify.
- Enviament real amb un compte de Netlify Forms o Formspree.
- API real d'Instagram.
- Navegadors Safari/Firefox i lectors de pantalla reals (s'ha validat amb axe-core i proves de teclat).
