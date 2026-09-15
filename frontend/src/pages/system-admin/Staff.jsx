import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const inputClass =
  'border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-400'

const KIFLE_OPTIONS = [
  'Abema',
  'Menkorer',
  'Negus Teklehaymanot',
  'Tedla Gualu',
]

function EditStaffModal({ type, staff, onClose, onSave }) {
  const [form, setForm] = useState({})
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!staff) return
    setForm({})
    setPassword('')
    setError('')
  }, [staff])

  if (!staff) return null

  const isAdmin = type === 'admin'

  const initialFields = isAdmin
    ? {
        username: staff.username || '',
        email: staff.email || '',
        kifleKetema: staff.kifle_ketema || '',
      }
    : {
        fullName: staff.full_name || '',
        email: staff.email || '',
        phoneNumber: staff.phone_number || '',
        kifleKetema: staff.kifle_ketema || '',
      }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const payload = { ...initialFields, ...form }
    if (isAdmin) {
      if (password.trim()) payload.password = password.trim()
    } else {
      if (password.trim()) payload.password = password.trim()
    }
    try {
      const endpoint = isAdmin
        ? `/systemAdmin/municipal-admins/${staff.id}`
        : `/systemAdmin/collectors/${staff.id}`
      await api.put(endpoint, payload)
      onSave(
        isAdmin ? 'Municipal admin updated successfully' : 'Collector updated successfully'
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update staff')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">
            Edit {isAdmin ? 'Municipal Admin' : 'Collector'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Update the staff information below. Leave the password field empty to
            keep the current password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {isAdmin ? (
            <>
              <div>
                <label
                  htmlFor="edit-username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="edit-username"
                  name="username"
                  placeholder="Username"
                  defaultValue={initialFields.username}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  defaultValue={initialFields.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-kifle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kifle Ketema
                </label>
                <select
                  id="edit-kifle"
                  name="kifleKetema"
                  value={
                    form.kifleKetema !== undefined
                      ? form.kifleKetema
                      : initialFields.kifleKetema
                  }
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select Kifle Ketema</option>
                  {KIFLE_OPTIONS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="edit-fullname"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="edit-fullname"
                  name="fullName"
                  placeholder="Full Name"
                  defaultValue={initialFields.fullName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  defaultValue={initialFields.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone (09xxxxxxxx)
                </label>
                <input
                  id="edit-phone"
                  name="phoneNumber"
                  placeholder="Phone"
                  defaultValue={initialFields.phoneNumber}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-kifle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kifle Ketema
                </label>
                <select
                  id="edit-kifle"
                  name="kifleKetema"
                  value={
                    form.kifleKetema !== undefined
                      ? form.kifleKetema
                      : initialFields.kifleKetema
                  }
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select Kifle Ketema</option>
                  {KIFLE_OPTIONS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="edit-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password (optional)
            </label>
            <input
              id="edit-password"
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SystemAdminStaff() {
  const [admins, setAdmins] = useState([])
  const [collectors, setCollectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [editingCollector, setEditingCollector] = useState(null)

  const [adminForm, setAdminForm] = useState({
    username: '',
    email: '',
    password: '',
    kifleKetema: '',
  })

  const [collectorForm, setCollectorForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    kifleKetema: '',
  })

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      api.get('/systemAdmin/municipal-admins'),
      api.get('/systemAdmin/collectors'),
    ])
      .then(([adminsRes, collectorsRes]) => {
        setAdmins(adminsRes.data.data || [])
        setCollectors(collectorsRes.data.data || [])
      })
      .catch(() => {
        setAdmins([])
        setCollectors([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/systemAdmin/municipal-admins', adminForm)
      setMessage('Municipal admin created successfully')
      setAdminForm({ username: '', email: '', password: '', kifleKetema: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create municipal admin')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCollectorSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/systemAdmin/collectors', collectorForm)
      setMessage('Collector created successfully')
      setCollectorForm({
        fullName: '',
        phoneNumber: '',
        email: '',
        password: '',
        kifleKetema: '',
      })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create collector')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCollector = async (id, activate) => {
    try {
      await api.patch(
        `/systemAdmin/collectors/${id}/${activate ? 'activate' : 'deactivate'}`
      )
      setMessage(`Collector ${activate ? 'activated' : 'deactivated'} successfully`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update collector')
    }
  }

  const handleEditSaved = (msg) => {
    setMessage(msg)
    setEditingAdmin(null)
    setEditingCollector(null)
    fetchData()
  }

  if (loading) return <Loading />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Staff Management</h2>
      <p className="text-gray-500 mb-6">
        Create, edit, activate, and deactivate municipal admin and collector
        accounts.
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <form
          onSubmit={handleAdminSubmit}
          className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4"
        >
          <h3 className="font-semibold text-gray-900">Create Municipal Admin</h3>
          <input
            placeholder="Username"
            value={adminForm.username}
            onChange={(e) =>
              setAdminForm({ ...adminForm, username: e.target.value })
            }
            required
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email"
            value={adminForm.email}
            onChange={(e) =>
              setAdminForm({ ...adminForm, email: e.target.value })
            }
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Password"
            value={adminForm.password}
            onChange={(e) =>
              setAdminForm({ ...adminForm, password: e.target.value })
            }
            required
            minLength={6}
            className={inputClass}
          />
          <select
            name="kifleKetema"
            value={adminForm.kifleKetema}
            onChange={(e) =>
              setAdminForm({ ...adminForm, kifleKetema: e.target.value })
            }
            required
            className={inputClass}
          >
            <option value="">Select Kifle Ketema</option>
            {KIFLE_OPTIONS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Municipal Admin'}
          </button>
        </form>

        <form
          onSubmit={handleCollectorSubmit}
          className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4"
        >
          <h3 className="font-semibold text-gray-900">Create Collector</h3>
          <input
            placeholder="Full Name"
            value={collectorForm.fullName}
            onChange={(e) =>
              setCollectorForm({ ...collectorForm, fullName: e.target.value })
            }
            required
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email"
            value={collectorForm.email}
            onChange={(e) =>
              setCollectorForm({ ...collectorForm, email: e.target.value })
            }
            required
            className={inputClass}
          />
          <input
            placeholder="Phone (09xxxxxxxx)"
            value={collectorForm.phoneNumber}
            onChange={(e) =>
              setCollectorForm({ ...collectorForm, phoneNumber: e.target.value })
            }
            required
            className={inputClass}
          />
          <select
            name="kifleKetema"
            value={collectorForm.kifleKetema}
            onChange={(e) =>
              setCollectorForm({ ...collectorForm, kifleKetema: e.target.value })
            }
            required
            className={inputClass}
          >
            <option value="">Select Kifle Ketema</option>
            {KIFLE_OPTIONS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <input
            type="password"
            placeholder="Password"
            value={collectorForm.password}
            onChange={(e) =>
              setCollectorForm({ ...collectorForm, password: e.target.value })
            }
            required
            minLength={6}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Collector'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Municipal Admins ({admins.length})</h3>
          {admins.length === 0 ? (
            <p className="text-gray-500 text-sm">No municipal admins yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-3 py-2">Username</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Sub-city</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="px-3 py-2">{a.username}</td>
                      <td className="px-3 py-2">{a.email}</td>
                      <td className="px-3 py-2">{a.kifle_ketema || '—'}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setEditingAdmin(a)}
                          className="text-violet-600 hover:underline cursor-pointer text-xs"
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

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Collectors ({collectors.length})</h3>
          {collectors.length === 0 ? (
            <p className="text-gray-500 text-sm">No collectors yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Sub-city</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {collectors.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="px-3 py-2">{c.full_name}</td>
                      <td className="px-3 py-2">{c.email}</td>
                      <td className="px-3 py-2">{c.phone_number}</td>
                      <td className="px-3 py-2">{c.kifle_ketema}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            c.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2 space-x-3">
                        <button
                          onClick={() => setEditingCollector(c)}
                          className="text-violet-600 hover:underline cursor-pointer text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleCollector(c.id, !c.is_active)}
                          className="text-violet-600 hover:underline cursor-pointer text-xs"
                        >
                          {c.is_active ? 'Deactivate' : 'Activate'}
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

      <EditStaffModal
        type="admin"
        staff={editingAdmin}
        onClose={() => setEditingAdmin(null)}
        onSave={handleEditSaved}
      />
      <EditStaffModal
        type="collector"
        staff={editingCollector}
        onClose={() => setEditingCollector(null)}
        onSave={handleEditSaved}
      />
    </div>
  )
}