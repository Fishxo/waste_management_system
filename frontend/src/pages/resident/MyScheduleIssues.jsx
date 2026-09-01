import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
}

const statusHelp = {
  pending: 'Your issue has been submitted and is waiting for the municipal admin.',
  reviewing: 'The municipal admin is reviewing or handling your issue.',
  resolved: 'Your issue has been resolved by the municipal admin.',
}

function formatTime(value) {
  if (!value) return '—'
  const [hours, minutes] = String(value).split(':')
  if (!hours) return value
  let h = Number(hours)
  const suffix = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${minutes || '00'} ${suffix}`
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatStatus(status) {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function MyScheduleIssues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/residents/schedule-issues')
      .then(({ data }) => {
        setIssues(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load schedule issues')
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Schedule Issues</h2>
      <p className="text-gray-500 mb-6">
        Issues you raised when a collection schedule was missed or incorrect.
        General waste reports are listed separately on{' '}
        <Link to="/resident/my-reports" className="text-indigo-600 hover:underline">
          My Reports
        </Link>
        .
      </p>

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      {issues.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-gray-600">You have not raised any schedule issues yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Go to{' '}
            <Link to="/resident/schedules" className="text-indigo-600 hover:underline">
              Schedules
            </Link>{' '}
            to raise an issue if collection did not happen as planned.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Issue #{issue.id}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {issue.collection_date
                      ? new Date(issue.collection_date).toLocaleDateString()
                      : '—'}{' '}
                    at {formatTime(issue.collection_time)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {issue.kifle_ketema}, Kebele {issue.kebele || '—'},{' '}
                    Sefer {issue.sefer || '—'}
                  </p>
                </div>
                <span
                  className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-semibold ${
                    statusBadge[issue.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {formatStatus(issue.status)}
                </span>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Your issue
                </p>
                <p className="whitespace-pre-wrap">{issue.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                <p className="text-gray-500">
                  Submitted on {formatDate(issue.created_at)}
                </p>
                <p className="text-gray-600">
                  {statusHelp[issue.status] || 'Status updated by the municipal admin.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
