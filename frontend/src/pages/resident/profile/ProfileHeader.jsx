import { getInitials } from './profileUtils'

export default function ProfileHeader({ profile, onEdit }) {
  const initials = getInitials(profile.firstName, profile.lastName)
  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Resident'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-semibold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {displayName}
            </h1>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
              Resident
            </span>
            {profile.residentCode && (
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {profile.residentCode}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-1">
            {profile.email || 'Not provided'}
          </p>
          <p className="text-gray-500 text-sm mt-0.5">
            {profile.phoneNumber || 'Not provided'}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer shrink-0"
        >
          Edit Profile
        </button>
      </div>
    </div>
  )
}
