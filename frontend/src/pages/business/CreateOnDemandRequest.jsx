import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import LocationMapPicker from '../../components/LocationMapPicker'

export default function CreateOnDemandRequest() {
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLocationChange = (lat, lng) => {
    setLatitude(lat)
    setLongitude(lng)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (latitude === '' || longitude === '') {
      setError('Please select a pickup location on the map')
      return
    }

    setLoading(true)
    try {
      await api.post('/onDemandRequests', {
        latitude: Number(latitude),
        longitude: Number(longitude),
        description: description.trim() || undefined,
      })
      navigate('/business/my-requests')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit collection request'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-2">Request On-Demand Collection</h2>
      <p className="text-gray-500 mb-6">
        Pin your business location on the map and submit a collection request
        for municipal review.
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {error && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <LocationMapPicker
          latitude={latitude}
          longitude={longitude}
          onLocationChange={handleLocationChange}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the waste type, volume, or any special instructions..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
