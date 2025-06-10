"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";

interface HeaderProps {
  variant?: "home" | "workspace";
}

export function Header({ variant = "home" }: HeaderProps) {
  const pathname = usePathname();
  const isWorkspace = pathname === "/workspace";
  const [isHovered, setIsHovered] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <header
      className={`${
        variant === "home"
          ? "bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-black/90"
          : "bg-white/95 dark:bg-black/95 border-b border-gray-200 dark:border-gray-700"
      } backdrop-blur-lg sticky top-0 z-[100] py-4 px-6 shadow-sm`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto flex items-center justify-between sm:max-w-7xl">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="text-3xl flex gap-2 font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 ml-4"
          >
            <Image
              src="/favicon.png"
              alt="Difras Logo"
              width={30}
              height={25}
              className="rounded-xl"
            />
            Difras
          </Link>
          <nav className="hidden md:flex items-center gap-10 ml-8">
            {[
              { href: "/#features", label: "Features" },
              { href: "/#how-it-works", label: "How It Works" },
              ...(isSignedIn ? [{ href: "/workspace", label: "Workspace" }] : []),
            ].map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`text-sm font-medium ${
                    item.href === "/workspace" && isWorkspace
                      ? "text-gray-900 dark:text-gray-100 border-b-2 border-gray-900 dark:border-gray-100"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  } transition-colors duration-300 relative group`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gray-900 dark:bg-gray-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {isSignedIn ? (
            variant === "workspace" ? (
              <div className="flex items-center gap-6">
                <button className="px-5 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 text-black dark:text-white">
                  Save All
                </button>
                <button className="px-5 py-2 text-sm bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-100 text-white dark:text-black rounded-full hover:from-gray-900 dark:hover:from-gray-100 hover:to-black dark:hover:to-gray-200 transition-all duration-300">
                  Export
                </button>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                      userButtonTrigger: "p-0",
                    },
                  }}
                />
              </div>
            ) : (
              <Link href="/workspace">
                <Button className="rounded-full sm:block hidden bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-100 text-white dark:text-black hover:from-gray-900 dark:hover:from-gray-100 hover:to-black dark:hover:to-gray-200 transition-all duration-300 px-6 py-2 text-sm font-medium">
                  Dashboard
                </Button>
              </Link>
            )
          ) : (
            <>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  className="rounded-full border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-all duration-300 px-6 py-2 text-sm font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="rounded-full sm:block hidden bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-100 text-white dark:text-black hover:from-gray-900 dark:hover:from-gray-100 hover:to-black dark:hover:to-gray-200 transition-all duration-300 px-6 py-2 text-sm font-medium">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      {isHovered && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300 dark:from-gray-600 to-transparent" />
      )}
    </header>
  );
}