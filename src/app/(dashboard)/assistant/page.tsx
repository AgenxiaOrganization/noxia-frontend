'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/ui/Loader'

export default function AssistantPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers le dashboard principal
    router.replace('/dashboard')
    
    // Attendre un peu que la redirection soit effective et ouvrir le chatbot
    const timer = setTimeout(() => {
      const chatButton = document.querySelector('.n8n-chat-button') as HTMLButtonElement
      if (chatButton) {
        chatButton.click()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader />
      <p className="text-sm text-slate-400">Ouverture de l'Assistant IA...</p>
    </div>
  )
}