import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function BusinessDashboard() {
  const { user } = useAuth()
  const { t } = useTranslation('business')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('dashboard')}</h1>
      <p className="text-gray-600 mb-6">
        {t('welcome', { owner: user?.ownerName, business: user?.businessName })}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/business/profile"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-amber-300 transition"
        >
          <div className="text-2xl mb-2">👤</div>
          <h2 className="font-semibold text-gray-900">{t('profile')}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('profileDesc')}
          </p>
        </Link>
        <Link
          to="/business/schedules"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-amber-300 transition"
        >
          <div className="text-2xl mb-2">🗓️</div>
          <h2 className="font-semibold text-gray-900">{t('collectionSchedules')}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('collectionSchedulesDesc')}
          </p>
        </Link>
        <Link
          to="/business/create-request"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-amber-300 transition"
        >
          <div className="text-2xl mb-2">🚛</div>
          <h2 className="font-semibold text-gray-900">{t('requestCollection')}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('requestCollectionDesc')}
          </p>
        </Link>
      </div>
    </div>
  )
}
