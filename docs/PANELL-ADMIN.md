# Panell d'administració (Decap CMS)

## Resposta curta
- **És funcional**: s'ha provat de veritat (18/11/2026) amb el mateix programari, carregant
  la configuració real i guardant canvis en un repositori git de prova.
- **No funciona amb la publicació actual** (artifact de Claude + còpia a Documents):
  el panell desa els canvis en un repositori de **GitHub** i necessita un servei que
  identifiqui els editors (**Netlify Identity** o comptes de GitHub). Sense això,
  `admin/` mostra la pantalla d'inici de sessió però no pot entrar.

## Què es pot gestionar (sense programar)
| Apartat | Fitxer | Què s'hi fa |
|---|---|---|
| Notícies | `dades/noticies.json` | Crear, editar, esborrar; foto (es puja des del panell); data; «visible fins al». Cada notícia té pàgina pròpia `/noticies/<adreça>/`. |
| Equips | `dades/equips.json` | Nom, foto, codi FCF, **entrenador/a**, descripció, staff. **Plantilla**: només nom + inicial i només si es marca «Mostrar la plantilla» (amb autorització de les famílies). |
| Partits | `dades/partits-manuals.json` | **Ajornaments** i canvis de data/hora/camp dels partits de la FCF; **amistosos** amb resultat. |
| Classificacions | `dades/classificacions.json` | Classificació de cada equip (la FCF no té API pública). |
| Patrocinadors | `dades/patrocinadors.json` | Nom, logo, web, sector. |
| Galeria | `dades/galeria.json` | Àlbums, fotos (pujada directa) i fotos de la portada. |
| Botiga | `dades/botiga-extra.json` | Descripció i personalització d'un producte, o **amagar-lo**. Preus i fotos vénen sols de TC. |
| Contacte | `dades/contacte.json` | Adreça, correu, telèfons (només autoritzats), xarxes, mapa. |

Flux: **Esborrany → En revisió → Llest → Publicar**. Res no surt a la web fins que es prem
«Publicar». Amb Netlify, cada esborrany té un enllaç de previsualització. Cada canvi és un
commit: hi ha historial i es pot desfer.

## Què s'ha provat (i com)
Servidor local `decap-server` en mode git + Decap CMS 3.x + la configuració `admin/config.yml`:
- S'obren les 8 col·leccions i es carreguen les dades reals (17 equips, patrocinadors, galeria…).
- Crear una notícia amb foto pujada → esborrany (branca `cms/…`) → «Llest» → «Publicar ara» →
  commit a `main` amb el missatge «Panell: actualitza Notícies «noticies»», foto a `img/pujades/`.
- Botiga: afegir descripció a un producte i amagar-ne un altre → publicat.
- `python3 eines/construeix.py` → apareixen `/noticies/` i `/noticies/prova-panell/` (amb foto, al
  sitemap i a la portada); la botiga amaga el producte i mostra la descripció.
- Sense errors JavaScript al panell.
No provat: l'inici de sessió real amb Netlify Identity/GitHub (cal el compte).

## Com activar-lo (una vegada, ~30 minuts)
1. Crear un compte a **GitHub** i un repositori privat (p. ex. `jspm-web`); pujar-hi aquesta
   carpeta (sense `node_modules`).
2. Crear un compte a **Netlify** → *Add new site → Import from GitHub* → triar el repositori.
   `netlify.toml` ja diu com construir-la (`npm ci` + `python3 eines/construeix.py`).
3. Netlify → *Site configuration → Identity → Enable*. *Registration: Invite only*.
   *Services → Git Gateway → Enable*.
4. *Identity → Invite users*: convidar els correus de les persones del club que editaran.
5. Entrar a `https://<la-web>/admin/`, acceptar la invitació i posar contrasenya.
6. Apuntar el domini `jspm.es` a Netlify (*Domain management*) o deixar-lo on és i fer servir
   Netlify només per al panell (no recomanat: dues webs).

Alternativa sense Netlify Identity: a `admin/config.yml` canviar el `backend` a `github`
(línies comentades) i entrar amb comptes de GitHub amb permís al repositori (cal un servei
OAuth; Netlify el fa gratuïtament).

Amb GitHub + Netlify, partits, preus i Instagram s'actualitzen sols des de GitHub (vegeu `ACTIVAR-GITHUB.md`).

## Seguretat
- Cap contrasenya ni token al codi: l'accés el gestiona Netlify Identity o GitHub.
- `admin/` no s'indexa (`robots.txt`, `noindex`). Queda fora de la CSP estricta perquè carrega el panell des de unpkg.com i identity.netlify.com.
- Registre per invitació: ningú pot crear-se un compte sol.
- Les fotos de menors i les plantilles porten un avís dins el panell.
