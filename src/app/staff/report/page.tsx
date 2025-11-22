"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Droplet, 
  Zap, 
  Wifi, 
  Wrench, 
  TriangleAlert, 
  SprayCan, 
  HelpCircle, 
  ChevronRight,
  Loader2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { id: "Water", label: "Water & Plumbing", desc: "Leaks, floods, clogged drains", icon: Droplet },
  { id: "Electricity", label: "Electrical & Lighting", desc: "Power outages, flickering lights", icon: Zap },
  { id: "Internet", label: "IT & Wi-Fi", desc: "No connection, slow network", icon: Wifi },
  { id: "Civil", label: "Civil / Furniture", desc: "Broken chairs, doors, windows", icon: Wrench },
  { id: "Other", label: "Other / General", desc: "Any other maintenance issues", icon: HelpCircle },
];

export default function SelectCategoryPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (!selectedCategory) return;
    setLoading(true);
    // Navigate to the next step (Details)
    router.push(`/staff/report/details?category=${selectedCategory}`);
  };

  return (
    <div className="mx-auto max-w-5xl p-6 font-sans min-h-screen">
      
      {/* Breadcrumbs / Header */}
      <div className="mb-8">
        <Link href="/staff/dashboard" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
          Report a New Incident
        </h1>
        <p className="text-gray-500 text-lg">
          What is the nature of the problem? Select a category to proceed.
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`group relative flex flex-col text-left p-6 rounded-2xl border-2 transition-all duration-200 outline-none ${
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-600"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              <div className={`mb-4 p-3 rounded-xl w-fit ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"}`}>
                <cat.icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className={`font-bold text-lg mb-1 ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                {cat.label}
              </h3>
              <p className={`text-sm ${isSelected ? "text-blue-700" : "text-gray-500"}`}>
                {cat.desc}
              </p>
              
              {/* Checkmark Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 text-blue-600">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200">
        <Link href="/staff/dashboard">
          <button className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition">
            Cancel
          </button>
        </Link>
        <button
          onClick={handleNext}
          disabled={!selectedCategory || loading}
          className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <> <Loader2 className="w-5 h-5 animate-spin" /> Processing... </>
          ) : (
            <> Next Step <ChevronRight className="w-5 h-5" /> </>
          )}
        </button>
      </div>

    </div>
  );
}