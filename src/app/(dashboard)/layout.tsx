'use client'

import { Layout } from '@/components/layout/Layout'
import { AssistantButton } from '@/components/ui/AssistantButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Layout>{children}</Layout>
      <AssistantButton />
    </>
  )
}