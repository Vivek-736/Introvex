"use client";

import { motion } from "framer-motion";
import {
  Activity,
  FileText,
  Edit,
  Share,
  Download,
  MessageCircle,
  Star,
  GitBranch,
} from "lucide-react";

export function ActivityFeed() {
  const activities = [
    {
      id: 1,
      type: "document_created",
      user: "Dr. Sarah Chen",
      action: "created a new document",
      target: "Quantum Computing Research Paper",
      time: "2 minutes ago",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: 2,
      type: "document_edited",
      user: "Prof. Michael Rodriguez",
      action: "made 12 edits to",
      target: "Machine Learning Fundamentals",
      time: "15 minutes ago",
      icon: Edit,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: 3,
      type: "document_shared",
      user: "Dr. Emily Nakamura",
      action: "shared",
      target: "Climate Change Analysis",
      time: "1 hour ago",
      icon: Share,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: 4,
      type: "comment_added",
      user: "Dr. James Wilson",
      action: "commented on",
      target: "Biomedical Engineering Study",
      time: "2 hours ago",
      icon: MessageCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: 5,
      type: "document_downloaded",
      user: "Dr. Aisha Patel",
      action: "downloaded",
      target: "Molecular Biology Research",
      time: "3 hours ago",
      icon: Download,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      id: 6,
      type: "document_starred",
      user: "Dr. Sarah Chen",
      action: "starred",
      target: "Neural Networks in AI",
      time: "4 hours ago",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      id: 7,
      type: "collaboration_started",
      user: "Prof. Rodriguez & Dr. Chen",
      action: "started collaborating on",
      target: "Advanced AI Research",
      time: "5 hours ago",
      icon: GitBranch,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-xl border border-black/10 p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-black mb-1">
            Recent Activity
          </h3>
          <p className="text-sm text-black/60">
            Latest actions across your workspace
          </p>
        </div>
        <div className="p-2 bg-black/5 rounded-lg">
          <Activity className="h-5 w-5 text-black/70" />
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ x: 4 }}
          >
            <div className={`p-2 rounded-lg ${activity.bgColor} flex-shrink-0`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm">
                <span className="font-medium text-black">{activity.user}</span>
                <span className="text-black/70"> {activity.action} </span>
                <span className="font-medium text-black">
                  {activity.target}
                </span>
              </div>
              <div className="text-xs text-black/50 mt-1">{activity.time}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-black/10">
        <motion.button
          className="w-full text-sm text-black/70 hover:text-black transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View all activity →
        </motion.button>
      </div>
    </motion.div>
  );
}
