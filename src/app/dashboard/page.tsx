"use client";

import { useState } from "react";

const C = {
  bg:"#06060F", surface:"#0C0C18", card:"#111120",
  border:"#1C1C2E", accent:"#FF4D6D", accentSoft:"#FF4D6D14", accentBorder:"#FF4D6D35",
  green:"#05D9A0", greenSoft:"#05D9A010", greenBorder:"#05D9A035",
  yellow:"#FFD166", yellowSoft:"#FFD16610",
  blue:"#4EA8DE", blueSoft:"#4EA8DE10",
  purple:"#A78BFA", purpleSoft:"#A78BFA10",
  text:"#EEEEFF", muted:"#52527A", soft:"#161625", softer:"#1C1C2E",
};

const CANDIDATES = [
  {id:1,name:"Alexandre M.",role:"Barista",match:96,dist:"0.8 km",avail:"Matins · Lun–Ven",lang:"Bilingue",exp:"2 ans",status:"new",emoji:"☕",badge:"⭐ Super like"},
  {id:2,name:"Sofia R.",role:"Serveuse",match:91,dist:"1.2 km",avail:"Soirs · Week-ends",lang:"Bilingue",exp:"3 ans",status:"new",emoji:"🍽️",badge:null},
  {id:3,name:"Marcus T.",role:"Entrepôt",match:88,dist:"2.1 km",avail:"Jours · Flexible",lang:"Anglais",exp:"1 an",status:"contacted",emoji:"📦",badge:null},
  {id:4,name:"Camille B.",role:"Commerce",match:82,dist:"0.5 km",avail:"Après-midi · Fins de sem.",lang:"Français",exp:"4 ans",status:"new",emoji:"🛍️",badge:null},
  {id:5,name:"Jordan L.",role:"Sécurité",match:79,dist:"3.0 km",avail:"Nuits · Week-ends",lang:"Bilingue",exp:"5 ans",status:"interviewed",emoji:"🛡️",badge:null},
  {id:6,name:"Priya S.",role:"Bureau",match:74,dist:"1.8 km",avail:"Temps plein · Flexible",lang:"Bilingue",exp:"2 ans",status:"new",emoji:"💻",badge:null},
];

const JOBS = [
  {id:1,title:"Barista",status:"active",matches:12,views:48,posted:"Il y a 2j",urgent:true},
  {id:2,title:"Commis d'entrepôt",status:"active",matches:7,views:31,posted:"Il y a 4j",urgent:false},
  {id:3,title:"Associé commerce",status:"paused",matches:3,views:19,posted:"Il y a 1sem",urgent:false},
];

const TRANSACTIONS = [
  {id:1,desc:"10 matchs — Forfait",amount:-99,date:"16 juin",type:"bundle"},
  {id:2,desc:"Super like — Alexandre M.",amount:-5,date:"15 juin",type:"superlike"},
  {id:3,desc:"1 match — Sofia R.",amount:-25,date:"14 juin",type:"match"},
  {id:4,desc:"1 match — Marcus T.",amount:-25,date:"12 juin",type:"match"},
];

function mColor(s: number){ return s>=85?"#05D9A0":s>=70?"#FFD166":s>=55?"#4EA8DE":"#FF4D6D"; }

function Ring({score,size=44,stroke=4}:{score:number;size?:number;stroke?:number}){
  const r=(size-stroke*2)/2,circ=2*Math.PI*r,dash=circ*(score/100),col=mColor(score);
  return(
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.soft} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{fill:col,fontSize:size*.21,fontWeight:800,fontFamily:"sans-serif",transform:"rotate(90deg)",transformOrigin:"center"}}>{score}%</text>
    </svg>
  );
}

function StatCard({icon,label,value,sub,color=C.accent}:{icon:string;label:string;value:string;sub:string;color?:string}){
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px 22px",flex:1,minWidth:140}}>
      <div style={{fontSize:22,marginBottom:10}}>{icon}</div>
      <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:28,fontWeight:800,color,marginBottom:2}}>{value}</div>
      <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>{label}</div>
      <div style={{fontSize:11,color:C.muted}}>{sub}</div>
    </div>
  );
}

interface Candidate {
  id: number; name: string; role: string; match: number; dist: string;
  avail: string; lang: string; exp: string; status: string; emoji: string;
  badge: string | null;
}

