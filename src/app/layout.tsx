import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

const SITE_URL = "https://noxia.ga";
const SITE_TITLE = "NOXIA - Logiciel de gestion pour bars, restaurants et boîtes de nuit au Gabon";
const SITE_DESCRIPTION =
  "NOXIA est la plateforme de gestion pour bars, snack-bars, boîtes de nuit et restaurants au Gabon : caisse (POS), gestion des stocks, rapports automatiques, gestion d'équipe et assistant intelligent pilotable depuis WhatsApp et Telegram.";
// Termes de recherche réels que tape un gérant d'établissement au Gabon (pas
// de mots-clés génériques inventés) : chaque entrée reprend une fonctionnalité
// ou un type d'établissement effectivement couvert par la landing page.
const SITE_KEYWORDS = [
  "logiciel de gestion bar Gabon",
  "logiciel caisse restaurant Gabon",
  "gestion stock bar",
  "caisse enregistreuse bar restaurant",
  "logiciel boîte de nuit",
  "gestion snack-bar",
  "application gestion restaurant Afrique",
  "bot WhatsApp gestion établissement",
  "assistant IA restaurant",
  "logiciel POS Gabon",
  "menu QR code restaurant",
  "NOXIA",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s | NOXIA" },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: "NOXIA",
  alternates: { canonical: SITE_URL },
  // RL9-20 (audit RL SERVICES 2026-08-18) : balises Open Graph/Twitter — sans
  // elles, un lien noxia.ga partagé sur WhatsApp/Facebook/Telegram n'affiche
  // ni titre ni image, ce qui nuit fortement au taux de clic.
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "NOXIA",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// Schema.org (JSON-LD) : donne explicitement à Google la nature du produit
// (logiciel SaaS, secteur, prix d'entrée) et son identité d'organisation —
// condition pour obtenir des rich snippets (étoiles, prix) dans les résultats
// de recherche plutôt qu'un simple lien bleu.
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NOXIA",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  offers: {
    "@type": "Offer",
    priceCurrency: "XAF",
    category: "SaaS",
  },
  audience: {
    "@type": "Audience",
    audienceType: "Bars, snack-bars, boîtes de nuit et restaurants",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NOXIA",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  areaServed: { "@type": "Country", name: "Gabon" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="font-sans bg-dark-950 text-white min-h-screen antialiased">
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}