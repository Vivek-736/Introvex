"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`min-h-screen bg-black flex flex-col items-center justify-center px-4 transition-opacity duration-1000 ease-in ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <h1 className="text-8xl font-bold text-white animate-pulse mb-4">404</h1>
      <p className="text-2xl text-white mb-8 text-center animate-fade-in">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-white text-black font-semibold rounded-lg transition-transform duration-300 hover:scale-105 hover:bg-opacity-80"
      >
        Back to Home
      </Link>
    </div>
  );
}