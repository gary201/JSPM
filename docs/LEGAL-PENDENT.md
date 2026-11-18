# Punts que necessiten validació legal abans de publicar

La web inclou esborranys de **política de privacitat**, **avís legal** i **política de
cookies** (`/privacitat/`, `/avis-legal/`, `/cookies/`). No són assessorament legal: els ha de
revisar el club o un assessor en protecció de dades. Els textos marcats com a esborrany a la
web (requadre destacat en blau clar) s'han de treure quan estiguin validats (fitxers `src/pagines/*.html`,
després `python3 eines/construeix.py`).

## Dades que falten
- [ ] **NIF** del club (privacitat i avís legal).
- [ ] **Número del Registre d'Entitats Esportives** de la Generalitat (avís legal).
- [ ] Nom legal exacte de l'entitat (ara: «Club de Futbol Joventut Sant Pere Màrtir»).
- [ ] **Data de publicació** de la política («Darrera actualització»).

## Decisions que ha de prendre el club
- [ ] **Termini de conservació** de les preinscripcions sense inscripció (proposat: 12 mesos).
- [ ] **Encarregats del tractament**: servei de correu (Gmail/Google), i si s'activen,
      Netlify (formularis, panell, allotjament) o Formspree. Si són fora de l'EEE, verificar
      les garanties de transferència (clàusules contractuals tipus / marc UE-EUA).
- [ ] **Autoritzacions d'imatge** dels jugadors menors: confirmar que es recullen en fer la
      fitxa i que cobreixen la web. Les fotos d'equip i la galeria en depenen.
- [ ] **Noms dels jugadors a les fitxes dels partits** (decisió del club, 18/11/2026):
      **Sènior** (adults): nom i cognom. **Equips de base** (menors): només nom i inicial del cognom
      (p. ex. «Pau P.»); el cognom sencer no es publica enlloc. Confirmar que les famílies n'estan
      informades (p. ex. a l'autorització que signen en fer la fitxa) i que els jugadors del Sènior també.
      Per posar el nom complet en un equip de menors cal autorització escrita de **totes** les famílies
      de l'equip (opció «Es poden publicar els noms complets» al panell, Equips).
- [ ] **Fitxes dels partits**: es generen a partir de l'acta pública de la FCF. Només es guarden
      dades del JSPM (dels rivals, només el minut dels gols, com a «gol en contra»). Incloure-ho a la
      política de privacitat (finalitat: informació esportiva del club; font: FCF).
- [ ] **Telèfons publicats** a Contacte (President, Secretari, Coordinador, amb nom):
      confirmar que cadascú ha autoritzat publicar-los o substituir-los per un telèfon/correu del club.
- [ ] **Edat de consentiment**: el text aplica l'art. 7 LOPDGDD (14 anys). El formulari demana
      que el pare/mare/tutor l'enviï per a **tots** els menors de 18 (criteri més prudent); validar-ho.
- [ ] Contingut de la **primera capa** d'informació al formulari (responsable, finalitat,
      base jurídica, drets, enllaç a la política).
- [ ] Condicions d'ús de les dades de la **FCF** (resultats i escuts d'altres clubs) i de
      **TC Equipacions** (preus i fotos): demanar-ne conformitat per escrit.
- [ ] Si s'activa Instagram amb **Behold**: afegir-lo a la política de privacitat (les fotos i el feed
      es carreguen des dels seus servidors, que reben l'adreça IP del visitant).
- [ ] Si s'activa el panell: editors amb accés a dades de menors → compromís de confidencialitat.

## Ja resolt a la web
- Consentiments separats: (1) tractament per a la preinscripció — obligatori;
  (2) declaració de pare/mare/tutor si el jugador és menor — obligatori en aquest cas;
  (3) comunicacions del club — opcional, desmarcat per defecte.
- Informació bàsica de protecció de dades just abans d'enviar, amb enllaç a la política.
- El formulari no desa res al navegador ni en cap base de dades pròpia; anti-spam sense
  galetes (camp parany + temps mínim).
- Cap galeta ni analítica; l'única dada local és la preferència d'idioma (explicada a /cookies/).
- Sense dades de jugadors publicades per defecte.
