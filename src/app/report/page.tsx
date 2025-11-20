"use client";
import { useState } from 'react';
import { MapPin, Loader2, Camera, AlertTriangle } from 'lucide-react';

export default function ReportIncident() {
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, finding, success, error
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Water',
    latitude: 0,
    longitude: 0,
    imageUrl: '' // Keeping it simple for MVP (URL input)
  });

  const getLocation = () => {
    setLocationStatus('finding');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationStatus('success');
      },
      () => setLocationStatus('error')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format data for MongoDB GeoJSON
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        images: formData.imageUrl ? [formData.imageUrl] : [],
        location: {
          type: "Point",
          coordinates: [formData.longitude, formData.latitude] // Mongo expects [Long, Lat]
        }
      };

      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Incident Reported Successfully!');
        // Reset form
        setFormData({ ...formData, title: '', description: '' });
        setLocationStatus('idle');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Report an Incident</h1>
          <p className="text-gray-500 text-sm mt-2">Spot an issue? Let us know immediately.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g., Leaking Pipe in Hall A"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="Water">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Internet">Internet / Wi-Fi</option>
              <option value="Civil">Civil / Furniture</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Location (GPS) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={getLocation}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed transition ${
                  locationStatus === 'success' 
                    ? 'border-green-500 text-green-700 bg-green-50' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {locationStatus === 'finding' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {locationStatus === 'success' ? 'Location Locked' : 'Auto-Detect Location'}
              </button>
            </div>
            {locationStatus === 'success' && (
              <p className="text-xs text-green-600 mt-1 text-center">
                Lat: {formData.latitude.toFixed(4)}, Long: {formData.longitude.toFixed(4)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

           {/* Image URL (Simplified for MVP) */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
            <div className="relative">
              <Camera className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Paste image link here..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {loading ? 'Submitting...' : 'Report Incident'}
          </button>

        </form>
      </div>
    </div>
  );
}