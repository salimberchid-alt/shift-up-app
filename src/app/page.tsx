"use client";

import { useState, useEffect, useRef } from "react";

const DC = {
  bg:"#06060F", surface:"#0C0C18", card:"#111120",
  border:"#1C1C2E", accent:"#FF4D6D", accentSoft:"#FF4D6D14", accentBorder:"#FF4D6D35",
  green:"#05D9A0",
  yellow:"#FFD166",
  blue:"#4EA8DE",
  text:"#EEEEFF", muted:"#52527A", soft:"#161625",
};

const JOBS_DEMO = [
  {id:1,emoji:"☕",title:"Barista",company:"Café Noir",pay:"$18/h",match:96,dist:"0.8",urgent:true,tags:["Part-time","Mornings 6–11am","Customer-facing"]},
  {id:2,emoji:"📦",title:"Warehouse Associate",company:"QuickShip MTL",pay:"$22/h",match:89,dist:"2.1",urgent:true,tags:["Full-time","Days","Physical"]},
  {id:3,emoji:"🛍️",title:"Retail Associate",company:"Boutique Lux",pay:"$17/h",match:74,dist:"1.4",urgent:false,tags:["Part-time","Flexible","Bilingual"]},
];

function mColor(s: number){ return s>=85?"#05D9A0":s>=70?"#FFD166":s>=55?"#4EA8DE":"#FF4D6D"; }

function DemoRing({score,size=40,stroke=3.5}:{score:number;size?:number;stroke?:number}){
  const r=(size-stroke*2)/2,circ=2*Math.PI*r,dash=circ*(score/100),col=mColor(score);
  return(
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1C1C2E" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{fill:col,fontSize:size*.2,fontWeight:800,fontFamily:"sans-serif",transform:"rotate(90deg)",transformOrigin:"center"}}>{score}%</text>
    </svg>
  );
}

interface Job {
  id: number; emoji: string; title: string; company: string;
  pay: string; match: number; dist: string; urgent: boolean; tags: string[];
}

function JobCard({job,onSwipe,lang}:{job:Job;onSwipe:(dir:string)=>void;lang:string}){
  const isFr=lang==="fr";
  const [drag,setDrag]=useState(0);
  const [anim,setAnim]=useState<string|null>(null);
  const startX=useRef<number|null>(null);

  const doSwipe=(dir:string)=>{ setAnim(dir); setTimeout(()=>onSwipe(dir),350); };
  const onPointerDown=(e:React.PointerEvent)=>{ startX.current=e.clientX; };
  const onPointerUp=(e:React.PointerEvent)=>{
    if(startX.current===null)return;
    const dx=e.clientX-startX.current;
    setDrag(0);
    if(Math.abs(dx)>60) doSwipe(dx>0?"right":"left");
    startX.current=null;
  };
  const onPointerMove=(e:React.PointerEvent)=>{ if(startX.current===null)return; setDrag(e.clientX-startX.current); };
  const tilt=drag*0.08;
  const opacity=1-Math.min(Math.abs(drag)/200,0.4);

  return(
    <div onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerMove={onPointerMove}
      style={{background:DC.card,borderRadius:22,border:`1.5px solid ${DC.border}`,padding:"18px 16px",userSelect:"none",cursor:"grab",touchAction:"none",
        transform:anim==="right"?`translateX(130%) rotate(16deg)`:anim==="left"?`translateX(-130%) rotate(-16deg)`:`translateX(${drag}px) rotate(${tilt}deg)`,
        opacity:anim?0:opacity,transition:anim?"transform 0.35s ease,opacity 0.35s":"none",position:"relative",overflow:"hidden"}}>
      {job.urgent&&(
        <div style={{position:"absolute",top:14,left:14,background:"#FF4D6D22",border:"1.5px solid #FF4D6D55",borderRadius:100,padding:"3px 10px",fontSize:10,fontWeight:800,color:DC.accent,display:"flex",gap:5,alignItems:"center"}}>
          🔥 {isFr?"EMBAUCHE MAINTENANT":"HIRING NOW"} · <DemoRing score={job.match} size={28} stroke={2.5}/>
        </div>
      )}
      <div style={{height:28}}/>
      <div style={{fontSize:36,marginBottom:8}}>{job.emoji}</div>
      <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:22,fontWeight:800,color:DC.text,marginBottom:3}}>{job.title}</div>
      <div style={{fontSize:12,color:DC.muted,marginBottom:12}}>{job.company} · {job.dist} km</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
        {job.tags.map(t=>(
          <span key={t} style={{background:DC.soft,border:`1px solid ${DC.border}`,borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600,color:DC.text}}>{t}</span>
        ))}
      </div>
      <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:26,fontWeight:800,color:DC.green,marginBottom:4}}>{job.pay}</div>
      <div style={{fontSize:11,color:DC.muted,marginBottom:16}}>{isFr?"Expérience non requise · Pourboires":"No exp needed · Tips"}</div>
      <button style={{width:"100%",padding:"13px",borderRadius:13,background:`linear-gradient(135deg,${DC.accent},#FF8A65)`,border:"none",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"sans-serif",boxShadow:`0 5px 20px ${DC.accent}28`}}>
        ⚡ {isFr?"Postuler maintenant":"Instant Apply"}
      </button>
    </div>
  );
}

