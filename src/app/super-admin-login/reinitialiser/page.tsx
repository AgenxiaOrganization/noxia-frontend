'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
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
import { ControleApiError, platformResetPassword } from '@/lib/controleApi'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError("Lien de réinitialisation invalide : le jeton est manquant.")
      return
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      await platformResetPassword(token, password)
      setSuccess(true)
      setTimeout(() => router.replace('/super-admin-login'), 2500)
    } catch (err) {
      setError(err instanceof ControleApiError ? err.message : 'Erreur inattendue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#22c55e' }} />
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Mot de passe réinitialisé avec succès. Redirection vers la connexion...
          </p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="text-sm" style={{ color: '#f87171' }}>
          Ce lien de réinitialisation est invalide ou incomplet.
        </p>
        <Link href="/super-admin-login/mot-de-passe-oublie">
          <Button variant="outline" className="w-full">Demander un nouveau lien</Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white">Nouveau mot de passe</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-white">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      {error && (
        <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: '#0f172a' }}>
      <Card className="w-full max-w-sm" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5" style={{ color: '#818cf8' }} />
            <CardTitle className="text-white">Réinitialiser le mot de passe</CardTitle>
          </div>
          <CardDescription>Choisissez un nouveau mot de passe pour votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm" style={{ color: '#94a3b8' }}>Chargement...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
