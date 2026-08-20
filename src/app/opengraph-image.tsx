import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'NOXIA — Gestion de bars, snack-bars et boîtes de nuit'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// RL9-20 (audit RL SERVICES 2026-08-18) : image par défaut affichée quand un
// lien noxia.ga est partagé (WhatsApp, Facebook, Telegram...) — sans elle,
// le partage n'affiche aucune vignette, ce qui nuit fortement au taux de
// clic dans ce contexte de diffusion.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 120,
            height: 120,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)',
          }}
        >
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: 'white' }}>N</div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            letterSpacing: -2,
          }}
        >
          NOXIA
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#94a3b8',
            marginTop: 16,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Gestion de bars, snack-bars et boîtes de nuit
        </div>
      </div>
    ),
    { ...size }
  )
}
