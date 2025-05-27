"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, RefreshCw } from "lucide-react";
import { DocumentAnalyticsChart } from "@/components/document-analytics-chart";
import { ActivityFeed } from "@/components/activity-feed";
import { DocumentStatsCards } from "@/components/document-stats-cards";
import { CollaborationInsights } from "@/components/collaboration-insights";
import { RecentDocuments } from "@/components/recent-documents";
import { ActiveUsersWidget } from "@/components/active-users-widget";

interface DashboardProps {
  onNavigateToDocument?: (documentId: string) => void;
}

export function Dashboard({ onNavigateToDocument }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <motion.div
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-black/10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black mb-2">Dashboard</h1>
            <p className="text-black/60">
              Overview of your research workspace and document analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-black/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black/20"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 border border-black/20 rounded-lg hover:bg-black/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </motion.button>
            <motion.button
              className="p-2 border border-black/20 rounded-lg hover:bg-black/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="p-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <DocumentStatsCards timeRange={timeRange} />
        </motion.div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <DocumentAnalyticsChart timeRange={timeRange} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <CollaborationInsights timeRange={timeRange} />
          </motion.div>
        </div>

        {/* Activity, Recent Documents, and Active Users */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <ActiveUsersWidget />
          </motion.div>
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <ActivityFeed />
          </motion.div>
          <motion.div variants={itemVariants}>
            <RecentDocuments onNavigateToDocument={onNavigateToDocument} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
