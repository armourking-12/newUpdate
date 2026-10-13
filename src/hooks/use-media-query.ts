"use client";

import { useState, useEffect } from "react";

/**
 * Hook for responsive breakpoint detection
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/** Convenience breakpoint hooks */
export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)");
}

export function useIsTablet(): boolean {
  const isMin768 = useMediaQuery("(min-width: 768px)");
  const isMin1024 = useMediaQuery("(min-width: 1024px)");
  return isMin768 && !isMin1024;
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
