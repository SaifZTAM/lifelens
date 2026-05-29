import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type EventPayload = {
  timestamp: string
  domain: string
  duration_sec: number
  activity_type: 'active' | 'idle' | 'switching'
  tab_switches: number
}

export async function POST(req: NextRequest) {
  console.log('[POST /api/events/track] start')

  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const supabase = createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const body = await req.json() as { events: EventPayload[] }
  if (!body.events || !Array.isArray(body.events)) {
    return NextResponse.json({ error: 'events array required' }, { status: 400 })
  }

  const rows = body.events.map((e) => ({
    user_id: user.id,
    timestamp: e.timestamp,
    domain: e.domain,
    duration_sec: e.duration_sec,
    activity_type: e.activity_type,
    tab_switches: e.tab_switches,
  }))

  const { error } = await supabase.from('events').insert(rows)
  if (error) {
    console.error('[POST /api/events/track] db error', error.message)
    return NextResponse.json({ error: 'Failed to save events' }, { status: 500 })
  }

  console.log(`[POST /api/events/track] saved ${rows.length} events for user ${user.id}`)
  return NextResponse.json({ ok: true, saved: rows.length })
}
