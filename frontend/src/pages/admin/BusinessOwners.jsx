import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">
        {value || 'Not provided'}
      </span>
    </div>
  )
}

export default function AdminBusinessOwners() {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [details, setDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [confirmToggle, setConfirmToggle] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)
  const [activeError, setActiveError] = useState('')
  const [message, setMessage] = useState('')

  const fetchOwners = () => {
    setLoading(true)
    api
      .get('/muAdmin/business-owners')
      .then(({ data }) => {
        setOwners(Array.isArray(data) ? data : data.data || [])
      })
      .catch(() => setOwners([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOwners()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return owners
    return owners.filter((owner) =>
      [
        owner.business_name,
        owner.owner_name,
        owner.email,
        owner.phone_number,
        owner.kifle_ketema,
        owner.kebele,
        owner.business_type,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [owners, search])

  const openDetails = async (owner) => {
    setSelected(owner)
    setDetails(null)
    setConfirmDelete(false)
    setDeleteError('')
    setConfirmToggle(false)
    setActiveError('')
    setTogglingActive(false)
    setDetailsLoading(true)
    try {
      const { data } = await api.get(
        `/muAdmin/business-owner/${owner.business_id}`
      )
      setDetails(data.data || data)
    } catch {
      setDetails(owner)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setDeleting(true)
    setDeleteError('')
    try {
      await api.delete(`/muAdmin/business-owner/${selected.business_id}`)
      setSelected(null)
      setConfirmDelete(false)
      fetchOwners()
      setMessage('Business owner deleted successfully')
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || 'Failed to delete business owner'
      )
    } finally {
      setDeleting(false)
    }
  }

  const handleDeactivate = async () => {
    if (!selected) return
    setTogglingActive(true)
    setActiveError('')
    try {
      await api.patch(
        `/muAdmin/business-owner/${selected.business_id}/deactivate`
      )
      setConfirmToggle(false)
      setSelected(null)
      fetchOwners()
      setMessage('Business owner account deactivated successfully')
    } catch (err) {
      setActiveError(
        err.response?.data?.message || 'Failed to deactivate business owner'
      )
    } finally {
      setTogglingActive(false)
    }
  }

  const handleActivate = async () => {
    if (!selected) return
    setTogglingActive(true)
    setActiveError('')
    try {
      await api.patch(
        `/muAdmin/business-owner/${selected.business_id}/activate`
      )
      setSelected(null)
      fetchOwners()
      setMessage('Business owner account activated successfully')
    } catch (err) {
      setActiveError(
        err.response?.data?.message || 'Failed to activate business owner'
      )
    } finally {
      setTogglingActive(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Business Owners</h2>
      <p className="text-gray-500 mb-6">
        {owners.length} registered business owner(s)
      </p>

      {message && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
          {message}
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by business, owner, email, phone, or location..."
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
        />

        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No business owners found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-sm">
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Registered</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((owner) => (
                  <tr
                    key={owner.business_id}
                    className="border-b hover:bg-gray-50 text-sm"
                  >
                    <td className="px-4 py-3 font-medium">
                      {owner.business_name || '—'}
                    </td>
                    <td className="px-4 py-3">{owner.owner_name || '—'}</td>
                    <td className="px-4 py-3">
                      <p>{owner.email || '—'}</p>
                      <p className="text-xs text-gray-500">
                        {owner.phone_number || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {[owner.kifle_ketema, owner.kebele]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(owner.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          owner.is_active === false
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {owner.is_active === false ? 'Deactivated' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetails(owner)}
                        className="text-indigo-600 hover:underline cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Business Owner Details
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {detailsLoading ? (
              <Loading />
            ) : (
              <>
                <DetailRow label="Business Name" value={details?.business_name} />
                <DetailRow label="Owner Name" value={details?.owner_name} />
                <DetailRow label="Email" value={details?.email} />
                <DetailRow label="Phone" value={details?.phone_number} />
                <DetailRow label="Business Type" value={details?.business_type} />
                <DetailRow label="Address" value={details?.address} />
                <DetailRow
                  label="Kifle Ketema"
                  value={details?.kifle_ketema}
                />
                <DetailRow label="Kebele" value={details?.kebele} />
                <DetailRow
                  label="Registered"
                  value={formatDate(details?.created_at)}
                />

                {activeError && (
                  <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {activeError}
                  </p>
                )}

                {confirmToggle ? (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-700">
                      Deactivate{' '}
                      <span className="font-semibold">
                        {details?.business_name || 'this business'}
                      </span>
                      ? They will not be able to log in or submit requests.
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleDeactivate}
                        disabled={togglingActive}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                      >
                        {togglingActive ? 'Deactivating...' : 'Yes, Deactivate'}
                      </button>
                      <button
                        onClick={() => {
                          setConfirmToggle(false)
                          setActiveError('')
                        }}
                        disabled={togglingActive}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : confirmDelete ? (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-700">
                      Permanently delete{' '}
                      <span className="font-semibold">
                        {details?.business_name || 'this business'}
                      </span>
                      ? This cannot be undone.
                    </p>
                    {deleteError && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
                        {deleteError}
                      </p>
                    )}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                      >
                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDelete(false)
                          setDeleteError('')
                        }}
                        disabled={deleting}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 border-t border-gray-100 pt-4 flex flex-wrap items-center gap-3">
                    {details?.is_active === false ? (
                      <button
                        onClick={handleActivate}
                        disabled={togglingActive}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                      >
                        {togglingActive ? 'Activating...' : 'Reactivate Account'}
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmToggle(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                      >
                        Deactivate Account
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                    >
                      Delete Business Owner
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
