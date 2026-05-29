import { createClient } from '@/lib/supabase/server'

type DomainStat = { domain: string; minutes: number; sessions: number }

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: events } = await supabase
    .from('events')
    .select('domain, duration_sec, timestamp, activity_type')
    .eq('user_id', user!.id)
    .gte('timestamp', sevenDaysAgo)
    .order('timestamp', { ascending: false })

  // Aggregate by domain
  const domainMap: Record<string, DomainStat> = {}
  for (const e of events ?? []) {
    if (!domainMap[e.domain]) domainMap[e.domain] = { domain: e.domain, minutes: 0, sessions: 0 }
    domainMap[e.domain].minutes += Math.round(e.duration_sec / 60)
    domainMap[e.domain].sessions += 1
  }
  const topDomains = Object.values(domainMap).sort((a, b) => b.minutes - a.minutes).slice(0, 10)
  const maxMinutes = topDomains[0]?.minutes ?? 1

  const totalMinutes = topDomains.reduce((sum, d) => sum + d.minutes, 0)
  const activeEvents = (events ?? []).filter(e => e.activity_type === 'active')
  const idleEvents = (events ?? []).filter(e => e.activity_type === 'idle')

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Last 7 days</p>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total time online', value: `${totalMinutes}m` },
          { label: 'Active sessions', value: activeEvents.length },
          { label: 'Idle sessions', value: idleEvents.length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Top domains */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Time by domain</h2>
        {topDomains.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No data yet. Install the extension to start tracking.</p>
        ) : (
          <div className="space-y-3">
            {topDomains.map((d) => (
              <div key={d.domain}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{d.domain}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.minutes}m</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(d.minutes / maxMinutes) * 100}%`,
                      background: 'var(--accent)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
