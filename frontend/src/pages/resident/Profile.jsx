import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { normalizeProfile } from './profile/profileUtils'
import ProfileHeader from './profile/ProfileHeader'
import ProfileInfoCard from './profile/ProfileInfoCard'
import ProfileEditForm from './profile/ProfileEditForm'
import ProfilePasswordCard from './profile/ProfilePasswordCard'
import ProfileSkeleton from './profile/ProfileSkeleton'
import Toast from './profile/Toast'

export default function Profile() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/residents/profile')
      setProfile(normalizeProfile(data?.data || {}))
    } catch (err) {
      setError(
        err.response?.data?.message || t('profile.failedToLoadProfile')
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

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      const { data } = await api.patch('/residents/profile', formData)
      setProfile(normalizeProfile(data?.data || {}))
      setIsEditing(false)
      setToast({ message: t('profile.profileUpdated'), type: 'success' })
      return null
    } catch (err) {
      return (
        err.response?.data?.message || t('profile.failedToUpdate')
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <ProfileSkeleton />

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold mb-4">
            !
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t('profile.unableToLoad')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button
            onClick={loadProfile}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
          >
            {t('profile.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ProfileHeader
        profile={profile}
        onEdit={() => setIsEditing(true)}
      />

      {isEditing ? (
        <ProfileEditForm
          profile={profile}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <ProfileInfoCard profile={profile} />
          <ProfilePasswordCard
            onSuccess={(message) =>
              setToast({ message, type: 'success' })
            }
          />
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
