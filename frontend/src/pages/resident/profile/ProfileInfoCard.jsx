import { formatDate } from './profileUtils'

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm text-right ${
          value ? 'text-gray-900 font-medium' : 'text-gray-400 italic'
        }`}
      >
        {value || 'Not provided'}
      </span>
    </div>
  )
}

export default function ProfileInfoCard({ profile }) {
  const rows = [
    { label: 'First Name', value: profile.firstName },
    { label: 'Last Name', value: profile.lastName },
    { label: 'Email', value: profile.email },
    { label: 'Phone Number', value: profile.phoneNumber },
    { label: 'Kifle Ketema', value: profile.kifleKetema },
    { label: 'Kebele', value: profile.kebele },
    { label: 'Sefer', value: profile.sefer },
    { label: 'Registration Date', value: formatDate(profile.registrationDate) },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Profile Information
      </h2>
      <p className="text-sm text-gray-500 mb-2">Your registered details</p>
      <div className="mt-2">
        {rows.map((row) => (
          <InfoRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  )
}
