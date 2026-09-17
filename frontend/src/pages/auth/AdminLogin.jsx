import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import PasswordInput from '../../components/PasswordInput'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
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

    console.log('Admin login email:', form.email)
    console.log('Admin login password provided:', !!form.password)

    try {
      const { data } = await api.post('/muAdmin/login', form)
      console.log('Admin login API response:', data)

      const res = data.data || data
      login(
        {
          id: res.id,
          username: res.username,
          email: res.email,
          kifleKetema: res.kifleKetema,
          role: 'municipal_admin',
        },
        res.token
      )

      console.log('Stored token:', res.token)
      console.log('Stored user role:', 'municipal_admin')

      navigate('/admin/dashboard')
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? t('auth.invalidCredentials')
          : t('auth.loginFailed'))
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">{t('auth.adminLogin')}</h2>
        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder={t('auth.email')}
            value={form.email}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <PasswordInput
            value={form.password}
            onChange={handleChange}
            className="focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>
      </div>
    </div>
  )
}
