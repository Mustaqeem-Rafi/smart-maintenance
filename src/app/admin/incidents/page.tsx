"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  User
} from "lucide-react";

// Data Interface matching your DB
interface Incident {
  _id: string;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  location: { address?: string };
  reportedBy: { name: string };
  assignedTo?: { name: string };
  createdAt: string;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // We reuse the admin API we made earlier
        const res = await fetch("/api/admin/incidents");
        const data = await res.json();
        if (data.incidents) setIncidents(data.incidents);
      } catch (error) {
        console.error("Failed to fetch incidents", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper: Priority Styles
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-700 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800";
      case "Medium": return "text-orange-700 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800";
      case "Low": return "text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800";
      default: return "text-gray-700 bg-gray-50 border-gray-100";
    }
  };

  // Helper: Status Styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Open": return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300";
      case "In Progress": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Resolved": return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  // Helper: Priority Icon
  const PriorityIcon = ({ priority }: { priority: string }) => {
    if (priority === "High") return <ArrowUp className="w-4 h-4" />;
    if (priority === "Low") return <ArrowDown className="w-4 h-4" />;
    return <div className="w-2 h-2 rounded-full bg-current" />;
  };

  // --- Filter & Pagination Logic ---
  const filteredIncidents = incidents.filter(incident => 
    incident.title.toLowerCase().includes(search.toLowerCase()) ||
    incident._id.toLowerCase().includes(search.toLowerCase()) ||
    incident.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* 1. Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Incidents</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track all campus issues.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link 
              href="/report" 
              className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Report New Incident</span>
            </Link>
          </div>
        </div>

        {/* 2. Filters & Search Toolbar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by ID, Title, or Category..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {['Status', 'Priority', 'Type', 'Date Range'].map((filter) => (
              <button key={filter} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                {filter}: All <Filter className="w-3 h-3" />
              </button>
            ))}
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium ml-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* 3. The Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="px-6 py-4">ID / Subject</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                   <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">Loading incidents...</td></tr>
                ) : paginatedIncidents.length === 0 ? (
                   <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No incidents found matching your search.</td></tr>
                ) : (
                  paginatedIncidents.map((incident) => (
                    <tr 
                      key={incident._id} 
                      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/incidents/${incident._id}`} className="block">
                          <span className="block text-xs font-mono text-gray-500 mb-1">
                            #{incident._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                            {incident.title}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {incident.category}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {incident.location?.address || "GPS Coords"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityStyle(incident.priority)}`}>
                          <PriorityIcon priority={incident.priority} />
                          {incident.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(incident.status)}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {incident.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                              {incident.assignedTo.name.charAt(0)}
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">{incident.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredIncidents.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredIncidents.length)}</span> of <span className="font-medium">{filteredIncidents.length}</span>
            </p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    currentPage === i + 1 
                      ? "bg-blue-600 text-white" 
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}