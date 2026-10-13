"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { UserButton, SignInButton } from "@clerk/nextjs";

interface MobileNavProps {
  onClose: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { user, isClerkLoaded } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="fixed inset-x-0 top-16 z-40 overflow-hidden border-b-2 border-foreground bg-background md:hidden"
    >
      <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 divide-y divide-border">
        <div className="flex flex-col pb-3 divide-y divide-border border-y border-border">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-3 text-xs font-mono uppercase tracking-wider transition-colors",
                  isActive
                    ? "bg-foreground text-background font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="font-mono text-[10px] tracking-widest">[ACTIVE]</span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col gap-2.5 pt-3">
          {isClerkLoaded && (
            <>
              <Link
                href={ROUTES.upload}
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 border-2 border-foreground bg-background px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Resource
              </Link>

              {user ? (
                <>
                  <Link
                    href={ROUTES.dashboard}
                    onClick={onClose}
                    className="flex w-full items-center justify-center border-2 border-foreground bg-background px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-colors hover:bg-foreground hover:text-background"
                  >
                    Dashboard
                  </Link>
                  <div className="flex w-full items-center justify-center py-2">
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "h-8 w-8 rounded-none border border-foreground" } }} />
                  </div>
                </>
              ) : (
                <SignInButton mode="modal">
                  <button
                    onClick={onClose}
                    className="flex w-full items-center justify-center border-2 border-foreground bg-foreground px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold text-background transition-colors hover:bg-background hover:text-foreground"
                  >
                    Sign In
                  </button>
                </SignInButton>
              )}
            </>
          )}
        </div>
      </nav>
    </motion.div>
  );
}
