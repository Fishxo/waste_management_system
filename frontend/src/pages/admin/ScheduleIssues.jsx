import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusOptions = ['', 'pending', 'reviewing', 'resolved']
const reporterTypeOptions = [
  { value: '', label: 'All reporters' },
  { value: 'resident', label: 'Residents' },
  { value: 'business', label: 'Business Owners' },
]

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
  if (issue.business_id) {
    return issue.business_owner_name || issue.business_name || 'Business Owner'
  }
  return [issue.first_name, issue.last_name].filter(Boolean).join(' ') || '—'
}

function formatStatus(status) {
  if (!status) return 'All'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function AdminScheduleIssues() {
  const [issues, setIssues] = useState([])
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [delRequests, setDelRequests] = useState([])
  const [delReason, setDelReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [delMessage, setDelMessage] = useState('')
  const [delError, setDelError] = useState('')

  const fetchDelRequests = () => {
    api
      .get('/muAdmin/schedule-issue-delete-requests')
      .then(({ data }) => {
        setDelRequests(Array.isArray(data) ? data : data.data || [])
      })
      .catch(() => {
        setDelRequests([])
      })
  }

  const fetchIssues = (status = '', type = '') => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (type) params.set('type', type)
    const qs = params.toString()
    const url = qs ? `/muAdmin/schedule-issues?${qs}` : '/muAdmin/schedule-issues'
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
    fetchIssues(filter, typeFilter)
  }, [filter, typeFilter])

  useEffect(() => {
    fetchDelRequests()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  useEffect(() => {
    if (!delMessage) return
    const timer = setTimeout(() => setDelMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [delMessage])

  const handleStatusChange = async (issueId, newStatus) => {
    if (!newStatus) return
    setUpdating(issueId)
    setError('')
    try {
      await api.patch(`/muAdmin/schedule-issues/${issueId}/status`, {
        status: newStatus,
      })
      setMessage('Issue status updated successfully')
      fetchIssues(filter, typeFilter)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update issue status')
    } finally {
      setUpdating(null)
    }
  }

  const handleDeletionRequest = async (e) => {
    e.preventDefault()
    setDelError('')
    setDelMessage('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/muAdmin/delete-requests', {
        requestType: 'schedule_issues',
        reason: delReason.trim() || undefined,
      })
      setDelReason('')
      setDelMessage(
        data.message ||
          `Deletion request submitted. ${data.data?.schedule_issues_count ?? 0} schedule issue(s) will be deleted after system admin approval.`
      )
      fetchDelRequests()
    } catch (err) {
      setDelError(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteReqBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800 border-amber-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      denied: 'bg-red-100 text-red-800 border-red-300',
    }
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Schedule Issues</h2>
      <p className="text-gray-500 mb-6">
        Issues raised by residents when a collection schedule was not followed.
      </p>

      <div className="mb-6 bg-white rounded-lg shadow p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-800">Request Deletion of Schedule Issues</h3>
          <p className="text-sm text-gray-500 mt-1">
            Request to permanently delete all schedule issues within your kifle
            ketema. The system admin must approve before anything is deleted.
          </p>
        </div>

        {delMessage && (
          <p className="px-4 py-2.5 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
            {delMessage}
          </p>
        )}
        {delError && (
          <p className="px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
            {delError}
          </p>
        )}

        <form onSubmit={handleDeletionRequest} className="space-y-3">
          <textarea
            placeholder="Reason (optional)"
            value={delReason}
            onChange={(e) => setDelReason(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Request Deletion'}
          </button>
        </form>

        {delRequests.length > 0 && (
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              My Deletion Requests
            </h4>
            <div className="divide-y bg-gray-50 rounded border border-gray-200">
              {delRequests.map((req) => (
                <div key={req.id} className="p-3 text-sm flex flex-wrap items-center gap-3">
                  <span className="font-medium text-gray-800">
                    {req.schedule_issues_count} schedule issue(s)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${deleteReqBadge(req.status)}`}
                  >
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                  {req.deleted_schedule_issues !== null && (
                    <span className="text-xs text-green-600">
                      Deleted: {req.deleted_schedule_issues}
                    </span>
                  )}
                  {req.reason && (
                    <span className="text-xs text-gray-500">Reason: {req.reason}</span>
                  )}
                  {req.reviewed_at && (
                    <span className="text-xs text-gray-500">
                      Reviewed: {new Date(req.reviewed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
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
        <select
          value={typeFilter}
          onChange={(e) => {
            setError('')
            setTypeFilter(e.target.value)
          }}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {reporterTypeOptions.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
                <th className="px-4 py-3 font-medium">Reporter</th>
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
                    {issue.business_id && issue.business_code ? (
                      <p className="text-xs text-amber-600 font-medium">
                        {issue.business_code}
                      </p>
                    ) : issue.resident_code && (
                      <p className="text-xs text-indigo-600 font-medium">
                        {issue.resident_code}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {issue.business_email || issue.phone_number || 'No phone'}
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
