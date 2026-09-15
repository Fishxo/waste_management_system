import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

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

function formatRole(role) {
  if (role === 'business_owner') return 'Business Owner'
  if (role === 'resident') return 'Resident'
  return role || '—'
}

function Stars({ rating }) {
  return (
    <span className="text-amber-400">
      {'★'.repeat(rating)}
      <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api
      .get('/muAdmin/feedback')
      .then(({ data }) => {
        setFeedback(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load feedback')
      )
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter
    ? feedback.filter((f) => f.submitter_role === filter)
    : feedback

  const avgRating =
    feedback.length > 0
      ? (
          feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
        ).toFixed(1)
      : '—'

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">User Feedback</h2>
      <p className="text-gray-500 mb-6">
        Feedback submitted by residents and business owners. Average rating:{' '}
        <span className="font-semibold text-gray-800">{avgRating}</span> / 5
        ({feedback.length} total)
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'resident', 'business_owner'].map((role) => (
          <button
            key={role || 'all'}
            onClick={() => setFilter(role)}
            className={`px-4 py-1.5 rounded text-sm cursor-pointer ${
              filter === role
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {role ? formatRole(role) : 'All'}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No feedback found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-sm">
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Comment</th>
                <th className="px-4 py-3 font-medium">Sub-city</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 text-sm align-top"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.submitter_name || '—'}</p>
                    {item.submitter_code && (
                      <p className="text-xs text-indigo-600 font-medium">
                        {item.submitter_code}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {item.submitter_email || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">{formatRole(item.submitter_role)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Stars rating={item.rating} />
                    <span className="text-xs text-gray-500 ml-1">
                      ({item.rating}/5)
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs whitespace-pre-wrap">
                    {item.comment || '—'}
                  </td>
                  <td className="px-4 py-3">{item.kifle_ketema || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
