"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center border-2 border-foreground bg-foreground text-background">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-black uppercase tracking-tight md:text-3xl">Something went wrong</h1>
      <p className="mt-2 max-w-md font-mono text-xs uppercase tracking-wider text-muted-foreground">
        An unexpected error occurred. Please try again or go back to the home page.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[3px_3px_0px_0px_currentColor] transition-all hover:bg-background hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-foreground shadow-[3px_3px_0px_0px_currentColor] transition-all hover:bg-muted"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
