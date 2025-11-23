"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Fix Leaflet Icons in Next.js ---
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- Helper to Recenter Map when coords change ---
function RecenterMap({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16);
  }, [lat, lng, map]);
  return null;
}

export default function LocationPreviewMap({ lat, lng }: { lat: number, lng: number }) {
  return (
    <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mt-3 z-0 relative">
      <MapContainer 
        center={[lat, lng]} 
        zoom={16} 
        style={{ height: "100%", width: "100%" }} 
        scrollWheelZoom={false} // Disable scroll to prevent page scroll locking
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={lat} lng={lng} />
        <Marker position={[lat, lng]}>
          <Popup>Incident Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}