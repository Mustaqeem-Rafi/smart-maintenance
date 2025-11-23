'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Plus, Clock, Wrench, Loader2 } from 'lucide-react';
import UserNotificationBell from "@/src/components/UserNotificationBell"; // <--- Imported Bell

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, resolved: 0, total: 0 });

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

  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header Section with Bell */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Track your maintenance requests in real-time.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* NOTIFICATION BELL ADDED HERE */}
          <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200">
            <UserNotificationBell />
          </div>

          <Link href="/report">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30 font-medium"
            >
              <Plus size={20} />
              Report New Issue
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section: History */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent Activity</h2>
          
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : complaints.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
              No incidents reported yet.
            </div>
          ) : (
            complaints.map((complaint, index) => (
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
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl mb-4">
                ME
              </div>
              <h3 className="text-xl font-bold text-slate-900">My Profile</h3>
              <Link href="/student/profile" className="text-sm text-blue-600 hover:underline mt-2">View Full Profile</Link>
            </div>
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

function ComplaintCard({ data, index }: any) {
  const [isOpen, setIsOpen] = useState(false);

  // Determine step based on status
  let currentStep = 1; 
  if (data.status === "In Progress") currentStep = 2;
  if (data.status === "Resolved") currentStep = 3;

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
          <div className="flex flex-col items-end gap-2">
             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor} flex items-center gap-2`}>
                {data.status}
             </span>
             <span className="text-xs text-slate-400">{new Date(data.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 border-t border-slate-100"
          >
            <div className="p-6">
              <h5 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wide">Live Status</h5>
              <div className="relative flex items-center justify-between w-full px-4">
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -z-0 rounded-full"></div>
                <div 
                    className={`absolute top-4 left-0 h-1 -z-0 rounded-full transition-all duration-1000 ease-out ${isResolved ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                ></div>
                {["Reported", "In Progress", "Resolved"].map((label, i) => {
                  const stepNum = i + 1;
                  const isCompleted = stepNum <= currentStep;
                  return (
                    <div key={i} className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all ${isCompleted ? (isResolved ? 'bg-green-500 border-green-500' : 'bg-blue-500 border-blue-500') : 'bg-white border-gray-300'}`}>
                        {isCompleted && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <p className={`text-xs font-bold mt-2 ${stepNum === currentStep ? 'text-slate-800' : 'text-slate-400'}`}>{label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}