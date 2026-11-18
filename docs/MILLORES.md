# Millores fetes

## Segona fase — reconstrucció professional (18/11/2026)

### Arquitectura
- **Web de pàgines reals**: cada secció, cada equip (17) i cada notícia té el seu propi
  HTML amb el contingut dins el codi (no generat amb JavaScript). Es generen amb
  `python3 eines/construeix.py` a partir de `src/plantilla.html`, `src/pagines/*.html`,
  `src/equip.html` i `dades/*.json`.
- Sense frameworks ni bases de dades: HTML, CSS i JavaScript sense dependències a la web.
  Node només s'usa (opcional) per reduir CSS/JS en construir.
- Funciona igual publicada a un servidor que oberta des de la carpeta (doble clic).
- Si s'esborra un equip o una notícia al panell, la seva pàgina desapareix en tornar a construir.

### SEO
- Títol, descripció, `canonical`, Open Graph i Twitter Card únics per pàgina (equips i notícies inclosos).
- Molles de pa visibles + `BreadcrumbList`; `SportsClub`, `SportsTeam` (amb entrenador si n'hi ha) i `NewsArticle`.
- `sitemap.xml` amb totes les pàgines, `robots.txt` (bloqueja `/admin/`), pàgina 404 no indexable.
- Enllaços interns coherents: menú, peu legal, xips d'equips a la portada, partits → pàgina de l'equip.

### Actualització automàtica
- **Partits** (FCF, setmanal) i **preus de la botiga** (TC, dl. i dj.): tasques programades.
- **Avís de dades antigues** a la web: partits > 10 dies, botiga > 21 dies, Instagram > 30 dies
  (Instagram s'amaga). Cada bloc mostra «Actualitzat el …».
- La tasca de la botiga **no publica res si llegeix menys de la meitat dels preus** (la botiga
  ha canviat) i avisa; també avisa si fa 18 dies que no s'ha pogut actualitzar.
- **Instagram aturat**: la lectura automàtica incomplia les condicions d'Instagram. Vegeu
  `SERVEIS-EXTERNS.md` per activar-lo amb l'API oficial.
- Registre: cada publicació a l'artifact queda amb una etiqueta («Partits actualitzats AAAA-MM-DD»,
  «Preus de la botiga actualitzats»); amb el panell, cada canvi és un commit a GitHub.

### Panell d'administració (Decap CMS)
- Reescrit i **provat de veritat** amb un servidor local: notícies (amb foto pujada), equips,
  entrenadors, plantilles (amb control d'autorització), ajornaments, amistosos, classificacions,
  patrocinadors, galeria, informació de botiga i contacte. Esborrany → revisió → publicació.
- Vegeu `PANELL-ADMIN.md` (no funciona amb la publicació actual: cal GitHub + Netlify).

### Privacitat i menors
- Política de privacitat, avís legal i política de cookies (esborranys, vegeu `LEGAL-PENDENT.md`).
- Formulari: informació bàsica RGPD al costat; consentiments separats (tractament obligatori,
  declaració de pare/mare/tutor si és menor, comunicacions opcionals); camp parany anti-spam;
  control de temps; validació accessible; mai diu «enviat» si no ho ha confirmat el servidor.
- Plantilles de jugadors amagades per defecte; només nom + inicial i només amb autorització.
- La web no fa servir galetes ni analítica.

### Accessibilitat (WCAG 2.2 AA)
- Botons per **aturar** el passi de fotos, la paraula giratòria i la cinta de patrocinadors.
- `prefers-reduced-motion` atura de veritat tot el moviment (CSS **i** JavaScript).
- Corregits encapçalaments, etiquetes i regions. axe-core: 0 errors a 30 pàgines.
- Lighthouse accessibilitat: 100 a totes les pàgines provades.

### Partits, equips, botiga, inscripcions
- Partits: estats **Ajornat**, **Pendent de resultat**, **Data per confirmar**; ajornaments i
  amistosos des del panell; categories d'un sol equip obren l'equip directament.
- Pàgina per equip: foto ampliable, categoria, competició, entrenador (si s'informa), camp,
  calendari, resultats, «afegeix tots els partits al calendari», classificació (si s'entra al panell).
- Botiga: descripció i personalització des del panell, opció d'amagar un producte, enllaç
  «Tens dubtes? Escriu-nos» amb el nom del producte. Sense talles (decisió del club) ni
  disponibilitat inventada.
- Inscripcions: vegeu privacitat; envia de veritat amb Netlify Forms o un servei extern.

### Rendiment (Lighthouse mòbil, després)
| Pàgina | Rendiment | LCP | CLS |
|---|---|---|---|
| Inici | 86 (abans 78) | 4,1 s | 0,001 |
| Partits | 89 (abans 72) | 3,7 s | 0 |
| Botiga | 94 (abans 67) | 3,0 s | 0 |
| Inscripcions | 93 (abans 71) | 3,2 s | 0 |
| Galeria | 94 (abans 72) | 3,0 s | 0 |
| Equips | 95 | 2,9 s | 0 |

- Foto de capçalera prioritària; retalls verticals de la portada per a mòbil (300 KB → 75 KB).
- Tipografies de reserva amb mètriques ajustades (sense salts) i precàrrega de les 2 principals.
- Scripts `defer` i cada pàgina carrega només les dades que necessita.
- CSS/JS reduïts (terser, lightningcss); compressió i memòria cau (`.htaccess` / `_headers`).

### Seguretat
- CSP estricta (sense scripts ni gestors en línia), `X-Frame-Options`, `nosniff`, HSTS,
  `Referrer-Policy`, `Permissions-Policy`, per a Netlify (`_headers`) i Apache (`.htaccess`).
- Carpetes de treball (`eines/`, `src/`, `docs/`) i fitxers de configuració no es serveixen a Apache.

---

## Primera fase (17/11/2026)
Inscripcions amb taula de categories i formulari; partits amb pestanyes, filtres, calendari
(.ics), WhatsApp i mapa; fitxa de producte; seccions amb URL pròpia; SEO bàsic; accessibilitat
(salta al contingut, focus, Escape); tipografies locals; miniatures; codi separat en fitxers.
