"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, MapPin, Calendar, ArrowLeft, Filter } from "lucide-react";
import Link from "next/link";

export default function MyReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Corrected URL to match the API
        const res = await fetch("/api/incidents/my-reports");
        const data = await res.json();
        if (data.incidents) setReports(data.incidents);
      } catch (error) {
        console.error("Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filtered = reports.filter(r => {
    const matchesFilter = filter === "All" || r.status === filter;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r._id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (s: string) => {
    if (s === 'Open') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (s === 'In Progress') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] font-sans p-4 sm:p-10">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/staff/dashboard" className="p-2 bg-white rounded-lg hover:bg-gray-50 border border-gray-200 transition">
             <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Reports</h1>
            <p className="text-gray-500 mt-1">Full history of your submitted incidents.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by ID or Title..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${
                  filter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No reports found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((report) => (
              <Link key={report._id} href={`/incidents/${report._id}`}>
                <div className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{report.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">
                        #{report._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {new Date(report.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {report.location?.address || "GPS Location"}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}