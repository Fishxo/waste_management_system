import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
}

export default function ReportDetails() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/reports/${id}`)
      .then(({ data }) => setReport(data.data || data.report || data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading />
  if (!report) return <p className="text-gray-500">{t('reports.notFound')}</p>

  return (
    <div>
      <Link
        to="/resident/my-reports"
        className="text-indigo-600 hover:underline text-sm mb-4 inline-block"
      >
        {t('reports.backToMyReports')}
      </Link>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{report.title}</h2>
        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded text-xs font-medium ${
              statusColors[report.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {report.status ? t(`common.${report.status}`) : t('common.na')}
          </span>
        </div>
        <p className="text-gray-700 mb-4">{report.description}</p>
        <div className="text-sm text-gray-500">
          <p>
            {t('reports.created', {
              date: report.created_at
                ? new Date(report.created_at).toLocaleString()
                : '—',
            })}
          </p>
          {report.updatedAt && (
            <p>
              {t('reports.updated', {
                date: new Date(report.updatedAt).toLocaleString(),
              })}
            </p>
          )}
        </div>
        {report.status === 'pending' && (
          <Link
            to={`/resident/my-reports/${report.id}/edit`}
            className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            {t('reports.editReport')}
          </Link>
        )}
      </div>
    </div>
  )
}
