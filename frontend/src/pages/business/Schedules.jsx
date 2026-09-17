import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import RaiseScheduleIssueModal from '../resident/RaiseScheduleIssueModal'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
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

function formatMonth(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Other'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Addis_Ababa',
    month: 'long',
  }).format(date)
}

export default function BusinessSchedules() {
  const { t } = useTranslation('business')
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const scheduleGroups = schedules.reduce((groups, schedule) => {
    const month = formatMonth(schedule.collection_date)
    const group = groups.find((item) => item.month === month)
    if (group) group.schedules.push(schedule)
    else groups.push({ month, schedules: [schedule] })
    return groups
  }, [])

  useEffect(() => {
    api
      .get('/businessOwners/schedules')
      .then(({ data }) => {
        setSchedules(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || t('failedToLoadSchedules'))
      )
      .finally(() => setLoading(false))
  }, [t])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{t('collectionSchedules')}</h2>
      <p className="text-gray-500 mb-6">
        {t('schedulesForBusiness')}
      </p>

      <div className="mb-5">
        <Link to="/business/schedule-issues" className="text-amber-700 hover:underline text-sm">
          {t('viewRaisedIssues')}
        </Link>
      </div>

      {successMessage && (
        <p className="mb-4 px-4 py-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
          {successMessage}
        </p>
      )}

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <Loading />
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">🗓️</div>
          <p className="text-gray-600">
            {t('noSchedules')}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {t('noSchedulesSub')}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {scheduleGroups.map((group) => (
            <section key={group.month}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                {group.month}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {group.schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                  {formatDate(schedule.collection_date)}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatTimeRange(
                    schedule.collection_time,
                    schedule.end_time
                  )}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600 flex-1">
                <p>
                  <span className="text-gray-400">{t('subCity')}</span>{' '}
                  {schedule.kifle_ketema}
                </p>
                <p>
                  <span className="text-gray-400">{t('kebele')}</span>{' '}
                  {schedule.kebele || '—'}
                </p>
                <p>
                  <span className="text-gray-400">{t('sefer')}</span>{' '}
                  {schedule.sefer || '—'}
                </p>
              </div>
              {schedule.notes && (
                <p className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  {schedule.notes}
                </p>
              )}
              <button
                type="button"
                onClick={() => setSelectedSchedule(schedule)}
                className="mt-4 w-full bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer transition"
              >
                {t('raiseIssue')}
              </button>
            </div>
          ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <RaiseScheduleIssueModal
        schedule={selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        onSuccess={() => setSuccessMessage(t('scheduleIssueSubmitted'))}
      />
    </div>
  )
}
