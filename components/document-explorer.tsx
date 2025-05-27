"use client";

import { useState } from "react";
import {
  ChevronRight,
  File,
  FileText,
  Upload,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Folder,
  Search,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "txt";
  size: string;
  modified: string;
}

interface DocumentExplorerProps {
  onDocumentSelect: (documentId: string) => void;
}

export function DocumentExplorer({ onDocumentSelect }: DocumentExplorerProps) {
  const [folders, setFolders] = useState([
    {
      id: "research",
      name: "Research Papers",
      isOpen: true,
      documents: [
        {
          id: "paper1",
          name: "Neural Networks in AI.pdf",
          type: "pdf",
          size: "2.4 MB",
          modified: "2 hours ago",
        },
        {
          id: "paper2",
          name: "Machine Learning Basics.pdf",
          type: "pdf",
          size: "1.8 MB",
          modified: "1 day ago",
        },
      ],
      subfolders: [],
    },
    {
      id: "drafts",
      name: "Draft Documents",
      isOpen: false,
      documents: [
        {
          id: "draft1",
          name: "Chapter 1 - Introduction.doc",
          type: "doc",
          size: "456 KB",
          modified: "3 hours ago",
        },
      ],
      subfolders: [],
    },
  ]);

  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFolder = (folderId: string) => {
    setFolders(
      folders.map((folder) =>
        folder.id === folderId ? { ...folder, isOpen: !folder.isOpen } : folder
      )
    );
  };

  const handleDocumentClick = (document: any) => {
    setSelectedDocument(document.id);
    onDocumentSelect(document.id);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-600" />;
      case "doc":
        return <File className="h-4 w-4 text-blue-600" />;
      default:
        return <File className="h-4 w-4 text-black/60" />;
    }
  };

  // Animation variants
  const folderVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-black/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-black/80">
            Explorer
          </h2>
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-black/5 rounded">
              <Filter className="h-4 w-4 text-black/60" />
            </button>
            <button className="p-1 hover:bg-black/5 rounded">
              <MoreHorizontal className="h-4 w-4 text-black/60" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="h-4 w-4 text-black/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-black/5 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-black/20"
          />
        </div>

        {/* Upload Area */}
        <motion.div
          className="border-2 border-dashed border-black/20 rounded-lg p-4 text-center hover:border-black/40 transition-colors cursor-pointer bg-gradient-to-r from-gray-50 to-white"
          whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          >
            <Upload className="h-6 w-6 mx-auto mb-2 text-black/60" />
          </motion.div>
          <p className="text-xs text-black/60">
            Drop files here or click to upload
          </p>
        </motion.div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {folders.map((folder: any) => (
          <div key={folder.id} className="mb-2">
            {/* Folder Header */}
            <motion.div
              className="flex items-center gap-1 p-2 hover:bg-black/5 rounded cursor-pointer"
              onClick={() => toggleFolder(folder.id)}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ rotate: folder.isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4 text-black/60" />
              </motion.div>
              {folder.isOpen ? (
                <FolderOpen className="h-4 w-4 text-black/60" />
              ) : (
                <Folder className="h-4 w-4 text-black/60" />
              )}
              <span className="text-sm font-medium">{folder.name}</span>
            </motion.div>

            {/* Folder Contents */}
            <AnimatePresence>
              {folder.isOpen && (
                <motion.div
                  className="ml-6 space-y-1"
                  variants={folderVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {folder.documents.map((document: any, index: number) => (
                    <motion.div
                      key={document.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-black/5 ${
                        selectedDocument === document.id ? "bg-black/10" : ""
                      }`}
                      onClick={() => handleDocumentClick(document)}
                      variants={itemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ x: 4, backgroundColor: "rgba(0,0,0,0.05)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {getFileIcon(document.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{document.name}</p>
                        <p className="text-xs text-black/50">
                          {document.size} • {document.modified}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Add Document Button */}
                  <motion.div
                    className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-black/5 text-black/60"
                    variants={itemVariants}
                    custom={folder.documents.length}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ x: 4, backgroundColor: "rgba(0,0,0,0.05)" }}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add document</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
