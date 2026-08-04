import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const emptyForm = {
  kifleKetema: '',
  kebele: '',
  sefer: '',
  collectionDay: '',
  collectionTime: '',
  notes: '',
}

function toForm(schedule) {
  return {
    kifleKetema: schedule.kifle_ketema || '',
    kebele: schedule.kebele || '',
    sefer: schedule.sefer || '',
    collectionDay: schedule.collection_day || '',
    collectionTime: schedule.collection_time || '',
    notes: schedule.notes || '',
  }
}

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchSchedules = () => {
    setLoading(true)
    api
      .get('/muAdmin/schedules')
      .then(({ data }) => {
        setSchedules(Array.isArray(data) ? data : data.data || [])
      })
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const startEdit = (schedule) => {
    setEditingId(schedule.id)
    setForm(toForm(schedule))
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editingId) {
        await api.patch(`/muAdmin/schedules/${editingId}`, form)
        setMessage('Schedule updated successfully')
      } else {
        await api.post('/muAdmin/schedules', form)
        setMessage('Schedule created successfully')
      }
      setForm(emptyForm)
      setEditingId(null)
      fetchSchedules()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400'

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Schedules Management</h2>
      <p className="text-gray-500 mb-6">
        {schedules.length} collection schedule(s)
      </p>

      {message && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Schedule' : 'Create Schedule'}
          </h3>
          {error && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kifle Ketema (Sub-city)
              </label>
              <input
                name="kifleKetema"
                value={form.kifleKetema}
                onChange={handleChange}
                placeholder="e.g. Bole"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kebele
              </label>
              <input
                name="kebele"
                value={form.kebele}
                onChange={handleChange}
                placeholder="e.g. 05"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sefer (Area/Landmark)
              </label>
              <input
                name="sefer"
                value={form.sefer}
                onChange={handleChange}
                placeholder="e.g. Bole Medhanealem"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Day
              </label>
              <select
                name="collectionDay"
                value={form.collectionDay}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select a day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Time
              </label>
              <input
                name="collectionTime"
                type="time"
                value={form.collectionTime}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional instructions..."
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 flex-1"
              >
                {submitting
                  ? editingId
                    ? 'Updating...'
                    : 'Creating...'
                  : editingId
                    ? 'Update Schedule'
                    : 'Create Schedule'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={submitting}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">All Schedules</h3>
          {loading ? (
            <Loading />
          ) : schedules.length === 0 ? (
            <p className="text-gray-500">No schedules created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-sm">
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Collection Day</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Notes</th>
                    <th className="px-4 py-3 font-medium">Created By</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr
                      key={schedule.id}
                      className="border-b hover:bg-gray-50 text-sm"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{schedule.kifle_ketema}</p>
                        <p className="text-xs text-gray-500">
                          {[schedule.kebele, schedule.sefer]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </td>
                      <td className="px-4 py-3">{schedule.collection_day}</td>
                      <td className="px-4 py-3">{schedule.collection_time}</td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        {schedule.notes || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {schedule.created_by || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => startEdit(schedule)}
                          className="text-indigo-600 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
