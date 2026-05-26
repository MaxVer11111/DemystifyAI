"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface AnimatedPanelProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
}

const variants = {
  left: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
  up: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  down: { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 } },
};

export function AnimatedPanel({
  children,
  className,
  direction = "left",
}: AnimatedPanelProps) {
  const v = variants[direction];

  return (
    <motion.div
      className={className}
      initial={v.initial}
      animate={v.animate}
      exit={v.initial}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
