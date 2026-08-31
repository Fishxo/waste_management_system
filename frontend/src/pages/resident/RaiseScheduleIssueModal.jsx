import { useState, useEffect } from 'react'
import api from '../../api/axios'

const ISSUE_OPTIONS = [
  {
    value: 'missed',
    label: 'Collection was missed',
    detail: 'The scheduled waste collection did not happen as planned.',
  },
  {
    value: 'wrong_time',
    label: 'Collection happened at the wrong time',
    detail: 'Waste collection occurred outside the scheduled collection time.',
  },
  {
    value: 'partial',
    label: 'Waste was not fully collected',
    detail: 'Only part of the waste was collected during the scheduled pickup.',
  },
  {
    value: 'overflow',
    label: 'Overflowing or uncollected waste remains',
    detail: 'Waste is still overflowing or left behind after collection.',
  },
  {
    value: 'incorrect_schedule',
    label: 'Schedule information seems incorrect',
    detail: 'The published schedule details appear to be incorrect for this area.',
  },
  {
    value: 'other',
    label: 'Other',
    detail: null,
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

function buildScheduleContext(schedule) {
  const lines = [
    'Related collection schedule:',
    `- Sub-city: ${schedule.kifle_ketema || '—'}`,
    `- Kebele: ${schedule.kebele || '—'}`,
    `- Sefer: ${schedule.sefer || '—'}`,
    `- Day: ${schedule.collection_day || '—'}`,
    `- Time: ${formatTime(schedule.collection_time)}`,
  ]

  if (schedule.notes) {
    lines.push(`- Schedule notes: ${schedule.notes}`)
  }

  return lines.join('\n')
}

function buildTitle(schedule, issueType) {
  const day = schedule.collection_day || 'schedule'
  const option = ISSUE_OPTIONS.find((item) => item.value === issueType)
  const label = option?.label || 'Schedule issue'
  return `${label} - ${day}`
}

function buildDescription(schedule, issueType, customIssue) {
  const option = ISSUE_OPTIONS.find((item) => item.value === issueType)
  const issueText =
    issueType === 'other' ? customIssue.trim() : option?.detail || ''

  return [
    buildScheduleContext(schedule),
    '',
    'Issue reported:',
    issueText,
  ].join('\n')
}

function validateForm(issueType, customIssue) {
  const errors = {}

  if (!issueType) {
    errors.issueType = 'Please select an issue type'
  }

  if (issueType === 'other') {
    if (!customIssue.trim()) {
      errors.customIssue = 'Please describe your issue'
    } else if (customIssue.trim().length < 10) {
      errors.customIssue = 'Description should be at least 10 characters'
    } else if (!/[a-zA-Z]/.test(customIssue)) {
      errors.customIssue = 'Description must contain at least one letter'
    }
  }

  return errors
}

export default function RaiseScheduleIssueModal({ schedule, onClose, onSuccess }) {
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
    const nextErrors = validateForm(issueType, customIssue)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const title = buildTitle(schedule, issueType)
    const description = buildDescription(schedule, issueType, customIssue)

    setSubmitting(true)
    setError('')
    try {
      await api.post('/reports', { title, description })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit issue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Raise Schedule Issue</h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose the issue type for this schedule. Schedule location is added
            automatically to your report.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Selected schedule
            </p>
            <p>
              <span className="text-gray-400">Day & time:</span>{' '}
              {schedule.collection_day} at {formatTime(schedule.collection_time)}
            </p>
            <p>
              <span className="text-gray-400">Location:</span>{' '}
              {schedule.kifle_ketema}, Kebele {schedule.kebele || '—'},{' '}
              Sefer {schedule.sefer || '—'}
            </p>
            {schedule.notes && (
              <p>
                <span className="text-gray-400">Notes:</span> {schedule.notes}
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
              What is the issue?
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
              <option value="">Select an issue type</option>
              {ISSUE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
                Describe your issue
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
                placeholder="Write your issue here..."
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
              {ISSUE_OPTIONS.find((option) => option.value === issueType)?.detail}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Issue'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
