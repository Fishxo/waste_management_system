import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
const MAX_ACCEPTABLE_LOCATION_ACCURACY = 5000

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
  projectLocations = [],
}) {
  const { t } = useTranslation()
  const [viewLat, setViewLat] = useState(DEFAULT_CENTER[0])
  const [viewLng, setViewLng] = useState(DEFAULT_CENTER[1])
  const [viewZoom, setViewZoom] = useState(DEFAULT_ZOOM)
  const [mapRevision, setMapRevision] = useState(0)
  const [geoError, setGeoError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedLabel, setSelectedLabel] = useState('')
  const [locationAccuracy, setLocationAccuracy] = useState(null)
  const [fromGeolocation, setFromGeolocation] = useState(false)

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

  const handleLocationSelect = (lat, lng, label = '', viaGeolocation = false) => {
    onLocationChange(lat, lng)
    setFromGeolocation(viaGeolocation)
    moveMapTo(lat, lng, SELECTED_ZOOM, label)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(t('map.noGeoSupport'))
      return
    }

    setGeoError('')
    setSearchError('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const accuracy = pos.coords.accuracy

        if (accuracy > MAX_ACCEPTABLE_LOCATION_ACCURACY) {
          setGeoError(
            t('map.lowConfidence', { accuracy: Math.round(accuracy) })
          )
          return
        }

        setLocationAccuracy(accuracy)
        handleLocationSelect(lat, lng, t('map.yourCurrentLocation'), true)
      },
      () => {
        setGeoError(t('map.geoFailed'))
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    )
  }

  const handleSearch = async () => {
    const query = searchQuery.trim()
    if (!query) return

    setSearching(true)
    setSearchError('')
    setSearchResults([])

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
        throw new Error(t('map.searchFailed'))
      }

      const results = await response.json()

      if (!results.length) {
        setSearchError(t('map.noPlaces'))
        return
      }

      setSearchResults(results)
    } catch {
      setSearchError(t('map.placeSearchFailed'))
    } finally {
      setSearching(false)
    }
  }

  const selectSearchResult = (result) => {
    handleLocationSelect(Number(result.lat), Number(result.lon), result.display_name)
    setSearchResults([])
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
          placeholder={t('map.searchPlaceholder')}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="text-sm bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium cursor-pointer disabled:opacity-50"
        >
          {searching ? t('map.searching') : t('map.search')}
        </button>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-lg font-medium cursor-pointer disabled:opacity-50"
        >
          {t('map.useMyLocation')}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="mb-3 border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
          {searchResults.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => selectSearchResult(result)}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 cursor-pointer"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-2">
        {t('map.clickToSet')}
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
              setSelectedLabel(t('map.mapSelection'))
              handleLocationSelect(lat, lng, t('map.mapSelection'))
            }}
          />
          {position && (
            <Marker
              key={`${position[0]}-${position[1]}`}
              position={position}
              icon={markerIcon}
            />
          )}
          {projectLocations.map((location) => {
            const locationPosition = [
              Number(location.latitude),
              Number(location.longitude),
            ]
            if (locationPosition.some((value) => Number.isNaN(value))) return null

            return (
              <Marker
                key={location.id || `${location.latitude}-${location.longitude}`}
                position={locationPosition}
                icon={markerIcon}
                eventHandlers={{
                  click: () =>
                    handleLocationSelect(
                      locationPosition[0],
                      locationPosition[1],
                      location.name || t('map.projectLocation')
                    ),
                }}
              >
                {location.name || location.description ? (
                  <L.Popup>
                    {location.name && <strong>{location.name}</strong>}
                    {location.name && location.description && <br />}
                    {location.description}
                  </L.Popup>
                ) : null}
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {position && (
        <div className="text-xs text-gray-500 mt-2 space-y-1">
          {selectedLabel && (
            <p className="text-gray-700 font-medium">{selectedLabel}</p>
          )}
          <p>
            {t('map.selected', {
              lat: Number(latitude).toFixed(6),
              lng: Number(longitude).toFixed(6),
            })}
          </p>
          {fromGeolocation && locationAccuracy != null && (
            <p className="text-gray-500">
              {t('map.locationAccuracy', {
                accuracy: Math.round(locationAccuracy),
              })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
