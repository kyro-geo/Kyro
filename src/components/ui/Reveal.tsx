"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Staggered entrance for dashboard sections. Starts visible-ish (opacity .001 avoided) and settles fast. */
export function Reveal({ children, i = 0, className }: { children: ReactNode; i?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
