import type React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/workspaceUI/AppSidebar"

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <div className="md:hidden p-4 border-b border-gray-800">
            <SidebarTrigger className="text-white hover:bg-gray-800" />
          </div>
          {children}
        </div>
      </SidebarProvider>
    </div>
  )
}