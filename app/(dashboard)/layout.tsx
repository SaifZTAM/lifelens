import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import HeroWave from '@/components/ui/dynamic-wave-canvas-background'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="relative min-h-screen" style={{ background: '#09090b' }}>
      {/* Fixed wave background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HeroWave />
      </div>
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'rgba(9,9,11,0.72)' }} />

      {/* Dashboard layout */}
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
