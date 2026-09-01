import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

function formatBytes(bytes) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = Number(bytes)
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size.toFixed(1)} ${units[unit]}`
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function SystemAdminBackup() {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [restoreFile, setRestoreFile] = useState(null)

  const fetchBackups = () => {
    setLoading(true)
    api
      .get('/systemAdmin/backups')
      .then(({ data }) => setBackups(data.data || []))
      .catch(() => setBackups([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 5000)
    return () => clearTimeout(timer)
  }, [message])

  const handleCreateBackup = async () => {
    setCreating(true)
    setError('')
    try {
      await api.post('/systemAdmin/backup')
      setMessage('Database backup created successfully')
      fetchBackups()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create backup')
    } finally {
      setCreating(false)
    }
  }

  const handleDownload = async (id, filename) => {
    try {
      const response = await api.get(`/systemAdmin/backups/${id}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to download backup')
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    setRestoreFile(file || null)
    setConfirmRestore(false)
  }

  const handleRestore = async () => {
    if (!restoreFile) return
    setRestoring(true)
    setError('')
    try {
      const sql = await restoreFile.text()
      await api.post('/systemAdmin/restore', { sql })
      setMessage(
        'Database restored successfully. A pre-restore backup was saved automatically.'
      )
      setRestoreFile(null)
      setConfirmRestore(false)
      fetchBackups()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore database')
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Database Backup & Restore</h2>
      <p className="text-gray-500 mb-6">
        Create PostgreSQL backups and restore from SQL dump files. Restore
        automatically creates a pre-restore backup.
      </p>

      {message && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Create Backup</h3>
          <p className="text-sm text-gray-500 mb-4">
            Runs pg_dump against the current database and stores the file on the
            server.
          </p>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            {creating ? 'Creating backup...' : 'Create Backup Now'}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h3 className="font-semibold text-red-900 mb-2">Restore Database</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload a .sql backup file. This will overwrite current data. A
            safety backup is created first.
          </p>
          <input
            type="file"
            accept=".sql"
            onChange={handleFileSelect}
            className="text-sm mb-4 block w-full"
          />
          {restoreFile && !confirmRestore && (
            <button
              onClick={() => setConfirmRestore(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
            >
              Restore from {restoreFile.name}
            </button>
          )}
          {confirmRestore && (
            <div className="mt-2">
              <p className="text-sm text-red-800 mb-3">
                This will replace all current database data. Are you sure?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRestore}
                  disabled={restoring}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {restoring ? 'Restoring...' : 'Yes, Restore'}
                </button>
                <button
                  onClick={() => setConfirmRestore(false)}
                  disabled={restoring}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Backup History</h3>
        {loading ? (
          <Loading />
        ) : backups.length === 0 ? (
          <p className="text-gray-500 text-sm">No backups created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3">Filename</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{b.filename}</td>
                    <td className="px-4 py-3">{formatBytes(b.size_bytes)}</td>
                    <td className="px-4 py-3">
                      {b.created_by_username || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(b.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownload(b.id, b.filename)}
                        className="text-violet-600 hover:underline cursor-pointer"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
