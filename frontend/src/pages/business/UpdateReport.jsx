import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import Loading from '../../components/Loading'

export default function UpdateReport() {
  const { id } = useParams()
  const { t } = useTranslation('business')
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    api
      .get(`/reports/${id}`)
      .then(({ data }) => {
        const report = data.data || data.report || data
        if (report.status !== 'pending') {
          setError(t('onlyPendingEditable'))
          return
        }
        setForm({ title: report.title || '', description: report.description || '' })
      })
      .catch((err) => setError(err.response?.data?.message || t('failedToLoadReport')))
      .finally(() => setLoading(false))
  }, [id, t])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await api.put(`/reports/${id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
      })
      setMessage(t('reportUpdated'))
    } catch (err) {
      setError(err.response?.data?.message || t('failedToUpdateReport'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <Link to="/business/my-reports" className="text-amber-700 hover:underline text-sm mb-4 inline-block">
        {t('backToMyReports')}
      </Link>
      <h2 className="text-2xl font-bold mb-6">{t('updateReportBtn')}</h2>
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg">
        {message && <p className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm mb-4">{message}</p>}
        {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm mb-4">{error}</p>}
        {!error && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportTitle')}</label>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded text-sm font-medium disabled:opacity-50 cursor-pointer">
                {saving ? t('updating') : t('updateReportBtn')}
              </button>
              <button type="button" onClick={() => navigate('/business/my-reports')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded text-sm font-medium cursor-pointer">
                {t('cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
