import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/Loading'
import { useAuth } from '../../context/AuthContext'

function StatCard({ label, value, hint, color }) {
  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm ${color}`}>
      <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value ?? 0}</p>
      {hint && <p className="text-sm text-gray-500 mt-2">{hint}</p>}
    </div>
  )
}

const quickLinks = [
  { to: '/system-admin/staff', label: 'Manage Staff', icon: '🧑‍💼' },
  { to: '/system-admin/users', label: 'Manage Users', icon: '👥' },
  { to: '/system-admin/backup', label: 'Backup & Restore', icon: '💾' },
]

export default function SystemAdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/systemAdmin/dashboard')
      .then(({ data }) => setStats(data.data || data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load dashboard')
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        Welcome, {user?.username || 'System Admin'}
      </h2>
      <p className="text-gray-500 mb-8">
        System-wide overview and management for all users and roles.
      </p>

      {error && (
        <p className="mb-6 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Residents"
          value={stats?.totalResidents}
          hint={`${stats?.inactiveResidents ?? 0} inactive`}
          color="border-blue-200"
        />
        <StatCard
          label="Business Owners"
          value={stats?.totalBusinessOwners}
          hint={`${stats?.inactiveBusinessOwners ?? 0} inactive`}
          color="border-amber-200"
        />
        <StatCard
          label="Municipal Admins"
          value={stats?.totalMunicipalAdmins}
          color="border-indigo-200"
        />
        <StatCard
          label="Collectors"
          value={stats?.totalCollectors}
          hint={`${stats?.inactiveCollectors ?? 0} inactive`}
          color="border-teal-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-violet-300 hover:bg-violet-50 transition"
          >
            <div className="text-3xl mb-3">{link.icon}</div>
            <h3 className="font-semibold text-gray-900">{link.label}</h3>
          </Link>
        ))}
      </div>
    </div>
  )
}
