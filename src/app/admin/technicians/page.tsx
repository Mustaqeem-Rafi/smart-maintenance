"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Loader2, 
  ChevronDown 
} from "lucide-react";

interface Technician {
  _id: string;
  name: string;
  email: string;
  department: string;
  isAvailable: boolean;
  activeIncidents: number;
}

// --- Reusable Dropdown Component ---
interface DropdownProps {
  label: string;
  current: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const FilterDropdown = ({ label, current, options, isOpen, onToggle, onSelect, onClose }: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium transition select-none ${
          current !== "All" 
            ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        {label}: {current} <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-none ${
                current === opt ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- Filter States ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  
  // Dropdown UI State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/technicians/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTechnicians((prev) => prev.filter((tech) => tech._id !== id));
      } else {
        alert("Failed to delete technician.");
      }
    } catch (error) {
      alert("Error deleting technician.");
    } finally {
      setDeletingId(null);
    }
  };

  // --- Filtering Logic ---
  const filteredTechs = technicians.filter(t => {
    // 1. Search
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.department?.toLowerCase().includes(search.toLowerCase());

    // 2. Status Filter
    const statusString = t.isAvailable ? "Available" : "Offline";
    const matchesStatus = statusFilter === "All" || statusString === statusFilter;

    // 3. Specialty Filter
    const matchesSpecialty = specialtyFilter === "All" || t.department === specialtyFilter;

    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans p-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8">
          <h1 className="text-gray-900 dark:text-white text-3xl font-black tracking-tight">
            Technicians Management
          </h1>
        </header>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full md:max-w-md relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Search by name, ID, or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link 
              href="/admin/technicians/new"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-colors w-full md:w-auto shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Add Technician</span>
            </Link>
          </div>

          {/* --- Dynamic Filters --- */}
          <div className="flex gap-3 pt-4 flex-wrap">
            <FilterDropdown 
              label="Status"
              current={statusFilter}
              options={["All", "Available", "Offline"]}
              isOpen={activeDropdown === 'status'}
              onToggle={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              onSelect={(val) => { setStatusFilter(val); setActiveDropdown(null); }}
              onClose={() => setActiveDropdown(null)}
            />
            
            <FilterDropdown 
              label="Specialty"
              current={specialtyFilter}
              options={["All", "Electrical", "Plumbing", "Internet", "Civil", "HVAC", "General"]}
              isOpen={activeDropdown === 'specialty'}
              onToggle={() => setActiveDropdown(activeDropdown === 'specialty' ? null : 'specialty')}
              onSelect={(val) => { setSpecialtyFilter(val); setActiveDropdown(null); }}
              onClose={() => setActiveDropdown(null)}
            />
          </div>
        </div>

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
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading staff...</td></tr>
                ) : filteredTechs.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No technicians found.</td></tr>
                ) : (
                  filteredTechs.map((tech) => (
                    <tr key={tech._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                            {tech.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{tech.name}</div>
                            <div className="text-gray-500 text-xs font-mono">ID: {tech._id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tech.isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 px-2.5 py-1 text-xs font-medium border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-600 px-2.5 py-1 text-xs font-medium border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Offline
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300 font-mono text-xs">
                          {tech.activeIncidents} Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {tech.department || "General"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {tech.email}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {/* View Button - Links to Details Page */}
                          <Link 
                            href={`/admin/technicians/${tech._id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDelete(tech._id, tech.name)}
                            disabled={deletingId === tech._id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                          >
                            {deletingId === tech._id ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
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