'use client'

import { Layout } from '@/components/layout/Layout'
import { AssistantButton } from '@/components/ui/AssistantButton'
import { useSessionGuard } from '@/lib/hooks/useSessionGuard'
import { useSubscriptionGuard } from '@/lib/hooks/useSubscriptionGuard'
import SubscriptionBlockModal from '@/components/subscription/SubscriptionBlockModal'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useSessionGuard()
  const { isExpired, setIsExpired } = useSubscriptionGuard()

  return (
    <>
      <Layout>{children}</Layout>
      <AssistantButton />
      {isExpired && <SubscriptionBlockModal onResolved={() => setIsExpired(false)} />}
    </>
  )
}