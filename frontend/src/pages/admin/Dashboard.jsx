import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Loading from '../../components/Loading'

const quickActions = [
  {
    to: '/admin/reports',
    label: 'Manage Reports',
    description: 'Review and update resident waste reports',
    icon: '📋',
    accent: 'border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50',
  },
  {
    to: '/admin/schedule-issues',
    label: 'Schedule Issues',
    description: 'Handle missed or incorrect collection schedules',
    icon: '⚠️',
    accent: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50',
  },
  {
    to: '/admin/residents',
    label: 'Residents',
    description: 'View resident accounts and activity',
    icon: '👥',
    accent: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
  },
  {
    to: '/admin/schedules',
    label: 'Schedules',
    description: 'Create and manage collection schedules',
    icon: '🗓️',
    accent: 'border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50',
  },
]

function StatCard({ label, value, hint, borderClass, textClass }) {
  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm ${borderClass}`}>
      <p className={`text-xs uppercase tracking-wide font-semibold ${textClass}`}>
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value ?? 0}</p>
      {hint && <p className="text-sm text-gray-500 mt-2">{hint}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [scheduleIssueCount, setScheduleIssueCount] = useState(0)
  const [pendingScheduleIssues, setPendingScheduleIssues] = useState(0)
  const [scheduleCount, setScheduleCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/muAdmin/dashboard'),
      api.get('/muAdmin/schedule-issues'),
      api.get('/muAdmin/schedules'),
    ])
      .then(([dashboardRes, issuesRes, schedulesRes]) => {
        setStats(dashboardRes.data.data || dashboardRes.data)
        const issues = Array.isArray(issuesRes.data)
          ? issuesRes.data
          : issuesRes.data.data || []
        setScheduleIssueCount(issues.length)
        setPendingScheduleIssues(
          issues.filter((issue) => issue.status === 'pending').length
        )
        const schedules = Array.isArray(schedulesRes.data)
          ? schedulesRes.data
          : schedulesRes.data.data || []
        setScheduleCount(schedules.length)
      })
      .catch((err) => {
        setStats(null)
        setError(err.response?.data?.message || 'Failed to load dashboard data')
      })
      .finally(() => setLoading(false))
  }, [])

  const reportBreakdown = useMemo(() => {
    const total = stats?.totalReports ?? 0
    const pending = stats?.pendingReports ?? 0
    const inProgress = stats?.inProgressReports ?? 0
    const resolved = stats?.resolvedReports ?? 0

    return {
      total,
      pending,
      inProgress,
      resolved,
      pendingPercent: total ? Math.round((pending / total) * 100) : 0,
      inProgressPercent: total ? Math.round((inProgress / total) * 100) : 0,
      resolvedPercent: total ? Math.round((resolved / total) * 100) : 0,
    }
  }, [stats])

  const needsAttention =
    (stats?.pendingReports ?? 0) > 0 || pendingScheduleIssues > 0

  if (loading) return <Loading />

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username || 'Admin'}
        </h2>
        <p className="text-gray-500 max-w-2xl">
          Overview of residents, waste reports, collection schedules, and schedule
          issues across your municipality.
        </p>
      </div>

      {error && (
        <p className="mb-6 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      {needsAttention && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-900 flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                Items need your attention
              </p>
              <p className="text-sm text-amber-800 mt-1">
                {stats?.pendingReports ?? 0} pending report(s) and{' '}
                {pendingScheduleIssues} pending schedule issue(s) waiting for review.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(stats?.pendingReports ?? 0) > 0 && (
                <Link
                  to="/admin/reports"
                  className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Review Reports
                </Link>
              )}
              {pendingScheduleIssues > 0 && (
                <Link
                  to="/admin/schedule-issues"
                  className="inline-flex items-center justify-center bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Review Schedule Issues
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Residents"
          value={stats?.totalResidents}
          hint="Registered in the system"
          borderClass="border-blue-200"
          textClass="text-blue-700"
        />
        <StatCard
          label="Total Reports"
          value={stats?.totalReports}
          hint="General waste reports submitted"
          borderClass="border-indigo-200"
          textClass="text-indigo-700"
        />
        <StatCard
          label="Schedule Issues"
          value={scheduleIssueCount}
          hint={`${pendingScheduleIssues} pending review`}
          borderClass="border-orange-200"
          textClass="text-orange-700"
        />
        <StatCard
          label="Collection Schedules"
          value={scheduleCount}
          hint="Active schedules created"
          borderClass="border-emerald-200"
          textClass="text-emerald-700"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Report Status</h3>
              <p className="text-sm text-gray-500">
                Breakdown of resident waste report progress
              </p>
            </div>
            <Link
              to="/admin/reports"
              className="text-sm text-indigo-600 hover:underline shrink-0"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-xs uppercase tracking-wide text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {reportBreakdown.pending}
              </p>
            </div>
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-4">
              <p className="text-xs uppercase tracking-wide text-orange-700">In Progress</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {reportBreakdown.inProgress}
              </p>
            </div>
            <div className="rounded-xl bg-green-50 border border-green-200 p-4">
              <p className="text-xs uppercase tracking-wide text-green-700">Resolved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {reportBreakdown.resolved}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pending</span>
              <span className="font-medium text-gray-900">
                {reportBreakdown.pendingPercent}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${reportBreakdown.pendingPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <span className="text-gray-600">In Progress</span>
              <span className="font-medium text-gray-900">
                {reportBreakdown.inProgressPercent}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all"
                style={{ width: `${reportBreakdown.inProgressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <span className="text-gray-600">Resolved</span>
              <span className="font-medium text-gray-900">
                {reportBreakdown.resolvedPercent}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${reportBreakdown.resolvedPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">At a Glance</h3>
          <p className="text-sm text-gray-500 mb-6">
            Quick summary of municipal operations
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Residents registered</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats?.totalResidents ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Reports awaiting review</span>
              <span className="text-sm font-semibold text-yellow-800">
                {stats?.pendingReports ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Reports in progress</span>
              <span className="text-sm font-semibold text-orange-800">
                {stats?.inProgressReports ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Resolved reports</span>
              <span className="text-sm font-semibold text-green-800">
                {stats?.resolvedReports ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Pending schedule issues</span>
              <span className="text-sm font-semibold text-orange-800">
                {pendingScheduleIssues}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Collection schedules</span>
              <span className="text-sm font-semibold text-gray-900">
                {scheduleCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
        <p className="text-sm text-gray-500 mb-4">
          Jump directly to the main admin management pages
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition group ${action.accent}`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition">
                {action.label}
              </h4>
              <p className="text-sm text-gray-500 mt-2">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
