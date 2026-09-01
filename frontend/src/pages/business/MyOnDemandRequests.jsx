import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const approvalBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const collectionBadge = {
  unassigned: 'bg-gray-100 text-gray-600',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
}

function formatStatus(status) {
  if (!status) return '—'
  return status.replace('_', ' ')
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

export default function MyOnDemandRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [confirming, setConfirming] = useState(null)

  const loadRequests = () => {
    setLoading(true)
    api
      .get('/onDemandRequests')
      .then(({ data }) => {
        setRequests(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load requests')
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const handleConfirm = async (requestId) => {
    setConfirming(requestId)
    setError('')
    try {
      await api.patch(`/onDemandRequests/${requestId}/confirm`)
      setMessage('Collection confirmed. Thank you!')
      loadRequests()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm collection')
    } finally {
      setConfirming(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Collection Requests</h2>
          <p className="text-gray-500 text-sm mt-1">
            Track requests from submission through collector completion and your
            confirmation.
          </p>
        </div>
        <Link
          to="/business/create-request"
          className="inline-flex justify-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          New Request
        </Link>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">🚛</div>
          <p className="text-gray-600">No collection requests yet.</p>
          <Link
            to="/business/create-request"
            className="inline-block mt-4 text-amber-700 font-medium hover:underline"
          >
            Submit your first request
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    Request #{request.id}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(request.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      approvalBadge[request.status] ||
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {formatStatus(request.status)}
                  </span>
                  {request.status === 'approved' && request.collection_status && (
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        collectionBadge[request.collection_status] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {formatStatus(request.collection_status)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="text-gray-400">Location:</span>{' '}
                  {Number(request.latitude).toFixed(5)},{' '}
                  {Number(request.longitude).toFixed(5)}
                </p>
                {request.collector_name && (
                  <p>
                    <span className="text-gray-400">Collector:</span>{' '}
                    {request.collector_name}
                  </p>
                )}
                {request.description && (
                  <p className="pt-2 border-t border-gray-100 mt-2 whitespace-pre-wrap">
                    {request.description}
                  </p>
                )}
                {request.admin_notes && (
                  <p className="pt-2 text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mt-2">
                    <span className="font-medium">Admin note:</span>{' '}
                    {request.admin_notes}
                  </p>
                )}
                {request.collector_notes && (
                  <p className="pt-2 text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mt-2">
                    <span className="font-medium">Collector note:</span>{' '}
                    {request.collector_notes}
                  </p>
                )}
                {request.completed_at && (
                  <p className="text-xs text-gray-400 pt-1">
                    Completed {formatDate(request.completed_at)}
                  </p>
                )}
                {request.confirmed_at && (
                  <p className="text-xs text-emerald-600 pt-1 font-medium">
                    Confirmed {formatDate(request.confirmed_at)}
                  </p>
                )}
              </div>

              {request.status === 'approved' &&
                request.collection_status === 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(request.id)}
                    disabled={confirming === request.id}
                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                  >
                    {confirming === request.id
                      ? 'Confirming...'
                      : 'Confirm Collection Completed'}
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
