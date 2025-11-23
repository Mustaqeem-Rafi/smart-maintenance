"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, CheckCircle, MapPin, FileText, Tag, Loader2
} from "lucide-react";

export default function ReviewReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("incidentFormData");
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      router.push("/report");
    }
  }, [router]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category, 
        location: {
          type: "Point",
          coordinates: [data.longitude || 0, data.latitude || 0],
          address: data.locationName
        },
        images: data.imageUrl ? [data.imageUrl] : []
      };

      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseData = await res.json();
        sessionStorage.removeItem("incidentFormData");
        
        const params = new URLSearchParams({
          refId: responseData.incident._id,
          type: payload.category,
          location: payload.location.address || "GPS Location"
        });

        // Redirect to the Universal Success Page
        router.push(`/report/success?${params.toString()}`);
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (error) {
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center font-sans">
      <div className="max-w-3xl w-full">
        
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-8 text-sm font-medium">
          <span className="text-gray-500">Select Category</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">Details</span>
          <span className="text-gray-300">/</span>
          <span className="text-blue-600">Review</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Review & Submit</h1>
          <p className="text-gray-500">Please verify the details before submitting.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Summary Header */}
          <div className="bg-gray-50 p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Incident Title</p>
                <h3 className="text-xl font-bold text-gray-900">{data.title}</h3>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Tag className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Category</span>
                </div>
                <p className="font-medium capitalize">{data.category}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                   <MapPin className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Location</span>
                </div>
                <p className="font-medium">{data.locationName || "No specific location provided"}</p>
                {data.latitude !== 0 && (
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    GPS: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            <div>
               <p className="text-xs font-bold text-gray-400 uppercase mb-2">Description</p>
               <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed border border-gray-100">
                 {data.description}
               </div>
            </div>

            {data.imageUrl && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Attached Evidence</p>
                <div className="h-48 w-full md:w-64 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative">
                  <img src={data.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-white hover:shadow-sm transition"
          >
            <ArrowLeft className="w-5 h-5" /> Edit
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition disabled:opacity-70"
          >
            {loading ? (
              <> <Loader2 className="w-5 h-5 animate-spin" /> Submitting... </>
            ) : (
              <> <CheckCircle className="w-5 h-5" /> Submit Report </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}