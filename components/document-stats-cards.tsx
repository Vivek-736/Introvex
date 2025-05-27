"use client";

import { motion } from "framer-motion";
import { FileText, Users, Clock, Eye } from "lucide-react";

interface DocumentStatsCardsProps {
  timeRange: string;
}

export function DocumentStatsCards({ timeRange }: DocumentStatsCardsProps) {
  const stats = [
    {
      title: "Total Documents",
      value: "24",
      change: "+12%",
      changeType: "positive" as const,
      icon: FileText,
      description: "Active research papers",
    },
    {
      title: "Collaborators",
      value: "8",
      change: "+2",
      changeType: "positive" as const,
      icon: Users,
      description: "Team members working",
    },
    {
      title: "Hours Saved",
      value: "156",
      change: "+23%",
      changeType: "positive" as const,
      icon: Clock,
      description: "Through AI assistance",
    },
    {
      title: "Document Views",
      value: "1,247",
      change: "+18%",
      changeType: "positive" as const,
      icon: Eye,
      description: "Total document opens",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          className="bg-white rounded-xl border border-black/10 p-6 hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-black/5 rounded-lg">
              <stat.icon className="h-5 w-5 text-black/70" />
            </div>
            <span
              className={`text-sm font-medium ${
                stat.changeType === "positive"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stat.change}
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-black">{stat.value}</h3>
            <p className="text-sm font-medium text-black/80">{stat.title}</p>
            <p className="text-xs text-black/60">{stat.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
