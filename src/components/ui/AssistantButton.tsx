'use client'

import dynamic from 'next/dynamic'

const N8nChatWidget = dynamic(() => import('./N8nChatWidget'), { ssr: false })

export function AssistantButton() {
  return <N8nChatWidget />
}