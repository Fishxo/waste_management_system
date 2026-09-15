import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'
import Toast from '../resident/profile/Toast'
import {
  normalizeBusinessProfile,
  formatDate,
  BUSINESS_TYPES,
} from './profileUtils'

const inputClass =
  'border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-400'

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm text-right ${
          value ? 'text-gray-900 font-medium' : 'text-gray-400 italic'
        }`}
      >
        {value || 'Not provided'}
      </span>
    </div>
  )
}

export default function BusinessProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({})
  const [formError, setFormError] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/businessOwners/profile')
      const normalized = normalizeBusinessProfile(data?.data || {})
      setProfile(normalized)
      setForm({
        businessName: normalized.businessName,
        ownerName: normalized.ownerName,
        phoneNumber: normalized.phoneNumber,
        address: normalized.address,
        businessType: normalized.businessType,
        kebele: normalized.kebele,
        kifleKetema: normalized.kifleKetema,
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'We could not load your profile. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const { data } = await api.patch('/businessOwners/profile', form)
      setProfile(normalizeBusinessProfile(data?.data || {}))
      setIsEditing(false)
      setToast({ message: 'Profile updated successfully', type: 'success' })
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          'Failed to update profile. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match')
      return
    }

    setPasswordSaving(true)
    try {
      await api.patch('/businessOwners/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setToast({ message: 'Password changed successfully', type: 'success' })
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || 'Failed to change password'
      )
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Unable to load profile
          </h2>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button
            onClick={loadProfile}
            className="mt-5 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const initials = (profile.ownerName || profile.businessName || '?')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-amber-600 text-white flex items-center justify-center text-3xl font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {profile.businessName}
              </h1>
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
                Business Owner
              </span>
              {profile.businessCode && (
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                  {profile.businessCode}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-1">{profile.ownerName}</p>
            <p className="text-gray-500 text-sm mt-0.5">
              {profile.email || 'Not provided'}
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer shrink-0"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">
              {formError}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={handleFormChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name
              </label>
              <input
                name="ownerName"
                value={form.ownerName}
                onChange={handleFormChange}
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              value={profile.email || ''}
              disabled
              className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleFormChange}
              required
              className={inputClass}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <select
              name="businessType"
              value={form.businessType}
              onChange={handleFormChange}
              required
              className={inputClass}
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleFormChange}
              required
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kifle Ketema
              </label>
              <input
                name="kifleKetema"
                value={form.kifleKetema}
                onChange={handleFormChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kebele
              </label>
              <input
                name="kebele"
                value={form.kebele}
                onChange={handleFormChange}
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={saving}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h2>
            <div className="mt-2">
              <InfoRow label="Business Name" value={profile.businessName} />
              <InfoRow label="Business Code" value={profile.businessCode} />
              <InfoRow label="Owner Name" value={profile.ownerName} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Phone Number" value={profile.phoneNumber} />
              <InfoRow label="Business Type" value={profile.businessType} />
              <InfoRow label="Address" value={profile.address} />
              <InfoRow label="Kifle Ketema" value={profile.kifleKetema} />
              <InfoRow label="Kebele" value={profile.kebele} />
              <InfoRow
                label="Registration Date"
                value={formatDate(profile.registrationDate)}
              />
            </div>
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Change Password
            </h2>
            {passwordError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">
                {passwordError}
              </p>
            )}
            <div className="max-w-sm space-y-4 mt-4">
              <input
                name="currentPassword"
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className={inputClass}
              />
              <input
                name="newPassword"
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className={inputClass}
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={passwordSaving}
              className="mt-6 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              {passwordSaving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
