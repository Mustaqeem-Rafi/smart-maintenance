"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic"; // <--- 1. Import Dynamic
import { 
  ArrowLeft, 
  MapPin, 
  Camera, 
  AlignLeft, 
  Type,
  ChevronRight,
  Loader2
} from "lucide-react";

// --- 2. Load Map Dynamically (No SSR) ---
const LocationPreviewMap = dynamic(() => import("@/src/components/LocationPreviewMap"), {
  ssr: false,
  loading: () => <div className="h-48 w-full bg-gray-100 animate-pulse rounded-xl mt-3" />
});

export default function ReportDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [gettingLoc, setGettingLoc] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    locationName: "",
    latitude: 0,
    longitude: 0,
    imageUrl: ""
  });

  useEffect(() => {
    const saved = sessionStorage.getItem("incidentFormData");
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  const handleGetLocation = () => {
    setGettingLoc(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setGettingLoc(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationName: prev.locationName || "Current GPS Location"
        }));
        setGettingLoc(false);
      },
      () => {
        alert("Unable to retrieve your location");
        setGettingLoc(false);
      }
    );
  };

  const handleNext = () => {
    if (!formData.title || !formData.description) {
      alert("Please fill in the required fields");
      return;
    }
    sessionStorage.setItem("incidentFormData", JSON.stringify({ ...formData, category }));
    router.push("/staff/report/review");
  };

  return (
    <div className="mx-auto max-w-3xl p-6 font-sans text-gray-900">
      
      <div className="flex flex-wrap gap-2 mb-8 text-sm font-medium">
        <span className="text-gray-500">Select Category</span>
        <span className="text-gray-300">/</span>
        <span className="text-blue-600">Details</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500">Review</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2">Incident Details</h1>
        <p className="text-gray-500">Please provide specific details about the {category || "issue"}.</p>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Issue Title</label>
          <div className="relative">
            <Type className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="e.g., Leaking Pipe in Lab 3"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea 
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
          <div className="flex gap-2 mb-2">
            <button 
              onClick={handleGetLocation}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-100 transition"
            >
              {gettingLoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              Auto-Detect GPS
            </button>
          </div>
          <input 
            type="text"
            placeholder="Enter building, floor, or room number..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
            value={formData.locationName}
            onChange={(e) => setFormData({...formData, locationName: e.target.value})}
          />
          
          {/* --- 3. Display Map if Location Locked --- */}
          {formData.latitude !== 0 && (
            <>
              <p className="text-xs text-green-600 mt-2 font-mono font-medium">
                📍 GPS Locked: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
              </p>
              <LocationPreviewMap lat={formData.latitude} lng={formData.longitude} />
            </>
          )}
          {/* --------------------------------------- */}

        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Photo Evidence (Optional)</label>
          <div className="relative">
            <Camera className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Paste image URL..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            />
          </div>
        </div>

      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
        >
          Review Report <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}