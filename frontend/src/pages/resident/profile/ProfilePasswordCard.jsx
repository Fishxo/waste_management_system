import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../../api/axios'

const inputClass =
  'border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400'

export default function ProfilePasswordCard({ onSuccess }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.newPassword !== form.confirmPassword) {
      setError(t('profile.passwordMismatch'))
      return
    }

    setSaving(true)
    try {
      await api.patch('/residents/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      onSuccess(t('profile.passwordChanged'))
    } catch (err) {
      setError(err.response?.data?.message || t('profile.failedToChangePassword'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6"
    >
      <h2 className="text-lg font-semibold text-gray-900">{t('profile.changePassword')}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {t('profile.changePasswordDesc')}
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.currentPassword')}
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
            {t('profile.newPassword')}
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
            {t('profile.confirmNewPassword')}
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
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
      >
        {saving ? t('profile.updating') : t('profile.changePassword')}
      </button>
    </form>
  )
}
