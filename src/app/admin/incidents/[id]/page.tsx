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
  MoreVertical, 
  User, 
  AlertCircle,
  Briefcase
} from "lucide-react";

// Define Interface
interface IncidentDetail {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: { address?: string; coordinates?: number[] };
  reportedBy: { name: string; email: string };
  assignedTo?: { name: string; email: string };
  createdAt: string;
  images: string[];
}

export default function IncidentDetailsPage() {
  const { id } = useParams(); // Get ID from URL
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res = await fetch(`/api/incidents/${id}`);
        const data = await res.json();
        if (res.ok) {
          setIncident(data.incident);
        }
      } catch (error) {
        console.error("Error fetching incident:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchIncident();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading Incident Details...</div>;
  if (!incident) return <div className="p-8 text-center text-red-500">Incident not found.</div>;

  // Helper for colors
  const getPriorityColor = (p: string) => {
    if (p === 'High') return 'text-red-600 bg-red-50 border-red-200';
    if (p === 'Medium') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 sm:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/admin/incidents" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Incidents
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-900 dark:text-white">{incident._id}</span>
        </div>

        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{incident.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(incident.priority)}`}>
                {incident.priority}
              </span>
            </div>
            <p className="text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Reported on {new Date(incident.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-3">
            {/* Action Buttons */}
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition">
              Update Status
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition flex items-center gap-2">
              <User className="w-4 h-4" /> Assign Technician
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Details) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Key Details Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
                Incident Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-900 dark:text-gray-200 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" /> {incident.category}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium text-gray-900 dark:text-gray-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> {incident.location?.address || "GPS Coordinates"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Reported By</p>
                  <p className="font-medium text-gray-900 dark:text-gray-200">
                    {incident.reportedBy?.name || "Unknown"}
                    <span className="block text-xs text-gray-500 font-normal">{incident.reportedBy?.email}</span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned Technician</p>
                  {incident.assignedTo ? (
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {incident.assignedTo.name}
                      <span className="block text-xs text-gray-500 font-normal">{incident.assignedTo.email}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
                      Unassigned
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {incident.description}
              </p>
            </div>

            {/* Photos Card */}
            {incident.images && incident.images.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Photos & Attachments</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {incident.images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative group">
                      <img 
                        src={img} 
                        alt={`Evidence ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Timeline) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Timeline</h2>
              
              <div className="relative pl-6 border-l border-gray-200 dark:border-gray-700 space-y-8">
                
                {/* Event 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Incident Created</p>
                  <p className="text-xs text-gray-500">{new Date(incident.createdAt).toLocaleString()}</p>
                </div>

                {/* Event 2 (Conditional) */}
                {incident.assignedTo && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Technician Assigned</p>
                    <p className="text-xs text-gray-500">Pending acceptance</p>
                  </div>
                )}

                {/* Event 3 */}
                <div className="relative">
                   <div className="absolute -left-[31px] top-0 h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900">
                    <MoreVertical className="w-3 h-3 text-white" />
                   </div>
                   <p className="text-sm text-gray-500">Current Status: <span className="font-medium text-gray-700 dark:text-gray-300">{incident.status}</span></p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}