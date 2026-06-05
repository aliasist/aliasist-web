import { useState, useEffect } from 'react'

const CURATION_TAGS = ['Good for training', 'Bad data', 'Review later', 'High quality']

interface Report {
  id: number
  timestamp: string
  filename: string | null
  file_type: string | null
  removed_count: number | null
  partials?: string | null   // JSON string containing thumbnail or text excerpt
}

interface FullReport extends Report {
  removed_items: string | null
  raw_metadata: string | null
  cleaned_metadata: string | null
  tags: string | null
  notes: string | null
  partials?: string | null
}

const WORKER_URL = import.meta.env.VITE_METADATA_WORKER_URL || ''
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || ''

function parseTags(value: string | null): string[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === 'string') : []
  } catch {
    return []
  }
}

export default function Admin() {
  const [reports, setReports] = useState<Report[]>([])
  const [selected, setSelected] = useState<FullReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [fetchError, setFetchError] = useState<string | null>(null)

  const envMissing = !WORKER_URL || !ADMIN_SECRET

  const fetchReports = async () => {
    if (envMissing) return
    setLoading(true)
    setFetchError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`${WORKER_URL}/admin/reports?${params}`, {
        headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ''}`)
      }
      const data = await res.json()
      setReports(data.reports || [])
    } catch (e: any) {
      console.error(e)
      setFetchError(e?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const loadReport = async (id: number) => {
    try {
      const res = await fetch(`${WORKER_URL}/admin/reports/${id}`, {
        headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
      })
      if (!res.ok) throw new Error(`Failed to fetch report: ${res.status}`)
      const data = await res.json()
      setSelected(data)
    } catch (e) {
      console.error(e)
    }
  }

  const updateReport = async (id: number, patch: { tags?: string[]; notes?: string }) => {
    const res = await fetch(`${WORKER_URL}/admin/reports/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${ADMIN_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patch)
    })

    if (!res.ok) throw new Error(`Failed to update report: ${res.status}`)

    const updated = await res.json()
    setSelected(updated)
    setReports((current) =>
      current.map((report) =>
        report.id === id
          ? {
              ...report,
              timestamp: updated.timestamp,
              filename: updated.filename,
              file_type: updated.file_type,
              removed_count: updated.removed_count
            }
          : report
      )
    )
  }

  const toggleTag = async (id: number, tag: string) => {
    if (!selected) return

    const currentTags = parseTags(selected.tags)
    const nextTags = currentTags.includes(tag)
      ? currentTags.filter((current) => current !== tag)
      : [...currentTags, tag]

    try {
      await updateReport(id, { tags: nextTags })
    } catch (e) {
      console.error(e)
    }
  }

  const updateNotes = async (id: number, notes: string) => {
    try {
      await updateReport(id, { notes })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchReports, 300)
    return () => clearTimeout(t)
  }, [search])

  // Prominent missing-config banner (prevents the "completely empty screen" problem)
  if (envMissing) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-[620px] w-full border border-border rounded-2xl bg-card p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Clearasist Admin</h1>
            <p className="text-muted-foreground">Configuration required to connect to the metadata worker.</p>
          </div>

          <div className="bg-[#0F1117] border border-border rounded-xl p-5 mb-6 font-mono text-sm">
            <div className="text-electric mb-2 text-xs tracking-[0.16em] uppercase">Create apps/clearasist-admin/.env.local</div>
            <pre className="text-xs text-muted-foreground leading-relaxed">VITE_METADATA_WORKER_URL=https://clearasist-metadata.your-domain.workers.dev
