import { useState, useEffect } from 'react'
import api from '../../api/axios'

const TYPE_LABELS = {
  notifications: 'Notifications',
  reports: 'Reports',
  all: 'Notifications + Reports',
}

const NOTIFICATION_TYPE_OPTIONS = [
  { value: '', label: 'All notification types' },
  { value: 'schedule_update', label: 'Schedule Update' },
  { value: 'request_approved', label: 'Request Approved' },
  { value: 'collector_assigned', label: 'Collector Assigned' },
  { value: 'collection_completed', label: 'Collection Completed' },
]

const STATUS_BADGES = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  denied: 'bg-red-100 text-red-800 border-red-300',
}

export default function DeleteRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ requestType: 'notifications', notificationType: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/muAdmin/delete-requests')
      setRequests(data.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)
    try {
      await api.post('/muAdmin/delete-requests', {
        requestType: form.requestType,
        notificationType: form.requestType === 'reports' ? undefined : form.notificationType || undefined,
        reason: form.reason.trim() || undefined,
      })
      setForm({ requestType: 'notifications', notificationType: '', reason: '' })
      setFormSuccess('Deletion request submitted. Waiting for system admin approval.')
      fetchRequests()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Delete Requests</h1>
      <p className="text-sm text-gray-600">
        Request to permanently delete all notification history and reports within
        your kifle ketema. The system admin must approve before anything is deleted.
      </p>

      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <h3 className="font-semibold text-gray-800">New Deletion Request</h3>
        {formSuccess && <p className="text-green-600 text-sm">{formSuccess}</p>}
        {formError && <p className="text-red-600 text-sm">{formError}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What to delete
            </label>
            <select
              name="requestType"
              value={form.requestType}
              onChange={(e) => setForm({ ...form, requestType: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="notifications">Notifications only</option>
              <option value="reports">Reports only</option>
              <option value="all">Notifications and Reports</option>
            </select>
          </div>
          {form.requestType !== 'reports' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification type
              </label>
              <select
                value={form.notificationType}
                onChange={(e) => setForm({ ...form, notificationType: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {NOTIFICATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              name="reason"
              placeholder="Why do you want to delete this data?"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Request Deletion'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="font-semibold text-gray-800 p-4 border-b">
          My Requests
        </h3>
        {loading ? (
          <p className="p-4 text-gray-500 text-sm">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">
            No requests yet. Submit one above.
          </p>
        ) : (
          <div className="divide-y">
            {requests.map((req) => (
              <div key={req.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {TYPE_LABELS[req.request_type] || req.request_type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_BADGES[req.status] || ''}`}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(req.created_at)}
                  </span>
                </div>
                {req.reason && (
                  <p className="text-xs text-gray-600 mt-1">Reason: {req.reason}</p>
                )}
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-4">
                  <span>Notifications found: {req.notifications_count}</span>
                  <span>Reports found: {req.reports_count}</span>
                  {req.deleted_notifications !== null && (
                    <span className="text-green-600">
                      Deleted: {req.deleted_notifications} notifications,{' '}
                      {req.deleted_reports} reports
                    </span>
                  )}
                  {req.reviewed_at && (
                    <span>Reviewed at: {formatDate(req.reviewed_at)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}