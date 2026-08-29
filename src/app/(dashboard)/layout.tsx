'use client'

import { Layout } from '@/components/layout/Layout'
import { AssistantButton } from '@/components/ui/AssistantButton'
import { useSessionGuard } from '@/lib/hooks/useSessionGuard'
import { useSubscriptionGuard } from '@/lib/hooks/useSubscriptionGuard'
import { useCompanySuspensionGuard } from '@/lib/hooks/useCompanySuspensionGuard'
import SubscriptionBlockModal from '@/components/subscription/SubscriptionBlockModal'
import CompanySuspendedBanner from '@/components/company/CompanySuspendedBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useSessionGuard()
  const { status: subscriptionBlockStatus, setStatus: setSubscriptionBlockStatus } = useSubscriptionGuard()
  const { isSuspended, reason, allowedModules } = useCompanySuspensionGuard()

  return (
    <>
      <Layout banner={isSuspended && <CompanySuspendedBanner reason={reason} allowedModules={allowedModules} />}>
        {children}
      </Layout>
      <AssistantButton />
      {subscriptionBlockStatus && (
        <SubscriptionBlockModal
          status={subscriptionBlockStatus}
          onResolved={() => setSubscriptionBlockStatus(null)}
        />
      )}
    </>
  )
}