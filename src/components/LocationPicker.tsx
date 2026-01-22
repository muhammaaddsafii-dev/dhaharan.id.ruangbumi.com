import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  center?: [number, number];
  zoom?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  selectedLocation?: [number, number] | null;
}

// Component to update map view when selectedLocation changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Component to handle map clicks
function LocationMarker({ 
  position, 
  setPosition, 
  onLocationSelect 
}: { 
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      // Reverse geocoding untuk mendapatkan alamat
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          onLocationSelect(lat, lng, address);
        })
        .catch(() => {
          // Jika gagal, gunakan koordinat
          onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        });
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function LocationPicker({
  center = [-7.7956, 110.3695], // Default: Yogyakarta
  zoom = 13,
  onLocationSelect,
  selectedLocation = null,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(selectedLocation);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (selectedLocation) {
      setPosition(selectedLocation);
    }
  }, [selectedLocation]);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border-2 border-foreground/10">
      <MapContainer
        center={selectedLocation || center}
        zoom={zoom}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selectedLocation && (
          <ChangeView center={selectedLocation} zoom={zoom} />
        )}
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
    </div>
  );
}
