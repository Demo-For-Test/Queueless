"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  className?: string;
}

export const StatCard = ({ title, value, icon: Icon, color, className }: StatCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "bg-card border border-border p-3 sm:p-5 md:p-8 rounded-[24px] sm:rounded-[32px] flex items-center gap-2 sm:gap-4 md:gap-6 shadow-sm hover:shadow-xl transition-all duration-500",
        className
      )}
    >
      <div className={cn("w-10 h-10 sm:w-14 md:w-16 h-10 sm:h-14 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0", color)}>
        <Icon className="w-5 h-5 sm:w-7 md:w-8" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[7px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.05em] sm:tracking-[0.2em] truncate">{title}</p>
        <motion.h3 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm sm:text-2xl md:text-3xl font-black text-foreground mt-0.5 sm:mt-1 tabular-nums truncate"
        >
          {value}
        </motion.h3>
      </div>
    </motion.div>
  );
};
