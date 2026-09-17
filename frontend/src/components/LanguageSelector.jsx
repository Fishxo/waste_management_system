import { useTranslation } from 'react-i18next'

export default function LanguageSelector({ className = '' }) {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('am') ? 'am' : 'en'

  return (
    <select
      value={current}
      onChange={(event) => i18n.changeLanguage(event.target.value)}
      aria-label="Language"
      title="Language / ቋንቋ"
      className={`rounded-lg px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${className}`}
    >
      <option value="en">English</option>
      <option value="am">አማርኛ</option>
    </select>
  )
}