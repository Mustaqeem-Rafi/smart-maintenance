"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, Mail, Eye, Trash2 } from "lucide-react";

interface Technician {
  _id: string;
  name: string;
  email: string;
  department: string;
  isAvailable: boolean;
  activeIncidents: number;
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await fetch("/api/technicians");
      const data = await res.json();
      if (data.technicians) {
        setTechnicians(data.technicians);
      }
    } catch (error) {
      console.error("Failed to fetch technicians");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredTechs = technicians.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-gray-900 dark:text-white text-3xl font-black tracking-tight">
            Technicians Management
          </h1>
        </header>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search Bar */}
            <div className="w-full md:max-w-md relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Search by name, ID, or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Add Button */}
            <Link 
              href="/admin/technicians/new" // We will create this page next if needed
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-colors w-full md:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Technician</span>
            </Link>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-3 pt-4 overflow-x-auto">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700">
              Status: All <Filter className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700">
              Specialty: All <Filter className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Technician</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Active Incidents</th>
                  <th className="px-6 py-4">Specialty</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading staff...</td></tr>
                ) : filteredTechs.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No technicians found.</td></tr>
                ) : (
                  filteredTechs.map((tech) => (
                    <tr key={tech._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {tech.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{tech.name}</div>
                            <div className="text-gray-500 text-xs">ID: {tech._id.substring(0, 6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tech.isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 px-2.5 py-1 text-xs font-medium border border-green-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-600 px-2.5 py-1 text-xs font-medium border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Offline
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                        {tech.activeIncidents}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {tech.department || "General"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {tech.email}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer (Static for MVP) */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing all results</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded text-sm disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border rounded text-sm disabled:opacity-50" disabled>Next</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}