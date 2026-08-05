import { LegalPage } from "@/components/legal";

const copy = {
  fr: {
    badge: "🔒 Politique de confidentialité",
    title: "Votre vie privée nous importe.",
    updated: "Dernière mise à jour : août 2026",
    questions: "Des questions ?",
    backHome: "Retour à l'accueil",
    crossLinkHref: "/terms",
    crossLinkLabel: "Conditions d'utilisation",
    sections: [
      { title: "1. Informations collectées", body: "Nous collectons les informations que vous nous fournissez directement : votre adresse courriel et votre type de profil (travailleur ou employeur) lorsque vous rejoignez la liste d'attente. Si, et seulement si, vous acceptez les témoins de mesure, nous collectons aussi des données de navigation : pages visitées, provenance de votre visite, type d'appareil, adresse IP approximative. Sans votre consentement, aucune de ces données n'est recueillie." },
      { title: "2. Utilisation des données", body: "Vos informations sont utilisées exclusivement pour vous contacter avant et après le lancement de ShiftUp à Montréal. Nous ne vendons, ne louons et ne partageons jamais vos données avec des tiers à des fins commerciales." },
      { title: "3. Conservation des données", body: "Vos données sont conservées tant que vous êtes sur la liste d'attente ou utilisateur actif. Vous pouvez demander leur suppression à tout moment en nous écrivant à info@slim-ia.ca." },
      { title: "4. Témoins (cookies) et mesure publicitaire", body: "Des témoins techniques essentiels assurent le bon fonctionnement du site et ne demandent aucun consentement. Nous utilisons également le pixel Meta (Facebook, Instagram) et Google Analytics pour mesurer quelles annonces mènent à de vraies inscriptions. Conformément à l'article 8.1 de la Loi 25, ces outils sont désactivés par défaut : ils ne se chargent qu'après votre acceptation explicite dans la bannière, et refuser les empêche complètement de se charger. Vous pouvez changer d'idée en tout temps en effaçant les données du site dans votre navigateur." },
      { title: "5. Partage avec Meta et Google", body: "Lorsque vous acceptez la mesure et que vous vous inscrivez à la liste d'attente, nous transmettons cette inscription à Meta et à Google afin d'évaluer nos publicités. Votre adresse courriel n'est jamais transmise en clair : elle est convertie en empreinte cryptographique irréversible (SHA-256) avant l'envoi. Ces sociétés traitent ces données hors du Canada, notamment aux États-Unis. Si vous refusez la mesure, rien ne leur est transmis." },
      { title: "6. Sécurité", body: "Nous appliquons des mesures de sécurité conformes aux normes de l'industrie pour protéger vos informations. Toutes les communications sont chiffrées via HTTPS." },
      { title: "7. Vos droits", body: "Conformément à la Loi 25 (Québec) et au RGPD, vous avez le droit d'accéder à vos données, de les rectifier, de les supprimer ou de vous opposer à leur traitement, y compris de retirer votre consentement à la mesure publicitaire. Contactez-nous à info@slim-ia.ca." },
      { title: "8. Contact", body: "Pour toute question relative à cette politique, écrivez-nous à info@slim-ia.ca. Nous répondons sous 48 heures ouvrables." },
    ],
  },
  en: {
    badge: "🔒 Privacy Policy",
    title: "Your privacy matters to us.",
    updated: "Last updated: August 2026",
    questions: "Questions?",
    backHome: "Back to home",
    crossLinkHref: "/terms",
    crossLinkLabel: "Terms of Service",
    sections: [
      { title: "1. Information We Collect", body: "We collect the information you provide directly: your email address and profile type (worker or employer) when joining the waitlist. If, and only if, you accept measurement cookies, we also collect browsing data: pages visited, where your visit came from, device type, and approximate IP address. Without your consent, none of that is collected." },
      { title: "2. How We Use Your Data", body: "Your information is used solely to contact you before and after the ShiftUp launch in Montréal. We never sell, rent, or share your data with third parties for commercial purposes." },
      { title: "3. Data Retention", body: "Your data is retained as long as you are on the waitlist or an active user. You may request deletion at any time by writing to info@slim-ia.ca." },
      { title: "4. Cookies and Advertising Measurement", body: "Essential technical cookies keep the site working and require no consent. We also use the Meta pixel (Facebook, Instagram) and Google Analytics to measure which ads lead to real signups. In line with section 8.1 of Quebec's Law 25, these tools are deactivated by default: they load only after you explicitly accept in the banner, and refusing prevents them from loading at all. You can change your mind at any time by clearing this site's data in your browser." },
      { title: "5. Sharing With Meta and Google", body: "When you accept measurement and join the waitlist, we report that signup to Meta and Google so we can evaluate our advertising. Your email address is never sent in the clear: it is converted into an irreversible cryptographic hash (SHA-256) before being sent. These companies process that data outside Canada, including in the United States. If you refuse measurement, nothing is sent to them." },
      { title: "6. Security", body: "We apply industry-standard security measures to protect your information. All communications are encrypted via HTTPS." },
      { title: "7. Your Rights", body: "Under Law 25 (Québec) and GDPR, you have the right to access, correct, delete, or object to the processing of your data, including withdrawing your consent to advertising measurement. Contact us at info@slim-ia.ca." },
      { title: "8. Contact", body: "For any questions regarding this policy, write to us at info@slim-ia.ca. We respond within 48 business hours." },
    ],
  },
};

export const metadata = {
  title: "ShiftUp: Confidentialité",
};

export default function Privacy() {
  return <LegalPage copy={copy} />;
}
