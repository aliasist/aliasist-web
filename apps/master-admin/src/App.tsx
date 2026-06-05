import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'

const MASTER_ADMIN_EMAIL = 'aliasist@proton.me'

export default function MasterAdmin() {
  const { user, isLoaded } = useUser()
  const [activeSection, setActiveSection] = useState<'overview' | 'clearasist' | 'users' | 'realtime' | 'deployments' | 'logs'>('overview')

  const isMasterAdmin = user?.primaryEmailAddress?.emailAddress === MASTER_ADMIN_EMAIL

  if (!isLoaded) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>
  }

  if (!isMasterAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground p-8">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">This master admin dashboard is restricted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Master Admin</h1>
          <p className="text-xs text-muted-foreground mt-1">Aliasist Control Center (Launcher)</p>
        </div>

        <div className="text-sm mb-4">Primary tools live in the main site at <a href="/agent" className="text-electric underline">/agent</a> (Agent Dashboard with full features) and the dedicated <code>apps/clearasist-admin</code> for metadata.</div>

        <div className="pt-6 border-t border-border text-xs text-muted-foreground">
          Logged in as {user?.primaryEmailAddress?.emailAddress}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight capitalize">{activeSection}</h1>
            <p className="text-muted-foreground mt-1">Master control for the entire Aliasist ecosystem</p>
          </div>

          {/* Sections - now a clean launcher with feature ideas */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-medium mb-4">Core Live Surfaces</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <a href="/agent" className="block p-4 border border-border rounded-xl hover:border-electric/60 transition-colors">
                  <div className="font-medium">Agent Dashboard (/agent)</div>
                  <div className="text-muted-foreground text-xs mt-1">Live snapshots • Clearasist curation • Maintenance • AI orchestration • Customization</div>
                </a>
                <div className="block p-4 border border-border rounded-xl">
                  <div className="font-medium">Clearasist Admin (apps/clearasist-admin)</div>
                  <div className="text-muted-foreground text-xs mt-1">Dedicated high-fidelity metadata review, tags, notes, partials</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-medium mb-4">Feature Ideas &amp; Roadmap (kept concise)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 border border-border rounded">Realtime Presence (Durable Objects, WebSockets) — live activity across sists and Clearasist.</div>
                <div className="p-3 border border-border rounded">User &amp; Activity Management — cross-app roles, history, tied to Clerk.</div>
                <div className="p-3 border border-border rounded">Deployments — one-click for site/apps/workers, history, via agents/Wrangler.</div>
                <div className="p-3 border border-border rounded">Logs &amp; Observability — aggregated, searchable, correlated with actions.</div>
                <div className="p-3 border border-border rounded">Full Agent Swarm Orchestration — deeper than current AI layer (scheduling, multi-step, audit).</div>
                <div className="p-3 border border-border rounded">Training Data Pipeline — automated export from Clearasist + snapshots for AI agents.</div>
              </div>
              <div className="mt-3 text-[10px] text-muted-foreground">These preserve the ideas from the original vision in a compact list. Most would plug into the existing customization layer and aliasist-agent.</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-medium mb-2">Quick Links</h3>
              <div className="text-sm space-x-4">
                <a href="/agent" className="text-electric hover:underline">Main Agent Dashboard</a>
                <span>•</span>
                <span>Run <code>npm run app:clearasist-admin</code> for dedicated metadata tool</span>
                <span>•</span>
                <span>aliasist-agent CLI for snapshots &amp; orchestration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
