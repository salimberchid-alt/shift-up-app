import { LegalPage } from "@/components/legal";

const copy = {
  fr: {
    badge: "📄 Conditions d'utilisation",
    title: "Conditions d'utilisation de ShiftUp",
    updated: "Dernière mise à jour : juin 2025",
    questions: "Des questions ?",
    backHome: "Retour à l'accueil",
    crossLinkHref: "/privacy",
    crossLinkLabel: "Politique de confidentialité",
    sections: [
      { title: "1. Acceptation des conditions", body: "En accédant à ShiftUp, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas, veuillez ne pas utiliser notre service." },
      { title: "2. Description du service", body: "ShiftUp est une plateforme de mise en relation entre travailleurs et employeurs à Montréal. Le service est gratuit pour les travailleurs. Les employeurs paient par match confirmé ($25) ou via des forfaits." },
      { title: "3. Inscription et liste d'attente", body: "En vous inscrivant sur la liste d'attente, vous acceptez de recevoir des communications de ShiftUp relatives au lancement et aux mises à jour du service. Vous pouvez vous désinscrire à tout moment." },
      { title: "4. Tarification employeurs", body: "Les tarifs en vigueur sont : 1 match à $25, forfait 10 matchs à $99, abonnement illimité à $189.99/mois. Un super like est facturé $5. Les prix peuvent être modifiés avec un préavis de 30 jours." },
      { title: "5. Utilisation acceptable", body: "Vous vous engagez à ne pas utiliser ShiftUp à des fins frauduleuses, à ne pas publier de fausses offres d'emploi, à ne pas harceler d'autres utilisateurs, et à respecter toutes les lois applicables au Québec et au Canada." },
      { title: "6. Interdiction de contournement de la plateforme", body: "Tous les paiements et arrangements de service, incluant les emplois, quarts de travail, réservations de talents freelance, ainsi que tout travail supplémentaire ou renouvellement découlant d'une mise en relation sur ShiftUp, doivent être conclus et payés exclusivement par l'entremise de ShiftUp. Il est interdit de solliciter ou d'accepter une transaction en dehors de la plateforme avec un employeur, travailleur ou talent rencontré sur ShiftUp, y compris dans le but d'éviter les frais de service. Tout manquement peut entraîner la suspension ou la résiliation immédiate du compte, sans remboursement, conformément à la section 9." },
      { title: "7. Propriété intellectuelle", body: "Tout le contenu de ShiftUp (design, textes, logo, algorithme de matching) est la propriété exclusive de Slim-IA. Toute reproduction sans autorisation écrite est interdite." },
      { title: "8. Limitation de responsabilité", body: "ShiftUp agit comme intermédiaire. Nous ne sommes pas responsables des relations de travail établies via la plateforme. Nous ne garantissons pas un nombre minimum de matchs." },
      { title: "9. Modification et résiliation", body: "Nous nous réservons le droit de modifier ces conditions ou de suspendre l'accès à tout utilisateur en violation des présentes, sans préavis." },
      { title: "10. Droit applicable", body: "Ces conditions sont régies par les lois de la province de Québec et du Canada. Tout litige sera soumis aux tribunaux compétents de Montréal." },
      { title: "11. Contact", body: "Pour toute question : info@slim-ia.ca" },
    ],
  },
  en: {
    badge: "📄 Terms of Service",
    title: "ShiftUp Terms of Service",
    updated: "Last updated: June 2025",
    questions: "Questions?",
    backHome: "Back to home",
    crossLinkHref: "/privacy",
    crossLinkLabel: "Privacy Policy",
    sections: [
      { title: "1. Acceptance of Terms", body: "By accessing ShiftUp, you agree to be bound by these terms. If you do not agree, please do not use our service." },
      { title: "2. Service Description", body: "ShiftUp is a platform connecting workers and employers in Montréal. Free for workers. Employers pay per confirmed match ($25) or through bundles." },
      { title: "3. Registration & Waitlist", body: "By signing up for the waitlist, you agree to receive communications from ShiftUp about the launch and service updates. You may unsubscribe at any time." },
      { title: "4. Employer Pricing", body: "Current rates: 1 match at $25, bundle of 10 matches at $99, unlimited subscription at $189.99/month. A super like is charged at $5. Prices may change with 30 days' notice." },
      { title: "5. Acceptable Use", body: "You agree not to use ShiftUp for fraudulent purposes, post false job listings, harass other users, or violate any applicable laws in Québec or Canada." },
      { title: "6. No Circumvention of the Platform", body: "All payments and service arrangements — including jobs, shifts, freelance talent bookings, and any additional or follow-on work arising from a connection made on ShiftUp — must be arranged and paid for exclusively through ShiftUp. Soliciting or agreeing to an off-platform transaction with an employer, worker, or talent you met through ShiftUp, including to avoid service fees, is prohibited. Violations may result in immediate account suspension or termination, without refund, per Section 9." },
      { title: "7. Intellectual Property", body: "All ShiftUp content (design, text, logo, matching algorithm) is the exclusive property of Slim-IA. Reproduction without written permission is prohibited." },
      { title: "8. Limitation of Liability", body: "ShiftUp acts as an intermediary. We are not responsible for employment relationships established through the platform. We do not guarantee a minimum number of matches." },
      { title: "9. Modification & Termination", body: "We reserve the right to modify these terms or suspend access for any user in violation, without notice." },
      { title: "10. Governing Law", body: "These terms are governed by the laws of Québec and Canada. Disputes will be submitted to the competent courts of Montréal." },
      { title: "11. Contact", body: "For any questions: info@slim-ia.ca" },
    ],
  },
};

export const metadata = {
  title: "ShiftUp: Conditions",
};

export default function Terms() {
  return <LegalPage copy={copy} />;
}
