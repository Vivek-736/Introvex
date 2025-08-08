"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/SupabaseClient";
import { useUser } from "@clerk/nextjs";
import { 
  MessageSquare, 
  ArrowRight, 
  Search,
  Calendar,
  Sparkles,
  Grid3X3,
  List
} from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  type Chat = { 
    id: number; 
    title: string; 
    chatId: string; 
    userEmail: string;
    created_at?: string;
  };
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  useEffect(() => {
    const fetchChats = async () => {
      if (!userEmail) return;

      try {
        const { data, error } = await supabase
          .from("Data")
          .select("id, title, chatId, userEmail, created_at")
          .eq("userEmail", userEmail)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching chats:", error.message);
        } else {
          setChats(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userEmail]);

  const handleCardClick = (chatId: string) => {
    router.push(`/workspace/chat/${chatId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full text-white bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          <p className="text-purple-300">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white bg-gradient-to-br from-black via-purple-950/20 to-black">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative flex flex-col items-center p-6 sm:p-8 lg:p-10">
        <div className="w-full max-w-7xl mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                <MessageSquare size={32} className="text-purple-300" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-gradient-to-r from-purple-300 via-white to-indigo-300 bg-clip-text mb-3">
              Chat History
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore your research conversations and continue where you left off
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 rounded-2xl backdrop-blur-xl bg-black/40 border border-purple-500/20 shadow-2xl">
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/60 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-purple-500/20">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl">
          {filteredChats.length > 0 ? (
            <div className={`${
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
            }`}>
              {filteredChats.map((chat, index) => (
                <div
                  key={chat.id}
                  onClick={() => handleCardClick(chat.chatId)}
                  className={`group cursor-pointer transition-all duration-300 ${
                    viewMode === "grid" 
                      ? "transform hover:scale-105 hover:-translate-y-2" 
                      : "hover:scale-[1.02]"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {viewMode === "grid" ? (
                    <div className="h-full rounded-2xl shadow-2xl backdrop-blur-xl bg-black/40 border border-purple-500/20 overflow-hidden hover:border-purple-500/40 hover:shadow-purple-500/20 transition-all duration-300 relative">
                      <div className="relative h-32 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-b border-purple-500/20 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 p-4 bg-black rounded-2xl border border-purple-500/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                          <img
                            src="/favicon.png"
                            alt="Chat"
                            className="w-12 h-12 object-contain"
                          />
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight size={16} className="text-purple-300" />
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <MessageSquare size={16} className="text-purple-400 mt-2 flex-shrink-0" />
                          <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-purple-200 transition-colors duration-300">
                            {chat.title}
                          </h3>
                        </div>
                        
                        {chat.created_at && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar size={14} />
                            <span>{formatDate(chat.created_at)}</span>
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  ) : (
                    <div className="rounded-2xl shadow-xl backdrop-blur-xl bg-black/40 border border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-black rounded-xl border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                            <img
                              src="/favicon.png"
                              alt="Chat"
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-purple-200 transition-colors duration-300 mb-1">
                              {chat.title}
                            </h3>
                            {chat.created_at && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar size={14} />
                                <span>{formatDate(chat.created_at)}</span>
                              </div>
                            )}
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ArrowRight size={20} className="text-purple-300" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="p-6 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 rounded-3xl border border-purple-500/20 backdrop-blur-sm mb-6 inline-block">
                  <MessageSquare size={64} className="text-purple-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {searchTerm ? "No conversations found" : "No conversations yet"}
                </h3>
                <p className="text-gray-400 mb-8">
                  {searchTerm 
                    ? `No conversations match "${searchTerm}". Try a different search term.`
                    : "Start your first research conversation to see it here."
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => router.push("/workspace")}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-purple-500/30 hover:scale-105"
                  >
                    <Sparkles size={20} />
                    Start New Research
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}