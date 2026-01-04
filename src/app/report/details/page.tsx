"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ArrowLeft, MapPin, Camera, AlignLeft, Type, ChevronRight, Loader2, AlertCircle
} from "lucide-react";

// Force dynamic rendering to prevent build errors with searchParams
export const dynamic = "force-dynamic";

function DetailsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [gettingLoc, setGettingLoc] = useState(false);
  const [errors, setErrors] = useState({ title: false, description: false });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    locationName: "",
    latitude: 0,
    longitude: 0,
    imageUrl: ""
  });

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("incidentFormData");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Failed to load draft", e);
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
        alert("Unable to retrieve your location.");
        setGettingLoc(false);
      }
    );
  };

  const handleNext = () => {
    const newErrors = {
        title: !formData.title || !formData.title.trim(),
        description: !formData.description || !formData.description.trim()
    };
    setErrors(newErrors);

    if (newErrors.title || newErrors.description) {
      return; 
    }

    const dataToSave = { ...formData, category };
    sessionStorage.setItem("incidentFormData", JSON.stringify(dataToSave));
    
    window.location.href = "/report/review";
  };

  return (
    <div className="mx-auto max-w-3xl w-full">
      <div className="flex flex-wrap gap-2 mb-8 text-sm font-medium">
        <span className="text-gray-500 dark:text-gray-400">Category</span>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-blue-600 dark:text-blue-400">Details</span>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-gray-500 dark:text-gray-400">Review</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900 dark:text-white">Incident Details</h1>
        <p className="text-gray-500 dark:text-gray-400">Please provide specific details about the {category || "issue"}.</p>
      </div>

      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Issue Title <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Type className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="e.g., Leaking Pipe in Lab 3"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition`}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Title is required</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <textarea 
              rows={4}
              placeholder="Describe the issue in detail..."
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none`}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Description is required</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
          <div className="flex gap-2 mb-2">
            <button 
              onClick={handleGetLocation}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
            >
              {gettingLoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {formData.latitude !== 0 ? "Update GPS" : "Auto-Detect GPS"}
            </button>
          </div>
          <input 
            type="text"
            placeholder="Enter building, floor, or room number..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent outline-none transition"
            value={formData.locationName}
            onChange={(e) => setFormData({...formData, locationName: e.target.value})}
          />
          {formData.latitude !== 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-mono">
              GPS Locked: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Photo Evidence (Optional)</label>
          <div className="relative">
            <Camera className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Paste image URL..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent outline-none transition"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-bold hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition"
        >
          Review Report <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function ReportDetailsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans flex flex-col justify-center">
      <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin"/></div>}>
        <DetailsContent />
      </Suspense>
    </div>
  );
}