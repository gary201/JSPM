# Robot dels partits: engegada externa (cron-job.org)

## Per què
El robot «Actualitza la web» (GitHub Actions) té hores programades: cada hora els caps de setmana,
dilluns i dijous. GitHub no garanteix aquestes hores. Per exemple:
- el dijous 19/11/2026 la tasca de les 13:23 es va executar a les 21:47;
- el dissabte 21/11/2026 no se'n va executar cap entre les 9 i les 16 h.

Per això un servei extern gratuït, **cron-job.org**, avisa GitHub a les mateixes hores. Les hores
programades de GitHub es mantenen com a reserva. Si coincideixen totes dues, no passa res: la segona
espera que acabi la primera i, si no hi ha res de nou, no publica res.

## Què cal tenir
1. **Un permís de GitHub (fine-grained token)** que només serveixi per engegar el robot d'aquest repositori.
   - Camí: GitHub → foto de perfil → *Settings* → *Developer settings* → *Personal access tokens*
     → *Fine-grained tokens* → *Generate new token*.
   - *Token name*: `cron-job JSPM`
   - *Expiration*: la més llarga que permeti. **Apunta't la data**: quan caduqui, el robot extern
     deixarà de funcionar i caldrà fer-ne un de nou i canviar-lo a cron-job.org.
   - *Repository access*: *Only select repositories* → `gary201/JSPM`
   - *Permissions* → *Repository permissions* → **Actions: Read and write**. No en donis cap més.
     El *Metadata: Read-only* s'hi afegeix sol.
   - Copia el token (comença per `github_pat_`). GitHub només el mostra un cop.
   - **No el posis mai al codi de la web ni al repositori.** Només va a cron-job.org.

2. **Un compte gratuït a https://cron-job.org**.

## Tasques a cron-job.org
A totes: *Create cronjob* → pestanya *Common* i pestanya *Advanced*.

**Comú a les tres**
- *URL*: `https://api.github.com/repos/gary201/JSPM/actions/workflows/actualitza-web.yml/dispatches`
- *Advanced → Request method*: `POST`
- *Advanced → Headers* (quatre capçaleres):
  - `Accept` = `application/vnd.github+json`
  - `Authorization` = `Bearer github_pat_…` (el token)
  - `X-GitHub-Api-Version` = `2022-11-28`
  - `Content-Type` = `application/json`
- *Advanced → Time zone*: `Europe/Madrid`
- Resposta correcta: **204 No Content**.
- GitHub avisa que la versió d'API `2022-11-28` deixarà de funcionar el **10/03/2028**.
  Abans d'aquesta data, canvia `X-GitHub-Api-Version` per la versió vigent
  (https://docs.github.com/en/rest/about-the-rest-api/api-versions).

| Tasca | Horari (Custom) | Request body |
|---|---|---|
| JSPM – cap de setmana | Dies de la setmana: dissabte i diumenge · Hores: 9 a 20 · Minut: 23 | `{"ref":"main","inputs":{"mode":"cap-de-setmana"}}` |
| JSPM – dilluns | Dilluns · Hores: 8 i 18 · Minut: 23 | `{"ref":"main","inputs":{"mode":"normal"}}` |
| JSPM – dijous (opcional) | Dijous · Hora: 14 · Minut: 23 | `{"ref":"main","inputs":{"mode":"dijous"}}` |

Què fa cada mode:
- `cap-de-setmana`: torna a mirar els resultats i les fitxes encara que ja s'hagi fet aquell dia.
  Fora de les 9–20 h no fa res.
- `normal`: partits, fitxes, preus i Instagram, però no fa res si ja s'han actualitzat aquell dia.
- `dijous`: preus i Instagram, i només publica si han canviat.

## Comprovar que funciona
- A cron-job.org, cada execució ha de sortir en verd amb el codi 204.
- A GitHub → *Actions*, han d'aparèixer execucions «Actualitza la web» amb l'esdeveniment
  `workflow_dispatch`.
- Si surt el codi **401** o **403**, el token ha caducat o no té el permís *Actions: Read and write*.
- Si surt el codi **422**, el *Request body* està mal escrit.

## Estat (21/11/2026)
Està creada la tasca «JSPM - partits cap de setmana»: dissabte i diumenge, de 9:23 a 20:23,
amb el mode `cap-de-setmana`. La prova ha tornat 204 i ha engegat el robot.
Les tasques del dilluns i del dijous encara no estan creades.

## Costos
cron-job.org és gratuït. Les actualitzacions de dades es publiquen a GitHub Pages i no gasten
crèdits de Netlify (vegeu `eines/netlify_ignora.sh`).
