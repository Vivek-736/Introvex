"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

interface HeaderProps {
  variant?: "home" | "workspace";
}

export function Header({ variant = "home" }: HeaderProps) {
  const pathname = usePathname();
  const isWorkspace = pathname === "/workspace";
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants for header entrance
  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Animation variants for nav links
  const linkVariants = {
    hover: {
      scale: 1.1,
      color: "#000000",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.header
      className={`${
        variant === "home"
          ? "fixed top-0 left-0 right-0 bg-gradient-to-r from-white/90 to-gray-50/90"
          : "bg-white/95 border-b border-gray-200"
      } backdrop-blur-lg sticky top-0 z-50 py-4 px-6 shadow-sm`}
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 ml-4"
          >
            Difras
          </Link>
          <nav className="hidden md:flex items-center gap-10 ml-8">
            {[
              { href: "/#features", label: "Features" },
              { href: "/#how-it-works", label: "How It Works" },
              { href: "/workspace", label: "Workspace" },
              { href: "/about", label: "About" },
              { href: "/pricing", label: "pricing" },
            ].map((item) => (
              <motion.div
                key={item.href}
                variants={linkVariants}
                whileHover="hover"
              >
                <Link
                  href={item.href}
                  className={`text-sm font-medium ${
                    item.href === "/workspace" && isWorkspace
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  } transition-colors duration-300 relative group`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>

        {variant === "workspace" ? (
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 text-sm text-gray-600">
              <div className="h-4 w-px bg-gray-300"></div>
            </div>
            <motion.button
              className="px-5 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save All
            </motion.button>
            <motion.button
              className="px-5 py-2 text-sm bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full hover:from-gray-900 hover:to-black transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Export
            </motion.button>
            <div className="h-6 w-px bg-gray-300"></div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signup">
                <Button className="px-5 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-300">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="rounded-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 px-6 py-2 text-sm font-medium"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="rounded-full bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black transition-all duration-300 px-6 py-2 text-sm font-medium">
                Get Started
              </Button>
            </motion.div>
          </div>
        )}
      </div>
      {isHovered && (
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.header>
  );
}
