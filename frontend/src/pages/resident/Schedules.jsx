import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/Loading'
import RaiseScheduleIssueModal from './RaiseScheduleIssueModal'

function formatTime(value) {
  if (!value) return '—'
  const [hours, minutes] = String(value).split(':')
  if (!hours) return value
  let h = Number(hours)
  const suffix = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${minutes || '00'} ${suffix}`
}

export default function ResidentSchedules() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    api
      .get('/residents/schedules')
      .then(({ data }) => {
        setSchedules(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load schedules')
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(''), 5000)
    return () => clearTimeout(timer)
  }, [successMessage])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Collection Schedules</h2>
      <p className="text-gray-500 mb-6">
        Waste collection days for your area. Raise an issue if a schedule was
        missed or needs attention.
      </p>

      {successMessage && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>{successMessage}</span>
          <Link
            to="/resident/my-reports"
            className="text-green-800 font-medium hover:underline"
          >
            View my reports
          </Link>
        </div>
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
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  {schedule.collection_day}
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
              <button
                type="button"
                onClick={() => setSelectedSchedule(schedule)}
                className="mt-4 w-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer transition"
              >
                Raise Issue
              </button>
            </div>
          ))}
        </div>
      )}

      <RaiseScheduleIssueModal
        schedule={selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        onSuccess={() =>
          setSuccessMessage(
            'Issue submitted successfully. You can track it under My Reports.'
          )
        }
      />
    </div>
  )
}
