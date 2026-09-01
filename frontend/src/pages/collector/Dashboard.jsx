import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'
import { useAuth } from '../../context/AuthContext'

const statusBadge = {
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
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
  return status.replace('_', ' ')
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

function nextStatus(current) {
  if (current === 'assigned') return 'in_progress'
  if (current === 'in_progress') return 'completed'
  return null
}

function TaskCard({ title, subtitle, status, children, onUpdate, updating }) {
  const next = nextStatus(status)

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
      {next && (
        <button
          type="button"
          onClick={() => onUpdate(next)}
          disabled={updating}
          className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
        >
          {updating
            ? 'Updating...'
            : `Mark as ${formatStatus(next)}`}
        </button>
      )}
      {status === 'completed' && (
        <p className="mt-3 text-sm text-green-700 font-medium">Completed</p>
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

  const handleScheduleUpdate = async (scheduleId, status) => {
    setUpdating(`schedule-${scheduleId}`)
    try {
      await api.patch(`/collectors/schedules/${scheduleId}/status`, { status })
      loadDashboard()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update schedule')
    } finally {
      setUpdating(null)
    }
  }

  const handleRequestUpdate = async (requestId, status) => {
    setUpdating(`request-${requestId}`)
    try {
      await api.patch(`/collectors/on-demand-requests/${requestId}/status`, {
        status,
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
                title={`${formatDate(schedule.collection_date)} — ${formatTime(schedule.collection_time)}`}
                subtitle={`${schedule.kifle_ketema}, Kebele ${schedule.kebele}, ${schedule.sefer}`}
                status={schedule.status}
                onUpdate={(status) =>
                  handleScheduleUpdate(schedule.id, status)
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
                onUpdate={(status) =>
                  handleRequestUpdate(request.id, status)
                }
                updating={updating === `request-${request.id}`}
              >
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Location: {Number(request.latitude).toFixed(5)},{' '}
                    {Number(request.longitude).toFixed(5)}
                  </p>
                  {request.description && <p>{request.description}</p>}
                  {request.phone_number && (
                    <p>Phone: {request.phone_number}</p>
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
