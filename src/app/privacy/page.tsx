import { LegalPage } from "@/components/legal";

const copy = {
  fr: {
    badge: "🔒 Politique de confidentialité",
    title: "Votre vie privée nous importe.",
    updated: "Dernière mise à jour : juin 2025",
    questions: "Des questions ?",
    backHome: "Retour à l'accueil",
    crossLinkHref: "/terms",
    crossLinkLabel: "Conditions d'utilisation",
    sections: [
      { title: "1. Informations collectées", body: "Nous collectons uniquement les informations que vous nous fournissez directement : votre adresse courriel et votre type de profil (travailleur ou employeur) lorsque vous rejoignez la liste d'attente. Nous ne collectons aucune donnée de navigation, de localisation ou d'identification sans votre consentement explicite." },
      { title: "2. Utilisation des données", body: "Vos informations sont utilisées exclusivement pour vous contacter avant et après le lancement de ShiftUp à Montréal. Nous ne vendons, ne louons et ne partageons jamais vos données avec des tiers à des fins commerciales." },
      { title: "3. Conservation des données", body: "Vos données sont conservées tant que vous êtes sur la liste d'attente ou utilisateur actif. Vous pouvez demander leur suppression à tout moment en nous écrivant à info@slim-ia.ca." },
      { title: "4. Cookies", body: "ShiftUp n'utilise pas de cookies de pistage tiers. Des cookies techniques essentiels peuvent être utilisés pour assurer le bon fonctionnement du site." },
      { title: "5. Sécurité", body: "Nous appliquons des mesures de sécurité conformes aux normes de l'industrie pour protéger vos informations. Toutes les communications sont chiffrées via HTTPS." },
      { title: "6. Vos droits", body: "Conformément à la Loi 25 (Québec) et au RGPD, vous avez le droit d'accéder à vos données, de les rectifier, de les supprimer ou de vous opposer à leur traitement. Contactez-nous à info@slim-ia.ca." },
      { title: "7. Contact", body: "Pour toute question relative à cette politique, écrivez-nous à info@slim-ia.ca. Nous répondons sous 48 heures ouvrables." },
    ],
  },
  en: {
    badge: "🔒 Privacy Policy",
    title: "Your privacy matters to us.",
    updated: "Last updated: June 2025",
    questions: "Questions?",
    backHome: "Back to home",
    crossLinkHref: "/terms",
    crossLinkLabel: "Terms of Service",
    sections: [
      { title: "1. Information We Collect", body: "We only collect information you provide directly: your email address and profile type (worker or employer) when joining the waitlist. We do not collect browsing data, location, or identifying information without your explicit consent." },
      { title: "2. How We Use Your Data", body: "Your information is used solely to contact you before and after the ShiftUp launch in Montréal. We never sell, rent, or share your data with third parties for commercial purposes." },
      { title: "3. Data Retention", body: "Your data is retained as long as you are on the waitlist or an active user. You may request deletion at any time by writing to info@slim-ia.ca." },
      { title: "4. Cookies", body: "ShiftUp does not use third-party tracking cookies. Essential technical cookies may be used to ensure the site functions properly." },
      { title: "5. Security", body: "We apply industry-standard security measures to protect your information. All communications are encrypted via HTTPS." },
      { title: "6. Your Rights", body: "Under Law 25 (Québec) and GDPR, you have the right to access, correct, delete, or object to the processing of your data. Contact us at info@slim-ia.ca." },
      { title: "7. Contact", body: "For any questions regarding this policy, write to us at info@slim-ia.ca. We respond within 48 business hours." },
    ],
  },
};

export const metadata = {
  title: "ShiftUp: Confidentialité",
};

export default function Privacy() {
  return <LegalPage copy={copy} />;
}
