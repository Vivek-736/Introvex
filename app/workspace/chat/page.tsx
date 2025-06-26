"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/SupabaseClient";
import { useUser } from "@clerk/nextjs";

export default function ChatPage() {
  const router = useRouter();
  type Chat = { id: number; title: string; chatId: string; userEmail: string };
  const [chats, setChats] = useState<Chat[]>([]);
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  useEffect(() => {
    const fetchChats = async () => {
      if (!userEmail) return;

      const { data, error } = await supabase
        .from("Data")
        .select("id, title, chatId, userEmail")
        .eq("userEmail", userEmail);

      if (error) {
        console.error("Error fetching chats:", error.message);
      } else {
        console.log("Fetched chats:", data);
        setChats(data || []);
      }
    };

    fetchChats();

    const channelName = `chat-changes-${userEmail?.replace(/[^a-zA-Z0-9]/g, "") || "default"}`;
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
          if (newChat.id && newChat.title && newChat.chatId && newChat.userEmail === userEmail) {
            console.log("New chat inserted:", newChat);
            setChats((prevChats) => [...prevChats, newChat]);
          } else {
            console.warn("Invalid or unauthorized chat data received:", newChat);
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === "CHANNEL_ERROR") {
          console.error(
            "Subscription failed to connect. Check Supabase real-time settings."
          );
        }
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userEmail]);

  const handleCardClick = (chatId: string) => {
    router.push(`/workspace/chat/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Chat History</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleCardClick(chat.chatId)}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-2"
            >
              <img
                src="/favicon.png"
                alt={chat.title}
                className="w-full h-48 object-contain bg-black"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-white line-clamp-1">
                  {chat.title}
                </h3>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-400 text-lg">No chats available</p>
          </div>
        )}
      </div>
    </div>
  );
}