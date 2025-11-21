"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, PlusCircle, X } from "lucide-react";
import dynamic from 'next/dynamic'; // <--- 1. Import dynamic

// 2. Load Heatmap dynamically with SSR disabled
const HeatmapView = dynamic(() => import("@/src/components/HeatmapView"), { 
  ssr: false, 
  loading: () => <div className="h-96 w-full bg-gray-100 rounded-xl animate-pulse" />
});

// ... rest of your code (interface Incident, export default function...)

interface Incident {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  location: { address?: string; coordinates?: [number, number] };
  createdAt: string;
}

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ open: 0, highPriority: 0, resolved: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/incidents");
        const data = await res.json();
        
        if (data.incidents) {
          setIncidents(data.incidents);
          
          const open = data.incidents.filter((i: Incident) => i.status === 'Open').length;
          const high = data.incidents.filter((i: Incident) => i.priority === 'High' && i.status !== 'Resolved').length;
          const resolved = data.incidents.filter((i: Incident) => i.status === 'Resolved').length;
          
          setStats({ open, highPriority: high, resolved });
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "In Progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Resolved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
        
        {/* 1. Prediction Alert Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-500 h-6 w-6 mt-0.5" />
            <div className="flex flex-col gap-1">
              <p className="text-yellow-900 dark:text-yellow-200 text-base font-bold leading-tight">
                Prediction Alert: High risk of plumbing failure in Hostel B.
              </p>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm font-normal">
                Our prediction engine has detected a pattern of 3 minor leaks in the last 24h.
              </p>
            </div>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-4">
            <button className="text-sm font-bold flex items-center gap-2 text-yellow-900 dark:text-yellow-100 hover:underline">
              View Details <ArrowRight className="w-4 h-4" />
            </button>
            <button className="text-yellow-600 hover:text-yellow-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Page Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-gray-900 dark:text-white text-3xl font-bold">Dashboard</h1>
          <Link 
            href="/report" 
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Incident</span>
          </Link>
        </div>

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* ... (Stats cards remain the same as before) ... */}
          <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Open Incidents</p>
            <p className="text-gray-900 dark:text-white text-3xl font-bold">{stats.open}</p>
            <p className="text-red-600 text-sm font-medium">Requires attention</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">High Priority Alerts</p>
            <p className="text-gray-900 dark:text-white text-3xl font-bold">{stats.highPriority}</p>
            <p className="text-orange-600 text-sm font-medium">Critical issues</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Total Resolved</p>
            <p className="text-gray-900 dark:text-white text-3xl font-bold">{stats.resolved}</p>
            <p className="text-green-600 text-sm font-medium">Good progress</p>
          </div>
        </div>

        {/* 4. Campus Heatmap */}
        <div>
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Campus Incident Heatmap</h3>
            <HeatmapView incidents={incidents} />
        </div>

        {/* 5. Recent Incidents Table */}
        <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold">Recent Incidents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Issue Title</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center">Loading data...</td></tr>
                ) : incidents.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center">No incidents found.</td></tr>
                ) : (
                  incidents.map((incident) => (
                    <tr key={incident._id} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {incident.title}
                      </td>
                      <td className="px-6 py-4">
                        {incident.location?.address || "GPS Location"}
                      </td>
                      <td className="px-6 py-4">{incident.category}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(incident.priority)}`}>
                          {incident.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}