"use client";

import { HelpCircle, Mail, MessageCircle } from "lucide-react";

export default function StaffHelpPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
      <p className="text-gray-500 mb-8">Need assistance? We are here to help.</p>

      <div className="grid gap-6">
        
        {/* FAQ Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
                <span>How do I report a new incident?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                Click on "Report Incident" in the sidebar or the "Report New Incident" button on your dashboard. Select a category, fill in the details, and submit.
              </p>
            </details>
            <div className="h-px bg-gray-100"></div>
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
                <span>How can I track my reports?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                Go to "My Reports" in the sidebar. You will see a list of all your submitted tickets and their current status (Open, In Progress, Resolved).
              </p>
            </details>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl text-white shadow-lg">
          <h3 className="text-xl font-bold mb-2">Still need help?</h3>
          <p className="text-slate-300 mb-6">Contact the maintenance admin team directly.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:support@college.edu" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition border border-white/10">
              <Mail className="w-5 h-5" /> Email Support
            </a>
            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition font-bold">
              <MessageCircle className="w-5 h-5" /> Live Chat (Beta)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}