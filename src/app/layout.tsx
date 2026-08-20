import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

const SITE_URL = "https://noxia.ga";
const SITE_TITLE = "NOXIA - Gestion de bars et boîtes de nuit";
const SITE_DESCRIPTION =
  "Plateforme SaaS de gestion pour bars, snack-bars et boîtes de nuit : caisse, stocks, rapports et gestion d'équipe, pilotable via une interface web et des bots WhatsApp/Telegram.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s | NOXIA" },
  description: SITE_DESCRIPTION,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans bg-dark-950 text-white min-h-screen antialiased">
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}