import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

const residentLinks = [
  { to: '/resident/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/resident/profile', label: 'Profile', icon: '👤' },
  { to: '/resident/create-report', label: 'Create Report', icon: '📝' },
  { to: '/resident/my-reports', label: 'My Reports', icon: '📋' },
  { to: '/resident/schedules', label: 'Schedules', icon: '🗓️' },
  { to: '/resident/my-schedule-issues', label: 'Schedule Issues', icon: '⚠️' },
  { to: '/resident/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/resident/feedback', label: 'Feedback', icon: '💬' },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/reports', label: 'Resident Reports', icon: '📋' },
  { to: '/admin/operational-reports', label: 'Operational Reports', icon: '📈' },
  { to: '/admin/residents', label: 'Residents', icon: '👥' },
  { to: '/admin/business-owners', label: 'Business Owners', icon: '🏪' },
  { to: '/admin/schedules', label: 'Schedules', icon: '🗓️' },
  { to: '/admin/schedule-issues', label: 'Schedule Issues', icon: '⚠️' },
  { to: '/admin/on-demand-requests', label: 'On-Demand Requests', icon: '🚛' },
  { to: '/admin/collectors', label: 'Collectors', icon: '🧑‍🔧' },
  { to: '/admin/send-notifications', label: 'Send Notifications', icon: '📢' },
  { to: '/admin/feedback', label: 'Feedback', icon: '💬' },
]

const businessLinks = [
  { to: '/business/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/business/profile', label: 'Profile', icon: '👤' },
  { to: '/business/schedules', label: 'Schedules', icon: '🗓️' },
  { to: '/business/create-request', label: 'Request Collection', icon: '🚛' },
  { to: '/business/my-requests', label: 'My Requests', icon: '📋' },
  { to: '/business/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/business/feedback', label: 'Feedback', icon: '💬' },
]

const collectorLinks = [
  { to: '/collector/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/collector/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/collector/change-password', label: 'Change Password', icon: '🔑' },
]

const systemAdminLinks = [
  { to: '/system-admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/system-admin/staff', label: 'Staff', icon: '🧑‍💼' },
  { to: '/system-admin/users', label: 'Users', icon: '👥' },
  { to: '/system-admin/backup', label: 'Backup & Restore', icon: '💾' },
]

export default function Sidebar() {
  const { user } = useAuth()
  const { unreadCount } = useNotification()
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
    ? 'System Admin'
    : isAdmin
    ? 'Admin Panel'
    : isBusiness
      ? 'Business Panel'
      : isCollector
        ? 'Collector Panel'
        : 'Resident Panel'

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col p-4">
      <div className="text-lg font-bold mb-8 px-3">{panelTitle}</div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <span>{link.icon}</span>
            <span className="flex-1">{link.label}</span>
            {link.label === 'Notifications' && unreadCount > 0 && (
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
