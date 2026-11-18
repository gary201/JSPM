/* =====================================================================
   DETALL DELS PARTITS — script per al navegador (pàgina de fcf.cat)
   ---------------------------------------------------------------------
   El fa servir la tasca programada de l'ordinador ("Actualitzar partits
   JSPM") just després de generar window.__pjs (partits.js nou).
   La mateixa lògica en Python és a eines/partits_detall.py (GitHub).

   Abans d'executar-lo cal substituir:
     __PERMIS__  {"a-3cat":true,...}  equips amb "mostrar_jugadors" (dades/equips.json)
     __INDEX__   l'objecte de partits-detall/<temporada>/index.js (el text des de la primera { fins
                 a l'última }, ambdues incloses), o {} si el fitxer no existeix

   Baixa: partits jugats sense detall (fins a 60 dies després), detalls d'un partit al qual
   la FCF ha canviat el resultat, i detalls d'equips als quals ha canviat el permís de noms.

   Protecció de dades: només es guarden dades del JSPM. Dels rivals,
   només el minut dels gols ("gol en contra"). Noms dels jugadors del
   JSPM: complets als equips amb permís (PERMIS, ara el Sènior); a la
   resta, només nom i inicial del cognom ("PAU P."), noms = 2.

   Resultat: window.__det = JSON {"partits-detall/<temporada>/<eq>-<j>.js": "text del fitxer", ...}
   (inclou index.js actualitzat si hi ha fitxes noves o resultats nous). Al resum, resultatsNous
   diu si partits.js té resultats diferents dels de l'última publicació (empremta "resultats" de l'índex) i window.__detgz = el mateix en gzip+base64.
   S'executa en segon pla (pot trigar uns minuts: baixa les pàgines d'una en una, mai
   en paral·lel, per no sobrecarregar la FCF). Retorna 'iniciat'; quan acaba, window.__detRes té el resum
   (JSON amb el SHA-1 de window.__det per verificar la còpia) o el text 'ERROR …'.
   ===================================================================== */
