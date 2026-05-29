'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Nudge = {
  id: string
  message: string
  category: string
  risk_score: number
  triggered_by: string | null
  feedback: string | null
  delivered_at: string
}

const categoryColors: Record<string, string> = {
  distraction: '#f59e0b',
  procrastination: '#ef4444',
  overconsumption: '#f97316',
  sleep: '#3b82f6',
  general: '#14b8a6',
}

export default function NudgesPage() {
  const [nudges, setNudges] = useState<Nudge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('nudges')
        .select('id, message, category, risk_score, triggered_by, feedback, delivered_at')
        .order('delivered_at', { ascending: false })
        .limit(50)
      setNudges(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function submitFeedback(id: string, feedback: 'helpful' | 'not_helpful') {
    const supabase = createClient()
    await supabase.from('nudges').update({ feedback }).eq('id', id)
    setNudges((prev) => prev.map((n) => (n.id === id ? { ...n, feedback } : n)))
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Nudge History</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>All nudges sent to you — rate them to improve future suggestions</p>

      {loading && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      )}

      {!loading && nudges.length === 0 && (
        <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No nudges yet. Install the Chrome extension and start browsing to receive your first nudge.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {nudges.map((n) => (
          <div
            key={n.id}
            className="p-4 rounded-xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
              <span
                className="text-xs px-2 py-0.5 rounded-full shrink-0 capitalize font-medium"
                style={{
                  background: `${categoryColors[n.category] ?? '#14b8a6'}22`,
                  color: categoryColors[n.category] ?? '#14b8a6',
                }}
              >
                {n.category}
              </span>
            </div>

            {n.triggered_by && (
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                Triggered by: {n.triggered_by}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {new Date(n.delivered_at).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>

              {n.feedback ? (
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {n.feedback === 'helpful' ? 'Marked helpful' : 'Marked not helpful'}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs mr-1" style={{ color: 'var(--text-secondary)' }}>Was this helpful?</span>
                  <button
                    onClick={() => submitFeedback(n.id, 'helpful')}
                    className="text-xs px-2 py-1 rounded-md lg-btn lg-btn-primary"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => submitFeedback(n.id, 'not_helpful')}
                    className="text-xs px-2 py-1 rounded-md lg-btn lg-btn-secondary"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
