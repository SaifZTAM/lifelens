import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase/admin'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type EventRow = {
  domain: string
  duration_sec: number
  activity_type: string
  tab_switches: number
  timestamp: string
}

function calcRiskScore(events: EventRow[], hour: number): number {
  if (events.length === 0) return 0

  const distractionDomains = ['twitter.com', 'x.com', 'reddit.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'facebook.com', 'twitch.tv']
  const totalSec = events.reduce((s, e) => s + e.duration_sec, 0)
  const distractionSec = events.filter(e => distractionDomains.some(d => e.domain.includes(d))).reduce((s, e) => s + e.duration_sec, 0)
  const totalSwitches = events.reduce((s, e) => s + e.tab_switches, 0)

  const behaviorIntensity = Math.min((distractionSec / Math.max(totalSec, 1)) + (totalSwitches / 50), 1)
  const contextWeight = distractionSec > totalSec * 0.5 ? 1.0 : 0.6
  const timeSensitivity = (hour >= 22 || hour < 6) ? 1.5 : (hour >= 9 && hour <= 18) ? 1.2 : 1.0

  return Math.min(behaviorIntensity * contextWeight * timeSensitivity, 1)
}

function classifyCategory(events: EventRow[]): string {
  const switchRate = events.reduce((s, e) => s + e.tab_switches, 0) / Math.max(events.length, 1)
  if (switchRate > 10) return 'distraction'
  const distractionDomains = ['twitter.com', 'x.com', 'reddit.com', 'instagram.com', 'youtube.com']
  const hasDistraction = events.some(e => distractionDomains.some(d => e.domain.includes(d)))
  const hour = new Date().getHours()
  if (hour >= 22 || hour < 6) return 'sleep'
  if (hasDistraction) return 'distraction'
  return 'procrastination'
}

export async function POST(req: NextRequest) {
  console.log('[POST /api/nudges/generate] start')

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

  // Get last 30 minutes of events
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const { data: events } = await supabase
    .from('events')
    .select('domain, duration_sec, activity_type, tab_switches, timestamp')
    .eq('user_id', user.id)
    .gte('timestamp', since)

  const eventsData = (events ?? []) as EventRow[]
  const hour = new Date().getHours()
  const riskScore = calcRiskScore(eventsData, hour)

  if (riskScore < 0.65) {
    console.log(`[POST /api/nudges/generate] risk score ${riskScore.toFixed(2)} below threshold, skipping`)
    return NextResponse.json({ nudge: null, risk_score: riskScore })
  }

  const category = classifyCategory(eventsData)
  const topDomain = eventsData.sort((a, b) => b.duration_sec - a.duration_sec)[0]?.domain ?? 'unknown'

  const prompt = `You are a supportive focus coach. The user has been browsing ${topDomain} for an extended time.
Their behavior category is: ${category}. Risk score: ${(riskScore * 100).toFixed(0)}/100. Time: ${hour}:00.
Write one short, kind, non-judgmental nudge (max 2 sentences) to help them refocus. No quotes, just the message.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 80,
  })

  const message = completion.choices[0]?.message?.content?.trim() ?? 'Time to take a short break and refocus.'

  const { data: nudge, error } = await supabase
    .from('nudges')
    .insert({
      user_id: user.id,
      message,
      category,
      risk_score: riskScore,
      triggered_by: `${Math.round(eventsData.reduce((s, e) => s + e.duration_sec, 0) / 60)}min on ${topDomain}`,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/nudges/generate] db error', error.message)
    return NextResponse.json({ error: 'Failed to save nudge' }, { status: 500 })
  }

  console.log(`[POST /api/nudges/generate] nudge created for user ${user.id}, score ${riskScore.toFixed(2)}`)
  return NextResponse.json({ nudge, risk_score: riskScore })
}
