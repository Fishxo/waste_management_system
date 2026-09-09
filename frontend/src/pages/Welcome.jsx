import { Link } from 'react-router-dom'

export default function Welcome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-gray-900 px-4">
      <div className="text-center max-w-lg">
        <div className="text-5xl mb-6">♻️</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Waste Management System
        </h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          A centralized platform for residents to report waste issues and for
          municipal administrators to track, manage, and resolve reports
          efficiently. Help keep your community clean.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/resident/login"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Resident Login
          </Link>
          <Link
            to="/resident/register"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Resident Register
          </Link>
          <Link
            to="/business/register"
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Business Owner Register
          </Link>
        </div>
      </div>
    </div>
  )
}
