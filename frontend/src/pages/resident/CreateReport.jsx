import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function CreateReport() {
  const [form, setForm] = useState({ title: '', description: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [dailyCount, setDailyCount] = useState(null)

  useEffect(() => {
    api
      .get('/reports/daily-count')
      .then(({ data }) => setDailyCount(data.data || null))
      .catch(() => {})
  }, [])

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.post('/reports', form)
      const { data } = await api.get('/reports/daily-count')
      setDailyCount(data.data || null)
      setForm({ title: '', description: '' })
      setSuccess('Report submitted successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create Report</h2>
      <div className="bg-white rounded-lg shadow p-6 max-w-lg">
        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}
        {success && (
          <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
            {success}
          </p>
        )}
        {dailyCount && (
          <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-indigo-900">
                Today's report limit
              </p>
              <p className="text-sm font-semibold text-indigo-700">
                {dailyCount.remaining === 0
                  ? 'Limit reached'
                  : `${dailyCount.remaining} of ${dailyCount.max} remaining`}
              </p>
            </div>
            <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dailyCount.remaining === 0 ? 'bg-red-500' : 'bg-indigo-600'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (dailyCount.used / dailyCount.max) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-indigo-600 mt-2">
              You can create up to {dailyCount.max} reports per day.{' '}
              {dailyCount.remaining === 0
                ? 'Your daily limit has been reached.'
                : dailyCount.remaining === 1
                ? 'You have 1 report left today.'
                : `You have ${dailyCount.remaining} reports left today.`}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              disabled={dailyCount?.remaining === 0}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              required
              disabled={dailyCount?.remaining === 0}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || dailyCount?.remaining === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading
              ? 'Submitting...'
              : dailyCount?.remaining === 0
              ? 'Daily limit reached'
              : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
}
