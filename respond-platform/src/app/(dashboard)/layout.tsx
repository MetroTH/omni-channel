import { Sidebar } from "@/components/layout/sidebar";
import Softphone from "@/components/telephony/softphone";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
      <Softphone />
    </div>
  );
}
