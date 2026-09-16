import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'
import { useAuth } from '../../context/AuthContext'

export default function AdminCollectors() {
  const { user } = useAuth()
  const [collectors, setCollectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [statusUpdating, setStatusUpdating] = useState(null)
  const [resignTarget, setResignTarget] = useState(null)
  const [resignReason, setResignReason] = useState('')
  const [editingCollector, setEditingCollector] = useState(null)
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
  })
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    kifleKetema: user?.kifleKetema || '',
  })

  const fetchCollectors = () => {
    setLoading(true)
    api
      .get('/muAdmin/collectors')
      .then(({ data }) => {
        setCollectors(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load collectors')
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCollectors()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const collectorStatus = (c) =>
    c.status || (c.is_active ? 'active' : 'inactive')

  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-amber-100 text-amber-800',
    resigned: 'bg-red-100 text-red-800',
  }

  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    resigned: 'Resigned',
  }

  const updateStatus = async (id, status, reason = '') => {
    setError('')
    setStatusUpdating(id)
    try {
      await api.patch(`/muAdmin/collectors/${id}/status`, { status, reason })
      setMessage(
        status === 'resigned'
          ? 'Collector marked as resigned'
          : status === 'active'
            ? 'Collector activated successfully'
            : 'Collector deactivated successfully'
      )
      setResignTarget(null)
      setResignReason('')
      fetchCollectors()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update collector status'
      )
    } finally {
      setStatusUpdating(null)
    }
  }

  const openResign = (collector) => {
    setError('')
    setResignReason('')
    setResignTarget(collector)
  }

  const confirmResign = () => {
    if (!resignTarget) return
    updateStatus(resignTarget.id, 'resigned', resignReason.trim())
  }

  const openEdit = (collector) => {
    setError('')
    setEditForm({
      fullName: collector.full_name || '',
      phoneNumber: collector.phone_number || '',
      email: collector.email || '',
      password: '',
    })
    setEditingCollector(collector)
  }

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value })

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingCollector) return
    setError('')
    setSubmitting(true)
    try {
      const payload = { ...editForm }
      if (!payload.password) delete payload.password
      await api.put(`/muAdmin/collectors/${editingCollector.id}`, payload)
      setMessage('Collector updated successfully')
      setEditingCollector(null)
      fetchCollectors()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update collector'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/muAdmin/collectors', form)
      setMessage('Collector account created successfully')
      setForm({
        fullName: '',
        phoneNumber: '',
        email: '',
        password: '',
        kifleKetema: user?.kifleKetema || '',
      })
      fetchCollectors()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create collector')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Collectors</h2>
      <p className="text-gray-500 mb-6">
        Create collector accounts for waste collection staff.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 flex flex-col gap-4"
        >
          <h3 className="font-semibold text-gray-900">Create Collector</h3>
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            name="phoneNumber"
            placeholder="Phone (09xxxxxxxx)"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            name="kifleKetema"
            placeholder="Kifle Ketema (Sub-city)"
            value={form.kifleKetema}
            onChange={handleChange}
            required
            readOnly={!!user?.kifleKetema}
            className={`border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${user?.kifleKetema ? 'bg-gray-50' : ''}`}
          />
          {user?.kifleKetema && (
            <p className="text-xs text-gray-500 -mt-2">
              Collector will be created for {user.kifleKetema} sub-city.
            </p>
          )}
          <input
            name="password"
            type="password"
            placeholder="Temporary Password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Creating...' : 'Create Collector'}
          </button>
        </form>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">All Collectors</h3>
          {loading ? (
            <Loading />
          ) : collectors.length === 0 ? (
            <p className="text-gray-500 text-sm">No collectors yet.</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Sub-city</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collectors.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="px-4 py-3">{c.full_name}</td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3">{c.kifle_ketema}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const s = collectorStatus(c)
                          return (
                            <div>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  statusStyles[s] || 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {statusLabels[s] || s}
                              </span>
                              {s === 'resigned' && (
                                <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                                  {c.resigned_at && (
                                    <p>
                                      {new Date(
                                        c.resigned_at
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                  {c.resignation_reason && (
                                    <p className="italic">
                                      {c.resignation_reason}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {statusUpdating === c.id ? (
                          <span className="text-gray-400">Updating...</span>
                        ) : collectorStatus(c) === 'resigned' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(c)}
                              className="text-indigo-700 hover:text-indigo-900 font-medium cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => updateStatus(c.id, 'active')}
                              className="text-green-700 hover:text-green-900 font-medium cursor-pointer"
                            >
                              Reinstate
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(c)}
                              className="text-indigo-700 hover:text-indigo-900 font-medium cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                updateStatus(
                                  c.id,
                                  collectorStatus(c) === 'active'
                                    ? 'inactive'
                                    : 'active'
                                )
                              }
                              className={
                                collectorStatus(c) === 'active'
                                  ? 'text-amber-700 hover:text-amber-900 font-medium cursor-pointer'
                                  : 'text-green-700 hover:text-green-900 font-medium cursor-pointer'
                              }
                            >
                              {collectorStatus(c) === 'active'
                                ? 'Deactivate'
                                : 'Activate'}
                            </button>
                            <button
                              onClick={() => openResign(c)}
                              className="text-red-700 hover:text-red-900 font-medium cursor-pointer"
                            >
                              Resign
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {resignTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Resign Collector
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Mark <strong>{resignTarget.full_name}</strong> as resigned?
              They will not be able to log in until reinstated.
            </p>
            <textarea
              rows={3}
              placeholder="Reason (optional)"
              value={resignReason}
              onChange={(e) => setResignReason(e.target.value)}
              maxLength={500}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResignTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmResign}
                disabled={statusUpdating === resignTarget.id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 cursor-pointer"
              >
                {statusUpdating === resignTarget.id
                  ? 'Processing...'
                  : 'Confirm Resign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCollector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Edit Collector
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Leave the password blank to keep the current password.
            </p>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
                {error}
              </p>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <input
                name="fullName"
                placeholder="Full Name"
                value={editForm.fullName}
                onChange={handleEditChange}
                required
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                name="phoneNumber"
                placeholder="Phone (09xxxxxxxx)"
                value={editForm.phoneNumber}
                onChange={handleEditChange}
                required
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={handleEditChange}
                required
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                name="password"
                type="password"
                placeholder="New Password (optional)"
                value={editForm.password}
                onChange={handleEditChange}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex justify-end gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setEditingCollector(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
