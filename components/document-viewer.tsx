"use client";

import type React from "react";

import { useState } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Search,
  Share,
  Edit,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveDocumentStatus } from "@/components/live-document-status";
import { LiveCollaborationIndicator } from "@/components/live-collaboration-indicator";

interface DocumentViewerProps {
  openTabs: string[];
  activeTab: string | null;
  onTabClose: (documentId: string) => void;
  onTabSwitch: (documentId: string) => void;
}

const documentNames: Record<string, string> = {
  paper1: "Neural Networks in AI.pdf",
  paper2: "Machine Learning Basics.pdf",
  draft1: "Chapter 1 - Introduction.doc",
};

export function DocumentViewer({
  openTabs,
  activeTab,
  onTabClose,
  onTabSwitch,
}: DocumentViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(24);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = Number.parseInt(e.target.value);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (openTabs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-black/5">
        <motion.div
          className="text-center max-w-md p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-4 bg-black/10 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          >
            <Search className="h-12 w-12 text-black/40" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
          <p className="text-black/60 mb-6">
            Select a document from the explorer to view it here
          </p>
          <motion.button
            className="px-4 py-2 bg-black text-white rounded-lg flex items-center justify-center mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-black/10 bg-black/5 overflow-x-auto scrollbar-hide">
        {openTabs.map((tabId) => (
          <motion.div
            key={tabId}
            className={`flex items-center gap-2 px-4 py-3 border-r border-black/10 cursor-pointer ${
              activeTab === tabId
                ? "bg-white border-b-2 border-b-black"
                : "hover:bg-black/5"
            }`}
            onClick={() => onTabSwitch(tabId)}
            whileHover={
              activeTab !== tabId ? { backgroundColor: "rgba(0,0,0,0.05)" } : {}
            }
            whileTap={{ scale: 0.98 }}
            layout
          >
            <span className="text-sm truncate max-w-32">
              {documentNames[tabId] || tabId}
            </span>
            <motion.button
              className="p-1 hover:bg-black/10 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tabId);
              }}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-3 w-3" />
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Live Document Status */}
      {activeTab && <LiveDocumentStatus documentId={activeTab} />}

      {/* Toolbar */}
      <motion.div
        className="flex items-center justify-between p-4 border-b border-black/10 bg-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <motion.button
            className="p-2 hover:bg-black/5 rounded"
            onClick={handleZoomOut}
            whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
            whileTap={{ scale: 0.9 }}
          >
            <ZoomOut className="h-4 w-4" />
          </motion.button>
          <span className="text-sm px-2">{zoomLevel}%</span>
          <motion.button
            className="p-2 hover:bg-black/5 rounded"
            onClick={handleZoomIn}
            whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
            whileTap={{ scale: 0.9 }}
          >
            <ZoomIn className="h-4 w-4" />
          </motion.button>
          <div className="w-px h-6 bg-black/20 mx-2"></div>
          <motion.button
            className="p-2 hover:bg-black/5 rounded"
            whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
            whileTap={{ scale: 0.9 }}
          >
            <RotateCw className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <motion.button
              className="p-1 hover:bg-black/5 rounded-l-md border border-black/10"
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <div className="flex items-center border-t border-b border-black/10 px-2 py-1">
              <input
                type="number"
                className="w-10 text-center text-sm focus:outline-none"
                value={currentPage}
                onChange={handlePageChange}
                min={1}
                max={totalPages}
              />
              <span className="text-sm text-black/60 mx-1">of</span>
              <span className="text-sm">{totalPages}</span>
            </div>
            <motion.button
              className="p-1 hover:bg-black/5 rounded-r-md border border-black/10"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="flex items-center gap-1">
            <motion.button
              className="p-2 hover:bg-black/5 rounded"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.9 }}
            >
              <Share className="h-4 w-4" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-black/5 rounded"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark className="h-4 w-4" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-black/5 rounded"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.9 }}
            >
              <Edit className="h-4 w-4" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-black/5 rounded"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.9 }}
            >
              <Download className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto bg-black/5 p-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
            }}
          >
            {/* Simulated PDF Content */}
            <motion.div
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              whileHover={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-8 space-y-6">
                <div className="text-center border-b border-black/10 pb-6">
                  <h1 className="text-3xl font-bold mb-2">
                    {activeTab === "paper1" &&
                      "Neural Networks in Artificial Intelligence"}
                    {activeTab === "paper2" &&
                      "Machine Learning: Fundamentals and Applications"}
                    {activeTab === "draft1" &&
                      "Chapter 1: Introduction to Research Methodology"}
                  </h1>
                  <p className="text-black/60">
                    {activeTab === "paper1" &&
                      "This paper presents a comprehensive analysis of neural network architectures and their applications in modern artificial intelligence systems. We explore various deep learning models, their theoretical foundations, and practical implementations across different domains."}
                    {activeTab === "paper2" &&
                      "Machine learning has revolutionized the way we approach data analysis and pattern recognition. This document provides an introduction to fundamental concepts, algorithms, and methodologies that form the backbone of modern machine learning systems."}
                    {activeTab === "draft1" &&
                      "This chapter introduces the fundamental principles of academic research methodology, establishing a framework for systematic investigation and knowledge discovery. We outline the key components of effective research design and implementation."}
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Abstract</h2>
                  <p className="text-black/80 leading-relaxed">
                    {activeTab === "paper1" &&
                      "This paper presents a comprehensive analysis of neural network architectures and their applications in modern artificial intelligence systems. We explore various deep learning models, their theoretical foundations, and practical implementations across different domains."}
                    {activeTab === "paper2" &&
                      "Machine learning has revolutionized the way we approach data analysis and pattern recognition. This document provides an introduction to fundamental concepts, algorithms, and methodologies that form the backbone of modern machine learning systems."}
                    {activeTab === "draft1" &&
                      "This chapter introduces the fundamental principles of academic research methodology, establishing a framework for systematic investigation and knowledge discovery. We outline the key components of effective research design and implementation."}
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">1. Introduction</h2>
                  <p className="text-black/80 leading-relaxed">
                    The field of artificial intelligence has witnessed
                    unprecedented growth in recent years, driven largely by
                    advances in neural network architectures and computational
                    capabilities. This research examines the evolution of these
                    technologies and their impact on various application
                    domains.
                  </p>
                  <p className="text-black/80 leading-relaxed">
                    Neural networks, inspired by biological neural systems, have
                    proven to be remarkably effective at learning complex
                    patterns from data. Their ability to approximate non-linear
                    functions makes them particularly suitable for tasks such as
                    image recognition, natural language processing, and
                    decision-making systems.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">2. Methodology</h2>
                  <p className="text-black/80 leading-relaxed">
                    Our research methodology combines theoretical analysis with
                    empirical evaluation. We conducted extensive experiments
                    using standard benchmarks and real-world datasets to
                    validate our findings and demonstrate the practical
                    applicability of the proposed approaches.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Floating collaboration indicator */}
        {activeTab && (
          <div className="absolute bottom-6 right-6">
            <LiveCollaborationIndicator documentId={activeTab} />
          </div>
        )}
      </div>
    </div>
  );
}