"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-muted-foreground/80 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-14 w-full rounded-2xl border-none glass-input px-5 text-base text-foreground placeholder:text-muted-foreground/30 ring-1 ring-border focus:ring-2 focus:ring-saffron-primary/30 outline-none transition-all duration-300 shadow-sm",
            error ? "ring-red-500/50" : "hover:ring-muted-foreground/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
