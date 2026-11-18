# Serveis externs i actualització automàtica

Resum honest de què funciona sol, què està preparat però necessita configuració i
què queda pendent. Cap contrasenya ni token és al codi públic.

## Estat de cada integració

| Funcionalitat | Estat | Com funciona / què cal |
|---|---|---|
| **Partits i resultats (FCF)** | ✅ Funciona (adaptat al canvi de la FCF del 18/11/2026) | Tasca programada «Actualitzar partits JSPM» (dilluns 7:35, 10:35, 13:35, 18:35). Llegeix les pàgines públiques del club a fcf.cat amb el navegador integrat de l'ordinador del club i publica `partits.js`. Avisa si falla l'últim intent del dia o si la FCF canvia la pàgina. |
| **Fitxa de cada partit (gols, targetes, canvis, alineació)** | ✅ Funciona (des del 18/11/2026) | La mateixa tasca dels partits, cada dilluns, llegeix l'acta pública de la FCF dels partits jugats nous i publica `partits-detall/<temporada>/<equip>-<jornada>.js` (+ `index.js`). Es veu a `partit/#<equip>/<jornada>` (clic a qualsevol resultat). Del rival només es guarda el minut dels gols; noms dels jugadors del JSPM: complets al Sènior; als equips de base, només nom i inicial del cognom. Si l'acta encara no hi és, ho torna a provar les setmanes següents (fins a 60 dies). Si la FCF corregeix un resultat, la fitxa es refà. |
| **Resultats en directe (cap de setmana)** | ✅ Preparat (des del 18/11/2026; primera execució dissabte 21/11) | Tasca programada «Resultats en directe JSPM (cap de setmana)»: dissabtes i diumenges, cada hora de 9 a 20 h (minut 5). Mateix sistema que la del dilluns, però silenciosa: si no hi ha cap resultat ni fitxa nous, no publica res; si n'hi ha, publica només `partits.js` i les fitxes noves. Necessita l'ordinador del club encès amb l'app de Claude oberta; si no ho està, aquella hora no es fa (la següent ho torna a provar). Cada execució gasta ús de Claude, encara que s'aturi aviat quan no hi ha res de nou. A la versió de GitHub, el mateix es fa als servidors de GitHub (cal GitHub Pages, vegeu `ACTIVAR-GITHUB.md`). |
| **Preus de la botiga (TC Equipacions)** | ✅ Funciona | Tasca programada «Web JSPM: preus de la botiga» (dl. i dj.). Llegeix el preu de cada producte de les fitxes públiques de TC. No publica res si en llegeix menys de la meitat; avisa si fa ≥ 18 dies que no s'actualitza. |
| **Avís de dades antigues** | ✅ Funciona | La web mostra «Actualitzat el …» i un avís si els partits tenen > 10 dies o la botiga > 21. Instagram s'amaga als 30 dies. |
| **Instagram** | ⏸️ Aturat · dues integracions preparades | Behold (ràpid) o API oficial: vegeu més avall. |
| **Formulari de preinscripció** | ⚠️ Cal activar un servei | Ara (`servei: "correu"`) prepara un correu que la família envia: la web diu clarament que **encara no s'ha enviat res**. Per rebre'l de veritat: Netlify Forms o un servei extern (més avall). |
| **Panell d'administració** | ⚠️ Cal GitHub + Netlify | Provat i funcional; vegeu `PANELL-ADMIN.md`. |
| **Ubicació de partits fora** | Aproximada | Cerca el camp del rival a Google Maps; la FCF no publica l'adreça a les dades que es llegeixen. |

