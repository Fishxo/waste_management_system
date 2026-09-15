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
                  </tr>
                </thead>
                <tbody>
                  {collectors.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="px-4 py-3">{c.full_name}</td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3">{c.kifle_ketema}</td>
                      <td className="px-4 py-3">
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