window.__detRes=null;window.__det=null;window.__detgz=null;(async()=>{try{
const PERMIS=__PERMIS__, INDEX0=__INDEX__, MAX=80;
const extreu=function(doc,casa,noms){
  const T=e=>(e&&e.textContent||'').replace(/\s+/g,' ').trim();
  const grid=[...doc.querySelectorAll('div')].find(x=>(x.getAttribute('class')||'').includes('lg:grid-cols-12'));
  if(!grid||grid.children.length<3)return null;
  const cols=[...grid.children];
  const esNostre=c=>{const a=c.querySelector('a[href*="/clubs/joventut-sant-pere-martir/"]');if(a)return true;const im=c.querySelector('h3')&&c.querySelector('img[alt]');return !!(im&&/^JOVENTUT SANT PERE MARTIR/.test(im.getAttribute('alt')))};
  const nostra=esNostre(cols[0])?cols[0]:(esNostre(cols[2])?cols[2]:null);
  const icona=el=>{
    const t=el.querySelector('[title]');if(t){const v=t.getAttribute('title');if(/doble/i.test(v))return 'yy';if(/groga/i.test(v))return 'y';if(/vermella/i.test(v))return 'r';}
    const fills=[...el.querySelectorAll('circle')].map(c=>(c.getAttribute('fill')||'').toUpperCase());
    if(fills.includes('#F30000'))return 'pp';if(fills.includes('#82E4FF'))return 'gp';if(fills.includes('#00FF73'))return 'g';
    const st=[...el.querySelectorAll('path')].map(p=>(p.getAttribute('stroke')||'').toUpperCase());
    if(st.includes('#007AFF'))return 'e';if(st.includes('#E50011'))return 's';
    return '';};
  const minut=s=>{const m=String(s).match(/(\d+(?:\s*\+\s*\d+)?)/);return m?m[1].replace(/\s+/g,''):''};
  const caixa=(col,nom)=>{const h=[...col.querySelectorAll('h3')].find(x=>T(x)===nom);return h?h.parentElement.parentElement:null};
  const jugadors=nom=>{const b=nostra&&caixa(nostra,nom);if(!b||!b.children[1])return [];
    return [...b.children[1].children].map(r=>{const a=r.children[0];if(!a)return null;
      const ns=[...a.querySelectorAll('span[title]')].filter(s=>s.getAttribute('title')!=='Capità');if(!ns.length)return null;
      const dors=[...a.querySelectorAll('span')].find(s=>/^\d+$/.test(T(s)));
      const cap=a.querySelector('span[title="Capità"]')?1:0;
      const ev=r.children[1]?[...r.children[1].children].map(x=>{const c=icona(x);return c?[minut(T(x.querySelector('span'))),c]:null}).filter(Boolean):[];
      return [dors?T(dors):'',noms?ns[0].getAttribute('title').replace(/\s+/g,' ').trim():'',cap,ev]}).filter(Boolean)};
  const tit=jugadors('TITULARS'),sup=jugadors('SUPLENTS');
  const gols=[];const gb=caixa(cols[1],'GOLS');let pl=0,pv=0;
  if(gb&&gb.children[1])[...gb.children[1].children].forEach(r=>{
    const sc=[...r.querySelectorAll('span')].map(T).find(x=>/^\d+\s*-\s*\d+$/.test(x));if(!sc)return;
    const [l,v]=sc.split('-').map(x=>+x.trim());
    let local=null;if(l===pl+1&&v===pv)local=true;else if(v===pv+1&&l===pl)local=false;
    pl=l;pv=v;
    let nostre;if(local!==null)nostre=(local===!!casa);else{const im=r.querySelector('img[alt]');nostre=!!(im&&/^JOVENTUT SANT PERE MARTIR/.test(im.getAttribute('alt')))}
    const mi=minut(([...r.querySelectorAll('span')].map(T).find(x=>/^\(.*\)$/.test(x)))||'');
    const tipus=icona(r)||'g';
    const g=[mi,nostre?1:0,tipus];
    if(nostre&&tipus!=='pp'){const d=[...r.querySelectorAll('span')].map(T).find(x=>/^\d+$/.test(x));const n=r.querySelector('span[title]');g.push(d||'',noms&&n?n.getAttribute('title').replace(/\s+/g,' ').trim():'')}
    gols.push(g)});
  if(!tit.length&&!sup.length&&!gols.length)return null;
  let camp='';const ca=[...doc.querySelectorAll('a[href*="/camps/"]')].find(a=>/^ESTADI\b/.test(T(a)));if(ca)camp=T(ca).replace(/^ESTADI:?\s*/,'');
  return {v:1,noms:noms?1:0,camp,gols,tit,sup};
};
const PART=/^(DE|DEL|DELS|LA|LES|EL|ELS|I|Y|D'|L'|DA|DO|DOS|DAS|VAN|VON|DER)$/i;
const inicial=s=>{const p=String(s).split(',');if(p.length<2){const ws=String(s).trim().split(/\s+/).filter(Boolean);if(ws.length<2)return s;const rs=ws.slice(1).filter(w=>!PART.test(w));return rs.length?rs[0].slice(0,1)+'., '+ws[0]:ws[0]}const cg=p[0].trim().split(/\s+/).filter(w=>w&&!PART.test(w));const w=cg[0]||p[0].trim();return w.slice(0,1)+'., '+p.slice(1).join(',').trim()};
const abreuja=det=>{det.tit.concat(det.sup).forEach(j=>{if(j[1])j[1]=inicial(j[1])});det.gols.forEach(g=>{if(g.length>4&&g[4])g[4]=inicial(g[4])});det.noms=2;return det};
const P=JSON.parse(window.__pjs.slice(window.__pjs.indexOf('{',window.__pjs.indexOf('window.JSPM_PARTITS')),window.__pjs.lastIndexOf('}')+1));
const TEMP=P.temporada, avui=new Date(), CAP="/* Detall del partit a partir de l'acta de la FCF. Generat automàticament (eines/partits_detall.py o tasca de l'ordinador). */\n";
const IDX=Object.assign({},(INDEX0&&INDEX0.temporada===TEMP&&INDEX0.partits)||{});
const pend=[];
for(const eq of P.equips){if(!/^\d{4}-\d{4}\//.test(eq.g||''))continue;
  for(const r of eq.m){const [j,,casa,res,data,,slug]=r;if(!res||!slug||/^\d+$/.test(slug))continue;
    const ara=IDX[eq.id+'-'+j], n=PERMIS[eq.id]?1:2;
    if(ara&&ara[0]===res&&ara[1]===n)continue;
    if(!ara&&data&&(avui-new Date(data+'T12:00:00'))/864e5>60)continue;
    pend.push([eq.id,j,casa,n,'/ca/partit/'+eq.g+'/jornada-'+j+'/'+slug,res]);}}
const files={},fets=[],senseActa=[],errors=[];
for(const [id,j,casa,nivell,url,res] of pend.slice(0,MAX)){
  try{const rs=await fetch(url);if(!rs.ok)throw new Error('HTTP '+rs.status);
    const det=extreu(new DOMParser().parseFromString(await rs.text(),'text/html'),casa,true);
    if(!det){senseActa.push(id+' J'+j);continue}
    if(nivell===2)abreuja(det);
    det.res=res; IDX[id+'-'+j]=[res,det.noms];
    files['partits-detall/'+TEMP+'/'+id+'-'+j+'.js']=CAP+'(window.JSPM_DETALLS=window.JSPM_DETALLS||{})['+JSON.stringify(id+'/'+j)+']='+JSON.stringify(det)+';\n';
    fets.push(id+' J'+j);
  }catch(e){errors.push(id+' J'+j+' ('+e.message+')')}}
const sha=async s=>{const b=await crypto.subtle.digest('SHA-1',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const SIG=(await sha(P.equips.map(e=>e.m.filter(r=>r[3]).map(r=>e.id+'-'+r[0]+':'+r[3]).join('|')).join('|'))).slice(0,12);
const canvis=!(INDEX0&&INDEX0.temporada===TEMP&&INDEX0.resultats===SIG);
if(fets.length||canvis){const o={};Object.keys(IDX).sort().forEach(k=>{o[k]=IDX[k]});files['partits-detall/'+TEMP+'/index.js']="/* Índex dels detalls de partits (resultat de l'acta baixada i permís de noms). Generat automàticament. */\nwindow.JSPM_DETALLS_INDEX="+JSON.stringify({partits:o,resultats:SIG,temporada:TEMP})+';\n';}
window.__det=JSON.stringify(files);
const gz=async s=>{const cs=new CompressionStream('gzip');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();const b=new Uint8Array(await new Response(cs.readable).arrayBuffer());let t='';for(let i=0;i<b.length;i+=8192)t+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(t)};
window.__detgz=await gz(window.__det);
window.__detRes=JSON.stringify({temporada:TEMP,resultatsNous:canvis,fets,senseActa,errors,pendentsPerDespres:Math.max(0,pend.length-MAX),fitxers:Object.keys(files).length,sha1:await sha(window.__det),gzLen:window.__detgz.length});
}catch(e){window.__detRes='ERROR '+e.message}})();
'iniciat'
