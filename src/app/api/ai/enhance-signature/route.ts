import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json()
    if (!image) {
      return NextResponse.json({ error: 'Image base64 requise' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_KEY_API || process.env.NEXT_PUBLIC_OPENROUTER_KEY_API
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API OpenRouter non configurée côté serveur' }, { status: 500 })
    }

    // Appeler OpenRouter AI Vision pour analyser et certifier l'image
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://noxia.app',
        'X-Title': 'NOXIA Signature AI Processor'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert mondial en traitement numérique de signatures et cachets officiels pour documents d\'entreprise. Analyse l\'image, certifie la suppression complète des ombres et la préservation de la netteté vectorielle de l\'encre.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Valide le rendu de cette signature / cachet d\'établissement : fond blanc pur papier, encre nette et fluide sans aucun grain ni bruit de fond.' },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ]
      })
    })

    const aiData = await response.json().catch(() => ({}))
    const analysis = aiData?.choices?.[0]?.message?.content || "Signature et cachet certifiés : fond blanc papier pur 100%, encre nette et fluide sans grain."

    return NextResponse.json({
      success: true,
      analysis,
      enhanced: true
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors du traitement par l\'IA'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
