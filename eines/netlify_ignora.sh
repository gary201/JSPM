#!/bin/bash
# Netlify executa aquest script abans de cada publicació (netlify.toml → ignore).
#   exit 0 → Netlify NO publica (no gasta crèdits)
#   exit 1 → Netlify publica normalment
# No es publica quan l'únic que ha canviat són dades que la web ja llegeix des de GitHub Pages
# (js/config.js → dades): partits, fitxes dels partits, botiga, Instagram (text) i escuts.
# Així les actualitzacions automàtiques (cada dilluns i cada hora els caps de setmana) no gasten
# crèdits de Netlify. Tampoc quan només canvien el robot (.github/) o la documentació (docs/),
# que no formen part de la web. Qualsevol altre canvi (panell, disseny, textos…) es publica com sempre.
grep -q 'dades: *"https' js/config.js || exit 1
[ -n "$CACHED_COMMIT_REF" ] && [ -n "$COMMIT_REF" ] && [ "$CACHED_COMMIT_REF" != "$COMMIT_REF" ] || exit 1
canvis=$(git diff --name-only "$CACHED_COMMIT_REF" "$COMMIT_REF" 2>/dev/null) || exit 1
[ -n "$canvis" ] || exit 1
if echo "$canvis" | grep -vqE '^(partits\.js|botiga\.js|insta\.js|partits-detall/|img/escuts/|\.github/|docs/)'; then exit 1; fi
echo "Només han canviat dades que la web llegeix de GitHub Pages: no cal tornar a publicar a Netlify."
exit 0
