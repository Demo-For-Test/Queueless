"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-3 glass rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-saffron-primary" />
      ) : (
        <Moon className="w-5 h-5 text-slate-gray" />
      )}
    </button>
  );
}
