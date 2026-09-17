import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import LanguageSelector from './LanguageSelector'

const residentLinks = [
  { to: '/resident/dashboard', key: 'dashboard', icon: '📊' },
  { to: '/resident/profile', key: 'profile', icon: '👤' },
  { to: '/resident/create-report', key: 'createReport', icon: '📝' },
  { to: '/resident/my-reports', key: 'myReports', icon: '📋' },
  { to: '/resident/schedules', key: 'schedules', icon: '🗓️' },
  { to: '/resident/my-schedule-issues', key: 'scheduleIssues', icon: '⚠️' },
  {
    to: '/resident/notifications',
    key: 'notifications',
    icon: '🔔',
    hasBadge: true,
  },
  { to: '/resident/feedback', key: 'feedback', icon: '💬' },
]

const adminLinks = [
  { to: '/admin/dashboard', key: 'dashboard', icon: '📊' },
  { to: '/admin/reports', key: 'residentReports', icon: '📋' },
  { to: '/admin/operational-reports', key: 'operationalReports', icon: '📈' },
  { to: '/admin/residents', key: 'residents', icon: '👥' },
  { to: '/admin/business-owners', key: 'businessOwners', icon: '🏪' },
  { to: '/admin/schedules', key: 'schedules', icon: '🗓️' },
  { to: '/admin/schedule-issues', key: 'scheduleIssues', icon: '⚠️' },
  { to: '/admin/on-demand-requests', key: 'onDemandRequests', icon: '🚛' },
  { to: '/admin/collectors', key: 'collectors', icon: '🧑‍🔧' },
  { to: '/admin/send-notifications', key: 'sendNotifications', icon: '📢' },
  { to: '/admin/notification-history', key: 'notificationHistory', icon: '📜' },
  { to: '/admin/feedback', key: 'feedback', icon: '💬' },
  { to: '/admin/messages', key: 'messageSystemAdmin', icon: '✉️' },
  { to: '/admin/delete-requests', key: 'deleteRequests', icon: '🗑️' },
]

const businessLinks = [
  { to: '/business/dashboard', key: 'dashboard', icon: '📊' },
  { to: '/business/profile', key: 'profile', icon: '👤' },
  { to: '/business/create-report', key: 'createReport', icon: '📝' },
  { to: '/business/my-reports', key: 'myReports', icon: '📋' },
  { to: '/business/schedules', key: 'schedules', icon: '🗓️' },
  { to: '/business/schedule-issues', key: 'raisedIssues', icon: '⚠️' },
  { to: '/business/create-request', key: 'requestCollection', icon: '🚛' },
  { to: '/business/my-requests', key: 'myRequests', icon: '📋' },
  {
    to: '/business/notifications',
    key: 'notifications',
    icon: '🔔',
    hasBadge: true,
  },
  { to: '/business/feedback', key: 'feedback', icon: '💬' },
]

const collectorLinks = [
  { to: '/collector/dashboard', key: 'dashboard', icon: '📊' },
  { to: '/collector/schedules', key: 'schedules', icon: '🗓️' },
  { to: '/collector/on-demand-requests', key: 'assignedRequests', icon: '🚛' },
  { to: '/collector/reports/create', key: 'createReport', icon: '📝' },
  {
    to: '/collector/reports',
    key: 'myReports',
    icon: '📋',
    isActive: (pathname) =>
      pathname === '/collector/reports' ||
      (pathname.startsWith('/collector/reports/') &&
        !pathname.startsWith('/collector/reports/create')),
  },
  {
    to: '/collector/notifications',
    key: 'notifications',
    icon: '🔔',
    hasBadge: true,
  },
  { to: '/collector/change-password', key: 'changePassword', icon: '🔑' },
]

const systemAdminLinks = [
  { to: '/system-admin/dashboard', key: 'dashboard', icon: '📊' },
  { to: '/system-admin/staff', key: 'staff', icon: '🧑‍💼' },
  { to: '/system-admin/users', key: 'users', icon: '👥' },
  { to: '/system-admin/reports', key: 'reports', icon: '📋' },
  { to: '/system-admin/feedback', key: 'systemFeedback', icon: '💬' },
  { to: '/system-admin/activity-logs', key: 'activityLog', icon: '📜' },
  { to: '/system-admin/messages', key: 'adminMessages', icon: '✉️' },
  { to: '/system-admin/delete-requests', key: 'deleteRequests', icon: '🗑️' },
  { to: '/system-admin/backup', key: 'backupRestore', icon: '💾' },
]

export default function Sidebar() {
  const { user } = useAuth()
  const { unreadCount } = useNotification()
  const { t } = useTranslation()
  const location = useLocation()
  const isAdmin = user?.role === 'municipal_admin'
  const isSystemAdmin = user?.role === 'system_admin'
  const isBusiness = user?.role === 'business_owner'
  const isCollector = user?.role === 'collector'
  const links = isSystemAdmin
    ? systemAdminLinks
    : isAdmin
    ? adminLinks
    : isBusiness
      ? businessLinks
      : isCollector
        ? collectorLinks
        : residentLinks

  const panelTitle = isSystemAdmin
    ? t('sidebar.systemAdminPanel')
    : isAdmin
    ? t('sidebar.adminPanel')
    : isBusiness
      ? t('sidebar.businessPanel')
      : isCollector
        ? t('sidebar.collectorPanel')
        : t('sidebar.residentPanel')

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col p-4">
      <div className="flex items-center justify-between mb-8 px-3">
        <div className="text-lg font-bold">{panelTitle}</div>
        <LanguageSelector className="bg-gray-800 text-gray-200 border border-gray-700" />
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => {
              const active = link.isActive
                ? link.isActive(location.pathname)
                : isActive
              return `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }}
          >
            <span>{link.icon}</span>
            <span className="flex-1">{t(`sidebar.${link.key}`)}</span>
            {link.hasBadge && unreadCount > 0 && (
              <span className="min-w-[1.4rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}