"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { 
  Search, 
  Map as MapIcon, 
  List, 
  BarChart, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Plus 
} from "lucide-react";

// 1. Dynamically import the Map component (No SSR)
const HeatmapView = dynamic(() => import("@/src/components/HeatmapView"), { 
  ssr: false, 
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>
});

// Interface matching your API
interface Incident {
  _id: string;
  category: string;
  priority: string;
  location: { coordinates: number[] };
  createdAt: string;
}

export default function HeatmapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null); // 'Medical', 'Security', etc.
  
  // Fetch Data
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

  // Filter Logic
  const filteredIncidents = filterType 
    ? incidents.filter(i => i.category === filterType)
    : incidents;

  // Categories (Hardcoded based on your design)
  const categories = ["Medical", "Security", "Maintenance", "Other"];

  // Calendar Generator (Simple Static for UI)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-gray-950 overflow-hidden font-sans">
      
      {/* Left Sidebar (Filters) */}
      <aside className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col z-10 shadow-xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <MapIcon className="text-red-600" /> Heatmap
           </h1>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          
          {/* View Toggle */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">View Mode</p>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button className="flex-1 py-1.5 text-sm font-medium bg-white dark:bg-gray-700 shadow-sm rounded-md text-gray-900 dark:text-white transition">Heatmap</button>
              <button className="flex-1 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 transition">Pins</button>
            </div>
          </div>

          {/* Incident Type Filter */}
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Incident Type</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterType(filterType === cat ? null : cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    filterType === cat 
                      ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  }`}
                >
                  {cat}
                  {filterType === cat && <span className="ml-1.5">×</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Widget */}
          <div>
             <div className="flex items-center justify-between mb-4">
               <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4" /></button>
               <span className="text-sm font-bold text-gray-900 dark:text-white">October 2024</span>
               <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4" /></button>
             </div>
             {/* Corrected Calendar Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                    <span key={i} className="text-xs font-bold text-gray-400">{d}</span>
                ))}
            </div>
             <div className="grid grid-cols-7 gap-1">
               {days.map(d => (
                 <button 
                    key={d} 
                    className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition ${
                      d === 5 ? "bg-red-600 text-white font-bold shadow-md" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                 >
                   {d}
                 </button>
               ))}
             </div>
          </div>

        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-gray-200">
        {/* Map Component */}
        <div className="absolute inset-0 z-0">
           <HeatmapView incidents={filteredIncidents} />
        </div>

        {/* Overlay: Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 pointer-events-none flex justify-between">
           {/* Search Bar (Visual Only) */}
           <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-lg rounded-lg p-1 flex items-center pointer-events-auto w-96">
             <Search className="w-5 h-5 text-gray-400 ml-3" />
             <input 
               type="text" 
               placeholder="Search campus locations..." 
               className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 text-gray-900 dark:text-white placeholder-gray-500"
             />
           </div>

           {/* Report Button */}
           <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2 pointer-events-auto transition">
             <Plus className="w-4 h-4" /> Report New Incident
           </button>
        </div>

        {/* Overlay: Legend */}
        <div className="absolute bottom-6 right-6 z-10 pointer-events-auto">
           <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-xl rounded-lg p-4 w-48">
             <p className="text-xs font-bold text-gray-500 uppercase mb-2">Incident Density</p>
             <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
               <span>Low</span>
               <span>High</span>
             </div>
             <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-400 via-yellow-400 to-red-600"></div>
           </div>
        </div>

      </main>
    </div>
  );
}