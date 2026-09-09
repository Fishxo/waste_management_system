import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'

// Default center: Debre Markos Municipality
const DEFAULT_CENTER = [10.3345, 37.731]
const DEFAULT_ZOOM = 13
const SELECTED_ZOOM = 15

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

function MapViewUpdater({ lat, lng, zoom, revision }) {
  const map = useMap()

  useEffect(() => {
    if (lat == null || lng == null || revision === 0) return
    map.flyTo([lat, lng], zoom, { duration: 0.8 })
  }, [lat, lng, zoom, revision, map])

  return null
}

export default function LocationMapPicker({
  latitude,
  longitude,
  onLocationChange,
}) {
  const [viewLat, setViewLat] = useState(DEFAULT_CENTER[0])
  const [viewLng, setViewLng] = useState(DEFAULT_CENTER[1])
  const [viewZoom, setViewZoom] = useState(DEFAULT_ZOOM)
  const [mapRevision, setMapRevision] = useState(0)
  const [geoError, setGeoError] = useState('')
  const [locating, setLocating] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')

  const hasPosition =
    latitude !== '' &&
    longitude !== '' &&
    latitude != null &&
    longitude != null

  const position = hasPosition
    ? [Number(latitude), Number(longitude)]
    : null

  const moveMapTo = (lat, lng, zoom, label = '') => {
    setGeoError('')
    setSearchError('')
    setViewLat(lat)
    setViewLng(lng)
    setViewZoom(zoom)
    setMapRevision((value) => value + 1)
    if (label) {
      setSelectedLabel(label)
    }
  }

  const handleLocationSelect = (lat, lng, label = '') => {
    onLocationChange(lat, lng)
    moveMapTo(lat, lng, SELECTED_ZOOM, label)
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError(
        'Geolocation is not supported. Search for a place or click the map.'
      )
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        moveMapTo(lat, lng, SELECTED_ZOOM, 'Your current location')
        if (!hasPosition) {
          onLocationChange(lat, lng)
        }
        setLocating(false)
      },
      () => {
        setGeoError(
          'Could not get your GPS location. Search below or click the map to set a pickup point.'
        )
        setLocating(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    setGeoError('')
    setSearchError('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        handleLocationSelect(lat, lng, 'Your current location')
        setLocating(false)
      },
      () => {
        setGeoError(
          'Could not get your current location. Try search or click the map.'
        )
        setLocating(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleSearch = async () => {
    const query = searchQuery.trim()
    if (!query) return

    setSearching(true)
    setSearchError('')

    try {
      const params = new URLSearchParams({
        q: query.includes('Debre Markos') ? query : `${query}, Debre Markos, Ethiopia`,
        format: 'json',
        limit: '5',
        countrycodes: 'et',
      })

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        { headers: { Accept: 'application/json' } }
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const results = await response.json()

      if (!results.length) {
        setSearchError('No places found. Try a different search or click the map.')
        return
      }

      const best = results[0]
      const lat = Number(best.lat)
      const lng = Number(best.lon)
      handleLocationSelect(lat, lng, best.display_name)
    } catch {
      setSearchError('Place search failed. Check your internet or click the map.')
    } finally {
      setSearching(false)
    }
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleSearch()
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search place (e.g. Debre Markos, hotel name...)"
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="text-sm bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium cursor-pointer disabled:opacity-50"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-lg font-medium cursor-pointer disabled:opacity-50"
        >
          {locating ? 'Locating...' : 'Use my location'}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        Click the map to set the pickup point. Scroll to zoom, drag to move around.
      </p>

      {geoError && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
          {geoError}
        </p>
      )}

      {searchError && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">
          {searchError}
        </p>
      )}

      <div className="h-96 rounded-xl overflow-hidden border border-gray-200 z-0">
        <MapContainer
          center={[viewLat, viewLng]}
          zoom={viewZoom}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewUpdater
            lat={viewLat}
            lng={viewLng}
            zoom={viewZoom}
            revision={mapRevision}
          />
          <MapClickHandler
            onSelect={(lat, lng) => {
              setSelectedLabel('Map selection')
              handleLocationSelect(lat, lng, 'Map selection')
            }}
          />
          {position && (
            <Marker
              key={`${position[0]}-${position[1]}`}
              position={position}
              icon={markerIcon}
            />
          )}
        </MapContainer>
      </div>

      {position && (
        <div className="text-xs text-gray-500 mt-2 space-y-1">
          {selectedLabel && (
            <p className="text-gray-700 font-medium">{selectedLabel}</p>
          )}
          <p>
            Selected: {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}
