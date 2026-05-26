"use client";

import { motion } from "motion/react";

interface FilterChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  /** When provided, renders an animated sliding background indicator between chips */
  layoutId?: string;
}

export function FilterChip({ children, active = false, onClick, layoutId }: FilterChipProps) {
  return (
    <motion.button
      className={`filter-chip${active ? " active" : ""}`}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      layout={!!layoutId}
      transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
    >
      <span className="filter-chip-label">{children}</span>
      {active && layoutId && (
        <motion.div
          layoutId={layoutId}
          className="filter-chip-indicator"
          transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
        />
      )}
    </motion.button>
  );
}
