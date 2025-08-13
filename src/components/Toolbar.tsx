"use client";

import Link from "next/link";
import type { Mode, Difficulty, Duration } from "@/app/test/page";

const THEMES = [
  { id: "slate", name: "Slate (Dark)" },
  { id: "emerald", name: "Emerald (Dark)" },
  { id: "rose", name: "Rose (Dark)" },
  { id: "zinc", name: "Zinc (Light)" },
];

export function Toolbar(props: {
  mode: Mode; setMode: (m: Mode) => void;
  difficulty: Difficulty; setDifficulty: (d: Difficulty) => void;
  duration: Duration; setDuration: (d: Duration) => void;
  mute: boolean; setMute: (b: boolean) => void;
  themeId: string; setThemeId: (id: string) => void;
  running: boolean; paused: boolean; start: () => void; pause: () => void; resume: () => void; resetAll: () => void;
}) {
  const { mode, setMode, difficulty, setDifficulty, duration, setDuration, mute, setMute, themeId, setThemeId, running, paused, start, pause, resume, resetAll } = props;

  return (
    <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-bold tracking-tight">Typing Trainer <span className="ml-1 px-2 py-0.5 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "#0b1220" }}>Pro</span></Link>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Modes: Prompted / Words / Freestyle — with themes, audio feedback, and heatmap.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" aria-label="Select mode">
          <option value="prompted">Prompted</option>
          <option value="words">Words</option>
          <option value="freestyle">Freestyle</option>
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" aria-label="Select difficulty">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="custom">Custom</option>
        </select>
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value) as Duration)} className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" aria-label="Select duration">
          <option value={120}>2 min</option>
          <option value={300}>5 min</option>
          <option value={600}>10 min</option>
          <option value={900}>15 min</option>
        </select>

        <button onClick={!running ? start : pause} className="rounded-xl" style={{ background: "var(--accent)", color: "#081018" }}>
          <span className="px-4 py-2 block font-semibold">{!running ? "Start" : "Pause"}</span>
        </button>
        {paused && (<button onClick={resume} className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-2 font-semibold">Resume</button>)}
        <button onClick={resetAll} className="rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 px-4 py-2 font-semibold" title="Ctrl+R">Reset</button>

        <label className="flex items-center gap-2 text-sm ml-2"><input type="checkbox" checked={mute} onChange={(e) => setMute(e.target.checked)} /> Mute</label>
        <select value={themeId} onChange={(e) => setThemeId(e.target.value)} className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" aria-label="Select theme">
          {THEMES.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
        </select>
      </div>
    </header>
  );
}