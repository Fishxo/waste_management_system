import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const inputClass =
  'border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-400'

export default function SystemAdminStaff() {
  const [admins, setAdmins] = useState([])
  const [collectors, setCollectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  if (loading) return <Loading />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Staff Management</h2>
      <p className="text-gray-500 mb-6">
        Create municipal admin and collector accounts.
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
          <input
            placeholder="Kifle Ketema (optional — leave blank for city-wide)"
            value={adminForm.kifleKetema}
            onChange={(e) =>
              setAdminForm({ ...adminForm, kifleKetema: e.target.value })
            }
            className={inputClass}
          />
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
          <input
            placeholder="Kifle Ketema"
            value={collectorForm.kifleKetema}
            onChange={(e) =>
              setCollectorForm({ ...collectorForm, kifleKetema: e.target.value })
            }
            required
            className={inputClass}
          />
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
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="px-3 py-2">{a.username}</td>
                      <td className="px-3 py-2">{a.email}</td>
                      <td className="px-3 py-2">{a.kifle_ketema || 'All areas'}</td>
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
                    <th className="px-3 py-2">Sub-city</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {collectors.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="px-3 py-2">{c.full_name}</td>
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
                      <td className="px-3 py-2">
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
    </div>
  )
}
