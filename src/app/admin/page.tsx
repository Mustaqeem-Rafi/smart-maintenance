"use client"; // Client component because we need interactivity (onClick)

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, MapPin, UserPlus, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Incident {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  location: { address?: string };
  createdAt: string;
}

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch incidents on load
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      // We need to build this API route next!
      const res = await fetch("/api/admin/incidents");
      const data = await res.json();
      if (res.ok) setIncidents(data.incidents);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-red-100 text-red-700";
      case "In Progress": return "bg-yellow-100 text-yellow-700";
      case "Resolved": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of campus incidents</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={fetchIncidents}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <Link 
              href="/admin/technicians/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" /> Add Technician
            </Link>
          </div>
        </div>

        {/* Stats Cards (Simple MVP) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {incidents.filter(i => i.status === 'Open').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-100 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Techs</p>
                <p className="text-2xl font-bold text-blue-600">3</p> {/* Hardcoded for now */}
              </div>
              <Clock className="w-8 h-8 text-blue-100 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved (24h)</p>
                <p className="text-2xl font-bold text-green-600">
                   {incidents.filter(i => i.status === 'Resolved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-100 text-green-600" />
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading incidents...</td></tr>
                ) : incidents.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No incidents reported yet.</td></tr>
                ) : (
                  incidents.map((incident) => (
                    <tr key={incident._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{incident.title}</td>
                      <td className="px-6 py-4 text-gray-600">{incident.category}</td>
                      <td className="px-6 py-4 text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {incident.location?.address || "GPS Coordinates"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                          Assign Tech
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}