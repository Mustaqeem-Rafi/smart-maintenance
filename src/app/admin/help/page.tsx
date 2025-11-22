"use client";

import { useState } from "react";
import { 
  HelpCircle, 
  Code, 
  Github, 
  Linkedin, 
  Mail, 
  Server, 
  Database, 
  Layout,
  MessageSquare,
  Send,
  CheckCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function HelpPage() {
  const { data: session } = useSession();
  
  // Ticket Form State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          userEmail: session?.user?.email
        })
      });

      if (res.ok) {
        setSuccess(true);
        setSubject("");
        setMessage("");
        setTimeout(() => setSuccess(false), 5000); // Hide success after 5s
      } else {
        alert("Failed to submit ticket.");
      }
    } catch (error) {
      alert("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <HelpCircle className="text-blue-600" /> Help & Support
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Documentation, Developer Info, and Support Channels for the Smart Maintenance System.
          </p>
        </div>

        {/* 1. Developer Information */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
            About the Developer
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col md:flex-row items-center gap-8">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shrink-0">
              DV
            </div>
            <div className="text-center md:text-left space-y-4 flex-1">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Developer</h3>
                <p className="text-blue-600 font-medium">Full Stack Engineer</p>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Built with passion using Next.js 15, TypeScript, and MongoDB. Dedicated to creating intuitive and scalable web solutions for campus management.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <a href="#" className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition">
                  <Github className="w-4 h-4" /> GitHub
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-400 transition">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
                <a href="mailto:dev@example.com" className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition">
                  <Mail className="w-4 h-4" /> Contact
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. How It Works (Workflow) */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
            System Architecture & Workflow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">1. Reporting</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Students report incidents via the clean UI. The system captures GPS coordinates and auto-detects priority keywords.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">2. Processing</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The backend verifies the location to prevent duplicates (20m radius rule) and stores data securely in MongoDB.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">3. Resolution</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Admins view the Heatmap/Dashboard, assign technicians, and track progress until resolution.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Raise Ticket Section */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
            Technical Support
          </h2>
          <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl overflow-hidden relative">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="text-blue-400" /> Raise a Ticket
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Facing a bug or have a feature request? Directly contact the development team. We usually respond within 24 hours.
                </p>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Priority Email Support</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Direct Developer Access</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Bug Tracking & Updates</li>
                </ul>
              </div>

              <form onSubmit={handleSubmitTicket} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Map not loading"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting || success}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    success 
                      ? "bg-green-600 text-white cursor-default"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : success ? (
                    <> <CheckCircle className="w-5 h-5" /> Ticket Sent </>
                  ) : (
                    <> <Send className="w-4 h-4" /> Submit Ticket </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}