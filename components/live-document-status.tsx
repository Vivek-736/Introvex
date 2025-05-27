"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, GitBranch } from "lucide-react";
import { LiveCollaborationIndicator } from "@/components/live-collaboration-indicator";

interface LiveDocumentStatusProps {
  documentId: string;
}

export function LiveDocumentStatus({ documentId }: LiveDocumentStatusProps) {
  const [lastSaved, setLastSaved] = useState("just now");
  const [version, setVersion] = useState("1.2.3");
  const [changes, setChanges] = useState(0);

  // Simulate auto-saving and version changes
  useEffect(() => {
    const saveInterval = setInterval(() => {
      setLastSaved("just now");

      // Occasionally increment version
      if (Math.random() > 0.8) {
        const vParts = version.split(".");
        const newMinor = Number.parseInt(vParts[2]) + 1;
        if (newMinor > 9) {
          const newMajor = Number.parseInt(vParts[1]) + 1;
          setVersion(`${vParts[0]}.${newMajor}.0`);
        } else {
          setVersion(`${vParts[0]}.${vParts[1]}.${newMinor}`);
        }
      }

      // Reset changes counter
      setChanges(0);
    }, 10000);

    // Simulate changes being made
    const changeInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        setChanges((c) => c + 1);
      }
    }, 3000);

    // Update "last saved" text
    const updateInterval = setInterval(() => {
      if (lastSaved === "just now") {
        setLastSaved("1 min ago");
      } else if (lastSaved === "1 min ago") {
        setLastSaved("2 mins ago");
      } else if (lastSaved === "2 mins ago") {
        setLastSaved("3 mins ago");
      }
    }, 60000);

    return () => {
      clearInterval(saveInterval);
      clearInterval(changeInterval);
      clearInterval(updateInterval);
    };
  }, [version, lastSaved]);

  return (
    <motion.div
      className="flex items-center gap-4 px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-black/10"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 text-sm text-black/60">
        <History className="h-4 w-4" />
        <span>Saved {lastSaved}</span>
        {changes > 0 && (
          <motion.span
            className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {changes} unsaved {changes === 1 ? "change" : "changes"}
          </motion.span>
        )}
      </div>

      <div className="h-4 w-px bg-black/10"></div>

      <div className="flex items-center gap-2 text-sm text-black/60">
        <GitBranch className="h-4 w-4" />
        <span>Version {version}</span>
      </div>

      <div className="h-4 w-px bg-black/10"></div>

      <LiveCollaborationIndicator documentId={documentId} compact={true} />

      <div className="ml-auto">
        <motion.button
          className="text-xs bg-black/5 hover:bg-black/10 px-2 py-1 rounded transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View History
        </motion.button>
      </div>
    </motion.div>
  );
}
