"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className, hover = true }: CardProps) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" } : {}}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass rounded-2xl p-6 relative overflow-hidden",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
