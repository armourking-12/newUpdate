"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, LayoutDashboard, UploadCloud } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, ROUTES } from "@/lib/constants";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { UserButton, SignInButton } from "@clerk/nextjs";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isClerkLoaded } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center md:flex divide-x border-x border-border">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-colors",
                    isActive
                      ? "bg-foreground text-background font-bold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href={ROUTES.resources}
              className="hidden p-2 text-foreground border border-border transition-colors hover:bg-foreground hover:text-background sm:flex"
              aria-label="Search resources"
            >
              <Search className="h-4 w-4" />
            </Link>

            <ThemeToggle />

            {isClerkLoaded && (
              <div className="flex items-center gap-2">
                <Link
                  href={ROUTES.upload}
                  className="hidden items-center gap-1.5 border-2 border-foreground bg-background px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold text-foreground transition-colors hover:bg-foreground hover:text-background sm:flex"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Upload
                </Link>

                {user ? (
                  <div className="hidden items-center gap-2 sm:flex">
                    <Link
                      href={ROUTES.dashboard}
                      className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold text-foreground transition-colors hover:bg-foreground hover:text-background"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Dashboard
                    </Link>
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "h-8 w-8 rounded-none border border-foreground" } }} />
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button className="hidden border-2 border-foreground bg-foreground px-4 py-1.5 text-xs font-mono uppercase tracking-wider font-bold text-background transition-colors hover:bg-background hover:text-foreground sm:inline-flex">
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex border-2 border-foreground p-1.5 text-foreground transition-colors hover:bg-foreground hover:text-background md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && <MobileNav onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
