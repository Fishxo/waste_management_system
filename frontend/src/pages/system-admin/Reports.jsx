import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusOptions = ['', 'pending', 'in_progress', 'resolved']

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
}

function formatStatus(status) {
  if (!status) return 'All'
  return status.replace('_', ' ')
}

export default function SystemAdminReports() {
  const [stats, setStats] = useState(null)
  const [reports, setReports] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 })
  const [status, setStatus] = useState('')
  const [kifle, setKifle] = useState('')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = () => {
    api
      .get('/systemAdmin/reports/stats')
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null))
  }

  const fetchReports = (page = 1) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (kifle) params.set('kifleKetema', kifle)
    if (appliedSearch) params.set('search', appliedSearch)
    params.set('page', page)
    params.set('limit', 20)

    api
      .get(`/systemAdmin/reports?${params.toString()}`)
      .then((res) => {
        setReports(res.data.data.reports || [])
        setPagination({
          total: res.data.data.total,
          page: res.data.data.page,
          limit: res.data.data.limit,
        })
      })
      .catch(() => {
        setReports([])
        setError('Failed to load reports')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStats()
    fetchReports(1)
  }, [])

  useEffect(() => {
    fetchReports(1)
  }, [status, kifle, appliedSearch])

  const kifleOptions = useMemo(() => stats?.byKifle || [], [stats])

  const reporterName = (r) => {
    if (r.reporter_role === 'collector') return r.collector_name || 'Unknown collector'
    return [r.resident_first_name, r.resident_last_name].filter(Boolean).join(' ') || 'Unknown resident'
  }

  const totalPages = Math.max(Math.ceil(pagination.total / pagination.limit), 1)

  if (loading && !reports.length && stats === null) return <Loading />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Reports Overview</h2>
      <p className="text-gray-500 mb-6">
        All resident and collector reports across every sub-city (kifle ketema).
      </p>

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-3xl font-bold text-violet-600">{stats?.total ?? 0}</p>
          {stats?.byReporter && (
            <p className="text-xs text-gray-400 mt-1">
              {stats.byReporter.resident || 0} resident / {stats.byReporter.collector || 0} collector
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats?.pending ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-3xl font-bold text-orange-600">{stats?.inProgress ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-3xl font-bold text-green-600">{stats?.resolved ?? 0}</p>
        </div>
      </div>

      {kifleOptions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">By Sub-City (Kifle Ketema)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kifleOptions.map((k) => (
              <button
                key={k.kifleKetema}
                onClick={() => setKifle(k.kifle === kifle ? '' : k.kifleKetema)}
                className={`text-left bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow cursor-pointer ${
                  kifle === k.kifleKetema ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200'
                }`}
              >
                <p className="text-sm font-medium text-gray-800">{k.kifleKetema}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-gray-900">{k.total}</p>
                  <p className="text-xs text-gray-400">
                    {k.pending} pending · {k.inProgress} in progress · {k.resolved} resolved
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={kifle}
          onChange={(e) => {
            setKifle(e.target.value)
            setAppliedSearch('')
          }}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
        >
          <option value="">All Sub-Cities</option>
          {kifleOptions.map((k) => (
            <option key={k.kifleKetema} value={k.kifleKetema}>
              {k.kifleKetema} ({k.total})
            </option>
          ))}
        </select>

        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              status === s
                ? 'bg-violet-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {formatStatus(s)}
          </button>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            setAppliedSearch(search.trim())
            setKifle('')
          }}
          className="ml-auto"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, description, reporter..."
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </form>
      </div>

      {appliedSearch && (
        <p className="mb-4 text-sm text-gray-500">
          Showing results for “{appliedSearch}” —{' '}
          <button
            onClick={() => {
              setAppliedSearch('')
              setSearch('')
            }}
            className="text-violet-600 hover:underline cursor-pointer"
          >
            Clear search
          </button>
        </p>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sub-City</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-medium">{reporterName(r)}</span>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded ${
                      r.reporter_role === 'collector'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-violet-100 text-violet-800'
                    }`}
                  >
                    {r.reporter_role === 'collector' ? 'Collector' : 'Resident'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{r.title}</p>
                  <p className="text-gray-500 text-xs line-clamp-1 max-w-xs">{r.description}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      statusBadge[r.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {formatStatus(r.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.kifle_ketema || '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {!loading && reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">
          {pagination.total} report(s) · Page {pagination.page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => fetchReports(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>
          <button
            onClick={() => fetchReports(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}