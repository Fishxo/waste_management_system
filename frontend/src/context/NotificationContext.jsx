import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const NOTIFICATION_ROLES = ['resident', 'business_owner', 'collector']

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnread = useCallback(async () => {
    if (!user || !NOTIFICATION_ROLES.includes(user.role)) return
    try {
      const { data } = await api.get('/notifications/unread-count')
      setUnreadCount(typeof data.count === 'number' ? data.count : 0)
    } catch {
      setUnreadCount(0)
    }
  }, [user])

  useEffect(() => {
    setUnreadCount(0)
    refreshUnread()
  }, [refreshUnread])

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)