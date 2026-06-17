"use client";
import { useState } from "react";
const C = { bg:"#06060F",card:"#111120",border:"#1C1C2E",accent:"#FF4D6D",yellow:"#FFD166",text:"#EEEEFF",muted:"#52527A",soft:"#161625" };

export default function Terms() {
  const [lang,setLang]=useState<"fr"|"en">("fr");
  const isFr=lang==="fr";
  const sections = isFr ? [
    { title:"1. Acceptation des conditions", body:"En accédant à ShiftUp, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas, veuillez ne pas utiliser notre service." },
    { title:"2. Description du service", body:"ShiftUp est une plateforme de mise en relation entre travailleurs et employeurs à Montréal. Le service est gratuit pour les travailleurs. Les employeurs paient par match confirmé ($25) ou via des forfaits." },
    { title:"3. Inscription et liste d'attente", body:"En vous inscrivant sur la liste d'attente, vous acceptez de recevoir des communications de ShiftUp relatives au lancement et aux mises à jour du service. Vous pouvez vous désinscrire à tout moment." },
    { title:"4. Tarification employeurs", body:"Les tarifs en vigueur sont : 1 match à $25, forfait 10 matchs à $99, abonnement illimité à $189.99/mois. Un super like est facturé $5. Les prix peuvent être modifiés avec un préavis de 30 jours." },
    { title:"5. Utilisation acceptable", body:"Vous vous engagez à ne pas utiliser ShiftUp à des fins frauduleuses, à ne pas publier de fausses offres d'emploi, à ne pas harceler d'autres utilisateurs, et à respecter toutes les lois applicables au Québec et au Canada." },
    { title:"6. Propriété intellectuelle", body:"Tout le contenu de ShiftUp (design, textes, logo, algorithme de matching) est la propriété exclusive de Slim-IA. Toute reproduction sans autorisation écrite est interdite." },
    { title:"7. Limitation de responsabilité", body:"ShiftUp agit comme intermédiaire. Nous ne sommes pas responsables des relations de travail établies via la plateforme. Nous ne garantissons pas un nombre minimum de matchs." },
    { title:"8. Modification et résiliation", body:"Nous nous réservons le droit de modifier ces conditions ou de suspendre l'accès à tout utilisateur en violation des présentes, sans préavis." },
    { title:"9. Droit applicable", body:"Ces conditions sont régies par les lois de la province de Québec et du Canada. Tout litige sera soumis aux tribunaux compétents de Montréal." },
    { title:"10. Contact", body:"Pour toute question : info@slim-ia.ca" },
  ] : [
    { title:"1. Acceptance of Terms", body:"By accessing ShiftUp, you agree to be bound by these terms. If you do not agree, please do not use our service." },
    { title:"2. Service Description", body:"ShiftUp is a platform connecting workers and employers in Montréal. Free for workers. Employers pay per confirmed match ($25) or through bundles." },
    { title:"3. Registration & Waitlist", body:"By signing up for the waitlist, you agree to receive communications from ShiftUp about the launch and service updates. You may unsubscribe at any time." },
    { title:"4. Employer Pricing", body:"Current rates: 1 match at $25, bundle of 10 matches at $99, unlimited subscription at $189.99/month. A super like is charged at $5. Prices may change with 30 days' notice." },
    { title:"5. Acceptable Use", body:"You agree not to use ShiftUp for fraudulent purposes, post false job listings, harass other users, or violate any applicable laws in Québec or Canada." },
    { title:"6. Intellectual Property", body:"All ShiftUp content (design, text, logo, matching algorithm) is the exclusive property of Slim-IA. Reproduction without written permission is prohibited." },
    { title:"7. Limitation of Liability", body:"ShiftUp acts as an intermediary. We are not responsible for employment relationships established through the platform. We do not guarantee a minimum number of matches." },
    { title:"8. Modification & Termination", body:"We reserve the right to modify these terms or suspend access for any user in violation, without notice." },
    { title:"9. Governing Law", body:"These terms are governed by the laws of Québec and Canada. Disputes will be submitted to the competent courts of Montréal." },
    { title:"10. Contact", body:"For any questions: info@slim-ia.ca" },
  ];

  return (
    <div style={{background:C.bg,color:C.text,minHeight:"100vh",fontFamily:"'Instrument Sans','Inter',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&family=Bricolage+Grotesque:wght@400;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{background:#06060F;}`}</style>
      <nav style={{borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10,background:`${C.bg}EE`,backdropFilter:"blur(20px)"}}>
        <a href="/" style={{textDecoration:"none",fontFamily:"'Bricolage Grotesque',serif",fontSize:18,fontWeight:800,background:`linear-gradient(135deg,${C.accent},${C.yellow})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ShiftUp ⚡</a>
        <div style={{display:"flex",background:C.soft,borderRadius:8,padding:3,gap:2}}>
          {(["fr","en"] as const).map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{padding:"4px 10px",borderRadius:6,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",background:lang===l?C.accent:"transparent",color:lang===l?"#fff":C.muted,fontFamily:"sans-serif"}}>{l.toUpperCase()}</button>
          ))}
        </div>
      </nav>
      <div style={{maxWidth:760,margin:"0 auto",padding:"64px 24px 80px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${C.accent}14`,border:`1px solid ${C.accent}35`,borderRadius:100,padding:"5px 14px",fontSize:11,fontWeight:700,color:C.accent,marginBottom:24}}>
          📄 {isFr?"Conditions d'utilisation":"Terms of Service"}
        </div>
        <h1 style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:"clamp(28px,4vw,42px)",fontWeight:800,color:C.text,letterSpacing:"-1px",lineHeight:1.1,marginBottom:12}}>
          {isFr?"Conditions d'utilisation de ShiftUp":"ShiftUp Terms of Service"}
        </h1>
        <p style={{fontSize:13,color:C.muted,marginBottom:48}}>{isFr?"Dernière mise à jour : juin 2025":"Last updated: June 2025"}</p>
        {sections.map(s=>(
          <div key={s.title} style={{marginBottom:36}}>
            <h2 style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:18,fontWeight:800,color:C.text,marginBottom:10}}>{s.title}</h2>
            <p style={{fontSize:14,color:C.muted,lineHeight:1.8}}>{s.body}</p>
          </div>
        ))}
        <div style={{marginTop:48,padding:24,background:C.card,border:`1px solid ${C.border}`,borderRadius:16}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>{isFr?"Des questions ?":"Questions?"}</div>
          <a href="mailto:info@slim-ia.ca" style={{fontSize:13,color:C.accent,textDecoration:"none",fontWeight:600}}>info@slim-ia.ca</a>
        </div>
        <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${C.border}`,display:"flex",gap:16}}>
          <a href="/" style={{fontSize:12,color:C.muted,textDecoration:"none",fontWeight:600}}>← {isFr?"Retour à l'accueil":"Back to home"}</a>
          <a href="/privacy" style={{fontSize:12,color:C.muted,textDecoration:"none",fontWeight:600}}>{isFr?"Politique de confidentialité →":"Privacy Policy →"}</a>
        </div>
      </div>
    </div>
  );
}
