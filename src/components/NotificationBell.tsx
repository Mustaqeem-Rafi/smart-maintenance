"use client";

import { useState, useEffect } from "react";
import { Bell, Zap, User, CheckCircle, Loader2, X, AlertCircle, Info, FileText } from "lucide-react";

// --- Types for our Mixed List ---
interface BaseItem {
  id: string;
  timestamp: string;
  type: 'action_needed' | 'info' | 'resolved';
}

interface ActionItem extends BaseItem {
  type: 'action_needed';
  title: string;
  description: string;
  priority: string;
  incidentId: string;
}

interface InfoItem extends BaseItem {
  type: 'info' | 'resolved';
  title: string;
  message: string;
  isRead: boolean;
  notificationId: string;
}

type NotificationItem = ActionItem | InfoItem;

interface Technician {
  _id: string;
  name: string;
  department: string;
}

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // Manual Assign State
  const [showManualSelect, setShowManualSelect] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      // A. Fetch Unassigned Incidents (Action Items)
      const resIncidents = await fetch("/api/admin/incidents");
      const dataIncidents = await resIncidents.json();
      
      const actionItems: ActionItem[] = dataIncidents.incidents
        .filter((i: any) => i.status === 'Open' || (i.status === 'In Progress' && !i.assignedTo))
        .map((i: any) => ({
          id: `inc-${i._id}`,
          incidentId: i._id,
          type: 'action_needed',
          title: i.title,
          description: i.description,
          priority: i.priority,
          timestamp: i.createdAt
        }));

      // B. Fetch General Notifications (Info/Resolved)
      const resNotifs = await fetch("/api/notifications"); // Uses session to get admin's notifs
      const dataNotifs = await resNotifs.json();
      
      const infoItems: InfoItem[] = (dataNotifs.notifications || []).map((n: any) => ({
        id: `notif-${n._id}`,
        notificationId: n._id,
        type: n.type === 'resolved' ? 'resolved' : 'info',
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        timestamp: n.createdAt
      }));

      // C. Merge and Sort by Date (Newest First)
      const combined = [...actionItems, ...infoItems].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setItems(combined);

    } catch (e) {
      console.error("Poll error", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const fetchTechs = async () => {
    try {
      const res = await fetch("/api/technicians");
      const data = await res.json();
      if (data.technicians) setTechnicians(data.technicians);
    } catch (e) {
      console.error("Failed to load techs");
    }
  };

  // --- Actions ---
  const handleAutoAssign = async (id: string) => {
    setLoadingAction(id);
    try {
      const res = await fetch("/api/incidents/assign/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: id })
      });
      
      if (res.ok) {
        // Remove from list immediately for better UX
        setItems(prev => prev.filter(item => (item as ActionItem).incidentId !== id));
      } else {
        alert("Auto-assign failed");
      }
    } catch (err) {
      alert("Auto-assign failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleManualAssign = async (incidentId: string, techId: string) => {
    setLoadingAction(incidentId);
    try {
      await fetch("/api/incidents/assign/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId, technicianId: techId })
      });
      
      setItems(prev => prev.filter(item => (item as ActionItem).incidentId !== incidentId));
      setShowManualSelect(null);
    } catch (error) {
      alert("Manual assign failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: "PUT" });
      setItems(prev => prev.map(item => 
        (item as InfoItem).notificationId === notificationId 
          ? { ...item, isRead: true } 
          : item
      ));
    } catch (e) {}
  };

  // Styles
  const getPriorityStyles = (p: string) => {
    switch(p) {
      case 'High': return "bg-[#7f1d1d] border-red-900 shadow-[-6px_0_0_0_#ef4444]";
      case 'Medium': return "bg-[#7c2d12] border-orange-900 shadow-[-6px_0_0_0_#f97316]";
      default: return "bg-[#1e3a8a] border-blue-900 shadow-[-6px_0_0_0_#3b82f6]";
    }
  };

  const unreadCount = items.filter(i => {
    // Action items (Unassigned incidents) count as unread
    if (i.type === 'action_needed') return true;
    
    // For Info/Resolved items, check if they are NOT read
    // We use 'in' to safely check for the property existence in the union type
    if ('isRead' in i) {
      return !i.isRead;
    }
    
    return false;
  }).length;
  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-top-2">
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Activity Feed</h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-gray-200 p-1 rounded-full transition"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          
          <div className="max-h-[450px] overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2 opacity-50" />
                <p className="text-gray-500 text-sm">All caught up!</p>
              </div>
            ) : (
              items.map((item) => {
                
                // --- RENDER ACTION ITEM (Unassigned Incident) ---
                if (item.type === 'action_needed') {
                  const actItem = item as ActionItem;
                  return (
                    <div key={item.id} className={`p-4 m-2 mb-3 border text-white rounded-xl ${getPriorityStyles(actItem.priority)}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="overflow-hidden mr-2">
                          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-wider opacity-80">
                             <AlertCircle className="w-3 h-3" /> Action Required
                          </div>
                          <h4 className="text-sm font-bold truncate">{actItem.title}</h4>
                          <p className="text-xs mt-1 font-medium opacity-80 line-clamp-1">{actItem.description}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {showManualSelect === actItem.incidentId ? (
                        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 animate-in fade-in">
                          <p className="text-xs font-bold mb-2 pl-1 text-gray-500">Select Technician:</p>
                          <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                            {technicians.map(t => (
                              <button 
                                key={t._id}
                                onClick={() => handleManualAssign(actItem.incidentId, t._id)}
                                className="w-full text-left text-xs px-2 py-2 bg-gray-50 hover:bg-blue-50 rounded flex justify-between text-gray-800"
                              >
                                <span className="font-medium">{t.name}</span>
                                <span className="text-gray-400">{t.department}</span>
                              </button>
                            ))}
                          </div>
                          <button onClick={() => setShowManualSelect(null)} className="w-full text-center text-xs mt-2 text-red-500 hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => handleAutoAssign(actItem.incidentId)}
                            disabled={!!loadingAction}
                            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition backdrop-blur-sm"
                          >
                            {loadingAction === actItem.incidentId ? <Loader2 className="w-3 h-3 animate-spin"/> : <Zap className="w-3 h-3 text-yellow-300" />}
                            Auto Assign
                          </button>
                          <button 
                            onClick={() => { setShowManualSelect(actItem.incidentId); fetchTechs(); }}
                            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition backdrop-blur-sm"
                          >
                            <User className="w-3 h-3 text-blue-300" /> Manual
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                // --- RENDER INFO ITEM (Notification) ---
                const infoItem = item as InfoItem;
                return (
                  <div 
                    key={item.id} 
                    onClick={() => markAsRead(infoItem.notificationId)}
                    className={`p-3 mx-2 rounded-xl border cursor-pointer transition-all ${
                      infoItem.isRead 
                        ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60' 
                        : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900 shadow-sm'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 p-1.5 rounded-full h-fit ${infoItem.type === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {infoItem.type === 'resolved' ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${infoItem.isRead ? 'text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                          {infoItem.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{infoItem.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          {new Date(infoItem.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}