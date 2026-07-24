import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ShiftUp: Trouve un emploi près de chez toi",
  description:
    "ShiftUp connecte les travailleurs, les employeurs et les talents locaux à Montréal. Swipe sur des offres, réserve un talent, ou propose tes services. 100% gratuit pour les candidats.",
  openGraph: {
    title: "ShiftUp: Trouve un emploi près de chez toi",
    description:
      "L'emploi et les talents, réunis. ShiftUp connecte travailleurs, employeurs et talents locaux à Montréal.",
    locale: "fr_CA",
    siteName: "ShiftUp",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShiftUp: Trouve un emploi près de chez toi",
    description: "L'emploi et les talents, réunis. Gratuit pour les candidats à Montréal.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0810",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
