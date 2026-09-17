import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

import Welcome from '../pages/Welcome'
import StaffPortal from '../pages/StaffPortal'
import ResidentLogin from '../pages/auth/ResidentLogin'
import ResidentRegister from '../pages/auth/ResidentRegister'
import BusinessOwnerLogin from '../pages/auth/BusinessOwnerLogin'
import BusinessOwnerRegister from '../pages/auth/BusinessOwnerRegister'
import AdminLogin from '../pages/auth/AdminLogin'
import SystemAdminLogin from '../pages/auth/SystemAdminLogin'

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
import AdminOperationalReports from '../pages/admin/OperationalReports'
import AdminResidents from '../pages/admin/Residents'
import AdminBusinessOwners from '../pages/admin/BusinessOwners'
import AdminSchedules from '../pages/admin/Schedules'
import AdminScheduleIssues from '../pages/admin/ScheduleIssues'
import AdminOnDemandRequests from '../pages/admin/OnDemandRequests'
import AdminCollectors from '../pages/admin/Collectors'
import CollectorLogin from '../pages/auth/CollectorLogin'
import CollectorDashboard from '../pages/collector/Dashboard'
import CollectorChangePassword from '../pages/collector/ChangePassword'
import CollectorCreateReport from '../pages/collector/CreateReport'
import CollectorMyReports from '../pages/collector/MyReports'
import CollectorReportDetails from '../pages/collector/ReportDetails'
import CollectorUpdateReport from '../pages/collector/UpdateReport'
import BusinessDashboard from '../pages/business/Dashboard'
import BusinessProfile from '../pages/business/Profile'
import BusinessSchedules from '../pages/business/Schedules'
import BusinessScheduleIssues from '../pages/business/ScheduleIssues'
import CreateOnDemandRequest from '../pages/business/CreateOnDemandRequest'
import MyOnDemandRequests from '../pages/business/MyOnDemandRequests'
import BusinessCreateReport from '../pages/business/CreateReport'
import BusinessMyReports from '../pages/business/MyReports'
import BusinessUpdateReport from '../pages/business/UpdateReport'
import NotificationsPage from '../pages/shared/Notifications'
import AdminSendNotifications from '../pages/admin/SendNotifications'
import AdminNotificationHistory from '../pages/admin/NotificationHistory'
import AdminFeedback from '../pages/admin/Feedback'
import AdminMessagesToSystemAdmin from '../pages/admin/MessagesToSystemAdmin'
import AdminDeleteRequests from '../pages/admin/DeleteRequests'
import FeedbackPage from '../pages/shared/Feedback'
import SystemAdminDashboard from '../pages/system-admin/Dashboard'
import SystemAdminStaff from '../pages/system-admin/Staff'
import SystemAdminUsers from '../pages/system-admin/Users'
import SystemAdminBackup from '../pages/system-admin/BackupRestore'
import SystemAdminActivityLogs from '../pages/system-admin/ActivityLogs'
import SystemAdminReports from '../pages/system-admin/Reports'
import SystemAdminMessages from '../pages/system-admin/AdminMessages'
import SystemAdminDeleteRequests from '../pages/system-admin/DeleteRequests'

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
      <Route path="/staff" element={<StaffPortal />} />
      <Route path="/resident/login" element={<ResidentLogin />} />
      <Route path="/resident/register" element={<ResidentRegister />} />
      <Route path="/business/login" element={<BusinessOwnerLogin />} />
      <Route path="/business/register" element={<BusinessOwnerRegister />} />
      <Route path="/collector" element={<CollectorLogin />} />
      <Route path="/collector/login" element={<CollectorLogin />} />
      <Route path="/muAdmin" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/systemAdmin" element={<SystemAdminLogin />} />
      <Route path="/system-admin/login" element={<SystemAdminLogin />} />

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
        path="/resident/notifications"
        element={
          <ProtectedRoute role="resident">
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/feedback"
        element={
          <ProtectedRoute role="resident">
            <DashboardLayout>
              <FeedbackPage accent="indigo" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/business/dashboard"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <BusinessDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/profile"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <BusinessProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/schedules"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <BusinessSchedules />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/schedule-issues"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <BusinessScheduleIssues />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/create-report"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <BusinessCreateReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/my-reports"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <BusinessMyReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/my-reports/:id/edit"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <BusinessUpdateReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/create-request"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <CreateOnDemandRequest />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/my-requests"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <MyOnDemandRequests />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/notifications"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/feedback"
        element={
          <ProtectedRoute role="business_owner">
            <DashboardLayout>
              <FeedbackPage accent="amber" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/collector/dashboard"
        element={
          <ProtectedRoute role="collector">
            <DashboardLayout>
              <CollectorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/schedules"
        element={
          <ProtectedRoute role="collector">
            <DashboardLayout>
              <CollectorDashboard view="schedules" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/on-demand-requests"
        element={
          <ProtectedRoute role="collector">
            <DashboardLayout>
              <CollectorDashboard view="requests" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/change-password"
        element={
          <ProtectedRoute role="collector">
            <DashboardLayout>
              <CollectorChangePassword />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/notifications"
        element={
          <ProtectedRoute role="collector">
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/reports"
        element={
          <ProtectedRoute role="collector">
            <DashboardLayout>
              <CollectorMyReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/reports/create"
        element={
          <ProtectedRoute role="collector">
            <DashboardLayout>
              <CollectorCreateReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/reports/:id"
        element={
          <ProtectedRoute role="collector">
            <DashboardLayout>
              <CollectorReportDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/reports/:id/edit"
        element={
          <ProtectedRoute role="collector">
            <DashboardLayout>
              <CollectorUpdateReport />
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
        path="/admin/operational-reports"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminOperationalReports />
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
        path="/admin/business-owners"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminBusinessOwners />
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
      <Route
        path="/admin/on-demand-requests"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminOnDemandRequests />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/collectors"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminCollectors />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/send-notifications"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminSendNotifications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notification-history"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminNotificationHistory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminFeedback />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminMessagesToSystemAdmin />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/delete-requests"
        element={
          <ProtectedRoute role="municipal_admin">
            <DashboardLayout>
              <AdminDeleteRequests />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/system-admin/dashboard"
        element={
          <ProtectedRoute role="system_admin">
            <DashboardLayout>
              <SystemAdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-admin/staff"
        element={
          <ProtectedRoute role="system_admin">
            <DashboardLayout>
              <SystemAdminStaff />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-admin/users"
        element={
          <ProtectedRoute role="system_admin">
            <DashboardLayout>
              <SystemAdminUsers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-admin/backup"
        element={
          <ProtectedRoute role="system_admin">
            <DashboardLayout>
              <SystemAdminBackup />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-admin/activity-logs"
        element={
          <ProtectedRoute role="system_admin">
            <DashboardLayout>
              <SystemAdminActivityLogs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-admin/reports"
        element={
          <ProtectedRoute role="system_admin">
            <DashboardLayout>
              <SystemAdminReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-admin/feedback"
        element={
          <ProtectedRoute role="system_admin">
            <DashboardLayout>
              <AdminFeedback systemAdmin />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-admin/messages"
        element={
          <ProtectedRoute role="system_admin">
            <DashboardLayout>
              <SystemAdminMessages />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-admin/delete-requests"
        element={
          <ProtectedRoute role="system_admin">
            <DashboardLayout>
              <SystemAdminDeleteRequests />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
