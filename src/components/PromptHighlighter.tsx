"use client";
import { useMemo } from "react";

export function PromptHighlighter({ text, cursor }: { text: string; cursor: number }) {
  const chars = useMemo(() => text.split(""), [text]);
  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 leading-8 text-lg tracking-wide">
      {chars.map((ch, i) => {
        const isPast = i < cursor;
        const isCurrent = i === cursor;
        return (
          <span key={i} className={isPast ? "bg-emerald-500/10 text-emerald-300" : isCurrent ? "bg-sky-500/20 text-sky-300 rounded px-0.5" : "text-slate-400"}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}