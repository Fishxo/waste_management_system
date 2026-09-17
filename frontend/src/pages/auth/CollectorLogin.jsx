import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import PasswordInput from '../../components/PasswordInput'

export default function CollectorLogin() {
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/collectors/login', form)
      const collector = data.data || {}
      login(
        {
          id: collector.id,
          fullName: collector.full_name,
          email: collector.email,
          phoneNumber: collector.phone_number,
          kifleKetema: collector.kifle_ketema,
          role: 'collector',
        },
        data.token
      )
      navigate('/collector/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || t('auth.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">{t('auth.collectorLogin')}</h2>
        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="identifier"
            type="text"
            placeholder={t('auth.emailOrPhone')}
            value={form.identifier}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <PasswordInput
            value={form.password}
            onChange={handleChange}
            className="focus:ring-teal-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-500">
          {t('auth.accountsCreatedByAdmin')}
        </p>
      </div>
    </div>
  )
}
