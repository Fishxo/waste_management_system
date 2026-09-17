import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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

function formatStatus(status, t) {
  if (!status) return '—'
  const key = status === 'in_progress' ? 'inProgress' : status
  const label = t(`common.${key}`)
  if (label !== `common.${key}`) return label
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function statusLabel(labelKey, t) {
  return t(`common.${labelKey === 'in_progress' ? 'inProgress' : labelKey}`)
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

const WORK_STATUS_SECTIONS = [
  { status: 'pending', labelKey: 'pending', color: 'border-gray-200 bg-gray-50' },
  { status: 'in_progress', labelKey: 'in_progress', color: 'border-orange-200 bg-orange-50' },
  { status: 'completed', labelKey: 'completed', color: 'border-green-200 bg-green-50' },
  { status: 'failed', labelKey: 'failed', color: 'border-red-200 bg-red-50' },
]

function statusGroups(items, getStatus) {
  return WORK_STATUS_SECTIONS.map((section) => ({
    ...section,
    items: items.filter((item) => getStatus(item) === section.status),
  }))
}

function TaskCard({ title, subtitle, status, children, onUpdate, updating }) {
  const { t } = useTranslation('collector')
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
    <div className="bg-white border-b border-gray-200 p-4 last:border-b-0">
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
          {formatStatus(status, t)}
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
                {formatStatus(s, t)}
              </option>
            ))}
          </select>
          {selectedStatus === 'failed' && (
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('failedReasonPlaceholder')}
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
            {updating ? t('updating') : t('submit')}
          </button>
        </div>
      )}
    </div>
  )
}

export default function CollectorDashboard({ view = 'all' }) {
  const { user } = useAuth()
  const { t } = useTranslation('collector')
  const [schedules, setSchedules] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const scheduleGroups = statusGroups(schedules, (schedule) => {
    return schedule.status === 'scheduled' || schedule.status === 'assigned'
      ? 'pending'
      : schedule.status
  })
  const requestGroups = statusGroups(requests, (request) => {
    if (request.collection_status === 'assigned' || !request.collection_status) {
      return 'pending'
    }
    if (request.collection_status === 'confirmed') return 'completed'
    return request.collection_status
  })

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
        setError(err.response?.data?.message || t('failedToLoadDashboard'))
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
      setError(err.response?.data?.message || t('failedToUpdateSchedule'))
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
      setError(err.response?.data?.message || t('failedToUpdateRequest'))
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('dashboard')}</h1>
      <p className="text-gray-600 mb-6">
        {t('welcome', { name: user?.fullName })} {t('welcomeDesc')}
      </p>

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${statusFilter === 'all' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          {t('common.all')}
        </button>
        {WORK_STATUS_SECTIONS.map((section) => (
          <button
            key={section.status}
            type="button"
            onClick={() => setStatusFilter(section.status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${statusFilter === section.status ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            {statusLabel(section.labelKey, t)}
          </button>
        ))}
      </div>

      {view !== 'requests' && (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('assignedSchedules')}</h2>
        {schedules.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {t('noSchedulesAssigned')}
          </p>
        ) : (
          <div className="space-y-5">
            {scheduleGroups.map((group) => (
              statusFilter !== 'all' && statusFilter !== group.status ? null :
              <div key={group.status} className={`rounded-xl border p-4 ${group.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{statusLabel(group.labelKey, t)}</h3>
                  <span className="text-xs font-medium text-gray-500">{group.items.length}</span>
                </div>
                {group.items.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('noSchedulesGroup', { label: statusLabel(group.labelKey, t).toLowerCase() })}</p>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {group.items.map((schedule) => (
                      <TaskCard
                        key={schedule.id}
                        title={`${formatDate(schedule.collection_date)} — ${formatTimeRange(schedule.collection_time, schedule.end_time)}`}
                        subtitle={t('scheduleLocation', {
                          kifleKetema: schedule.kifle_ketema,
                          kebele: schedule.kebele,
                          sefer: schedule.sefer,
                        })}
                        status={schedule.status}
                        onUpdate={(status, notes) => handleScheduleUpdate(schedule.id, status, notes)}
                        updating={updating === `schedule-${schedule.id}`}
                      >
                        {schedule.notes && <p className="text-sm text-gray-600">{schedule.notes}</p>}
                      </TaskCard>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {view !== 'schedules' && (
      <section>
        <h2 className="text-lg font-semibold mb-4">
          {t('approvedOnDemandRequests')}
        </h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {t('noRequestsAssigned')}
          </p>
        ) : (
          <div className="space-y-5">
            {requestGroups.map((group) => (
              statusFilter !== 'all' && statusFilter !== group.status ? null :
              <div key={group.status} className={`rounded-xl border p-4 ${group.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{statusLabel(group.labelKey, t)}</h3>
                  <span className="text-xs font-medium text-gray-500">{group.items.length}</span>
                </div>
                {group.items.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('noRequestsGroup', { label: statusLabel(group.labelKey, t).toLowerCase() })}</p>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {group.items.map((request) => (
                      <TaskCard
                        key={request.id}
                        title={request.business_name}
                        subtitle={`${request.owner_name} — ${request.address || t('noAddress')}`}
                        status={request.collection_status}
                        onUpdate={(status, notes) => handleRequestUpdate(request.id, status, notes)}
                        updating={updating === `request-${request.id}`}
                      >
                        <div className="text-sm text-gray-600 space-y-1">
                          {request.business_code && <p className="text-xs text-gray-400">{request.business_code}</p>}
                          <p>{t('location', { lat: Number(request.latitude).toFixed(5), lng: Number(request.longitude).toFixed(5) })}</p>
                          {request.description && <p>{request.description}</p>}
                          {request.phone_number && <p>{t('phoneLabel')} {request.phone_number}</p>}
                          {request.collector_notes && <p><span className="font-medium">{t('noteLabel')}</span> {request.collector_notes}</p>}
                        </div>
                      </TaskCard>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      )}
    </div>
  )
}
