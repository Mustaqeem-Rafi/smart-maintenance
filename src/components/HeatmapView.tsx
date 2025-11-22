"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, useMapEvents, Tooltip } from "react-leaflet";
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
      console.log(`📍 Pinned: ${e.latlng.lat}, ${e.latlng.lng}`);
    },
  });

  return clickedPos ? (
    <Marker position={clickedPos} icon={RedIcon}>
      <Popup>You dropped a pin here!</Popup>
    </Marker>
  ) : null;
}

// --- 3. Component to Move Map ---
function RecenterMap({ coords }: { coords: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      // Use try-catch to prevent crashes if map is unmounting
      try {
        map.setView(coords, 18, { animate: true, duration: 1.5 });
      } catch (e) {
        console.warn("Map movement interrupted", e);
      }
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

    // Cleanup previous layer safely
    if (heatLayerRef.current) {
      try {
        map.removeLayer(heatLayerRef.current);
      } catch (e) {}
    }

    // @ts-ignore - leaflet.heat types are loose
    const layer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: { 0.2: 'green', 0.5: 'yellow', 0.8: 'orange', 1.0: 'red' }
    });

    layer.addTo(map);
    heatLayerRef.current = layer;

    return () => {
      if (heatLayerRef.current) {
        try {
          map.removeLayer(heatLayerRef.current);
        } catch (e) {}
      }
    };
  }, [map, points]);

  return null;
}

export default function HeatmapView({ incidents, viewMode, searchCoords }: HeatmapViewProps) {
  // Center on BMSIT Campus
  const bmsitCenter: [number, number] = [13.1335, 77.5688];
  const [mapKey, setMapKey] = useState(`map-${Date.now()}`); // Unique key to force re-render

  // Transform data
  const heatmapPoints: [number, number, number][] = incidents
    .filter((i) => i.location?.coordinates)
    .map((i) => [
      i.location.coordinates[1], 
      i.location.coordinates[0], 
      i.priority === "High" ? 2 : 1, 
    ]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 z-0 relative">
      {/* Key prop forces React to destroy old map instance on unmount/remount */}
      <MapContainer 
        key={mapKey} 
        center={bmsitCenter} 
        zoom={17} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        {/* Standard OpenStreetMap for detailed campus labels */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap 
          coords={searchCoords || null} 
        />

        <ClickHandler />

        {/* Show Heatmap Layer */}
        {viewMode === "heatmap" && <HeatmapLayer points={heatmapPoints} />}

        {/* Show Pins */}
        {incidents.map((incident) => {
           if (!incident.location?.coordinates) return null;
           
           return (
             <Marker 
               key={incident._id} 
               position={[incident.location.coordinates[1], incident.location.coordinates[0]]}
               opacity={viewMode === "heatmap" ? 0 : 1} 
             >
               <Tooltip 
                 direction="top" 
                 offset={[0, -20]} 
                 opacity={1} 
                 permanent={viewMode === "pins"} 
                 className="text-xs font-bold bg-white border border-gray-300 px-2 py-1 rounded shadow-sm"
               >
                 {incident.location.address || incident.title}
               </Tooltip>

               <Popup>
                 <div className="text-sm font-sans">
                   <strong className="block text-base">{incident.title}</strong>
                   <span className="text-gray-500 text-xs">{incident.category}</span>
                 </div>
               </Popup>
             </Marker>
           )
        })}
      </MapContainer>
    </div>
  );
}