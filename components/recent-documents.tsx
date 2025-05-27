"use client";

import { motion } from "framer-motion";
import { FileText, Clock, Users, MoreHorizontal } from "lucide-react";

interface RecentDocumentsProps {
  onNavigateToDocument?: (documentId: string) => void;
}

export function RecentDocuments({
  onNavigateToDocument,
}: RecentDocumentsProps) {
  const recentDocs = [
    {
      id: "paper1",
      title: "Neural Networks in AI",
      type: "Research Paper",
      lastModified: "2 hours ago",
      collaborators: 3,
      status: "In Progress",
      statusColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "paper2",
      title: "Machine Learning Basics",
      type: "Tutorial",
      lastModified: "1 day ago",
      collaborators: 2,
      status: "Review",
      statusColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "draft1",
      title: "Climate Change Analysis",
      type: "Research Paper",
      lastModified: "2 days ago",
      collaborators: 4,
      status: "Draft",
      statusColor: "bg-gray-100 text-gray-800",
    },
    {
      id: "paper3",
      title: "Quantum Computing",
      type: "Research Paper",
      lastModified: "3 days ago",
      collaborators: 1,
      status: "Published",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: "paper4",
      title: "Biomedical Engineering",
      type: "Study",
      lastModified: "1 week ago",
      collaborators: 5,
      status: "In Progress",
      statusColor: "bg-yellow-100 text-yellow-800",
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
            Recent Documents
          </h3>
          <p className="text-sm text-black/60">Your latest work</p>
        </div>
        <div className="p-2 bg-black/5 rounded-lg">
          <FileText className="h-5 w-5 text-black/70" />
        </div>
      </div>

      <div className="space-y-3">
        {recentDocs.map((doc, index) => (
          <motion.div
            key={doc.id}
            className="p-4 border border-black/10 rounded-lg hover:bg-black/5 transition-all duration-200 cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            onClick={() => onNavigateToDocument?.(doc.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-black truncate group-hover:text-blue-600 transition-colors">
                  {doc.title}
                </h4>
                <p className="text-xs text-black/60">{doc.type}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded transition-all">
                <MoreHorizontal className="h-4 w-4 text-black/60" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-black/60">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {doc.lastModified}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {doc.collaborators}
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${doc.statusColor}`}
              >
                {doc.status}
              </span>
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
          View all documents →
        </motion.button>
      </div>
    </motion.div>
  );
}
