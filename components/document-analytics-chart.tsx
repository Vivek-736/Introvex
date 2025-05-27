"use client"

import { motion } from "framer-motion"
import { BarChart3 } from "lucide-react"

interface DocumentAnalyticsChartProps {
  timeRange: string
}

export function DocumentAnalyticsChart({ timeRange }: DocumentAnalyticsChartProps) {
  // Mock data for the chart
  const chartData = [
    { day: "Mon", documents: 4, edits: 12, views: 45 },
    { day: "Tue", documents: 6, edits: 18, views: 67 },
    { day: "Wed", documents: 3, edits: 8, views: 34 },
    { day: "Thu", documents: 8, edits: 24, views: 89 },
    { day: "Fri", documents: 5, edits: 15, views: 56 },
    { day: "Sat", documents: 2, edits: 6, views: 23 },
    { day: "Sun", documents: 1, edits: 3, views: 12 },
  ]

  const maxValue = Math.max(...chartData.map((d) => Math.max(d.documents, d.edits, d.views)))

  return (
    <motion.div
      className="bg-white rounded-xl border border-black/10 p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-black mb-1">Document Activity</h3>
          <p className="text-sm text-black/60">Daily document creation, edits, and views</p>
        </div>
        <div className="p-2 bg-black/5 rounded-lg">
          <BarChart3 className="h-5 w-5 text-black/70" />
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {chartData.map((data, index) => (
          <motion.div
            key={data.day}
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="w-8 text-sm font-medium text-black/70">{data.day}</div>
            <div className="flex-1 flex gap-1">
              {/* Documents bar */}
              <motion.div
                className="bg-blue-500 rounded-sm"
                style={{ width: `${(data.documents / maxValue) * 100}%`, minWidth: "2px" }}
                initial={{ width: 0 }}
                animate={{ width: `${(data.documents / maxValue) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
              {/* Edits bar */}
              <motion.div
                className="bg-green-500 rounded-sm"
                style={{ width: `${(data.edits / maxValue) * 80}%`, minWidth: "2px" }}
                initial={{ width: 0 }}
                animate={{ width: `${(data.edits / maxValue) * 80}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
              />
              {/* Views bar */}
              <motion.div
                className="bg-purple-500 rounded-sm"
                style={{ width: `${(data.views / maxValue) * 60}%`, minWidth: "2px" }}
                initial={{ width: 0 }}
                animate={{ width: `${(data.views / maxValue) * 60}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
              />
            </div>
            <div className="flex gap-4 text-xs text-black/60 w-32">
              <span>{data.documents}d</span>
              <span>{data.edits}e</span>
              <span>{data.views}v</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-black/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <span className="text-xs text-black/70">Documents</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span className="text-xs text-black/70">Edits</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
          <span className="text-xs text-black/70">Views</span>
        </div>
      </div>
    </motion.div>
  )
}
