"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Briefcase,
  Loader2,
  AlertCircle
} from "lucide-react";

interface IncidentDetail {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: { address?: string };
  createdAt: string;
  images: string[];
  // Note: We typically don't show "assignedTo" or internal details to students
}

export default function StudentIncidentPage() {
  const params = useParams();
  const id = params?.id as string; 

  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchIncident = async () => {
      try {
        // We reuse the same API (It's public read access)
        const res = await fetch(`/api/incidents/${id}`);
        if (!res.ok) throw new Error("Incident not found");
        const data = await res.json();
        setIncident(data.incident);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (error || !incident) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="inline-flex p-3 bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Incident Not Found</h2>
        <p className="text-gray-500 mb-6">This report ID does not exist or you do not have permission to view it.</p>
        <Link href="/report" className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
          Report a New Issue
        </Link>
      </div>
    </div>
  );

  // Helper: Status Badge Style
  const getStatusBadge = (status: string) => {
    const styles = {
      "Open": "bg-red-100 text-red-700 border-red-200",
      "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Resolved": "bg-green-100 text-green-700 border-green-200"
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Navigation */}
        <div className="mb-6">
          <Link href="/report" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Main Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded">#{incident._id.slice(-6).toUpperCase()}</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5" /> {new Date(incident.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 w-fit ${getStatusBadge(incident.status)}`}>
                {incident.status === "Resolved" ? <CheckCircle className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
                {incident.status}
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Details Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Issue Details</h3>
                <p className="text-gray-600 leading-relaxed">{incident.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Briefcase className="w-4 h-4" /></div>
                  <span className="font-medium">{incident.category} Issue</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><MapPin className="w-4 h-4" /></div>
                  <span className="font-medium">{incident.location?.address || "GPS Location Shared"}</span>
                </div>
              </div>
            </div>

            {/* Evidence / Image Column */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Photo Evidence</h3>
              {incident.images && incident.images.length > 0 ? (
                <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img 
                    src={incident.images[0]} 
                    alt="Incident Evidence" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                  No photos uploaded
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Status Timeline (Simplified for Students) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Progress Timeline</h3>
          <div className="space-y-8 relative pl-4 border-l-2 border-gray-100 ml-2">
            
            {/* Step 1: Reported */}
            <div className="relative">
              <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
              <p className="text-sm font-bold text-gray-900">Report Received</p>
              <p className="text-xs text-gray-500 mt-0.5">We have received your report.</p>
            </div>

            {/* Step 2: In Progress (Conditional) */}
            {(incident.status === "In Progress" || incident.status === "Resolved") && (
              <div className="relative">
                <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-yellow-500 border-4 border-white shadow-sm"></div>
                <p className="text-sm font-bold text-gray-900">Maintenance Team Assigned</p>
                <p className="text-xs text-gray-500 mt-0.5">A technician is working on this issue.</p>
              </div>
            )}

            {/* Step 3: Resolved (Conditional) */}
            {incident.status === "Resolved" && (
              <div className="relative">
                <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                <p className="text-sm font-bold text-gray-900">Issue Resolved</p>
                <p className="text-xs text-gray-500 mt-0.5">This ticket has been closed.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}