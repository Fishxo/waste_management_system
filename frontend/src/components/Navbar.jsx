import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">Waste Management</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.username || user?.name || user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
