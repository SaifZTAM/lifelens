import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  console.log('[GET /api/user/data] start')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const [{ data: events }, { data: nudges }, { data: insights }] = await Promise.all([
    admin.from('events').select('*').eq('user_id', user.id),
    admin.from('nudges').select('*').eq('user_id', user.id),
    admin.from('daily_insights').select('*').eq('user_id', user.id),
  ])

  console.log(`[GET /api/user/data] exported data for user ${user.id}`)
  return NextResponse.json({ events, nudges, insights })
}

export async function DELETE() {
  console.log('[DELETE /api/user/data] start')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  await Promise.all([
    admin.from('events').delete().eq('user_id', user.id),
    admin.from('nudges').delete().eq('user_id', user.id),
    admin.from('daily_insights').delete().eq('user_id', user.id),
  ])

  console.log(`[DELETE /api/user/data] all data deleted for user ${user.id}`)
  return NextResponse.json({ ok: true })
}
