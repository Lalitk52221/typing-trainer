"use client";

import Link from "next/link";

export default function Page() {
  return (
  <main className="min-h-screen bg-gray-50 dark:bg-blue-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <header>
          <h1 className="text-4xl font-bold tracking-tight">Typing Trainer <span className="text-sky-400">Pro</span></h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Practice in <b>Words</b>, or <b>Freestyle</b> mode. Choose difficulty, set a timer (2/5/10/15 min),
            toggle <b>sound feedback</b>, switch <b>themes</b>, and review a <b>per-key heatmap</b> after each session. Your best scores
            and preferences are saved locally.
          </p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
            <Card
              title="Words Mode"
              body="Type a rolling stream of words (Easy/Medium/Hard). Great for rhythm and speed."
              href="/test?mode=words"
            />
            <Card
              title="Freestyle"
              body="Type anything you want. Perfect for eyes-off drills and raw speed."
              href="/test?mode=freestyle"
            />
          <ul className="mt-3 list-disc pl-6 text-slate-300 space-y-1">
            <li>Clean UI with live stats, pause/resume, and reset shortcuts.</li>
            <li>Sound feedback: key click + error beep with a mute toggle.</li>
            <li>Difficulty presets (Easy/Medium/Hard) and <b>Custom text upload</b>.</li>
            <li>Per-key heatmap shows which keys need more practice.</li>
            <li>Theme switcher with accent colors and LocalStorage persistence.</li>
          </ul>
        </section>

        <footer className="mt-14 text-xs text-slate-500">Built with Next.js + Tailwind + TypeScript. Happy typing! ⌨️</footer>
      </div>
    </main>
  );
}

function Card({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:bg-slate-800 transition shadow-sm"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-slate-400 mt-1">{body}</p>
      <div className="mt-4 text-sky-400 group-hover:translate-x-1 transition">Start →</div>
    </Link>
  );
}