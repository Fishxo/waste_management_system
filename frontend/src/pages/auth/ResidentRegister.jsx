import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import PasswordInput from '../../components/PasswordInput'

const LOCATION_DATA = {
  Abema: ['1', '2', '3', '4'],
  Menkorer: ['1', '2', '3', '4'],
  'Negus Teklehaymanot': ['1', '2', '3', '4'],
  'Tedla Gualu': ['1', '2', '3', '4', '5'],
}
const SEFER_OPTIONS = ['1', '2', '3', '4']
const SELECT_CLASS =
  'border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400'

export default function ResidentRegister() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    kifleKetema: '',
    kebele: '',
    sefer: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleLocationChange = (e) => {
    const { name, value } = e.target
    if (name === 'kifleKetema') {
      setForm((prev) => ({ ...prev, kifleKetema: value, kebele: '', sefer: '' }))
    } else if (name === 'kebele') {
      setForm((prev) => ({ ...prev, kebele: value, sefer: '' }))
    } else {
      setForm((prev) => ({ ...prev, sefer: value }))
    }
  }

  const kebeleOptions = form.kifleKetema
    ? LOCATION_DATA[form.kifleKetema] || []
    : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register/resident', form)
      navigate('/resident/login')
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string'
          ? err.response.data
          : 'Registration failed')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Resident Registration
        </h2>
        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <input
            name="email"
            type="email"
            placeholder="Email"
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
          <input
            name="phoneNumber"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            name="kifleKetema"
            value={form.kifleKetema}
            onChange={handleLocationChange}
            required
            className={SELECT_CLASS}
          >
            <option value="">Select Kifle Ketema</option>
            {Object.keys(LOCATION_DATA).map((kk) => (
              <option key={kk} value={kk}>
                {kk}
              </option>
            ))}
          </select>
          <select
            name="kebele"
            value={form.kebele}
            onChange={handleLocationChange}
            required
            disabled={!form.kifleKetema}
            className={SELECT_CLASS}
          >
            <option value="">Select Kebele</option>
            {kebeleOptions.map((k) => (
              <option key={k} value={k}>
                Kebele {k}
              </option>
            ))}
          </select>
          <select
            name="sefer"
            value={form.sefer}
            onChange={handleLocationChange}
            required
            disabled={!form.kebele}
            className={SELECT_CLASS}
          >
            <option value="">Select Sefer</option>
            {SEFER_OPTIONS.map((s) => (
              <option key={s} value={s}>
                Sefer {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link to="/resident/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
