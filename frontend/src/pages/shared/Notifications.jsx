import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'
import { useNotification } from '../../context/NotificationContext'

const typeBadge = {
  schedule_update: 'bg-indigo-100 text-indigo-800',
  request_approved: 'bg-green-100 text-green-800',
  collector_assigned: 'bg-blue-100 text-blue-800',
  collection_completed: 'bg-purple-100 text-purple-800',
  manual: 'bg-amber-100 text-amber-800',
}

function formatType(type) {
  if (!type) return 'Notification'
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotificationsPage({ title = 'Notifications' }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [marking, setMarking] = useState(null)
  const { refreshUnread } = useNotification()

  const loadNotifications = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .get('/notifications')
      .then(({ data }) => {
        setNotifications(Array.isArray(data) ? data : data.data || [])
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load notifications')
      )
      .finally(() => {
        setLoading(false)
        refreshUnread()
      })
  }, [refreshUnread])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const handleMarkRead = async (id) => {
    setMarking(id)
    try {
      await api.patch(`/notifications/${id}/read`)
      loadNotifications()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as read')
    } finally {
      setMarking(null)
    }
  }

  const handleMarkAllRead = async () => {
    setMarking('all')
    try {
      await api.patch('/notifications/read-all')
      loadNotifications()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all as read')
    } finally {
      setMarking(null)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You are all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={marking === 'all'}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer disabled:opacity-50"
          >
            {marking === 'all' ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <Loading />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-gray-600">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm border p-4 ${
                notification.is_read
                  ? 'border-gray-200'
                  : 'border-indigo-200 bg-indigo-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    
                    {!notification.is_read && (
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(notification.id)}
                    disabled={marking === notification.id}
                    className="text-xs text-indigo-600 hover:underline shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {marking === notification.id ? '...' : 'Mark read'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
