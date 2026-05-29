import { createClient } from '@/lib/supabase/server'
import { Clock, Zap, Bell, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { color: string; bg: string; icon: typeof CheckCircle }> = {
    Low:    { color: 'var(--risk-low)',    bg: 'rgba(34,197,94,0.1)',   icon: CheckCircle },
    Medium: { color: 'var(--risk-medium)', bg: 'rgba(245,158,11,0.1)', icon: TrendingUp },
    High:   { color: 'var(--risk-high)',   bg: 'rgba(239,68,68,0.1)',  icon: AlertTriangle },
  }
  const c = config[level] ?? config.Low
  const Icon = c.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ color: c.color, background: c.bg }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {level}
    </span>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  valueColor,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  icon: typeof Clock
  valueColor?: string
  accent?: boolean
}) {
  return (
    <div
      className="p-5 rounded-2xl border relative overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {accent && (
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: `radial-gradient(ellipse at top left, var(--accent), transparent)` }}
        />
      )}
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--surface-raised)' }}
        >
          <Icon size={14} style={{ color: 'var(--text-secondary)' }} strokeWidth={2} />
        </div>
      </div>
      <p
        className="text-3xl font-bold tracking-tight"
        style={{ color: valueColor ?? 'var(--text-primary)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

function DomainBar({ domain, minutes, max }: { domain: string; minutes: number; max: number }) {
  const pct = max > 0 ? Math.round((minutes / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold uppercase shrink-0"
        style={{ background: 'var(--surface-raised)', color: 'var(--text-secondary)' }}
      >
        {domain.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {domain}
          </span>
          <span className="text-xs ml-2 shrink-0" style={{ color: 'var(--text-secondary)' }}>
            {minutes}m
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  const [{ data: events }, { data: nudges }, { data: insight }] = await Promise.all([
    supabase
      .from('events')
      .select('domain, duration_sec, activity_type')
      .eq('user_id', user!.id)
      .gte('timestamp', `${today}T00:00:00`)
      .order('timestamp', { ascending: false }),
    supabase
      .from('nudges')
      .select('id, message, category, risk_score, delivered_at')
      .eq('user_id', user!.id)
      .gte('delivered_at', `${today}T00:00:00`)
      .order('delivered_at', { ascending: false })
      .limit(5),
    supabase
      .from('daily_insights')
      .select('summary, risk_level')
      .eq('user_id', user!.id)
      .eq('date', today)
      .single(),
  ])

  const totalSeconds = (events ?? []).reduce((sum, e) => sum + e.duration_sec, 0)
  const totalMinutes = Math.round(totalSeconds / 60)

  const avgRisk = nudges && nudges.length > 0
    ? nudges.reduce((sum, n) => sum + n.risk_score, 0) / nudges.length
    : 0
  const riskColor =
    avgRisk > 0.65 ? 'var(--risk-high)' :
    avgRisk > 0.4  ? 'var(--risk-medium)' :
                     'var(--risk-low)'
  const riskLabel = avgRisk > 0.65 ? 'High' : avgRisk > 0.4 ? 'Medium' : 'Low'
  const focusScore = Math.round((1 - avgRisk) * 100)

  // Top domains
  const domainMap: Record<string, number> = {}
  for (const e of events ?? []) {
    domainMap[e.domain] = (domainMap[e.domain] ?? 0) + Math.round(e.duration_sec / 60)
  }
  const topDomains = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxDomainMinutes = topDomains[0]?.[1] ?? 0

  const topDistraction = topDomains[0]?.[0] ?? 'None'

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
            {dateStr}
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {getGreeting()}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Here&apos;s how your focus is looking today.
          </p>
        </div>
        <RiskBadge level={riskLabel} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Time online"
          value={totalMinutes > 0 ? `${totalMinutes}m` : '0m'}
          sub={totalMinutes > 0 ? 'tracked today' : 'no activity yet'}
          icon={Clock}
          accent
        />
        <StatCard
          label="Focus score"
          value={`${focusScore}%`}
          sub={focusScore >= 70 ? 'on track' : 'needs attention'}
          icon={Zap}
          valueColor={riskColor}
        />
        <StatCard
          label="Nudges today"
          value={nudges?.length ?? 0}
          sub={nudges?.length ? 'sent by LifeLens' : 'none yet'}
          icon={Bell}
        />
        <StatCard
          label="Top site"
          value={topDistraction === 'None' ? '—' : topDistraction.replace('www.', '').split('.')[0]}
          sub={topDistraction !== 'None' ? topDistraction : 'no data yet'}
          icon={TrendingUp}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: domains + nudges */}
        <div className="lg:col-span-2 space-y-6">

          {/* Domain breakdown */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Activity breakdown
              </h2>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>By domain today</span>
            </div>
            {topDomains.length > 0 ? (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {topDomains.map(([domain, mins]) => (
                  <DomainBar key={domain} domain={domain} minutes={mins} max={maxDomainMinutes} />
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl border border-dashed p-8 text-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No activity recorded yet today.
                  <br />Install the extension and start browsing.
                </p>
              </div>
            )}
          </div>

          {/* Recent nudges */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recent nudges
              </h2>
              {nudges && nudges.length > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                >
                  {nudges.length} today
                </span>
              )}
            </div>
            {nudges && nudges.length > 0 ? (
              <div className="space-y-3">
                {nudges.map((n) => {
                  const rc =
                    n.risk_score > 0.65 ? 'var(--risk-high)' :
                    n.risk_score > 0.4  ? 'var(--risk-medium)' :
                                          'var(--risk-low)'
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 p-4 rounded-xl border"
                      style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: rc }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full capitalize"
                            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                          >
                            {n.category}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(n.delivered_at).toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                          <span className="text-xs" style={{ color: rc }}>
                            {Math.round(n.risk_score * 100)}% risk
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                className="rounded-xl border border-dashed p-8 text-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No nudges yet today.
                  <br />They&apos;ll appear here as LifeLens detects patterns.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: insight + risk */}
        <div className="space-y-6">

          {/* Today's insight */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                Today&apos;s insight
              </p>
            </div>
            {insight ? (
              <>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {insight.summary}
                </p>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <RiskBadge level={insight.risk_level ? insight.risk_level.charAt(0).toUpperCase() + insight.risk_level.slice(1) : 'Low'} />
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Your daily insight will appear here once enough activity has been recorded.
              </p>
            )}
          </div>

          {/* Focus ring */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
              Focus score
            </p>
            <div className="flex flex-col items-center py-2">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="44" fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle
                    cx="56" cy="56" r="44" fill="none"
                    stroke={riskColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - focusScore / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: riskColor }}>
                    {focusScore}%
                  </span>
                </div>
              </div>
              <p className="text-xs mt-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                {focusScore >= 80
                  ? 'Excellent focus today'
                  : focusScore >= 60
                  ? 'Good — stay on track'
                  : 'High distraction detected'}
              </p>
            </div>
          </div>

          {/* Risk breakdown */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
              Risk breakdown
            </p>
            {['distraction', 'procrastination', 'burnout'].map((cat) => {
              const count = nudges?.filter((n) => n.category === cat).length ?? 0
              const total = nudges?.length ?? 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={cat} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background:
                          cat === 'distraction' ? 'var(--risk-high)' :
                          cat === 'procrastination' ? 'var(--risk-medium)' :
                          'var(--accent)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
