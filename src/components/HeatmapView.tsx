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
      map.flyTo(coords, 17, { duration: 1.5 }); // Closer zoom for search results
    }
  }, [coords, map]);

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
      radius: 25, // Adjusted for campus scale
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      // Custom Gradient: Green -> Yellow -> Orange -> Red
      gradient: { 
        0.2: 'green',
        0.5: 'yellow',
        0.7: 'orange',
        1.0: 'red' 
      }
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
  // --- UPDATE: BMSIT Campus Coordinates ---
  // This centers the map directly on the college
  const bmsitCenter: [number, number] = [13.1335, 77.5688];

  const heatmapPoints: [number, number, number][] = incidents
    .filter((i) => i.location?.coordinates)
    .map((i) => [
      i.location.coordinates[1], // Lat
      i.location.coordinates[0], // Lng
      i.priority === "High" ? 2 : 1, // Weight
    ]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 z-0 relative">
      <MapContainer 
        center={bmsitCenter} 
        zoom={17} // Higher zoom level to show just the campus
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        {/* Google Maps Style Tile Layer (CartoDB Voyager) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* 1. Handle Search Movement */}
        <RecenterMap 
          key={searchCoords ? `${searchCoords[0]}-${searchCoords[1]}` : "init"} 
          coords={searchCoords || null} 
        />

        {/* 2. Handle User Clicks */}
        <ClickHandler />

        {/* 3. Show Heatmap Layer */}
        {viewMode === "heatmap" && <HeatmapLayer points={heatmapPoints} />}

        {/* 4. Show Incident Pins */}
        {(viewMode === "pins" || viewMode === "heatmap") && incidents.map((incident) => {
           if (!incident.location?.coordinates) return null;
           
           // Optional: Hide pins in heatmap mode to avoid clutter
           if (viewMode === "heatmap") return null;

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