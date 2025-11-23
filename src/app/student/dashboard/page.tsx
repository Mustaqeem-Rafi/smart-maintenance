'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Plus, Clock, Wrench, Loader2, AlertCircle } from 'lucide-react';

// Define the interface for your real data
interface Incident {
  _id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, resolved: 0, total: 0 });

  // FETCH REAL DATA
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/incidents/my-reports");
        const data = await res.json();
        
        if (data.incidents) {
          const fetchedIncidents = data.incidents;
          setIncidents(fetchedIncidents);

          // Calculate Stats dynamically
          const resolved = fetchedIncidents.filter((i: Incident) => i.status === 'Resolved').length;
          const active = fetchedIncidents.filter((i: Incident) => i.status !== 'Resolved').length;
          setStats({
            total: fetchedIncidents.length,
            resolved,
            active
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Track your maintenance requests in real-time.</p>
        </div>
        
        <Link href="/report">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30 font-bold hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Report New Issue
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Active Cases" value={stats.active} icon={<Clock className="text-orange-500" />} delay={0.1} />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle className="text-green-500" />} delay={0.2} />
        <StatCard title="Total Reports" value={stats.total} icon={<FileText className="text-blue-500" />} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent Activity</h2>
          
          {incidents.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No complaints found.</p>
              <Link href="/report" className="text-blue-600 font-bold text-sm mt-2 inline-block hover:underline">
                Create your first report
              </Link>
            </div>
          ) : (
            incidents.slice(0, 5).map((complaint, index) => (
              <ComplaintCard key={complaint._id} data={complaint} index={index} />
            ))
          )}
        </div>

        {/* Quick Tips / Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-lg font-bold mb-2">Need Help?</h3>
            <p className="text-blue-100 text-sm mb-4">
              If your issue is urgent (e.g., Fire, Gas Leak), please contact emergency services immediately.
            </p>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 rounded-lg text-sm transition">
              Emergency Contacts
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatCard({ title, value, icon, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.4 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
    >
      <div>
        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
      </div>
      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
        {icon}
      </div>
    </motion.div>
  );
}

function ComplaintCard({ data, index }: { data: Incident, index: number }) {
  const isResolved = data.status === "Resolved";
  const statusColor = isResolved 
    ? "text-green-700 bg-green-50 border-green-200" 
    : data.status === "In Progress" 
      ? "text-blue-700 bg-blue-50 border-blue-200"
      : "text-orange-700 bg-orange-50 border-orange-200";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isResolved ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            {isResolved ? <CheckCircle size={20} /> : <Wrench size={20} />}
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-800">{data.title}</h4>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
              <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                #{data._id.slice(-6).toUpperCase()}
              </span>
              <span>•</span>
              <span>{data.category}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor} inline-block mb-1`}>
                {data.status}
             </span>
             <p className="text-xs text-slate-400 font-medium">
               {new Date(data.createdAt).toLocaleDateString()}
             </p>
        </div>
      </div>
    </motion.div>
  );
}