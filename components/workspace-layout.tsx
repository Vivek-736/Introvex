"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Background patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                              linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-100/20 to-purple-100/20 blur-[80px]"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-amber-100/20 to-rose-100/20 blur-[70px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="flex-1 flex flex-col z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
