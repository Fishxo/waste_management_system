import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const residentLinks = [
  { to: '/resident/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/resident/profile', label: 'Profile', icon: '👤' },
  { to: '/resident/create-report', label: 'Create Report', icon: '📝' },
  { to: '/resident/my-reports', label: 'My Reports', icon: '📋' },
  { to: '/resident/schedules', label: 'Schedules', icon: '🗓️' },
  { to: '/resident/my-schedule-issues', label: 'Schedule Issues', icon: '⚠️' },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/reports', label: 'Reports', icon: '📋' },
  { to: '/admin/residents', label: 'Residents', icon: '👥' },
  { to: '/admin/schedules', label: 'Schedules', icon: '🗓️' },
  { to: '/admin/schedule-issues', label: 'Schedule Issues', icon: '⚠️' },
]

export default function Sidebar() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'municipal_admin'
  const links = isAdmin ? adminLinks : residentLinks

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col p-4">
      <div className="text-lg font-bold mb-8 px-3">
        {isAdmin ? 'Admin Panel' : 'Resident Panel'}
      </div>
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
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
