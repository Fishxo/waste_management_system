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
  const [form, setForm] = useState({ rating: 0, comment: '' })

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
        comment: form.comment.trim() || undefined,
      })
      setMessage('Thank you for your feedback!')
      setForm({ rating: 0, comment: '' })
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
        Share your experience with the waste management service (UC-14).
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
        <h3 className="font-semibold text-gray-900 mb-4">Submit Feedback</h3>

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
            Comment (optional)
          </label>
          <textarea
            rows={4}
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Tell us about your experience..."
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
              <div className="flex items-center justify-between gap-3 mb-2">
                <StarRating value={item.rating} readOnly />
                <span className="text-xs text-gray-400">
                  {formatDate(item.created_at)}
                </span>
              </div>
              {item.comment && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {item.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
