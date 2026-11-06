import type { ReactNode } from 'react'
import {
  BarChart3, Bot, CloudOff, History, Lock, Mic, Package, QrCode, Receipt, ShieldCheck, Smartphone, Users,
} from 'lucide-react'

/** Brique de la grille : bordure lumineuse, lueur qui suit la souris, apparition au défilement. */
function Brick({
  className = '', icon: Icon, title, text, children, soon = false, delay = 0,
}: {
  className?: string
  icon: typeof Package
  title: string
  text: string
  children?: ReactNode
  soon?: boolean
  delay?: number
}) {
  return (
    <article
      className={`nx-card nx-lift relative p-6 flex flex-col ${className}`}
      data-glow
      data-reveal
      style={{ ['--d' as string]: `${delay}ms` }}
    >
      <span className="nx-hover-glow" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-400/20">
          <Icon className="w-5 h-5 text-indigo-300" aria-hidden="true" />
        </span>
        {soon && (
          <span className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-200 bg-amber-400/10 border border-amber-300/25">
            Bientôt disponible
          </span>
        )}
      </div>
      <h3 className="relative mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="relative mt-2 text-slate-400 leading-relaxed">{text}</p>
      {children && <div className="relative mt-6 flex-1 flex items-end">{children}</div>}
    </article>
  )
}

const ROLES = ['Administrateur', 'Gérant', 'Caissier', 'Serveur', 'Magasinier', 'Comptable']

