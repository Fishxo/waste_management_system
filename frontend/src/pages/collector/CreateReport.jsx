import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

export default function CreateReport() {
  const { t } = useTranslation('collector')
  const [form, setForm] = useState({ title: '', description: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [dailyCount, setDailyCount] = useState(null)

  useEffect(() => {
    api
      .get('/reports/daily-count')
      .then(({ data }) => setDailyCount(data.data || null))
      .catch(() => {})
  }, [])

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.post('/reports', form)
      const { data } = await api.get('/reports/daily-count')
      setDailyCount(data.data || null)
      setForm({ title: '', description: '' })
      setSuccess(t('reportSubmitted'))
    } catch (err) {
      setError(err.response?.data?.message || t('failedToCreateReport'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('createReportTitle')}</h2>
      <p className="text-gray-500 text-sm mb-4">
        {t('createReportIntro')}
      </p>
      <div className="bg-white rounded-lg shadow p-6 max-w-lg">
        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}
        {success && (
          <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
            {success}
          </p>
        )}
        {dailyCount && (
          <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-sky-900">
                {t('todaysReportLimit')}
              </p>
              <p className="text-sm font-semibold text-sky-700">
                {dailyCount.remaining === 0
                  ? t('limitReached')
                  : t('remainingOf', {
                      remaining: dailyCount.remaining,
                      max: dailyCount.max,
                    })}
              </p>
            </div>
            <div className="h-2 rounded-full bg-sky-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dailyCount.remaining === 0 ? 'bg-red-500' : 'bg-sky-600'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (dailyCount.used / dailyCount.max) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-sky-600 mt-2">
              {t('createUpTo', { max: dailyCount.max })}{' '}
              {dailyCount.remaining === 0
                ? t('dailyLimitReached')
                : dailyCount.remaining === 1
                ? t('oneLeft')
                : t('reportsLeft', { count: dailyCount.remaining })}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reportTitle')}
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              disabled={dailyCount?.remaining === 0}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              required
              disabled={dailyCount?.remaining === 0}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || dailyCount?.remaining === 0}
            className="bg-sky-600 hover:bg-sky-700 text-white py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading
              ? t('submitting')
              : dailyCount?.remaining === 0
              ? t('dailyLimitReachedButton')
              : t('submitReport')}
          </button>
        </form>
      </div>
    </div>
  )
}