import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusOptions = ['', 'pending', 'in_progress', 'resolved']
const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
}

function formatStatus(status, t) {
  if (!status) return t('common.all')
  return t(`common.${status === 'in_progress' ? 'inProgress' : status}`)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function MyReports() {
  const { t } = useTranslation('business')
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api
      .get('/reports')
      .then(({ data }) => setReports(data.data || data.reports || []))
      .catch((err) => setError(err.response?.data?.message || t('failedToLoadReports')))
      .finally(() => setLoading(false))
  }, [t])

  const filteredReports = useMemo(
    () => (filter ? reports.filter((report) => report.status === filter) : reports),
    [filter, reports]
  )

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((report) => report.status === 'pending').length,
    inProgress: reports.filter((report) => report.status === 'in_progress').length,
    resolved: reports.filter((report) => report.status === 'resolved').length,
  }), [reports])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/reports/${deleteTarget.id}`)
      setReports((current) => current.filter((report) => report.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err.response?.data?.message || t('failedToDelete'))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t('myReportsTitle')}</h2>
          <p className="text-gray-500">{t('myReportsIntro')}</p>
        </div>
        <Link
          to="/business/create-report"
          className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shrink-0"
        >
          {t('createReport')}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          ['total', stats.total, 'border-gray-200', 'text-gray-900'],
          ['common.pending', stats.pending, 'border-yellow-200', 'text-yellow-800'],
          ['common.inProgress', stats.inProgress, 'border-orange-200', 'text-orange-800'],
          ['common.resolved', stats.resolved, 'border-green-200', 'text-green-800'],
        ].map(([label, value, border, color]) => (
          <div key={label} className={`bg-white rounded-xl border ${border} p-4 shadow-sm`}>
            <p className="text-xs uppercase tracking-wide text-gray-400">{t(label)}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {statusOptions.map((status) => (
          <button
            key={status || 'all'}
            type="button"
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm cursor-pointer transition ${
              filter === status ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {formatStatus(status, t)}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">{error}</p>}

      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600">{filter ? t('noFilterReports', { status: formatStatus(filter, t) }) : t('noReports')}</p>
          <Link to="/business/create-report" className="text-amber-600 hover:underline text-sm mt-2 inline-block">{t('createReportLink')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <article key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('reportNumber', { id: report.id })}</p>
                  <h3 className="text-lg font-bold text-gray-900 mt-1 break-words">{report.title}</h3>
                </div>
                <span className={`inline-flex shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge[report.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                  {formatStatus(report.status, t)}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{report.description}</p>
              <p className="text-sm text-gray-500">{t('submittedOn', { date: formatDate(report.created_at) })}</p>
              {report.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/business/my-reports/${report.id}/edit`}
                    className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                  >
                    {t('edit')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(report)}
                    className="bg-white border border-red-200 text-red-700 hover:bg-red-50 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer"
                  >
                    {t('delete')}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900">{t('deleteTitle')}</h3>
            <p className="text-sm text-gray-500 mt-2">{t('deletePendingDesc')}</p>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm cursor-pointer">{t('cancel')}</button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-50 cursor-pointer">{deleting ? t('deleting') : t('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