export function Bento() {
  return (
    <section id="features" className="nx-section nx-cv" aria-labelledby="features-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl" data-reveal>
          <p className="nx-eyebrow">Fonctionnalités</p>
          <h2 id="features-title" className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Tout votre établissement, sous contrôle
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            De la caisse au stock en passant par l&apos;équipe : une seule plateforme, pensée pour les bars, snack-bars et boîtes de nuit.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Brick
            className="lg:col-span-2"
            icon={Receipt}
            title="Caisse et ventes en temps réel"
            text="Encaissez en espèces, Mobile Money ou carte. Chaque vente apparaît aussitôt sur votre tableau de bord, avec sa facture PDF."
          >
            <div className="nx-anim grid w-full grid-cols-[1fr_auto] gap-5 items-end">
              <div className="relative h-24 overflow-hidden" aria-hidden="true">
                <svg viewBox="0 0 300 90" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                  <path d="M0 80 L50 70 L90 74 L130 52 L170 58 L210 34 L250 30 L300 10" fill="none" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
                <div className="nx-a-wipe absolute inset-0 origin-right" style={{ background: '#0b1020' }} />
              </div>
              {/* Ticket de caisse qui s'imprime */}
              <div className="relative w-28 h-28 overflow-hidden" aria-hidden="true">
                <div className="absolute inset-x-0 top-0 h-2 rounded-full" style={{ background: '#1e293b' }} />
                <div className="nx-a-ticket absolute inset-x-2 top-1 rounded-b-md bg-slate-100 px-2.5 py-2 text-[9px] leading-tight text-slate-700 font-mono">
                  <p className="font-bold text-center">TICKET</p>
                  <p className="mt-1 flex justify-between"><span>2 × Castel</span><span>2 000</span></p>
                  <p className="flex justify-between"><span>1 × Burger</span><span>4 000</span></p>
                  <p className="mt-1 border-t border-dashed border-slate-400 pt-1 flex justify-between font-bold"><span>Total</span><span>6 000</span></p>
                </div>
              </div>
            </div>
          </Brick>

          <Brick
            icon={Package}
            title="Stock et alertes de rupture"
            text="Chaque vente déduit le stock. Vous êtes alerté avant la rupture, sur le tableau de bord et dans vos notifications."
            delay={80}
          >
            <div className="nx-anim w-full" aria-hidden="true">
              <div className="flex justify-between text-xs text-slate-400"><span>Flag 65 cl</span><span>Réserve</span></div>
              <div className="mt-2 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="nx-a-stock h-full w-full origin-left rounded-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #34d399)' }} />
              </div>
              <p className="nx-a-alert mt-3 text-xs font-semibold text-amber-300">⚠ Stock bas : Flag 65 cl</p>
            </div>
          </Brick>

          <Brick
            icon={Users}
            title="Rôles et permissions"
            text="Chaque membre de l'équipe a son rôle. Il ne voit et ne modifie que ce que vous autorisez."
            delay={80}
          >
            <ul className="flex flex-wrap gap-2" aria-label="Rôles disponibles">
              {ROLES.map((role) => (
                <li key={role} className="rounded-full px-3 py-1 text-xs font-medium text-slate-200 bg-white/[0.04] border border-white/10">{role}</li>
              ))}
            </ul>
          </Brick>

          <Brick
            icon={History}
            title="Chaque caissier tracé"
            text="Qui a encaissé quoi, et quand : chaque vente et chaque opération sensible est enregistrée dans le journal d'audit."
            delay={160}
          >
            <div className="nx-anim w-full space-y-2 text-xs" aria-hidden="true">
              {[
                ['nx-a-log-1', '21:14', 'Vente encaissée · Caisse 1'],
                ['nx-a-log-2', '21:16', 'Sortie de stock · Réserve'],
                ['nx-a-log-3', '21:19', 'Modification de prix · Gérant'],
              ].map(([anim, time, label]) => (
                <p key={time} className={`${anim} flex gap-3 rounded-lg px-3 py-2 bg-white/[0.03] border border-white/[0.06]`}>
                  <span className="font-mono text-slate-500">{time}</span>
                  <span className="text-slate-300">{label}</span>
                </p>
              ))}
            </div>
          </Brick>

          <Brick
            icon={Bot}
            title="Assistant IA sur WhatsApp, Telegram et web"
            text="Demandez vos ventes, votre stock ou vos alertes, par écrit ou par message vocal. Les réponses sont générées par une intelligence artificielle."
            delay={240}
          >
            <p className="inline-flex items-center gap-2 text-sm text-emerald-300">
              <Mic className="w-4 h-4" aria-hidden="true" /> Messages vocaux compris
            </p>
          </Brick>

          <Brick
            icon={BarChart3}
            title="Rapports et tableaux de bord"
            text="Chiffre d'affaires, produits les plus vendus, ventes par heure, finances : exportez vos rapports en PDF ou Excel."
          >
            <div className="nx-anim flex h-20 w-full items-end gap-2" aria-hidden="true">
              {[0.45, 0.7, 0.55, 0.9, 0.65, 1, 0.8].map((h, i) => (
                <span
                  key={i}
                  className="nx-a-bar flex-1 origin-bottom rounded-t-md"
                  style={{ height: `${h * 100}%`, background: 'linear-gradient(180deg, #818cf8, #4f46e5)', ['--d' as string]: `${i * 90}ms` }}
                />
              ))}
            </div>
          </Brick>

          <Brick
            icon={QrCode}
            title="Menu QR et commandes en ligne"
            text="Vos clients consultent la carte sur leur téléphone et commandent à l'avance ; vous recevez la commande en temps réel."
            delay={80}
          />

          <Brick
            icon={ShieldCheck}
            title="Données strictement séparées"
            text="Chaque établissement a son espace isolé : aucune donnée ne peut être consultée par un autre client de NOXIA."
            delay={160}
          >
            <p className="inline-flex items-center gap-2 text-sm text-slate-300">
              <Lock className="w-4 h-4 text-indigo-300" aria-hidden="true" /> Connexions chiffrées (HTTPS), sauvegardes quotidiennes
            </p>
          </Brick>

          <Brick
            icon={Smartphone}
            title="Application NOXIA Mobile"
            text="Votre établissement dans une application sur votre téléphone. Elle fonctionne aussi hors ligne, se synchronise dès le retour de la connexion et imprime les reçus."
            soon
          />

          <Brick
            className="md:col-span-2 lg:col-span-2"
            icon={CloudOff}
            title="NOXIA Desktop : caisse hors ligne"
            text="Continuez d'encaisser même sans connexion : synchronisation automatique dès le retour du réseau, impression des reçus et des factures directement depuis la caisse."
            soon
            delay={80}
          />
        </div>
      </div>
    </section>
  )
}
