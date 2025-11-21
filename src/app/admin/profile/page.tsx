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
  Loader2
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
  // 1. Get 'status' to know if NextAuth is still checking cookies
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. If NextAuth is still loading, do nothing yet
    if (status === "loading") return;

    // 3. If not authenticated, stop loading (middleware handles redirect, but UI should be safe)
    if (status === "unauthenticated" || !session?.user?.email) {
      setLoading(false);
      return;
    }

    // 4. Fetch Profile
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile?email=${session?.user?.email}`);
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        // 5. Always turn off loading when fetch is done
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status]);

  // --- Render Logic ---

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header / Cover Area */}
        <div className="relative mb-20">
          <div className="h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md"></div>
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
          <button className="absolute bottom-4 right-8 bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-4 py-2 rounded-lg shadow-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Personal Info Card */}
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
                  <p className="text-xs text-gray-500 uppercase font-semibold">Role / Permissions</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Organization Info Card */}
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
    </div>
  );
}