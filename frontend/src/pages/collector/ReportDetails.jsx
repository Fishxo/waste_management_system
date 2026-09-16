import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
}

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

export default function ReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/reports/${id}`),
      api.get(`/reports/${id}/history`).catch(() => ({ data: { data: [] } })),
    ])
      .then(([reportRes, historyRes]) => {
        setReport(reportRes.data.data || reportRes.data.report || reportRes.data)
        setHistory(historyRes.data.data || [])
      })
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading />
  if (!report) return <p className="text-gray-500">Report not found.</p>

  return (
    <div>
      <Link
        to="/collector/reports"
        className="text-sky-600 hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to My Reports
      </Link>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{report.title}</h2>
        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded text-xs font-medium ${
              statusColors[report.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusLabels[report.status] || report.status || 'N/A'}
          </span>
        </div>
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{report.description}</p>
        <div className="text-sm text-gray-500">
          <p>
            Created:{' '}
            {report.created_at
              ? new Date(report.created_at).toLocaleString()
              : '—'}
          </p>
        </div>
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Status History
            </h3>
            <ul className="space-y-2">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                >
                  <span className="font-medium">{statusLabels[h.new_status] || h.new_status}</span>
                  <span className="text-gray-400">&nbsp;•&nbsp;</span>
                  {new Date(h.changed_at).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}
        {report.status === 'pending' && (
          <Link
            to={`/collector/reports/${report.id}/edit`}
            className="mt-6 inline-block bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Edit Report
          </Link>
        )}
      </div>
    </div>
  )
}