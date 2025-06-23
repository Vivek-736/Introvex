"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Home, Search, BookOpen, FileText, Settings, Plus, MessageSquare, Archive, Star, User } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/workspace" },
  { icon: FileText, label: "Documents", href: "/workspace/documents" },
  { icon: MessageSquare, label: "Chat History", href: "/workspace/chat" },
  { icon: Archive, label: "Archive", href: "/workspace/archive" },
]

export default function AppSidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard")

  return (
    <Sidebar className="bg-slate-950 border-r border-gray-800">
      <SidebarHeader className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
            <img src="/favicon.png" alt="Logo" className="w-6 h-6" />
          </div>
          <span className="text-white font-semibold text-lg">Difras</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* New Chat Button */}
        <div className="mb-6">
          <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-xl font-medium">
            <Plus className="w-4 h-4 mr-2" />
            New Research
          </Button>
        </div>

        {/* Main Navigation */}
        <SidebarMenu className="space-y-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                onClick={() => setActiveItem(item.label)}
                className={`w-full justify-start text-left p-3 rounded-xl transition-all duration-200 ${
                  activeItem === item.label
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Recent Chats */}
        <div className="mt-8">
          <h3 className="text-gray-400 text-sm font-medium mb-3 px-3">Recent Chats</h3>
          <div className="space-y-1">
            <div className="p-3 bg-gray-900 rounded-xl text-gray-400 transition-colors duration-200 cursor-pointer">
              <div className="flex items-center justify-center">
                <span>No recent chats</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-900 p-3 rounded-xl">
              <UserButton />
              <span className="ml-3">Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}