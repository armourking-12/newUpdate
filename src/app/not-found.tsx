import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <span className="font-mono text-[7rem] font-black leading-none text-muted-foreground/20 md:text-[9rem]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center border-2 border-foreground bg-foreground text-background shadow-[4px_4px_0px_0px_currentColor]">
            <FileQuestion className="h-8 w-8" />
          </div>
        </div>
      </div>
      <h1 className="mt-4 text-2xl font-black uppercase tracking-tight md:text-3xl">Page Not Found</h1>
      <p className="mt-2 max-w-md font-mono text-xs uppercase tracking-wider text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s
        get you back on track.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[3px_3px_0px_0px_currentColor] transition-all hover:bg-background hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href={ROUTES.resources}
          className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-foreground shadow-[3px_3px_0px_0px_currentColor] transition-all hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          Browse Resources
        </Link>
      </div>
    </div>
  );
}
