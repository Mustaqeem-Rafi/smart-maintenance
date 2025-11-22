"use client";

import { useSession } from "next-auth/react";
import { User, Mail, Shield, Briefcase } from "lucide-react";

export default function StaffProfilePage() {
  const { data: session } = useSession();

  // Fallback data if session isn't loaded yet
  const user = session?.user || { name: "Loading...", email: "...", role: "Staff" };

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      
      {/* Header Banner */}
      <div className="relative mb-20">
        <div className="h-40 w-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl shadow-sm"></div>
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="h-32 w-32 rounded-full bg-white p-1.5 shadow-lg">
            <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-blue-600 border border-slate-200">
              {user.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
          </div>
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 font-medium flex items-center gap-1">
              <Shield className="w-4 h-4 text-blue-600" /> {user.role || "Staff Member"}
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Full Name</p>
                <p className="text-gray-900 font-medium">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Mail className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Email Address</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Employment Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Department</p>
                <p className="text-gray-900 font-medium">General Maintenance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Shield className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}