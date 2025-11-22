"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle, 
  Copy, 
  Check, 
  LayoutDashboard, 
  FileText 
} from "lucide-react";

// 1. Create the content component that uses search params
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Safe defaults if params are missing
  const refId = searchParams.get("refId") || "INC-PENDING";
  const type = searchParams.get("type") || "Incident";
  const location = searchParams.get("location") || "Campus Location";
  
  // Get current date formatted
  const dateStr = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(refId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-start rounded-xl shadow-lg bg-white border border-gray-200 overflow-hidden max-w-2xl w-full mx-auto mt-10">
      
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center w-full">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-gray-800 text-2xl md:text-3xl font-bold tracking-tight">
          Incident Reported Successfully!
        </h1>
        <p className="text-gray-500 text-base font-normal leading-normal max-w-md">
          Thank you. Your report has been sent to the relevant department for review. You will receive updates via email.
        </p>
      </div>

      {/* Details Section */}
      <div className="w-full border-t border-gray-200 p-6 md:p-8">
        
        {/* Reference ID Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-gray-500 text-sm font-normal">Reference ID</p>
            <p className="text-gray-800 text-base font-medium tracking-wider font-mono">{refId}</p>
          </div>
          <button 
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span>{copied ? "Copied" : "Copy ID"}</span>
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4">
          {/* Row 1 */}
          <div className="col-span-2 grid grid-cols-subgrid border-t border-gray-200 py-4">
            <p className="text-gray-500 text-sm font-normal">Incident Type</p>
            <p className="text-gray-800 text-sm font-medium capitalize">{type}</p>
          </div>
          {/* Row 2 */}
          <div className="col-span-2 grid grid-cols-subgrid border-t border-gray-200 py-4">
            <p className="text-gray-500 text-sm font-normal">Date & Time Reported</p>
            <p className="text-gray-800 text-sm font-medium">{dateStr}</p>
          </div>
          {/* Row 3 */}
          <div className="col-span-2 grid grid-cols-subgrid border-t border-gray-200 py-4">
            <p className="text-gray-500 text-sm font-normal">Location of Incident</p>
            <p className="text-gray-800 text-sm font-medium">{location}</p>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="w-full flex flex-col sm:flex-row-reverse justify-stretch gap-3 px-6 md:px-8 py-6 border-t border-gray-200 bg-gray-50">
        <button 
          onClick={() => router.push("/staff/reports")} // Or specific incident view
          className="flex w-full sm:w-auto min-w-[84px] items-center justify-center rounded-lg h-10 px-5 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors gap-2"
        >
          <FileText className="w-4 h-4" />
          View My Reported Incident
        </button>
        <button 
          onClick={() => router.push("/staff/dashboard")}
          className="flex w-full sm:w-auto min-w-[84px] items-center justify-center rounded-lg h-10 px-5 bg-transparent text-blue-600 text-sm font-bold border border-blue-600 hover:bg-blue-50 transition-colors gap-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          Return to Dashboard
        </button>
      </div>

    </div>
  );
}

// 2. Wrap in Suspense boundary (CRITICAL FIX)
export default function IncidentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans flex flex-col items-center">
      <Suspense fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}