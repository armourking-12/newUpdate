"use client";

import { AnimatedContainer } from "./animated-container";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <AnimatedContainer
      variant="fadeUp"
      className={cn("border-b-2 border-foreground py-8 md:py-12", className)}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-3 max-w-2xl font-mono text-xs uppercase tracking-wide text-muted-foreground md:text-sm">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </AnimatedContainer>
  );
}
