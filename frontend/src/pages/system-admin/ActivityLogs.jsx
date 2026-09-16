import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'login', label: 'Log In' },
  { value: 'logout', label: 'Log Out' },
  { value: 'update_report_status', label: 'Update Report Status' },
  { value: 'delete_resident', label: 'Delete Resident' },
  { value: 'activate_resident', label: 'Activate Resident' },
  { value: 'deactivate_resident', label: 'Deactivate Resident' },
  { value: 'delete_business_owner', label: 'Delete Business Owner' },
  { value: 'activate_business_owner', label: 'Activate Business Owner' },
  { value: 'deactivate_business_owner', label: 'Deactivate Business Owner' },
  { value: 'update_schedule_issue_status', label: 'Update Schedule Issue Status' },
  { value: 'create_schedule_issue', label: 'Create Schedule Issue' },
  { value: 'update_request_status', label: 'Update Request Status' },
  { value: 'update_collection_status', label: 'Update Collection Status' },
  { value: 'create_collector', label: 'Create Collector' },
  { value: 'update_collector', label: 'Update Collector' },
  { value: 'activate_collector', label: 'Activate Collector' },
  { value: 'deactivate_collector', label: 'Deactivate Collector' },
  { value: 'assign_collector_schedule', label: 'Assign Collector to Schedule' },
  { value: 'assign_collector_request', label: 'Assign Collector to Request' },
  { value: 'create_schedule', label: 'Create Schedule' },
  { value: 'update_schedule', label: 'Update Schedule' },
  { value: 'create_municipal_admin', label: 'Create Municipal Admin' },
  { value: 'update_municipal_admin', label: 'Update Municipal Admin' },
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'generate_operational_report', label: 'Generate Operational Report' },
  { value: 'create_backup', label: 'Create Backup' },
  { value: 'restore_database', label: 'Restore Database' },
]

const actionLabels = actionOptions.reduce((acc, option) => {
  if (option.value) acc[option.value] = option.label
  return acc
}, {})

const actionBadge = {
  login: 'bg-blue-100 text-blue-800',
  logout: 'bg-slate-100 text-slate-700',
  update_report_status: 'bg-indigo-100 text-indigo-800',
  delete_resident: 'bg-red-100 text-red-700',
  activate_resident: 'bg-green-100 text-green-700',
  deactivate_resident: 'bg-amber-100 text-amber-800',
  delete_business_owner: 'bg-red-100 text-red-700',
  activate_business_owner: 'bg-green-100 text-green-700',
  deactivate_business_owner: 'bg-amber-100 text-amber-800',
  update_schedule_issue_status: 'bg-violet-100 text-violet-800',
  create_schedule_issue: 'bg-orange-100 text-orange-800',
  update_request_status: 'bg-blue-100 text-blue-800',
  update_collection_status: 'bg-teal-100 text-teal-800',
  create_collector: 'bg-cyan-100 text-cyan-800',
  update_collector: 'bg-cyan-100 text-cyan-800',
  activate_collector: 'bg-green-100 text-green-700',
  deactivate_collector: 'bg-amber-100 text-amber-800',
  assign_collector_schedule: 'bg-orange-100 text-orange-800',
  assign_collector_request: 'bg-orange-100 text-orange-800',
  create_schedule: 'bg-indigo-100 text-indigo-800',
  update_schedule: 'bg-indigo-100 text-indigo-800',
  create_municipal_admin: 'bg-gray-100 text-gray-700',
  update_municipal_admin: 'bg-gray-100 text-gray-700',
  send_notification: 'bg-amber-100 text-amber-800',
  generate_operational_report: 'bg-emerald-100 text-emerald-700',
  create_backup: 'bg-teal-100 text-teal-800',
  restore_database: 'bg-red-100 text-red-700',
}

const roleBadge = {
  municipal_admin: 'bg-indigo-100 text-indigo-800',
  system_admin: 'bg-gray-100 text-gray-700',
  collector: 'bg-cyan-100 text-cyan-800',
}

const roleLabel = {
  municipal_admin: 'Municipal Admin',
  system_admin: 'System Admin',
  collector: 'Collector',
}

