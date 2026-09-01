import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function BusinessDashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Business Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, {user?.ownerName} — {user?.businessName}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/business/profile"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-amber-300 transition"
        >
          <div className="text-2xl mb-2">👤</div>
          <h2 className="font-semibold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500 mt-1">
            View and update your business details
          </p>
        </Link>
        <Link
          to="/business/schedules"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-amber-300 transition"
        >
          <div className="text-2xl mb-2">🗓️</div>
          <h2 className="font-semibold text-gray-900">Collection Schedules</h2>
          <p className="text-sm text-gray-500 mt-1">
            See waste collection times for your area
          </p>
        </Link>
        <Link
          to="/business/create-request"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-amber-300 transition"
        >
          <div className="text-2xl mb-2">🚛</div>
          <h2 className="font-semibold text-gray-900">Request Collection</h2>
          <p className="text-sm text-gray-500 mt-1">
            Submit an on-demand pickup request with map location
          </p>
        </Link>
      </div>
    </div>
  )
}
