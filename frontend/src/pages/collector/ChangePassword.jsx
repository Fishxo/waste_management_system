import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const inputClass =
  'border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-400'

export default function CollectorChangePassword() {
  const { t } = useTranslation('profile')
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (form.newPassword !== form.confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    setSaving(true)
    try {
      await api.patch('/collectors/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage(t('passwordChanged'))
    } catch (err) {
      setError(err.response?.data?.message || t('failedToChangePassword'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-2">{t('changePassword')}</h2>
      <p className="text-gray-500 mb-6">
        {t('changePasswordDesc')}
      </p>

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('currentPassword')}
            </label>
            <input
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('newPassword')}
            </label>
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('confirmNewPassword')}
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
        >
          {saving ? t('updating') : t('changePassword')}
        </button>
      </form>
    </div>
  )
}