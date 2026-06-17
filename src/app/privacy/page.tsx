"use client";
import { useState } from "react";
const C = { bg:"#06060F",surface:"#0C0C18",card:"#111120",border:"#1C1C2E",accent:"#FF4D6D",yellow:"#FFD166",green:"#05D9A0",text:"#EEEEFF",muted:"#52527A",soft:"#161625" };

export default function Privacy() {
  const [lang,setLang]=useState<"fr"|"en">("fr");
  const isFr=lang==="fr";
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
          🔒 {isFr?"Politique de confidentialité":"Privacy Policy"}
        </div>
        <h1 style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:"clamp(28px,4vw,42px)",fontWeight:800,color:C.text,letterSpacing:"-1px",lineHeight:1.1,marginBottom:12}}>
          {isFr?"Votre vie privée nous importe.":"Your privacy matters to us."}
        </h1>
        <p style={{fontSize:13,color:C.muted,marginBottom:48}}>{isFr?"Dernière mise à jour : juin 2025":"Last updated: June 2025"}</p>

        {[
          {
            title: isFr?"1. Informations collectées":"1. Information We Collect",
            body: isFr
              ? "Nous collectons uniquement les informations que vous nous fournissez directement : votre adresse courriel et votre type de profil (travailleur ou employeur) lorsque vous rejoignez la liste d'attente. Nous ne collectons aucune donnée de navigation, de localisation ou d'identification sans votre consentement explicite."
              : "We only collect information you provide directly: your email address and profile type (worker or employer) when joining the waitlist. We do not collect browsing data, location, or identifying information without your explicit consent."
          },
          {
            title: isFr?"2. Utilisation des données":"2. How We Use Your Data",
            body: isFr
              ? "Vos informations sont utilisées exclusivement pour vous contacter avant et après le lancement de ShiftUp à Montréal. Nous ne vendons, ne louons et ne partageons jamais vos données avec des tiers à des fins commerciales."
              : "Your information is used solely to contact you before and after the ShiftUp launch in Montréal. We never sell, rent, or share your data with third parties for commercial purposes."
          },
          {
            title: isFr?"3. Conservation des données":"3. Data Retention",
            body: isFr
              ? "Vos données sont conservées tant que vous êtes sur la liste d'attente ou utilisateur actif. Vous pouvez demander leur suppression à tout moment en nous écrivant à info@slim-ia.ca."
              : "Your data is retained as long as you are on the waitlist or an active user. You may request deletion at any time by writing to info@slim-ia.ca."
          },
          {
            title: isFr?"4. Cookies":"4. Cookies",
            body: isFr
              ? "ShiftUp n'utilise pas de cookies de pistage tiers. Des cookies techniques essentiels peuvent être utilisés pour assurer le bon fonctionnement du site."
              : "ShiftUp does not use third-party tracking cookies. Essential technical cookies may be used to ensure the site functions properly."
          },
          {
            title: isFr?"5. Sécurité":"5. Security",
            body: isFr
              ? "Nous appliquons des mesures de sécurité conformes aux normes de l'industrie pour protéger vos informations. Toutes les communications sont chiffrées via HTTPS."
              : "We apply industry-standard security measures to protect your information. All communications are encrypted via HTTPS."
          },
          {
            title: isFr?"6. Vos droits":"6. Your Rights",
            body: isFr
              ? "Conformément à la Loi 25 (Québec) et au RGPD, vous avez le droit d'accéder à vos données, de les rectifier, de les supprimer ou de vous opposer à leur traitement. Contactez-nous à info@slim-ia.ca."
              : "Under Law 25 (Québec) and GDPR, you have the right to access, correct, delete, or object to the processing of your data. Contact us at info@slim-ia.ca."
          },
          {
            title: isFr?"7. Contact":"7. Contact",
            body: isFr
              ? "Pour toute question relative à cette politique, écrivez-nous à info@slim-ia.ca. Nous répondons sous 48 heures ouvrables."
              : "For any questions regarding this policy, write to us at info@slim-ia.ca. We respond within 48 business hours."
          },
        ].map(s=>(
          <div key={s.title} style={{marginBottom:36}}>
            <h2 style={{fontFamily:"'Bricolage Grotesque',serif",fontSize:18,fontWeight:800,color:C.text,marginBottom:10}}>{s.title}</h2>
            <p style={{fontSize:14,color:C.muted,lineHeight:1.8}}>{s.body}</p>
          </div>
        ))}

        <div style={{marginTop:48,padding:24,background:C.card,border:`1px solid ${C.border}`,borderRadius:16}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>{isFr?"Des questions ?":"Questions?"}</div>
          <a href="mailto:info@slim-ia.ca" style={{fontSize:13,color:C.accent,textDecoration:"none",fontWeight:600}}>info@slim-ia.ca</a>
        </div>

        <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${C.border}`,display:"flex",gap:16,flexWrap:"wrap"}}>
          <a href="/" style={{fontSize:12,color:C.muted,textDecoration:"none",fontWeight:600}}>← {isFr?"Retour à l'accueil":"Back to home"}</a>
          <a href="/terms" style={{fontSize:12,color:C.muted,textDecoration:"none",fontWeight:600}}>{isFr?"Conditions d'utilisation →":"Terms of Service →"}</a>
        </div>
      </div>
    </div>
  );
}
