"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { wordsBank, loadBest, loadSettings, saveBest, saveSettings, loadTests, saveTests } from "@/lib";
import { Heatmap } from "@/components/Heatmap";
import { PromptHighlighter } from "@/components/PromptHighlighter";
import { StatsBar } from "@/components/StatsBar";
import { useSound } from "@/hooks/useSound";
import { Toolbar } from "@/components/Toolbar";

export type Mode = "freestyle" | "words";
export type Difficulty = "easy" | "medium" | "hard" | "custom";
export type Duration = 120 | 300 | 600 | 900;


function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function computeGrossWPM(chars: number, minutes: number) {
  if (minutes <= 0) return 0;
  return Math.round((chars / 5) / minutes);
}

import { Suspense } from "react";

function TestPageInner() {
  
  // States that must be defined before useEffect
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [input, setInput] = useState<string>("");
  // Modal state for timer completion
  const [showModal, setShowModal] = useState(false);
  // Inactivity modal state
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  // Inactivity timer
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Inactivity detection: pause and show modal if no typing for 10 seconds
  useEffect(() => {
    if (!running || paused) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }
    // Reset inactivity timer on input change
    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        setPaused(true);
        setRunning(false);
        setShowInactivityModal(true);
      }, 10000);
    };
    // Listen for typing events
    const handler = () => resetTimer();
    window.addEventListener("keydown", handler);
    resetTimer();
    return () => {
      window.removeEventListener("keydown", handler);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [running, paused, input, setPaused, setRunning]);
  // New states for custom test features
  const [showCustomText, setShowCustomText] = useState(true);
  const [disableBackspace, setDisableBackspace] = useState(false);
  // Blind Mode states
  const [blindMode, setBlindMode] = useState(false);
  const [referenceText, setReferenceText] = useState("");
  const q = useSearchParams();
  const initialMode = (q.get("mode") as Mode) || "words";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [duration, setDuration] = useState<Duration>(120);

  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(duration);

  const [text, setText] = useState<string>(""); // source text
  const [cursor, setCursor] = useState<number>(0);

  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);

  const [heatmap, setHeatmap] = useState<Record<string, { hits: number; misses: number }>>({});

  const [mute, setMute] = useState<boolean>(false);
  const [themeId, setThemeId] = useState<string>("slate");
  const [best, setBest] = useState<{ wpm: number; accuracy: number }>({ wpm: 0, accuracy: 0 });
  const [tests, setTests] = useState<number>(0);

  const { click, beep } = useSound(!mute);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Load settings/bests
  useEffect(() => {
    const s = loadSettings();
    setMute(!!s.mute);
    setThemeId(s.theme || "slate");
    const b = loadBest();
    if (b) setBest(b);
    const t = loadTests();
    if (typeof t === "number") setTests(t);
  }, []);

  // Save settings on changes
  useEffect(() => {
    saveSettings({ mute, theme: themeId });
  }, [mute, themeId]);

  // Apply theme accent
  useEffect(() => {
    const html = document.documentElement;
    if (["slate", "emerald", "rose"].includes(themeId)) html.classList.add("dark");
    else html.classList.remove("dark");

    const color = themeId === "emerald" ? "#34d399" : themeId === "rose" ? "#fb7185" : themeId === "zinc" ? "#3b82f6" : "#38bdf8";
    html.style.setProperty("--accent", color);
  }, [themeId]);

  // Timer
  useEffect(() => {
    if (!running || paused) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, paused]);

  useEffect(() => { setSecondsLeft(duration); }, [duration]);

  // Generate initial text
  const regenerateWords = useCallback(() => {
    const bank = difficulty === "easy" ? wordsBank.easy : difficulty === "medium" ? wordsBank.medium : wordsBank.hard;
    const words: string[] = [];
    for (let i = 0; i < 80; i++) words.push(bank[Math.floor(Math.random() * bank.length)]);
    setText(words.join(" "));
    setCursor(0);
  }, [difficulty]);


  useEffect(() => {
  if (mode === "words") regenerateWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, difficulty]);

  const minutesElapsed = useMemo(() => (duration - secondsLeft) / 60, [duration, secondsLeft]);
  const grossWPM = useMemo(() => computeGrossWPM(input.length, minutesElapsed), [input.length, minutesElapsed]);
  const accuracy = useMemo(() => {
    if (mode === "freestyle") return 100;
    const total = input.length;
    if (total === 0) return 100;
    return Math.max(0, Math.min(100, (correct / total) * 100));
  }, [mode, correct, input.length]);
  // Improved net speed calculation: Net WPM = Gross WPM - (Errors / minutes)
  const netWPM = useMemo(() => {
    if (mode === "freestyle") return grossWPM;
    if (minutesElapsed <= 0) return 0;
    const penalty = errors / minutesElapsed;
    return Math.max(0, Math.round(grossWPM - penalty));
  }, [mode, grossWPM, errors, minutesElapsed]);

  function resetAll() {
    setRunning(false); setPaused(false); setStarted(false);
    setSecondsLeft(duration);
    setInput(""); setCorrect(0); setErrors(0); setHeatmap({}); setCursor(0);
  if (mode === "words") regenerateWords();
  }
  function start() { if (secondsLeft === 0) setSecondsLeft(duration); setRunning(true); setPaused(false); setStarted(true); inputRef.current?.focus(); }
  function pause() { setPaused(true); setRunning(false); }
  function resume() { setPaused(false); setRunning(true); inputRef.current?.focus(); }

  function finish() {
    setRunning(false); setPaused(false); setStarted(false);
    setShowModal(true);
    const finalWpm = mode === "freestyle" ? grossWPM : netWPM;
    const finalAcc = Math.round(accuracy);
    const prev = loadBest();
    const next = { wpm: Math.max(prev?.wpm || 0, finalWpm), accuracy: Math.max(prev?.accuracy || 0, finalAcc) };
    saveBest(next); setBest(next);
    const t = loadTests() || 0; saveTests(t + 1); setTests(t + 1);
  }

  // shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "r") { e.preventDefault(); resetAll(); }
      if (!started && e.key === " ") start();
      if (e.code === "Escape") pause();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, duration, secondsLeft]);

  const mapKey = (ch: string | undefined) => {
    if (!ch) return null;
    if (ch === " ") return "Space";
    if (ch === "\n") return "Enter";
    if (/[a-z]/.test(ch)) return ch as string;
    const dict: Record<string, string> = {"`":"`","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","0":"0","-":"-","=":"=","[":"[","]":"]","\\":"\\",";":";","'":"'",",":",",".":".","/":"/"};
    return dict[ch] ?? null;
  };
