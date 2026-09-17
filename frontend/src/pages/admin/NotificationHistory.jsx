import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const recipientRoleOptions = [
  { value: '', label: 'All Recipients' },
  { value: 'resident', label: 'Residents' },
  { value: 'business_owner', label: 'Business Owners' },
  { value: 'collector', label: 'Collectors' },
]

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'manual', label: 'Manual' },
  { value: 'schedule_update', label: 'Schedule Update' },
  { value: 'request_approved', label: 'Request Approved' },
  { value: 'collector_assigned', label: 'Collector Assigned' },
  { value: 'collection_completed', label: 'Collection Completed' },
]

const typeBadge = {
  schedule_update: 'bg-indigo-100 text-indigo-800',
  request_approved: 'bg-green-100 text-green-800',
  collector_assigned: 'bg-blue-100 text-blue-800',
  collection_completed: 'bg-purple-100 text-purple-800',
  manual: 'bg-amber-100 text-amber-800',
}

const roleBadge = {
  resident: 'bg-gray-100 text-gray-700',
  business_owner: 'bg-orange-100 text-orange-800',
  collector: 'bg-cyan-100 text-cyan-800',
}

function formatType(type) {
  if (!type) return 'Notification'
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatRole(role) {
  if (!role) return '—'
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right whitespace-pre-wrap">
        {value || '—'}
      </span>
    </div>
  )
}

export default function AdminNotificationHistory() {
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    byRole: { resident: 0, business_owner: 0, collector: 0 },
    byType: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recipientRole, setRecipientRole] = useState('')
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)

  const limit = 20

  const loadNotifications = useCallback(() => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page, limit })
    if (recipientRole) params.set('recipientRole', recipientRole)
    if (type) params.set('type', type)
    if (search.trim()) params.set('search', search.trim())

    api
      .get(`/muAdmin/notifications?${params.toString()}`)
      .then(({ data }) => {
        setNotifications(data.data?.notifications || [])
        setTotal(data.data?.total || 0)
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load notifications')
      )
      .finally(() => setLoading(false))
  }, [recipientRole, type, search, page, limit])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    api
      .get('/muAdmin/notifications/stats')
      .then(({ data }) => {
        setStats(data.data || { total: 0, byRole: {}, byType: {} })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setPage(1)
  }, [recipientRole, type, search])

  const resetFilters = () => {
    setRecipientRole('')
    setType('')
    setSearch('')
  }

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Notification History</h2>
      <p className="text-gray-500 mb-6">
        Details of all notifications sent to residents, business owners, and
        collectors.
      </p>

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Sent" value={stats.total || 0} accent="text-indigo-700" />
        <StatCard label="To Residents" value={stats.byRole?.resident || 0} accent="text-gray-800" />
        <StatCard label="To Business Owners" value={stats.byRole?.business_owner || 0} accent="text-orange-700" />
        <StatCard label="To Collectors" value={stats.byRole?.collector || 0} accent="text-cyan-700" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <select
            value={recipientRole}
            onChange={(e) => setRecipientRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {recipientRoleOptions.map((option) => {
              const count = option.value ? stats.byRole?.[option.value] || 0 : null
              return (
                <option key={option.value} value={option.value}>
                  {option.value ? `${option.label} (${count})` : option.label}
                </option>
              )
            })}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {typeOptions.map((option) => {
              const count = option.value ? stats.byType?.[option.value] || 0 : null
              return (
                <option key={option.value} value={option.value}>
                  {option.value ? `${option.label} (${count})` : option.label}
                </option>
              )
            })}
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or message..."
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full sm:max-w-xs flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : notifications.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">
            No notifications found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-sm">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Recipient Type</th>
                  <th className="px-4 py-3 font-medium">Recipients</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Sent By</th>
                  <th className="px-4 py-3 font-medium">Sent At</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className="border-b hover:bg-gray-50 text-sm"
                  >
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                      {notification.title || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          roleBadge[notification.recipient_role] ||
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {formatRole(notification.recipient_role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {notification.recipient_count > 1
                        ? `${notification.recipient_count} recipients`
                        : notification.recipient_ids?.[0] ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          typeBadge[notification.type] ||
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {formatType(notification.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {notification.sent_by_name || 'System'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(notification.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          notification.is_read
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {notification.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(notification)}
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

        {!loading && total > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-gray-500">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
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
                Notification Details
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <DetailRow label="Title" value={selected.title} />
            <DetailRow label="Message" value={selected.message} />
            <DetailRow
              label="Recipient Type"
              value={formatRole(selected.recipient_role)}
            />
            <DetailRow
              label="Recipients"
              value={selected.recipient_count > 1
                ? `${selected.recipient_count} recipients`
                : selected.recipient_ids?.[0]}
            />
            <DetailRow label="Type" value={formatType(selected.type)} />
            <DetailRow label="Sent By" value={selected.sent_by_name || 'System'} />
            <DetailRow label="Status" value={selected.is_read ? 'Read' : 'Unread'} />
            <DetailRow label="Sent At" value={formatDate(selected.created_at)} />
          </div>
        </div>
      )}
    </div>
  )
}