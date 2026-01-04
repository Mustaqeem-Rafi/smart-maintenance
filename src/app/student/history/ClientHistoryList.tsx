'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Wrench, ChevronDown, FileText, Clock, AlertCircle } from 'lucide-react';

// Helper: Map DB Status to Timeline Steps
const getProgressSteps = (status: string, dateStr: string) => {
  const date = new Date(dateStr).toLocaleDateString();
  
  const steps = [
    { step: "Reported", date: date, completed: true },
    { step: "In Progress", date: "Pending", completed: false },
    { step: "Resolved", date: "Pending", completed: false },
  ];

  let currentStep = 0; // 0 = Reported

  if (status === 'In Progress') {
    currentStep = 1;
    steps[1].completed = true;
    steps[1].date = "Active";
  } else if (status === 'Resolved') {
    currentStep = 2;
    steps[1].completed = true;
    steps[2].completed = true;
    steps[2].date = "Completed";
  } 

  return { steps, currentStep };
};

export default function ClientHistoryList({ complaints }: { complaints: any[] }) {
  if (!complaints || complaints.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200"
      >
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No History Found</h3>
        <p className="text-slate-500 mt-2">You haven't reported any incidents yet.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {complaints.map((complaint, index) => (
        <HistoryCard key={complaint._id} data={complaint} index={index} />
      ))}
    </div>
  );
}

function HistoryCard({ data, index }: { data: any, index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Note: Using 'createdAt' from Incident model instead of 'dateSubmitted'
  const { steps, currentStep } = getProgressSteps(data.status, data.createdAt);
  const isResolved = data.status === 'Resolved';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
        isOpen ? 'shadow-xl border-blue-200 ring-1 ring-blue-100' : 'shadow-sm border-slate-200 hover:shadow-md'
      }`}
    >
      {/* Header Section */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 cursor-pointer flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
      >
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-2xl ${isResolved ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            {isResolved ? <CheckCircle size={24} /> : <Wrench size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{data.title}</h3>
            <p className="text-slate-500 text-sm mt-1 line-clamp-1">{data.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <div className="text-right">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
               isResolved ? 'bg-green-50 text-green-700 border border-green-200' : 
               data.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
               'bg-orange-50 text-orange-700 border border-orange-200'
            }`}>
              {!isResolved && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                </span>
              )}
              {data.status}
            </span>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              {new Date(data.createdAt).toLocaleDateString()}
            </p>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="text-slate-300" />
          </motion.div>
        </div>
      </div>

      {/* Tracker Section */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50/50 border-t border-slate-100"
          >
            <div className="p-8">
              {/* Timeline Bar */}
              <div className="relative mb-8 px-4">
                <div className="absolute top-2.5 left-0 w-full h-1 bg-gray-200 rounded-full z-0"></div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 2) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`absolute top-2.5 left-0 h-1 rounded-full z-0 ${isResolved ? 'bg-green-500' : 'bg-blue-600'}`}
                />

                <div className="relative z-10 flex justify-between w-full">
                  {steps.map((s, i) => {
                    const isCompleted = i <= currentStep;
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + (i * 0.1) }}
                          className={`w-6 h-6 rounded-full border-4 bg-white transition-colors duration-500 ${
                            isCompleted 
                              ? (isResolved ? 'border-green-500' : 'border-blue-600') 
                              : 'border-gray-300'
                          }`}
                        />
                        <div className="mt-3 text-center w-24">
                          <p className={`text-xs font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{s.step}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                 <div>
                    <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Category</span>
                    <p className="text-slate-700 font-medium">{data.category}</p>
                 </div>
                 <div>
                    <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Priority</span>
                    <p className="text-slate-700 font-medium">{data.priority}</p>
                 </div>
                 <div>
                    <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Complaint ID</span>
                    <p className="text-slate-700 font-medium font-mono text-xs mt-1">
                      {data._id ? data._id.slice(-6).toUpperCase() : '---'}
                    </p>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}