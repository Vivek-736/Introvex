"use client";

import React from "react";
import { cn } from "@/lib/utils";

const CustomLoading = () => {
  return (
    <div className="w-full flex justify-start px-4 animate-fade-in">
      <div className="max-w-[70%] bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent animate-text-glow">
            Introvex is thinking
          </span>
          <span className="flex space-x-1 text-purple-700 text-2xl">
            <span className="animate-bounce animation-delay-0">.</span>
            <span className="animate-bounce animation-delay-150">.</span>
            <span className="animate-bounce animation-delay-300">.</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomLoading;
