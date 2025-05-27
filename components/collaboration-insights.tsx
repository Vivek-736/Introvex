"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface CollaborationInsightsProps {
  timeRange: string;
}

export function CollaborationInsights({
  timeRange,
}: CollaborationInsightsProps) {
  const collaborationData = [
    { name: "Dr. Sarah Chen", contributions: 45, color: "bg-blue-500" },
    {
      name: "Prof. Michael Rodriguez",
      contributions: 38,
      color: "bg-green-500",
    },
    { name: "Dr. Emily Nakamura", contributions: 32, color: "bg-purple-500" },
    { name: "Dr. James Wilson", contributions: 28, color: "bg-orange-500" },
    { name: "Others", contributions: 15, color: "bg-gray-400" },
  ];

  const totalContributions = collaborationData.reduce(
    (sum, item) => sum + item.contributions,
    0
  );

  const recentActivity = [
    {
      user: "Dr. Sarah Chen",
      action: "commented on",
      document: "Neural Networks Paper",
      time: "2 hours ago",
    },
    {
      user: "Prof. Rodriguez",
      action: "edited",
      document: "ML Fundamentals",
      time: "4 hours ago",
    },
    {
      user: "Dr. Nakamura",
      action: "shared",
      document: "Climate Research",
      time: "6 hours ago",
    },
    {
      user: "Dr. Wilson",
      action: "created",
      document: "Biomedical Study",
      time: "1 day ago",
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
            Team Collaboration
          </h3>
          <p className="text-sm text-black/60">
            Contribution breakdown and recent activity
          </p>
        </div>
        <div className="p-2 bg-black/5 rounded-lg">
          <Users className="h-5 w-5 text-black/70" />
        </div>
      </div>

      {/* Contribution Chart */}
      <div className="space-y-3 mb-6">
        {collaborationData.map((contributor, index) => (
          <motion.div
            key={contributor.name}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="w-24 text-sm text-black/70 truncate">
              {contributor.name}
            </div>
            <div className="flex-1 bg-black/5 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${contributor.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (contributor.contributions / totalContributions) * 100
                  }%`,
                }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
            <div className="w-8 text-sm text-black/60 text-right">
              {contributor.contributions}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="border-t border-black/10 pt-4">
        <h4 className="text-sm font-medium text-black mb-3">Recent Activity</h4>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="w-2 h-2 bg-black/20 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <span className="font-medium text-black">{activity.user}</span>
                <span className="text-black/60"> {activity.action} </span>
                <span className="font-medium text-black">
                  {activity.document}
                </span>
                <div className="text-xs text-black/50 mt-1">
                  {activity.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
