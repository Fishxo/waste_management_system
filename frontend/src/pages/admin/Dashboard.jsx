import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const cards = [
  { key: 'totalResidents', label: 'Total Residents', color: 'border-l-blue-500' },
  { key: 'totalReports', label: 'Total Reports', color: 'border-l-indigo-500' },
  { key: 'pendingReports', label: 'Pending', color: 'border-l-yellow-500' },
  { key: 'inProgressReports', label: 'In Progress', color: 'border-l-orange-500' },
  { key: 'resolvedReports', label: 'Resolved', color: 'border-l-green-500' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/municipal-admin/dashboard')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`bg-white rounded-lg shadow p-5 border-l-4 ${card.color}`}
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold">{stats?.[card.key] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
