import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Used by the Chrome extension popup to exchange email/password for a JWT
export async function POST(req: NextRequest) {
  console.log('[POST /api/auth/token] start')

  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  console.log('[POST /api/auth/token] token issued')
  return NextResponse.json({ access_token: data.session.access_token })
}
