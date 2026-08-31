import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusOptions = ['', 'pending', 'in_progress', 'resolved']

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
}

const statusHelp = {
  pending: 'Waiting for the municipal admin to review your report.',
  in_progress: 'The municipal admin is working on your report.',
  resolved: 'Your report has been resolved.',
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

function formatStatus(status) {
  if (!status) return 'All'
  return status.replace('_', ' ')
}

function truncate(text, max = 140) {
  if (!text) return '—'
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchReports = () => {
    setLoading(true)
    setError('')
    api
      .get('/reports')
      .then(({ data }) => {
        setReports(data.data || data.reports || [])
      })
      .catch((err) => {
        setReports([])
        setError(err.response?.data?.message || 'Failed to load reports')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const filteredReports = useMemo(() => {
    if (!filter) return reports
    return reports.filter((report) => report.status === filter)
  }, [reports, filter])

  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === 'pending').length,
      inProgress: reports.filter((r) => r.status === 'in_progress').length,
      resolved: reports.filter((r) => r.status === 'resolved').length,
    }),
    [reports]
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/reports/${deleteTarget.id}`)
      setMessage('Report deleted successfully')
      setDeleteTarget(null)
      fetchReports()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">My Reports</h2>
          <p className="text-gray-500 max-w-2xl">
            General waste reports you submitted. Schedule collection issues are
            listed separately on{' '}
            <Link
              to="/resident/my-schedule-issues"
              className="text-indigo-600 hover:underline"
            >
              Schedule Issues
            </Link>
            .
          </p>
        </div>
        <Link
          to="/resident/create-report"
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shrink-0"
        >
          + Create Report
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-800 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-orange-700">In Progress</p>
          <p className="text-2xl font-bold text-orange-800 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-green-700">Resolved</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{stats.resolved}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {statusOptions.map((status) => (
          <button
            key={status || 'all'}
            type="button"
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm cursor-pointer transition ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {formatStatus(status) || 'All'}
          </button>
        ))}
      </div>

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

      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-600">
            {filter ? `No ${formatStatus(filter)} reports found.` : 'No waste reports found.'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            <Link
              to="/resident/create-report"
              className="text-indigo-600 hover:underline"
            >
              Create a report
            </Link>{' '}
            for general waste problems in your area.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const reportId = report.id || report._id
            const isPending = report.status === 'pending'

            return (
              <article
                key={reportId}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Report #{reportId}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-1 break-words">
                      {report.title}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${
                      statusBadge[report.status] || 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    {formatStatus(report.status)}
                  </span>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 mb-4 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    Description
                  </p>
                  <p className="whitespace-pre-wrap">{truncate(report.description, 220)}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm mb-4">
                  <p className="text-gray-500">
                    Submitted on {formatDate(report.created_at)}
                  </p>
                  <p className="text-gray-600">
                    {statusHelp[report.status] || 'Status updated by the municipal admin.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  <Link
                    to={`/resident/my-reports/${reportId}`}
                    className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition"
                  >
                    View Details
                  </Link>
                  {isPending && (
                    <>
                      <Link
                        to={`/resident/my-reports/${reportId}/edit`}
                        className="inline-flex items-center justify-center bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 py-2 px-4 rounded-lg text-sm font-medium transition"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(report)}
                        className="inline-flex items-center justify-center bg-white border border-red-200 text-red-700 hover:bg-red-50 py-2 px-4 rounded-lg text-sm font-medium transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Report?</h3>
            <p className="text-sm text-gray-600 mb-1">
              This will permanently remove your report:
            </p>
            <p className="text-sm font-medium text-gray-900 mb-4">
              {deleteTarget.title}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Only pending reports can be deleted. This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Report'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
