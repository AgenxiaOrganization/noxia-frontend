import { AlertTriangle, BarChart3, Bot, Check, Mic, Package, Send } from 'lucide-react'
import { TELEGRAM_URL, WHATSAPP_URL } from './links'

const ASKS = [
  { icon: BarChart3, text: 'Ses ventes du jour, de la semaine ou du mois' },
  { icon: Package, text: 'Son stock produit par produit' },
  { icon: AlertTriangle, text: 'Les alertes de rupture en cours' },
  { icon: Mic, text: 'Par écrit ou par message vocal, depuis n’importe où' },
]

export function WhatsAppSection() {
  return (
    <section id="whatsapp" className="nx-section nx-cv overflow-hidden" aria-labelledby="whatsapp-title">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 75% 50%, rgba(37, 211, 102, 0.08), transparent 70%)' }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <div data-reveal>
          <p className="nx-eyebrow">Pilotez depuis WhatsApp</p>
          <h2 id="whatsapp-title" className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Votre établissement répond à vos questions, même à distance
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Pas besoin d&apos;ouvrir un ordinateur : écrivez à l&apos;assistant NOXIA sur WhatsApp ou Telegram, comme à un
            collègue. Il connaît vos chiffres en temps réel et ne montre à chacun que ce que son rôle autorise.
          </p>
          <ul className="mt-8 space-y-3">
            {ASKS.map((ask) => (
              <li key={ask.text} className="flex items-center gap-3 text-slate-200">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(37, 211, 102, 0.12)' }}>
                  <ask.icon className="w-4 h-4 text-[#25d366]" aria-hidden="true" />
                </span>
                {ask.text}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-slate-500">
            Les réponses de l&apos;assistant sont générées automatiquement par une intelligence artificielle.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="nx-btn-primary !bg-none" style={{ background: '#15803d' }}>
              <Send className="w-4 h-4" aria-hidden="true" /> Écrire sur WhatsApp
            </a>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="nx-btn-secondary">
              Ouvrir sur Telegram
            </a>
          </div>
        </div>

        {/* Téléphone : conversation de démonstration en boucle (HTML/CSS seulement) */}
        <div className="nx-anim relative mx-auto w-full max-w-[340px]" data-reveal aria-hidden="true">
          <div className="rounded-[2.2rem] p-2.5" style={{ background: 'linear-gradient(160deg, #1e293b, #0b1020)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="rounded-[1.8rem] overflow-hidden" style={{ background: '#0b141a' }}>
              <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#1f2c34' }}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'rgba(37, 211, 102, 0.18)' }}>
                  <Bot className="w-4 h-4 text-[#25d366]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Assistant NOXIA</p>
                  <p className="text-[11px] text-emerald-300">en ligne</p>
                </div>
              </div>
              <div className="space-y-2.5 px-3 py-4 min-h-[360px] text-[13px]">
                <p className="nx-a-chat-1 ml-auto w-fit max-w-[80%] rounded-xl rounded-tr-sm px-3 py-2 text-white" style={{ background: '#005c4b' }}>
                  Bonsoir, combien j&apos;ai fait ce soir ?
                </p>
                <div className="nx-a-chat-2 flex w-fit gap-1 rounded-xl px-3 py-2.5 opacity-0" style={{ background: '#1f2c34' }}>
                  <span className="nx-a-dot h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="nx-a-dot h-1.5 w-1.5 rounded-full bg-slate-300" style={{ ['--d' as string]: '150ms' }} />
                  <span className="nx-a-dot h-1.5 w-1.5 rounded-full bg-slate-300" style={{ ['--d' as string]: '300ms' }} />
                </div>
                <div className="nx-a-chat-3 w-fit max-w-[88%] rounded-xl rounded-tl-sm px-3 py-2 text-slate-100" style={{ background: '#1f2c34' }}>
                  <p>Ventes d&apos;aujourd&apos;hui :</p>
                  <p className="mt-1">• Chiffre d&apos;affaires : <b>486 500 FCFA</b></p>
                  <p>• Nombre de ventes : <b>62</b></p>
                  <p>• Le plus vendu : Castel 65 cl</p>
                </div>
                <p className="nx-a-chat-4 ml-auto flex w-fit items-center gap-1.5 rounded-xl rounded-tr-sm px-3 py-2 text-white" style={{ background: '#005c4b' }}>
                  <Mic className="w-3.5 h-3.5" /> « Il reste combien de Castel ? »
                </p>
                <div className="nx-a-chat-5 flex w-fit gap-1 rounded-xl px-3 py-2.5 opacity-0" style={{ background: '#1f2c34' }}>
                  <span className="nx-a-dot h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="nx-a-dot h-1.5 w-1.5 rounded-full bg-slate-300" style={{ ['--d' as string]: '150ms' }} />
                  <span className="nx-a-dot h-1.5 w-1.5 rounded-full bg-slate-300" style={{ ['--d' as string]: '300ms' }} />
                </div>
                <div className="nx-a-chat-6 w-fit max-w-[88%] rounded-xl rounded-tl-sm px-3 py-2 text-slate-100" style={{ background: '#1f2c34' }}>
                  <p>Castel 65 cl : <b>6 bouteilles</b> en réserve.</p>
                  <p className="mt-1 flex items-center gap-1 text-amber-300"><AlertTriangle className="w-3.5 h-3.5" /> Sous le seuil d&apos;alerte</p>
                  <p className="mt-1 flex items-center justify-end gap-0.5 text-[10px] text-slate-500">22:41 <Check className="w-3 h-3" /></p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-500">Conversation de démonstration, données d&apos;exemple</p>
        </div>
      </div>
    </section>
  )
}
