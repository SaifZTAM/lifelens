import { createClient } from '@/lib/supabase/server'

const riskColors: Record<string, string> = {
  low: 'var(--risk-low)',
  medium: 'var(--risk-medium)',
  high: 'var(--risk-high)',
}

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: insights } = await supabase
    .from('daily_insights')
    .select('id, date, summary, top_domains, risk_level')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })
    .limit(14)

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Insights</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>AI-generated daily summaries of your browsing patterns</p>

      {(!insights || insights.length === 0) && (
        <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Daily insights appear here after your first full day of tracking. Check back tomorrow.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {(insights ?? []).map((ins) => {
          const topDomains = (ins.top_domains as { domain: string; minutes: number }[]) ?? []
          return (
            <div
              key={ins.id}
              className="p-5 rounded-xl border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(ins.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                  style={{
                    background: `${riskColors[ins.risk_level]}22`,
                    color: riskColors[ins.risk_level],
                  }}
                >
                  {ins.risk_level} risk
                </span>
              </div>

              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>{ins.summary}</p>

              {topDomains.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topDomains.slice(0, 5).map((d) => (
                    <span
                      key={d.domain}
                      className="text-xs px-2 py-0.5 rounded-md"
                      style={{ background: 'var(--surface-raised)', color: 'var(--text-secondary)' }}
                    >
                      {d.domain} · {d.minutes}m
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
