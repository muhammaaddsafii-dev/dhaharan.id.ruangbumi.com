import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

interface LocationViewerProps {
  location: [number, number]; // [lat, lng]
  zoom?: number;
}

export default function LocationViewer({
  location,
  zoom = 5, // Default zoom 5 untuk view Indonesia
}: LocationViewerProps) {
  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border-2 border-foreground/10">
      <MapContainer
        center={location}
        zoom={zoom}
        className="w-full h-full"
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={false}
        doubleClickZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={location} />
      </MapContainer>
    </div>
  );
}
