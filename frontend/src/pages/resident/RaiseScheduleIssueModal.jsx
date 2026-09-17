import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const ISSUE_OPTIONS = [
  {
    value: 'missed',
    labelKey: 'issueModal.typeMissed',
    detailKey: 'issueModal.typeMissedDetail',
  },
  {
    value: 'wrong_time',
    labelKey: 'issueModal.typeWrongTime',
    detailKey: 'issueModal.typeWrongTimeDetail',
  },
  {
    value: 'partial',
    labelKey: 'issueModal.typePartial',
    detailKey: 'issueModal.typePartialDetail',
  },
  {
    value: 'overflow',
    labelKey: 'issueModal.typeOverflow',
    detailKey: 'issueModal.typeOverflowDetail',
  },
  {
    value: 'incorrect_schedule',
    labelKey: 'issueModal.typeIncorrectSchedule',
    detailKey: 'issueModal.typeIncorrectScheduleDetail',
  },
  {
    value: 'other',
    labelKey: 'issueModal.typeOther',
    detailKey: null,
  },
]

function formatTime(value) {
  if (!value) return '—'
  const [hours, minutes] = String(value).split(':')
  if (!hours) return value
  let h = Number(hours)
  const suffix = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${minutes || '00'} ${suffix}`
}

function formatTimeRange(start, end) {
  if (!start) return '—'
  return end ? `${formatTime(start)} — ${formatTime(end)}` : formatTime(start)
}

function buildDescription(issueType, customIssue, t) {
  const option = ISSUE_OPTIONS.find((item) => item.value === issueType)
  if (issueType === 'other') {
    return customIssue.trim()
  }
  return option?.detailKey ? t(option.detailKey) : ''
}

function validateForm(issueType, customIssue, t) {
  const errors = {}

  if (!issueType) {
    errors.issueType = t('issueModal.pleaseSelectType')
  }

  if (issueType === 'other') {
    if (!customIssue.trim()) {
      errors.customIssue = t('issueModal.pleaseDescribe')
    } else if (customIssue.trim().length < 10) {
      errors.customIssue = t('issueModal.minLength')
    } else if (!/[a-zA-Z]/.test(customIssue) && !/[\u1200-\u137F]/.test(customIssue)) {
      errors.customIssue = t('issueModal.letters')
    }
  }

  return errors
}

export default function RaiseScheduleIssueModal({ schedule, onClose, onSuccess }) {
  const { t } = useTranslation()
  const [issueType, setIssueType] = useState('')
  const [customIssue, setCustomIssue] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!schedule) return
    setIssueType('')
    setCustomIssue('')
    setErrors({})
    setError('')
  }, [schedule])

  if (!schedule) return null

  const showCustomIssue = issueType === 'other'

  const handleIssueTypeChange = (e) => {
    const value = e.target.value
    setIssueType(value)
    setErrors({ ...errors, issueType: '', customIssue: '' })
    if (value !== 'other') {
      setCustomIssue('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validateForm(issueType, customIssue, t)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const description = buildDescription(issueType, customIssue, t)

    setSubmitting(true)
    setError('')
    try {
      await api.post(`/schedules/${schedule.id}/issues`, { description })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || t('issueModal.failedToSubmit'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{t('issueModal.title')}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('issueModal.intro')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              {t('issueModal.selectedSchedule')}
            </p>
            <p>
              <span className="text-gray-400">{t('issueModal.dayAndTime')}</span>{' '}
              {schedule.collection_date
                ? new Date(schedule.collection_date).toLocaleDateString()
                : '—'}{' '}
              {t('issues.at')}{' '}
              {formatTimeRange(schedule.collection_time, schedule.end_time)}
            </p>
            <p>
              <span className="text-gray-400">{t('issueModal.location')}</span>{' '}
              {t('issues.location', {
                kifleKetema: schedule.kifle_ketema,
                kebele: schedule.kebele || '—',
                sefer: schedule.sefer || '—',
              })}
            </p>
            {schedule.notes && (
              <p>
                <span className="text-gray-400">{t('issueModal.notes')}</span> {schedule.notes}
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="issueType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('issueModal.whatIsTheIssue')}
            </label>
            <select
              id="issueType"
              name="issueType"
              value={issueType}
              onChange={handleIssueTypeChange}
              className={`border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white ${
                errors.issueType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">{t('issueModal.selectType')}</option>
              {ISSUE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
            {errors.issueType && (
              <p className="text-red-600 text-xs mt-1">{errors.issueType}</p>
            )}
          </div>

          {showCustomIssue && (
            <div>
              <label
                htmlFor="customIssue"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('issueModal.describeYourIssue')}
              </label>
              <textarea
                id="customIssue"
                name="customIssue"
                rows={4}
                value={customIssue}
                onChange={(e) => {
                  setCustomIssue(e.target.value)
                  setErrors({ ...errors, customIssue: '' })
                }}
                placeholder={t('issueModal.writeIssuePlaceholder')}
                className={`border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none ${
                  errors.customIssue ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.customIssue && (
                <p className="text-red-600 text-xs mt-1">{errors.customIssue}</p>
              )}
            </div>
          )}

          {issueType && issueType !== 'other' && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2 text-sm text-indigo-900">
              {ISSUE_OPTIONS.find((option) => option.value === issueType)?.detailKey
                ? t(
                    ISSUE_OPTIONS.find((option) => option.value === issueType)
                      .detailKey
                  )
                : ''}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {submitting ? t('issueModal.submitting') : t('issueModal.submitIssue')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer"
            >
              {t('issueModal.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
