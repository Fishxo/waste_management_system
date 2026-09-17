import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return '—'
  const [hours, minutes] = String(value).split(':')
  let hour = Number(hours)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return `${hour}:${minutes || '00'} ${suffix}`
}

function formatStatus(status, t) {
  if (!status) return '—'
  return t(`common.${status}`)
}

export default function BusinessScheduleIssues() {
  const { t } = useTranslation('business')
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/businessOwners/schedule-issues')
      .then(({ data }) => setIssues(Array.isArray(data) ? data : data.data || []))
      .catch((err) => setError(err.response?.data?.message || t('failedToLoadIssues')))
      .finally(() => setLoading(false))
  }, [t])

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t('raisedScheduleIssues')}</h2>
          <p className="text-gray-500">{t('raisedScheduleIssuesIntro')}</p>
        </div>
        <Link to="/business/schedules" className="text-amber-700 hover:underline text-sm">{t('backToSchedules')}</Link>
      </div>

      {error && <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">{error}</p>}

      {issues.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-gray-600">{t('noIssues')}</p>
          <Link to="/business/schedules" className="text-amber-700 hover:underline text-sm mt-2 inline-block">{t('viewSchedulesRaiseIssue')}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <article key={issue.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('issueNumber', { id: issue.id })}</p>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {formatDate(issue.collection_date)} {t('at')} {formatTime(issue.collection_time)}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('location', {
                      kifleKetema: issue.kifle_ketema,
                      kebele: issue.kebele || '—',
                      sefer: issue.sefer || '—',
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[issue.status] || 'bg-gray-100 text-gray-800'}`}>
                  {formatStatus(issue.status, t)}
                </span>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{t('yourIssue')}</p>
                <p className="whitespace-pre-wrap">{issue.description}</p>
              </div>
              <p className="text-sm text-gray-500 mt-4">{t('submittedOn', { date: formatDate(issue.created_at) })}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