function formatRole(role) {
  return roleLabel[role] || role || '—'
}

function actorFallback(role, id) {
  if (role === 'collector') return `Collector #${id}`
  if (role === 'municipal_admin' || role === 'system_admin') return `Admin #${id}`
  return `User #${id}`
}

function formatAction(action) {
  return actionLabels[action] || action || '—'
}

function formatEntity(entity) {
  if (!entity) return '—'
  return entity
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function humanize(key) {
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const detailLabel = {
  title: 'Title',
  description: 'Description',
  status: 'Status',
  username: 'Username',
  email: 'Email',
  phone: 'Phone',
  phone_number: 'Phone',
  full_name: 'Name',
  first_name: 'First Name',
  last_name: 'Last Name',
  resident_code: 'Resident Code',
  kifle_ketema: 'Sub-City',
  kebele: 'Kebele',
  sefer: 'Sefer',
  address: 'Address',
  business_name: 'Business',
  company_name: 'Company',
  message: 'Message',
  count: 'Count',
  recipient_count: 'Recipients',
  recipientCount: 'Recipients',
  schedule_date: 'Schedule Date',
  collection_status: 'Collection Status',
  collector_id: 'Collector ID',
  collectorId: 'Collector ID',
  previousCollectorId: 'Previous Collector ID',
  newCollectorId: 'New Collector ID',
  previousStatus: 'Previous Status',
  newStatus: 'New Status',
  statusChange: 'Status Change',
  notes: 'Notes',
  report_type: 'Report Type',
  date_range: 'Date Range',
  backup_file: 'Backup File',
  recipientRole: 'Recipient Role',
  type: 'Notification Type',
}

const kifleBadge = 'bg-emerald-100 text-emerald-800'

function kifleLabel(value) {
  if (!value) return null
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDetailValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string' && value.includes('_')) {
    return value.replace(/_/g, ' ')
  }
  return String(value)
}

function detailPreview(details) {
  if (!details || typeof details !== 'object') return '—'
  const parts = []
  if (details.title) parts.push(details.title)
  if (details.full_name) parts.push(details.full_name)
  else if (details.first_name || details.last_name)
    parts.push([details.first_name, details.last_name].filter(Boolean).join(' '))
  else if (details.username) parts.push(details.username)

  if (details.statusChange) parts.push(`Status: ${details.statusChange}`)
  else if (details.status) parts.push(`Status: ${details.status.replace(/_/g, ' ')}`)
  else if (details.collection_status)
    parts.push(`Collection: ${details.collection_status.replace(/_/g, ' ')}`)

  if (details.previousCollectorId != null || details.collectorId != null) {
    const from = details.previousCollectorId ?? '—'
    const to = details.collectorId ?? '—'
    parts.push(`collector #${from} → #${to}`)
  }

  if (details.recipientCount != null || details.recipient_count != null)
    parts.push(`${details.recipientCount ?? details.recipient_count} recipient(s)`)
  if (details.report_type) parts.push(details.report_type)
  if (details.schedule_date) parts.push(details.schedule_date)
  if (details.backup_file) parts.push(details.backup_file)
  return parts.length ? parts.slice(0, 2).join(' · ') : '—'
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
      <span className="text-sm font-medium text-gray-900 text-right whitespace-pre-wrap break-words max-w-[70%]">
        {value || '—'}
      </span>
    </div>
  )
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    byAction: {},
    byActor: { municipal_admin: 0, system_admin: 0 },
    byAdmin: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actorRole, setActorRole] = useState('')
  const [actorName, setActorName] = useState('')
  const [action, setAction] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)

  const limit = 20

  const loadLogs = () => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page, limit })
    if (actorRole) params.set('actorRole', actorRole)
    if (actorName) params.set('actorName', actorName)
    if (action) params.set('action', action)
    if (search.trim()) params.set('search', search.trim())

    api
      .get(`/systemAdmin/activity-logs?${params.toString()}`)
      .then(({ data }) => {
        setLogs(data.data?.logs || [])
        setTotal(data.data?.total || 0)
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load activity logs')
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actorRole, actorName, action, search, page])

  useEffect(() => {
    api
      .get('/systemAdmin/activity-logs/stats')
      .then(({ data }) => {
        setStats(
          data.data || { total: 0, byAction: {}, byActor: {}, byAdmin: [] }
        )
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setPage(1)
  }, [actorRole, actorName, action, search])

  const uniqueAdmins = useMemo(() => {
    const seen = new Set()
    return (stats.byAdmin || []).filter((admin) => {
      if (!admin.name || seen.has(admin.name)) return false
      seen.add(admin.name)
      return true
    })
  }, [stats.byAdmin])

  const hasFilters = actorRole || actorName || action || search.trim()

  const resetFilters = () => {
    setActorRole('')
    setActorName('')
    setAction('')
    setSearch('')
  }

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Activity Log</h2>
      <p className="text-gray-500 mb-6">
        Every activity performed by municipal administrators, system
        administrators, and collectors — including logins, record changes,
        schedules, collector assignments, and collection status updates.
      </p>

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Activities" value={stats.total || 0} accent="text-indigo-700" />
        <StatCard
          label="By Municipal Admins"
          value={stats.byActor?.municipal_admin || 0}
          accent="text-gray-800"
        />
        <StatCard
          label="By System Admins"
          value={stats.byActor?.system_admin || 0}
          accent="text-indigo-700"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <select
            value={actorRole}
            onChange={(e) => setActorRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Admins</option>
            <option value="municipal_admin">Municipal Admins</option>
            <option value="system_admin">System Admins</option>
            <option value="collector">Collectors</option>
          </select>

          <select
            value={actorName}
            onChange={(e) => setActorName(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Every Admin</option>
            {uniqueAdmins.map((admin) => (
              <option key={admin.name} value={admin.name}>
                {admin.name}
                {admin.kifleKetema
                  ? ` (${kifleLabel(admin.kifleKetema)})`
                  : ''}
                {admin.count ? ` — ${admin.count}` : ''}
              </option>
            ))}
          </select>

          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {actionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value ? `${option.label}${stats.byAction?.[option.value] ? ` (${stats.byAction[option.value]})` : ''}` : option.label}
              </option>
            ))}
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admin, action, or entity..."
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full sm:max-w-xs flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {loading ? (
          <Loading />
        ) : logs.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No activities found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-sm">
                  <th className="px-4 py-3 font-medium">Admin</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Entity ID</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3">
                      <p className="font-medium">{log.actor_name || actorFallback(log.actor_role, log.actor_id)}</p>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${
                          roleBadge[log.actor_role] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {formatRole(log.actor_role)}
                      </span>
                      {log.actor_kifle_ketema && (
                        <span
                          className={`inline-block mt-0.5 ml-1 px-2 py-0.5 rounded text-xs font-medium ${kifleBadge}`}
                        >
                          {kifleLabel(log.actor_kifle_ketema)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          actionBadge[log.action] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatEntity(log.entity_type)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.entity_id ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 max-w-[16rem] truncate">
                        {detailPreview(log.details)}
                      </p>
                      <button
                        onClick={() => setSelected(log)}
                        className="text-indigo-600 hover:underline cursor-pointer mt-0.5"
                      >
                        View Details
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
                Activity Details
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <DetailRow label="Admin" value={selected.actor_name || actorFallback(selected.actor_role, selected.actor_id)} />
            <DetailRow label="Admin Role" value={formatRole(selected.actor_role)} />
            {selected.actor_kifle_ketema && (
              <DetailRow label="Sub-City" value={kifleLabel(selected.actor_kifle_ketema)} />
            )}
            <DetailRow label="Action" value={formatAction(selected.action)} />
            <DetailRow label="Entity" value={formatEntity(selected.entity_type)} />
            <DetailRow label="Entity ID" value={selected.entity_id} />
            <DetailRow label="Date" value={formatDate(selected.created_at)} />
            {selected.details && typeof selected.details === 'object' && (
              <div className="mt-4 pt-2 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Details
                </p>
                {Object.entries(selected.details).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-sm text-gray-500 shrink-0">
                      {detailLabel[key] || humanize(key)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 text-right whitespace-pre-wrap break-words max-w-[70%]">
                      {formatDetailValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}