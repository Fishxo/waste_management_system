import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

export default function SystemAdminUsers() {
  const [tab, setTab] = useState('residents')
  const [residents, setResidents] = useState([])
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      api.get('/systemAdmin/residents'),
      api.get('/systemAdmin/business-owners'),
    ])
      .then(([residentsRes, ownersRes]) => {
        setResidents(residentsRes.data.data || [])
        setOwners(ownersRes.data.data || [])
      })
      .catch(() => {
        setResidents([])
        setOwners([])
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

  const filteredResidents = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return residents
    return residents.filter((r) =>
      [r.resident_code, r.first_name, r.last_name, r.email, r.phone_number, r.kifle_ketema]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [residents, search])

  const filteredOwners = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return owners
    return owners.filter((o) =>
      [o.business_name, o.business_code, o.owner_name, o.email, o.phone_number, o.kifle_ketema]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [owners, search])

  const toggleResident = async (id, activate) => {
    try {
      await api.patch(
        `/systemAdmin/residents/${id}/${activate ? 'activate' : 'deactivate'}`
      )
      setMessage(`Resident ${activate ? 'activated' : 'deactivated'} successfully`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update resident')
    }
  }

  const toggleOwner = async (id, activate) => {
    try {
      await api.patch(
        `/systemAdmin/business-owners/${id}/${activate ? 'activate' : 'deactivate'}`
      )
      setMessage(
        `Business owner ${activate ? 'activated' : 'deactivated'} successfully`
      )
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update business owner')
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">User Management</h2>
      <p className="text-gray-500 mb-6">
        View and activate/deactivate residents and business owners.
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

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('residents')}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
            tab === 'residents'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Residents ({residents.length})
        </button>
        <button
          onClick={() => setTab('owners')}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
            tab === 'owners'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Business Owners ({owners.length})
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, phone, or location..."
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full max-w-md focus:outline-none focus:ring-2 focus:ring-violet-400 mb-4"
      />

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {tab === 'residents' ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{r.resident_code || '—'}</td>
                  <td className="px-4 py-3">
                    {[r.first_name, r.last_name].filter(Boolean).join(' ')}
                  </td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">
                    {[r.kifle_ketema, r.kebele].filter(Boolean).join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        r.is_active !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {r.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleResident(r.id, r.is_active === false)
                      }
                      className="text-violet-600 hover:underline cursor-pointer"
                    >
                      {r.is_active === false ? 'Activate' : 'Deactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwners.map((o) => (
                <tr key={o.business_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{o.business_code || '—'}</td>
                  <td className="px-4 py-3">{o.business_name}</td>
                  <td className="px-4 py-3">{o.owner_name}</td>
                  <td className="px-4 py-3">{o.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        o.is_active !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {o.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleOwner(o.business_id, o.is_active === false)
                      }
                      className="text-violet-600 hover:underline cursor-pointer"
                    >
                      {o.is_active === false ? 'Activate' : 'Deactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
