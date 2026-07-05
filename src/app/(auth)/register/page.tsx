'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, User, Building2, CreditCard, Smartphone } from 'lucide-react'

const plans = [
  { id: 'starter', name: 'Starter', price: 'Gratuit', period: '5 jours', color: '#64748b' },
  { id: 'premium', name: 'Premium', price: '49 900 FCFA', period: '/mois', color: '#6366f1' },
  { id: 'business', name: 'Business', price: 'Sur devis', period: '', color: '#22c55e' },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    establishment: '',
    email: '',
    password: '',
    plan: 'starter',
    paymentMethod: 'mobile_money'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Appel API vers Django
    console.log('Register:', formData)
    setTimeout(() => {
      setIsLoading(false)
      // Redirection vers dashboard
      window.location.href = '/dashboard'
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">Créer votre compte NOXIA</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Commencez votre essai gratuit de 5 jours</p>
        </div>

        {/* Formulaire */}
        <div 
          className="rounded-2xl p-6"
          style={{ 
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Étape 1 : Infos personnelles */}
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold text-white mb-2">Informations personnelles</h2>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                        style={{ 
                          background: 'rgba(51, 65, 85, 0.5)',
                          border: '1px solid #334155'
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                        style={{ 
                          background: 'rgba(51, 65, 85, 0.5)',
                          border: '1px solid #334155'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom de l'établissement</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input
                      type="text"
                      name="establishment"
                      value={formData.establishment}
                      onChange={handleChange}
                      placeholder="Mon Bar Premium"
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@monbar.com"
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Continuer
                </button>
              </>
            )}

            {/* Étape 2 : Plan et paiement */}
            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold text-white mb-2">Choisissez votre plan</h2>
                
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition border-2 ${
                        formData.plan === plan.id ? 'border-primary-500' : 'border-transparent'
                      }`}
                      style={{ 
                        background: formData.plan === plan.id 
                          ? 'rgba(99, 102, 241, 0.15)' 
                          : 'rgba(51, 65, 85, 0.3)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value={plan.id}
                          checked={formData.plan === plan.id}
                          onChange={handleChange}
                          className="accent-primary-500"
                        />
                        <div>
                          <span className="text-white text-sm font-medium">{plan.name}</span>
                          <p className="text-xs" style={{ color: '#94a3b8' }}>{plan.price}{plan.period}</p>
                        </div>
                      </div>
                      {formData.plan === plan.id && (
                        <span className="text-xs text-accent-400">✓ Sélectionné</span>
                      )}
                    </label>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Moyen de paiement</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'mobile_money' })}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                        formData.paymentMethod === 'mobile_money'
                          ? 'border-primary-500'
                          : 'border-dark-600'
                      }`}
                      style={{
                        background: formData.paymentMethod === 'mobile_money'
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(51, 65, 85, 0.3)',
                        border: '1px solid #334155'
                      }}
                    >
                      <Smartphone className="w-4 h-4" />
                      Mobile Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                        formData.paymentMethod === 'card'
                          ? 'border-primary-500'
                          : 'border-dark-600'
                      }`}
                      style={{
                        background: formData.paymentMethod === 'card'
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(51, 65, 85, 0.3)',
                        border: '1px solid #334155'
                      }}
                    >
                      <CreditCard className="w-4 h-4" />
                      Carte bancaire
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 rounded-lg border text-white font-semibold text-sm transition"
                    style={{ borderColor: '#334155', color: '#94a3b8' }}
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm transition disabled:opacity-50"
                    style={{ 
                      background: '#4f46e5',
                      boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {isLoading ? 'Création...' : 'Créer mon compte'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Lien vers la connexion */}
        <p className="text-center text-sm mt-4" style={{ color: '#94a3b8' }}>
          Déjà un compte ?{' '}
          <Link href="/login" className="hover:underline" style={{ color: '#818cf8' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}