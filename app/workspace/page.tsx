"use client";

import React from "react";
import Chat from "@/components/Chat";
import ChatHeader from "@/components/workspaceUI/ChatHeader";

const WorkspacePage: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full">
      <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 gap-10 max-w-5xl mx-auto min-h-screen">
        <div className="justify-center text-center space-x-2">
          <ChatHeader />
        </div>
        <Chat />
      </div>
    </div>
  );
};

export default WorkspacePage;
