import { useState, useEffect } from 'react'
import api from '../../api/axios'

const TYPE_LABELS = {
  notifications: 'Notifications',
  reports: 'Reports',
  all: 'Notifications + Reports',
}

const NOTIFICATION_TYPE_LABELS = {
  schedule_update: 'Schedule Update',
  request_approved: 'Request Approved',
  collector_assigned: 'Collector Assigned',
  collection_completed: 'Collection Completed',
}

const STATUS_BADGES = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  denied: 'bg-red-100 text-red-800 border-red-300',
}

export default function DeleteRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionQueue, setActionQueue] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/systemAdmin/delete-requests')
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

  const decide = async (id, status) => {
    setProcessing(true)
    setError('')
    try {
      await api.patch(`/systemAdmin/delete-requests/${id}/decision`, { status })
      setActionQueue(null)
      fetchRequests()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request')
      setActionQueue(null)
    } finally {
      setProcessing(false)
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

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Delete Requests</h1>
      <p className="text-sm text-gray-600">
        Municipal admins request permission to delete all notification history and
        reports from their kifle ketema. Approving permanently deletes the data.
      </p>

      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded p-3 text-sm">
          {pendingCount} pending request{pendingCount > 1 ? 's' : ''} awaiting review.
        </div>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-4 text-gray-500 text-sm">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">No delete requests yet.</p>
        ) : (
          <div className="divide-y">
            {requests.map((req) => (
              <div key={req.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {TYPE_LABELS[req.request_type] || req.request_type}
                    </span>
                    {req.notification_type && (
                      <span className="text-xs text-indigo-700">
                        ({NOTIFICATION_TYPE_LABELS[req.notification_type] || req.notification_type})
                      </span>
                    )}
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
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">{req.municipal_admin_name}</span>
                  <span className="text-gray-400 mx-1">·</span>
                  {req.municipal_admin_email}
                  <span className="text-gray-400 mx-1">·</span>
                  {req.kifle_ketema}
                </p>
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
                {req.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setActionQueue({ id: req.id, status: 'approved' })}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setActionQueue({ id: req.id, status: 'denied' })}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium cursor-pointer"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {actionQueue && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {actionQueue.status === 'approved'
                ? 'Approve deletion request?'
                : 'Deny deletion request?'}
            </h3>
            <p className="text-sm text-gray-600">
              {actionQueue.status === 'approved'
                ? 'Approving will permanently delete all ' +
                  'notifications and reports in this request from the' +
                  " admin's kifle ketema. This cannot be undone."
                : 'Denying will keep all data intact and no records will be deleted.'}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => decide(actionQueue.id, actionQueue.status)}
                disabled={processing}
                className={
                  'text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer ' +
                  (actionQueue.status === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700')
                }
              >
                {processing
                  ? 'Processing...'
                  : actionQueue.status === 'approved'
                    ? 'Yes, Approve'
                    : 'Yes, Deny'}
              </button>
              <button
                onClick={() => setActionQueue(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}