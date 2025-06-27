import type React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/workspaceUI/AppSidebar";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full min-h-screen bg-[#10111e]">
          <div className="md:hidden p-4 border-b border-gray-800 bg-black">
            <SidebarTrigger className="text-white hover:bg-gray-800" />
          </div>
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
}