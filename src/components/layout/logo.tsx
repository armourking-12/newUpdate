import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const sizeConfig = {
  sm: { container: "w-5 h-5", text: "text-base" },
  md: { container: "w-7 h-7", text: "text-lg" },
  lg: { container: "w-9 h-9", text: "text-xl" },
};

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const config = sizeConfig[size];

  return (
    <Link
      href={ROUTES.home}
      className={cn("group inline-flex items-center gap-2.5 transition-opacity hover:opacity-80", className)}
    >
      <div className={cn("relative flex items-center justify-center border-2 border-foreground bg-background p-1", config.container)}>
        <Image 
          src="/icons.png" 
          alt="HelpJuniors Logo" 
          fill
          sizes="(max-width: 768px) 40px, 40px"
          className="object-contain p-0.5"
          priority
        />
      </div>
      {showText && (
        <span className={cn(config.text, "font-black tracking-tight inline-flex items-center gap-1 select-none")}>
          <span className="bg-foreground text-background px-1.5 py-0.5 font-mono text-xs uppercase tracking-wider">
            Help
          </span>
          <span className="text-foreground tracking-tight font-extrabold">
            Juniors
          </span>
        </span>
      )}
    </Link>
  );
}
