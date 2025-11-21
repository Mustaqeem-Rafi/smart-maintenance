'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, BookOpen, Shield, Key, 
  Camera, Edit2, LogOut, MapPin, FileText, CheckCircle 
} from 'lucide-react';

interface UserProfile {
  name: string;
  id: string;
  email: string;
  department: string;
  year: string;
  phone: string;
  avatar: string;
  stats: { totalReports: number; resolved: number; pending: number };
}

export default function ClientProfileView({ user }: { user: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'security'>('overview');

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* --- 1. Hero Section with Gradient Banner --- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-20"
      >
        {/* Banner */}
        <div className="h-48 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-b-3xl shadow-lg relative overflow-hidden">
           <div className="absolute inset-0 bg-white/10 pattern-grid-lg opacity-20" />
        </div>

        {/* Profile Card Floating Overlay */}
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-white p-1 shadow-xl">
              <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-indigo-600 border-4 border-white">
                {user.avatar}
              </div>
            </div>
            <button className="absolute bottom-2 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition hover:scale-110">
              <Camera size={16} />
            </button>
          </div>
          
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              {user.department} • {user.year}
            </p>
          </div>
        </div>

        {/* Quick Stats (Top Right) */}
        <div className="hidden md:flex absolute -bottom-12 right-8 gap-4">
          <StatBadge label="Reports" value={user.stats.totalReports} icon={<FileText size={14} />} />
          <StatBadge label="Resolved" value={user.stats.resolved} icon={<CheckCircle size={14} />} color="green" />
        </div>
      </motion.div>

      {/* --- 2. Navigation Tabs --- */}
      <div className="flex gap-6 border-b border-slate-200 mb-8 px-4">
        <TabButton 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')} 
          label="Overview" 
          icon={<User size={18} />} 
        />
        <TabButton 
          active={activeTab === 'security'} 
          onClick={() => setActiveTab('security')} 
          label="Security & Settings" 
          icon={<Shield size={18} />} 
        />
      </div>

      {/* --- 3. Content Area (Animated Switch) --- */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Personal Info Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Personal Details</h3>
                  <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition">
                    <Edit2 size={18} />
                  </button>
                </div>
                
                <InfoRow icon={<User />} label="Student Name" value={user.name} />
                <InfoRow icon={<Key />} label="Student ID" value={user.id} />
                <InfoRow icon={<Mail />} label="Email Address" value={user.email} />
                <InfoRow icon={<Phone />} label="Phone Number" value={user.phone} />
              </div>

              {/* Academic Info Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Academic Information</h3>
                <InfoRow icon={<BookOpen />} label="Department" value={user.department} />
                <InfoRow icon={<MapPin />} label="Campus Location" value="Main Block, Wing A" />
                <InfoRow icon={<Shield />} label="Account Status" value="Active" color="text-green-600" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 max-w-2xl"
            >
              {/* Password Change Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Key className="text-blue-500" /> Change Password
                </h3>
                <div className="space-y-4">
                  <InputField label="Current Password" type="password" placeholder="••••••••" />
                  <InputField label="New Password" type="password" placeholder="••••••••" />
                  <InputField label="Confirm Password" type="password" placeholder="••••••••" />
                  <div className="pt-4">
                    <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-200">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex justify-between items-center">
                <div>
                  <h4 className="text-red-800 font-bold">Sign Out</h4>
                  <p className="text-red-600 text-sm">Securely log out of your account.</p>
                </div>
                <button className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition font-medium flex items-center gap-2">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Helper Components for Clean Code ---

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`pb-4 flex items-center gap-2 text-sm font-medium transition-all relative ${
        active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"
        />
      )}
    </button>
  );
}

function InfoRow({ icon, label, value, color = "text-slate-800" }: any) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`font-medium mt-0.5 ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function InputField({ label, type, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
      />
    </div>
  );
}

function StatBadge({ label, value, icon, color = "blue" }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200"
  };
  
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border shadow-sm bg-white`}>
      <div className={`p-1.5 rounded-full ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
        <p className="text-lg font-bold text-slate-800 leading-none">{value}</p>
      </div>
    </div>
  );
}