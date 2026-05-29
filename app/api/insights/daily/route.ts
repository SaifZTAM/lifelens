import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase/admin'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function GET(req: NextRequest) {
  console.log('[GET /api/insights/daily] start')

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

  const today = new Date().toISOString().split('T')[0]

  // Return existing insight if already generated today
  const { data: existing } = await supabase
    .from('daily_insights')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (existing) {
    console.log('[GET /api/insights/daily] returning cached insight')
    return NextResponse.json({ insight: existing })
  }

  // Fetch today's events
  const { data: events } = await supabase
    .from('events')
    .select('domain, duration_sec, activity_type')
    .eq('user_id', user.id)
    .gte('timestamp', `${today}T00:00:00`)

  if (!events || events.length === 0) {
    return NextResponse.json({ insight: null })
  }

  // Build domain summary
  const domainMap: Record<string, number> = {}
  for (const e of events) {
    domainMap[e.domain] = (domainMap[e.domain] ?? 0) + e.duration_sec
  }
  const topDomains = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, secs]) => ({ domain, minutes: Math.round(secs / 60) }))

  const totalMinutes = Math.round(events.reduce((s, e) => s + e.duration_sec, 0) / 60)
  const distractionDomains = ['twitter.com', 'x.com', 'reddit.com', 'instagram.com', 'youtube.com', 'tiktok.com']
  const distractionMinutes = events
    .filter(e => distractionDomains.some(d => e.domain.includes(d)))
    .reduce((s, e) => s + Math.round(e.duration_sec / 60), 0)

  const riskLevel = distractionMinutes > totalMinutes * 0.5 ? 'high' : distractionMinutes > totalMinutes * 0.25 ? 'medium' : 'low'

  const prompt = `You are a personal productivity coach. Here is a summary of the user's web browsing today:
Total time: ${totalMinutes} minutes
Top sites: ${topDomains.map(d => `${d.domain} (${d.minutes}m)`).join(', ')}
Distraction time: ${distractionMinutes} minutes
Risk level: ${riskLevel}

Write a 2-3 sentence daily insight. Be warm, specific to their data, and end with one actionable suggestion for tomorrow. No fluff.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
  })

  const summary = completion.choices[0]?.message?.content?.trim() ?? 'Keep building awareness of your browsing habits — small adjustments add up.'

  const { data: insight, error } = await supabase
    .from('daily_insights')
    .upsert({ user_id: user.id, date: today, summary, top_domains: topDomains, risk_level: riskLevel })
    .select()
    .single()

  if (error) {
    console.error('[GET /api/insights/daily] db error', error.message)
    return NextResponse.json({ error: 'Failed to save insight' }, { status: 500 })
  }

  console.log(`[GET /api/insights/daily] insight generated for user ${user.id}`)
  return NextResponse.json({ insight })
}
