'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Plus, 
  Clock, 
  Wrench, 
  Loader2, 
  FileDown, 
  Search, 
  Filter,
  ChevronRight 
} from 'lucide-react';
import UserNotificationBell from "@/src/components/UserNotificationBell";
import { generateIncidentReport } from "@/src/lib/generatePDF";

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, resolved: 0, total: 0 });
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/incidents/my-reports");
        const data = await res.json();
        
        if (data.incidents) {
          const items = data.incidents;
          setComplaints(items);
          
          const active = items.filter((i: any) => i.status !== 'Resolved').length;
          const resolved = items.filter((i: any) => i.status === 'Resolved').length;
          setStats({ active, resolved, total: items.length });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Logic
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, complaints]);

  const handleDownloadReport = () => {
    generateIncidentReport(filteredComplaints, "Student User");
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Track your maintenance requests in real-time.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200">
            <UserNotificationBell />
          </div>

          <button 
            onClick={handleDownloadReport}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm font-medium hover:bg-slate-50 transition-all"
          >
            <FileDown size={18} className="text-blue-600" />
            Export PDF
          </button>

          <Link href="/report">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30 font-medium whitespace-nowrap"
            >
              <Plus size={20} />
              Report Issue
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Active Cases" value={stats.active} icon={<Clock className="text-orange-500" />} delay={0.1} />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle className="text-green-500" />} delay={0.2} />
        <StatCard title="Total Reports" value={stats.total} icon={<FileText className="text-blue-500" />} delay={0.3} />
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Recent Activity</h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search by title..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <select 
              className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
              {searchQuery ? `No results found for "${searchQuery}"` : "No incidents reported yet."}
            </div>
          ) : (
            filteredComplaints.map((complaint, index) => (
              <ComplaintCard key={complaint._id} data={complaint} index={index} />
            ))
          )}
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 sticky top-8 text-center">
              <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl mb-4 mx-auto">ME</div>
              <h3 className="text-xl font-bold text-slate-900">My Profile</h3>
              <Link href="/student/profile" className="text-sm text-blue-600 hover:underline mt-2 inline-block">View Full Profile</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatCard({ title, value, icon, delay }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay, duration: 0.4 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
    >
      <div>
        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
      </div>
      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">{icon}</div>
    </motion.div>
  );
}

function ComplaintCard({ data, index }: any) {
  const [isOpen, setIsOpen] = useState(false);
  let currentStep = data.status === "Resolved" ? 3 : (data.status === "In Progress" ? 2 : 1);
  const isResolved = data.status === "Resolved";
  const statusColor = isResolved ? "text-green-700 bg-green-50 border-green-200" : (data.status === "In Progress" ? "text-blue-700 bg-blue-50 border-blue-200" : "text-orange-700 bg-orange-50 border-orange-200");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="p-6 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isResolved ? 'bg-green-100' : 'bg-amber-100'}`}>
              {isResolved ? <CheckCircle className="text-green-600" size={24} /> : <Wrench className="text-amber-600" size={24} />}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800">{data.title}</h4>
              <p className="text-sm text-slate-500">#{data._id.slice(-6).toUpperCase()} • {data.category}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>{data.status}</span>
             <span className="text-xs text-slate-400">{new Date(data.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-slate-50 border-t border-slate-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Live Status</h5>
                <Link href={`/student/incidents/${data._id}`} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                  Details & Chat <ChevronRight size={14} />
                </Link>
              </div>
              <div className="relative flex items-center justify-between w-full px-4 mb-4">
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 z-0"></div>
                <div className={`absolute top-4 left-0 h-1 z-0 transition-all duration-1000 ${isResolved ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
                {["Reported", "In Progress", "Resolved"].map((label, i) => {
                  const isCompleted = (i + 1) <= currentStep;
                  return (
                    <div key={i} className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${isCompleted ? (isResolved ? 'bg-green-500 border-green-500' : 'bg-blue-500 border-blue-500') : 'bg-white border-gray-300'}`}>
                        {isCompleted && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <p className={`text-xs font-bold mt-2 ${i + 1 === currentStep ? 'text-slate-800' : 'text-slate-400'}`}>{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}