import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const inputClass =
  'border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400'

export default function ProfileEditForm({ profile, saving, onSave, onCancel }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phoneNumber: profile.phoneNumber || '',
    kifleKetema: profile.kifleKetema || '',
    kebele: profile.kebele || '',
    sefer: profile.sefer || '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const err = await onSave(form)
    if (err) setError(err)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900">{t('profile.editTitle')}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {t('profile.updateDetails')}
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.firstName')}
          </label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.lastName')}
          </label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.email')}
        </label>
        <input
          value={profile.email || ''}
          disabled
          className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`}
        />
        <p className="text-xs text-gray-400 mt-1">{t('profile.emailCannotChange')}</p>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.phoneNumber')}
        </label>
        <input
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.kifleKetema')}
          </label>
          <input
            name="kifleKetema"
            value={form.kifleKetema}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.kebele')}
          </label>
          <input
            name="kebele"
            value={form.kebele}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.sefer')}
          </label>
          <input
            name="sefer"
            value={form.sefer}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
        >
          {saving ? t('profile.saving') : t('profile.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
        >
          {t('profile.cancel')}
        </button>
      </div>
    </form>
  )
}
