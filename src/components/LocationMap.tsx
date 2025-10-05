'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para los iconos de Leaflet en Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Location {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  hectares: number | null
  crop_variety: string | null
  planting_date: string | null
  created_at: string
}

interface LocationMapProps {
  locations: Location[]
  selectedLocation: Location | null
  onLocationSelect: (location: Location) => void
}

// Componente para centrar el mapa en la ubicación seleccionada
function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])
  
  return null
}

export default function LocationMap({
  locations,
  selectedLocation,
  onLocationSelect,
}: LocationMapProps) {
  // Centro por defecto (México)
  const defaultCenter: [number, number] = [23.6345, -102.5528]
  const center: [number, number] = selectedLocation
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : defaultCenter

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-gray-700">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            eventHandlers={{
              click: () => onLocationSelect(location),
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-base mb-1">{location.name}</h3>
                {location.description && (
                  <p className="text-gray-600 mb-2">{location.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
                {location.hectares && (
                  <p className="text-xs text-gray-500">
                    🌾 {location.hectares} hectares
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
