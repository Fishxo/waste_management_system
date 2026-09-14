import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusOptions = ['', 'pending', 'reviewing', 'resolved']

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
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

function formatTimeRange(start, end) {
  if (!start) return '—'
  return end ? `${formatTime(start)} — ${formatTime(end)}` : formatTime(start)
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

function fullName(issue) {
  return [issue.first_name, issue.last_name].filter(Boolean).join(' ') || '—'
}

function formatStatus(status) {
  if (!status) return 'All'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function AdminScheduleIssues() {
  const [issues, setIssues] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchIssues = (status = '') => {
    setLoading(true)
    const url = status
      ? `/muAdmin/schedule-issues?status=${status}`
      : '/muAdmin/schedule-issues'
    api
      .get(url)
      .then(({ data }) => {
        setIssues(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) => {
        setIssues([])
        setError(err.response?.data?.message || 'Failed to load schedule issues')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchIssues(filter)
  }, [filter])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const handleStatusChange = async (issueId, newStatus) => {
    if (!newStatus) return
    setUpdating(issueId)
    setError('')
    try {
      await api.patch(`/muAdmin/schedule-issues/${issueId}/status`, {
        status: newStatus,
      })
      setMessage('Issue status updated successfully')
      fetchIssues(filter)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update issue status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Schedule Issues</h2>
      <p className="text-gray-500 mb-6">
        Issues raised by residents when a collection schedule was not followed.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {statusOptions.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => {
              setError('')
              setFilter(s)
            }}
            className={`px-4 py-1.5 rounded text-sm cursor-pointer ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {formatStatus(s)}
          </button>
        ))}
      </div>

      {message && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <Loading />
      ) : issues.length === 0 ? (
        <p className="text-gray-500">No schedule issues found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-sm">
                <th className="px-4 py-3 font-medium">Issue</th>
                <th className="px-4 py-3 font-medium">Resident</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Issue description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  className="border-b hover:bg-gray-50 text-sm align-top"
                >
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    #{issue.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{fullName(issue)}</p>
                    <p className="text-xs text-gray-500">
                      {issue.phone_number || 'No phone'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {issue.email || 'No email'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{issue.kifle_ketema}</p>
                    <p className="text-xs text-gray-500">
                      Kebele {issue.kebele || '—'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sefer {issue.sefer || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium">
                      {issue.collection_date
                        ? new Date(issue.collection_date).toLocaleDateString()
                        : '—'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeRange(issue.collection_time, issue.end_time)}
                    </p>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="whitespace-pre-wrap">{issue.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        statusBadge[issue.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {formatStatus(issue.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(issue.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={issue.status}
                      onChange={(e) =>
                        handleStatusChange(issue.id, e.target.value)
                      }
                      disabled={updating === issue.id}
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {statusOptions
                        .filter((s) => s)
                        .map((s) => (
                          <option key={s} value={s}>
                            {formatStatus(s)}
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
