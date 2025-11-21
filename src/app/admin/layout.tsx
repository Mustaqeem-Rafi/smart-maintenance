import AdminSidebar from "@/src/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      {/* Main Content Wrapper */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto transition-all duration-200">
        {children}
      </main>
    </div>
  );
}