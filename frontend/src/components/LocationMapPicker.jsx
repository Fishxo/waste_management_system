import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Default center: Addis Ababa
const DEFAULT_CENTER = [9.0054, 38.7636]

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationMapPicker({
  latitude,
  longitude,
  onLocationChange,
}) {
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [geoError, setGeoError] = useState('')
  const [locating, setLocating] = useState(true)

  const hasPosition =
    latitude !== '' &&
    longitude !== '' &&
    latitude != null &&
    longitude != null

  const position = hasPosition
    ? [Number(latitude), Number(longitude)]
    : null

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCenter([lat, lng])
        if (!hasPosition) {
          onLocationChange(lat, lng)
        }
        setLocating(false)
      },
      () => {
        setGeoError(
          'Could not get your location. Click the map to set a pickup point.'
        )
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    setGeoError('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCenter([lat, lng])
        onLocationChange(lat, lng)
        setLocating(false)
      },
      () => {
        setGeoError('Could not get your current location')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-sm text-gray-600">
          Click the map to set the waste pickup location
        </p>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg font-medium cursor-pointer disabled:opacity-50"
        >
          {locating ? 'Locating...' : 'Use my location'}
        </button>
      </div>

      {geoError && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
          {geoError}
        </p>
      )}

      <div className="h-72 rounded-xl overflow-hidden border border-gray-200 z-0">
        <MapContainer
          center={position || center}
          zoom={15}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelect={onLocationChange} />
          {position && <Marker position={position} icon={markerIcon} />}
        </MapContainer>
      </div>

      {position && (
        <p className="text-xs text-gray-500 mt-2">
          Selected: {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
        </p>
      )}
    </div>
  )
}
