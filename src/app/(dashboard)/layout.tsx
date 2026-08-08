'use client'

import { Layout } from '@/components/layout/Layout'
import { AssistantButton } from '@/components/ui/AssistantButton'
import { useSessionGuard } from '@/lib/hooks/useSessionGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useSessionGuard()

  return (
    <>
      <Layout>{children}</Layout>
      <AssistantButton />
    </>
  )
}