"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-saffron-primary text-white font-black shadow-[0_8px_20px_-5px_rgba(252,128,25,0.4)] hover:shadow-[0_12px_24px_-5px_rgba(252,128,25,0.6)] hover:-translate-y-0.5',
      secondary: 'bg-foreground text-background font-bold hover:bg-foreground/90 shadow-lg',
      outline: 'border border-border text-foreground font-black hover:border-saffron-primary/30 hover:bg-saffron-primary/5',
      ghost: 'hover:bg-muted text-muted-foreground font-medium',
    };

    const sizes = {
      sm: 'px-4 py-2 text-[10px]',
      md: 'px-6 py-3 text-xs',
      lg: 'px-10 py-5 text-sm tracking-widest',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
