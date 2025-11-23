"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Shield, 
  Briefcase, 
  CheckCircle, 
  Award, 
  Smartphone, 
  RefreshCw, 
  Loader2,
  AlertCircle
} from "lucide-react";

export default function TechnicianProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState("");

  // 1. Detect logged-in user or default to Ramesh for demo
  useEffect(() => {
    if (session?.user?.email) {
      setCurrentEmail(session.user.email);
    } else if (!currentEmail) {
      setCurrentEmail("ramesh@college.edu");
    }
  }, [session]);

  // 2. Fetch Profile Data
  const fetchProfile = async () => {
    if (!currentEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/technician/profile?email=${currentEmail}`);
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentEmail]);

  // 3. Transform API data to UI format (or use defaults if loading)
  const technician = profile ? {
    name: profile.name,
    email: profile.email,
    department: profile.department,
    role: profile.role,
    status: profile.isAvailable ? "Available" : "Busy",
    id: `T-${profile.role.slice(0,1).toUpperCase()}-${new Date(profile.joined).getFullYear()}`,
    phone: profile.phone
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* --- HEADER & DEMO SWITCHER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Technician Profile</h1>
                <p className="text-slate-500 mt-1">Manage your personal information and settings.</p>
            </div>

            {/* User Switcher for Testing */}
            <div className="flex items-center gap-2 bg-white p-1.5 pr-2 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-2 tracking-wider">Viewing As:</span>
                <input 
                    type="text" 
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    className="text-sm p-1 border-b border-slate-200 focus:border-blue-500 outline-none w-48 bg-transparent text-slate-700 font-medium"
                    placeholder="Enter email..."
                />
                <button 
                    onClick={fetchProfile} 
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    title="Reload Profile"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        {loading ? (
             <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-xl border border-slate-100">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Fetching profile details...</p>
             </div>
        ) : !technician ? (
             <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-3xl border border-red-100 text-center p-8">
                <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-red-900">User Not Found</h3>
                <p className="text-red-600 mt-1">Could not find a technician with email: {currentEmail}</p>
             </div>
        ) : (
            <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden group">
                
                {/* Hero Banner with Hover Effect */}
                <div className="h-48 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute -right-10 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
                </div>

                <div className="px-8 pb-8">
                <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 mb-8">
                    
                    {/* Avatar */}
                    <div className="relative group">
                    <div className="h-32 w-32 rounded-3xl bg-white p-1.5 shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-300">
                        <div className="h-full w-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                        <User className="w-16 h-16" />
                        </div>
                    </div>
                    {/* Online Dot */}
                    <div className={`absolute bottom-2 -right-2 w-6 h-6 border-4 border-white rounded-full animate-pulse ${technician.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>

                    {/* ID Badge */}
                    <div className="mt-4 md:mt-0 flex flex-col items-end">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm flex items-center gap-2 ${technician.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        <CheckCircle className="w-4 h-4" /> {technician.status}
                    </span>
                    <p className="text-xs font-mono text-slate-400 mt-2 uppercase tracking-widest">ID: {technician.id}</p>
                    </div>
                </div>

                {/* User Details */}
                <div className="space-y-8">
                    <div>
                    <h1 className="text-3xl font-black text-slate-900 capitalize">{technician.name}</h1>
                    <p className="text-lg text-slate-500 font-medium mt-1 capitalize">{technician.role} • {technician.department} Department</p>
                    </div>

                    {/* Interactive Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { icon: Mail, label: "Email", value: technician.email, color: "blue" },
                        { icon: Briefcase, label: "Department", value: technician.department, color: "orange" },
                        { icon: Shield, label: "Access Level", value: "Level 3 - Secure", color: "purple" },
                        { icon: Smartphone, label: "Phone Contact", value: technician.phone, color: "emerald" },
                    ].map((item, idx) => (
                        <div 
                        key={idx} 
                        className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg hover:scale-[1.02] hover:border-slate-200 transition-all duration-300 cursor-default group/item"
                        >
                        <div className={`p-3 rounded-xl bg-white shadow-sm group-hover/item:bg-${item.color}-50 transition-colors`}>
                            <item.icon className={`w-6 h-6 text-slate-400 group-hover/item:text-${item.color}-500 group-hover/item:scale-110 transition-transform`} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                            <p className="text-base font-semibold text-slate-900">{item.value}</p>
                        </div>
                        </div>
                    ))}
                    </div>

                    {/* Performance Section (Visual Only) */}
                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Weekly Performance</p>
                        <p className="text-2xl font-bold">Active Status Confirmed</p>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                        <Award className="w-8 h-8 text-yellow-400" />
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/2 translate-x-1/4">
                        <Award className="w-64 h-64" />
                    </div>
                    </div>

                </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}