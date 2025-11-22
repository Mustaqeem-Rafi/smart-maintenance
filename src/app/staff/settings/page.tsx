"use client";

import { useState } from "react";
import { Bell, Lock, User, Save, Loader2 } from "lucide-react";

export default function StaffSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [notifs, setNotifs] = useState({ email: true, push: false });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Preferences saved!");
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Manage your app preferences.</p>

      <div className="space-y-6">
        
        {/* Notifications Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Bell className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Email Alerts</p>
                <p className="text-sm text-gray-500">Receive updates on your reported issues.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifs.email} 
                onChange={() => setNotifs(p => ({...p, email: !p.email}))}
                className="w-5 h-5 accent-blue-600" 
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Get alerts directly in the browser.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifs.push} 
                onChange={() => setNotifs(p => ({...p, push: !p.push}))}
                className="w-5 h-5 accent-blue-600" 
              />
            </div>
          </div>
        </div>

        {/* Account Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm opacity-75">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Lock className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Security</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">To change your password or email, please contact the IT administrator.</p>
          <button disabled className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed">
            Change Password (Disabled)
          </button>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}