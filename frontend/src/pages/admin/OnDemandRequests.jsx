import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusOptions = ['', 'pending', 'approved', 'rejected']

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const collectionBadge = {
  assigned: 'bg-blue-100 text-blue-800',
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
}

function formatStatus(status) {
  if (!status) return 'All'
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminOnDemandRequests() {
  const [requests, setRequests] = useState([])
  const [collectors, setCollectors] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [notesById, setNotesById] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchRequests = (status = '') => {
    setLoading(true)
    const url = status
      ? `/muAdmin/on-demand-requests?status=${status}`
      : '/muAdmin/on-demand-requests'
    api
      .get(url)
      .then(({ data }) => {
        setRequests(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) => {
        setRequests([])
        setError(
          err.response?.data?.message || 'Failed to load on-demand requests'
        )
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRequests(filter)
    api
      .get('/muAdmin/collectors')
      .then(({ data }) => {
        setCollectors(Array.isArray(data) ? data : data.data || [])
      })
      .catch(() => setCollectors([]))
  }, [filter])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const handleReview = async (requestId, status) => {
    setUpdating(requestId)
    setError('')
    try {
      await api.patch(`/muAdmin/on-demand-requests/${requestId}/status`, {
        status,
        adminNotes: notesById[requestId] || undefined,
      })
      setMessage(`Request ${status} successfully`)
      fetchRequests(filter)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status} request`)
    } finally {
      setUpdating(null)
    }
  }

  const handleAssignCollector = async (requestId, collectorId) => {
    if (!collectorId) return
    setUpdating(requestId)
    setError('')
    try {
      await api.patch(
        `/muAdmin/on-demand-requests/${requestId}/assign-collector`,
        { collectorId: Number(collectorId) }
      )
      setMessage('Collector assigned successfully')
      fetchRequests(filter)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign collector')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/muAdmin/on-demand-requests/${deleteTarget.id}`)
      setDeleteTarget(null)
      setMessage('On-demand request deleted successfully')
      fetchRequests(filter)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete request')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">On-Demand Collection Requests</h2>
      <p className="text-gray-500 mb-6">
        Review and approve or reject collection requests from business owners.
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
      ) : requests.length === 0 ? (
        <p className="text-gray-500">No on-demand requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-sm">
                <th className="px-4 py-3 font-medium">Request</th>
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Coordinates</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Collection</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b hover:bg-gray-50 text-sm align-top"
                >
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    #{request.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{request.business_name}</p>
                    <p className="text-xs text-gray-500">{request.business_code || ''}</p>
                    <p className="text-xs text-gray-500">{request.owner_name}</p>
                    <p className="text-xs text-gray-500">
                      {request.phone_number || 'No phone'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {request.business_type}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{request.address || '—'}</p>
                    <p className="text-xs text-gray-500">
                      {request.kifle_ketema}
                    </p>
                    <p className="text-xs text-gray-500">
                      Kebele {request.kebele || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    {Number(request.latitude).toFixed(5)},
                    <br />
                    {Number(request.longitude).toFixed(5)}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="whitespace-pre-wrap">
                      {request.description || '—'}
                    </p>
                    {request.admin_notes && request.status !== 'pending' && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Note: {request.admin_notes}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        statusBadge[request.status] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {formatStatus(request.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {request.status === 'approved' ? (
                      <div className="space-y-1 min-w-[150px]">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${collectionBadge[request.collection_status] || 'bg-gray-100 text-gray-800'}`}>
                          {formatStatus(request.collection_status || 'unassigned')}
                        </span>
                        {request.collector_name && (
                          <p className="text-xs text-gray-600">
                            Collector: {request.collector_name}
                          </p>
                        )}
                        {request.collection_status === 'completed' && request.completed_at && (
                          <p className="text-xs text-green-700">
                            Completed: {formatDate(request.completed_at)}
                          </p>
                        )}
                        {request.collector_notes && (
                          <p className="text-xs text-gray-600 whitespace-pre-wrap">
                            Note: {request.collector_notes}
                          </p>
                        )}
                        {request.issue_description && request.collection_status !== 'confirmed' && (
                          <p className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 whitespace-pre-wrap">
                            Issue: {request.issue_description}
                          </p>
                        )}
                        {request.collection_status === 'confirmed' && (
                          <p className="text-xs text-emerald-700 font-medium">
                            Confirmed by business
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(request.created_at)}
                  </td>
                  <td className="px-4 py-3 min-w-[200px]">
                    {request.status === 'pending' ? (
                      <div className="space-y-2">
                        <select
                          value={request.collector_id || ''}
                          onChange={(e) =>
                            handleAssignCollector(request.id, e.target.value)
                          }
                          disabled={updating === request.id}
                          className="border border-gray-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          <option value="">
                            {request.collector_name
                              ? 'Reassign collector...'
                              : 'Assign collector before approval...'}
                          </option>
                          {collectors.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.full_name}
                            </option>
                          ))}
                        </select>
                        <textarea
                          rows={2}
                          placeholder="Optional note to business owner"
                          value={notesById[request.id] || ''}
                          onChange={(e) =>
                            setNotesById((prev) => ({
                              ...prev,
                              [request.id]: e.target.value,
                            }))
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-xs w-full resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReview(request.id, 'approved')}
                            disabled={updating === request.id || !request.collector_id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-xs font-medium cursor-pointer disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReview(request.id, 'rejected')}
                            disabled={updating === request.id}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded text-xs font-medium cursor-pointer disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(request)}
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Delete request
                        </button>
                      </div>
                    ) : request.status === 'approved' ? (
                      <div className="space-y-2">
                        {request.collector_name && (
                          <span className="text-sm text-gray-700 block">
                            Assigned: {request.collector_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Monitor progress in the Collection column.
                        </span>
                        {request.issue_description && request.collection_status !== 'confirmed' && (
                          <select
                            value=""
                            onChange={(e) =>
                              handleAssignCollector(request.id, e.target.value)
                            }
                            disabled={updating === request.id}
                            className="border border-red-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-2 focus:ring-red-400"
                          >
                            <option value="">Reassign collector for issue...</option>
                            {collectors.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.full_name}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(request)}
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Delete request
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-xs text-gray-400 block">
                          Reviewed {formatDate(request.reviewed_at)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(request)}
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Delete request
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900">Delete request?</h3>
            <p className="text-sm text-gray-600 mt-2">
              This request and its collection history will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