function ShiftUpDemo({lang}:{lang:string}){
  const isFr=lang==="fr";
  const [jobs,setJobs]=useState<Job[]>(JOBS_DEMO);
  const [matched,setMatched]=useState<Job|null>(null);
  const [filter,setFilter]=useState("all");
  const filters=isFr
    ?[["all","Tous"],["urgent","Urgent"],["nearby","Proche"],["weekend","Week-end"]]
    :[["all","All"],["urgent","Urgent"],["nearby","Nearby"],["weekend","Weekend"]];
  const handleSwipe=(dir:string)=>{ if(dir==="right") setMatched(jobs[0]); setJobs(p=>p.slice(1)); };

  if(matched){
    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:12}}>🎉</div>
        <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:22,fontWeight:800,color:DC.text,marginBottom:6}}>{isFr?"C'est un match!":"It's a match!"}</div>
        <div style={{fontSize:13,color:DC.muted,marginBottom:20}}>{isFr?`Toi et ${matched.company} êtes connectés.`:`You and ${matched.company} are connected.`}</div>
        <div style={{display:"flex",gap:10,width:"100%"}}>
          <button style={{flex:1,padding:"12px",borderRadius:12,background:DC.soft,border:`1px solid ${DC.border}`,color:DC.text,fontWeight:600,fontSize:13}} onClick={()=>{setMatched(null);setJobs(JOBS_DEMO);}}>
            {isFr?"Continuer":"Keep swiping"}
          </button>
          <button style={{flex:1,padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${DC.accent},#FF8A65)`,border:"none",color:"#fff",fontWeight:700,fontSize:13}}>
            💬 Message
          </button>
        </div>
      </div>
    );
  }

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"14px 14px 8px"}}>
        <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:20,fontWeight:800,color:DC.text,marginBottom:2}}>{isFr?"Tes matchs ✨":"Your matches ✨"}</div>
        <div style={{fontSize:11,color:DC.muted,marginBottom:12}}>{isFr?"Selon tes disponibilités":"Based on your availability"}</div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
          {filters.map(([id,label])=>(
            <button key={id} onClick={()=>setFilter(id)} style={{flexShrink:0,padding:"6px 14px",borderRadius:100,border:`2px solid ${filter===id?DC.accent:DC.border}`,background:filter===id?DC.accentSoft:DC.soft,color:filter===id?DC.accent:DC.muted,fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,padding:"8px 14px 14px",position:"relative"}}>
        {jobs.length===0?(
          <div style={{textAlign:"center",paddingTop:40}}>
            <div style={{fontSize:40,marginBottom:12}}>👀</div>
            <div style={{color:DC.muted,fontSize:13}}>{isFr?"Reviens bientôt!":"Check back soon!"}</div>
            <button onClick={()=>setJobs(JOBS_DEMO)} style={{marginTop:16,padding:"10px 20px",borderRadius:12,background:DC.accentSoft,border:`1px solid ${DC.accentBorder}`,color:DC.accent,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              {isFr?"Recommencer":"Restart demo"}
            </button>
          </div>
        ):(
          <>
            <JobCard key={jobs[0].id} job={jobs[0]} onSwipe={handleSwipe} lang={lang}/>
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 4px 0",fontSize:11,fontWeight:700,color:DC.muted}}>
              <span style={{color:DC.accent}}>← {isFr?"Passer":"Pass"}</span>
              <span>{isFr?"Glisse pour choisir":"Drag to choose"}</span>
              <span style={{color:DC.green}}>{isFr?"Postuler":"Apply"} →</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PhoneDemo({lang}:{lang:string}){
  const isFr=lang==="fr";
  const [mode,setMode]=useState<string|null>(null);
  return(
    <div style={{background:DC.bg,height:"100%",display:"flex",flexDirection:"column",borderRadius:"inherit",overflow:"hidden",fontFamily:"sans-serif"}}>
      <div style={{padding:"10px 14px 8px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${DC.border}`,background:DC.surface,flexShrink:0}}>
        <span style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:15,fontWeight:800,background:`linear-gradient(135deg,${DC.accent},${DC.yellow})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ShiftUp ⚡</span>
        <div style={{display:"flex",background:DC.soft,borderRadius:7,padding:2,gap:2}}>
          {["fr","en"].map(l=>(
            <button key={l} style={{padding:"3px 8px",borderRadius:5,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",background:lang===l?DC.accent:"transparent",color:lang===l?"#fff":DC.muted}}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {!mode?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 20px",textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:12,lineHeight:1}}>⚡</div>
          <h2 style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:26,fontWeight:800,color:DC.text,letterSpacing:"-0.5px",lineHeight:1.1,marginBottom:8}}>ShiftUp</h2>
          <p style={{fontSize:13,color:DC.muted,lineHeight:1.6,marginBottom:28}}>{isFr?"Swipe pour trouver ton quart idéal.":"Swipe your way to the perfect shift."}</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:260}}>
            <button onClick={()=>setMode("worker")} style={{width:"100%",padding:"13px",borderRadius:12,background:`linear-gradient(135deg,${DC.accent},#FF8A65)`,border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {isFr?"👤 Je cherche du travail":"👤 I'm looking for work"}
            </button>
            <button onClick={()=>setMode("employer")} style={{width:"100%",padding:"13px",borderRadius:12,background:`linear-gradient(135deg,${DC.green},#00B4D8)`,border:"none",color:DC.bg,fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {isFr?"🏢 Je suis employeur":"🏢 I'm hiring"}
            </button>
          </div>
        </div>
      ):mode==="worker"?(
        <ShiftUpDemo lang={lang}/>
      ):(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>🏢</div>
          <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:18,fontWeight:800,color:DC.text,marginBottom:8}}>{isFr?"Mode employeur":"Employer mode"}</div>
          <div style={{fontSize:12,color:DC.muted,lineHeight:1.6,marginBottom:20}}>{isFr?"Trouvez les meilleurs candidats, vérifiés et matchés selon vos besoins.":"Find top candidates, verified and matched to your needs."}</div>
          <div style={{background:DC.card,borderRadius:14,border:`1px solid ${DC.border}`,padding:16,width:"100%",marginBottom:12,textAlign:"left"}}>
            <div style={{fontSize:10,fontWeight:800,color:DC.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>{isFr?"CANDIDATS RECOMMANDÉS":"TOP CANDIDATES"}</div>
            {[{n:"Alexandre M.",r:"96%",j:isFr?"Barista · 2 ans exp.":"Barista · 2 yrs exp.",c:DC.green},{n:"Sofia R.",r:"89%",j:isFr?"Service · Bilingue":"Service · Bilingual",c:DC.blue}].map(c=>(
              <div key={c.n} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${DC.border}`}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${DC.accent},${DC.yellow})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>{c.n[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:DC.text}}>{c.n}</div>
                  <div style={{fontSize:10,color:DC.muted}}>{c.j}</div>
                </div>
                <div style={{fontSize:12,fontWeight:800,color:c.c}}>{c.r}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setMode(null)} style={{padding:"10px 20px",borderRadius:10,background:DC.soft,border:`1px solid ${DC.border}`,color:DC.muted,fontSize:12,fontWeight:600,cursor:"pointer"}}>
            ← {isFr?"Retour":"Back"}
          </button>
        </div>
      )}
      {mode&&(
        <div style={{display:"flex",borderTop:`1px solid ${DC.border}`,background:DC.surface,flexShrink:0}}>
          {[["⚡","Swipe"],["💬",isFr?"Messages":"Messages"],["👤",isFr?"Profil":"Profile"]].map(([icon,label],i)=>(
            <button key={label} style={{flex:1,padding:"10px 0 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",fontSize:8,fontWeight:700,letterSpacing:"0.5px",textTransform:"uppercase",color:i===0?DC.accent:DC.muted,cursor:"pointer"}}>
              <span style={{fontSize:16}}>{icon}</span>{label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN LANDING PAGE ─────────────────────────────────────────────────────────
const COLORS = {
  bg:"#06060F", surface:"#0C0C18", card:"#111120", border:"#1C1C2E",
  accent:"#FF4D6D", green:"#05D9A0", yellow:"#FFD166",
  text:"#EEEEFF", muted:"#52527A", soft:"#161625",
};

const CONTENT = {
  fr: {
    nav:{logo:"ShiftUp",cta:"Accès anticipé"},
    hero:{eyebrow:"Montréal · Lancement 2025",headline:"Trouve ton quart.\nEn un swipe.",sub:"Pas d'applications interminables. ShiftUp te connecte aux employeurs qui correspondent à ton horaire — immédiatement.",cta1:"Je cherche du travail →",cta2:"Je recrute →",tag:"100% gratuit pour les travailleurs"},
    demo:{label:"🎮 Essaie la démo live",sub:"Clique et swipe — c'est la vraie app."},
    how:{title:"Comment ça marche",steps:[{n:"01",icon:"👤",title:"Crée ton profil",body:"Disponibilités, type de travail, distance max. 3 minutes."},{n:"02",icon:"⚡",title:"Reçois tes matchs",body:"On trouve les postes qui correspondent à TON horaire. Pas l'inverse."},{n:"03",icon:"🔥",title:"Swipe & postule",body:"Droite pour postuler, gauche pour passer. Simple comme ça."},{n:"04",icon:"🎉",title:"Décroché!",body:"L'employeur confirme, tu travailles. Tout ça sans envoyer un seul CV à l'aveugle."}]},
    forWorkers:{eyebrow:"Pour les travailleurs",title:"Ton horaire.\nTes conditions.",points:[{icon:"🆓",title:"100% gratuit",body:"Toujours. Aucun abonnement, aucune surprise."},{icon:"📍",title:"Par distance",body:"Filtre par kilomètres, pas par arrondissement flou."},{icon:"⚡",title:"Embauche immédiate",body:"Vois seulement les postes qui embauchent maintenant."},{icon:"🔒",title:"Profil privé",body:"Ton CV est partagé seulement quand tu postules."}]},
    forEmployers:{eyebrow:"Pour les employeurs",title:"Les bons candidats.\nSans le tri.",points:[{icon:"🎯",title:"Candidats pré-filtrés",body:"Chaque profil est vérifié et scoré avant d'arriver chez vous."},{icon:"💬",title:"Questions personnalisées",body:"Posez jusqu'à 20 questions de présélection — les candidats répondent en postulant."},{icon:"📅",title:"Entretien en 1 clic",body:"Planifiez directement dans l'app. Paiement unique à la confirmation."},{icon:"🔄",title:"Zéro abonnement",body:"Payez seulement quand vous trouvez quelqu'un. Logique."}]},
    pricing:{worker:{points:["Swipe illimité","Postule en 1 clic","Profil privé","Alertes temps réel"]},bundles:[{label:"1 match",price:"$25",save:"À l'unité",color:COLORS.accent},{label:"1 super like ⭐",price:"$5 + $25",save:"Profil mis en avant",color:COLORS.yellow},{label:"10 matchs",price:"$99",save:"Économise $151",color:COLORS.green},{label:"Illimité/mois",price:"$189.99/mo",save:"Meilleur rapport",color:"#4EA8DE"}]},
    stores:{coming:"App bientôt disponible",ios:"App Store",android:"Google Play"},
    waitlist:{title:"Sois parmi les premiers.",sub:"On lance à Montréal. Liste d'attente ouverte — travailleurs et employeurs.",placeholder:"ton@courriel.com",cta:"Rejoindre la liste →",tag:"Aucun spam. On te contacte avant le lancement.",roleWorker:"👤 Je cherche du travail",roleEmployer:"🏢 Je recrute",dashboard:"Accéder au dashboard employeur →"},
    footer:{tagline:"Un produit Slim-IA · Montréal",links:["slim-ia.ca","Confidentialité","Conditions"]},
  },
  en: {
    nav:{logo:"ShiftUp",cta:"Early Access"},
    hero:{eyebrow:"Montréal · Launching 2025",headline:"Find your shift.\nIn one swipe.",sub:"No endless applications. ShiftUp connects you with employers that fit your schedule — instantly.",cta1:"I'm looking for work →",cta2:"I'm hiring →",tag:"Always free for workers"},
    demo:{label:"🎮 Try the live demo",sub:"Click and swipe — it's the real app."},
    how:{title:"How it works",steps:[{n:"01",icon:"👤",title:"Create your profile",body:"Availability, job type, max distance. 3 minutes."},{n:"02",icon:"⚡",title:"Get your matches",body:"We find jobs that fit YOUR schedule. Not the other way around."},{n:"03",icon:"🔥",title:"Swipe & apply",body:"Right to apply, left to pass. That simple."},{n:"04",icon:"🎉",title:"You're hired!",body:"Employer confirms, you work. No blind resume sending."}]},
    forWorkers:{eyebrow:"For workers",title:"Your schedule.\nYour terms.",points:[{icon:"🆓",title:"100% free",body:"Always. No subscription, no surprises."},{icon:"📍",title:"By distance",body:"Filter by kilometres, not vague neighbourhood names."},{icon:"⚡",title:"Immediate hiring",body:"See only jobs that are hiring right now."},{icon:"🔒",title:"Private profile",body:"Your resume is shared only when you apply."}]},
    forEmployers:{eyebrow:"For employers",title:"The right candidates.\nWithout the sorting.",points:[{icon:"🎯",title:"Pre-screened candidates",body:"Every profile is verified and scored before you see them."},{icon:"💬",title:"Custom questions",body:"Ask up to 20 screening questions — candidates answer on apply."},{icon:"📅",title:"1-click interview",body:"Schedule directly in the app. One-time payment on confirmation."},{icon:"🔄",title:"Zero subscription",body:"Pay only when you find someone. Makes sense."}]},
    pricing:{worker:{points:["Unlimited swiping","1-click apply","Private profile","Real-time alerts"]},bundles:[{label:"1 match",price:"$25",save:"Pay as you go",color:COLORS.accent},{label:"1 super like ⭐",price:"$5 + $25",save:"Featured profile",color:COLORS.yellow},{label:"10 matches",price:"$99",save:"Save $151",color:COLORS.green},{label:"Unlimited/mo",price:"$189.99/mo",save:"Best value",color:"#4EA8DE"}]},
    stores:{coming:"App coming soon",ios:"App Store",android:"Google Play"},
    waitlist:{title:"Be among the first.",sub:"We're launching in Montréal. Waitlist open — workers and employers.",placeholder:"your@email.com",cta:"Join the waitlist →",tag:"No spam. We'll reach out before launch.",roleWorker:"👤 I'm looking for work",roleEmployer:"🏢 I'm hiring",dashboard:"Access employer dashboard →"},
    footer:{tagline:"A Slim-IA product · Montréal",links:["slim-ia.ca","Privacy","Terms"]},
  },
};

function useInView(ref: React.RefObject<HTMLDivElement | null>){
  const [inView,setInView]=useState(false);
  useEffect(()=>{
    if(!ref.current)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setInView(true);},{threshold:0.15});
    obs.observe(ref.current);
    return()=>obs.disconnect();
  },[ref]);
  return inView;
}

function FadeIn({children,delay=0}:{children:React.ReactNode;delay?:number}){
  const ref=useRef<HTMLDivElement>(null);
  const inView=useInView(ref);
  return(
    <div ref={ref} style={{opacity:inView?1:0,transform:inView?"translateY(0)":"translateY(24px)",transition:`opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`}}>
      {children}
    </div>
  );
}

export default function ShiftUpLanding(){
  const [lang,setLang]=useState<"fr"|"en">("fr");
  const t=CONTENT[lang];
  const [email,setEmail]=useState("");
  const [submitted,setSubmitted]=useState(false);

  return(
    <div style={{background:COLORS.bg,color:COLORS.text,fontFamily:"'Instrument Sans','Inter',system-ui,sans-serif",minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&family=Bricolage+Grotesque:wght@400;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#06060F;}
        ::selection{background:#FF4D6D33;color:#EEEEFF;}
        input{background:#161625;border:1.5px solid #1C1C2E;border-radius:11px;padding:13px 16px;color:#EEEEFF;font-size:14px;font-family:'Instrument Sans',sans-serif;outline:none;transition:border-color .2s;width:100%;}
        input:focus{border-color:#FF4D6D;}
        input::placeholder{color:#52527A;}
      `}</style>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:`${COLORS.bg}EE`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${COLORS.border}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:1200,margin:"0 auto"}}>
        <span style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:20,fontWeight:800,background:`linear-gradient(135deg,${COLORS.accent},${COLORS.yellow})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ShiftUp ⚡</span>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{display:"flex",background:COLORS.soft,borderRadius:9,padding:3,gap:2}}>
            {(["fr","en"] as const).map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{padding:"5px 12px",borderRadius:7,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",background:lang===l?COLORS.accent:"transparent",color:lang===l?"#fff":COLORS.muted,transition:"all .14s",fontFamily:"'Instrument Sans',sans-serif"}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a href="#waitlist" style={{padding:"8px 18px",borderRadius:10,background:`linear-gradient(135deg,${COLORS.accent},#FF8A65)`,border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",textDecoration:"none",fontFamily:"'Instrument Sans',sans-serif"}}>
            {t.nav.cta}
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{maxWidth:1200,margin:"0 auto",padding:"80px 24px 60px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
        <div>
          <FadeIn>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${COLORS.accent}14`,border:`1px solid ${COLORS.accent}35`,borderRadius:100,padding:"6px 14px",fontSize:11,fontWeight:700,color:COLORS.accent,marginBottom:24,letterSpacing:"0.5px"}}>
              📍 {t.hero.eyebrow}
            </div>
            <h1 style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:"clamp(36px,5vw,58px)",fontWeight:800,color:COLORS.text,letterSpacing:"-1.5px",lineHeight:1.05,marginBottom:20,whiteSpace:"pre-line"}}>{t.hero.headline}</h1>
            <p style={{fontSize:16,color:COLORS.muted,lineHeight:1.7,marginBottom:32,maxWidth:480}}>{t.hero.sub}</p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
              <a href="#waitlist" style={{padding:"14px 24px",borderRadius:13,background:`linear-gradient(135deg,${COLORS.accent},#FF8A65)`,border:"none",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",textDecoration:"none",fontFamily:"'Instrument Sans',sans-serif",boxShadow:`0 8px 28px ${COLORS.accent}30`}}>
                {t.hero.cta1}
              </a>
              <a href="#employers" style={{padding:"14px 24px",borderRadius:13,background:COLORS.soft,border:`1.5px solid ${COLORS.border}`,color:COLORS.text,fontSize:15,fontWeight:700,cursor:"pointer",textDecoration:"none",fontFamily:"'Instrument Sans',sans-serif"}}>
                {t.hero.cta2}
              </a>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
              {[{icon:"🍎",label:t.stores.ios},{icon:"🤖",label:t.stores.android}].map(s=>(
                <div key={s.label} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:11,background:COLORS.soft,border:`1.5px solid ${COLORS.border}`,cursor:"not-allowed",opacity:0.7}}>
                  <span style={{fontSize:16}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:9,color:COLORS.muted,fontWeight:600,lineHeight:1}}>{t.stores.coming}</div>
                    <div style={{fontSize:13,color:COLORS.text,fontWeight:700,lineHeight:1.3}}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{fontSize:12,color:COLORS.green,fontWeight:600}}>✅ {t.hero.tag}</div>
          </FadeIn>
        </div>
        <FadeIn delay={0.15}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
            <div style={{fontSize:12,fontWeight:700,color:COLORS.muted,letterSpacing:"1px",textTransform:"uppercase"}}>{t.demo.label}</div>
            <div style={{width:320,height:620,background:"#1a1a2e",borderRadius:44,border:"8px solid #2a2a3e",boxShadow:"0 40px 80px #000A, 0 0 0 1px #ffffff08, inset 0 0 0 1px #ffffff05",overflow:"hidden",position:"relative"}}>
              <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:100,height:26,background:"#1a1a2e",borderRadius:"0 0 18px 18px",zIndex:10}}/>
              <div style={{height:"100%",paddingTop:26,display:"flex",flexDirection:"column"}}>
                <PhoneDemo lang={lang}/>
              </div>
            </div>
            <div style={{fontSize:11,color:COLORS.muted}}>{t.demo.sub}</div>
          </div>
        </FadeIn>
      </section>

      {/* HOW IT WORKS */}
      <section style={{background:COLORS.surface,borderTop:`1px solid ${COLORS.border}`,borderBottom:`1px solid ${COLORS.border}`,padding:"80px 24px"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <FadeIn>
            <div style={{textAlign:"center",marginBottom:56}}>
              <h2 style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:"clamp(28px,4vw,42px)",fontWeight:800,color:COLORS.text,letterSpacing:"-0.8px"}}>{t.how.title}</h2>
            </div>
          </FadeIn>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:24}}>
            {t.how.steps.map((step,i)=>(
              <FadeIn key={step.n} delay={i*0.1}>
                <div style={{background:COLORS.card,border:`1px solid ${COLORS.border}`,borderRadius:18,padding:24,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:16,right:16,fontFamily:"'Bricolage Grotesque',serif",fontSize:36,fontWeight:800,color:COLORS.soft,lineHeight:1}}>{step.n}</div>
                  <div style={{fontSize:32,marginBottom:12}}>{step.icon}</div>
                  <div style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:16,fontWeight:800,color:COLORS.text,marginBottom:8}}>{step.title}</div>
                  <div style={{fontSize:13,color:COLORS.muted,lineHeight:1.6}}>{step.body}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WORKERS */}
      <section style={{padding:"80px 24px"}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
          <FadeIn>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:COLORS.accent,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:16}}>{t.forWorkers.eyebrow}</div>
              <h2 style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:"clamp(26px,3.5vw,38px)",fontWeight:800,color:COLORS.text,letterSpacing:"-0.8px",lineHeight:1.1,marginBottom:32,whiteSpace:"pre-line"}}>{t.forWorkers.title}</h2>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {t.forWorkers.points.map(p=>(
                  <div key={p.title} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <div style={{width:40,height:40,borderRadius:12,background:`${COLORS.accent}14`,border:`1px solid ${COLORS.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.icon}</div>
                    <div>
                      <div style={{fontWeight:700,color:COLORS.text,marginBottom:3,fontSize:14}}>{p.title}</div>
                      <div style={{fontSize:13,color:COLORS.muted,lineHeight:1.5}}>{p.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{background:`linear-gradient(135deg,${COLORS.accent}10,${COLORS.yellow}08)`,border:`1px solid ${COLORS.accent}20`,borderRadius:24,padding:32,textAlign:"center"}}>
              <div style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:56,fontWeight:800,color:COLORS.green,marginBottom:4}}>$0</div>
              <div style={{fontSize:14,color:COLORS.muted,marginBottom:20}}>{lang==="fr"?"Pour les travailleurs. Toujours.":"For workers. Always."}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {t.pricing.worker.points.map(p=>(
                  <div key={p} style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:COLORS.text}}>
                    <span style={{color:COLORS.green,fontWeight:700}}>✓</span>{p}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOR EMPLOYERS */}
      <section id="employers" style={{background:COLORS.surface,borderTop:`1px solid ${COLORS.border}`,borderBottom:`1px solid ${COLORS.border}`,padding:"80px 24px"}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
          <FadeIn>
            <div style={{background:`linear-gradient(135deg,${COLORS.green}10,#4EA8DE08)`,border:`1px solid ${COLORS.green}20`,borderRadius:24,padding:32}}>
              <div style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:18,fontWeight:800,color:COLORS.text,marginBottom:20}}>{lang==="fr"?"Forfaits employeur":"Employer plans"}</div>
              {t.pricing.bundles.map(b=>(
                <div key={b.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${COLORS.border}`}}>
                  <div>
                    <div style={{fontWeight:700,color:COLORS.text,fontSize:14}}>{b.label}</div>
                    <div style={{fontSize:11,color:b.color,fontWeight:600}}>{b.save}</div>
                  </div>
                  <div style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:20,fontWeight:800,color:b.color}}>{b.price}</div>
                </div>
              ))}
              <div style={{marginTop:16,fontSize:12,color:COLORS.muted}}>{lang==="fr"?"Travailleurs toujours gratuits. Payez seulement quand ça matche.":"Workers always free. Pay only when you match."}</div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:COLORS.green,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:16}}>{t.forEmployers.eyebrow}</div>
              <h2 style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:"clamp(26px,3.5vw,38px)",fontWeight:800,color:COLORS.text,letterSpacing:"-0.8px",lineHeight:1.1,marginBottom:32,whiteSpace:"pre-line"}}>{t.forEmployers.title}</h2>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {t.forEmployers.points.map(p=>(
                  <div key={p.title} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <div style={{width:40,height:40,borderRadius:12,background:`${COLORS.green}12`,border:`1px solid ${COLORS.green}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.icon}</div>
                    <div>
                      <div style={{fontWeight:700,color:COLORS.text,marginBottom:3,fontSize:14}}>{p.title}</div>
                      <div style={{fontSize:13,color:COLORS.muted,lineHeight:1.5}}>{p.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" style={{padding:"100px 24px"}}>
        <div style={{maxWidth:560,margin:"0 auto",textAlign:"center"}}>
          <FadeIn>
            <div style={{fontSize:48,marginBottom:20}}>⚡</div>
            <h2 style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,color:COLORS.text,letterSpacing:"-1px",lineHeight:1.1,marginBottom:16}}>{t.waitlist.title}</h2>
            <p style={{fontSize:15,color:COLORS.muted,lineHeight:1.7,marginBottom:28}}>{t.waitlist.sub}</p>
            {submitted?(
              <div style={{background:`${COLORS.green}14`,border:`1px solid ${COLORS.green}35`,borderRadius:16,padding:"28px",textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:40,marginBottom:10}}>🎉</div>
                <div style={{fontWeight:700,color:COLORS.green,fontSize:16,marginBottom:6}}>{lang==="fr"?"Tu es sur la liste!":"You're on the list!"}</div>
                <div style={{fontSize:12,color:COLORS.muted}}>{t.waitlist.tag}</div>
              </div>
            ):(
              <>
                <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20}}>
                  {[t.waitlist.roleWorker,t.waitlist.roleEmployer].map((r,i)=>(
                    <button key={r} style={{padding:"10px 18px",borderRadius:11,background:i===0?`${COLORS.accent}14`:COLORS.soft,border:`1.5px solid ${i===0?COLORS.accent:COLORS.border}`,color:i===0?COLORS.accent:COLORS.muted,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Instrument Sans',sans-serif"}}>
                      {r}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",gap:10,maxWidth:420,margin:"0 auto 16px"}}>
                  <input type="email" placeholder={t.waitlist.placeholder} value={email} onChange={e=>setEmail(e.target.value)} style={{flex:1}}/>
                  <button onClick={()=>email&&setSubmitted(true)} style={{padding:"13px 20px",borderRadius:11,background:`linear-gradient(135deg,${COLORS.accent},#FF8A65)`,border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Instrument Sans',sans-serif"}}>
                    {t.waitlist.cta}
                  </button>
                </div>
                <div style={{fontSize:11,color:COLORS.muted,marginBottom:20}}>{t.waitlist.tag}</div>
                <div style={{borderTop:`1px solid ${COLORS.border}`,paddingTop:20}}>
                  <a href="/dashboard" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 22px",borderRadius:12,background:`${COLORS.green}14`,border:`1.5px solid ${COLORS.green}35`,color:COLORS.green,fontSize:13,fontWeight:700,textDecoration:"none",fontFamily:"'Instrument Sans',sans-serif"}}>
                    🏢 {t.waitlist.dashboard}
                  </a>
                </div>
              </>
            )}
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:`1px solid ${COLORS.border}`,padding:"32px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:1200,margin:"0 auto",flexWrap:"wrap",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {/* Slim-IA monogram */}
          <a href="https://slim-ia.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:10}}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="34" height="34" rx="9" fill="url(#siaGrad)"/>
              <text x="17" y="23" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="'Bricolage Grotesque',Georgia,serif" fill="white" letterSpacing="-0.5">SIA</text>
              <defs>
                <linearGradient id="siaGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF4D6D"/>
                  <stop offset="1" stopColor="#FFD166"/>
                </linearGradient>
              </defs>
            </svg>
            <span style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:15,fontWeight:800,color:COLORS.text}}>Slim-ia.com</span>
          </a>
          <span style={{color:COLORS.border}}>·</span>
          <div style={{fontSize:11,color:COLORS.muted}}>{t.footer.tagline}</div>
        </div>
        <div style={{display:"flex",gap:20}}>
          {t.footer.links.filter(l=>l!=="slim-ia.ca").map(l=>(
            <a key={l} href="#" style={{fontSize:12,color:COLORS.muted,textDecoration:"none",fontWeight:600}}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