VITE_ADMIN_SECRET=your-secret-here</pre>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <div>1. Add the .env.local file with the Worker URL and admin secret.</div>
            <div>2. Restart the dev server after saving.</div>
          </div>

          <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground">
            This is an internal tool. The UI requires valid credentials to fetch reports.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1100px] mx-auto p-6">
        {/* Header - Exact Clearasist style */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Clearasist Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">Review stripped metadata</p>
        </div>

        {/* Search - Clean like Clearasist */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-card border border-border rounded-lg px-4 py-2 text-sm focus:border-electric"
          />
        </div>

        {/* Error banner */}
        {fetchError && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-400 font-mono">
            {fetchError}
          </div>
        )}

        {/* Lazygit-style vertical list + detail */}
        <div className="flex gap-4 h-[calc(100vh-260px)]">
          {/* Left: Lazygit-style file list */}
          <div className="w-2/5 border border-border rounded-2xl bg-card overflow-hidden flex flex-col">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground border-b border-border flex items-center justify-between shrink-0">
              <span>REPORTS // newest first</span>
              {loading && <span className="text-electric">loading...</span>}
            </div>

            <div
              className="flex-1 overflow-auto font-mono text-xs focus:outline-none"
              tabIndex={0}
              onKeyDown={(e) => {
                if (!reports.length) return;
                const currentIndex = selected ? reports.findIndex(r => r.id === selected.id) : 0;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const next = Math.min(currentIndex + 1, reports.length - 1);
                  loadReport(reports[next].id);
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prev = Math.max(currentIndex - 1, 0);
                  loadReport(reports[prev].id);
                }
              }}
            >
              {reports.length === 0 && !loading && (
                <div className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No reports yet.<br />
                  Process files on the public Clearasist site first.
                </div>
              )}

              {reports.map((report, index) => {
                const isSelected = selected?.id === report.id;
                return (
                  <button
                    key={report.id}
                    onClick={() => loadReport(report.id)}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 text-left border-l-2 transition-all ${
                      isSelected
                        ? "bg-electric/10 border-electric text-foreground"
                        : "border-transparent hover:bg-background/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="w-6 shrink-0 text-[10px] text-electric/60 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{report.filename || 'Unknown file'}</span>
                      <span className="shrink-0 text-electric tabular-nums text-[10px]">
                        -{report.removed_count || 0}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail - clean, high signal, like Clearasist cards */}
          <div className="flex-1 border border-border rounded-2xl bg-card overflow-hidden flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Select a report from the list
              </div>
            ) : (
              <div className="p-5 overflow-auto">
                <div className="mb-4">
                  <div className="font-medium text-lg">{selected.filename}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {new Date(selected.timestamp).toLocaleString()} • {selected.file_type} • {selected.removed_count} removed
                  </div>
                </div>

                {/* Lightweight partial preview (thumbnail or text excerpt) for training data */}
                {selected.partials && (() => {
                  try {
                    const p = JSON.parse(selected.partials)
                    if (p?.type === 'thumbnail' && p.data) {
                      return (
                        <div className="mb-5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-electric mb-1.5">Thumbnail (partial)</div>
                          <img
                            src={`data:image/jpeg;base64,${p.data}`}
                            alt="Thumbnail"
                            className="max-w-[180px] rounded border border-border"
                          />
                          <div className="text-[10px] text-muted-foreground mt-1 font-mono">{p.width}×{p.height}</div>
                        </div>
                      )
                    }
                    if (p?.type === 'text' && p.data) {
                      return (
                        <div className="mb-5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-electric mb-1.5">Text excerpt (partial)</div>
                          <pre className="bg-[#0F1117] p-3 rounded text-xs border border-border overflow-auto max-h-32">{p.data}</pre>
                        </div>
                      )
                    }
                  } catch {}
                  return null
                })()}

                {/* Tags & Notes */}
                <div className="mb-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-electric mb-1.5">Tags</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {CURATION_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(selected.id, tag)}
                        className={`px-2.5 py-0.5 text-xs rounded border transition-colors ${
                          parseTags(selected.tags).includes(tag)
                            ? 'bg-electric text-[#0F1117] border-electric'
                            : 'border-border hover:border-electric/50'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <textarea
                    placeholder="Notes..."
                    defaultValue={selected.notes || ''}
                    onBlur={(e) => updateNotes(selected.id, e.target.value)}
                    className="w-full bg-[#0F1117] border border-border rounded p-3 text-sm h-20 font-mono resize-y"
                  />
                </div>

                <details open>
                  <summary className="text-sm text-electric cursor-pointer mb-1">Removed Items</summary>
                  <pre className="bg-[#0F1117] p-3 rounded text-xs border border-border overflow-auto max-h-40">
                    {selected.removed_items ? JSON.stringify(JSON.parse(selected.removed_items), null, 2) : '[]'}
                  </pre>
                </details>

                <details>
                  <summary className="text-sm text-electric cursor-pointer mb-1">Raw Metadata (Before)</summary>
                  <pre className="bg-[#0F1117] p-3 rounded text-xs border border-border overflow-auto max-h-48">
                    {selected.raw_metadata ? JSON.stringify(JSON.parse(selected.raw_metadata), null, 2) : '{}'}
                  </pre>
                </details>

                <details>
                  <summary className="text-sm text-electric cursor-pointer mb-1">After Cleaning</summary>
                  <pre className="bg-[#0F1117] p-3 rounded text-xs border border-border overflow-auto max-h-32">
                    {selected.cleaned_metadata ? JSON.stringify(JSON.parse(selected.cleaned_metadata), null, 2) : '{}'}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
