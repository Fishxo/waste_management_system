import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
}

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/reports')
      .then(({ data }) => {
        setReports(data.data || data.reports || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Reports</h2>
      {reports.length === 0 ? (
        <p className="text-gray-500">No reports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-sm">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id || report._id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">{report.title}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{report.description}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        statusBadge[report.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {report.status?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {report.created_at
                      ? new Date(report.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/resident/my-reports/${report.id || report._id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      View
                    </Link>
                    {report.status === 'pending' && (
                      <>
                        {' '}
                        <Link
                          to={`/resident/my-reports/${report.id || report._id}/edit`}
                          className="text-indigo-600 hover:underline"
                        >
                          Edit
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
