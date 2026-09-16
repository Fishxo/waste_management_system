import { useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const recipientRoles = [
  { value: 'resident', label: 'Residents' },
  { value: 'business_owner', label: 'Business Owners' },
  { value: 'collector', label: 'Collectors' },
]

export default function AdminSendNotifications() {
  const { user } = useAuth()
  const scopeKifle = user?.kifleKetema || ''
  const [form, setForm] = useState({
    recipientRole: 'resident',
    recipientId: '',
    kifleKetema: scopeKifle,
    title: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      const payload = {
        recipientRole: form.recipientRole,
        title: form.title.trim(),
        message: form.message.trim(),
      }
      if (form.recipientId) {
        payload.recipientId = Number(form.recipientId)
      }

      const { data } = await api.post('/muAdmin/notifications', payload)
      const count = data.data?.count || 1
      setMessage(`Notification sent to ${count} recipient(s)`)
      setForm({
        recipientRole: form.recipientRole,
        recipientId: '',
        kifleKetema: scopeKifle,
        title: '',
        message: '',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-2">Send Notification</h2>
      <p className="text-gray-500 mb-6">
        Send manual notifications to residents, business owners, or collectors
        (UC-13).
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
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Type
          </label>
          <select
            name="recipientRole"
            value={form.recipientRole}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {recipientRoles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specific User ID (optional)
          </label>
          <input
            name="recipientId"
            type="number"
            placeholder="Leave empty to broadcast"
            value={form.recipientId}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Resident ID, Business ID, or Collector ID. Leave blank to send to
            all users of the selected type.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub-city
          </label>
          <input
            name="kifleKetema"
            value={form.kifleKetema}
            readOnly={!!scopeKifle}
            disabled={!!scopeKifle}
            className={`border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 ${scopeKifle ? 'bg-gray-50' : ''}`}
          />
          {scopeKifle ? (
            <p className="text-xs text-gray-500 mt-1">
              Notifications are sent only to {scopeKifle} sub-city. Broadcasts to
              other sub-cities are not allowed.
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              No sub-city assigned to your account; contact the system admin.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={200}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            required
            maxLength={2000}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  )
}
