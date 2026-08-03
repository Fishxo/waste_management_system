import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Loading from '../../components/Loading'

export default function ResidentDashboard() {
  const { user } = useAuth()
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

  if (loading) return <Loading />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        Welcome, {user?.firstName || 'Resident'}
      </h2>
      <p className="text-gray-500 mb-6">Manage your waste reports</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-500">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-2xl font-bold">{stats.resolved}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/resident/create-report"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
          >
            Create Report
          </Link>
          <Link
            to="/resident/my-reports"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            View My Reports
          </Link>
        </div>
      </div>
    </div>
  )
}
