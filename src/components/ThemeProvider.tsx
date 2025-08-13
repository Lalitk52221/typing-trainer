"use client";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.setProperty("--accent", "#38bdf8");
  }, []);
  return <>{children}</>;
}