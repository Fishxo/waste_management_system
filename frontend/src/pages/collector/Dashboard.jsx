import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'
import { useAuth } from '../../context/AuthContext'

const STATUS_TRANSITIONS = {
  assigned: ['pending', 'in_progress', 'completed', 'failed'],
  pending: ['in_progress', 'completed', 'failed'],
  in_progress: ['pending', 'completed', 'failed'],
  completed: ['pending', 'in_progress', 'failed'],
  failed: ['pending', 'in_progress', 'completed'],
}

const statusBadge = {
  pending: 'bg-gray-100 text-gray-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  scheduled: 'bg-gray-100 text-gray-800',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatStatus(status) {
  if (!status) return '—'
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
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

function TaskCard({ title, subtitle, status, children, onUpdate, updating }) {
  const allowedStatuses = STATUS_TRANSITIONS[status] || []
  const [selectedStatus, setSelectedStatus] = useState(allowedStatuses[0] || '')
  const [reason, setReason] = useState('')

  useEffect(() => {
    setSelectedStatus((STATUS_TRANSITIONS[status] || [])[0] || '')
    setReason('')
  }, [status])

  const canUpdate =
    allowedStatuses.length > 0 &&
    selectedStatus &&
    (selectedStatus !== 'failed' || reason.trim())

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
            statusBadge[status] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {formatStatus(status)}
        </span>
      </div>
      {children}
      {allowedStatuses.length > 0 && (
        <div className="mt-4 space-y-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={updating}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50"
          >
            {allowedStatuses.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </select>
          {selectedStatus === 'failed' && (
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What happened? (required)"
              disabled={updating}
              rows={2}
              className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 resize-none"
            />
          )}
          <button
            type="button"
            onClick={() => onUpdate(selectedStatus, selectedStatus === 'failed' ? reason.trim() : undefined)}
            disabled={!canUpdate || updating}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function CollectorDashboard() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)

  const loadDashboard = () => {
    setLoading(true)
    api
      .get('/collectors/dashboard')
      .then(({ data }) => {
        const payload = data.data || {}
        setSchedules(payload.schedules || [])
        setRequests(payload.onDemandRequests || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load dashboard')
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleScheduleUpdate = async (scheduleId, status, notes) => {
    setUpdating(`schedule-${scheduleId}`)
    try {
      await api.patch(`/collectors/schedules/${scheduleId}/status`, {
        status,
        notes,
      })
      loadDashboard()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update schedule')
    } finally {
      setUpdating(null)
    }
  }

  const handleRequestUpdate = async (requestId, status, notes) => {
    setUpdating(`request-${requestId}`)
    try {
      await api.patch(`/collectors/on-demand-requests/${requestId}/status`, {
        status,
        notes,
      })
      loadDashboard()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Collector Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, {user?.fullName}. Manage your assigned collection tasks below.
      </p>

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Assigned Schedules</h2>
        {schedules.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No schedules assigned to you yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((schedule) => (
              <TaskCard
                key={schedule.id}
                title={`${formatDate(schedule.collection_date)} — ${formatTimeRange(
                  schedule.collection_time,
                  schedule.end_time
                )}`}
                subtitle={`${schedule.kifle_ketema}, Kebele ${schedule.kebele}, ${schedule.sefer}`}
                status={schedule.status}
                onUpdate={(status, notes) =>
                  handleScheduleUpdate(schedule.id, status, notes)
                }
                updating={updating === `schedule-${schedule.id}`}
              >
                {schedule.notes && (
                  <p className="text-sm text-gray-600">{schedule.notes}</p>
                )}
              </TaskCard>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Approved On-Demand Requests
        </h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No approved on-demand requests assigned to you yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((request) => (
              <TaskCard
                key={request.id}
                title={request.business_name}
                subtitle={`${request.owner_name} — ${request.address || 'No address'}`}
                status={request.collection_status}
                onUpdate={(status, notes) =>
                  handleRequestUpdate(request.id, status, notes)
                }
                updating={updating === `request-${request.id}`}
              >
                <div className="text-sm text-gray-600 space-y-1">
                  {request.business_code && (
                    <p className="text-xs text-gray-400">
                      {request.business_code}
                    </p>
                  )}
                  <p>
                    Location: {Number(request.latitude).toFixed(5)},{' '}
                    {Number(request.longitude).toFixed(5)}
                  </p>
                  {request.description && <p>{request.description}</p>}
                  {request.phone_number && (
                    <p>Phone: {request.phone_number}</p>
                  )}
                  {request.collector_notes && (
                    <p>
                      <span className="font-medium">Reason:</span>{' '}
                      {request.collector_notes}
                    </p>
                  )}
                </div>
              </TaskCard>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
