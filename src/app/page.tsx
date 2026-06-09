'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/forms')
  }, [router])
  return null // so is any case it won't break the code.
}
