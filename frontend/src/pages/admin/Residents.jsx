import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
}

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

function fullName(resident) {
  return [resident.first_name, resident.last_name]
    .filter(Boolean)
    .join(' ') || '—'
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

export default function AdminResidents() {
  const [residents, setResidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [details, setDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [residentReports, setResidentReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [expandedReportId, setExpandedReportId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [confirmToggle, setConfirmToggle] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)
  const [activeError, setActiveError] = useState('')
  const [message, setMessage] = useState('')

  const fetchResidents = () => {
    setLoading(true)
    api
      .get('/muAdmin/residents')
      .then(({ data }) => {
        setResidents(Array.isArray(data) ? data : data.data || [])
      })
      .catch(() => setResidents([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchResidents()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return residents
    return residents.filter((resident) =>
      [
        resident.resident_code,
        resident.first_name,
        resident.last_name,
        resident.email,
        resident.phone_number,
        resident.kifle_ketema,
        resident.kebele,
        resident.sefer,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [residents, search])

  const openDetails = async (resident) => {
    setSelected(resident)
    setDetails(null)
    setResidentReports([])
    setExpandedReportId(null)
    setConfirmDelete(false)
    setDeleteError('')
    setConfirmToggle(false)
    setActiveError('')
    setTogglingActive(false)
    setDetailsLoading(true)
    setReportsLoading(true)
    try {
      const [detailRes, reportsRes] = await Promise.all([
        api.get(`/muAdmin/resident/${resident.id}`),
        api.get('/muAdmin/reports'),
      ])
      setDetails(detailRes.data.data || detailRes.data)
      const allReports = Array.isArray(reportsRes.data)
        ? reportsRes.data
        : reportsRes.data.data || []
      setResidentReports(
        allReports.filter(
          (report) => Number(report.resident_id) === Number(resident.id)
        )
      )
    } catch {
      setDetails(resident)
      setResidentReports([])
    } finally {
      setDetailsLoading(false)
      setReportsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setDeleting(true)
    setDeleteError('')
    try {
      await api.delete(`/muAdmin/resident/${selected.id}`)
      setSelected(null)
      setConfirmDelete(false)
      fetchResidents()
      setMessage('Resident deleted successfully')
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || 'Failed to delete resident'
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
      await api.patch(`/muAdmin/resident/${selected.id}/deactivate`)
      setConfirmToggle(false)
      setSelected(null)
      fetchResidents()
      setMessage('Resident account deactivated successfully')
    } catch (err) {
      setActiveError(
        err.response?.data?.message || 'Failed to deactivate resident'
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
      await api.patch(`/muAdmin/resident/${selected.id}/activate`)
      setSelected(null)
      fetchResidents()
      setMessage('Resident account activated successfully')
    } catch (err) {
      setActiveError(
        err.response?.data?.message || 'Failed to activate resident'
      )
    } finally {
      setTogglingActive(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Residents</h2>
      <p className="text-gray-500 mb-6">
        {residents.length} registered resident(s)
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
          placeholder="Search by name, email, phone, or location..."
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
        />

        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No residents found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-sm">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Registered</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((resident) => (
                  <tr
                    key={resident.id}
                    className="border-b hover:bg-gray-50 text-sm"
                  >
                    <td className="px-4 py-3 font-medium text-gray-600">
                      {resident.resident_code || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {fullName(resident)}
                    </td>
                    <td className="px-4 py-3">{resident.email || '—'}</td>
                    <td className="px-4 py-3">{resident.phone_number || '—'}</td>
                    <td className="px-4 py-3">
                      {[
                        resident.kifle_ketema,
                        resident.kebele,
                        resident.sefer,
                      ]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(resident.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          resident.is_active === false
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {resident.is_active === false ? 'Deactivated' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetails(resident)}
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
            className="bg-white rounded-2xl shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Resident Details
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-semibold">
                        {[details?.first_name, details?.last_name]
                          .map((n) => (n ? n.charAt(0).toUpperCase() : ''))
                          .join('') || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {details ? fullName(details) : '—'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {details?.email || '—'}
                        </p>
                      </div>
                    </div>
                    <DetailRow label="Resident Code" value={details?.resident_code} />
                    <DetailRow label="Email" value={details?.email} />
                    <DetailRow
                      label="Phone Number"
                      value={details?.phone_number}
                    />
                    <DetailRow
                      label="Kifle Ketema"
                      value={details?.kifle_ketema}
                    />
                    <DetailRow label="Kebele" value={details?.kebele} />
                    <DetailRow label="Sefer" value={details?.sefer} />
                    <DetailRow
                      label="Registered"
                      value={formatDate(details?.created_at)}
                    />
                  </div>

                  <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-6 md:pt-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Reports
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      {residentReports.length} report(s) submitted
                    </p>

                    {reportsLoading ? (
                      <Loading />
                    ) : residentReports.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No reports found.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {residentReports.map((report) => (
                          <div
                            key={report.id}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() =>
                                setExpandedReportId(
                                  expandedReportId === report.id
                                    ? null
                                    : report.id
                                )
                              }
                              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 cursor-pointer"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {report.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(report.created_at)}
                                </p>
                              </div>
                              <span className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                    statusBadge[report.status] ||
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {report.status?.replace('_', ' ') || 'N/A'}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {expandedReportId === report.id ? '−' : '+'}
                                </span>
                              </span>
                            </button>
                            {expandedReportId === report.id && (
                              <div className="px-4 pb-4">
                                <p className="text-sm text-gray-600 whitespace-pre-line">
                                  {report.description}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {activeError && (
                  <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {activeError}
                  </p>
                )}

                {confirmToggle ? (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-700">
                      Deactivate{' '}
                      <span className="font-semibold">
                        {details ? fullName(details) : 'this resident'}
                      </span>
                      ? They will still be able to log in, but will not be able
                      to create new reports.
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
                      Are you sure? This permanently deletes{' '}
                      <span className="font-semibold">
                        {details ? fullName(details) : 'this resident'}
                      </span>{' '}
                      and all of their reports. This cannot be undone.
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
                      Delete Resident
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
