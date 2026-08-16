'use client'

import { useContext } from 'react'
import { Bot, Globe, Building2 } from 'lucide-react'
import { ServerContext } from '../layout'

/**
 * L'assistant IA (chatbot n8n) authentifie via le JWT HS256 du gérant et
 * exige un Membership réel (rôle, salaire, permissions) côté backend — un
 * compte plateforme n'a ni l'un ni l'autre. Le rendre fonctionnel pour
 * super-admin demanderait une identité de repli côté backend (voir
 * AssistantChatProxyView._get_assistant_chat_context) et le routage du
 * widget par le proxy plutôt que par le token du gérant : non fait pour
 * l'instant, cette page est honnête plutôt que de simuler un chat inactif.
 */
export default function SuperAdminAssistant() {
  const { isGlobalMode, selectedCompany } = useContext(ServerContext)

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu.</p>
      </div>
    )
  }

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Building2 className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une entreprise dans le menu.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
        <Bot className="w-7 h-7" style={{ color: '#818cf8' }} />
      </div>
      <div>
        <h1 className="text-lg font-bold text-white">Assistant IA — {selectedCompany.name}</h1>
        <p className="text-sm mt-2 max-w-md" style={{ color: '#94a3b8' }}>
          L'assistant IA n'est pas encore disponible depuis l'espace super-admin. Il nécessite une identité et des
          permissions propres à un employé de l'établissement, que le compte plateforme n'a pas.
        </p>
        <p className="text-xs mt-3" style={{ color: '#64748b' }}>
          Pour l'instant, utilisez l'assistant depuis le compte du gérant de {selectedCompany.name}.
        </p>
      </div>
    </div>
  )
}
