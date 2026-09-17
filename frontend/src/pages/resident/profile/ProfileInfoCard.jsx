import { useTranslation } from 'react-i18next'
import { formatDate } from './profileUtils'

function InfoRow({ label, value, notProvided }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm text-right ${
          value ? 'text-gray-900 font-medium' : 'text-gray-400 italic'
        }`}
      >
        {value || notProvided}
      </span>
    </div>
  )
}

export default function ProfileInfoCard({ profile }) {
  const { t } = useTranslation()
  const notProvided = t('profile.notProvided')
  const rows = [
    { label: t('profile.residentCode'), value: profile.residentCode },
    { label: t('profile.firstName'), value: profile.firstName },
    { label: t('profile.lastName'), value: profile.lastName },
    { label: t('profile.email'), value: profile.email },
    { label: t('profile.phoneNumber'), value: profile.phoneNumber },
    { label: t('profile.kifleKetema'), value: profile.kifleKetema },
    { label: t('profile.kebele'), value: profile.kebele },
    { label: t('profile.sefer'), value: profile.sefer },
    { label: t('profile.registrationDate'), value: formatDate(profile.registrationDate) },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {t('profile.profileInformation')}
      </h2>
      <p className="text-sm text-gray-500 mb-2">{t('profile.yourRegisteredDetails')}</p>
      <div className="mt-2">
        {rows.map((row) => (
          <InfoRow
            key={row.label}
            label={row.label}
            value={row.value}
            notProvided={notProvided}
          />
        ))}
      </div>
    </div>
  )
}
