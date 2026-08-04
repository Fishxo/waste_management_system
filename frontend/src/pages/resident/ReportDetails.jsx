import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
}

export default function ReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/reports/${id}`)
      .then(({ data }) => setReport(data.data || data.report || data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading />
  if (!report) return <p className="text-gray-500">Report not found.</p>

  return (
    <div>
      <Link
        to="/resident/my-reports"
        className="text-indigo-600 hover:underline text-sm mb-4 inline-block"
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
            {report.status?.replace('_', ' ') || 'N/A'}
          </span>
        </div>
        <p className="text-gray-700 mb-4">{report.description}</p>
        <div className="text-sm text-gray-500">
          <p>
            Created:{' '}
            {report.created_at
              ? new Date(report.created_at).toLocaleString()
              : '—'}
          </p>
          {report.updatedAt && (
            <p>
              Updated:{' '}
              {new Date(report.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
