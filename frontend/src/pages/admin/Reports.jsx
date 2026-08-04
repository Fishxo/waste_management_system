import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusOptions = ['', 'pending', 'in_progress', 'resolved']

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchReports = (status = '') => {
    setLoading(true)
    const url = status
      ? `/muAdmin/reports?status=${status}`
      : '/muAdmin/reports'
    api
      .get(url)
      .then(({ data }) => {
        setReports(Array.isArray(data) ? data : data.data || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReports(filter)
  }, [filter])

  const handleStatusChange = async (reportId, newStatus) => {
    setUpdating(reportId)
    try {
      await api.patch(`/muAdmin/report/${reportId}/status`, {
        status: newStatus,
      })
      fetchReports(filter)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reports Management</h2>

      <div className="mb-4 flex gap-2">
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded text-sm cursor-pointer ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : reports.length === 0 ? (
        <p className="text-gray-500">No reports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-sm">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id || report._id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">{report.title}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{report.description}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        statusBadge[report.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {report.status?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {report.created_at
                      ? new Date(report.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value=""
                      onChange={(e) =>
                        e.target.value &&
                        handleStatusChange(
                          report.id || report._id,
                          e.target.value
                        )
                      }
                      disabled={updating === (report.id || report._id)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="">Change to...</option>
                      {statusOptions
                        .filter((s) => s && s !== report.status)
                        .map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
