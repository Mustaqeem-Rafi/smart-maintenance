"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// --- 1. Fix Custom Icons ---
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A Red Icon for "Dropped Pins"
const RedIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface HeatmapViewProps {
  incidents: any[];
  viewMode: "heatmap" | "pins";
  searchCoords?: [number, number] | null;
}

// --- 2. Component to Handle Map Clicks (Drop Pin) ---
function ClickHandler() {
  const [clickedPos, setClickedPos] = useState<[number, number] | null>(null);
  
  useMapEvents({
    click(e) {
      setClickedPos([e.latlng.lat, e.latlng.lng]);
      console.log(`📍 Pinned Location: ${e.latlng.lat}, ${e.latlng.lng}`);
    },
  });

  return clickedPos ? (
    <Marker position={clickedPos} icon={RedIcon}>
      <Popup>You dropped a pin here!</Popup>
    </Marker>
  ) : null;
}

// --- 3. Component to Move Map & Show Search Pin ---
function RecenterMap({ coords }: { coords: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 16, { duration: 1.5 }); // Smooth animation
    }
  }, [coords, map]);

  // Show a marker at the search result
  return coords ? (
    <Marker position={coords}>
      <Popup>Search Result</Popup>
    </Marker>
  ) : null;
}

function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || points.length === 0) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // @ts-ignore
    const layer = L.heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 15,
      max: 1.0,
      gradient: { 0.2: 'blue', 0.4: 'cyan', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
    });

    layer.addTo(map);
    heatLayerRef.current = layer;

    return () => {
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);
    };
  }, [map, points]);

  return null;
}

export default function HeatmapView({ incidents, viewMode, searchCoords }: HeatmapViewProps) {
  // Default: Bengaluru
  const defaultCenter: [number, number] = [12.9716, 77.5946];

  const heatmapPoints: [number, number, number][] = incidents
    .filter((i) => i.location?.coordinates)
    .map((i) => [
      i.location.coordinates[1], 
      i.location.coordinates[0], 
      i.priority === "High" ? 3 : 1, 
    ]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 z-0 relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        {/* Use CartoDB Voyager for a cleaner, Google-Maps-like look */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* 1. Handle Search Movement */}
        <RecenterMap 
          key={searchCoords ? `${searchCoords[0]}-${searchCoords[1]}` : "init"} 
          coords={searchCoords || null} 
        />

        {/* 2. Handle User Clicks (Drop Pin) */}
        <ClickHandler />

        {/* 3. Show Heatmap Layer */}
        {viewMode === "heatmap" && <HeatmapLayer points={heatmapPoints} />}

        {/* 4. Show Incident Pins */}
        {viewMode === "pins" && incidents.map((incident) => {
           if (!incident.location?.coordinates) return null;
           return (
             <Marker 
               key={incident._id} 
               position={[incident.location.coordinates[1], incident.location.coordinates[0]]}
             >
               <Popup>
                 <div className="text-sm font-sans">
                   <strong className="block text-base">{incident.title}</strong>
                   <span className="text-gray-500 text-xs uppercase tracking-wide">{incident.category}</span>
                   <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-bold text-white ${incident.status === 'Open' ? 'bg-red-500' : 'bg-green-500'}`}>
                     {incident.status}
                   </div>
                 </div>
               </Popup>
             </Marker>
           )
        })}
      </MapContainer>
    </div>
  );
}