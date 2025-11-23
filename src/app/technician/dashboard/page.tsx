"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MapPin, Clock, CheckCircle, Play, AlertCircle, Loader2, Bell, User
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  location: { address: string };
  createdAt: string;
}

const isSlaBreached = (dateString: string) => {
  const created = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diffMinutes = (now - created) / (1000 * 60);
  return diffMinutes > 15;
};

export default function TechnicianDashboard() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Auto-Fetch on Load
  const fetchTasks = async () => {
    try {
      // No query params needed anymore - API uses cookies
      const res = await fetch(`/api/technician/tasks`);
      
      if (res.status === 401) {
        console.error("Unauthorized");
        return;
      }

      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
      const interval = setInterval(fetchTasks, 30000); // Auto-refresh every 30s
      return () => clearInterval(interval);
    }
  }, [status]);

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic Update (UI updates instantly)
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));

    try {
      await fetch('/api/technician/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: id, status: newStatus }),
      });
      // Re-fetch to ensure sync
      fetchTasks();
    } catch (error) {
      alert("Failed to update status");
      fetchTasks(); // Revert on error
    }
  };

  const getPriorityStyles = (p: string) => {
    if (p === 'High') return 'bg-red-50 text-red-700 border-red-200 ring-red-500/30';
    if (p === 'Medium') return 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/30';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30';
  };

  const breachedJobs = tasks.filter(t => isSlaBreached(t.createdAt) && t.status !== 'Resolved');
  const activeJobs = tasks.filter(t => t.status !== 'Resolved');

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* --- LEFT: NOTIFICATION CENTER --- */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-6 shrink-0">
        <div className="flex items-center gap-2 mb-6 text-slate-800">
           <Bell className="w-6 h-6 text-blue-600" />
           <h2 className="text-xl font-bold">My Updates</h2>
        </div>
        
        <div className="space-y-4">
          {breachedJobs.length > 0 && (
            <div className="p-4 rounded-lg border text-sm font-medium bg-red-50 border-red-200 text-red-800 animate-pulse">
              ⚠️ {breachedJobs.length} tickets have breached SLA (15m)!
            </div>
          )}
          <div className="p-4 rounded-lg border text-sm font-medium bg-blue-50 border-blue-200 text-blue-800">
             🔔 You have {activeJobs.length} active jobs in your queue.
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <h3 className="font-semibold text-slate-600 mb-4 text-sm uppercase tracking-wider">Performance</h3>
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-600">Pending</span>
            <span className="font-bold text-slate-900">{activeJobs.length}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-600">SLA Breaches</span>
            <span className="font-bold text-red-600">{breachedJobs.length}</span>
          </div>
        </div>
      </aside>

      {/* --- RIGHT: MAIN DASHBOARD --- */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Queue</h1>
            <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-slate-400" />
                <p className="text-slate-500">Technician: <span className="font-semibold text-slate-700">{session?.user?.name}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">System Live</span>
          </div>
        </header>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center p-8">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">All Clear!</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              No pending jobs assigned to you. Enjoy the break!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => {
              const breached = isSlaBreached(task.createdAt) && task.status !== 'Resolved';
              
              return (
                <div 
                  key={task._id} 
                  className={`group relative bg-white rounded-2xl border p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 ease-out overflow-hidden
                    ${breached ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 hover:border-blue-300/50'}
                  `}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2
                    ${breached ? 'bg-red-600' : (task.priority === 'High' ? 'bg-orange-500' : 'bg-blue-500')} 
                  `}></div>

                  <div className="flex flex-col md:flex-row gap-6 justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between md:justify-start md:gap-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border shadow-sm ring-1 ${getPriorityStyles(task.priority)}`}>
                          {task.priority} Priority
                        </span>
                        
                        {breached ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                                <AlertCircle className="w-3 h-3" /> SLA BREACHED
                            </span>
                        ) : (
                            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                ID: {task._id.slice(-6).toUpperCase()}
                            </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {task.title}
                        </h3>
                        <p className="text-slate-600 mt-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          {task.location?.address || "Campus Location"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <Clock className={`w-4 h-4 ${breached ? 'text-red-500' : 'text-blue-500'}`} />
                          {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-3 min-w-[200px] md:border-l border-slate-100 md:pl-8 pt-4 md:pt-0 border-t md:border-t-0">
                      {task.status === 'Open' && (
                        <button 
                          onClick={() => updateStatus(task._id, 'In Progress')}
                          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                          <Play className="w-5 h-5 fill-current" /> 
                          Accept & Start
                        </button>
                      )}

                      {task.status === 'In Progress' && (
                        <button 
                          onClick={() => updateStatus(task._id, 'Resolved')}
                          className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                          <CheckCircle className="w-5 h-5" /> 
                          Mark Complete
                        </button>
                      )}
                      
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${task.status === 'In Progress' ? 'bg-blue-500 animate-ping' : 'bg-slate-300'}`}></div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Status: {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}