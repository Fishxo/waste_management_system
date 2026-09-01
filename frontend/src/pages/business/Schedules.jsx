import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

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

export default function BusinessSchedules() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/businessOwners/schedules')
      .then(({ data }) => {
        setSchedules(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load schedules')
      )
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Collection Schedules</h2>
      <p className="text-gray-500 mb-6">
        Waste collection days for your business area (sub-city and kebele).
      </p>

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
            No collection schedules available for your area yet.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Check back later for updates from your municipality.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                  {formatDate(schedule.collection_date)}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatTime(schedule.collection_time)}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600 flex-1">
                <p>
                  <span className="text-gray-400">Sub-city:</span>{' '}
                  {schedule.kifle_ketema}
                </p>
                <p>
                  <span className="text-gray-400">Kebele:</span>{' '}
                  {schedule.kebele || '—'}
                </p>
                <p>
                  <span className="text-gray-400">Sefer:</span>{' '}
                  {schedule.sefer || '—'}
                </p>
              </div>
              {schedule.notes && (
                <p className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  {schedule.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
