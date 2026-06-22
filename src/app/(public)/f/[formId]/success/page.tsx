'use client'

import { useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FallbackPage } from '@/containers/fallback/FallbackPage'

export default function SuccessPage() {
  const router = useRouter()
  const params = useParams<{ formId?: string }>()
  const formId = params?.formId ?? ''

  const handleAction = useCallback(() => {
    router.push(formId ? `/f/${formId}` : '/')
  }, [formId, router])

  return (
    <FallbackPage
      title="Thank you!"
      description="Your response has been successfully recorded."
      icon="✨"
      actionLabel="Submit Another Response"
      onAction={handleAction}
    />
  )
}
