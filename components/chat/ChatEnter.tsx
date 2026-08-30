"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ChatEnterProps = {
  restored?: boolean;
  children: ReactNode;
  className?: string;
};

export function ChatEnter({
  restored = false,
  children,
  className,
}: ChatEnterProps) {
  return (
    <motion.div
      className={className}
      initial={restored ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
