"use client";

import React from "react";
import { motion } from "framer-motion";

const CustomLoading = () => {
  return (
    <div className="w-full flex items-center justify-start px-6 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="backdrop-blur-md bg-white/5 border border-white/10 shadow-xl rounded-2xl p-6 max-w-[70%]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex space-x-1 items-center">
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Thinking
            </span>
          </div>
          
          <div className="flex space-x-2 ml-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-ping delay-150" />
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-ping delay-300" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomLoading;
