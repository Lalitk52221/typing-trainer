export function loadSettings(): { mute?: boolean; theme?: string } {
  try { const s = localStorage.getItem("tt_settings"); return s ? JSON.parse(s) : {}; } catch { return {}; }
}
export function saveSettings(v: { mute?: boolean; theme?: string }) {
  try { localStorage.setItem("tt_settings", JSON.stringify(v)); } catch {}
}
export function loadBest(): { wpm: number; accuracy: number } | null {
  try { const s = localStorage.getItem("tt_best"); return s ? JSON.parse(s) : null; } catch { return null; }
}
export function saveBest(v: { wpm: number; accuracy: number }) {
  try { localStorage.setItem("tt_best", JSON.stringify(v)); } catch {}
}
export function loadTests(): number | null {
  try { const s = localStorage.getItem("tt_tests"); return s ? Number(s) : 0; } catch { return 0; }
}
export function saveTests(v: number) {
  try { localStorage.setItem("tt_tests", String(v)); } catch {}
}


export const wordsBank = {
  easy: (
    "time this is a test of basic words that are common and simple like the and to in for on with you as at it be by do go if me my no or so up we can was are from fast slow happy good big small near far short long early late bring take make keep help kind love open close jump walk run eat read write blue red green day night sun rain wind cloud water fire earth air mind hand face work home school city road train phone laptop mouse paper book chair table garden river mountain music movie dance smile peace calm focus rhythm accuracy"
  ).split(/\s+/),
  medium: (
    "practice rhythm accuracy consistent muscle memory relaxed posture breathing confidence monitor keyboard finger placement software hardware browser window editor syntax feature upgrade storage history session profile command control instant random generate display highlight cursor manager timeline duration penalty leaderboard progress analytics typography contrast palette feedback latency network offline cache resilience debounce throttle virtualization algorithm interface modular architecture component abstraction refactor maintainability cohesion coupling"
  ).split(/\s+/),
  hard: (
    "synchronize juxtaposition quintessentially hypertext virtualization cryptography asynchronous throughput serialization deserialization idempotent circumstantial unobtrusive configurability interoperability biometric telemetries kaleidoscopic labyrinthine zeitgeist grandiloquent perspicacious incontrovertible oscillation concatenation transfiguration epistemology phenomenology hermeneutics metastability orthogonality commutativity distributivity polymorphism encapsulation memoization backpropagation autoregressive stochasticity thermodynamics microarchitecture parallelization vectorization reproducibility reproducibility determinism nonlinearity"
  ).split(/\s+/),
};


export const passages = {
  easy: [
    "Practice makes progress. Keep a steady rhythm and aim for accuracy before speed.",
    "Use all ten fingers and keep your wrists relaxed. Look forward, not down at the keys.",
    "Small daily sessions add up. Breathe, stay calm, and let your hands learn the path.",
    "Typing gently reduces strain. Press the keys lightly and keep your shoulders loose.",
    "Accuracy first, then speed. Slow is smooth and smooth becomes fast over time.",
    "Glance at the screen softly. Trust your fingers to find their way across the board.",
    "Sit tall, plant your feet, and align your wrists with the edge of the desk.",
    "Reset when you tense up. A few deep breaths will restore rhythm and focus.",
  ],
  medium: [
    "Consistency beats intensity. Short daily sessions compound into lasting results.",
    "Track your progress weekly and celebrate small improvements in accuracy and comfort.",
    "Error patterns reveal weak links. Strengthen them with deliberate slow repetitions.",
    "Develop a relaxed gaze that monitors text without fixating on each character.",
    "Minimize unnecessary motion by anchoring your palms and moving from the knuckles.",
    "Alternate practice modes to balance speed, accuracy, and endurance training.",
    "When fatigue rises, pause briefly; quality practice outperforms grinding fatigue.",
    "Your goal is reliable fluency, where speed emerges naturally from correctness.",
  ],
  hard: [
    "Typing proficiency emerges from deliberate practice: sustained attention, controlled breathing, and frictionless keystrokes.",
    "Cultivate proprioceptive precision so motor sequences stabilize even as tempo increases.",
    "Optimize ergonomics by configuring chair height, monitor distance, and wrist neutrality.",
    "Strategically interleave drills targeting trigrams that historically elicit hesitation.",
    "Let tempo accrete gradually; premature acceleration amplifies compounding error rates.",
    "Favor error correction techniques that minimize context loss and preserve cadence.",
    "Exploit spaced repetition to reinforce rarely used symbols and diacritics.",
    "Instrument your sessions to surface latency spikes and biomechanical inefficiencies.",
  ],
};


