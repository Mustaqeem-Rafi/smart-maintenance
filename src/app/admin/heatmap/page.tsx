"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { 
  Search, 
  Map as MapIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Loader2 
} from "lucide-react";

const HeatmapView = dynamic(() => import("@/src/components/HeatmapView"), { 
  ssr: false, 
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500"><Loader2 className="w-8 h-8 animate-spin"/></div>
});

interface Incident {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  location: { coordinates: number[], address?: string };
  createdAt: string;
}

export default function HeatmapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [viewMode, setViewMode] = useState<"heatmap" | "pins">("heatmap");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Date States
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/incidents");
        const data = await res.json();
        if (data.incidents) setIncidents(data.incidents);
      } catch (error) {
        console.error("Failed to fetch incidents", error);
      }
    };
    fetchData();
  }, []);

  // --- SEARCH LOGIC ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Use Nominatim API
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        // FORCE UPDATE: Even if coords are same, we want to trigger the flyTo effect
        setMapCenter(null); 
        setTimeout(() => setMapCenter([lat, lon]), 50);
      } else {
        alert("Location not found! Try entering a City or specific building name.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  // --- Filter Logic ---
  const filteredIncidents = incidents.filter((incident) => {
    const matchesCategory = selectedCategory ? incident.category === selectedCategory : true;
    let matchesDate = true;
    if (selectedDate) {
      const incDate = new Date(incident.createdAt);
      matchesDate = 
        incDate.getDate() === selectedDate.getDate() &&
        incDate.getMonth() === selectedDate.getMonth() &&
        incDate.getFullYear() === selectedDate.getFullYear();
    }
    return matchesCategory && matchesDate;
  });

  // --- Calendar Logic ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = selectedDate?.getDate() === i && selectedDate?.getMonth() === currentDate.getMonth();
      days.push(
        <button 
          key={i} 
          onClick={() => {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            setSelectedDate(selectedDate?.getTime() === newDate.getTime() ? null : newDate);
          }}
          className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition ${
            isSelected 
              ? "bg-red-600 text-white font-bold shadow-md" 
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-gray-950 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col z-20 shadow-xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <MapIcon className="text-red-600" /> Heatmap
           </h1>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          {/* View Mode */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">View Mode</p>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button onClick={() => setViewMode("heatmap")} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${viewMode === "heatmap" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Heatmap</button>
              <button onClick={() => setViewMode("pins")} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${viewMode === "pins" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Pins</button>
            </div>
          </div>

          {/* Incident Type */}
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Incident Type</p>
            <div className="flex flex-wrap gap-2">
              {["Water", "Electricity", "Internet", "Civil", "Other"].map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${selectedCategory === cat ? "bg-red-50 border-red-200 text-red-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div>
             <div className="flex items-center justify-between mb-4">
               <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4" /></button>
               <span className="text-sm font-bold text-gray-900 dark:text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
               <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4" /></button>
             </div>
             <div className="grid grid-cols-7 gap-1 text-center mb-2">{['S','M','T','W','T','F','S'].map((d, i) => (<span key={i} className="text-xs font-bold text-gray-400">{d}</span>))}</div>
             <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
             {selectedDate && <button onClick={() => setSelectedDate(null)} className="text-xs text-red-600 mt-2 hover:underline w-full text-center">Clear Date Filter</button>}
          </div>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-gray-200">
        
        {/* Top Overlay Bar */}
        <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between pointer-events-none">
           {/* Search Bar */}
           <form onSubmit={handleSearch} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-lg rounded-lg p-1 flex items-center pointer-events-auto w-96 border border-gray-200">
             <button type="submit" className="p-2 text-gray-400 hover:text-blue-600 transition"><Search className="w-5 h-5" /></button>
             <input type="text" placeholder="Search locations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 text-gray-900 dark:text-white outline-none h-10" />
             {isSearching && <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-3" />}
           </form>

           <Link href="/report" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2 pointer-events-auto"><Plus className="w-4 h-4" /> Report New Incident</Link>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 z-[400] pointer-events-auto">
           <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-xl rounded-lg p-4 w-48 border border-gray-200">
             <p className="text-xs font-bold text-gray-500 uppercase mb-2">Incident Density</p>
             <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-1"><span>Low</span><span>High</span></div>
             <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-400 via-yellow-400 to-red-600"></div>
           </div>
        </div>

        {/* Map */}
        <div className="absolute inset-0 z-0">
           <HeatmapView incidents={filteredIncidents} viewMode={viewMode} searchCoords={mapCenter} />
        </div>

      </main>
    </div>
  );
}