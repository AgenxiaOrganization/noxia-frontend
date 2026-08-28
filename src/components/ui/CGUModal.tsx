'use client'

import { X } from 'lucide-react'

interface CGUModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CGUModal({ isOpen, onClose }: CGUModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[80vh] rounded-2xl p-6 overflow-y-auto"
        style={{ 
          background: '#1e293b',
          border: '1px solid #334155'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Conditions Générales d'Utilisation De Noxia</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded hover:bg-white/10 transition"
            style={{ color: '#94a3b8' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm" style={{ color: '#cbd5e1' }}>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(51,65,85,0.3)' }}>
            <h3 className="text-white font-semibold mb-2">1. Objet</h3>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme 
              NOXIA, éditée par Agenxia. En vous inscrivant sur NOXIA, vous acceptez pleinement et sans réserve les 
              présentes CGU.
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(51,65,85,0.3)' }}>
            <h3 className="text-white font-semibold mb-2">2. Description des services</h3>
            <p>
              NOXIA est une plateforme SaaS (Software as a Service) de gestion pour bars, restaurants, snack-bars et 
              boîtes de nuit. Elle propose notamment :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1" style={{ color: '#94a3b8' }}>
              <li>Gestion des stocks et des produits</li>
              <li>Gestion des ventes et de la caisse (POS)</li>
              <li>Gestion des employés et des permissions</li>
              <li>Tableaux de bord et rapports d'analyse</li>
              <li>Intégration avec WhatsApp, Telegram et assistant IA</li>
              <li>Gestion des abonnements et des paiements</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(51,65,85,0.3)' }}>
            <h3 className="text-white font-semibold mb-2">3. Compte utilisateur</h3>
            <p>
              L'utilisateur s'engage à fournir des informations exactes et à jour lors de la création de son compte. 
              Chaque compte est strictement personnel et ne peut être transféré. L'utilisateur est responsable de la 
              confidentialité de ses identifiants et de toutes les activités réalisées via son compte.
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(51,65,85,0.3)' }}>
            <h3 className="text-white font-semibold mb-2">4. Abonnements et paiements</h3>
            <p>
              NOXIA propose différents plans d'abonnement (Essai, Starter, Premium, Business). Les prix sont indiqués 
              en FCFA (hors taxes). Les abonnements sont renouvelés automatiquement sauf annulation par l'utilisateur 
              avant la date d'échéance. Les paiements sont sécurisés via Mobile Money ou carte bancaire.
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(51,65,85,0.3)' }}>
            <h3 className="text-white font-semibold mb-2">5. Protection des données</h3>
            <p>
              NOXIA s'engage à protéger les données personnelles de ses utilisateurs conformément au Règlement Général 
              sur la Protection des Données (RGPD). Les données sont hébergées sur des serveurs sécurisés et ne sont 
              jamais partagées avec des tiers sans consentement explicite.
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(51,65,85,0.3)' }}>
            <h3 className="text-white font-semibold mb-2">6. Propriété intellectuelle</h3>
            <p>
              Tous les éléments de la plateforme NOXIA (logos, interfaces, codes, contenus) sont la propriété exclusive 
              d'Agenxia. Toute reproduction, modification ou distribution sans autorisation est strictement interdite.
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(51,65,85,0.3)' }}>
            <h3 className="text-white font-semibold mb-2">7. Responsabilités</h3>
            <p>
              NOXIA s'efforce d'assurer un service continu et de qualité. Toutefois, la plateforme ne saurait être tenue 
              responsable des pertes de données, des interruptions de service ou des dommages indirects liés à 
              l'utilisation de la plateforme. L'utilisateur est responsable de la sauvegarde de ses propres données.
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(51,65,85,0.3)' }}>
            <h3 className="text-white font-semibold mb-2">8. Résiliation</h3>
            <p>
              L'utilisateur peut résilier son compte à tout moment depuis son espace personnel ou en contactant le 
              support. En cas de non-respect des présentes CGU, NOXIA se réserve le droit de suspendre ou résilier le 
              compte de l'utilisateur sans préavis.
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(51,65,85,0.3)' }}>
            <h3 className="text-white font-semibold mb-2">9. Modification des CGU</h3>
            <p>
              NOXIA se réserve le droit de modifier les présentes CGU à tout moment. Les modifications seront notifiées 
              aux utilisateurs et prendront effet immédiatement. L'utilisation continue de la plateforme vaut acceptation 
              des nouvelles conditions.
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(51,65,85,0.3)' }}>
            <h3 className="text-white font-semibold mb-2">10. Loi applicable</h3>
            <p>
              Les présentes CGU sont régies par le droit gabonais. Tout litige relatif à l'utilisation de NOXIA sera soumis 
              aux tribunaux compétents de Libreville, Gabon.
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <p className="text-xs" style={{ color: '#22c55e' }}>
              ✅ Version en vigueur au 01/08/2026
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t" style={{ borderColor: '#334155' }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition"
            style={{ 
              background: '#4f46e5',
              boxShadow: '0 10px 25px -5px rgba(99,102,241,0.3)'
            }}
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  )
}