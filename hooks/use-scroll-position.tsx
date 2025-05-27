// hooks/use-scroll-position.tsx
"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null
  );
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollYRef.current) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollYRef.current) {
        setScrollDirection("up");
      }

      setScrollY(currentScrollY);
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array

  return { scrollY, scrollDirection };
}
