import { useState, useEffect } from 'react'

interface Report {
  id: number
  timestamp: string
  filename: string | null
  file_type: string | null
  extension: string | null
  original_size: number | null
  cleaned_size: number | null
  removed_count: number | null
}

interface FullReport extends Report {
  removed_items: string | null
  raw_metadata: string | null
  cleaned_metadata: string | null
  user_agent: string | null
}

const WORKER_URL = import.meta.env.VITE_METADATA_WORKER_URL || ''
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || ''

function App() {
  const [reports, setReports] = useState<Report[]>([])
  const [selected, setSelected] = useState<FullReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState('')

  const fetchReports = async () => {
    if (!WORKER_URL || !ADMIN_SECRET) {
      alert('Missing VITE_METADATA_WORKER_URL or VITE_ADMIN_SECRET in .env')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (fileTypeFilter) params.set('file_type', fileTypeFilter)
      if (search) params.set('search', search)

      const res = await fetch(`${WORKER_URL}/admin/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_SECRET}`
        }
      })

      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()
      setReports(data.reports || [])
    } catch (e) {
      alert('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const loadReport = async (id: number) => {
    try {
      const res = await fetch(`${WORKER_URL}/admin/reports/${id}`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_SECRET}`
        }
      })
      const data = await res.json()
      setSelected(data)
    } catch (e) {
      alert('Failed to load report details')
    }
  }

  useEffect(() => {
    fetchReports()
  }, [fileTypeFilter]) // refetch when filter changes

  return (
    <div className="min-h-screen bg-[#0F1117] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Clearasist Admin</h1>
            <p className="text-sm text-gray-400">Metadata Reports Viewer</p>
          </div>
          <button 
            onClick={fetchReports}
            className="px-4 py-2 bg-[#00E5A0] text-black rounded-lg font-medium hover:bg-white transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchReports()}
            className="flex-1 bg-[#1A1D24] border border-gray-700 rounded-lg px-4 py-2 text-sm"
          />
          <select 
            value={fileTypeFilter} 
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="bg-[#1A1D24] border border-gray-700 rounded-lg px-4 py-2 text-sm"
          >
            <option value="">All types</option>
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
            <option value="office">Office</option>
          </select>
          <button 
            onClick={fetchReports}
            className="px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            Search
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#1A1D24] rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#111318] text-gray-400">
              <tr>
                <th className="text-left p-4">Timestamp</th>
                <th className="text-left p-4">Filename</th>
                <th className="text-left p-4">Type</th>
                <th className="text-right p-4">Removed</th>
                <th className="text-right p-4">Size</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              )}
              {reports.map(report => (
                <tr 
                  key={report.id} 
                  onClick={() => loadReport(report.id)}
                  className="border-t border-gray-800 hover:bg-[#252932] cursor-pointer"
                >
                  <td className="p-4 font-mono text-xs text-gray-400">
                    {new Date(report.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium">{report.filename || '—'}</td>
                  <td className="p-4 capitalize text-gray-300">{report.file_type || '—'}</td>
                  <td className="p-4 text-right text-[#00E5A0] font-medium">
                    {report.removed_count || 0}
                  </td>
                  <td className="p-4 text-right text-gray-400 font-mono text-xs">
                    {report.original_size ? Math.round(report.original_size / 1024) : '?'} KB
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-[#00E5A0] hover:underline text-xs">VIEW</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
            <div className="bg-[#1A1D24] rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">{selected.filename}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div><strong>Type:</strong> {selected.file_type}</div>
                <div><strong>Removed:</strong> {selected.removed_count} items</div>
                <div><strong>Original Size:</strong> {selected.original_size ? Math.round(selected.original_size/1024) : '?'} KB</div>
                <div><strong>Cleaned Size:</strong> {selected.cleaned_size ? Math.round(selected.cleaned_size/1024) : '?'} KB</div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 text-[#00E5A0]">Removed Items</h3>
                  <pre className="bg-[#111318] p-4 rounded-xl text-xs overflow-auto max-h-64">
                    {selected.removed_items ? JSON.stringify(JSON.parse(selected.removed_items), null, 2) : 'None'}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Raw Metadata (Before)</h3>
                  <pre className="bg-[#111318] p-4 rounded-xl text-xs overflow-auto max-h-96">
                    {selected.raw_metadata ? JSON.stringify(JSON.parse(selected.raw_metadata), null, 2) : 'None'}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Metadata After Cleaning</h3>
                  <pre className="bg-[#111318] p-4 rounded-xl text-xs overflow-auto max-h-64">
                    {selected.cleaned_metadata ? JSON.stringify(JSON.parse(selected.cleaned_metadata), null, 2) : 'None'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
