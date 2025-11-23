"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic"; 
import { 
  ArrowLeft, MapPin, Camera, AlignLeft, Type, ChevronRight, Loader2 
} from "lucide-react";

// Dynamic Import for Map to avoid SSR issues
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
    router.push("/report/review");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center font-sans">
      <div className="max-w-3xl w-full">
        
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-8 text-sm font-medium">
          <span className="text-gray-500">Select Category</span>
          <span className="text-gray-400">/</span>
          <span className="text-blue-700 font-bold">Details</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">Review</span>
        </div>

        {/* Header - Fixed text color */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
            Incident Details
          </h1>
          <p className="text-gray-600 text-lg">
            Please provide specific details about the {category || "issue"}.
          </p>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Issue Title</label>
            <div className="relative">
              <Type className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              <input 
                type="text"
                placeholder="e.g., Broken Projector in Lab 1"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              <textarea 
                rows={4}
                placeholder="Describe the issue in detail..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Location with Map */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Location</label>
            <div className="flex gap-2 mb-2">
              <button 
                onClick={handleGetLocation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-100 transition border border-blue-100"
              >
                {gettingLoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                Auto-Detect GPS
              </button>
            </div>
            <input 
              type="text"
              placeholder="Enter building, floor, or room number..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              value={formData.locationName}
              onChange={(e) => setFormData({...formData, locationName: e.target.value})}
            />
            
            {/* MAP INTEGRATION */}
            {formData.latitude !== 0 && (
              <>
                <p className="text-xs text-green-700 mt-2 font-mono font-bold">
                  📍 Location Locked: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                </p>
                <LocationPreviewMap lat={formData.latitude} lng={formData.longitude} />
              </>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Photo Evidence (Optional)</label>
            <div className="relative">
              <Camera className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              <input 
                type="text"
                placeholder="Paste image URL..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-700 font-bold hover:bg-white hover:shadow-sm transition"
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
    </div>
  );
}