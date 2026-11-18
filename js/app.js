/* =====================================================================
   JSPM — lògica de la web (navegació, idiomes, partits, equips, botiga…)
   Les dades són a: partits.js, botiga.js, insta.js (s'actualitzen soles)
   i dades/club.js (equips, patrocinadors, galeria, contacte).
   ===================================================================== */

(function(){
"use strict";
/* ---------- Idiomes (català · castellà) ----------
   El text de la web és en català. Per al castellà es fa servir
   el diccionari JSPM_I18N (i18n.js): clau = text català, valor = traducció. */
var IDIOMES=["ca","es"], LOCS={ca:"ca-ES",es:"es-ES"};
var I18N=window.JSPM_I18N||{es:{}};
var LANG=(function(){try{var l=localStorage.getItem("jspm-idioma");if(IDIOMES.indexOf(l)>=0)return l;}catch(e){}return "ca";})();
var CAT={
  es:{"Primera Divisió":"Primera División","Segona Divisió":"Segunda División","Tercera Catalana":"Tercera Catalana","Grup":"Grupo","Prebenjamí":"Prebenjamín","Benjamí":"Benjamín","Aleví":"Alevín","Infantil":"Infantil","Cadet":"Cadete","Juvenil":"Juvenil","Sènior":"Sénior","Masculí":"Masculino","Escoleta":"Escuelita"}
};
var RE_CAT=/^(JSPM · )?((Primera|Segona) Divisió|Tercera Catalana|Prebenjamí|Benjamí|Aleví|Infantil|Cadet|Juvenil|Sènior|Masculí|Escoleta|S\d+|[A-D]|Grup|\d+|·|\s)+$/;
function trCat(s){
  var m=CAT[LANG], t=s;
  ["Primera Divisió","Segona Divisió","Tercera Catalana"].forEach(function(k){t=t.split(k).join("\u0001"+k+"\u0001");});
  t=t.split("\u0001").map(function(part){
    if(m[part])return m[part];
    return part.split(" ").map(function(w){
      return m[w]||w;
    }).join(" ");
  }).join("");
  return t.replace(/\s+/g," ").replace(/^ | $/g,"").replace(/· ·/g,"·");
}
function trNom(x){if(LANG==="ca")return x;var d=I18N[LANG]||{};return Object.prototype.hasOwnProperty.call(d,x)?d[x]:trCat(x);}
var REGLES=[
  [/^Proper partit · J(\d+)$/,{es:"Próximo partido · J$1"}],
  [/^(\d+) producte$/,{es:"$1 producto"}],
  [/^(\d+) productes$/,{es:"$1 productos"}],
  [/^Dades de la Federació Catalana de Futbol, actualitzades el (.+)\.$/,{es:"Datos de la Federació Catalana de Futbol, actualizados el $1."}],
  [/^Foto (\d+)$/,{es:"Foto $1"}],
  [/^(.+) · (\d+(?:\+\d+)?’)$/,{es:function(m){return tr(m[1])+" · "+m[2];}}],
  [/^Foto de l'equip (.+)$/,{es:function(m){return "Foto del equipo "+trNom(m[1]);}}],
  [/^a ([A-ZÀ-Ý].*)$/,{es:"en $1"}],
  [/^(\d+) resultats$/,{es:"$1 resultados"}],
  [/^(\d+) partits per jugar$/,{es:"$1 partidos por jugar"}],
  [/^Veure els (\d+) partits$/,{es:"Ver los $1 partidos"}],
  [/^A casa · J(\d+)$/,{es:"En casa · J$1"}],
  [/^A fora · J(\d+)$/,{es:"Fuera · J$1"}],
  [/^(\d{4}) o abans$/,{es:"$1 o antes"}],
  [/^(\d{4}) o després$/,{es:"$1 o después"}],
  [/^(\d{4}) i (\d{4})$/,{es:"$1 y $2"}],
  [/^(\d{4}), (\d{4}) i (\d{4})$/,{es:"$1, $2 y $3"}],
  [/^Nascuts el (\d{4})$/,{es:"Nacidos en $1"}],
  [/^Nascuts el (\d{4}) o abans$/,{es:"Nacidos en $1 o antes"}],
  [/^Nascuts el (\d{4}) o després$/,{es:"Nacidos en $1 o después"}],
  [/^Nascuts entre el (\d{4}) i el (\d{4})$/,{es:"Nacidos entre $1 y $2"}],
  [/^Entrenador: (.+)$/,{es:"Entrenador: $1"}],
  [/^Amplia la foto de l'equip (.+)$/,{es:function(m){return "Ampliar la foto del equipo "+trNom(m[1]);}}],
  [/^Foto de l'equip (.+) del Joventut Sant Pere Màrtir$/,{es:function(m){return "Foto del equipo "+trNom(m[1])+" del Joventut Sant Pere Màrtir";}}],
  [/^Actualitzada el (.+)$/,{es:"Actualizada el $1"}],
  [/^Els preus es van revisar el (.+) i podrien haver canviat: el preu vàlid és el de la botiga de TC Equipacions\.$/,{es:"Los precios se revisaron el $1 y podrían haber cambiado: el precio válido es el de la tienda de TC Equipacions."}],
  [/^Amplia la foto: (.+)$/,{es:function(m){return "Ampliar la foto: "+tr(m[1]);}}],
  [/^Veure el producte: (.+)$/,{es:function(m){return "Ver el producto: "+tr(m[1]);}}],
  [/^Per l'any de naixement li correspon: (.+) \((.+)\)$/,{es:function(m){return "Por el año de nacimiento le corresponde: "+trNom(m[1])+" ("+tr(m[2])+")";}}],
  [/^Segons l'any de naixement, per a la temporada (\S+) \(categories de la Federació Catalana de Futbol\)\.$/,{es:"Según el año de nacimiento, para la temporada $1 (categorías de la Federació Catalana de Futbol)."}],
  [/^Aquesta web encara no té cap servidor per rebre formularis: en prémer el botó et prepararem un correu amb totes les dades per enviar-lo a (\S+)\. No s'envia res fins que tu l'enviïs\.$/,{es:"Esta web todavía no tiene ningún servidor para recibir formularios: al pulsar el botón te prepararemos un correo con todos los datos para enviarlo a $1. No se envía nada hasta que tú lo envíes."}]
];
/* Textos sense traducció (per revisar-los: a la consola, JSPM_PENDENTS) */
var PENDENTS=window.JSPM_PENDENTS={};
function tr(s){
  if(LANG==="ca"||!s)return s;
  var k=s.replace(/\s+/g," ").trim(); if(!k)return s;
  var lead=s.match(/^\s*/)[0], trail=s.match(/\s*$/)[0], D_=I18N[LANG]||{}, r=null;
  if(Object.prototype.hasOwnProperty.call(D_,k))r=D_[k];
  else if(RE_CAT.test(k)&&/(Divisió|Catalana|Prebenjamí|Benjamí|Aleví|Infantil|Cadet|Juvenil|Sènior|Masculí|Escoleta|Grup|\bS\d+)/.test(k))r=trCat(k);
  else for(var i=0;i<REGLES.length;i++){var m=k.match(REGLES[i][0]);if(m){var v=REGLES[i][1][LANG];r=typeof v==="function"?v(m):k.replace(REGLES[i][0],v);break;}}
  if(r===null&&/[a-zà-ÿ]{3}/i.test(k))PENDENTS[k]=1;
  return r===null?s:lead+r+trail;
}
var ORIG=new WeakMap(), ORIGA=new WeakMap(), ATTRS=["alt","title","aria-label","placeholder","data-titol"], traduint=false, obs=null;
function noTr(el){return !el||el.closest("script,style,[translate=no]");}
function trText(n){
  if(!ORIG.has(n))ORIG.set(n,n.nodeValue);
  var o=ORIG.get(n), v=LANG==="ca"?o:tr(o);
  if(n.nodeValue!==v)n.nodeValue=v;
}
function trAttrs(el){
  var o=ORIGA.get(el); if(!o){o={};ORIGA.set(el,o);}
  ATTRS.forEach(function(a){
    if(!el.hasAttribute(a))return;
    if(!(a in o))o[a]=el.getAttribute(a);
    var v=LANG==="ca"?o[a]:tr(o[a]); if(el.getAttribute(a)!==v)el.setAttribute(a,v);
  });
}
function traduir(root){
  traduint=true;
  if(root.nodeType===3){if(!noTr(root.parentElement))trText(root);}
  else if(root.nodeType===1&&!noTr(root)){
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.nodeValue.trim()&&!noTr(n.parentElement)?1:2;}}), n;
    while((n=w.nextNode()))trText(n);
    trAttrs(root); root.querySelectorAll("[alt],[title],[aria-label],[placeholder],[data-titol]").forEach(function(e){if(!noTr(e))trAttrs(e);});
  }
  if(obs)obs.takeRecords();
  traduint=false;
}
function observa(){
  obs=new MutationObserver(function(muts){
    if(traduint)return;
    muts.forEach(function(m){
      if(m.type==="childList")m.addedNodes.forEach(function(n){traduir(n);});
      else if(m.type==="characterData"){ORIG.set(m.target,m.target.nodeValue);traduir(m.target);}
      else if(m.type==="attributes"){var o=ORIGA.get(m.target);if(o){o[m.attributeName]=m.target.getAttribute(m.attributeName);}traduir(m.target);}
    });
  });
  obs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});
}
var fmtDia,fmtCurt,fmtSem;
function fmts(){var L=LOCS[LANG];
  fmtDia=new Intl.DateTimeFormat(L,{weekday:"long",day:"numeric",month:"long"});
  fmtCurt=new Intl.DateTimeFormat(L,{day:"numeric",month:"short"});
  fmtSem=new Intl.DateTimeFormat(L,{weekday:"short"});}
fmts();
function marcaIdioma(){
  document.documentElement.lang=LANG;
  document.querySelectorAll(".idiomes button[data-idioma]").forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-idioma")===LANG?"true":"false");});
}
function canviaIdioma(l){
  if(IDIOMES.indexOf(l)<0||l===LANG)return;
  LANG=l; try{localStorage.setItem("jspm-idioma",l);}catch(e){}
  fmts(); marcaIdioma();
  pintaEquips(); pintaPat(); pintaBotiga(); pintaGaleria(); pintaInsta(); pintaPartitsInici(); pintaNoticies(); font();
  if(PAGINA==="partits")pintaPartits(partitsActual()); pintaPaginaEquip(); pintaPartit();
  traduir(document.body); titolPagina(); ajustaMenu();
}

var CLUB = window.JSPM_CLUB || {equips:[],staff:[],patrocinadors:[],galeria:[],galeria_portada:[],avisos:[]};
var CFG = window.JSPM_CONFIG || {};
var D = window.JSPM_PARTITS || {equips:[],escuts:[]};
/* Si una categoria només té un equip, no cal la lletra: "Sènior A" → "Sènior" */
(function(){D.equips.forEach(function(eq){var m=String(eq.nom).match(/^(.*) A$/);
  if(m&&!D.equips.some(function(o){return o!==eq&&String(o.nom).indexOf(m[1]+" ")===0;}))eq.nom=m[1];});})();
var FOTOS = "img/equips/";
var PAT = "img/patrocinadors/";
var ESCUTS = "https://files.fcf.cat/escudos/clubes/escudos/";
var FCF = "https://www.fcf.cat";

/* ---------- Equips del club ---------- */
var EQUIPS = CLUB.equips;

var PATROCINADORS = CLUB.patrocinadors;

/* ---------- Utilitats ---------- */
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function perId(id){for(var i=0;i<D.equips.length;i++){if(D.equips[i].id===id)return D.equips[i];}return null;}
function dataLocal(s){if(!s)return null;var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function avuiZero(){var d=new Date();d.setHours(0,0,0,0);return d;}
function cap1(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function diaLlarg(d){return cap1(fmtDia.format(d).replace(",",""));}

var ACCENTS = {"Besalu":"Besalú","Cornella":"Cornellà","Sarria":"Sarrià","Girones":"Gironès","Bescano":"Bescanó","Cassa":"Cassà","Castello":"Castelló","Fundacio":"Fundació","Bascara":"Bàscara","Campdevanol":"Campdevànol","Girones-Sabat":"Gironès-Sabat"};
var MINUS = {"De":"de","Del":"del","I":"i","D'en":"d'en","D'":"d'"};
function titol(w){
  if(w==="GEiEG")return w;
  if(/^(SAD|EFC|FEC|AEC|FC|CF|UE|AE|CE|CP|UD|AT)$/.test(w))return w;
  return w.split("-").map(function(part){
    return part.split("'").map(function(seg,i,arr){
      var t=seg.charAt(0).toUpperCase()+seg.slice(1).toLowerCase();
      if(i===0&&arr.length>1&&seg.length<=2)return seg.charAt(0).toUpperCase()+seg.slice(1).toLowerCase();
      return t;
    }).join("'");
  }).join("-");
}
function nomRival(raw){
  var s=String(raw).replace(/\s+/g," ").trim(), lletra="";
  var m=s.match(/^(.*?)\s*"([A-Z])"$/); if(m){s=m[1];lletra=m[2];}
  s=s.replace(/\s+,/g,",");
  var parts=s.split(/,\s*/), pref="";
  if(parts.length===2){
    var suf=parts[1].replace(/\./g,"").trim();
    if(suf.replace(/\s/g,"").length>1){pref=suf.replace(/\s+/g," ").toUpperCase();}
    s=parts[0];
  }
  var paraules=s.split(" ").map(function(w,i){
    if(/^[A-Z]\.$/.test(w))return w;
    var t=titol(w);
    if(ACCENTS[t])t=ACCENTS[t];
    if(i>0&&MINUS[t])t=MINUS[t];
    if(i>0&&/^D'En$/i.test(t))t="d'en";
    if(i>0&&/^L'/.test(t))t="l'"+t.slice(2);
    return t;
  });
  if(paraules[0]&&/^l'/.test(paraules[0]))paraules[0]="L'"+paraules[0].slice(2);
  var nom=(pref?pref.split(" ").map(function(x){return x==="SAD"?"SAD":x;}).join(" ")+" ":"")+paraules.join(" ");
  return {nom:nom, lletra:(lletra&&lletra!=="A")?lletra:""};
}
function sigles(nom){var w=nom.replace(/^(CF|FC|UE|AE|CE|CP|UD|AT|EFC|FEC|AEC|UE SAD)\s+/,"").split(/[\s-]+/).filter(function(x){return x&&!/^(de|del|d'en|i|l')$/i.test(x);});return (w[0]?w[0][0]:"")+(w[1]?w[1][0]:"");}

function partitObj(eq,r){
  var gol=null,res="";
  if(r[3]&&/^\d+-\d+$/.test(r[3])){
    var p=r[3].split("-").map(Number); var nos=r[2]?p[0]:p[1], ells=r[2]?p[1]:p[0];
    gol={nos:nos,ells:ells,local:p[0],visit:p[1]}; res=nos>ells?"V":(nos<ells?"D":"E");
  }
  var rv=nomRival(r[1]);
  return {eq:eq,j:r[0],rival:rv.nom,lletra:rv.lletra,casa:!!r[2],marcador:r[3]||"",data:dataLocal(r[4]),dataTxt:r[4],hora:r[5]||"",acta:r[6],escut:(typeof r[7]==="number"&&D.escuts[r[7]])?"img/escuts/"+D.escuts[r[7]].replace(/\.[a-z]+$/i,"").replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".webp":"",escutRemot:(typeof r[7]==="number"&&D.escuts[r[7]])?ESCUTS+encodeURIComponent(D.escuts[r[7]]):"",gol:gol,res:res};
}
/* Estat de cada partit: jugat · pendent · ajornat · pendent de resultat · sense data.
   Les correccions i els amistosos es gestionen a dades/partits-manuals.json (panell). */
function estatPartit(p){var avui=avuiZero();if(p.gol)return "jugat";if(p.ajornat)return "ajornat";if(!p.data)return "sense-data";return p.data<avui?"pendent-resultat":"pendent";}
function tots(eq){
  var l=eq.m.map(function(r){return partitObj(eq,r);});
  (CLUB.correccions||[]).forEach(function(c){if(c.equip!==eq.id)return;l.forEach(function(p){if(String(p.j)!==String(c.jornada))return;
    if(c.estat==="ajornat")p.ajornat=true; if(c.data){p.data=dataLocal(c.data);p.dataTxt=c.data;} if(c.hora)p.hora=c.hora; if(c.lloc)p.llocManual=c.lloc; if(c.nota)p.nota=c.nota;});});
  (CLUB.amistosos||[]).forEach(function(x,k){if(x.equip!==eq.id||!x.data)return;var rv=nomRival(x.rival||"");
    var gol=null,res="";if(/^\d+-\d+$/.test(x.resultat||"")){var g=x.resultat.split("-").map(Number),nos=x.casa?g[0]:g[1],ells=x.casa?g[1]:g[0];gol={nos:nos,ells:ells,local:g[0],visit:g[1]};res=nos>ells?"V":(nos<ells?"D":"E");}
    l.push({eq:eq,j:"A"+(k+1),amistos:true,rival:rv.nom,lletra:rv.lletra,casa:!!x.casa,marcador:x.resultat||"",data:dataLocal(x.data),dataTxt:x.data,hora:x.hora||"",acta:"",escut:"",escutRemot:"",gol:gol,res:res,llocManual:x.lloc||"",nota:x.nota||""});});
  l.forEach(function(p){p.estat=estatPartit(p);});
  return l;
}
function perData(a,b){var x=a.data?a.data.getTime():Infinity,y=b.data?b.data.getTime():Infinity;if(x!==y)return x-y;return (a.hora||"").localeCompare(b.hora||"");}

function escutHTML(p){
  var ini=esc(sigles(p.rival).toUpperCase());
  if(!p.escut)return '<span class="esc" aria-hidden="true"><i>'+ini+'</i></span>';
  return '<span class="esc" aria-hidden="true"><img src="'+esc(p.escut)+'" data-remot="'+esc(p.escutRemot)+'" data-ini="'+ini+'" alt="" loading="lazy" data-err="escut"></span>';
}
function rivalHTML(p,sub){
  return '<div class="rival">'+escutHTML(p)+'<div class="nom"><span>'+(p.casa?"vs ":"a ")+'<b>'+esc(p.rival)+(p.lletra?" "+esc(p.lletra):"")+'</b></span>'+(sub?'<small>'+sub+'</small>':'')+'</div></div>';
}
function llocHTML(p){return p.casa?'<span class="lloc casa">Casa</span>':'<span class="lloc fora">Fora</span>';}
function nomRes(r){return {V:"Victòria",E:"Empat",D:"Derrota"}[r]||"";}
function chip(r){return r?'<span class="chip '+r+'" title="'+nomRes(r)+'">'+r+'</span>':"";}
/* Enllaç al partit a la FCF. Des del 18/11/2026 la FCF fa servir /ca/partit/<temporada>/<competició>/<grup>/jornada-N/<partit>;
   els números d'acta antics ja no obren res, així que no es mostren. */
function actaURL(p){var a=String(p.acta||"");
  if(!a||/^\d+$/.test(a))return "";
  if(a.charAt(0)==="/")return FCF+a;
  return p.eq&&p.eq.g&&/^\d{4}-\d{4}\//.test(p.eq.g)?FCF+"/ca/partit/"+p.eq.g+"/jornada-"+p.j+"/"+a:"";}
function grupURL(eq){return FCF+"/ca/competicio?grupId="+encodeURIComponent(eq.g)+"&competicioNom="+encodeURIComponent(eq.grup.toUpperCase());}
function equipURL(eq){return FCF+"/ca/clubs/joventut-sant-pere-martir/categories/joventut-sant-pere-martir-"+eq.id;}

/* ---------- Contacte (dades/contacte.json) ---------- */
function telVisible(t){var d=String(t).replace(/^\+34/,"").replace(/\D/g,"");return d.length===9?d.slice(0,3)+" "+d.slice(3,5)+" "+d.slice(5,7)+" "+d.slice(7):t;}
function pintaContacte(){
  var c=CLUB.contacte; if(!c)return;
  var ul=document.getElementById("telefons-contacte");
  if(ul&&c.telefons)ul.innerHTML=c.telefons.map(function(t){return '<li><span>'+esc(t.carrec)+' · '+esc(t.nom)+'</span><a class="tel num" href="tel:'+esc(t.tel)+'">'+esc(telVisible(t.tel))+'</a></li>';}).join("");
  var ad=document.getElementById("adreca-contacte"); if(ad&&c.adreca)ad.innerHTML=esc(c.adreca)+'<br>'+esc(c.cp+" "+c.poblacio)+(c.provincia?" ("+esc(c.provincia)+")":"");
  var em=document.getElementById("email-contacte"); if(em&&c.email){em.href="mailto:"+c.email;em.textContent=c.email;}
}

/* ---------- Avisos del club (es gestionen a dades/club.json → "avisos") ---------- */
function pintaNoticies(){
  var el=document.getElementById("noticies-inici"); if(!el)return;
  var av=(CLUB.noticies||[]).filter(function(x){var f=dataLocal(x.fins);return x.titol&&(!f||f>=avuiZero());}).sort(function(x,y){return String(y.data||"").localeCompare(String(x.data||""));}).slice(0,3);
  if(!av.length){el.hidden=true;return;}
  el.hidden=false;
  el.innerHTML='<div class="titol-bloc"><div><span class="etiqueta">Notícies</span><h2>Últimes notícies del club</h2></div>'+(CLUB.noticies.length>3?'<a class="enllac" href="noticies/">Totes les notícies →</a>':'')+'</div><div class="graella-avisos">'+av.map(function(x){
    var d=dataLocal(x.data), url=x.slug?"noticies/"+x.slug+"/":(x.enllac||"");
    return '<article class="avis">'+(x.imatge?'<img src="'+esc(rutaFoto(x.imatge))+'" alt="" loading="lazy" width="96" height="96">':'')+'<div><span class="etiqueta">'+(d?esc(diaLlarg(d)):"Notícia")+'</span><h3>'+(url?'<a href="'+esc(url)+'">'+esc(x.titol)+'</a>':esc(x.titol))+'</h3>'+(x.resum?'<p>'+esc(x.resum)+'</p>':'')+'</div></article>';
  }).join("")+'</div>';
}

/* ---------- URL de la pàgina de cada equip ---------- */
function equipPerFcf(id){return EQUIPS.filter(function(x){return x.fcf===id;})[0]||null;}
function urlEquip(id){var e=equipPerFcf(id);return e&&e.slug?"equips/"+e.slug+"/":"partits/#"+id;}

/* ---------- Partits: utilitats ---------- */
var ANY_FI=+(String(CLUB.temporada||D.temporada||"").split("-")[1])||(new Date().getFullYear()+1);
function catBase(nom){var c=String(nom||"").split(" ")[0];return c;}
/* Anys de naixement de cada categoria segons la temporada (categories FCF: S7 = sub-7, etc.) */
function textAnys(nom){
  var m=String(nom||"").match(/\bS(\d{1,2})\b/), c=catBase(nom);
  if(m)return "Nascuts el "+(ANY_FI-(+m[1]));
  if(c==="Juvenil")return "Nascuts entre el "+(ANY_FI-19)+" i el "+(ANY_FI-17);
  if(c==="Sènior")return "Nascuts el "+(ANY_FI-20)+" o abans";
  if(c==="Escoleta")return "Nascuts el "+(ANY_FI-6)+" o després";
  return "";
}
function durada(eq){var d=CFG.durada||{};return d[eq.bloc]||90;}
function llocPartit(p){
  var c=CLUB.contacte||{};
  if(p.llocManual)return {txt:p.llocManual,adreca:p.llocManual,url:"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p.llocManual),exacte:true};
  if(p.casa)return {txt:"Camp JSPM · Pic del Bac, 29 · Olot",adreca:(c.camp||"Camp JSPM")+", "+(c.adreca||"Carrer Pic del Bac, 29")+", "+(c.cp||"17800")+" "+(c.poblacio||"Olot"),url:c.mapa||"https://www.google.com/maps/search/?api=1&query=Camp+de+Futbol+Joventut+Sant+Pere+M%C3%A0rtir+Olot",exacte:true};
  return {txt:"Al camp del rival",adreca:"",url:"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent("camp de futbol "+p.rival),exacte:false};
}
function urlWeb(ruta){var u=(CFG.url||"").replace(/\/+$/,"");return u?u+"/"+ruta:location.href.split("#")[0]+"#"+ruta;}
function nomPartit(p){var r=p.rival+(p.lletra?" "+p.lletra:"");return p.casa?"JSPM "+p.eq.nom+" – "+r:r+" – JSPM "+p.eq.nom;}

/* ---------- Afegir al calendari (.ics) ---------- */
function icsData(d,h){var p=function(n){return (n<10?"0":"")+n;};return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+(h?"T"+h.replace(":","")+"00":"");}
function icsText(s){return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");}
function icsPartits(llista){
  var ara=new Date(), st=ara.toISOString().replace(/[-:]/g,"").replace(/\.\d+Z$/,"Z");
  var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Joventut Sant Pere Martir//Partits//CA","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    "BEGIN:VTIMEZONE","TZID:Europe/Madrid","BEGIN:DAYLIGHT","TZOFFSETFROM:+0100","TZOFFSETTO:+0200","TZNAME:CEST","DTSTART:19700329T020000","RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU","END:DAYLIGHT",
    "BEGIN:STANDARD","TZOFFSETFROM:+0200","TZOFFSETTO:+0100","TZNAME:CET","DTSTART:19701025T030000","RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU","END:STANDARD","END:VTIMEZONE"];
  llista.forEach(function(p){
    if(!p.data)return;
    var ll=llocPartit(p), fi;
    L.push("BEGIN:VEVENT","UID:"+(p.eq.id+"-"+p.j).replace(/[^a-z0-9-]/gi,"-")+"@jspm","DTSTAMP:"+st);
    if(/^\d{1,2}:\d{2}$/.test(p.hora)){
      var h=("0"+p.hora).slice(-5), ini=new Date(p.data); ini.setHours(+h.slice(0,2),+h.slice(3,5),0,0);
      fi=new Date(ini.getTime()+durada(p.eq)*60000);
      L.push("DTSTART;TZID=Europe/Madrid:"+icsData(p.data,h),"DTEND;TZID=Europe/Madrid:"+icsData(fi,("0"+fi.getHours()).slice(-2)+":"+("0"+fi.getMinutes()).slice(-2)));
    }else{
      fi=new Date(p.data); fi.setDate(fi.getDate()+1);
      L.push("DTSTART;VALUE=DATE:"+icsData(p.data),"DTEND;VALUE=DATE:"+icsData(fi));
    }
    L.push("SUMMARY:"+icsText("⚽ "+nomPartit(p)),"LOCATION:"+icsText(ll.adreca||ll.txt),"DESCRIPTION:"+icsText(p.eq.nom+" · "+p.eq.categoria+" · J"+p.j+"\n"+urlWeb("partits/#partits-"+p.eq.id)),"END:VEVENT");
  });
  L.push("END:VCALENDAR");
  return L.join("\r\n")+"\r\n";
}
function descarrega(nom,text,tipus){
  var b=new Blob([text],{type:tipus||"text/calendar;charset=utf-8"}), u=URL.createObjectURL(b), a=document.createElement("a");
  a.href=u;a.download=nom;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove();},800);
}
/* ---------- Compartir per WhatsApp ---------- */
function textWhatsApp(p){
  var ll=llocPartit(p), url=urlFitxa(p)?urlWeb(urlFitxa(p)):urlWeb("partits/#partits-"+p.eq.id);
  if(p.gol){
    var a=p.casa?["JSPM "+p.eq.nom,p.gol.local,p.rival+(p.lletra?" "+p.lletra:""),p.gol.visit]:[p.rival+(p.lletra?" "+p.lletra:""),p.gol.local,"JSPM "+p.eq.nom,p.gol.visit];
    return "⚽ "+tr("Resultat")+" · "+trNom(p.eq.nom)+"\n"+a[0]+" "+a[1]+" - "+a[3]+" "+a[2]+"\n"+tr("Jornada")+" "+p.j+" · "+diaLlarg(p.data)+"\n"+url;
  }
  return "⚽ "+nomPartit(p).replace(p.eq.nom,trNom(p.eq.nom))+"\n📅 "+(p.data?diaLlarg(p.data):tr("Data pendent"))+(p.hora?" · "+p.hora:"")+"\n📍 "+tr(ll.txt)+"\n"+url;
}
function waURL(p){return "https://wa.me/?text="+encodeURIComponent(textWhatsApp(p));}

/* ---------- Targeta de partit (pendent o jugat) ---------- */
var ICO_CAL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4M12 12.5v5M9.5 15h5"/></svg>';
var ICO_WA='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';
var ICO_MAPA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.6"/></svg>';
function accionsPartit(p,k){
  var ll=llocPartit(p), h='';
  if(!p.gol&&p.data&&p.data>=avuiZero())h+='<button type="button" class="acc" data-ics="'+esc(k)+'" title="Afegeix al calendari" aria-label="Afegeix al calendari">'+ICO_CAL+'<span>Calendari</span></button>';
  h+='<a class="acc wa" href="'+esc(waURL(p))+'" target="_blank" rel="noopener" title="Comparteix per WhatsApp" aria-label="Comparteix per WhatsApp">'+ICO_WA+'<span>WhatsApp</span></a>';
  if(!p.gol)h+='<a class="acc" href="'+esc(ll.url)+'" target="_blank" rel="noopener" title="'+(ll.exacte?"Com arribar":"Busca el camp al mapa")+'" aria-label="'+(ll.exacte?"Com arribar":"Busca el camp al mapa")+'">'+ICO_MAPA+'<span>'+(ll.exacte?"Com arribar":"Mapa")+'</span></a>';
  else if(urlFitxa(p))h+='<a class="acc acc-fitxa" href="'+esc(urlFitxa(p))+'" title="Gols, targetes i alineació" aria-label="Fitxa del partit: gols, targetes i alineació"><span class="acc-txt">Fitxa</span></a>';
  else if(actaURL(p))h+='<a class="acc" href="'+esc(actaURL(p))+'" target="_blank" rel="noopener" title="Acta del partit a la FCF" aria-label="Acta del partit a la FCF"><span class="acc-txt">Acta</span></a>';
  return '<div class="accions-pt">'+h+'</div>';
}
/* Fitxa del partit dins la web (partit/#equip/jornada): només partits de lliga ja jugats */
function urlFitxa(p){return p&&p.gol&&!p.amistos&&p.eq&&/^\d+$/.test(String(p.j))?"partit/#"+p.eq.id+"/"+p.j:"";}
var PT_REG={}; // partits amb botó de calendari, per clau equip|jornada
function targetaPartit(p,opts){
  opts=opts||{}; var k=p.eq.id+"|"+p.j, ll=llocPartit(p); PT_REG[k]=p;
  var esq=p.gol?'<div class="pt-marc num"><b>'+p.gol.nos+'</b><i>-</i><b>'+p.gol.ells+'</b></div>':'<div class="pt-hora num">'+esc(p.estat==="pendent"||p.estat==="ajornat"&&p.hora?(p.hora||"--:--"):"--:--")+'</div>';
  var eqH=opts.senseEquip?'':'<div class="pt-eq"><a href="'+esc(urlEquip(p.eq.id))+'">'+esc(p.eq.nom)+'</a><small>'+esc(p.eq.categoria)+'</small></div>';
  var sub=p.gol?(p.amistos?"Amistós":(p.casa?"A casa":"A fora")+" · J"+p.j):'<span>'+esc(ll.txt)+'</span>'+(p.nota?' <span class="pt-nota">'+esc(p.nota)+'</span>':'');
  var ETIQ={"ajornat":"Ajornat","pendent-resultat":"Pendent de resultat","sense-data":"Data per confirmar"};
  var estat=p.gol?chip(p.res):(ETIQ[p.estat]?'<span class="estat-pt '+p.estat+'">'+ETIQ[p.estat]+'</span>':llocHTML(p));
  return '<article class="pt '+(p.gol?"jugat "+p.res:p.estat)+(opts.compacte?" compacte":"")+'"'+(urlFitxa(p)?' data-fitxa="'+esc(urlFitxa(p))+'"':'')+'>'+esq+eqH+
    '<div class="pt-rival">'+rivalHTML(p,sub)+'</div><div class="pt-estat">'+estat+'</div>'+accionsPartit(p,k)+'</article>';
}
function perDies(llista,opts){
  var html="",dia="";
  llista.forEach(function(p){
    var k=p.data?p.dataTxt:"pendent";
    if(k!==dia){if(dia)html+="</div>";html+='<div class="dia"><h3>'+(p.data?esc(diaLlarg(p.data)):"Data pendent")+'</h3>';dia=k;}
    html+=targetaPartit(p,opts);
  });
  return html?html+"</div>":"";
}

/* ---------- Finestra "aquesta setmana" (portada) ---------- */
function setmana(){
  var avui=avuiZero(), fi=new Date(avui); var dow=avui.getDay(); fi.setDate(avui.getDate()+((7-dow)%7)); fi.setHours(23,59,59,999);
  var llista=[];
  D.equips.forEach(function(eq){tots(eq).forEach(function(p){if(p.data&&!p.marcador&&p.data>=avui&&p.data<=fi)llista.push(p);});});
  var etiqueta="Aquesta setmana";
  if(!llista.length){
    var seg=null;
    D.equips.forEach(function(eq){tots(eq).forEach(function(p){if(p.data&&!p.marcador&&p.data>=avui&&(!seg||p.data<seg))seg=p.data;});});
    if(seg){var ini=new Date(seg),f2=new Date(seg);f2.setDate(seg.getDate()+((7-seg.getDay())%7));f2.setHours(23,59,59,999);
      D.equips.forEach(function(eq){tots(eq).forEach(function(p){if(p.data&&!p.marcador&&p.data>=ini&&p.data<=f2)llista.push(p);});});
      etiqueta="Propera jornada";}
  }
  llista.sort(perData);
  return {llista:llista,etiqueta:etiqueta};
}
function pintaPartitsInici(){
  var el=document.getElementById("inici-partits"); if(!el)return;
  var s=setmana(), lab=document.getElementById("inici-setmana-etiq"); if(lab)lab.textContent=s.etiqueta;
  if(!s.llista.length){el.innerHTML='<div class="buit">No hi ha partits programats properament.</div>';return;}
  var max=6, mostra=s.llista.slice(0,max);
  el.innerHTML='<div class="graella-pt">'+mostra.map(function(p){return targetaPartit(p,{compacte:true});}).join("")+'</div>'+
    (s.llista.length>max?'<p class="mes-pt"><a class="boto clar" href="partits/">Veure els '+s.llista.length+' partits</a></p>':'');
}

/* ---------- Pàgina Partits: filtres per categoria i equip, propers / resultats ---------- */
var PT={pestanya:"propers",cat:"Totes",limit:24};
function equipsDeCat(c){return D.equips.filter(function(eq){return c==="Totes"||catBase(eq.nom)===c;});}
function pintaEines(eqId){
  var cats=["Totes"]; D.equips.forEach(function(eq){var c=catBase(eq.nom);if(cats.indexOf(c)<0)cats.push(c);});
  if(eqId){var e=perId(eqId);if(e)PT.cat=catBase(e.nom);}
  var h='<div class="pestanyes" role="group" aria-label="Què vols veure">'+
    '<button type="button" data-pestanya="propers" aria-pressed="'+(PT.pestanya==="propers")+'">Propers partits</button>'+
    '<button type="button" data-pestanya="resultats" aria-pressed="'+(PT.pestanya==="resultats")+'">Resultats</button></div>'+
    '<div class="filtres-pt"><div class="selector xips" role="group" aria-label="Categoria">'+cats.map(function(c){return '<button type="button" data-cat="'+esc(c)+'" aria-pressed="'+(c===PT.cat)+'">'+esc(c)+'</button>';}).join("")+'</div>'+
    '<label class="tria-eq"><span>Equip</span><select id="tria-equip"><option value="">Tots els equips</option>'+equipsDeCat(PT.cat).map(function(eq){return '<option value="'+esc(eq.id)+'"'+(eq.id===eqId?" selected":"")+'>'+esc(eq.nom)+'</option>';}).join("")+'</select></label></div>';
  document.getElementById("eines-partits").innerHTML=h;
}
function capEquip(eq){
  var info=EQUIPS.filter(function(x){return x.fcf===eq.id;})[0];
  var propers=tots(eq).filter(function(p){return !p.gol&&p.data&&p.data>=avuiZero();});
  return '<div class="fitxa'+(info?' amb-foto':'')+'"><div class="fitxa-text"><span class="etiqueta">'+esc(eq.bloc)+'</span><h2>'+esc(eq.nom)+'</h2><p class="comp">'+esc(eq.categoria)+' · '+esc(eq.grup)+'</p>'+
    (info&&info.entrenador?'<p class="anys">Entrenador: '+esc(info.entrenador)+'</p>':'')+
    (propers.length?'<p class="fitxa-acc"><button type="button" class="boto clar petit" data-ics-equip="'+esc(eq.id)+'">'+ICO_CAL+'<span>Afegeix tots els partits al calendari</span></button></p>':'')+'</div>'+
    (info?fotoEq(info.sigla,FOTOS+info.foto,eq.nom,"Foto de l\'equip "+info.nom).replace('class="foto boto-foto" data-grup="equips"','class="foto fitxa-foto boto-foto"'):'')+'</div>';
}
function pintaPartits(id){
  if(!document.getElementById("vista-partits"))return;
  var eq=id?perId(id):null;
  pintaEines(eq?eq.id:null);
  var v=document.getElementById("vista-partits"), avui=avuiZero(), html="";
  var equips=eq?[eq]:equipsDeCat(PT.cat), totsP=[];
  equips.forEach(function(e){totsP=totsP.concat(tots(e));});
  if(eq)html+=capEquip(eq);
  var llista;
  if(PT.pestanya==="propers"){
    llista=totsP.filter(function(p){return !p.gol&&(p.data?p.data>=avui:!!eq);}).sort(perData);
  }else{
    llista=totsP.filter(function(p){return p.gol||(p.data&&p.data<avui);}).sort(perData).reverse();
  }
  var n=llista.length, vis=llista.slice(0,PT.limit);
  html+='<h2 class="vh">'+(PT.pestanya==="propers"?"Propers partits":"Resultats")+'</h2><p class="recompte" aria-live="polite">'+(PT.pestanya==="propers"?(n===1?"1 partit per jugar":n+" partits per jugar"):(n===1?"1 resultat":n+" resultats"))+'</p>';
  html+=n?perDies(vis,{senseEquip:!!eq}):'<div class="buit">'+(PT.pestanya==="propers"?"No hi ha partits programats per a aquesta selecció.":"Encara no hi ha resultats per a aquesta selecció.")+'</div>';
  if(n>PT.limit)html+='<p class="mes-pt"><button type="button" class="boto clar" id="mes-partits">Mostra\'n més</button></p>';
  v.innerHTML=html;
}
function partitsActual(){var h=(location.hash||"").replace(/^#/,"").replace(/^partits-/,"");return h&&perId(h)?h:null;}
document.addEventListener("click",function(e){
  var t=e.target.closest("[data-pestanya],#eines-partits [data-cat],#mes-partits,[data-ics],[data-ics-equip]"); if(!t)return;
  if(t.hasAttribute("data-ics")){var p=PT_REG[t.getAttribute("data-ics")];if(p)descarrega("partit-jspm-"+(p.eq.nom+"-j"+p.j).toLowerCase().replace(/[^a-z0-9]+/g,"-")+".ics",icsPartits([p]));return;}
  if(t.hasAttribute("data-ics-equip")){var eq=perId(t.getAttribute("data-ics-equip"));if(eq){var ps=tots(eq).filter(function(p){return !p.gol&&p.data&&p.data>=avuiZero();});descarrega("partits-jspm-"+eq.nom.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".ics",icsPartits(ps));}return;}
  if(t.id==="mes-partits"){PT.limit+=24;pintaPartits(partitsActual());return;}
  if(t.hasAttribute("data-pestanya")){PT.pestanya=t.getAttribute("data-pestanya");PT.limit=24;pintaPartits(partitsActual());return;}
  if(t.hasAttribute("data-cat")){
    PT.cat=t.getAttribute("data-cat");PT.limit=24;
    var unic=PT.cat!=="Totes"?equipsDeCat(PT.cat):[];
    if(unic.length===1){location.hash="#"+unic[0].id;return;} // categoria amb un sol equip: directament a la seva fitxa
    if(partitsActual())history.pushState(null,"",location.pathname+location.search);pintaPartits(null);}
});
document.addEventListener("change",function(e){
  if(e.target.id!=="tria-equip")return;
  var v=e.target.value; PT.limit=24; if(v)location.hash="#"+v;else{history.pushState(null,"",location.pathname+location.search);pintaPartits(null);}
});

/* ---------- Clic a una targeta de partit jugat → fitxa del partit ---------- */
document.addEventListener("click",function(e){
  var art=e.target.closest(".pt[data-fitxa]"); if(!art||e.defaultPrevented||e.target.closest("a,button,select,input,label"))return;
  if(window.getSelection&&String(window.getSelection()).length)return; // deixa seleccionar text
  var u=new URL(art.getAttribute("data-fitxa"),document.baseURI); if(location.protocol==="file:")u.pathname+="index.html";
  location.href=u.href;
});

/* ---------- Fitxa del partit (partit/#equip/jornada) ----------
   Dades: partits.js (marcador, rival, data) + partits-detall/<temporada>/<equip>-<jornada>.js
   (gols, targetes, canvis i alineació de l'acta de la FCF). Només hi ha noms de jugadors del
   JSPM quan l'equip té el permís (dades/equips.json → mostrar_jugadors); del rival, res. */
var DETALLS=window.JSPM_DETALLS=window.JSPM_DETALLS||{};
var PARTICULES=/^(de|del|dels|la|les|el|els|i|y|d'|l'|da|do|dos|das|van|von|der)$/i;
function majInicial(w){return w.toLowerCase().replace(/(^|[-'’])(\S)/g,function(m,a,b){return a+b.toUpperCase();});}
function nomJugador(raw){
  var s=String(raw||"").replace(/\s+/g," ").trim(); if(!s)return "";
  var parts=s.split(/\s*,\s*/), cognoms=parts[0].split(" "), nom=parts.length>1?parts.slice(1).join(" ").split(" "):[];
  var c1=[]; for(var i=0;i<cognoms.length;i++){c1.push(cognoms[i]);if(!PARTICULES.test(cognoms[i]))break;}
  var tot=nom.map(majInicial).concat(c1.map(function(w,k){return (k<c1.length-1&&PARTICULES.test(w))?w.toLowerCase():majInicial(w);}));
  return tot.join(" ");
}
function nomCamp(s){
  return String(s||"").replace(/\s+/g," ").trim().split(" ").map(function(w,i){
    var m=w.match(/^((?:[A-ZÀ-Ý]\.)+)?(.*)$/); var a=m[1]||"", b=m[2]||"";
    if(!a&&i>0&&PARTICULES.test(b))return b.toLowerCase();
    return a+(b?majInicial(b):"");
  }).join(" ");
}
var ICO_GOL='<svg class="ico-ev" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#fff" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.6l3.9 2.8-1.5 4.6H9.6l-1.5-4.6z" fill="currentColor"/><path d="M12 2.4v5.2M15.9 10.4l5-1.5M14.4 15l3.1 4.3M9.6 15l-3.1 4.3M8.1 10.4l-5-1.5" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>';
var ICO_ENTRA='<svg class="ico-ev entra" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var ICO_SURT='<svg class="ico-ev surt" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var EVENTS={g:{ico:ICO_GOL,txt:"Gol"},gp:{ico:ICO_GOL,txt:"Gol de penal"},pp:{ico:ICO_GOL.replace('class="ico-ev"','class="ico-ev pp"'),txt:"Gol en pròpia porta"},
  y:{ico:'<span class="targ" aria-hidden="true"></span>',txt:"Targeta groga"},r:{ico:'<span class="targ r" aria-hidden="true"></span>',txt:"Targeta vermella"},
  yy:{ico:'<span class="targ yy" aria-hidden="true"></span>',txt:"Doble groga (expulsió)"},e:{ico:ICO_ENTRA,txt:"Entra al camp"},s:{ico:ICO_SURT,txt:"Surt del camp"}};
function minTxt(m){return m?m+"’":"";}
function ordreMin(a,b){var f=function(x){var p=String(x||"0").split("+");return (+p[0]||0)+(+(p[1]||0))/100;};return f(a)-f(b);}
function quiEs(det,dorsal,nom){
  if(det.noms&&nom)return '<span class="dp-nom" translate="no">'+esc(nomJugador(nom))+'</span>'+(dorsal?' <small class="num">('+esc(dorsal)+')</small>':'');
  return dorsal?'<span class="dp-nom dp-dorsal"><span>Dorsal</span> <b class="num">'+esc(dorsal)+'</b></span>':'<span class="dp-nom">Jugador del JSPM</span>';
}
function titolPartit(p){var n="JSPM "+trNom(p.eq.nom), r=p.rival+(p.lletra?" "+p.lletra:"");return p.casa?n+" – "+r:r+" – "+n;}
function partitPerHash(){
  var m=(location.hash||"").replace(/^#/,"").match(/^([a-z0-9-]+)\/(\d+)$/i); if(!m)return null;
  var eq=perId(m[1]); if(!eq)return null;
  return tots(eq).filter(function(p){return String(p.j)===m[2]&&!p.amistos;})[0]||null;
}
function capPartit(p){
  var nos='<div class="dp-eq nos"><img src="logo.webp" alt="" width="64" height="64"><b>JSPM <span>'+esc(p.eq.nom)+'</span></b><small>'+(p.casa?"Local":"Visitant")+'</small></div>';
  var ells='<div class="dp-eq"><span class="dp-esc">'+escutHTML(p).replace(' loading="lazy"','')+'</span><b>'+esc(p.rival)+(p.lletra?" "+esc(p.lletra):"")+'</b><small>'+(p.casa?"Visitant":"Local")+'</small></div>';
  var res=p.gol?'<div class="dp-res num" aria-label="'+esc(p.gol.local+" - "+p.gol.visit)+'"><b>'+p.gol.local+'</b><i>-</i><b>'+p.gol.visit+'</b></div>':'<div class="dp-res num"><i>–</i></div>';
  return '<div class="dp-equips">'+(p.casa?nos:ells)+res+(p.casa?ells:nos)+'</div>';
}
function infoPartit(p,det){
  var bits=[];
  if(p.data)bits.push('<span>'+esc(diaLlarg(p.data))+(p.hora?' · '+esc(p.hora):'')+'</span>');
  var camp=det&&det.camp?nomCamp(det.camp):(p.casa?"Camp JSPM":"");
  if(camp)bits.push('<span translate="no">'+esc(camp)+'</span>');
  if(p.res)bits.push('<span>'+chip(p.res)+' <span>'+nomRes(p.res)+'</span></span>');
  return '<div class="dp-info">'+bits.join("")+'</div>';
}
function blocGols(p,det){
  var l=0,v=0, nos=0, ells=0;
  var files=det.gols.map(function(g){
    var nostre=!!g[1]; if(nostre===p.casa)l++;else v++; if(nostre)nos++;else ells++;
    var txt;
    if(nostre&&g[2]==="pp")txt='<span>Gol en pròpia porta del rival</span>';
    else if(nostre)txt='<span>Gol de</span> '+quiEs(det,g[3],g[4])+(g[2]==="gp"?' <small>(penal)</small>':'');
    else txt='<span>Gol en contra</span>'+(g[2]==="pp"?' <small>(en pròpia porta)</small>':'');
    return '<li class="'+(nostre?"nos":"contra")+'"><span class="dp-min num">'+esc(minTxt(g[0]))+'</span>'+ICO_GOL+'<span class="dp-txt">'+txt+'</span><span class="dp-marc num">'+l+'-'+v+'</span></li>';
  });
  var avis=(p.gol&&(nos!==p.gol.nos||ells!==p.gol.ells))?'<p class="petit">El recompte de gols de l\'acta no coincideix amb el resultat oficial.</p>':'';
  return '<section class="dp-caixa" aria-labelledby="dp-t-gols"><h2 id="dp-t-gols">Gols</h2>'+(files.length?'<ul class="dp-llista dp-gols">'+files.join("")+'</ul>':'<p class="petit">Sense gols.</p>')+avis+'</section>';
}
function eventsJug(det){
  var out=[]; [["tit",det.tit||[]],["sup",det.sup||[]]].forEach(function(x){x[1].forEach(function(j){(j[3]||[]).forEach(function(e){out.push({min:e[0],codi:e[1],dorsal:j[0],nom:j[1]});});});});
  return out.sort(function(a,b){return ordreMin(a.min,b.min);});
}
function blocTargetes(det){
  var t=eventsJug(det).filter(function(e){return /^(y|r|yy)$/.test(e.codi);});
  return '<section class="dp-caixa" aria-labelledby="dp-t-targ"><h2 id="dp-t-targ">Targetes</h2>'+(t.length?'<ul class="dp-llista">'+t.map(function(e){
    return '<li><span class="dp-min num">'+esc(minTxt(e.min))+'</span>'+EVENTS[e.codi].ico+'<span class="dp-txt"><span class="vh">'+EVENTS[e.codi].txt+':</span> '+quiEs(det,e.dorsal,e.nom)+'</span><span></span></li>';}).join("")+'</ul>':'<p class="petit">Cap targeta per al JSPM.</p>')+'</section>';
}
function blocCanvis(det){
  var ev=eventsJug(det), mins=[], per={};
  ev.forEach(function(e){if(e.codi!=="e"&&e.codi!=="s")return;if(!per[e.min]){per[e.min]={e:[],s:[]};mins.push(e.min);}per[e.min][e.codi].push(e);});
  if(!mins.length)return "";
  return '<section class="dp-caixa" aria-labelledby="dp-t-canvis"><h2 id="dp-t-canvis">Canvis</h2><ul class="dp-llista dp-canvis">'+mins.map(function(m){
    var c=per[m], q=function(l){return l.map(function(e){return quiEs(det,e.dorsal,e.nom);}).join(", ");};
    return '<li><span class="dp-min num">'+esc(minTxt(m))+'</span><span></span><span class="dp-txt">'+
      (c.e.length?'<span class="dp-canvi">'+ICO_ENTRA+'<span class="vh">Entra:</span> '+q(c.e)+'</span>':'')+
      (c.s.length?'<span class="dp-canvi">'+ICO_SURT+'<span class="vh">Surt:</span> '+q(c.s)+'</span>':'')+'</span><span></span></li>';}).join("")+'</ul></section>';
}
function blocAlineacio(det){
  var fila=function(j){
    var evs=(j[3]||[]).map(function(e){var x=EVENTS[e[1]];return x?'<span class="ev" title="'+esc(x.txt+(e[0]?" · "+minTxt(e[0]):""))+'">'+x.ico+'<span class="vh">'+x.txt+'</span>'+(e[0]?'<small class="num">'+esc(minTxt(e[0]))+'</small>':'')+'</span>':"";}).join("");
    return '<li><b class="dorsal num">'+esc(j[0]||"–")+'</b><span class="dp-txt">'+(det.noms&&j[1]?'<span class="dp-nom" translate="no">'+esc(nomJugador(j[1]))+'</span>':'<span class="vh">Dorsal '+esc(j[0]||"")+'</span>')+
      (j[2]?' <abbr class="capita" title="Capità">C</abbr>':'')+'</span><span class="dp-evs">'+evs+'</span></li>';
  };
  var t=det.tit||[], s=det.sup||[]; if(!t.length&&!s.length)return "";
  return '<section class="dp-caixa dp-alin" aria-labelledby="dp-t-alin"><h2 id="dp-t-alin">Alineació del JSPM</h2>'+
    '<div class="dp-alin-cols">'+(t.length?'<div><h3>Titulars</h3><ul class="dp-llista">'+t.map(fila).join("")+'</ul></div>':'')+
    (s.length?'<div><h3>Suplents</h3><ul class="dp-llista">'+s.map(fila).join("")+'</ul></div>':'')+'</div>'+
    (det.noms===2?'<p class="petit">Per protegir els jugadors menors d\'edat, només es mostra el nom i la inicial del cognom.</p>':det.noms?'':'<p class="petit">Per protegir les dades dels jugadors, que majoritàriament són menors d\'edat, només es mostren els dorsals.</p>')+'</section>';
}
function pintaPartit(){
  var v=document.getElementById("vista-partit"); if(!v)return;
  var p=partitPerHash(), comp=document.getElementById("partit-comp"), h1=document.getElementById("t-partit");
  if(!p){if(comp)comp.textContent="Partit";if(h1)h1.textContent="Fitxa del partit";v.innerHTML='<div class="buit">No hem trobat aquest partit. <a href="partits/">Veure tots els partits</a></div>';return;}
  if(comp)comp.innerHTML='<span>'+esc(p.eq.categoria+" · "+p.eq.grup)+'</span> · <span>Jornada</span> '+esc(p.j);
  if(h1)h1.textContent=titolPartit(p);
  var clau=p.eq.id+"/"+p.j, det=DETALLS[clau];
  var html='<div class="dp-marcador">'+capPartit(p)+infoPartit(p,det)+'</div>';
  if(det){
    html+='<div class="dp-graella">'+blocGols(p,det)+'<div class="dp-col">'+blocTargetes(det)+blocCanvis(det)+'</div></div>'+blocAlineacio(det);
  }else if(det===null||!p.gol){
    html+='<div class="buit">'+(p.gol?"El detall d'aquest partit (gols, targetes i alineació) encara no està disponible. S'afegeix sol quan la Federació publica l'acta: normalment el mateix cap de setmana o, com a molt tard, el dilluns.":"Aquest partit encara no s'ha jugat.")+'</div>';
  }else{
    html+='<div class="buit">Carregant el detall del partit…</div>'; carregaDetall(p,clau);
  }
  var acta=actaURL(p);
  html+='<p class="dp-peu">'+(acta?'<a class="boto clar petit" href="'+esc(acta)+'" target="_blank" rel="noopener">Acta oficial a la FCF ↗</a>':'')+
    '<a class="boto clar petit" href="'+esc(waURL(p))+'" target="_blank" rel="noopener">'+ICO_WA+'<span>Comparteix</span></a>'+
    '<a class="enllac" href="'+esc(urlEquip(p.eq.id))+'">← Tots els partits de l\'equip</a></p>'+
    '<p class="font-dades">Font: acta de la Federació Catalana de Futbol. Del rival només es mostren els gols.</p>';
  v.innerHTML=html;
}
/* Carrega un .js de la carpeta partits-detall (funciona també obrint la web des de l'ordinador, file://) */
var DADES_REM=String(CFG.dades||"").replace(/\/*$/,"/").replace(/^\/$/,"");
function scriptDetall(nom,fet){
  var ruta="partits-detall/"+encodeURIComponent(D.temporada||"")+"/"+nom+".js";
  var prova=function(base,seguent){
    var s=document.createElement("script"); s.src=base+ruta;
    s.onload=function(){fet(true);}; s.onerror=function(){if(seguent)seguent();else fet(false);};
    document.head.appendChild(s);
  };
  // Primer GitHub Pages (dades més noves), si està configurat; si falla, la còpia de la web
  if(DADES_REM&&/^https:\/\//.test(DADES_REM))prova(DADES_REM,function(){prova("",null);});else prova("",null);
}
/* Primer l'índex (quins partits tenen detall) i després només el fitxer del partit, si existeix */
function carregaDetall(p,clau){
  if(carregaDetall.fets[clau])return; carregaDetall.fets[clau]=1;
  var nom=encodeURIComponent(p.eq.id)+"-"+encodeURIComponent(p.j);
  var fitxer=function(){scriptDetall(nom,function(){if(!DETALLS[clau])DETALLS[clau]=null;pintaPartit();titolPagina();});};
  var mira=function(){var ix=window.JSPM_DETALLS_INDEX;
    if(ix&&ix.partits&&ix.temporada===D.temporada&&!ix.partits[p.eq.id+"-"+p.j]){DETALLS[clau]=null;pintaPartit();return;}
    fitxer();};
  if(window.JSPM_DETALLS_INDEX!==undefined)mira();
  else scriptDetall("index",function(ok){if(!ok)window.JSPM_DETALLS_INDEX=null;mira();});
}
carregaDetall.fets={};

/* ---------- Detalls de format ---------- */
function ultim(eq){var j=tots(eq).filter(function(p){return p.gol&&p.data;}).sort(perData);return j[j.length-1]||null;}

/* ---------- Equips ---------- */
function mini(src){return String(src).replace(/^img\/(equips|galeria|portada)\//,"img/mini/$1/");}

function fotoEq(sigla,src,titol,alt){
  return '<button type="button" class="foto boto-foto" data-grup="equips" data-foto="'+esc(src)+'" data-titol="'+esc(titol)+'" aria-label="'+esc(alt)+'"><span class="sigla" aria-hidden="true">'+esc(sigla)+'</span><img src="'+esc(mini(src))+'" alt="" loading="lazy" decoding="async" width="720" height="480" data-err="mini"><span class="lupa" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2M11 8v6M8 11h6"/></svg></span></button>';
}
function idBloc(bl){return "bloc-"+bl.toLowerCase().replace(/[^a-z0-9]+/g,"-");}
function pintaEquips(){
  if(!document.getElementById("llista-equips"))return;
  var blocs=["Primer equip","Futbol 11","Futbol 7","Escoleta"], html="";
  html+='<nav class="salts-eq" aria-label="Salta a un grup d\'equips">'+blocs.concat(["Staff"]).map(function(bl){return '<a href="#'+idBloc(bl)+'" data-salt="'+idBloc(bl)+'">'+esc(bl)+'</a>';}).join("")+'</nav>';
  blocs.forEach(function(bl){
    html+='<div class="grup-equips" id="'+idBloc(bl)+'"><h2>'+esc(bl)+'</h2><div class="graella-eq">';
    EQUIPS.filter(function(e){return e.bloc===bl;}).forEach(function(e){
      var eq=e.fcf?perId(e.fcf):null, anys=textAnys(e.nom);
      html+='<article class="eq">'+fotoEq(e.sigla,FOTOS+e.foto,e.nom,"Foto de l\'equip "+e.nom)+'<div class="cos"><h3>'+esc(e.nom)+'</h3><p class="c">'+(eq?esc(eq.categoria)+' · '+esc(eq.grup):(e.bloc==="Escoleta"?"Iniciació al futbol":"Futbol 7"))+'</p>'+
        (anys?'<p class="c anys">'+esc(anys)+'</p>':'')+(e.entrenador?'<p class="c">Entrenador: '+esc(e.entrenador)+'</p>':'')+'</div></article>';
    });
    html+='</div></div>';
  });
  html+='<div class="grup-equips" id="'+idBloc("Staff")+'"><h2>Staff</h2><div class="graella-eq">'+(CLUB.staff||[]).map(function(s){
    return '<article class="eq">'+fotoEq(s.sigla,FOTOS+s.foto,s.nom,s.nom.indexOf(s.sigla)>=0?s.nom:s.sigla+": "+s.nom)+'<div class="cos"><h3>'+esc(s.nom)+'</h3><p class="c">'+esc(s.text)+'</p></div></article>';
  }).join("")+'</div></div>';
  html+='<div class="crida crida-eq"><div><h2>Vols jugar en algun d\'aquests equips?</h2><p>Mira quina categoria et toca per l\'any de naixement i demana un entrenament de prova.</p></div><a class="boto" href="#inscripcions">Vull jugar al JSPM</a></div>';
  document.getElementById("llista-equips").innerHTML=html;
}

/* ---------- Patrocinadors ---------- */
function patHTML(p){
  var nom=esc(p.nom), sub=p.sector?'<small>'+esc(p.sector)+'</small>':'';
  var cont='<span class="np">'+nom+sub+'</span>';
  var img='<img src="'+PAT+esc(p.logo)+'" alt="'+nom+'" loading="lazy" decoding="async" data-load="treu-anterior" data-err="treu">';
  var tipus=!p.web?"":/instagram\.com/.test(p.web)?"Instagram":/facebook\.com/.test(p.web)?"Facebook":"Web";
  var inner=cont+img+(tipus?'<span class="pat-tipus">'+tipus+' ↗</span>':'');
  return p.web?'<a class="pat" href="'+esc(p.web)+'" target="_blank" rel="noopener">'+inner+'</a>':'<div class="pat">'+inner+'</div>';
}
function pintaPat(){
  var lp=document.getElementById("llista-pat"); if(lp)lp.innerHTML=PATROCINADORS.map(patHTML).join("");
  var fila=PATROCINADORS.map(patHTML).join(""), ip=document.getElementById("inici-pat");
  if(!ip||ip.children.length)return;
  ip.innerHTML='<div class="marquee-pista"><div class="marquee-set">'+fila+'</div><div class="marquee-set" aria-hidden="true">'+fila+'</div></div>';
  ip.querySelectorAll(".marquee-set[aria-hidden] a").forEach(function(a){a.setAttribute("tabindex","-1");});
  ip.querySelectorAll("a,img").forEach(function(x){x.setAttribute("draggable","false");});
}

/* ---------- Botiga ---------- */
var B = window.JSPM_BOTIGA || {productes:[],categories:[]};
/* Informació addicional del panell (dades/botiga-extra.json): descripció, personalització, amagar.
   Els preus i les fotos NO es toquen aquí: vénen de la botiga de TC Equipacions. */
function idProd(p){var m=(p.url||"").match(/joventut-sant-pere-martir\/(\d+)-/);return m?m[1]:"";}
(function(){var ex={};(CLUB.productes_extra||[]).forEach(function(x){if(x&&x.id)ex[String(x.id).trim()]=x;});
  B.productes=(B.productes||[]).filter(function(p){var x=ex[idProd(p)];if(!x)return true;
    if(x.descripcio)p.descripcio=x.descripcio; if(x.personalitzacio)p.personalitzacio=x.personalitzacio; return !x.amagar;});
  B.categories=(B.categories||[]).filter(function(c){return B.productes.some(function(p){return p.cat===c;});});})();
var ICONES = {
  samarreta:'<path d="M15 6l-7 3-5 7 5 4 3-2v17h18V18l3 2 5-4-5-7-7-3c-1 3-3 4-5 4s-4-1-5-4z"/>',
  pantalo:'<path d="M9 9h22l2 22h-10l-3-11-3 11H7z"/><path d="M9 13h22"/>',
  "pantalo-llarg":'<path d="M11 5h18l2 31h-8l-3-21-3 21H9z"/><path d="M11 9h18"/>',
  jaqueta:'<path d="M14 5l-6 3-5 9 2 15 5-1v5h20v-5l5 1 2-15-5-9-6-3c-1 2-3 3-6 3s-5-1-6-3z"/><path d="M20 8v28"/>',
  mitgetes:'<path d="M14 4h11v17l6 6a4 4 0 0 1-3 7h-7l-8-8V4z"/><path d="M14 9h11"/>',
  motxilla:'<rect x="9" y="11" width="22" height="25" rx="6"/><path d="M15 11V8a5 5 0 0 1 10 0v3"/><path d="M13 22h14v8H13z"/>',
  pitrall:'<path d="M14 4l3 6h6l3-6 6 4v28H8V8z"/><path d="M8 20h24"/>',
  pack:'<path d="M12 9l-5 2-4 6 4 3 2-1v12h14V19l2 1 4-3-4-6-5-2c-1 2-2 3-4 3s-3-1-4-3z"/><path d="M27 15l4-1 4 5-3 3-2-1v11h-6"/>'
};
function iconaProd(t){return '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">'+(ICONES[t]||ICONES.samarreta)+'</svg>';}
function imgProd(p){var k=idProd(p);return k?"img/botiga/"+k+".webp":p.foto;}
function euros(n){return n.toLocaleString(LOCS[LANG],{minimumFractionDigits:2,maximumFractionDigits:2})+" €";}
var filtreBotiga="Tot";
function prodHTML(p){
  var k=B.productes.indexOf(p);
  return '<article class="prod"><button type="button" class="imatge" data-prod="'+k+'" aria-label="'+esc("Veure el producte: "+p.nom)+'">'+iconaProd(p.tipus)+
    '<img src="'+esc(imgProd(p))+'" alt="" loading="lazy" decoding="async" width="700" height="700" data-err="treu"><span class="prod-lupa" aria-hidden="true">+</span></button>'+
    '<div class="cos"><span class="prod-cat">'+esc(p.cat)+'</span><h3>'+esc(p.nom)+'</h3>'+(p.personalitzacio?'<span class="prod-pers">Personalitzable amb el nom</span>':'')+
    '<div class="peu-p"><span class="preu num">'+euros(p.preu)+'</span><a class="boto" href="'+esc(p.url)+'" target="_blank" rel="noopener">Comprar ↗</a></div></div></article>';
}
function obreProducte(k){
  var p=B.productes[k], dlg=document.getElementById("fitxa-prod"); if(!p||!dlg)return;
  document.getElementById("fp-img").src=imgProd(p); document.getElementById("fp-img").alt=p.nom;
  document.getElementById("fp-cat").textContent=p.cat; document.getElementById("fp-nom").textContent=p.nom;
  document.getElementById("fp-preu").textContent=euros(p.preu); document.getElementById("fp-compra").href=p.url;
  var ds=document.getElementById("fp-desc"); if(ds){ds.textContent=p.descripcio||"";ds.hidden=!p.descripcio;}
  var punts=["Producte oficial amb l'escut del JSPM"]; if(p.personalitzacio)punts.push("Personalitzable amb el nom (s'escriu a la botiga en fer la comanda)");
  punts.push("La talla, la comanda i el pagament es fan a la botiga de TC Equipacions");
  document.getElementById("fp-punts").innerHTML=punts.map(function(x){return '<li>'+esc(x)+'</li>';}).join("");
  var cq=document.getElementById("fp-consulta"); if(cq){var em=(CLUB.contacte&&CLUB.contacte.email)||CFG.email||"";
    if(em){cq.hidden=false;cq.href="mailto:"+em+"?subject="+encodeURIComponent(tr("Consulta sobre la botiga")+": "+p.nom);}else cq.hidden=true;}
  if(dlg.showModal)dlg.showModal();else dlg.setAttribute("open","");
}
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-prod]"); if(b){obreProducte(+b.getAttribute("data-prod"));return;}
  var dlg=document.getElementById("fitxa-prod");
  if(dlg&&(e.target===dlg||e.target.closest(".fp-tanca"))){dlg.close?dlg.close():dlg.removeAttribute("open");}
});
function pintaBotiga(){
  if(!document.getElementById("llista-prod"))return;
  var cats=["Tot"].concat(B.categories);
  document.getElementById("filtres-botiga").innerHTML=cats.map(function(c){return '<button type="button" data-cat="'+esc(c)+'" aria-pressed="'+(c===filtreBotiga?"true":"false")+'">'+esc(c)+'</button>';}).join("");
  var llista=B.productes.filter(function(p){return filtreBotiga==="Tot"||p.cat===filtreBotiga;});
  document.getElementById("llista-prod").innerHTML=llista.map(prodHTML).join("");
  document.getElementById("recompte-botiga").textContent=llista.length+(llista.length===1?" producte":" productes");
  if(B.botiga)document.getElementById("botiga-tota").href=B.botiga;
}
document.addEventListener("click",function(e){if(!e.target.closest("#filtres-botiga"))return;var b=e.target.closest("button[data-cat]");if(!b)return;filtreBotiga=b.getAttribute("data-cat");pintaBotiga();});


/* ---------- Moviment reduït: si l'usuari ho demana, res no es mou sol ---------- */
var MOV_RED=window.matchMedia?window.matchMedia("(prefers-reduced-motion: reduce)"):{matches:false};
function movimentReduit(){return !!MOV_RED.matches;}
var ICO_PAUSA='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z" fill="currentColor"/></svg>', ICO_PLAY='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z" fill="currentColor"/></svg>';

/* ---------- Portada: fotos del hero ---------- */
function heroFotos(){
  if(!document.getElementById("hero"))return;
  var hero=document.getElementById("hero"), ctl=document.getElementById("hero-control"), num=document.getElementById("hero-num"), tot=document.getElementById("hero-total"), prog=document.getElementById("hero-progres"), idx=0, timer=null;
  var dd=function(n){return (n<10?"0":"")+n;};
  function fotos(){return Array.prototype.slice.call(hero.querySelectorAll(".hero-foto"));}
  function carrega(){fotos().forEach(function(im){var so=im.parentNode&&im.parentNode.tagName==="PICTURE"?im.parentNode.querySelector("source[data-srcset]"):null;
    if(so){so.srcset=so.getAttribute("data-srcset");so.removeAttribute("data-srcset");}
    if(im.dataset.src){if(im.dataset.srcset)im.srcset=im.dataset.srcset;im.src=im.dataset.src;im.removeAttribute("data-src");}});}
  if(document.readyState==="complete")setTimeout(carrega,300);else window.addEventListener("load",function(){setTimeout(carrega,300);});
  function mostra(i,inicial){var f=fotos();if(!f.length)return;idx=(i+f.length)%f.length;
    // inicial: la primera foto ja és visible des de l'HTML; no la tornem a amagar (evita parpelleig i LCP tardà)
    f.forEach(function(el,k){if(k===idx){if(inicial&&el.classList.contains("actiu"))return;el.classList.remove("actiu");void el.offsetWidth;el.classList.add("actiu");}else el.classList.remove("actiu");});
    num.textContent=dd(idx+1);tot.textContent=dd(f.length);ctl.hidden=f.length<2;
    prog.classList.remove("corre");void prog.offsetWidth;prog.classList.add("corre");}
  var aturat=movimentReduit(), pausa=document.getElementById("hero-pausa"), wtimer=null;
  function reinicia(){if(timer)clearInterval(timer);timer=null;hero.classList.toggle("aturat",aturat);if(!aturat)timer=setInterval(function(){if(!document.hidden)mostra(idx+1);},6000);}
  function marcaPausa(){if(!pausa)return;pausa.setAttribute("aria-pressed",aturat?"true":"false");pausa.setAttribute("aria-label",aturat?"Reprèn el passi de fotos":"Atura el passi de fotos");pausa.innerHTML=aturat?ICO_PLAY:ICO_PAUSA;}
  ctl.addEventListener("click",function(e){var b=e.target.closest("button[data-dir]");if(b){mostra(idx+(+b.getAttribute("data-dir")));reinicia();return;}
    if(e.target.closest("#hero-pausa")){aturat=!aturat;marcaPausa();reinicia();paraules();}});
  if(MOV_RED.addEventListener)MOV_RED.addEventListener("change",function(){aturat=movimentReduit();marcaPausa();reinicia();paraules();});
  mostra(0,true);reinicia();marcaPausa();
  var baixa=document.getElementById("hero-baixa");
  if(baixa)baixa.addEventListener("click",function(){var x=document.querySelector(".xifres");if(x)x.scrollIntoView({behavior:"smooth",block:"start"});});
  // "Som Sant Pere / família / equip / barri": la paraula canvia dins la banda blanca, que s'adapta a l'amplada
  var banda=document.getElementById("hero-banda"), par=document.getElementById("hero-paraula"), mots=["Sant Pere","família","equip","barri"], m=0;
  if(!banda||!par)return;
  banda.addEventListener("transitionend",function(e){if(e.propertyName==="width")banda.style.width="";});
  function paraules(){if(wtimer)clearInterval(wtimer);wtimer=null;if(!aturat)wtimer=setInterval(canvia,3000);}
  paraules();
  function canvia(){
    if(document.hidden)return;
    par.classList.add("surt");
    setTimeout(function(){
      var w0=banda.offsetWidth; banda.style.width=w0+"px";
      m=(m+1)%mots.length; par.textContent=mots[m];
      par.classList.remove("surt"); par.classList.add("entra");
      Promise.resolve().then(function(){ // després de la traducció automàtica
        banda.style.transition="none"; banda.style.width="auto"; var w1=banda.offsetWidth;
        banda.style.width=w0+"px"; void banda.offsetWidth; banda.style.transition=""; banda.style.width=w1+"px";
        if(w1===w0||parseFloat(getComputedStyle(banda).transitionDuration)===0)banda.style.width="";
        par.classList.remove("entra");
      });
    },300);
  }
}

/* ---------- Xifres que compten i blocs que apareixen en fer scroll ---------- */
function animaPortada(){
  var vist=function(el){el.classList.add("vist");};
  var compta=function(b){
    if(movimentReduit())return;
    var fi=+b.getAttribute("data-compte"), pre=b.getAttribute("data-prefix")||"", ini=fi>1000?fi-60:0, t0=null;
    function pas(ts){if(!t0)t0=ts;var k=Math.min(1,(ts-t0)/1400), e=1-Math.pow(1-k,3);b.textContent=pre+Math.round(ini+(fi-ini)*e);if(k<1)requestAnimationFrame(pas);}
    requestAnimationFrame(pas);
  };
  if(!("IntersectionObserver" in window)){document.querySelectorAll(".revela").forEach(vist);return;}
  var io=new IntersectionObserver(function(ents){ents.forEach(function(en){if(!en.isIntersecting)return;var el=en.target;vist(el);var b=el.querySelector("[data-compte]");if(b&&!b.dataset.fet){b.dataset.fet="1";compta(b);}io.unobserve(el);});},{threshold:.15});
  document.querySelectorAll(".revela").forEach(function(el){io.observe(el);});
}

/* ---------- Cinta de patrocinadors: es mou sola i es pot arrossegar ---------- */
function cintaPat(){
  var cont=document.getElementById("inici-pat"); if(!cont)return;
  var pista=cont.querySelector(".marquee-pista"), set=cont.querySelector(".marquee-set"); if(!pista||!set)return;
  var x=0, vel=0.035, ample=0, arr=null, mogut=0, sobre=false, inerc=0, last=null, aturada=movimentReduit(), bp=document.getElementById("cinta-pausa");
  function marca(){if(!bp)return;bp.setAttribute("aria-pressed",aturada?"true":"false");bp.setAttribute("aria-label",aturada?"Reprèn el moviment dels patrocinadors":"Atura el moviment dels patrocinadors");bp.innerHTML=aturada?ICO_PLAY:ICO_PAUSA;}
  if(bp)bp.addEventListener("click",function(){aturada=!aturada;inerc=0;marca();});
  if(MOV_RED.addEventListener)MOV_RED.addEventListener("change",function(){aturada=movimentReduit();marca();});
  marca();
  function mida(){ample=set.getBoundingClientRect().width;}
  function posa(){if(ample){while(x>=ample)x-=ample;while(x<0)x+=ample;}pista.style.transform="translate3d("+(-x)+"px,0,0)";}
  function bucle(ts){
    var dt=last?Math.min(64,ts-last):16; last=ts;
    if(!arr){
      if(Math.abs(inerc)>0.01&&!movimentReduit()){x+=inerc*dt;inerc*=0.92;}
      else if(!sobre&&!aturada&&!document.hidden)x+=vel*dt;
      posa();
    }
    requestAnimationFrame(bucle);
  }
  cont.addEventListener("pointerdown",function(e){if(e.button!==undefined&&e.button!==0)return;arr={x0:e.clientX,xi:x,t:performance.now(),px:e.clientX};mogut=0;inerc=0;});
  window.addEventListener("pointermove",function(e){
    if(!arr)return;
    var dx=e.clientX-arr.x0; mogut=Math.max(mogut,Math.abs(dx));
    if(mogut>4){cont.classList.add("arrossega");if(cont.setPointerCapture&&e.pointerId!=null){try{cont.setPointerCapture(e.pointerId);}catch(_){}}}
    var now=performance.now(); inerc=-(e.clientX-arr.px)/Math.max(1,now-arr.t); arr.px=e.clientX; arr.t=now;
    x=arr.xi-dx; posa();
  });
  function deixa(){if(!arr)return;arr=null;cont.classList.remove("arrossega");inerc=Math.max(-1.5,Math.min(1.5,inerc));}
  window.addEventListener("pointerup",deixa); window.addEventListener("pointercancel",deixa);
  cont.addEventListener("click",function(e){if(mogut>6){e.preventDefault();e.stopPropagation();}},true);
  cont.addEventListener("dragstart",function(e){e.preventDefault();});
  cont.addEventListener("mouseenter",function(){sobre=true;}); cont.addEventListener("mouseleave",function(){sobre=false;});
  cont.addEventListener("focusin",function(){sobre=true;}); cont.addEventListener("focusout",function(){sobre=false;});
  window.addEventListener("resize",mida); window.addEventListener("load",mida);
  cont.querySelectorAll("img").forEach(function(im){im.addEventListener("load",mida);});
  mida(); requestAnimationFrame(bucle);
}

/* ---------- Instagram ----------
   Les últimes publicacions de @olotjspm són a insta.js (i les fotos a img/instagram/).
   Instantània (insta.js). Només s'actualitza amb l'API oficial (eines/instagram_api.py); si té més de 30 dies, el bloc s'amaga. */
var IG = window.JSPM_INSTAGRAM || null;
/* Instagram en directe amb Behold (si s'ha configurat a js/config.js). Si falla, es manté la instantània. */
function deBehold(j){
  var tipus={VIDEO:"video",CAROUSEL_ALBUM:"album"};
  var posts=(j&&j.posts||[]).map(function(p){
    var m=(p.sizes&&(p.sizes.medium||p.sizes.large||p.sizes.small))||{}, sc=String(p.permalink||"").replace(/\/+$/,"").split("/").pop();
    var ts=Date.parse(String(p.timestamp||"").replace(/([+-]\d{2})(\d{2})$/,"$1:$2"))/1000;
    return {sc:sc,tipus:tipus[p.mediaType]||"imatge",ts:ts,likes:(p.likeCount!=null?p.likeCount:null),text:p.caption||p.prunedCaption||"",img:m.mediaUrl||"",w:m.width,h:m.height};
  }).filter(function(p){return p.sc&&p.img&&isFinite(p.ts);});
  return posts.length?{actualitzat:new Date().toISOString().slice(0,10),usuari:j.username||INSTAGRAM_USUARI,nom:j.username||"",seguidors:j.followersCount,posts:posts}:null;
}
function instaEnDirecte(){
  var url=((CFG.instagram||{}).behold||"").trim(); if(!url||!document.getElementById("insta")||!window.fetch)return;
  var ctl=window.AbortController?new AbortController():null, t=setTimeout(function(){if(ctl)ctl.abort();},8000);
  fetch(url,ctl?{signal:ctl.signal}:{}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();})
    .then(function(j){var d=deBehold(j);if(d){IG=d;pintaInsta();}})
    .catch(function(){/* sense connexió amb Behold: es queda la instantània (que s'amaga sola si és antiga) */})
    .then(function(){clearTimeout(t);});
}
var INSTAGRAM_USUARI = (IG&&IG.usuari)||"olotjspm";
var INSTAGRAM_URL = "https://www.instagram.com/"+INSTAGRAM_USUARI+"/";
var ICO_IG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';
var ICO_ALBUM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M16 8V5.5A2.5 2.5 0 0 0 13.5 3h-8A2.5 2.5 0 0 0 3 5.5v8A2.5 2.5 0 0 0 5.5 16H8"/></svg>';
var ICO_VIDEO='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
var ICO_COR='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z"/></svg>';
function primeraLinia(t){
  var l=String(t||"").split(/\n+/).map(function(s){return s.replace(/#[^\s#]+/g,"").trim();}).filter(function(s){return s.length>2;});
  return l.length?l[0]:"";
}
function dataPunts(ts){var d=new Date(ts*1000),p=function(n){return (n<10?"0":"")+n;};return p(d.getDate())+"."+p(d.getMonth()+1)+"."+d.getFullYear();}
function pintaInsta(){
  var el=document.getElementById("insta"); if(!el)return;
  var posts=(IG&&IG.posts)||[];
  if(!IG||diesDes(IG.actualitzat)>MAX_DIES.instagram)posts=[]; // publicacions massa antigues: només l'enllaç al perfil
  var n=function(x){return Number(x).toLocaleString(LOCS[LANG]);};
  var fl='<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12L12 4M12 4H5.5M12 4V10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var cap='<div class="noticies-cap"><div><p class="kicker">Instagram · @'+esc(INSTAGRAM_USUARI)+'</p><h2>El dia a dia del <span class="hl">club</span></h2></div>'+
    '<div class="noticies-eines"><a class="enllac-fletxa" href="'+INSTAGRAM_URL+'" target="_blank" rel="noopener">Més a Instagram '+fl+'</a></div></div>';
  if(!posts.length){el.innerHTML=cap;return;}
  var vis=posts.slice(0,3);
  el.innerHTML=cap+'<div class="graella-not">'+vis.map(function(p){
    var txt=primeraLinia(p.text)||"Publicació del JSPM a Instagram", src=esc(p.img)+'?v='+esc(p.sc);
    var tip=p.tipus==="album"?'<span class="not-tipus" title="Àlbum">'+ICO_ALBUM+'</span>':p.tipus==="video"?'<span class="not-tipus" title="Vídeo">'+ICO_VIDEO+'</span>':"";
    return '<a class="not" href="https://www.instagram.com/p/'+esc(p.sc)+'/" target="_blank" rel="noopener"><span class="not-img"><img class="fons" src="'+src+'" alt="" aria-hidden="true" loading="lazy"><img class="cartell" src="'+src+'" alt="" loading="lazy">'+tip+'</span>'+
      '<span class="not-meta"><time datetime="'+new Date(p.ts*1000).toISOString().slice(0,10)+'">'+dataPunts(p.ts)+'</time>'+(p.likes!=null?'<span class="cor">'+ICO_COR+n(p.likes)+'</span>':'')+'</span>'+
      '<span class="not-titol">'+esc(txt)+'</span></a>';
  }).join("")+'</div>';
}

/* ---------- Galeria ---------- */
var GALERIA = CLUB.galeria;
function rutaFoto(f){f=String(f).replace(/^\//,"");return /\.(webp|jpe?g|png|avif)$/i.test(f)?f:"img/"+f+".webp";}
function galItem(f,grup,titol){var src=rutaFoto(f);return '<button type="button" class="gal-item boto-foto" data-grup="'+grup+'" data-foto="'+esc(src)+'" data-titol="'+esc(titol)+'" aria-label="'+esc("Amplia la foto: "+titol)+'"><img src="'+esc(mini(src))+'" alt="" loading="lazy" decoding="async" data-err="mini-pare"></button>';}
function pintaGaleria(){
  var gc=document.getElementById("galeria-cos"), gi=document.getElementById("galeria-inici");
  if(gc)gc.innerHTML=GALERIA.map(function(g){
    return '<div class="gal-grup"><h2>'+esc(g.titol)+'</h2>'+(g.text?'<p>'+esc(g.text)+'</p>':'')+'<div class="gal-grid">'+g.fotos.map(function(f){return galItem(f,"galeria",g.titol);}).join("")+'</div></div>';
  }).join("");
  var sel=CLUB.galeria_portada.map(function(x){return [x.foto,x.album];});
  if(gi)gi.innerHTML=sel.map(function(x){return galItem(x[0],"inici",x[1]);}).join("");
}

/* ---------- Visor de fotos ---------- */
(function(){
  var caixa=document.getElementById("caixa-foto"), img=document.getElementById("caixa-img"), tit=document.getElementById("caixa-titol"), ant=document.getElementById("caixa-ant"), seg=document.getElementById("caixa-seg"), torna=null, llista=[], pos=0;
  function mostra(){var b=llista[pos];img.src=b.getAttribute("data-foto");var t=b.getAttribute("data-titol")||"";img.alt=t?"Foto: "+t:"";tit.textContent=t+(llista.length>1?" · "+(pos+1)+"/"+llista.length:"");ant.hidden=seg.hidden=llista.length<2;}
  function obre(b){torna=document.activeElement;var g=b.getAttribute("data-grup");llista=g?Array.prototype.slice.call(document.querySelectorAll('main .boto-foto[data-grup="'+g+'"]')):[b];pos=Math.max(0,llista.indexOf(b));if(!llista.length){llista=[b];pos=0;}mostra();caixa.hidden=false;document.getElementById("caixa-tanca").focus();}
  function tanca(){caixa.hidden=true;img.removeAttribute("src");if(torna&&torna.focus)torna.focus();}
  function mou(d){if(llista.length<2)return;pos=(pos+d+llista.length)%llista.length;mostra();}
  document.addEventListener("click",function(e){
    var b=e.target.closest(".boto-foto");
    if(b){obre(b);return;}
    if(e.target===caixa)tanca();
  });
  ant.addEventListener("click",function(){mou(-1);});
  seg.addEventListener("click",function(){mou(1);});
  document.getElementById("caixa-tanca").addEventListener("click",tanca);
  document.addEventListener("keydown",function(e){if(caixa.hidden)return;
    if(e.key==="Escape")tanca();else if(e.key==="ArrowLeft")mou(-1);else if(e.key==="ArrowRight")mou(1);
    else if(e.key==="Tab"){var f=Array.prototype.filter.call(caixa.querySelectorAll("button"),function(b){return !b.hidden;});if(!f.length)return;var i=f.indexOf(document.activeElement);
      if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&(i===f.length-1||i<0)){e.preventDefault();f[0].focus();}}});
  window.addEventListener("hashchange",function(){if(!caixa.hidden)tanca();});
})();

/* ---------- Data d'actualització ---------- */
/* Dades antigues: si una actualització automàtica falla, la web continua amb les últimes
   dades bones i avisa quan fa massa dies que no s'han actualitzat. */
var MAX_DIES={partits:10,botiga:21,instagram:30};
function diesDes(s){var d=dataLocal(s);return d?Math.floor((avuiZero()-d)/864e5):Infinity;}
function font(){
  var d=dataLocal(D.actualitzat), antic=diesDes(D.actualitzat)>MAX_DIES.partits;
  var t=d?"Dades de la Federació Catalana de Futbol, actualitzades el "+d.toLocaleDateString(LOCS[LANG])+".":"";
  ["partits-font"].forEach(function(id){var e=document.getElementById(id);if(!e)return;
    e.classList.toggle("avis-antic",antic);
    e.innerHTML=esc(t)+(antic?' <b>Pot ser que no estiguin al dia.</b> <a href="https://www.fcf.cat/ca/clubs/joventut-sant-pere-martir" target="_blank" rel="noopener">Consulta la FCF ↗</a>':'');});
  var bf=document.getElementById("botiga-font");
  if(bf&&B.actualitzat&&diesDes(B.actualitzat)>MAX_DIES.botiga){bf.hidden=false;bf.textContent="Els preus es van revisar el "+dataLocal(B.actualitzat).toLocaleDateString(LOCS[LANG])+" i podrien haver canviat: el preu vàlid és el de la botiga de TC Equipacions.";}
}

/* ---------- Inscripcions: categories, formulari ---------- */
function categoriesInsc(){
  var F=ANY_FI;
  return [
    {nom:"Escoleta",anys:(F-6)+" o després",mod:"Iniciació",min:F-6,max:9999},
    {nom:"Prebenjamí",anys:(F-8)+" i "+(F-7),mod:"Futbol 7",min:F-8,max:F-7},
    {nom:"Benjamí",anys:(F-10)+" i "+(F-9),mod:"Futbol 7",min:F-10,max:F-9},
    {nom:"Aleví",anys:(F-12)+" i "+(F-11),mod:"Futbol 7",min:F-12,max:F-11},
    {nom:"Infantil",anys:(F-14)+" i "+(F-13),mod:"Futbol 11",min:F-14,max:F-13},
    {nom:"Cadet",anys:(F-16)+" i "+(F-15),mod:"Futbol 11",min:F-16,max:F-15},
    {nom:"Juvenil",anys:(F-19)+", "+(F-18)+" i "+(F-17),mod:"Futbol 11",min:F-19,max:F-17},
    {nom:"Sènior",anys:(F-20)+" o abans",mod:"Futbol 11",min:0,max:F-20}
  ];
}
function catPerAny(y){var c=categoriesInsc();for(var i=0;i<c.length;i++){if(y>=c[i].min&&y<=c[i].max)return c[i];}return null;}
function pintaCategories(){
  var el=document.getElementById("taula-categories"); if(!el)return;
  var t=document.getElementById("insc-temporada"); if(t&&CLUB.temporada)t.textContent="Segons l'any de naixement, per a la temporada "+CLUB.temporada+" (categories de la Federació Catalana de Futbol).";
  el.innerHTML='<table><caption class="vh">Categories, anys de naixement i equips del club</caption><thead><tr><th scope="col">Categoria</th><th scope="col">Anys de naixement</th><th scope="col">Modalitat</th><th scope="col">Equips</th></tr></thead><tbody>'+
    categoriesInsc().map(function(c){var n=EQUIPS.filter(function(e){return catBase(e.nom)===c.nom;}).length;
      return '<tr><th scope="row">'+esc(c.nom)+'</th><td class="num">'+esc(c.anys)+'</td><td>'+esc(c.mod)+'</td><td class="num">'+n+'</td></tr>';}).join("")+'</tbody></table>';
  var sel=document.getElementById("f-categoria");
  if(sel&&!sel.options.length)sel.innerHTML='<option value="">No ho sé (que m\'ho diguin)</option>'+categoriesInsc().map(function(c){return '<option value="'+esc(c.nom)+'">'+esc(c.nom)+'</option>';}).join("");
}
function iniciaInscripcio(){
  var f=document.getElementById("form-inscripcio"); if(!f)return;
  var FC=CFG.formulari||{}, endpoint=(FC.endpoint||"").trim(), servei=FC.servei||(endpoint?"endpoint":"correu"), correu=CFG.email||(CLUB.contacte||{}).email||"olotjspm@gmail.com", t0=Date.now(), enviant=false;
  if(servei==="netlify"&&!/^https?:$/.test(location.protocol))servei="correu"; // Netlify Forms només funciona amb la web publicada a Netlify
  if(servei==="endpoint"&&!endpoint)servei="correu";
  var boto=document.getElementById("f-envia"), avis=document.getElementById("form-avis"), errs=document.getElementById("form-errors"), res=document.getElementById("form-resultat");
  if(servei!=="correu"){boto.textContent="Envia la preinscripció";avis.textContent="En enviar el formulari, les dades arriben directament al club.";}
  else avis.textContent="Aquesta web encara no té cap servidor per rebre formularis: en prémer el botó et prepararem un correu amb totes les dades per enviar-lo a "+correu+". No s'envia res fins que tu l'enviïs.";
  var naix=document.getElementById("f-naixement"), ajuda=document.getElementById("f-naixement-ajuda"), sel=document.getElementById("f-categoria"), auto=true;
  sel.addEventListener("change",function(){auto=false;});
  var campTutor=document.getElementById("camp-tutor"), tutor=document.getElementById("f-tutor");
  function edat(d){if(!d)return null;var n=new Date(d),a=new Date(),e=a.getFullYear()-n.getFullYear();if(a.getMonth()<n.getMonth()||(a.getMonth()===n.getMonth()&&a.getDate()<n.getDate()))e--;return e;}
  function menor(){var e=edat(naix.value);return e!==null&&e<18;}
  naix.addEventListener("change",function(){
    if(campTutor){campTutor.hidden=!menor();tutor.required=menor();}
    var y=naix.value?+naix.value.slice(0,4):0, c=y?catPerAny(y):null;
    ajuda.textContent=c?"Per l'any de naixement li correspon: "+c.nom+" ("+c.mod+")":"";
    if(c&&(auto||!sel.value)){sel.value=c.nom;auto=true;}
  });
  function err(el,msg){
    var id=el.id+"-error", e=document.getElementById(id);
    if(!e){e=document.createElement("small");e.className="error";e.id=id;(el.type==="checkbox"?el.parentNode:el.parentNode).appendChild(e);}
    e.textContent=msg; el.setAttribute("aria-invalid","true");
    var d=(el.getAttribute("aria-describedby")||"").split(" ").filter(Boolean); if(d.indexOf(id)<0){d.push(id);el.setAttribute("aria-describedby",d.join(" "));}
  }
  function neteja(){f.querySelectorAll(".error").forEach(function(e){e.remove();});f.querySelectorAll("[aria-invalid]").forEach(function(e){e.removeAttribute("aria-invalid");var d=(e.getAttribute("aria-describedby")||"").split(" ").filter(function(x){return x&&!/-error$/.test(x);});if(d.length)e.setAttribute("aria-describedby",d.join(" "));else e.removeAttribute("aria-describedby");});errs.hidden=true;errs.innerHTML="";}
  function val(n){return (f.elements[n].value||"").trim();}
  function valida(){
    neteja(); var llista=[];
    function mal(n,msg){var el=f.elements[n];err(el,msg);llista.push('<li><a href="#'+el.id+'" data-camp="'+el.id+'">'+esc(msg)+'</a></li>');}
    if(!val("nom"))mal("nom","Escriu el nom del jugador o jugadora.");
    if(!val("cognoms"))mal("cognoms","Escriu els cognoms.");
    var d=val("naixement"), y=d?+d.slice(0,4):0, avui=new Date();
    if(!d)mal("naixement","Indica la data de naixement.");
    else if(y<1940||new Date(d)>avui)mal("naixement","La data de naixement no és correcta.");
    if(!val("contacte"))mal("contacte","Escriu el nom de la persona de contacte.");
    if(val("telefon").replace(/\D/g,"").length<9)mal("telefon","Escriu un telèfon de contacte (mínim 9 xifres).");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val("email")))mal("email","Escriu un correu electrònic vàlid.");
    if(!f.elements.consentiment.checked)mal("consentiment","Cal acceptar l'ús de les dades per poder contactar-te.");
    if(menor()&&!f.elements.tutor_legal.checked)mal("tutor_legal","Si el jugador és menor d'edat, la sol·licitud l'ha d'enviar el pare, la mare o el tutor legal.");
    if(llista.length){errs.innerHTML='<p><b>Revisa aquests camps:</b></p><ul>'+llista.join("")+'</ul>';errs.hidden=false;errs.focus();}
    return !llista.length;
  }
  errs.addEventListener("click",function(e){var a=e.target.closest("[data-camp]");if(!a)return;e.preventDefault();var el=document.getElementById(a.getAttribute("data-camp"));if(el){el.focus();el.scrollIntoView({block:"center"});}});
  function missatge(){
    var d=val("naixement"), dt=d?d.split("-").reverse().join("/"):"";
    return "Preinscripció JSPM — temporada "+(CLUB.temporada||"")+"\n\n"+
      "Jugador/a: "+val("nom")+" "+val("cognoms")+"\nData de naixement: "+dt+"\nCategoria d'interès: "+(val("categoria")||"No ho sap")+
      "\nHa jugat abans en un club: "+val("club_anterior")+(val("quin_club")?" ("+val("quin_club")+")":"")+
      "\n\nPersona de contacte: "+val("contacte")+"\nTelèfon: "+val("telefon")+"\nCorreu: "+val("email")+
      (val("comentaris")?"\n\nComentaris:\n"+val("comentaris"):"")+
      "\n\nConsentiment protecció de dades: sí"+(menor()?"\nDeclara ser pare, mare o tutor legal: "+(f.elements.tutor_legal.checked?"sí":"no"):"")+
      "\nVol rebre informació del club: "+(f.elements.comunicacions.checked?"sí":"no")+"\n\nEnviat des del formulari de preinscripció de la web del JSPM.";
  }
  function assumpteInsc(){return "Preinscripció JSPM · "+(val("categoria")||"Sense categoria")+" · "+val("nom")+" "+val("cognoms");}
  function mostraRes(html){res.innerHTML=html;res.hidden=false;res.focus();res.scrollIntoView({block:"start",behavior:"smooth"});}
  function opcionsCorreu(txt,motiu){
    var assumpte=assumpteInsc();
    var mailto="mailto:"+correu+"?subject="+encodeURIComponent(assumpte)+"&body="+encodeURIComponent(txt);
    var gmail="https://mail.google.com/mail/?view=cm&fs=1&to="+encodeURIComponent(correu)+"&su="+encodeURIComponent(assumpte)+"&body="+encodeURIComponent(txt);
    mostraRes('<h3>'+(motiu||"El correu ja està preparat")+'</h3><p>Encara no s\'ha enviat res. Tria com vols enviar la preinscripció a <b>'+esc(correu)+'</b>:</p>'+
      '<div class="res-accions"><a class="boto" href="'+esc(mailto)+'">Obre el meu programa de correu</a><a class="boto clar" href="'+esc(gmail)+'" target="_blank" rel="noopener">Obre Gmail</a><button type="button" class="boto clar" id="copia-insc">Copia el text</button></div>'+
      '<label class="vh" for="text-insc">Text de la preinscripció</label><textarea id="text-insc" readonly rows="10" translate="no">'+esc(txt)+'</textarea>'+
      '<p class="petit">També pots trucar al coordinador: <a class="tel num" href="tel:+34628537764">628 53 77 64</a>.</p>');
    document.getElementById("copia-insc").addEventListener("click",function(){var t=document.getElementById("text-insc"),b=this;
      function ok(){b.textContent="Text copiat";}
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t.value).then(ok,function(){t.select();try{document.execCommand("copy");ok();}catch(e){}});else{t.select();try{document.execCommand("copy");ok();}catch(e){}}});
  }
  f.addEventListener("submit",function(e){
    e.preventDefault();
    if(enviant)return;
    if(f.elements.web.value)return; // camp trampa per a robots
    if(!valida())return;
    if(Date.now()-t0<3000){errs.innerHTML='<p>Espera uns segons i torna-ho a provar.</p>';errs.hidden=false;errs.focus();return;} // massa ràpid: probablement un robot
    var txt=missatge();
    if(servei==="correu"){opcionsCorreu(txt);return;}
    enviant=true; boto.disabled=true; boto.textContent="Enviant…";
    if(f.elements.subject)f.elements.subject.value=assumpteInsc(); // assumpte del correu d'avís de Netlify (permet filtrar per categoria)
    var fd=new FormData(f); fd.append("missatge",txt);
    var req=servei==="netlify"?fetch("/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(fd).toString()})
      :(fd.append("_subject",assumpteInsc()),fetch(endpoint,{method:"POST",body:fd,headers:{"Accept":"application/json"}}));
    req.then(function(r){
      if(!r.ok)throw new Error(r.status);
      f.reset(); ajuda.textContent=""; if(campTutor)campTutor.hidden=true;
      mostraRes('<h3>Preinscripció enviada</h3><p>Hem rebut les dades. El club es posarà en contacte amb vosaltres per concretar l\'entrenament de prova.</p>');
    }).catch(function(){
      opcionsCorreu(txt,"No s'ha pogut enviar el formulari");
    }).then(function(){enviant=false;boto.disabled=false;boto.textContent="Envia la preinscripció";});
  });
}

/* ---------- Pàgina actual ----------
   Cada secció és una pàgina pròpia (index.html, club/, equips/, partits/…).
   L'atribut data-pagina del <body> diu quina és. */
var PAGINA=document.body.getAttribute("data-pagina")||"inici";
var TITOL_ORIG=document.title;
function titolPagina(){
  var parts=TITOL_ORIG.split(" · ");
  if(PAGINA==="partits"){var e=perId(partitsActual()||"");if(e)parts=[tr("Partits")+" "+trNom(e.nom)].concat(parts.slice(-1));}
  if(PAGINA==="partit"){var pp=partitPerHash();if(pp)parts=[titolPartit(pp)+(pp.gol?" ("+pp.gol.local+"-"+pp.gol.visit+")":"")].concat(parts.slice(-1));}
  document.title=parts.map(function(x){return tr(x);}).join(" · ");
}

/* ---------- Pàgina de cada equip (equips/<nom>/) ---------- */
function pintaPaginaEquip(){
  var cont=document.getElementById("calendari-equip"); if(!cont)return;
  var slug=document.body.getAttribute("data-equip"), info=EQUIPS.filter(function(x){return x.slug===slug;})[0], eq=info&&info.fcf?perId(info.fcf):null;
  var html="";
  if(eq){
    var ps=tots(eq), avui=avuiZero();
    var pro=ps.filter(function(p){return !p.gol&&(!p.data||p.data>=avui);}).sort(perData);
    var res=ps.filter(function(p){return p.gol||(p.data&&p.data<avui);}).sort(perData).reverse();
    var pes=cont.getAttribute("data-pestanya")||"propers";
    html+='<div class="eines-partits"><div class="pestanyes" role="group" aria-label="Què vols veure"><button type="button" data-pes-eq="propers" aria-pressed="'+(pes==="propers")+'">Propers partits</button><button type="button" data-pes-eq="resultats" aria-pressed="'+(pes==="resultats")+'">Resultats</button></div></div>';
    var l=pes==="propers"?pro:res;
    html+='<h2 class="vh">'+(pes==="propers"?"Propers partits":"Resultats")+'</h2>';
    html+=l.length?perDies(l,{senseEquip:true}):'<div class="buit">'+(pes==="propers"?"No queden partits per jugar.":"Encara no s'ha jugat cap partit.")+'</div>';
    if(pro.length)html+='<p class="fitxa-acc"><button type="button" class="boto clar petit" data-ics-equip="'+esc(eq.id)+'">'+ICO_CAL+'<span>Afegeix tots els partits al calendari</span></button></p>';
  }else html+='<div class="buit">Aquest equip no juga una competició federada amb calendari publicat a la FCF.</div>';
  cont.innerHTML=html;
  // classificació (només si s'ha entrat al panell)
  var cl=document.getElementById("classificacio-equip"), c=(CLUB.classificacions||[]).filter(function(x){return info&&(x.equip===info.fcf||x.equip===info.slug);})[0];
  if(cl){
    if(c&&c.files&&c.files.length){cl.hidden=false;cl.innerHTML='<h2>Classificació</h2>'+(c.actualitzat?'<p class="petit">Actualitzada el '+esc(c.actualitzat.split("-").reverse().join("/"))+'</p>':'')+
      '<div class="taula-cat"><table><thead><tr><th scope="col">Pos.</th><th scope="col">Equip</th><th scope="col">PJ</th><th scope="col">Punts</th></tr></thead><tbody>'+
      c.files.map(function(f){return '<tr'+(f.jspm?' class="nos"':'')+'><td class="num">'+esc(f.posicio)+'</td><th scope="row">'+esc(f.equip)+'</th><td class="num">'+esc(f.jugats||"")+'</td><td class="num">'+esc(f.punts)+'</td></tr>';}).join("")+'</tbody></table></div>';}
    else cl.hidden=true;
  }
  // jugadors (només amb autorització marcada al panell)
  var jg=document.getElementById("jugadors-equip");
  if(jg){if(info&&info.mostrar_jugadors&&info.jugadors&&info.jugadors.length){jg.hidden=false;jg.innerHTML='<h2>Plantilla</h2><ul class="plantilla">'+info.jugadors.map(function(x){return '<li>'+(x.dorsal?'<b class="num">'+esc(x.dorsal)+'</b>':'')+'<span>'+esc(x.nom)+'</span>'+(x.posicio?'<small>'+esc(x.posicio)+'</small>':'')+'</li>';}).join("")+'</ul>';}else jg.hidden=true;}
}
document.addEventListener("click",function(e){var b=e.target.closest("[data-pes-eq]");if(!b)return;document.getElementById("calendari-equip").setAttribute("data-pestanya",b.getAttribute("data-pes-eq"));pintaPaginaEquip();});

/* ---------- Portada: accés ràpid als equips ---------- */
function pintaXipsEquips(){
  var el=document.getElementById("xips-equips"); if(!el)return;
  el.innerHTML=EQUIPS.map(function(e){return '<a href="equips/'+esc(e.slug)+'/">'+esc(e.nom.replace(" Masculí",""))+'</a>';}).join("");
}

/* ---------- Enllaços ----------
   · #àncores dins la mateixa pàgina (salt al contingut, grups d'equips…)
   · Obrint la web des de l'ordinador (file://), "partits/" → "partits/index.html" */
document.addEventListener("click",function(e){
  var a=e.target.closest("a[href]"); if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  var href=a.getAttribute("href");
  if(href.charAt(0)==="#"){
    var h=href.slice(1); if(!h)return;
    if(PAGINA==="partits"&&perId(h.replace(/^partits-/,""))){e.preventDefault();location.hash="#"+h.replace(/^partits-/,"");return;}
    var t=document.getElementById(h); if(!t)return; e.preventDefault();
    if(!t.hasAttribute("tabindex")&&!/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName))t.setAttribute("tabindex","-1");
    t.scrollIntoView({behavior:movimentReduit()?"auto":"smooth",block:"start"}); t.focus({preventScroll:true}); return;
  }
  if(location.protocol==="file:"&&!a.target&&!/^[a-z]+:/i.test(href)&&/(^|\/)$/.test(href.split("#")[0])){
    e.preventDefault(); var u=new URL(href,document.baseURI); u.pathname+="index.html"; location.href=u.href;
  }
});
/* Imatges: substituts sense atributs onerror/onload (compatible amb una política CSP estricta) */
function errImg(im){
  var m=im.getAttribute("data-err"); if(!m)return;
  var s=im.getAttribute("src")||"";
  if(/^mini/.test(m)&&s.indexOf("img/mini/")>=0){im.src=s.replace("img/mini/","img/");return;}
  if(m==="escut"){var r=im.getAttribute("data-remot");if(r&&s!==r){im.removeAttribute("data-remot");im.src=r;return;}var i=document.createElement("i");i.textContent=im.getAttribute("data-ini")||"";im.replaceWith(i);return;}
  if(/pare$/.test(m)&&im.parentNode)im.parentNode.remove();else im.remove();
}
function carregaImg(im){if(im.getAttribute("data-load")==="treu-anterior"){var p=im.previousElementSibling;if(p)p.remove();im.removeAttribute("data-load");}}
document.addEventListener("error",function(e){if(e.target&&e.target.tagName==="IMG")errImg(e.target);},true);
document.addEventListener("load",function(e){if(e.target&&e.target.tagName==="IMG")carregaImg(e.target);},true);
function revisaImatges(){document.querySelectorAll("img[data-err],img[data-load]").forEach(function(im){if(!im.complete)return;if(im.naturalWidth===0&&im.getAttribute("src"))errImg(im);else if(im.naturalWidth>0)carregaImg(im);});}

/* Menú mòbil */
function tancaMenu(focus){var m=document.getElementById("menu"),b=document.getElementById("obre-menu");if(!m.classList.contains("obert"))return;m.classList.remove("obert");b.setAttribute("aria-expanded","false");if(focus)b.focus();}
document.getElementById("obre-menu").addEventListener("click",function(){var m=document.getElementById("menu");var o=m.classList.toggle("obert");this.setAttribute("aria-expanded",o?"true":"false");if(o){var p=m.querySelector("a");if(p)p.focus();}});
document.addEventListener("keydown",function(e){if(e.key==="Escape")tancaMenu(true);});
document.addEventListener("click",function(e){if(!e.target.closest("header.cap"))tancaMenu(false);});
window.addEventListener("hashchange",function(){if(PAGINA==="partits"){pintaPartits(partitsActual());titolPagina();}if(PAGINA==="partit"){pintaPartit();titolPagina();window.scrollTo(0,0);}});

function ajustaMenu(){
  var cap=document.querySelector("header.cap"), nav=document.getElementById("menu"), marca=cap.querySelector(".marca");
  cap.classList.remove("compacte");
  if(getComputedStyle(nav).position==="absolute")return;
  var b=marca.querySelector("b"), dreta=marca.getBoundingClientRect().left+marca.scrollWidth;
  if(nav.scrollWidth>nav.clientWidth+1||dreta>nav.getBoundingClientRect().left-8)cap.classList.add("compacte");
}
window.addEventListener("resize",ajustaMenu);
document.querySelectorAll(".idiomes button[data-idioma]").forEach(function(b){b.addEventListener("click",function(){canviaIdioma(b.getAttribute("data-idioma"));});});
pintaEquips(); pintaPat(); pintaBotiga(); pintaGaleria(); pintaPartitsInici(); pintaNoticies(); pintaContacte(); pintaCategories(); iniciaInscripcio(); pintaXipsEquips(); heroFotos(); pintaInsta(); instaEnDirecte(); cintaPat(); animaPortada(); font(); if(PAGINA==="partits")pintaPartits(partitsActual()); pintaPaginaEquip(); pintaPartit(); revisaImatges();
marcaIdioma(); if(LANG!=="ca")traduir(document.body); titolPagina(); observa(); ajustaMenu(); if(document.fonts&&document.fonts.ready)document.fonts.ready.then(ajustaMenu);
})();
