# Activar la web definitiva amb GitHub + Netlify (sense dependre de l'ordinador)

Quan això estigui fet:
- **Partits i resultats** (dilluns), **preus de la botiga** (dilluns, i dijous si canvien) i
  **Instagram** (si s'activa amb l'API oficial) s'actualitzen sols als servidors de GitHub,
  encara que tots els ordinadors del club estiguin apagats.
- Cada actualització és un canvi al repositori i **Netlify torna a publicar la web sola**.
- Funcionen el **formulari d'inscripció** (Netlify Forms, s'activa sol en publicar a Netlify)
  i el **panell d'administració**.
- **Resultats del cap de setmana en directe**: dissabtes i diumenges, cada hora de 9 a 20 h, es
  revisen els resultats i les fitxes dels partits i es publiquen si n'hi ha de nous (cal l’apartat 3,
  GitHub Pages).
- Les dades que canvien sovint (partits, fitxes, botiga, Instagram) es publiquen a **GitHub Pages**
  i la web les llegeix d'allà. Així **Netlify no torna a publicar la web per cada resultat** i no
  s'acaben els crèdits del pla gratuït (300 crèdits/mes; cada publicació en gasta 15, és a dir,
  unes 20 publicacions al mes: amb una cada hora del cap de setmana s'acabarien la primera setmana).

Tot està preparat: `.github/workflows/actualitza-web.yml`, `eines/partits_fcf.py`,
`eines/partits_detall.py`, `eines/preus_tc.py`, `eines/instagram_api.py` i
`eines/netlify_ignora.sh`. Només cal canviar una línia de `js/config.js` al pas 4.

