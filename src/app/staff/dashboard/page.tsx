"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import UserNotificationBell from "@/src/components/UserNotificationBell"; 

import { 
  Search, 
  Plus, 
  Inbox, 
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Incident {
  _id: string;
  title: string;
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
  priority: string;
}

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/incidents/my-reports"); 
        if (res.ok) {
          const data = await res.json();
          setIncidents(data.incidents || []);
        }
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = 
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "Open": return "bg-orange-100 text-orange-700 border-orange-200";
      case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Resolved": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] font-sans text-slate-900">
      
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 px-4 sm:px-10 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">TP</div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">Incident Reporting</h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link href="/staff/dashboard" className="text-gray-900 font-semibold">Home</Link>
            <Link href="/staff/reports" className="hover:text-blue-600 transition">My Reports</Link>
            <Link href="/staff/analytics" className="hover:text-blue-600 transition">Analytics</Link>
          </nav>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            
            <UserNotificationBell />
            
            {/* --- UPDATE: Clickable Profile Avatar --- */}
            <Link href="/staff/profile"> 
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200 hover:ring-2 hover:ring-blue-300 transition cursor-pointer">
                {session?.user?.name?.charAt(0) || "S"}
              </div>
            </Link>
            {/* -------------------------------------- */}

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-10 py-8">
        
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
              Good Morning, {session?.user?.name?.split(" ")[0] || "Staff"}
            </h2>
            <p className="text-gray-500">Here's a summary of your recent incident reports.</p>
          </div>
          
          <Link href="/staff/report">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-lg font-bold shadow-lg shadow-blue-200 transition active:scale-95">
              <Plus className="w-5 h-5" />
              <span>Report New Incident</span>
            </button>
          </Link>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">My Recent Reports</h3>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search reports by keyword or ID..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["All", "Open", "In Progress", "Resolved"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  statusFilter === filter 
                    ? "bg-blue-50 text-blue-700 border border-blue-100" 
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <Link key={incident._id} href={`/incidents/${incident._id}`}>
                <div className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      {incident.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                        #{incident._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Reported on {new Date(incident.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadgeStyles(incident.status)}`}>
                    {incident.status}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No incidents found</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm">
                {searchQuery || statusFilter !== "All" 
                  ? "Try adjusting your filters." 
                  : "When you report an incident, it will appear here."}
              </p>
              {!searchQuery && statusFilter === "All" && (
                <Link href="/staff/report" className="mt-6 text-blue-600 font-bold text-sm hover:underline">
                  Create your first report
                </Link>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}