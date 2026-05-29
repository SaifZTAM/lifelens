'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  work_start: string
  work_end: string
  tracking_on: boolean
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({ work_start: '09:00', work_end: '18:00', tracking_on: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('profiles').select('work_start, work_end, tracking_on').eq('id', user!.id).single()
      if (data) setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update(profile).eq('id', user!.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function deleteAllData() {
    if (!confirm('This will permanently delete all your events, nudges, and insights. This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch('/api/user/data', { method: 'DELETE' })
    if (res.ok) alert('All your data has been deleted.')
    else alert('Something went wrong. Try again.')
    setDeleting(false)
  }

  if (loading) return <div className="p-8"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p></div>

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Settings</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Manage your tracking preferences</p>

      <form onSubmit={saveSettings} className="space-y-6">
        {/* Tracking toggle */}
        <div
          className="p-5 rounded-xl border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Enable tracking</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Pause this to stop the extension from sending data</p>
            </div>
            <button
              type="button"
              onClick={() => setProfile((p) => ({ ...p, tracking_on: !p.tracking_on }))}
              className="w-10 h-5 rounded-full transition-colors relative"
              style={{ background: profile.tracking_on ? 'var(--accent)' : 'var(--border)' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                style={{
                  background: '#fff',
                  left: profile.tracking_on ? '22px' : '2px',
                }}
              />
            </button>
          </div>
        </div>

        {/* Work hours */}
        <div
          className="p-5 rounded-xl border space-y-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Work hours</p>
          <p className="text-xs -mt-2" style={{ color: 'var(--text-secondary)' }}>Nudges are weighted differently during these hours</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Start</label>
              <input
                type="time"
                value={profile.work_start}
                onChange={(e) => setProfile((p) => ({ ...p, work_start: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>End</label>
              <input
                type="time"
                value={profile.work_end}
                onChange={(e) => setProfile((p) => ({ ...p, work_end: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ background: saved ? 'var(--risk-low)' : 'var(--accent)', color: '#fff' }}
        >
          {saved ? 'Saved' : saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>

      {/* Danger zone */}
      <div
        className="mt-10 p-5 rounded-xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--risk-high)33' }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--risk-high)' }}>Delete all data</p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          Permanently removes all your events, nudges, and insights. This cannot be undone.
        </p>
        <button
          onClick={deleteAllData}
          disabled={deleting}
          className="text-xs px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
          style={{ borderColor: 'var(--risk-high)', color: 'var(--risk-high)' }}
        >
          {deleting ? 'Deleting…' : 'Delete all my data'}
        </button>
      </div>
    </div>
  )
}
