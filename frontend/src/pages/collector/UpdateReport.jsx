import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/Loading'

export default function UpdateReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/reports/${id}`)
      .then(({ data }) => {
        const report = data.data || data.report || data
        setForm({
          title: report.title || '',
          description: report.description || '',
        })
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load report')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.title.trim()) {
      nextErrors.title = 'Title is required'
    } else if (form.title.trim().length < 3) {
      nextErrors.title = 'Title should be at least 3 characters'
    } else if (!/[a-zA-Z]/.test(form.title)) {
      nextErrors.title = 'Title must contain at least one letter'
    }

    if (!form.description.trim()) {
      nextErrors.description = 'Description is required'
    } else if (form.description.trim().length < 10) {
      nextErrors.description = 'Description should be at least 10 characters'
    } else if (!/[a-zA-Z]/.test(form.description)) {
      nextErrors.description = 'Description must contain at least one letter'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    if (!validate()) return
    setSaving(true)
    try {
      await api.put(`/reports/${id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
      })
      setMessage('Report updated successfully')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update report'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <Link
        to="/collector/reports"
        className="text-sky-600 hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to My Reports
      </Link>
      <h2 className="text-2xl font-bold mb-6">Update Report</h2>

      <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm mb-4">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                errors.title
                  ? 'border-red-300 focus:ring-red-300'
                  : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className={`border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none ${
                errors.description
                  ? 'border-red-300 focus:ring-red-300'
                  : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-600 text-xs mt-1">{errors.description}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded text-sm font-medium disabled:opacity-50 cursor-pointer sm:w-auto w-full"
            >
              {saving ? 'Updating...' : 'Update Report'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/collector/reports')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded text-sm font-medium cursor-pointer sm:w-auto w-full"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}