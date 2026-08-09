'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MailCheck, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ControleApiError, platformForgotPassword } from '@/lib/controleApi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await platformForgotPassword(email)
      // La reponse est toujours generique (l'API ne revele jamais si
      // l'email existe), on affiche donc systematiquement la confirmation.
      setSent(true)
    } catch (err) {
      setError(err instanceof ControleApiError ? err.message : 'Erreur inattendue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: '#0f172a' }}>
      <Card className="w-full max-w-sm" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5" style={{ color: '#818cf8' }} />
            <CardTitle className="text-white">Mot de passe oublié</CardTitle>
          </div>
          <CardDescription>
            {sent
              ? "Vérifiez votre boîte de réception."
              : "Indiquez votre email pour recevoir un lien de réinitialisation."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                <MailCheck className="w-5 h-5 shrink-0" style={{ color: '#22c55e' }} />
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Un email va être envoyé à <span className="text-white">{email}</span> s&apos;il
                  correspond à un compte existant, avec un lien de réinitialisation valable 1 heure.
                  Pensez à vérifier vos courriers indésirables.
                </p>
              </div>
              <Link href="/super-admin-login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </Button>
              <Link
                href="/super-admin-login"
                className="flex items-center justify-center gap-1 text-xs hover:underline"
                style={{ color: '#818cf8' }}
              >
                <ArrowLeft className="w-3 h-3" />
                Retour à la connexion
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
