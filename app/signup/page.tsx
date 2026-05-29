'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthUI } from '@/components/ui/auth-fuse'

export default function SignupPage() {
  const router = useRouter()
  const [signInError, setSignInError] = useState('')
  const [signUpError, setSignUpError] = useState('')
  const [signInLoading, setSignInLoading] = useState(false)
  const [signUpLoading, setSignUpLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSignIn(email: string, password: string) {
    setSignInError('')
    setSignInLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setSignInError(error.message)
      setSignInLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleSignUp(email: string, password: string) {
    setSignUpError('')
    setSignUpLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      setSignUpError(error.message)
      setSignUpLoading(false)
      return
    }
    setSuccessMessage(`We sent a confirmation link to ${email}. Click it to activate your account.`)
  }

  return (
    <AuthUI
      defaultMode="signup"
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      signInError={signInError}
      signUpError={signUpError}
      signInLoading={signInLoading}
      signUpLoading={signUpLoading}
      successMessage={successMessage}
    />
  )
}
