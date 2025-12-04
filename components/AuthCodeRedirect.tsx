'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCodeRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect(() => {
    if (code) {
      // Redirect to the callback route with the code
      router.replace(`/auth/callback?code=${code}`)
    }
  }, [code, router])

  return null
}
