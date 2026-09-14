import { useState } from 'react'
import { Link } from 'react-router-dom'

const ROLES = {
  resident: {
    label: 'Resident',
    icon: '🏠',
    login: {
      to: '/resident/login',
      label: 'Resident Login',
      color: 'bg-indigo-600 hover:bg-indigo-500',
    },
    register: {
      to: '/resident/register',
      label: 'Resident Register',
      color: 'bg-emerald-600 hover:bg-emerald-500',
    },
  },
  business_owner: {
    label: 'Business Owner',
    icon: '🏪',
    login: {
      to: '/business/login',
      label: 'Business Owner Login',
      color: 'bg-amber-600 hover:bg-amber-500',
    },
    register: {
      to: '/business/register',
      label: 'Business Owner Register',
      color: 'bg-orange-600 hover:bg-orange-500',
    },
  },
}

export default function Welcome() {
  const [role, setRole] = useState(null)

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

        {!role ? (
          <>
            <p className="text-gray-400 mb-4 text-sm">Continue as:</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => setRole('resident')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium transition cursor-pointer"
              >
                🏠 Resident
              </button>
              <button
                type="button"
                onClick={() => setRole('business_owner')}
                className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium transition cursor-pointer"
              >
                🏪 Business Owner
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole(null)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer"
                aria-label="Back to role selection"
              >
                ← Back
              </button>
              <h2 className="text-xl font-semibold text-white">
                {ROLES[role].icon} {ROLES[role].label}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={ROLES[role].login.to}
                className={`${ROLES[role].login.color} text-white px-6 py-3 rounded-lg font-medium transition`}
              >
                {ROLES[role].login.label}
              </Link>
              <Link
                to={ROLES[role].register.to}
                className={`${ROLES[role].register.color} text-white px-6 py-3 rounded-lg font-medium transition`}
              >
                {ROLES[role].register.label}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}