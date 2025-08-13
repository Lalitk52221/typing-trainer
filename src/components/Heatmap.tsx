"use client";

export function Heatmap({ data }: { data: Record<string, { hits: number; misses: number }> }) {
  const rows = [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
    ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
    ["Space"],
  ];

  const color = (key: string) => {
    const s = data[key];
    const total = (s?.hits ?? 0) + (s?.misses ?? 0);
    if (!total) return "bg-gray-200 dark:bg-slate-800";
    const acc = (s.hits / total) * 100;
    if (acc > 95) return "bg-emerald-500/30 border-emerald-400/50";
    if (acc > 85) return "bg-yellow-500/30 border-yellow-400/50";
    return "bg-rose-500/30 border-rose-400/50";
  };

  return (
    <div className="mt-8">
      <h3 className="text-sm text-slate-500 dark:text-slate-400 mb-2">Per-key accuracy</h3>
      <div className="inline-block rounded-2xl p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-center gap-2 mb-2 last:mb-0">
            {row.map((k, j) => (
              <div key={i + '-' + k + '-' + j} className={`text-xs md:text-sm px-3 py-2 rounded-lg border ${color(k)} select-none`} title={`${k} — hits: ${data[k]?.hits ?? 0}, misses: ${data[k]?.misses ?? 0}`}>
                {k === "Space" ? "⎵ Space" : k}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}