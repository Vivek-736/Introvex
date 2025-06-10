"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Edit, Eye, Clock, FileText } from "lucide-react";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  avatar: string;
  status: "editing" | "viewing" | "idle";
  documentId: string;
  documentName: string;
  lastActive: string;
}

export function ActiveUsersWidget() {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching active users
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: "user1",
          name: "Dr. Sarah Chen",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "editing",
          documentId: "paper1",
          documentName: "Neural Networks in AI",
          lastActive: "just now",
        },
        {
          id: "user2",
          name: "Prof. Michael Rodriguez",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "viewing",
          documentId: "paper2",
          documentName: "Machine Learning Basics",
          lastActive: "2 min ago",
        },
        {
          id: "user3",
          name: "Dr. Emily Nakamura",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "editing",
          documentId: "draft1",
          documentName: "Climate Change Analysis",
          lastActive: "just now",
        },
        {
          id: "user4",
          name: "Dr. James Wilson",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "idle",
          documentId: "paper3",
          documentName: "Quantum Computing",
          lastActive: "15 min ago",
        },
        {
          id: "user5",
          name: "Prof. Aisha Patel",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "viewing",
          documentId: "paper4",
          documentName: "Biomedical Engineering",
          lastActive: "5 min ago",
        },
      ];

      setActiveUsers(mockUsers);
      setIsLoading(false);
    }, 1000);

    // Simulate user status changes
    const interval = setInterval(() => {
      setActiveUsers((current) =>
        current.map((user) => {
          // Randomly update user status for demo purposes
          if (Math.random() > 0.7) {
            const statuses: ("editing" | "viewing" | "idle")[] = [
              "editing",
              "viewing",
              "idle",
            ];
            const newStatus =
              statuses[Math.floor(Math.random() * statuses.length)];
            return {
              ...user,
              status: newStatus,
              lastActive: newStatus !== "idle" ? "just now" : user.lastActive,
            };
          }
          return user;
        })
      );
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "editing":
        return <Edit className="h-3 w-3 text-green-500" />;
      case "viewing":
        return <Eye className="h-3 w-3 text-blue-500" />;
      case "idle":
        return <Clock className="h-3 w-3 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "editing":
        return "bg-green-500";
      case "viewing":
        return "bg-blue-500";
      case "idle":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "editing":
        return "Editing";
      case "viewing":
        return "Viewing";
      case "idle":
        return "Idle";
      default:
        return "Unknown";
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/10 p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-1">
            Active Collaborators
          </h3>
          <p className="text-sm text-black/60 dark:text-white/60">
            Team members currently working
          </p>
        </div>
        <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
          <Users className="h-5 w-5 text-black/70 dark:text-white/70" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-black/50 dark:text-white/50 px-2">
            <span>User</span>
            <span>Status</span>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {activeUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layoutId={user.id}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <motion.div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(
                        user.status
                      )} rounded-full flex items-center justify-center border-2 border-white dark:border-black`}
                      animate={
                        user.status === "editing"
                          ? {
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.8, 1],
                            }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat:
                          user.status === "editing"
                            ? Number.POSITIVE_INFINITY
                            : 0,
                      }}
                    >
                      {getStatusIcon(user.status)}
                    </motion.div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white truncate">{user.name}</p>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-black/50 dark:text-white/50" />
                      <p className="text-xs text-black/60 dark:text-white/60 truncate">
                        {user.documentName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "editing"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : user.status === "viewing"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {getStatusText(user.status)}
                    </span>
                    <span className="text-xs text-black/50 dark:text-white/50 whitespace-nowrap">
                      {user.lastActive}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center">
        <div className="text-xs text-black/50 dark:text-white/50">
          <span className="font-medium text-green-600 dark:text-green-400">
            {activeUsers.filter((u) => u.status === "editing").length}
          </span>{" "}
          editing •{" "}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {activeUsers.filter((u) => u.status === "viewing").length}
          </span>{" "}
          viewing •{" "}
          <span className="font-medium text-gray-600 dark:text-gray-400">
            {activeUsers.filter((u) => u.status === "idle").length}
          </span>{" "}
          idle
        </div>
        <motion.button
          className="text-sm text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View all →
        </motion.button>
      </div>
    </motion.div>
  );
}
