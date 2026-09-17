import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Loading from '../../components/Loading'

export default function ResidentDashboard() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/reports')
      .then(({ data }) => {
        const reports = data.data || data.reports || []
        setStats({
          total: reports.length,
          pending: reports.filter((r) => r.status === 'pending').length,
          inProgress: reports.filter((r) => r.status === 'in_progress').length,
          resolved: reports.filter((r) => r.status === 'resolved').length,
        })
      })
      .catch(() => setStats({ total: 0, pending: 0, inProgress: 0, resolved: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const isDeactivated = user?.isActive === false

  if (loading) return <Loading />

  return (
    <div>
      {isDeactivated && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          <p className="font-semibold flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
            {t('resident.deactivatedTitle')}
          </p>
          <p className="text-sm mt-1">{t('resident.deactivatedDesc')}</p>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-2">
        {t('resident.welcome', { name: user?.firstName || t('resident.welcomeDefault') })}
      </h2>
      <p className="text-gray-500 mb-6">{t('resident.manageReports')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">{t('resident.totalReports')}</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">{t('common.pending')}</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-500">
          <p className="text-sm text-gray-500">{t('common.inProgress')}</p>
          <p className="text-2xl font-bold">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">{t('common.resolved')}</p>
          <p className="text-2xl font-bold">{stats.resolved}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{t('resident.quickActions')}</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/resident/create-report"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
          >
            {t('resident.createReport')}
          </Link>
          <Link
            to="/resident/my-reports"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            {t('resident.viewMyReports')}
          </Link>
          <Link
            to="/resident/my-schedule-issues"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            {t('resident.viewScheduleIssues')}
          </Link>
          <Link
            to="/resident/schedules"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            {t('resident.viewSchedules')}
          </Link>
        </div>
      </div>
    </div>
  )
}
