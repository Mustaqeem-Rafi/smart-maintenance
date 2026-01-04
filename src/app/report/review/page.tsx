"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, MapPin, FileText, Tag, Loader2 } from "lucide-react";

// Force dynamic rendering
export const dynamic = "force-dynamic";

function ReviewContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("incidentFormData");
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        router.push("/report");
      }
    } catch (e) {
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
    <div className="mx-auto max-w-3xl w-full">
      <div className="flex flex-wrap gap-2 mb-8 text-sm font-medium">
        <span className="text-gray-500 dark:text-gray-400">Category</span>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-gray-500 dark:text-gray-400">Details</span>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-blue-600 dark:text-blue-400">Review</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900 dark:text-white">Review & Submit</h1>
        <p className="text-gray-500 dark:text-gray-400">Verify details before submitting.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Incident Title</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{data.title}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Tag className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Category</span>
              </div>
              <p className="font-medium capitalize text-gray-900 dark:text-white">{data.category}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                 <MapPin className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Location</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{data.locationName || "No specific location provided"}</p>
            </div>
          </div>

          <div>
             <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Description</p>
             <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-gray-700 dark:text-gray-300 text-sm leading-relaxed border border-gray-100 dark:border-gray-700">
               {data.description}
             </div>
          </div>

          {data.imageUrl && (
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Attached Evidence</p>
              <div className="h-48 w-full md:w-64 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 relative">
                <img src={data.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
        <button onClick={() => router.back()} className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft className="w-5 h-5" /> Edit
        </button>
        <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 dark:bg-green-500 text-white font-bold hover:bg-green-700 dark:hover:bg-green-600 shadow-lg shadow-green-200 dark:shadow-green-900/30 transition disabled:opacity-70">
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>) : (<><CheckCircle className="w-5 h-5" /> Submit Report</>)}
        </button>
      </div>
    </div>
  );
}

export default function ReviewReportPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans flex flex-col justify-center">
      <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin"/></div>}>
        <ReviewContent />
      </Suspense>
    </div>
  );
}