"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Info, CheckCircle, Wrench } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'assigned' | 'resolved' | 'info';
  isRead: boolean;
  createdAt: string;
}

export default function UserNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {
      console.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const getIcon = (type: string) => {
    if (type === 'resolved') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (type === 'assigned') return <Wrench className="w-5 h-5 text-blue-500" />;
    return <Info className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
            <span className="font-bold text-gray-700 text-sm">Notifications</span>
            <button onClick={() => setIsOpen(false)} className="text-xs text-gray-500 hover:text-gray-800">Close</button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No new notifications</div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  onClick={() => markAsRead(notif._id)}
                  className={`p-4 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition flex gap-3 ${notif.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                >
                  <div className="mt-1">{getIcon(notif.type)}</div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{notif.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}