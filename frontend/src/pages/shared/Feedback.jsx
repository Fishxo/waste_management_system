import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange(star)}
          className={`text-2xl transition ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } ${star <= value ? 'text-amber-400' : 'text-gray-300'}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
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

export default function FeedbackPage({ accent = 'indigo' }) {
  const [myFeedback, setMyFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    rating: 0,
    area: '',
    comment: '',
    improvement: '',
  })

  const accentClasses = {
    indigo: {
      ring: 'focus:ring-indigo-400',
      btn: 'bg-indigo-600 hover:bg-indigo-700',
    },
    amber: {
      ring: 'focus:ring-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-700',
    },
  }[accent] || {
    ring: 'focus:ring-indigo-400',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
  }

  const loadFeedback = () => {
    setLoading(true)
    api
      .get('/feedback')
      .then(({ data }) => {
        setMyFeedback(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load feedback')
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadFeedback()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (form.rating < 1) {
      setError('Please select a rating from 1 to 5 stars')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/feedback', {
        rating: form.rating,
        area: form.area || undefined,
        comment: form.comment.trim() || undefined,
        improvement: form.improvement.trim() || undefined,
      })
      setMessage('Thank you for your feedback!')
      setForm({ rating: 0, area: '', comment: '', improvement: '' })
      loadFeedback()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-2">Feedback</h2>
      <p className="text-gray-500 mb-6">
        Help us improve the system. Tell us what feels clear, difficult, or missing.
      </p>

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

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
      >
        <h3 className="font-semibold text-gray-900 mb-1">How is the system working for you?</h3>
        <p className="text-sm text-gray-500 mb-4">
          Your feedback is shared with the admin and system admin teams.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <StarRating
            value={form.rating}
            onChange={(rating) => setForm({ ...form, rating })}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Which part of the system are you commenting on?
          </label>
          <select
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            className={`border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 ${accentClasses.ring}`}
          >
            <option value="">Choose an area (optional)</option>
            <option value="dashboard">Dashboard</option>
            <option value="reports">Reports</option>
            <option value="schedules">Schedules</option>
            <option value="requests">Requests</option>
            <option value="notifications">Notifications</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What did you like or find difficult? (optional)
          </label>
          <textarea
            rows={4}
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Tell us about your experience with the system..."
            maxLength={1000}
            className={`border border-gray-300 rounded-lg px-3 py-2 text-sm w-full resize-none focus:outline-none focus:ring-2 ${accentClasses.ring}`}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What should we improve? (optional)
          </label>
          <textarea
            rows={3}
            value={form.improvement}
            onChange={(e) => setForm({ ...form, improvement: e.target.value })}
            placeholder="Describe a change that would make the system better..."
            maxLength={1000}
            className={`border border-gray-300 rounded-lg px-3 py-2 text-sm w-full resize-none focus:outline-none focus:ring-2 ${accentClasses.ring}`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`${accentClasses.btn} text-white py-2.5 px-5 rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer`}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      <h3 className="font-semibold text-gray-900 mb-4">Your Previous Feedback</h3>

      {loading ? (
        <Loading />
      ) : myFeedback.length === 0 ? (
        <p className="text-gray-500 text-sm">No feedback submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {myFeedback.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div className="space-y-1">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Overall rating</p>
                    <div className="flex items-center gap-1">
                      <StarRating value={item.rating} readOnly />
                      <span className="text-xs text-gray-500">{item.rating}/5</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(item.created_at)}
                </span>
              </div>
              {item.area && (
                <p className="text-xs text-gray-500 mb-2">Area: {item.area}</p>
              )}
              {item.comment && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {item.comment}
                </p>
              )}
              {item.improvement && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">
                  <span className="font-medium">Suggested improvement: </span>
                  {item.improvement}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
