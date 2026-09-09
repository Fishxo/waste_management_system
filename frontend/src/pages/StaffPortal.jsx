import { Link } from 'react-router-dom'

export default function StaffPortal() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-gray-900 px-4">
      <div className="text-center max-w-lg">
        <div className="text-5xl mb-6">♻️</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Waste Management System
        </h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          Staff &amp; Admin Portal. Sign in as a collector, municipal admin, or
          system admin to manage waste collection and community reports.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/collector/login"
            className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Collector Login
          </Link>
          <Link
            to="/admin/login"
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Municipal Admin Login
          </Link>
          <Link
            to="/system-admin/login"
            className="bg-violet-700 hover:bg-violet-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            System Admin Login
          </Link>
        </div>
        <p className="text-sm text-center mt-8">
          <Link to="/" className="text-gray-300 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}