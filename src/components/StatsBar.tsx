"use client";

export function StatsBar(props: {
  timeLeft: string; grossWPM: number; netWPM: number; chars: number; accuracy?: number; bestWPM: number; bestAcc: number; tests: number;
}) {
  const { timeLeft, grossWPM, netWPM, chars, accuracy, bestWPM, bestAcc, tests } = props;
  return (
    <section className="mt-6 grid grid-cols-2 md:grid-cols-7 gap-3">
      <Stat label="Time Left" value={timeLeft} />
      <Stat label="Gross WPM" value={grossWPM} />
      <Stat label="Net WPM" value={netWPM} />
      <Stat label="Chars" value={chars} />
      <Stat label="Accuracy" value={accuracy === undefined ? "—" : `${accuracy}%`} />
      <Stat label="Best" value={`${bestWPM} WPM / ${bestAcc}%`} />
      <Stat label="Sessions" value={tests} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-inner">
      <div className="text-slate-500 dark:text-slate-400 text-xs">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
