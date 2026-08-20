import type { NextConfig } from "next";

// Domaines API/WS distants réellement appelés côté client (voir src/lib/auth.ts,
// src/lib/hooks/useWebSockets.ts, src/components/ui/N8nChatWidget.tsx) — en dev
// ils pointent vers 127.0.0.1, en prod vers api.noxia.ga / admin.noxia.ga.
//
// useWebSockets.ts construit dynamiquement `wss://<hostname>:8000` côté
// client quand NEXT_PUBLIC_WS_URL n'est pas défini (fallback sur
// window.location.hostname, donc inconnu au build ici) — d'où les entrées
// explicites avec/sans port et avec/sans sous-domaine ci-dessous, plutôt que
// de deviner une seule URL WS exacte qui casserait au premier changement de
// port ou de sous-domaine.
const connectSrcOrigins = [
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_CONTROLE_API_URL,
  process.env.NEXT_PUBLIC_WS_URL,
  "ws://127.0.0.1:8000",
  "wss://noxia.ga",
  "wss://noxia.ga:8000",
  "wss://*.noxia.ga",
  "wss://*.noxia.ga:8000",
]
  .filter(Boolean)
  // "'self'" n'est pas une URL valide : new URL("'self'", base) ne lève pas
  // d'erreur mais renvoie l'origine du placeholder au lieu de la valeur
  // littérale — d'où son ajout à part, après la conversion, jamais dans ce tableau.
  .map((url) => new URL(url!, "http://placeholder").origin)
  .filter((origin, i, arr) => arr.indexOf(origin) === i);
const connectSrc = ["'self'", ...connectSrcOrigins].join(" ");

// CSP restrictive : autorise uniquement les sources effectivement utilisées
// par l'app (Google Sign-In pour l'OAuth, l'API/WS Noxia). `unsafe-inline`
// sur style-src reste nécessaire pour le CSS injecté par le widget n8n
// (voir N8nChatWidget.tsx WIDGET_STYLES) — pas de contournement possible
// sans réécrire ce widget tiers.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://accounts.google.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  "frame-src https://accounts.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  devIndicators: false,
  // Image Docker minimale : ne copie que server.js + les deps effectivement
  // utilisees au runtime, au lieu de node_modules complet (voir Dockerfile).
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.INTERNAL_BACKEND_URL
          ? `${process.env.INTERNAL_BACKEND_URL}/api/v1/:path*`
          : "http://127.0.0.1:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