## 1. GitHub (15 minuts)
1. Crear un compte gratuït a https://github.com (millor amb el correu del club).
2. Instal·lar **GitHub Desktop** (https://desktop.github.com) i iniciar-hi sessió.
3. GitHub Desktop → *File* → *Add local repository* → triar `C:\Users\ruizg\Documents\web JSPM`.
   Dirà que no és un repositori: prémer **create a repository** → Name: `jspm-web` → *Create repository*.
4. Prémer **Publish repository**. **Desmarqueu «Keep this code private»** (repositori públic) →
   *Publish*. Motiu: amb el compte gratuït de GitHub, GitHub Pages (l’apartat 3 de sota, necessari per
   als resultats del cap de setmana) només funciona en repositoris públics. Al repositori no hi ha
   cap contrasenya ni dada privada: les claus (Instagram, etc.) van a *Settings → Secrets*, que no
   són públics, i la resta és el que ja es veu a la web. Si preferiu el repositori **privat**, tot
   funciona igual excepte les actualitzacions del cap de setmana per GitHub (només es farà la del
   dilluns, i cada dilluns Netlify tornarà a publicar la web).
5. A github.com, dins el repositori: **Settings → Actions → General → Workflow permissions →
   Read and write permissions → Save**. (Sense això el robot no pot desar les actualitzacions.)
6. Provar-ho: pestanya **Actions** → *Actualitza la web* → **Run workflow**. En 2-3 minuts ha de
   sortir en verd. Si surt en vermell, obriu-lo: el missatge diu què ha fallat (en català).

## 2. Netlify (10 minuts)
1. A Netlify (el mateix compte de la web de prova) → **Add new project → Import an existing
   project → GitHub** → autoritzar → triar `jspm-web`. La configuració ja la llegeix de
   `netlify.toml`: prémer **Deploy**.
2. **Forms → Enable form detection** i tornar a publicar (*Deploys → Trigger deploy*).
   Després, **Form notifications** amb els correus que han de rebre les preinscripcions.
3. Panell d'administració: vegeu `PANELL-ADMIN.md` (Identity + Git Gateway, convidar editors).
4. Domini: **Domain management → Add a domain → jspm.es** i seguir les instruccions de DNS.

## 3. GitHub Pages: dades i resultats del cap de setmana (10 minuts)
1. A github.com, dins el repositori: **Settings → Pages → Build and deployment → Source:
   GitHub Actions**. (No cal triar cap branca.)
2. Pestanya **Actions** → *Actualitza la web* → **Run workflow**. Quan acabi en verd, obriu
   `https://USUARI.github.io/jspm-web/partits.js` (USUARI = el vostre nom d'usuari de GitHub): ha de
   sortir el text dels partits.
3. Al fitxer `js/config.js`, canvieu `dades: "",` per
   `dades: "https://USUARI.github.io/jspm-web/",` (amb la barra final). Es pot fer des de github.com
   (icona del llapis) o demanar-ho a Claude. En desar-ho, Netlify torna a publicar la web una vegada.
4. Comprovació: obriu la web publicada → *Partits*. Ha de funcionar igual que abans.

A partir d'aquí:
- Dissabtes i diumenges, cada hora de 9 a 20 h (hora de Barcelona), el robot mira la FCF. Si hi ha
  resultats o fitxes nous, els desa al repositori i els publica a GitHub Pages en 1-2 minuts. Si no
  hi ha res de nou, no publica res.
- Netlify **no** torna a publicar quan només han canviat dades: ho decideix `eines/netlify_ignora.sh`
  (configurat a `netlify.toml`). Quan canvieu textos, fotos o el panell, sí que publica.
- Si GitHub Pages no respon, la web fa servir les dades que porta incorporades (les de l'última
  publicació a Netlify), sense errors.
- Mentre `dades` estigui buit, el robot **no** fa les actualitzacions del cap de setmana (deixa un
  avís a Actions), per no gastar els crèdits de Netlify.

## 4. Avisar Claude
Quan funcioni, digueu-ho i desactivaré les tasques programades que ara depenen de l'ordinador
(«Actualitzar partits JSPM», «Resultats en directe JSPM (cap de setmana)» i «Web JSPM: preus de la
botiga»), perquè no es dupliquin.

## Avisos i errors
- Si un pas falla (la FCF o la botiga no responen o canvien la pàgina), **la web es queda amb les
  dades anteriors**, la resta de passos continuen i GitHub envia un correu a qui ha publicat el
  repositori. Dilluns a la tarda es torna a provar sol.
- La web mostra «Actualitzat el …» i avisa els visitants si els partits tenen més de 10 dies o
  els preus més de 21.
- Els scripts no publiquen mai dades buides: si llegeixen menys de la meitat dels preus o
  molts menys partits que abans, s'aturen sense tocar res.

## Fitxes dels partits (`eines/partits_detall.py`)
- Pas «Fitxa dels partits jugats» del flux: s'executa cada dilluns i, amb GitHub Pages activat, cada
  hora del cap de setmana. Baixa només l'acta dels partits jugats nous o dels que han canviat de
  resultat (amb una pausa d'1,5 s entre pàgines, màxim 80 per execució).
- Noms: complets només per als equips amb el permís activat al panell (ara el Sènior); la resta,
  nom i inicial del cognom («Pau P.»). Del rival només es guarda el minut dels gols.
- Si es canvia al panell el permís «Es poden publicar els noms dels jugadors» d'un equip, el dilluns
  següent es tornen a generar totes les fitxes d'aquell equip (amb noms complets o amb nom i inicial del cognom).
- A mà: `python3 eines/partits_detall.py` · tornar a fer un equip: `--refa a-3cat` · partits antics
  sense acta: `--tots`.
- Cada temporada té la seva carpeta (`partits-detall/2026-2027/`…): el canvi de temporada no
  barreja fitxes.

## Canvi de temporada (cada estiu)
La llista d'equips és dins `partits.js` (camps `id`, `nom`, `categoria`, `bloc` de cada equip;
`id` és el codi de l'equip a la FCF, el final de l'adreça de la seva pàgina, p. ex. `a-3cat`).
Quan la FCF publiqui els equips nous, s'ha d'actualitzar aquesta llista i executar una vegada
`python3 eines/partits_fcf.py --accepta-menys` (o demanar-ho a Claude).

## Proves fetes (18/11/2026)
- `partits_fcf.py`: provat amb pàgines de prova que reprodueixen el format nou de la FCF (del
  18/11/2026), amb una fila real copiada tal qual. Dona exactament el mateix resultat que la lectura des del navegador: partits,
  resultats, jornades repetides per canvi de data, partits sense data, escuts i enllaç a cada partit.
- `preus_tc.py`: provat amb la fitxa real d'un producte (preu 33 €), amb un canvi de preu,
  sense canvis (no desa res) i amb la botiga caiguda (error, fitxer intacte).
- Flux complet simulat (repositori git local, servidors de prova): dilluns amb un pas fallant
  (desa la resta i avisa), reintent de la tarda (no fa res), dijous sense canvis (no publica) i
  dijous amb un preu canviat (publica només botiga.js).
- `partits_detall.py`: provat amb 6 actes reals de la FCF desades (Sènior, Juvenil, Cadet, Aleví,
  Prebenjamí i una acta buida): resultat idèntic al de la lectura des del navegador. Flux complet
  provat amb un servidor de prova: torna a fer una fitxa esborrada (fitxer idèntic), no torna a fer
  partits de fa més de 60 dies sense acta, aplica el canvi de permís de noms i manté l'índex.
- Dades des de GitHub Pages: provat amb la web construïda amb `dades` configurat i un servidor
  simulat: llegeix partits, índex i fitxes del servidor remot; amb el servidor caigut fa servir les
  còpies de la web sense errors. Capçalera de seguretat (CSP) amb l'adreça remota afegida.
- `netlify_ignora.sh`: 4 casos (només dades → no publica; dades + un altre fitxer → publica;
  sense `dades` configurat → publica; primera publicació → publica).
- Flux de GitHub revisat amb `actionlint` (sense errors).
- **No provat**: l'execució real als servidors de GitHub (ni GitHub Pages real). És possible que la FCF o TC bloquegin
  les peticions des de GitHub; si passés, el pas fallaria amb avís i caldria mantenir la tasca
  programada de l'ordinador per a aquella dada.
