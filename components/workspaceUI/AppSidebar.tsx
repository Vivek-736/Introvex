"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, FileText, Plus, MessageSquare } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/workspace" },
  { icon: FileText, label: "Documents", href: "/workspace/documents" },
  { icon: MessageSquare, label: "Chat History", href: "/workspace/chat" },
];

export default function AppSidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <Sidebar className="md:bg-gradient-to-b z-[400] from-slate-900 to-slate-950 border-r border-gray-700 w-64">
      <SidebarHeader className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-sm">
            <img src="/favicon.png" alt="Logo" className="w-7 h-7" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Difras
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-6">
        <div className="mb-8">
          <Button className="w-full bg-white text-black hover:bg-gray-100 rounded-lg font-semibold text-base py-3 transition-all duration-200">
            <Plus className="w-5 h-5 mr-3" />
            New Research
          </Button>
        </div>

        <SidebarMenu className="space-y-3">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  onClick={() => setActiveItem(item.label)}
                  className={`w-full justify-start text-left py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 ${
                    activeItem === item.label
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <item.icon className="w-6 h-6 mr-4" />
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-10">
          <h3 className="text-gray-300 text-sm font-semibold mb-4 px-4 tracking-wide">
            Recent Chats
          </h3>
          <div className="space-y-2">
            <div className="p-4 bg-gray-800/50 rounded-lg text-gray-300 text-sm font-medium transition-colors duration-200 cursor-pointer hover:bg-gray-800">
              <div className="flex items-center justify-center">
                <span>No recent chats</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-gray-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50 py-5 px-4 rounded-lg text-base font-medium transition-all duration-200">
              <UserButton />
              <span className="ml-4">Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}