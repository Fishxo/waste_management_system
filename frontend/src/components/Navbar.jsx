import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
      <h1 className="text-xl font-bold text-gray-800">{t('common.appTitle')}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 hidden sm:block">
          {user?.username || user?.name || user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded cursor-pointer"
        >
          {t('navbar.logout')}
        </button>
      </div>
    </header>
  )
}