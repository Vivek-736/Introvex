"use client";

import React, { createContext, useContext, useMemo } from "react";
import Vapi from "@vapi-ai/web";

interface VapiContextType {
  vapi: Vapi;
}

const VapiContext = createContext<VapiContextType | null>(null);

export const VapiProvider = ({ children }: { children: React.ReactNode }) => {
  const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  if (!apiKey) {
    // console.error("Vapi initialization failed: NEXT_PUBLIC_VAPI_PUBLIC_KEY is not defined");
    throw new Error("Vapi API key is missing. Please set NEXT_PUBLIC_VAPI_PUBLIC_KEY in your environment variables.");
  }

  // console.log("Initializing Vapi with public key:", apiKey.slice(0, 4) + "...");
  const vapi = useMemo(() => new Vapi(apiKey), [apiKey]);

  return (
    <VapiContext.Provider value={{ vapi }}>
      {children}
    </VapiContext.Provider>
  );
};

export const useVapi = () => {
  const context = useContext(VapiContext);
  if (!context) {
    throw new Error("useVapi must be used within a VapiProvider");
  }
  return context.vapi;
};