// Track if the current word already has an error
const wordErrorRef = useRef(false);

const onChange = (val: string, e?: React.ChangeEvent<HTMLTextAreaElement>) => {
  if (!started && val.length > 0) start();

  // Reset inactivity timer
  if (inactivityTimerRef.current) {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setPaused(true);
      setRunning(false);
      setShowInactivityModal(true);
    }, 10000);
  }

  if (!running && secondsLeft === 0) return;

  // Disable backspace if option is enabled
  if (disableBackspace && e && "inputType" in e.nativeEvent) {
    if ((e.nativeEvent as InputEvent).inputType === "deleteContentBackward") return;
  }

  const lastChar = val.slice(-1);
  if (!mute && lastChar && lastChar !== "\n") click();

  // update heatmap skeleton
  setHeatmap((hm) => {
    const key = mapKey(lastChar);
    if (!key) return hm;
    const next = { ...hm };
    if (!next[key]) next[key] = { hits: 0, misses: 0 };
    return next;
  });

  // --- FREESTYLE MODE ---
  if (mode === "freestyle") {
    setInput(val);
    setCorrect(val.trim().split(/\s+/).filter(Boolean).length);
    setErrors(0);
    return;
  }

  // --- WORDS MODE with word-based error tracking ---
  const prevLen = input.length;

  // Backspace case
  if (val.length < prevLen) {
    setInput(val);
    setCursor((c) => Math.max(0, c - 1));
    return;
  }

  const expected = text[cursor] ?? "";
  const typed = lastChar;
  const isSpaceOrEnter = typed === " " || typed === "\n";

  if (isSpaceOrEnter) {
    // Word finished -> evaluate once
    if (wordErrorRef.current) {
      setErrors((e) => e + 1); // one wrong word
    } else {
      setCorrect((c) => c + 1); // one correct word
    }
    wordErrorRef.current = false; // reset for next word
    setCursor((c) => c + 1); // move past space
  } else {
    // Inside the word
    const isCorrectChar = typed === expected;
    if (!isCorrectChar) {
      wordErrorRef.current = true; // mark this word wrong
      if (!mute) beep();
    }
    setCursor((c) => c + 1);

    // update heatmap hits/misses
    setHeatmap((hm) => {
      const key = mapKey(typed);
      if (!key) return hm;
      const next = { ...hm };
      if (!next[key]) next[key] = { hits: 0, misses: 0 };
      if (isCorrectChar) next[key].hits += 1;
      else next[key].misses += 1;
      return next;
    });
  }

  // Generate more words if near the end
  if (mode === "words" && cursor + 1 >= text.length - 10) {
    const bank = difficulty === "easy" ? wordsBank.easy : difficulty === "medium" ? wordsBank.medium : wordsBank.hard;
    const more: string[] = [];
    for (let i = 0; i < 40; i++) more.push(bank[Math.floor(Math.random() * bank.length)]);
    setText((t) => t + " " + more.join(" "));
  }

  setInput(val);
};

  // const onChange = (val: string, e?: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   if (!started && val.length > 0) start();
  //   // Reset inactivity timer on input change
  //   if (inactivityTimerRef.current) {
  //     clearTimeout(inactivityTimerRef.current);
  //     inactivityTimerRef.current = setTimeout(() => {
  //       setPaused(true);
  //       setRunning(false);
  //       setShowInactivityModal(true);
  //     }, 5000);
  //   }
  //   if (!running && secondsLeft === 0) return;

  //   // Disable backspace if option is enabled
  //   if (disableBackspace && e && 'inputType' in e.nativeEvent) {
  //     // For browsers supporting InputEvent.inputType
  //     if ((e.nativeEvent as InputEvent).inputType === "deleteContentBackward") return;
  //   }

  //   const lastChar = val.slice(-1);
  //   if (!mute && lastChar && lastChar !== "\n") click();

  //   // update heatmap skeleton
  //   setHeatmap((hm) => {
  //     const key = mapKey(lastChar);
  //     if (!key) return hm;
  //     const next = { ...hm };
  //     if (!next[key]) next[key] = { hits: 0, misses: 0 };
  //     return next;
  //   });

  //   if (mode === "freestyle") { setInput(val); setCorrect(val.length); setErrors(0); return; }

  //   // ...existing code for words mode...
  //   const prevLen = input.length;
  //   if (val.length < prevLen) { setInput(val); setCursor((c) => Math.max(0, c - 1)); return; }

  //   const expected = text[cursor] ?? "";
  //   const typed = lastChar;
  //   const isCorrect = typed === expected;

  //   setInput(val); setCursor((c) => c + 1);
  //   setCorrect((c) => c + (isCorrect ? 1 : 0));
  //   setErrors((e) => e + (isCorrect ? 0 : 1));

  //   setHeatmap((hm) => {
  //     const key = mapKey(typed);
  //     if (!key) return hm;
  //     const next = { ...hm };
  //     if (!next[key]) next[key] = { hits: 0, misses: 0 };
  //     if (isCorrect) next[key].hits += 1; else next[key].misses += 1;
  //     return next;
  //   });

  //   if (!isCorrect && !mute) beep();

  //   if (mode === "words" && cursor + 1 >= text.length - 10) {
  //     const bank = difficulty === "easy" ? wordsBank.easy : difficulty === "medium" ? wordsBank.medium : wordsBank.hard;
  //     const more: string[] = []; for (let i = 0; i < 40; i++) more.push(bank[Math.floor(Math.random() * bank.length)]);
  //     setText((t) => t + " " + more.join(" "));
  //   }
  // };

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Global theme toggle button */}
      <button
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow hover:bg-slate-300 dark:hover:bg-slate-700"
        onClick={() => setThemeId(themeId === "slate" ? "zinc" : "slate")}
        aria-label="Toggle theme"
      >
        {themeId === "slate" ? "🌙 Dark" : "☀️ Light"}
      </button>
      {/* Inactivity modal */}
      {showInactivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 max-w-md w-full border border-slate-300 dark:border-slate-700 text-center">
            <h2 className="text-xl font-bold mb-2">Paused due to inactivity</h2>
            <div className="mb-4">You stopped typing for 10 seconds.</div>
            <button className="mt-4 px-4 py-2 rounded bg-sky-500 text-white font-semibold hover:bg-sky-600" onClick={() => { setShowInactivityModal(false); resume(); }}>Continue</button>
            <button className="mt-2 px-4 py-2 rounded bg-gray-300 text-slate-800 font-semibold hover:bg-gray-400" onClick={() => { setShowInactivityModal(false); resetAll(); }}>Restart</button>
          </div>
        </div>
      )}
      {/* Timer completion modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 max-w-md w-full border border-slate-300 dark:border-slate-700 text-center">
            <h2 className="text-xl font-bold mb-2">Time&apos;s Up!</h2>
            <div className="mb-4">Your test has finished.</div>
            <div className="mb-2">Gross WPM: <b>{grossWPM}</b></div>
            <div className="mb-2">Net WPM: <b>{mode === "freestyle" ? grossWPM : netWPM}</b></div>
            <div className="mb-2">Accuracy: <b>{mode === "freestyle" ? "-" : Math.round(accuracy)}%</b></div>
            <button className="mt-6 px-4 py-2 rounded bg-sky-500 text-white font-semibold hover:bg-sky-600" onClick={() => { setShowModal(false); resetAll(); }}>Restart Test</button>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Toolbar
          mode={mode}
          setMode={(m) => { setMode(m); resetAll(); }}
          difficulty={difficulty}
          setDifficulty={(d) => { setDifficulty(d); resetAll(); }}
          duration={duration}
          setDuration={(d) => { setDuration(d); resetAll(); }}
          mute={mute}
          setMute={setMute}
          themeId={themeId}
          setThemeId={setThemeId}
          running={running}
          paused={paused}
          start={start}
          pause={pause}
          resume={resume}
          resetAll={resetAll}
        />

        <StatsBar
          timeLeft={formatTime(secondsLeft)}
          grossWPM={grossWPM}
          netWPM={mode === "freestyle" ? grossWPM : netWPM}
          chars={input.length}
          accuracy={mode === "freestyle" ? undefined : Math.round(accuracy)}
          bestWPM={best.wpm}
          bestAcc={best.accuracy}
          tests={tests}
        />
        {/* Show speed/accuracy for Blind Mode after test ends */}
        {blindMode && !running && started && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-slate-800 rounded-xl border border-yellow-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
            <h4 className="font-semibold mb-2">Blind Mode Results</h4>
            <div>Speed: {computeGrossWPM(input.length, duration / 60)} WPM</div>
            <div>Accuracy: {referenceText ? Math.round((input.length > 0 ? (input.split('').filter((ch, i) => ch === referenceText[i]).length / Math.max(referenceText.length, input.length)) * 100 : 0)) : "N/A"}%</div>
            <div className="mt-2 text-xs text-slate-500">Compared to your pasted reference text.</div>
          </div>
        )}

        {difficulty === "custom" && mode !== "freestyle" && (
          <section className="mt-6">
            <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2">Paste reference text (from printed paper) or upload .txt:</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={blindMode} onChange={e => setBlindMode(e.target.checked)} /> Blind Mode
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={showCustomText} onChange={e => setShowCustomText(e.target.checked)} disabled={blindMode} /> Show text
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={disableBackspace} onChange={e => setDisableBackspace(e.target.checked)} /> Disable Backspace
              </label>
            </div>
            {/* Only show textarea if not blindMode and showCustomText */}
            {!blindMode && showCustomText && (
              <textarea
                className="w-full h-28 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Paste or write your paragraph here..."
                value={referenceText}
                onChange={(e) => { setReferenceText(e.target.value); setText(e.target.value); setCursor(0); setInput(""); setCorrect(0); setErrors(0); }}
              />
            )}
            {/* Only allow file upload if not blindMode */}
            {!blindMode && (
              <input
                type="file" accept="text/plain" className="mt-2 text-sm"
                onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const t = await file.text(); setReferenceText(t); setText(t); setCursor(0); setInput(""); setCorrect(0); setErrors(0); }}
              />
            )}
          </section>
        )}

       
    
        {mode !== "freestyle" && !blindMode && (
          <section className="mt-6">
            <PromptHighlighter text={text} cursor={cursor} />
          </section>
        )}

        <section className="mt-6">
          <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2">
            {mode === "freestyle" ? "Freestyle: type anything" : mode === "words" ? "Words mode: type the stream of words" : ""}
          </label>
          <textarea
            ref={inputRef}
            className="w-full h-44 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] tracking-wide"
            placeholder={mode === "freestyle" ? "Start typing anything..." : "Start typing to match the text above..."}
            value={input}
            onChange={(e) => onChange(e.target.value, e)}
            disabled={!running && secondsLeft === 0}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Tip: <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Space</kbd> to start, <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Esc</kbd> to pause, <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">R</kbd> to reset.</span>
            <span>{running ? "Running…" : paused ? "Paused" : secondsLeft === 0 ? "Finished" : "Idle"}</span>
          </div>
        </section>

        <Heatmap data={heatmap} />

        <footer className="mt-10 text-center text-xs text-slate-500">Built with Next.js + Tailwind + TypeScript.</footer>
      </div>
    </main>
  );
}

export default function TestPage() {
  return (
    <Suspense>
      <TestPageInner />
    </Suspense>
  );
}
