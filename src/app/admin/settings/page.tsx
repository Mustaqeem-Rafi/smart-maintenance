"use client";

import { useState } from "react";
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Save, 
  Moon, 
  Sun, 
  Smartphone, 
  Mail,
  Shield
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Mock State (In a real app, fetch this from DB)
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@college.edu",
    notifications: {
      email: true,
      push: false,
      weeklyReport: true,
      criticalAlerts: true
    },
    theme: "light"
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and system preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation (Settings Menu) */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-2">
            {[
              { id: "general", label: "General", icon: User },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "security", label: "Security", icon: Lock },
              { id: "system", label: "System", icon: Globe },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 w-full md:w-1/2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Super Admin</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg h-fit">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email Alerts</p>
                        <p className="text-sm text-gray-500">Receive updates on new high-priority incidents.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.notifications.email} onChange={() => {}} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg h-fit">
                        <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                        <p className="text-sm text-gray-500">Get notified instantly on your mobile device.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.notifications.push} onChange={() => {}} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <input type="password" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input type="password" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <input type="password" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent" />
                  </div>
                </div>
              </div>
            )}

            {/* SYSTEM TAB */}
            {activeTab === "system" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Appearance</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <button className="p-4 border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex flex-col items-center gap-2">
                    <Sun className="w-6 h-6 text-blue-600" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">Light</span>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 rounded-xl flex flex-col items-center gap-2 text-gray-500">
                    <Moon className="w-6 h-6" />
                    <span className="font-medium">Dark</span>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 rounded-xl flex flex-col items-center gap-2 text-gray-500">
                    <Globe className="w-6 h-6" />
                    <span className="font-medium">System</span>
                  </button>
                </div>
              </div>
            )}

            {/* Save Button Footer */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-70"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}