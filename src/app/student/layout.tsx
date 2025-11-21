import Link from 'next/link';
import { Home, User, AlertCircle, Clock, LogOut } from 'lucide-react';
import { ReactNode } from 'react';

// Define the navigation links
const navItems = [
  { href: '/student/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/student/profile', icon: User, label: 'Profile' },
  { href: '/report', icon: AlertCircle, label: 'File Incident' },
  { href: '/student/history', icon: Clock, label: 'My History' },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  // In a real application, you would check the user session here (e.g., using Auth.js)
  // If the user is not logged in, you would redirect them to /login.

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col p-4 shadow-xl">
        <h1 className="text-2xl font-bold mb-8 p-2 border-b border-blue-600">
          Smart Maintenance
        </h1>
        <nav className="grow space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-150"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        {/* Logout Placeholder */}
        <button 
          className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-red-300 hover:bg-blue-700 transition duration-150 mt-auto"
          // In the future, this button will log the user out
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Render the dashboard/page.tsx or any other child page here */}
        {children} 
      </main>
    </div>
  );
}