## Condicions d'ús dels serveis
- **Instagram**: les condicions d'ús prohibeixen recollir informació de manera automatitzada
  sense permís exprés (https://help.instagram.com/581066165581870). La lectura de la pàgina
  «embed» que es feia el 17/11 **s'ha eliminat** de la tasca programada. Les fotos que hi ha ara
  són una instantània d'aquell dia i la web les amaga sola a partir del 18/12/2026 (més de 30 dies).
- **FCF i TC Equipacions**: no s'ha trobat cap API pública ni unes condicions que ho regulin.
  Es llegeixen pàgines públiques, amb molt poca freqüència (12 pàgines un cop per setmana;
  18 fitxes dos cops per setmana), des del navegador del club i sense eludir cap protecció.
  **Recomanació**: demanar per escrit a la FCF i a TC Equipacions la seva conformitat
  (és el club i la seva botiga oficial). Si algun dels dos s'hi oposa, desactiveu la tasca
  corresponent i actualitzeu les dades a mà des del panell.

## Instagram automàtic amb Behold (opció ràpida, recomanada ara)
Fa que la web mostri sempre les últimes publicacions de @olotjspm. El pla gratuït de Behold
s'actualitza un cop al dia, fins a 6 publicacions i 1.200 visualitzacions al mes.
1. El compte @olotjspm ha de ser **professional** (Empresa o Creador): a l'app d'Instagram,
   perfil → menú ☰ → *Configuració i activitat* → *Tipus de compte i eines* → *Canvia a compte professional* → Empresa o Creador. És gratuït i no
   canvia res del que veuen els seguidors.
2. Qualsevol persona del club crea un compte gratuït a https://behold.so (*Sign up free*).
3. A Behold: *Sources* → *+ Add source* → *Basic source* → *Connect*.
   - Si teniu la contrasenya d'Instagram: inicieu sessió i premeu *Allow* (acceptant també els permisos opcionals).
   - Si no la teniu: copieu l'enllaç d'autorització que surt al costat d'*Open link* i envieu-lo a qui
     porta l'Instagram; ho autoritza des del seu mòbil sense entrar a Behold.
4. *Feeds* → *Add feed* → *User feed* → trieu el compte → sortida **JSON** → *Create feed*.
5. Copieu el *JSON Feed URL* (https://feeds.behold.so/…) i poseu-lo a `js/config.js`:
   `instagram: { behold: "https://feeds.behold.so/…" }`. Executeu `python3 eines/construeix.py`
   (afegeix Behold a la política de seguretat CSP) i publiqueu.
6. Afegiu Behold a la política de privacitat (les fotos es carreguen des dels seus servidors).
Si Behold falla o arriba al límit, la web mostra la darrera instantània (`insta.js`) i, si és antiga, l'amaga.
Provat amb un feed simulat: mostra les 3 publicacions més noves; si Behold no respon, es manté la instantània.

## Activar Instagram amb l'API oficial
Ho ha de fer **qui administra el compte @olotjspm** (ara el club no hi té accés des d'aquí).
1. El compte ha de ser **professional** (Empresa o Creador): Instagram → Configuració → Tipus de compte.
2. A https://developers.facebook.com crear una app de tipus «Business» i afegir el producte
   **Instagram → API setup with Instagram business login**.
3. Afegir el compte @olotjspm i **generar un token** (permís `instagram_business_basic`).
   El token de llarga durada val 60 dies; el script l'allarga sol a cada execució.
4. Posar el web en un repositori de GitHub i crear el secret **`IG_TOKEN`**
   (Settings → Secrets and variables → Actions). No el poseu mai en cap fitxer.
5. El fitxer `.github/workflows/instagram.yml` ja està fet: executa `eines/instagram_api.py`
   dilluns i dijous, actualitza `insta.js` i les fotos, i Netlify torna a publicar la web.
   Si el token caduca, GitHub envia un correu i la web continua amb les dades anteriors.

Estat de proves: el script s'ha provat contra un servidor simulat (respostes correctes, token
incorrecte, sense token): escriu els fitxers només si tot va bé. **No s'ha pogut provar contra
l'API real** perquè cal el token del compte.

## Activar l'enviament real del formulari
Opció A — **Netlify Forms** (si la web es publica a Netlify; recomanat):
1. A `js/config.js` posar `formulari: { servei: "netlify", endpoint: "" }` i `python3 eines/construeix.py`.
2. Publicar. A Netlify → *Forms* apareixerà «preinscripcio». Configurar-hi l'avís per correu
   a `olotjspm@gmail.com` (*Form notifications*). Netlify inclou filtre de spam (Akismet) i el
   formulari ja porta camp parany (`netlify-honeypot`).
3. Afegir Netlify com a encarregat del tractament a la política de privacitat.
4. **Qui rep els avisos**: a Netlify, *Forms → Form notifications → Add notification → Email
   notification*, una per a cada adreça (p. ex. olotjspm@gmail.com i cada coordinador). Des del
   novembre de 2026, una adreça que no és membre de l'equip de Netlify rep primer un correu per
   confirmar que vol els avisos.
5. Cada avís arriba amb l'assumpte «Preinscripció JSPM · *categoria* · *nom*». Per enviar a cada
   coordinador només la seva categoria: a Gmail (olotjspm@gmail.com) crear un filtre per
   assumpte (p. ex. «Cadet») que reenviï a l'adreça del coordinador.
6. Totes les preinscripcions queden també a Netlify → *Forms → preinscripcio* (es poden exportar a CSV).

Opció B — **Formspree** o similar (qualsevol allotjament):
1. Crear el formulari al servei i copiar-ne l'adreça (`https://formspree.io/f/…`).
2. `js/config.js` → `formulari: { servei: "endpoint", endpoint: "https://formspree.io/f/…" }`
   i `python3 eines/construeix.py` (la política de seguretat CSP hi afegeix el domini sola).
3. Revisar on desa les dades el servei (RGPD) i afegir-lo a la política de privacitat.

Provat: amb Netlify Forms simulat en local, el formulari envia les dades i només mostra
«Preinscripció enviada» quan el servidor respon 200. Amb error de xarxa o resposta d'error,
mostra l'error i ofereix el correu. No s'ha provat amb un compte real de Netlify/Formspree.

## Versió que no depèn de l'ordinador (GitHub + Netlify)
Ja està preparada: partits, fitxes, preus i Instagram s'actualitzen als servidors de GitHub
(`.github/workflows/actualitza-web.yml`): el dilluns, i els resultats també cada hora del cap de
setmana. Les dades es publiquen a GitHub Pages (gratuït) i la web les llegeix d'allà, perquè el pla
gratuït de Netlify només permet unes 20 publicacions al mes. Passos: `ACTIVAR-GITHUB.md`.
Mentrestant, les tasques programades de Claude (que fan servir l'ordinador del club) continuen
actualitzant la versió de Claude i la còpia de Documents.
