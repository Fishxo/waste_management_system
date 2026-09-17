import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../components/LanguageSelector'

const ROLES = {
  resident: {
    labelKey: 'welcome.resident',
    icon: '🏠',
    login: {
      to: '/resident/login',
      labelKey: 'welcome.residentLogin',
      color: 'bg-indigo-600 hover:bg-indigo-500',
    },
    register: {
      to: '/resident/register',
      labelKey: 'welcome.residentRegister',
      color: 'bg-emerald-600 hover:bg-emerald-500',
    },
  },
  business_owner: {
    labelKey: 'welcome.businessOwner',
    icon: '🏪',
    login: {
      to: '/business/login',
      labelKey: 'welcome.businessLogin',
      color: 'bg-amber-600 hover:bg-amber-500',
    },
    register: {
      to: '/business/register',
      labelKey: 'welcome.businessRegister',
      color: 'bg-orange-600 hover:bg-orange-500',
    },
  },
}

export default function Welcome() {
  const [role, setRole] = useState(null)
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-gray-900 px-4">
      <div className="fixed top-4 right-4">
        <LanguageSelector className="bg-gray-800 text-white border border-gray-700" />
      </div>
      <div className="text-center max-w-lg">
        <div className="text-5xl mb-6">♻️</div>
        <h1 className="text-4xl font-bold text-white mb-4">{t('welcome.title')}</h1>
        <p className="text-gray-300 mb-8 leading-relaxed">{t('welcome.subtitle')}</p>

        {!role ? (
          <>
            <p className="text-gray-400 mb-4 text-sm">{t('welcome.continueAs')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => setRole('resident')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium transition cursor-pointer"
              >
                🏠 {t('welcome.resident')}
              </button>
              <button
                type="button"
                onClick={() => setRole('business_owner')}
                className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium transition cursor-pointer"
              >
                🏪 {t('welcome.businessOwner')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole(null)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer"
                aria-label={t('welcome.backToRoleSelection')}
              >
                {t('welcome.back')}
              </button>
              <h2 className="text-xl font-semibold text-white">
                {ROLES[role].icon} {t(ROLES[role].labelKey)}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={ROLES[role].login.to}
                className={`${ROLES[role].login.color} text-white px-6 py-3 rounded-lg font-medium transition`}
              >
                {t(ROLES[role].login.labelKey)}
              </Link>
              <Link
                to={ROLES[role].register.to}
                className={`${ROLES[role].register.color} text-white px-6 py-3 rounded-lg font-medium transition`}
              >
                {t(ROLES[role].register.labelKey)}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}