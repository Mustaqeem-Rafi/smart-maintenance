"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// --- 1. Fix Leaflet Icons in Next.js ---
// Without this, markers will appear as broken images
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

interface HeatmapViewProps {
  incidents: any[];
}

// --- 2. The Heatmap Layer Component ---
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  // Keep track of the layer to remove it on unmount
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || points.length === 0) return;

    // If layer exists, remove it before adding a new one (prevents duplicate layers)
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // @ts-ignore - leaflet.heat extends L namespace but Typescript doesn't know
    const layer = L.heatLayer(points, {
      radius: 35,   // Size of the heat spot (Higher = easier to see)
      blur: 25,     // Softness of the edge
      maxZoom: 15,  // Zoom level where intensity peaks
      max: 1.0,     // Max intensity
      gradient: {   // Explicit colors for better contrast
        0.2: 'blue',
        0.4: 'cyan',
        0.6: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    });

    layer.addTo(map);
    heatLayerRef.current = layer;

    // Cleanup function
    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, points]);

  return null;
}

// --- 3. Main Map Component ---
export default function HeatmapView({ incidents }: HeatmapViewProps) {
  // Default center: Bengaluru (Coordinates from your image)
  const defaultCenter: [number, number] = [12.9716, 77.5946];

  // Transform incidents into Heatmap format: [lat, lng, intensity]
  const heatmapPoints: [number, number, number][] = incidents
    .filter((i) => i.location?.coordinates)
    .map((i) => [
      i.location.coordinates[1], // Latitude (Mongo stores [Lng, Lat])
      i.location.coordinates[0], // Longitude
      // Intensity: High priority = "Hotter"
      i.priority === "High" ? 3 : i.priority === "Medium" ? 1.5 : 0.8, 
    ]);

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 z-0 relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} // Zoomed out slightly to see more area
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* The Heatmap Overlay */}
        <HeatmapLayer points={heatmapPoints} />

        {/* Optional: Actual Markers on top (To verify data location) */}
        {incidents.map((incident) => {
           if (!incident.location?.coordinates) return null;
           return (
             <Marker 
               key={incident._id} 
               position={[incident.location.coordinates[1], incident.location.coordinates[0]]}
             >
               <Popup>
                 <strong>{incident.title}</strong><br/>
                 Priority: {incident.priority}<br/>
                 Status: {incident.status}
               </Popup>
             </Marker>
           )
        })}
      </MapContainer>
    </div>
  );
}