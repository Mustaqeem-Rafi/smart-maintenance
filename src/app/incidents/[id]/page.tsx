"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase,
  Loader2,
  AlertCircle,
  Send
} from "lucide-react";

// 1. Updated Interface to match backend "content" field
interface MessageData {
  _id: string;
  content: string; // Changed from text to content
  senderId: { 
    _id: string; 
    name: string; 
    role: string;
    email?: string; 
  };
  createdAt: string;
}

interface IncidentDetail {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: { address?: string };
  createdAt: string;
  images: string[];
}

export default function StudentIncidentPage() {
  const params = useParams();
  const { data: session } = useSession();
  const id = params?.id as string; 
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Incident Details
  useEffect(() => {
    if (!id) return;
    const fetchIncident = async () => {
      try {
        const res = await fetch(`/api/incidents/${id}`);
        if (!res.ok) throw new Error("Incident not found");
        const data = await res.json();
        setIncident(data.incident);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIncident();
  }, [id]);

  // Fetch and Poll Messages
  useEffect(() => {
    if (!id) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/incidents/${id}/messages`);
        const data = await res.json();
        // Backend returns { messages: [...] }
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Chat error:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // 2. Updated POST body to use "content"
      const res = await fetch(`/api/incidents/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }) 
      });

      if (res.ok) {
        setNewMessage("");
        // Refresh messages immediately for better UX
        const refreshRes = await fetch(`/api/incidents/${id}/messages`);
        const data = await refreshRes.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to send message");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (error || !incident) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-gray-500 mb-6">{error || "Incident not found"}</p>
        <Link href="/student/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-xl">Back Home</Link>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      "Open": "bg-red-100 text-red-700",
      "In Progress": "bg-yellow-100 text-yellow-700",
      "Resolved": "bg-green-100 text-green-700"
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Link href="/student/dashboard" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
                <p className="text-sm text-gray-500 mt-1">Reported on {new Date(incident.createdAt).toLocaleDateString()}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(incident.status)}`}>
                {incident.status}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase">Description</h3>
                <p className="text-gray-700 mt-1">{incident.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 text-blue-500" /> {incident.category}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-purple-500" /> {incident.location?.address || "Location Attached"}
                </div>
              </div>

              {incident.images?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Evidence</h3>
                  <img src={incident.images[0]} className="rounded-xl w-full max-h-64 object-cover border" alt="evidence" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border flex flex-col h-[600px]">
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-900">Maintenance Chat</h3>
              <p className="text-xs text-gray-500">Discuss this issue with the team</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                // Improved isMe check using session data
                const isMe = msg.senderId?._id === (session?.user as any)?.id || msg.senderId?.email === session?.user?.email;

                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-[10px] text-gray-400 mb-1 px-1">
                      {isMe ? "You" : `${msg.senderId?.name || 'User'} (${msg.senderId?.role || 'Staff'})`}
                    </span>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}>
                      {/* 3. Render content instead of text */}
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-2 text-sm text-black"
              />
              <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}