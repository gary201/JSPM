/* =====================================================================
   JSPM — configuració de la web
   Aquí NO hi ha contrasenyes ni claus secretes (aquest fitxer és públic).
   ===================================================================== */
window.JSPM_CONFIG = {
  // Adreça pública de la web (s'usa per compartir enllaços i per al SEO).
  url: "https://www.jspm.es",

  // Formulari de preinscripció.
  //  Vegeu docs/SERVEIS-EXTERNS.md.
  //  servei: "correu"  → (per defecte) prepara un correu que la família envia.
  //          "netlify" → Netlify Forms (quan la web estigui publicada a Netlify;
  //                      el formulari ja té l'atribut data-netlify). Recomanat.
  //          "endpoint"→ envia a l'adreça d'endpoint (Formspree, servidor propi…).
  formulari: { servei: "correu", endpoint: "" },

  // Instagram automàtic amb Behold (behold.so, pla gratuït: s'actualitza un cop al dia).
  //  Enganxeu aquí l'adreça del «JSON feed» (https://feeds.behold.so/XXXX) i executeu
  //  python3 eines/construeix.py. Buit = es mostra la instantània d'insta.js.
  //  Vegeu docs/SERVEIS-EXTERNS.md.
  instagram: { behold: "" },

  // Dades que s'actualitzen soles (partits, fitxes dels partits, botiga, Instagram) servides des de
  //  GitHub Pages, perquè s'actualitzin sense haver de tornar a publicar la web a Netlify
  //  (cada publicació a Netlify gasta crèdits del pla gratuït). Exemple:
  //  "https://USUARI.github.io/NOM-DEL-REPOSITORI/"   Buit = s'usen les còpies de la mateixa web.
  //  Vegeu docs/ACTIVAR-GITHUB.md.
  dades: "",

  // Correu on arriben les preinscripcions quan no hi ha servidor.
  email: "olotjspm@gmail.com",

  // Durada aproximada dels partits (minuts) per afegir-los al calendari.
  durada: { "Futbol 7": 75, "Futbol 11": 105, "Primer equip": 120 }
};
