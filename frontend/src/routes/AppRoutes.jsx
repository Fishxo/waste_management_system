import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

import Welcome from '../pages/Welcome'
import ResidentLogin from '../pages/auth/ResidentLogin'
import ResidentRegister from '../pages/auth/ResidentRegister'
import AdminLogin from '../pages/auth/AdminLogin'

import ResidentDashboard from '../pages/resident/Dashboard'
import ResidentProfile from '../pages/resident/Profile'
import CreateReport from '../pages/resident/CreateReport'
import MyReports from '../pages/resident/MyReports'
import ReportDetails from '../pages/resident/ReportDetails'
import UpdateReport from '../pages/resident/UpdateReport'
import ResidentSchedules from '../pages/resident/Schedules'
import MyScheduleIssues from '../pages/resident/MyScheduleIssues'

import AdminDashboard from '../pages/admin/Dashboard'
import AdminReports from '../pages/admin/Reports'
import AdminResidents from '../pages/admin/Residents'
import AdminSchedules from '../pages/admin/Schedules'
import AdminScheduleIssues from '../pages/admin/ScheduleIssues'

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/resident/login" element={<ResidentLogin />} />
      <Route path="/resident/register" element={<ResidentRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/resident/dashboard"
        element={
          <ProtectedRoute role="resident">
            <DashboardLayout>
              <ResidentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/profile"
        element={
          <ProtectedRoute role="resident">
            <DashboardLayout>
              <ResidentProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/create-report"
        element={
          <ProtectedRoute role="resident">
            <DashboardLayout>
              <CreateReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/my-reports"
        element={
          <ProtectedRoute role="resident">
            <DashboardLayout>
              <MyReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/my-reports/:id"
        element={
          <ProtectedRoute role="resident">
            <DashboardLayout>
              <ReportDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/my-reports/:id/edit"
        element={
          <ProtectedRoute role="resident">
            <DashboardLayout>
              <UpdateReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/schedules"
        element={
          <ProtectedRoute role="resident">
            <DashboardLayout>
              <ResidentSchedules />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/my-schedule-issues"
        element={
          <ProtectedRoute role="resident">
            <DashboardLayout>
              <MyScheduleIssues />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/residents"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminResidents />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schedules"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminSchedules />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schedule-issues"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminScheduleIssues />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