function CandidateCard({c,onAction,lang}:{c:Candidate;onAction:(c:Candidate,action:string)=>void;lang:string}){
  const isFr=lang==="fr";
  const statusColors: Record<string,string>={new:C.accent,contacted:C.yellow,interviewed:C.green};
  const statusLabels={
    fr:{new:"Nouveau",contacted:"Contacté",interviewed:"Rencontré"},
    en:{new:"New",contacted:"Contacted",interviewed:"Interviewed"},
  };

  return(
    <div style={{background:C.card,border:`1.5px solid ${c.status==="new"?C.accentBorder:C.border}`,borderRadius:18,padding:20,display:"flex",flexDirection:"column",gap:14,position:"relative",overflow:"hidden"}}>
      {c.badge&&(
        <div style={{position:"absolute",top:12,right:12,background:`${C.yellow}18`,border:`1px solid ${C.yellow}40`,borderRadius:100,padding:"3px 10px",fontSize:10,fontWeight:800,color:C.yellow}}>
          {c.badge}
        </div>
      )}
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{width:46,height:46,borderRadius:14,background:`linear-gradient(135deg,${C.accent},${C.yellow})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
          {c.emoji}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
            <span style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:16,fontWeight:800,color:C.text}}>{c.name}</span>
            <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,background:`${statusColors[c.status]}18`,color:statusColors[c.status],border:`1px solid ${statusColors[c.status]}40`}}>
              {statusLabels[lang as "fr"|"en"][c.status as "new"|"contacted"|"interviewed"]}
            </span>
          </div>
          <div style={{fontSize:12,color:C.muted}}>{c.role} · {c.dist}</div>
        </div>
        <Ring score={c.match} size={44} stroke={4}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {[c.avail,c.lang,`${c.exp} exp.`].map(tag=>(
          <span key={tag} style={{background:C.soft,border:`1px solid ${C.border}`,borderRadius:8,padding:"3px 10px",fontSize:11,color:C.text,fontWeight:600}}>{tag}</span>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>onAction(c,"contact")} style={{flex:1,padding:"10px",borderRadius:11,background:`linear-gradient(135deg,${C.accent},#FF8A65)`,border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
          ⚡ {isFr?"Connecter ($25)":"Connect ($25)"}
        </button>
        <button onClick={()=>onAction(c,"superlike")} style={{padding:"10px 14px",borderRadius:11,background:C.yellowSoft,border:`1px solid ${C.yellow}40`,color:C.yellow,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
          ⭐ $5
        </button>
        <button onClick={()=>onAction(c,"view")} style={{padding:"10px 14px",borderRadius:11,background:C.soft,border:`1px solid ${C.border}`,color:C.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
          👁
        </button>
      </div>
    </div>
  );
}

function Modal({action,candidate,onClose,onConfirm,lang}:{action:string|null;candidate:Candidate|null;onClose:()=>void;onConfirm:()=>void;lang:string}){
  if(!action)return null;
  const isFr=lang==="fr";
  const configs: Record<string,{title:string;body:string;cta:string;color:string}>={
    contact:{
      title:isFr?"Connecter avec ce candidat":"Connect with this candidate",
      body:isFr?`Vous allez utiliser 1 match ($25) pour contacter ${candidate?.name}. Une fois connectés, vous pourrez échanger directement.`:`You'll use 1 match ($25) to contact ${candidate?.name}. Once connected, you can message directly.`,
      cta:isFr?"Confirmer & Payer $25":"Confirm & Pay $25",
      color:C.accent,
    },
    superlike:{
      title:isFr?"Super like ⭐":"Super like ⭐",
      body:isFr?`Mettre en avant le profil de ${candidate?.name} pour $5. Le candidat verra votre intérêt en priorité. Le match ($25) sera facturé si il/elle accepte.`:`Highlight ${candidate?.name}'s profile for $5. The candidate sees your interest first. Match fee ($25) charged if they accept.`,
      cta:isFr?"Envoyer le super like ($5)":"Send super like ($5)",
      color:C.yellow,
    },
  };
  const cfg=configs[action];
  if(!cfg)return null;

  return(
    <div style={{position:"fixed",inset:0,background:"#000A",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:22,padding:28,maxWidth:400,width:"100%",boxShadow:"0 32px 64px #0008"}}>
        <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:20,fontWeight:800,color:C.text,marginBottom:12}}>{cfg.title}</div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:24}}>{cfg.body}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:11,background:C.soft,border:`1px solid ${C.border}`,color:C.muted,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
            {isFr?"Annuler":"Cancel"}
          </button>
          <button onClick={onConfirm} style={{flex:2,padding:"12px",borderRadius:11,background:`linear-gradient(135deg,${cfg.color},${cfg.color}AA)`,border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
            {cfg.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShiftUpDashboard(){
  const [lang,setLang]=useState<"fr"|"en">("fr");
  const [tab,setTab]=useState("candidates");
  const [modal,setModal]=useState<string|null>(null);
  const [selectedCandidate,setSelectedCandidate]=useState<Candidate|null>(null);
  const [credits,setCredits]=useState(6);
  const [toast,setToast]=useState<string|null>(null);
  const isFr=lang==="fr";

  const showToast=(msg:string)=>{ setToast(msg); setTimeout(()=>setToast(null),3000); };
  const handleAction=(candidate:Candidate,action:string)=>{ setSelectedCandidate(candidate); setModal(action); };
  const handleConfirm=()=>{
    if(modal==="contact"){
      setCredits(c=>Math.max(0,c-1));
      showToast(isFr?`✅ Connecté avec ${selectedCandidate?.name}!`:`✅ Connected with ${selectedCandidate?.name}!`);
    } else {
      showToast(isFr?`⭐ Super like envoyé à ${selectedCandidate?.name}!`:`⭐ Super like sent to ${selectedCandidate?.name}!`);
    }
    setModal(null);
  };

  const NAV=[
    {id:"candidates",icon:"👥",label:isFr?"Candidats":"Candidates"},
    {id:"jobs",icon:"📋",label:isFr?"Mes offres":"My posts"},
    {id:"billing",icon:"💳",label:isFr?"Facturation":"Billing"},
    {id:"settings",icon:"⚙️",label:isFr?"Compte":"Account"},
  ];

  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'Instrument Sans','Inter',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&family=Bricolage+Grotesque:wght@400;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#06060F;}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:#0C0C18;}
        ::-webkit-scrollbar-thumb{background:#1C1C2E;border-radius:3px;}
      `}</style>

      {toast&&(
        <div style={{position:"fixed",top:24,right:24,background:C.green,color:C.bg,padding:"12px 20px",borderRadius:12,fontSize:13,fontWeight:700,zIndex:2000,boxShadow:"0 8px 24px #0006"}}>
          {toast}
        </div>
      )}

      <Modal action={modal} candidate={selectedCandidate} onClose={()=>setModal(null)} onConfirm={handleConfirm} lang={lang}/>

      <header style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <a href="/" style={{textDecoration:"none"}}>
            <span style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:18,fontWeight:800,background:`linear-gradient(135deg,#FF4D6D,#FFD166)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ShiftUp ⚡</span>
          </a>
          <span style={{fontSize:11,color:C.muted,borderLeft:`1px solid ${C.border}`,paddingLeft:16}}>{isFr?"Dashboard Employeur":"Employer Dashboard"}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:6,background:C.accentSoft,border:`1px solid ${C.accentBorder}`,borderRadius:100,padding:"6px 14px"}}>
            <span style={{fontSize:12,fontWeight:800,color:C.accent}}>{credits}</span>
            <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{isFr?"matchs restants":"matches left"}</span>
          </div>
          <div style={{display:"flex",background:C.soft,borderRadius:8,padding:3,gap:2}}>
            {(["fr","en"] as const).map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{padding:"4px 10px",borderRadius:6,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",background:lang===l?C.accent:"transparent",color:lang===l?"#fff":C.muted,fontFamily:"sans-serif"}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.yellow})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",cursor:"pointer"}}>
            C
          </div>
        </div>
      </header>

      <div style={{display:"flex",flex:1}}>
        <aside style={{width:220,background:C.surface,borderRight:`1px solid ${C.border}`,padding:"20px 12px",display:"flex",flexDirection:"column",gap:4,position:"sticky",top:57,height:"calc(100vh - 57px)",overflowY:"auto"}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:11,border:"none",background:tab===n.id?C.accentSoft:"transparent",color:tab===n.id?C.accent:C.muted,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",textAlign:"left",transition:"all .14s"}}>
              <span style={{fontSize:16}}>{n.icon}</span>{n.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          <div style={{background:`linear-gradient(135deg,${C.accentSoft},${C.greenSoft})`,border:`1px solid ${C.accentBorder}`,borderRadius:14,padding:16,marginTop:16}}>
            <div style={{fontSize:12,fontWeight:800,color:C.text,marginBottom:6}}>{isFr?"Recharger des matchs":"Buy more matches"}</div>
            {[{l:isFr?"1 match":"1 match",p:"$25"},{l:isFr?"10 matchs":"10 matches",p:"$99"},{l:isFr?"Illimité/mo":"Unlimited/mo",p:"$189.99"}].map(b=>(
              <button key={b.l} style={{display:"flex",justifyContent:"space-between",width:"100%",padding:"8px 10px",borderRadius:9,border:`1px solid ${C.border}`,background:C.soft,color:C.text,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",marginBottom:6}}>
                <span>{b.l}</span><span style={{color:C.accent}}>{b.p}</span>
              </button>
            ))}
          </div>
        </aside>

        <main style={{flex:1,padding:28,overflowY:"auto",maxWidth:1100}}>

          {tab==="candidates"&&(
            <div>
              <div style={{display:"flex",gap:16,marginBottom:28,flexWrap:"wrap"}}>
                <StatCard icon="⚡" label={isFr?"Nouveaux matchs":"New matches"} value="6" sub={isFr?"Aujourd'hui":"Today"} color={C.accent}/>
                <StatCard icon="👥" label={isFr?"Candidats vus":"Candidates seen"} value="24" sub={isFr?"Cette semaine":"This week"} color={C.blue}/>
                <StatCard icon="✅" label={isFr?"Connectés":"Connected"} value="4" sub={isFr?"En attente de réponse":"Awaiting reply"} color={C.green}/>
                <StatCard icon="💰" label={isFr?"Dépensé":"Spent"} value="$154" sub={isFr?"Ce mois-ci":"This month"} color={C.yellow}/>
              </div>
              <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:18,fontWeight:800,color:C.text,marginRight:8}}>
                  {isFr?"Candidats recommandés":"Recommended candidates"}
                </div>
                {[isFr?"Tous":"All",isFr?"Nouveaux":"New","⭐ Super like",isFr?"Contactés":"Contacted"].map((f,i)=>(
                  <button key={f} style={{padding:"6px 14px",borderRadius:100,border:`1.5px solid ${i===0?C.accent:C.border}`,background:i===0?C.accentSoft:C.soft,color:i===0?C.accent:C.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                    {f}
                  </button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
                {CANDIDATES.map(c=>(
                  <CandidateCard key={c.id} c={c} onAction={handleAction} lang={lang}/>
                ))}
              </div>
            </div>
          )}

          {tab==="jobs"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:22,fontWeight:800,color:C.text}}>{isFr?"Mes offres d'emploi":"My job posts"}</div>
                <button style={{padding:"10px 20px",borderRadius:11,background:`linear-gradient(135deg,${C.accent},#FF8A65)`,border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                  + {isFr?"Publier une offre":"Post a job"}
                </button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {JOBS.map(j=>(
                  <div key={j.id} style={{background:C.card,border:`1px solid ${j.status==="active"?C.greenBorder:C.border}`,borderRadius:16,padding:"18px 22px",display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:160}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                        <span style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:16,fontWeight:800,color:C.text}}>{j.title}</span>
                        {j.urgent&&<span style={{fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:100,background:`${C.accent}18`,color:C.accent,border:`1px solid ${C.accentBorder}`}}>🔥 Urgent</span>}
                      </div>
                      <div style={{fontSize:12,color:C.muted}}>{j.posted}</div>
                    </div>
                    <div style={{display:"flex",gap:20}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:22,fontWeight:800,color:C.accent}}>{j.matches}</div>
                        <div style={{fontSize:10,color:C.muted,fontWeight:600}}>{isFr?"matchs":"matches"}</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:22,fontWeight:800,color:C.blue}}>{j.views}</div>
                        <div style={{fontSize:10,color:C.muted,fontWeight:600}}>{isFr?"vues":"views"}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center"}}>
                        <span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:100,background:j.status==="active"?C.greenSoft:C.yellowSoft,color:j.status==="active"?C.green:C.yellow,border:`1px solid ${j.status==="active"?C.greenBorder:C.yellow+"40"}`}}>
                          {j.status==="active"?(isFr?"Actif":"Active"):(isFr?"En pause":"Paused")}
                        </span>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button style={{padding:"8px 14px",borderRadius:9,background:C.soft,border:`1px solid ${C.border}`,color:C.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>{isFr?"Modifier":"Edit"}</button>
                      <button style={{padding:"8px 14px",borderRadius:9,background:C.accentSoft,border:`1px solid ${C.accentBorder}`,color:C.accent,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>{isFr?"Voir candidats":"View candidates"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="billing"&&(
            <div>
              <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:22,fontWeight:800,color:C.text,marginBottom:24}}>{isFr?"Facturation":"Billing"}</div>
              <div style={{background:`linear-gradient(135deg,${C.card},${C.surface})`,border:`1px solid ${C.border}`,borderRadius:20,padding:28,marginBottom:24,display:"flex",gap:40,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>{isFr?"Matchs restants":"Matches remaining"}</div>
                  <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:48,fontWeight:800,color:C.accent,lineHeight:1}}>{credits}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:6}}>{isFr?"sur 10 achetés":"of 10 purchased"}</div>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>{isFr?"Dépensé ce mois":"Spent this month"}</div>
                  <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:48,fontWeight:800,color:C.yellow,lineHeight:1}}>$154</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:6}}>{isFr?"4 transactions":"4 transactions"}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:8,marginLeft:"auto"}}>
                  {[{l:isFr?"1 match":"1 match",p:"$25"},{l:isFr?"10 matchs":"10 matches",p:"$99"},{l:isFr?"Illimité/mo":"Unlimited/mo",p:"$189.99/mo"}].map(b=>(
                    <button key={b.l} style={{display:"flex",justifyContent:"space-between",gap:20,padding:"10px 16px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.soft,color:C.text,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                      <span>{b.l}</span><span style={{color:C.accent}}>{b.p}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:16,fontWeight:800,color:C.text,marginBottom:16}}>{isFr?"Historique":"Transaction history"}</div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}>
                {TRANSACTIONS.map((tx,i)=>(
                  <div key={tx.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:i<TRANSACTIONS.length-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:tx.type==="bundle"?C.accentSoft:tx.type==="superlike"?C.yellowSoft:C.greenSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                        {tx.type==="bundle"?"📦":tx.type==="superlike"?"⭐":"⚡"}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:C.text}}>{tx.desc}</div>
                        <div style={{fontSize:11,color:C.muted}}>{tx.date}</div>
                      </div>
                    </div>
                    <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:16,fontWeight:800,color:C.accent}}>{tx.amount}$</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="settings"&&(
            <div style={{maxWidth:520}}>
              <div style={{fontFamily:"'Bricolage Grotesque',Georgia,serif",fontSize:22,fontWeight:800,color:C.text,marginBottom:24}}>{isFr?"Mon compte":"My account"}</div>
              {[
                {label:isFr?"Nom de l'entreprise":"Business name",value:"Café Noir"},
                {label:isFr?"Courriel":"Email",value:"info@cafenoir.ca"},
                {label:isFr?"Téléphone":"Phone",value:"+1 514 555-0123"},
                {label:isFr?"Type d'entreprise":"Business type",value:isFr?"Restaurant / Café":"Restaurant / Café"},
                {label:isFr?"Code postal":"Postal code",value:"H2X 1Y3"},
              ].map(f=>(
                <div key={f.label} style={{marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:6}}>{f.label}</div>
                  <div style={{background:C.soft,border:`1.5px solid ${C.border}`,borderRadius:11,padding:"12px 16px",fontSize:14,color:C.text,fontWeight:600}}>{f.value}</div>
                </div>
              ))}
              <button style={{marginTop:8,padding:"12px 24px",borderRadius:11,background:`linear-gradient(135deg,${C.accent},#FF8A65)`,border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                {isFr?"Sauvegarder":"Save changes"}
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
