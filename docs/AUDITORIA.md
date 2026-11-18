# Auditoria de la web del JSPM — segona revisió (18/11/2026)

Revisió crítica de la web tal com estava després de la primera millora (17/11/2026),
abans de reconstruir-la. Proves fetes: totes les pàgines a 360, 390, 768, 1024, 1440 i
1920 px; errors JavaScript; imatges i enllaços trencats; desbordaments; accessibilitat
amb axe-core; Lighthouse mòbil; navegació amb teclat; català i castellà.

## 1. Actualització automàtica
| Dada | Com s'actualitzava | Problema |
|---|---|---|
| Partits i resultats (FCF) | Tasca programada setmanal amb el navegador de l'ordinador del club | Funcionava. Si l'ordinador no estava disponible no hi havia cap avís a la web: es podien mostrar dades velles com si fossin actuals. |
| Preus de la botiga (TC Equipacions) | Tasca programada (dl. i dj.) | Funcionava, sense control si la botiga canviava les pàgines (podia publicar un fitxer amb preus buits). |
| Instagram | La mateixa tasca llegia la pàgina «embed» d'Instagram amb un script | **Incompleix les condicions d'Instagram**, que prohibeixen recollir informació de manera automatitzada sense permís. S'ha d'aturar. |
| Registre / errors | Cap | No quedava constància de quan s'havia actualitzat cada dada ni avisava d'errors. |

## 2. SEO
- Les seccions ja tenien pàgina pròpia, però **generades a partir de l'index.html sencer** i
  canviant el contingut amb JavaScript: el contingut real de cada pàgina no era al codi HTML.
- Sense pàgines individuals per equip ni per notícia; sense molles de pa (breadcrumbs).
- Títols i descripcions únics, Open Graph, Twitter, `canonical`, `sitemap.xml`,
  `robots.txt` i dades estructurades: ja hi eren.

## 3. Panell d'administració
- Configurat (Decap CMS) però **sense provar** i desfasat respecte a les dades:
  feia referència a fitxers que ja no existien (`avisos.json`) i no cobria notícies,
  ajornaments, amistosos, classificacions, entrenadors ni informació de la botiga.
- **No funciona amb la publicació actual** (artifact de Claude i còpia a Documents):
  necessita GitHub + Netlify. Això no havia quedat prou clar.

## 4. Privacitat i dades de menors
- Formulari amb una sola casella de consentiment per a tot (preinscripció i comunicacions).
- No es demanava que, per a menors, enviés el formulari el pare/mare/tutor.
- No hi havia política de privacitat, avís legal ni política de cookies.
- El text informatiu (primera capa RGPD) no era al costat del formulari.
- Es publiquen noms i telèfons de 3 càrrecs del club (contacte): cal confirmar que
  tenen autorització.

## 5. Accessibilitat (WCAG 2.2 AA)
- axe-core: 0 errors greus, però **el moviment automàtic no es podia aturar**
  (passi de fotos de la portada, paraula giratòria, cinta de patrocinadors) — WCAG 2.2.2.
- `prefers-reduced-motion` només reduïa les transicions CSS; el JavaScript continuava
  movent el passi de fotos i la cinta.
- Alguns errors d'ordre d'encapçalaments, una etiqueta de formulari que no coincidia amb
  el text visible i una regió sense nom (barra d'idioma).

## 6. Experiència d'usuari
- Partits: no es distingien partits ajornats ni partits passats sense resultat.
- Equips: sense pàgina pròpia (entrenador, calendari, resultats, classificació).
- Botiga: no hi havia manera de fer una consulta al club sobre un producte.
- Inscripcions: el formulari no tenia cap servei d'enviament real (només obria el correu).

## 7. Rendiment (Lighthouse mòbil, abans)
| Pàgina | Rendiment | LCP | CLS |
|---|---|---|---|
| Inici | 78 | 5,3 s | 0,03 |
| Partits | 72 | 3,9 s | 0,32 |
| Botiga | 67 | 3,5 s | 0,65 |
| Inscripcions | 71 | 3,8 s | 0,33 |
| Galeria | 72 | 3,8 s | 0,33 |

Causes: la foto de capçalera de cada pàgina es carregava en diferit (`lazy`) tot i ser
l'element principal; salts de maquetació en arribar les tipografies; la foto de portada
de 300 KB també als mòbils; tots els fitxers de dades a totes les pàgines; CSS i JS sense
reduir.

## 8. Seguretat
- Cap contrasenya ni clau al codi públic (correcte).
- Gestors d'esdeveniments dins l'HTML (`onerror=`, `onload=`) i scripts en línia que
  impedien una política de seguretat de contingut (CSP) estricta.
- Sense capçaleres de seguretat per a Apache (l'allotjament habitual) ni pàgina 404.
