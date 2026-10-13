"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

const containerVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -4 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.15, ease: "easeOut" } },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 4 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.15, ease: "easeOut" } },
  },
  scaleIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15, ease: "easeOut" } },
  },
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15, ease: "easeOut" } },
};

const motionComponents = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  main: motion.main,
  ul: motion.ul,
};

interface AnimatedContainerProps {
  children: React.ReactNode;
  variant?: keyof typeof containerVariants;
  delay?: number;
  className?: string;
  as?: keyof typeof motionComponents;
  viewport?: boolean;
}

export function AnimatedContainer({
  children,
  variant = "fadeUp",
  delay = 0,
  className,
  as = "div",
  viewport = true,
}: AnimatedContainerProps) {
  const Component = motionComponents[as] || motion.div;
  const variants = containerVariants[variant];

  return (
    <Component
      variants={variants}
      initial="hidden"
      {...(viewport
        ? { whileInView: "visible", viewport: { once: true, margin: "-20px" } }
        : { animate: "visible" })}
      transition={{ delay: Math.min(delay, 0.05) }}
      className={cn(className)}
    >
      {children}
    </Component>
  );
}

export function AnimatedItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={childVariants} className={cn(className)}>
      {children}
    </motion.div>
  );
}
