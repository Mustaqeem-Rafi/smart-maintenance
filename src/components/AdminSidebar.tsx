"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, AlertCircle, FileBarChart, Settings, LogOut, Users, HelpCircle, Map } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const topMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Incidents", icon: AlertCircle, href: "/admin/incidents" },
    { name: "Technicians", icon: Users, href: "/admin/technicians" },
    { name: "Heatmap", icon: Map, href: "/admin/heatmap" }, // New Heatmap Link
    { name: "Reports", icon: FileBarChart, href: "/admin/reports" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  const bottomMenuItems = [
    { name: "Help", icon: HelpCircle, href: "/admin/help" },
  ]

  const SidebarItem = ({ item }: { item: typeof topMenuItems[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
      >
        <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
        <p className="text-sm font-medium leading-normal">{item.name}</p>
      </Link>
    );
  };

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 fixed left-0 top-0 h-screen z-50 font-sans">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-6">
          {/* User Profile Area */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
              {/* Placeholder for user image */}
              <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-gray-900 dark:text-white text-sm font-semibold leading-normal">
                Admin User
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-normal leading-normal">
                College Incident Mgmt.
              </p>
            </div>
          </div>

          {/* Top Navigation */}
          <nav className="flex flex-col gap-1">
            {topMenuItems.map((item) => (
              <SidebarItem key={item.href} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom Navigation & Logout */}
        <div className="flex flex-col gap-1">
          {bottomMenuItems.map((item) => (
              <SidebarItem key={item.href} item={item} />
          ))}
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <p className="text-sm font-medium leading-normal">Logout</p>
          </button>
        </div>
      </div>
    </aside>
  );
}