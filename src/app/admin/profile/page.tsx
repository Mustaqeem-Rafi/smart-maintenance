"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Mail, 
  Briefcase, 
  Calendar, 
  Shield, 
  MapPin,
  Edit3,
  Loader2,
  X,
  Save
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  createdAt: string;
  isAvailable?: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", department: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session?.user?.email) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile?email=${session?.user?.email}`);
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setEditForm({ 
            name: data.user.name, 
            department: data.user.department || "" 
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          name: editForm.name,
          department: editForm.department
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Update error", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (!user) return (
    <div className="p-8 text-center text-red-500">
      Profile not found. Please try logging out and back in.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans p-8 relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Header / Cover Area */}
        <div className="relative mb-20">
          <div className="h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md relative overflow-hidden">
             <div className="absolute inset-0 bg-white/10 pattern-grid-lg opacity-20" />
          </div>
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="h-32 w-32 rounded-full bg-white dark:bg-gray-900 p-1 shadow-xl">
              <div className="h-full w-full rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-4xl font-bold text-gray-500">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium capitalize">{user.role}</p>
            </div>
          </div>
          
          {/* Edit Button */}
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute bottom-4 right-8 bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-4 py-2 rounded-lg shadow-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Personal Info */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
                  <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Role</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Organization Info */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Organization Details</h2>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Department</p>
                  <p className="text-gray-900 dark:text-white font-medium">{user.department || "General Admin"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Joined On</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Campus Location</p>
                  <p className="text-gray-900 dark:text-white font-medium">Main Block, Admin Wing</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <input 
                  type="text" 
                  value={editForm.department}
                  onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}