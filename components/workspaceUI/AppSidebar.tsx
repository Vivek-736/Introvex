"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, FileText, MessageSquare, RefreshCw, PlusCircleIcon } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { supabase } from "@/services/SupabaseClient";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/workspace" },
  { icon: FileText, label: "Documents", href: "/workspace/documents" },
  { icon: MessageSquare, label: "Chat History", href: "/workspace/chat" },
];

export default function AppSidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  type Chat = { id: number; title: string; chatId: string; userEmail: string };
  const [chats, setChats] = useState<Chat[]>([]);
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  useEffect(() => {
    const fetchChats = async () => {
      if (!userEmail) return;

      const { data, error } = await supabase
        .from("Data")
        .select("id, title, chatId, created_at, userEmail")
        .eq("userEmail", userEmail)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching chats:", error.message);
      } else {
        console.log("Fetched chats:", data);
        setChats(data || []);
      }
    };

    fetchChats();

    const channelName = `chat-changes-${
      userEmail?.replace(/[^a-zA-Z0-9]/g, "") || "default"
    }`;

    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Data",
          filter: `userEmail=eq.${userEmail}`,
        },
        (payload) => {
          console.log("Real-time payload:", payload);
          const newChat = payload.new as Chat;
          if (
            newChat.id &&
            newChat.title &&
            newChat.chatId &&
            newChat.userEmail === userEmail
          ) {
            console.log("New chat inserted:", newChat);
            setChats((prevChats) => {
              const updatedChats = [...prevChats, newChat];
              console.log("Updated chats state:", updatedChats);
              return updatedChats;
            });
          } else {
            console.warn(
              "Invalid or unauthorized chat data received:",
              newChat
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to real-time updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            "Subscription failed to connect. Check Supabase real-time settings."
          );
        }
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userEmail]);

  const handleRefresh = async () => {
    if (!userEmail) return;

    const { data, error } = await supabase
      .from("Data")
      .select("id, title, chatId, userEmail")
      .eq("userEmail", userEmail);
    if (error) {
      console.error("Error refreshing chats:", error.message);
    } else {
      console.log("Refreshed chats:", data);
      setChats(data || []);
    }
  };

  return (
    <Sidebar className="md:bg-gradient-to-b z-[400] from-slate-900 to-slate-950 border-r border-gray-700 w-64">
      <SidebarHeader className="p-6 border-b border-gray-700 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-sm">
            <img src="/favicon.png" alt="Logo" className="w-7 h-7" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Introvex
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mb-8">
          <Link href="/workspace">
            <Button className="w-full bg-white text-black hover:bg-gray-100 rounded-lg font-semibold text-base py-3 transition-all duration-200">
              <PlusCircleIcon className="w-5 h-5 mr-3" />
              New Research
            </Button>
          </Link>
        </div>

        <SidebarMenu className="space-y-3">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  onClick={() => setActiveItem(item.label)}
                  className={`w-full justify-start text-left px-4 py-6 rounded-lg text-base font-medium transition-all duration-200 ${
                    activeItem === item.label
                      ? "bg-gray-800 py-6 text-white shadow-sm"
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
          <div className="flex items-center justify-between px-4">
            <h3 className="text-gray-300 text-sm font-semibold tracking-wide">
              Recent Chats
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="text-gray-300 hover:text-white"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
          <div className="space-y-2 mt-2">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <Link href={`/workspace/chat/${chat.chatId}`} key={chat.id}>
                  <div className="p-4 bg-gray-800/50 rounded-lg text-gray-300 text-sm font-medium transition-colors duration-200 mt-2 cursor-pointer hover:bg-gray-800 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 flex-shrink-0" />
                    <span className="line-clamp-1 text-sm flex-1">
                      {chat.title}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 bg-gray-800/50 rounded-lg text-gray-300 text-sm font-medium transition-colors duration-200 cursor-pointer hover:bg-gray-800">
                <div className="flex items-center justify-center">
                  <span>No recent chats</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-gray-700 bg-gradient-to-b from-slate-900 to-slate-950">
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