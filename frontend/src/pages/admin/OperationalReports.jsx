import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'
import { useAuth } from '../../context/AuthContext'

const REPORT_TYPES = [
  { value: 'schedules', label: 'Schedules', description: 'Schedule counts by status and area' },
  { value: 'collections', label: 'Collections', description: 'Scheduled and on-demand completion rates' },
  { value: 'on_demand', label: 'On-Demand', description: 'Business collection request statistics' },
  { value: 'performance', label: 'Performance', description: 'Collector assignments and completion rates' },
]

const typeLabels = Object.fromEntries(
  REPORT_TYPES.map((t) => [t.value, t.label])
)

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function SummaryGrid({ data }) {
  if (!data || typeof data !== 'object') return null

  const entries = Object.entries(data).filter(
    ([, value]) => typeof value !== 'object' && value != null
  )

  if (!entries.length) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-xl bg-gray-50 border border-gray-200 p-4"
        >
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {key.replace(/_/g, ' ')}
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      ))}
    </div>
  )
}

function DataTable({ rows }) {
  if (!rows?.length) {
    return <p className="text-sm text-gray-500">No detail rows for this report.</p>
  }

  const headers = Object.keys(rows[0])

  return (
    <div className="overflow-x-auto max-h-80">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 font-medium capitalize">
                {header.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              {headers.map((header) => (
                <td key={header} className="px-3 py-2">
                  {row[header] == null
                    ? '—'
                    : String(row[header]).includes('T') &&
                        !Number.isNaN(Date.parse(row[header]))
                      ? formatDate(row[header])
                      : String(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReportDetails({ report }) {
  const data =
    typeof report.report_data === 'string'
      ? JSON.parse(report.report_data)
      : report.report_data

  if (!data) return null

  return (
    <div className="space-y-6">
      <SummaryGrid data={data.summary} />

      {data.byStatus?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">By Status</h4>
          <DataTable rows={data.byStatus} />
        </div>
      )}

      {data.byArea?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">By Area</h4>
          <DataTable rows={data.byArea} />
        </div>
      )}

      {data.collectors?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Collectors</h4>
          <DataTable rows={data.collectors} />
        </div>
      )}

      {data.rows?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Details</h4>
          <DataTable rows={data.rows} />
        </div>
      )}

      {data.scheduleBreakdown && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Scheduled Collections
          </h4>
          <SummaryGrid data={data.scheduleBreakdown} />
        </div>
      )}

      {data.onDemandBreakdown && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            On-Demand Collections
          </h4>
          <SummaryGrid data={data.onDemandBreakdown} />
        </div>
      )}
    </div>
  )
}

export default function OperationalReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [selectedDetails, setSelectedDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const [generateForm, setGenerateForm] = useState({
    reportType: 'schedules',
    dateFrom: '',
    dateTo: '',
  })

  const [filters, setFilters] = useState({
    reportType: '',
    dateFrom: '',
    dateTo: '',
  })

  const fetchReports = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.reportType) params.set('reportType', filters.reportType)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)

    api
      .get(`/muAdmin/operational-reports?${params.toString()}`)
      .then(({ data }) => {
        setReports(Array.isArray(data) ? data : data.data || [])
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReports()
  }, [filters])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    setError('')
    try {
      await api.post('/muAdmin/operational-reports', generateForm)
      setMessage('Report generated successfully')
      fetchReports()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const openDetails = async (report) => {
    setSelected(report)
    setSelectedDetails(null)
    setDetailsLoading(true)
    try {
      const { data } = await api.get(
        `/muAdmin/operational-reports/${report.id}`
      )
      setSelectedDetails(data.data || data)
    } catch {
      setSelectedDetails(report)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleDownload = async (reportId) => {
    try {
      const response = await api.get(
        `/muAdmin/operational-reports/${reportId}/download`,
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `operational-report-${reportId}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to download report')
    }
  }

  const selectedTypeInfo = useMemo(
    () => REPORT_TYPES.find((t) => t.value === generateForm.reportType),
    [generateForm.reportType]
  )

  const inputClass =
    'border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400'

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Operational Reports</h2>
      <p className="text-gray-500 mb-6">
        Generate and download operational analytics for schedules, collections,
        on-demand requests, and collector performance
        {user?.kifleKetema ? ` in ${user.kifleKetema}` : ''}.
      </p>

      {message && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4">Generate Report</h3>
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                name="reportType"
                value={generateForm.reportType}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, reportType: e.target.value })
                }
                className={inputClass}
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {selectedTypeInfo && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedTypeInfo.description}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date (optional)
              </label>
              <input
                type="date"
                value={generateForm.dateFrom}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, dateFrom: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date (optional)
              </label>
              <input
                type="date"
                value={generateForm.dateTo}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, dateTo: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by type
              </label>
              <select
                value={filters.reportType}
                onChange={(e) =>
                  setFilters({ ...filters, reportType: e.target.value })
                }
                className={inputClass}
              >
                <option value="">All types</option>
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generated from
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generated to
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">
            Generated Reports ({reports.length})
          </h3>

          {loading ? (
            <Loading />
          ) : reports.length === 0 ? (
            <p className="text-gray-500">No operational reports yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Generated</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{report.title}</td>
                      <td className="px-4 py-3">
                        {typeLabels[report.report_type] || report.report_type}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {report.date_from || report.date_to
                          ? `${formatDate(report.date_from)} – ${formatDate(report.date_to)}`
                          : 'All time'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openDetails(report)}
                            className="text-indigo-600 hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(report.id)}
                            className="text-emerald-600 hover:underline cursor-pointer"
                          >
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDetails?.title || selected.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {typeLabels[selected.report_type]} · Generated{' '}
                  {formatDate(selected.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(selected.id)}
                  className="text-sm text-emerald-600 hover:underline cursor-pointer"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            </div>

            {detailsLoading ? (
              <Loading />
            ) : (
              <ReportDetails report={selectedDetails || selected} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
