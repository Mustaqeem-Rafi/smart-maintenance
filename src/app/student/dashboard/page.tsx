'use client'; // Required for animations

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, AlertCircle, CheckCircle, Plus, Clock, ChevronDown, ChevronUp, Wrench, UserCheck } from 'lucide-react';

// --- Mock Data for "Real-Time" feel ---
const MOCK_COMPLAINTS = [
  {
    id: "INC-2025-001",
    title: "Broken AC in Room 304",
    category: "Electrical",
    date: "2025-11-20",
    status: "In Progress", // Options: Pending, Assigned, In Progress, Resolved
    currentStep: 2, // 0: Reported, 1: Assigned, 2: In Progress, 3: Resolved
    timeline: [
      { step: "Reported", time: "10:00 AM", completed: true },
      { step: "Technician Assigned", time: "11:30 AM", completed: true },
      { step: "Work in Progress", time: "Now", completed: false },
      { step: "Resolved", time: "-", completed: false },
    ]
  },
  {
    id: "INC-2025-002",
    title: "Leaking Tap in Washroom",
    category: "Plumbing",
    date: "2025-11-18",
    status: "Resolved",
    currentStep: 4,
    timeline: [
      { step: "Reported", time: "Nov 18", completed: true },
      { step: "Technician Assigned", time: "Nov 18", completed: true },
      { step: "Work in Progress", time: "Nov 19", completed: true },
      { step: "Resolved", time: "Nov 19", completed: true },
    ]
  }
];

// --- Main Page Component ---
export default function StudentDashboard() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen w-full font-sans">
      
      {/* Header with Fade In */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Track your maintenance requests in real-time.</p>
        </div>
        
        <Link href="/student/report">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30 font-medium"
          >
            <Plus size={20} />
            Report New Issue
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Grid with Staggered Entry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Active Cases" value="1" icon={<Clock className="text-orange-500" />} delay={0.1} />
        <StatCard title="Resolved" value="14" icon={<CheckCircle className="text-green-500" />} delay={0.2} />
        <StatCard title="Total Reports" value="15" icon={<FileText className="text-blue-500" />} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section: Complaint History & Tracker */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent Activity</h2>
          
          {MOCK_COMPLAINTS.map((complaint, index) => (
            <ComplaintCard key={complaint.id} data={complaint} index={index} />
          ))}
        </div>

        {/* Sidebar: Profile */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl mb-4">
                JD
              </div>
              <h3 className="text-xl font-bold text-slate-900">John Doe</h3>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mt-2">
                Student
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- Components ---

// 1. Stat Card Component
function StatCard({ title, value, icon, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
    >
      <div>
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center">
        {icon}
      </div>
    </motion.div>
  );
}

// 2. Complaint Card with Expandable Tracker
function ComplaintCard({ data, index }: any) {
  const [isOpen, setIsOpen] = useState(false);

  const isResolved = data.status === "Resolved";
  const statusColor = isResolved ? "text-green-600 bg-green-50 border-green-200" : "text-amber-600 bg-amber-50 border-amber-200";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-6 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isResolved ? 'bg-green-100' : 'bg-amber-100'}`}>
              {isResolved ? <CheckCircle className="text-green-600" size={24} /> : <Wrench className="text-amber-600" size={24} />}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800">{data.title}</h4>
              <p className="text-sm text-slate-500">{data.id} • {data.category}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor} flex items-center gap-2`}>
                {!isResolved && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
                {data.status}
             </span>
             <span className="text-xs text-slate-400">{data.date}</span>
          </div>
        </div>
      </div>

      {/* Expandable Tracker Section */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 border-t border-slate-100"
          >
            <div className="p-6">
              <h5 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wide">Real-Time Status</h5>
              
              {/* The Visual Tracker Line */}
              <div className="relative flex items-center justify-between w-full">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 -translate-y-1/2 rounded-full"></div>
                
                {/* Active Progress Line (Dynamic Width) */}
                <div 
                    className={`absolute top-1/2 left-0 h-1 -z-0 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out ${isResolved ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${(data.currentStep / 3) * 100}%` }}
                ></div>

                {/* Steps */}
                {data.timeline.map((step: any, i: number) => {
                  const isCompleted = i <= data.currentStep;
                  const isCurrent = i === data.currentStep;
                  
                  return (
                    <div key={i} className="relative z-10 flex flex-col items-center group">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-500
                          ${isCompleted 
                            ? (isResolved ? 'bg-green-500 border-green-500 scale-110' : 'bg-blue-500 border-blue-500 scale-110') 
                            : 'bg-white border-gray-300'}`}
                      >
                        {isCompleted && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <div className="absolute top-10 w-32 text-center">
                        <p className={`text-xs font-bold ${isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>{step.step}</p>
                        <p className="text-[10px] text-slate-400">{step.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="h-8"></div> {/* Spacing for text labels below circles */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}