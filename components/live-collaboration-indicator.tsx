"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Edit, Eye, Clock } from "lucide-react";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  avatar: string;
  status: "editing" | "viewing" | "idle";
  lastActive?: string;
  currentSection?: string;
}

interface LiveCollaborationIndicatorProps {
  documentId?: string;
  compact?: boolean;
  showDetails?: boolean;
}

export function LiveCollaborationIndicator({
  documentId,
  compact = false,
  showDetails = true,
}: LiveCollaborationIndicatorProps) {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [expanded, setExpanded] = useState(false);

  // Simulate fetching active users
  useEffect(() => {
    // This would be replaced with a real-time subscription in production
    const mockUsers: User[] = [
      {
        id: "user1",
        name: "Dr. Sarah Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "editing",
        lastActive: "just now",
        currentSection: "Introduction",
      },
      {
        id: "user2",
        name: "Prof. Michael Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "viewing",
        lastActive: "2 min ago",
        currentSection: "Methodology",
      },
      {
        id: "user3",
        name: "Dr. Emily Nakamura",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "idle",
        lastActive: "5 min ago",
      },
    ];

    if (documentId) {
      // Filter users based on document ID in a real implementation
      setActiveUsers(mockUsers);
    } else {
      setActiveUsers([]);
    }

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

    return () => clearInterval(interval);
  }, [documentId]);

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

  if (activeUsers.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex -space-x-2 relative">
        {activeUsers.map((user) => (
          <motion.div
            key={user.id}
            className="relative"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white relative">
              <Image
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                fill
                className="object-cover"
              />
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(
                  user.status
                )} border-2 border-white rounded-full`}
              />
            </div>
          </motion.div>
        ))}
        {activeUsers.length > 3 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium border-2 border-white">
            +{activeUsers.length - 3}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        className="bg-white rounded-lg border border-black/10 shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-black/5 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-black/5 rounded-full">
              <Users className="h-4 w-4 text-black/70" />
            </div>
            <div>
              <h4 className="text-sm font-medium">
                {activeUsers.length}{" "}
                {activeUsers.length === 1 ? "person" : "people"} collaborating
              </h4>
            </div>
          </div>
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="w-6 h-6 rounded-full overflow-hidden border-2 border-white relative"
              >
                <Image
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
                <div
                  className={`absolute bottom-0 right-0 w-2 h-2 ${getStatusColor(
                    user.status
                  )} border border-white rounded-full`}
                />
              </div>
            ))}
            {activeUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium border-2 border-white">
                +{activeUsers.length - 3}
              </div>
            )}
          </div>
        </div>

        {showDetails && (
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 border-t border-black/10 max-h-60 overflow-y-auto">
                  <div className="space-y-3">
                    {activeUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                              user.status
                            )} rounded-full flex items-center justify-center border border-white`}
                          >
                            {getStatusIcon(user.status)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {user.name}
                            </p>
                            <span className="text-xs text-black/50">
                              {user.lastActive}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                user.status === "idle"
                                  ? "bg-gray-400"
                                  : getStatusColor(user.status)
                              }`}
                            />
                            <p className="text-xs text-black/60 capitalize">
                              {user.status}
                              {user.currentSection &&
                                user.status !== "idle" && (
                                  <span> • {user.currentSection}</span>
                                )}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Pulse animation for active editing */}
      {activeUsers.some((user) => user.status === "editing") && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        />
      )}
    </div>
  );
}
