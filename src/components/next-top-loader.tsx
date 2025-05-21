"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NextTopLoader() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [width, setWidth] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Start a new progress animation with even movement
  const startAnimation = () => {
    // Don't restart if already animating
    if (isAnimating) return;

    setIsAnimating(true);
    setWidth(0);

    // Create an even, continuous progression
    const animationDuration = 5000; // 5 seconds for normal animation
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const newWidth = Math.min((elapsedTime / animationDuration) * 100, 99);

      setWidth(newWidth);

      // Stop at 99% - will go to 100% when navigation completes
      if (newWidth >= 99) {
        clearInterval(progressInterval);
      }
    }, 16); // ~60fps

    // Hard timeout to end the loader after 30 seconds
    const maxTimeout = setTimeout(() => {
      clearInterval(progressInterval);
      completeAnimation();
    }, 30000);

    // Safety timeout to prevent stuck loaders (existing 5s timeout)
    const safetyTimeout = setTimeout(() => {
      if (isAnimating) {
        clearInterval(progressInterval);
        completeAnimation();
      }
    }, 5000);

    // Store interval and timeout IDs for cleanup
    return () => {
      clearInterval(progressInterval);
      clearTimeout(maxTimeout);
      clearTimeout(safetyTimeout);
    };
  };

  // Complete the progress animation
  const completeAnimation = () => {
    setWidth(100);
    setTimeout(() => {
      setIsAnimating(false);
      setWidth(0);
    }, 300);
  };

  // Track route changes for App Router
  useEffect(() => {
    completeAnimation();
  }, [pathname, searchParams]);

  // Set up event listeners for navigation
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Handle any click that might cause navigation
    const handleClick = (e: MouseEvent) => {
      // Check if clicked element is a link
      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;

      // Avoid handling external links or same-page links
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;

      // Check if modifier keys are pressed
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        link.target === "_blank"
      ) {
        // Don't start animation for new tab/window actions
        return;
      }

      // Check if the link points to the current page
      let linkPath = href;

      // Handle query parameters in the link
      if (linkPath.includes("?")) {
        linkPath = linkPath.split("?")[0];
      }

      // Handle relative paths
      if (linkPath.startsWith("./")) {
        linkPath = linkPath.substring(2);
      }

      // If it's just a relative path without leading slash, add one
      if (!linkPath.startsWith("/") && !linkPath.startsWith("http")) {
        linkPath = `/${linkPath}`;
      }

      // Compare with current pathname
      const currentPath = pathname || "/";
      if (linkPath === currentPath) {
        // Don't start animation for links to the current page
        return;
      }

      // Start animation when link is clicked
      startAnimation();
    };

    // Handle programmatic navigation event
    const handleProgrammaticNav = () => {
      startAnimation();
    };

    // Handle export completion event
    const actionComplete = () => {
      completeAnimation();
    };

    // Listen for clicks and custom events
    document.addEventListener("click", handleClick);
    document.addEventListener("startNavigation", handleProgrammaticNav);
    document.addEventListener("endNavigation", actionComplete);

    // Ensure any active loader is completed after 30 seconds max
    let maxTimeoutId: NodeJS.Timeout | null = null;

    if (isAnimating) {
      maxTimeoutId = setTimeout(() => {
        completeAnimation();
      }, 30000);
    }

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("startNavigation", handleProgrammaticNav);
      document.removeEventListener("endNavigation", actionComplete);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);
    };
  }, [isAnimating, pathname]);

  if (!isAnimating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[999] h-1 overflow-hidden">
      {/* Progress bar */}
      <div
        className="absolute top-0 left-0 h-full bg-primary transition-all ease-linear"
        style={{
          width: `${width}%`,
          transitionDuration: "100ms",
        }}
      />
    </div>
  );
}
