import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import Loading from '../../components/Loading'
import LocationMapPicker from '../../components/LocationMapPicker'

const approvalBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const collectionBadge = {
  unassigned: 'bg-gray-100 text-gray-600',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
}

function formatStatus(status, t) {
  if (!status) return '—'
  return t(`common.${status === 'in_progress' ? 'inProgress' : status}`)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MyOnDemandRequests() {
  const { t } = useTranslation('onDemand')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [confirming, setConfirming] = useState(null)
  const [issueTarget, setIssueTarget] = useState(null)
  const [issueDescription, setIssueDescription] = useState('')
  const [raisingIssue, setRaisingIssue] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [editDescription, setEditDescription] = useState('')
  const [editLatitude, setEditLatitude] = useState('')
  const [editLongitude, setEditLongitude] = useState('')
  const [editing, setEditing] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadRequests = () => {
    setLoading(true)
    api
      .get('/onDemandRequests')
      .then(({ data }) => {
        setRequests(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || t('failedToLoad'))
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRequests()
  }, [t])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const handleConfirm = async (requestId) => {
    setConfirming(requestId)
    setError('')
    try {
      await api.patch(`/onDemandRequests/${requestId}/confirm`)
      setMessage(t('collectionConfirmed'))
      loadRequests()
    } catch (err) {
      setError(err.response?.data?.message || t('failedToConfirm'))
    } finally {
      setConfirming(null)
    }
  }

  const handleRaiseIssue = async () => {
    if (!issueTarget || !issueDescription.trim()) return
    setRaisingIssue(true)
    setError('')
    try {
      await api.post(`/onDemandRequests/${issueTarget.id}/issues`, {
        description: issueDescription.trim(),
      })
      setIssueTarget(null)
      setIssueDescription('')
      setMessage(t('issueRaisedSuccess'))
      loadRequests()
    } catch (err) {
      setError(err.response?.data?.message || t('failedToRaiseIssue'))
    } finally {
      setRaisingIssue(false)
    }
  }

  const openEditModal = (request) => {
    setEditTarget(request)
    setEditDescription(request.description || '')
    setEditLatitude(String(request.latitude))
    setEditLongitude(String(request.longitude))
    setError('')
  }

  const handleUpdate = async () => {
    if (!editTarget) return
    setEditing(true)
    setError('')
    try {
      await api.patch(`/onDemandRequests/${editTarget.id}`, {
        latitude: Number(editLatitude),
        longitude: Number(editLongitude),
        description: editDescription,
      })
      setEditTarget(null)
      setMessage(t('requestUpdated'))
      loadRequests()
    } catch (err) {
      setError(err.response?.data?.message || t('failedToUpdate'))
    } finally {
      setEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/onDemandRequests/${deleteTarget.id}`)
      setDeleteTarget(null)
      setMessage(t('requestRemoved'))
      loadRequests()
    } catch (err) {
      setError(err.response?.data?.message || t('failedToDelete'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('myRequests')}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {t('myRequestsIntro')}
          </p>
        </div>
        <Link
          to="/business/create-request"
          className="inline-flex justify-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {t('newRequest')}
        </Link>
      </div>

      {message && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <Loading />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">🚛</div>
          <p className="text-gray-600">{t('noRequests')}</p>
          <Link
            to="/business/create-request"
            className="inline-block mt-4 text-amber-700 font-medium hover:underline"
          >
            {t('submitFirst')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {t('requestNumber', { id: request.id })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(request.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      approvalBadge[request.status] ||
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {formatStatus(request.status, t)}
                  </span>
                  {request.status === 'approved' && request.collection_status && (
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        collectionBadge[request.collection_status] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {formatStatus(request.collection_status, t)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="text-gray-400">{t('location')}</span>{' '}
                  {Number(request.latitude).toFixed(5)},{' '}
                  {Number(request.longitude).toFixed(5)}
                </p>
                {request.collector_name && (
                  <p>
                    <span className="text-gray-400">{t('collector')}</span>{' '}
                    {request.collector_name}
                  </p>
                )}
                {request.description && (
                  <p className="pt-2 border-t border-gray-100 mt-2 whitespace-pre-wrap">
                    {request.description}
                  </p>
                )}
                {request.admin_notes && (
                  <p className="pt-2 text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mt-2">
                    <span className="font-medium">{t('adminNote')}</span>{' '}
                    {request.admin_notes}
                  </p>
                )}
                {request.collector_notes && (
                  <p className="pt-2 text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mt-2">
                    <span className="font-medium">{t('collectorNote')}</span>{' '}
                    {request.collector_notes}
                  </p>
                )}
                {request.completed_at && (
                  <p className="text-xs text-gray-400 pt-1">
                    {t('completed', { date: formatDate(request.completed_at) })}
                  </p>
                )}
                {request.confirmed_at && (
                  <p className="text-xs text-emerald-600 pt-1 font-medium">
                    {t('confirmed', { date: formatDate(request.confirmed_at) })}
                  </p>
                )}
                {request.issue_description && (
                  <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 mt-2">
                    <span className="font-medium">{t('issueRaised')}</span>{' '}
                    {request.issue_description}
                  </p>
                )}
              </div>

              {request.status === 'approved' &&
                request.collection_status === 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(request.id)}
                    disabled={confirming === request.id}
                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                  >
                    {confirming === request.id
                      ? t('confirming')
                      : t('confirmCollection')}
                  </button>
                )}
              {request.status === 'approved' && request.collection_status === 'completed' && !request.issue_description && (
                <button
                  type="button"
                  onClick={() => setIssueTarget(request)}
                  className="mt-2 w-full bg-white border border-red-200 text-red-700 hover:bg-red-50 py-2 rounded-lg text-sm font-medium cursor-pointer"
                >
                  {t('raiseIssue')}
                </button>
              )}
              {request.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => openEditModal(request)}
                  className="mt-4 w-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 py-2 rounded-lg text-sm font-medium cursor-pointer"
                >
                  {t('editRequest')}
                </button>
              )}
              {(request.status === 'pending' || request.collection_status === 'confirmed') && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(request)}
                  className="mt-2 w-full bg-white border border-red-200 text-red-700 hover:bg-red-50 py-2 rounded-lg text-sm font-medium cursor-pointer"
                >
                  {t('deleteRequest')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {issueTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900">{t('raiseIssueTitle')}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {t('raiseIssueIntro')}
            </p>
            <textarea
              rows={4}
              value={issueDescription}
              onChange={(event) => setIssueDescription(event.target.value)}
              maxLength={1000}
              className="mt-4 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder={t('issuePlaceholder')}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setIssueTarget(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm cursor-pointer">
                {t('cancel')}
              </button>
              <button type="button" onClick={handleRaiseIssue} disabled={raisingIssue || !issueDescription.trim()} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-50 cursor-pointer">
                {raisingIssue ? t('submitting') : t('submitIssue')}
              </button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('editRequestTitle', { id: editTarget.id })}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {t('editIntro')}
            </p>
            <div className="mt-4">
              <LocationMapPicker
                latitude={editLatitude}
                longitude={editLongitude}
                onLocationChange={(lat, lng) => {
                  setEditLatitude(lat)
                  setEditLongitude(lng)
                }}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('descriptionOptional')}
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                maxLength={1000}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder={t('descriptionPlaceholder')}
              />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={editing || !editLatitude || !editLongitude}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm disabled:opacity-50 cursor-pointer"
              >
                {editing ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('deleteTitle', { id: deleteTarget.id })}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {t('deleteIntro')}
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm disabled:opacity-50 cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-50 cursor-pointer"
              >
                {deleting ? t('deleting') : t('deleteRequest')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
