"use client";

import { useEffect, useState, useRef } from "react";
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
  MapPin,
  X,
  ChevronDown,
  Loader2,
  Calendar,
  Eye,
  Trash2
} from "lucide-react";

// --- Types ---
interface Incident {
  _id: string;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  location: { address?: string };
  assignedTo?: { name: string };
  createdAt: string;
}

interface DropdownProps {
  label: string;
  name: string;
  current: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onClose: () => void;
}

// --- Dropdown Components ---

// 1. Filter Dropdown (Top Bar)
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

// 2. Action Menu (For Table Rows)
const ActionMenu = ({ incidentId, onDelete }: { incidentId: string, onDelete: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <Link 
            href={`/admin/incidents/${incidentId}`}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition border-b border-gray-100 dark:border-gray-800"
          >
            <Eye className="w-4 h-4 text-blue-500" /> View Details
          </Link>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(incidentId); }}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// --- Main Component ---
export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All");

  // Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/incidents");
      const data = await res.json();
      if (data.incidents) setIncidents(data.incidents);
    } catch (error) {
      console.error("Failed to fetch incidents", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Action: Delete Incident ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this incident?")) return;

    try {
      const res = await fetch(`/api/incidents/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Optimistic update
        setIncidents(prev => prev.filter(i => i._id !== id));
      } else {
        alert("Failed to delete incident");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Helpers
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-700 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800";
      case "Medium": return "text-orange-700 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800";
      case "Low": return "text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800";
      default: return "text-gray-700 bg-gray-50 border-gray-100";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Open": return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300";
      case "In Progress": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Resolved": return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const PriorityIcon = ({ priority }: { priority: string }) => {
    if (priority === "High") return <ArrowUp className="w-4 h-4" />;
    if (priority === "Low") return <ArrowDown className="w-4 h-4" />;
    return <div className="w-2 h-2 rounded-full bg-current" />;
  };

  // Filtering
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.title.toLowerCase().includes(search.toLowerCase()) ||
      incident._id.toLowerCase().includes(search.toLowerCase()) ||
      incident.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || incident.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || incident.priority === priorityFilter;
    const matchesType = typeFilter === "All" || incident.category === typeFilter;

    let matchesDate = true;
    if (dateFilter !== "All") {
      const incidentDate = new Date(incident.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - incidentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (dateFilter === "Last 7 Days") matchesDate = diffDays <= 7;
      if (dateFilter === "Last 30 Days") matchesDate = diffDays <= 30;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesDate;
  });

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
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

        {/* Filters Toolbar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 z-20 relative">
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

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown 
              label="Status" 
              name="status"
              current={statusFilter} 
              options={["All", "Open", "In Progress", "Resolved"]} 
              isOpen={activeDropdown === 'status'}
              onToggle={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              onSelect={(val) => { setStatusFilter(val); setActiveDropdown(null); }}
              onClose={() => setActiveDropdown(null)}
            />
            <FilterDropdown 
              label="Priority" 
              name="priority"
              current={priorityFilter} 
              options={["All", "High", "Medium", "Low"]} 
              isOpen={activeDropdown === 'priority'}
              onToggle={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
              onSelect={(val) => { setPriorityFilter(val); setActiveDropdown(null); }}
              onClose={() => setActiveDropdown(null)}
            />
            <FilterDropdown 
              label="Type" 
              name="type"
              current={typeFilter} 
              options={["All", "Water", "Electricity", "Internet", "Civil", "Other"]} 
              isOpen={activeDropdown === 'type'}
              onToggle={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
              onSelect={(val) => { setTypeFilter(val); setActiveDropdown(null); }}
              onClose={() => setActiveDropdown(null)}
            />
            <FilterDropdown 
              label="Date Range" 
              name="date"
              current={dateFilter} 
              options={["All", "Last 7 Days", "Last 30 Days"]} 
              isOpen={activeDropdown === 'date'}
              onToggle={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
              onSelect={(val) => { setDateFilter(val); setActiveDropdown(null); }}
              onClose={() => setActiveDropdown(null)}
            />

            {(statusFilter !== "All" || priorityFilter !== "All" || typeFilter !== "All" || dateFilter !== "All" || search) && (
              <button 
                onClick={() => {
                  setStatusFilter("All");
                  setPriorityFilter("All");
                  setTypeFilter("All");
                  setDateFilter("All");
                  setSearch("");
                }}
                className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden z-0 relative">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase font-medium">
                <tr>
                  {/* Checkbox Removed Here */}
                  <th className="px-6 py-4 pl-8">ID / Subject</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Reported On</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                   <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500"><div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div></td></tr>
                ) : paginatedIncidents.length === 0 ? (
                   <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No incidents found matching your filters.</td></tr>
                ) : (
                  paginatedIncidents.map((incident) => (
                    <tr 
                      key={incident._id} 
                      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"
                    >
                      {/* Checkbox Removed Here */}
                      <td className="px-6 py-4 pl-8">
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
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(incident.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
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
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{incident.assignedTo.name}</span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionMenu incidentId={incident._id} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredIncidents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredIncidents.length)}</span> of <span className="font-medium">{filteredIncidents.length}</span> results
            </p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
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