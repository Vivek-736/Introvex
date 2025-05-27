"use client";

import { useState, useEffect } from "react";
import { DocumentExplorer } from "@/components/document-explorer";
import { DocumentViewer } from "@/components/document-viewer";
import { AiChat } from "@/components/ai-chat";
import { Header } from "@/components/header";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { Dashboard } from "@/components/dashboard";
import { motion } from "framer-motion";
import {
  Loader2,
  Plus,
  Settings,
  Search,
  Bell,
  HelpCircle,
  LayoutDashboard,
  FileText,
} from "lucide-react";

type WorkspaceView = "dashboard" | "documents";

export default function WorkspacePage() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<WorkspaceView>("dashboard");

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocument(documentId);
    if (!openTabs.includes(documentId)) {
      setOpenTabs([...openTabs, documentId]);
    }
    setActiveTab(documentId);
    setCurrentView("documents");
  };

  const handleTabClose = (documentId: string) => {
    const newTabs = openTabs.filter((tab) => tab !== documentId);
    setOpenTabs(newTabs);

    if (activeTab === documentId) {
      setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
      setSelectedDocument(
        newTabs.length > 0 ? newTabs[newTabs.length - 1] : null
      );
    }
  };

  const handleTabSwitch = (documentId: string) => {
    setActiveTab(documentId);
    setSelectedDocument(documentId);
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

  if (isLoading) {
    return (
      <WorkspaceLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="h-12 w-12 text-black animate-spin mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Loading your workspace
              </h2>
              <p className="text-black/60">
                Preparing your documents and AI assistant...
              </p>
            </motion.div>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <Header variant="workspace" />

      {/* Secondary toolbar */}
      <motion.div
        className="bg-white border-b border-black/10 px-4 py-2 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-black/5 rounded-lg p-1">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                currentView === "dashboard"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/70 hover:text-black hover:bg-white/50"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("documents")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                currentView === "documents"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/70 hover:text-black hover:bg-white/50"
              }`}
            >
              <FileText className="h-4 w-4" />
              Documents
            </button>
          </div>
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <Plus className="h-4 w-4 text-black/70" />
          </button>
          <div className="relative">
            <Search className="h-4 w-4 text-black/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-9 pr-4 py-1.5 text-sm bg-black/5 rounded-full w-64 focus:outline-none focus:ring-1 focus:ring-black/20"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors relative">
            <Bell className="h-4 w-4 text-black/70" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <HelpCircle className="h-4 w-4 text-black/70" />
          </button>
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <Settings className="h-4 w-4 text-black/70" />
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      {currentView === "dashboard" ? (
        <Dashboard onNavigateToDocument={handleDocumentSelect} />
      ) : (
        <div className="relative flex-1 flex">
          {/* Left Pane - Document Explorer (Fixed) */}
          <motion.div
            className="fixed top-[128px] left-0 w-80 h-[calc(100vh-128px)] border-r border-black/10 bg-white flex flex-col shadow-sm overflow-y-auto"
            variants={itemVariants}
          >
            <DocumentExplorer onDocumentSelect={handleDocumentSelect} />
          </motion.div>

          {/* Center Pane - Document Viewer */}
          <motion.div
            className="flex-1 ml-80 mr-96 bg-white flex flex-col shadow-sm overflow-y-auto h-[calc(100vh-128px)]"
            variants={itemVariants}
          >
            <DocumentViewer
              openTabs={openTabs}
              activeTab={activeTab}
              onTabClose={handleTabClose}
              onTabSwitch={handleTabSwitch}
            />
          </motion.div>

          {/* Right Pane - AI Chat (Fixed) */}
          <motion.div
            className="fixed top-[128px] right-0 w-96 h-[calc(100vh-128px)] border-l border-black/10 bg-white flex flex-col shadow-sm overflow-y-auto"
            variants={itemVariants}
          >
            <AiChat currentDocument={selectedDocument} />
          </motion.div>
        </div>
      )}
    </WorkspaceLayout>
  );
}