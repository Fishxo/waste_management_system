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
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

  function formatMonth(value) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Other'
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Addis_Ababa',
      month: 'long',
    }).format(date)
  }

export default function NotificationsPage({ title = 'Notifications' }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const { refreshUnread } = useNotification()

  const loadNotifications = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .get('/notifications')
      .then(async ({ data }) => {
        const list = Array.isArray(data) ? data : data.data || []
        setNotifications(list)
        if (list.some((notification) => !notification.is_read)) {
          try {
            await api.patch('/notifications/read-all')
            setNotifications((current) =>
              current.map((notification) => ({ ...notification, is_read: true }))
            )
          } catch {
            // Keep current state; unread count refresh below reflects reality
          }
        }
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return

    setDeleting(id)
    setError('')
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications((current) => current.filter((notification) => notification.id !== id))
      refreshUnread()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notification')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all of your notifications?')) return

    setDeleting('all')
    setError('')
    try {
      await api.delete('/notifications/all')
      setNotifications([])
      refreshUnread()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete all notifications')
    } finally {
      setDeleting(null)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length
  const notificationGroups = notifications.reduce((groups, notification) => {
    const month = formatMonth(notification.created_at)
    const existing = groups.find((group) => group.month === month)
    if (existing) {
      existing.notifications.push(notification)
    } else {
      groups.push({ month, notifications: [notification] })
    }
    return groups
  }, [])

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
        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={deleting === 'all'}
              className="text-sm text-red-600 hover:text-red-800 font-medium cursor-pointer disabled:opacity-50"
            >
              {deleting === 'all' ? 'Deleting...' : 'Delete all'}
            </button>
          )}
        </div>
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
        <div className="space-y-6">
          {notificationGroups.map((group) => (
            <section key={group.month}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {group.month}
              </h3>
              <div className="space-y-3">
                {group.notifications.map((notification) => (
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
                          <h4 className="font-semibold text-gray-900">
                            {notification.title}
                          </h4>
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
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDelete(notification.id)}
                          disabled={deleting === notification.id}
                          className="text-xs text-red-600 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {deleting === notification.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
