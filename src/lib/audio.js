import { Play, Star } from "lucide-react";


/* ------------------------------ AUDIO ------------------------------------ */
// Lightweight synthesized sound effects/ambient music via WebAudio (no asset files needed).
export let audioCtx = null;

export function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}

export function beep(freq = 440, duration = 0.12, type = "sine", volume = 0.18) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

// A softer, richer tone for background music: the fundamental plus a quiet
// octave-up harmonic (a simple stand-in for a real piano's overtones),
// each with its own gentle decay — closer to a piano than a single pure
// oscillator tone.
export function pianoNote(freq, duration = 0.5, volume = 0.05) {
  const ctx = getCtx();
  if (!ctx) return;
  [
    [freq, 1],
    [freq * 2, 0.22],
  ].forEach(([f, mix]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = f;
    gain.gain.value = volume * mix;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  });
}

export const SFX = {
  click: () => beep(520, 0.06, "square", 0.08),
  correct: () => {
    beep(660, 0.1, "sine", 0.15);
    setTimeout(() => beep(880, 0.15, "sine", 0.15), 90);
  },
  wrong: () => beep(180, 0.25, "sawtooth", 0.12),
  achievement: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => beep(f, 0.15, "sine", 0.15), i * 100),
    );
  },
  finish: () => {
    [660, 784, 988].forEach((f, i) =>
      setTimeout(() => beep(f, 0.2, "sine", 0.15), i * 140),
    );
  },
  // A cheerful little closing fanfare for finishing a Learn session.
  learnComplete: () => {
    [523, 659, 784, 880, 1047].forEach((f, i) =>
      setTimeout(() => beep(f, 0.2, "triangle", 0.16), i * 150),
    );
    setTimeout(() => {
      beep(1047, 0.35, "sine", 0.14);
      beep(784, 0.35, "sine", 0.08);
    }, 800);
  },
};


// Two soft, slow, relaxing background loops — no percussion, no plucky
// synths, just gentle sine/triangle tones with generous spacing, so they
// never compete with the voice narration or pull a child's focus away from
// the activity. One for Learn, one (very slightly different) for Play.
// "Twinkle, Twinkle, Little Star" — a public-domain traditional melody
// (from the 18th-century French tune "Ah! vous dirai-je, Maman"), played
// on a soft piano-like tone (see pianoNote) at a slow, unhurried tempo so
// it never competes with the voice narration. Used for both Learn and Play.
export const TWINKLE_MELODY = [
  { f: 523, d: 650, type: "triangle", vol: 0.035 },
  { f: 523, d: 650, type: "triangle", vol: 0.035 },
  { f: 784, d: 650, type: "triangle", vol: 0.035 },
  { f: 784, d: 650, type: "triangle", vol: 0.035 },
  { f: 880, d: 650, type: "triangle", vol: 0.035 },
  { f: 880, d: 650, type: "triangle", vol: 0.035 },
  { f: 784, d: 1150, type: "triangle", vol: 0.035 },
  { f: 698, d: 650, type: "triangle", vol: 0.035 },
  { f: 698, d: 650, type: "triangle", vol: 0.035 },
  { f: 659, d: 650, type: "triangle", vol: 0.035 },
  { f: 659, d: 650, type: "triangle", vol: 0.035 },
  { f: 587, d: 650, type: "triangle", vol: 0.035 },
  { f: 587, d: 650, type: "triangle", vol: 0.035 },
  { f: 523, d: 1150, type: "triangle", vol: 0.035 },
  { f: 784, d: 650, type: "triangle", vol: 0.035 },
  { f: 784, d: 650, type: "triangle", vol: 0.035 },
  { f: 698, d: 650, type: "triangle", vol: 0.035 },
  { f: 698, d: 650, type: "triangle", vol: 0.035 },
  { f: 659, d: 650, type: "triangle", vol: 0.035 },
  { f: 659, d: 650, type: "triangle", vol: 0.035 },
  { f: 587, d: 1150, type: "triangle", vol: 0.035 },
  { f: 784, d: 650, type: "triangle", vol: 0.035 },
  { f: 784, d: 650, type: "triangle", vol: 0.035 },
  { f: 698, d: 650, type: "triangle", vol: 0.035 },
  { f: 698, d: 650, type: "triangle", vol: 0.035 },
  { f: 659, d: 650, type: "triangle", vol: 0.035 },
  { f: 659, d: 650, type: "triangle", vol: 0.035 },
  { f: 587, d: 1150, type: "triangle", vol: 0.035 },
  { f: 523, d: 650, type: "triangle", vol: 0.035 },
  { f: 523, d: 650, type: "triangle", vol: 0.035 },
  { f: 784, d: 650, type: "triangle", vol: 0.035 },
  { f: 784, d: 650, type: "triangle", vol: 0.035 },
  { f: 880, d: 650, type: "triangle", vol: 0.035 },
  { f: 880, d: 650, type: "triangle", vol: 0.035 },
  { f: 784, d: 1150, type: "triangle", vol: 0.035 },
  { f: 698, d: 650, type: "triangle", vol: 0.035 },
  { f: 698, d: 650, type: "triangle", vol: 0.035 },
  { f: 659, d: 650, type: "triangle", vol: 0.035 },
  { f: 659, d: 650, type: "triangle", vol: 0.035 },
  { f: 587, d: 650, type: "triangle", vol: 0.035 },
  { f: 587, d: 650, type: "triangle", vol: 0.035 },
  { f: 523, d: 1350, type: "triangle", vol: 0.035 },
];


// Loops one of the note patterns above via a self-recursing setTimeout
// chain (each note can have its own oscillator type/volume/duration).
// Returns a cleanup function to stop the loop.
export function loopPattern(pattern) {
  let cancelled = false;
  let i = 0;
  const playNext = () => {
    if (cancelled) return;
    const note = pattern[i % pattern.length];
    pianoNote(note.f, (note.d / 1000) * 0.9, note.vol || 0.05);
    i++;
    if (!cancelled) setTimeout(playNext, note.d);
  };
  const startId = setTimeout(playNext, 0);
  return () => {
    cancelled = true;
    clearTimeout(startId);
  };
}

export let cachedVoices = [];

export let voiceEngineUnlocked = false;

export function refreshVoices() {
  try {
    cachedVoices = window.speechSynthesis
      ? window.speechSynthesis.getVoices()
      : [];
  } catch {
    cachedVoices = [];
  }
}

// Chrome/Android often drop the very first speech utterance if the engine
// hasn't been "unlocked" by a user gesture yet. Call this once on the first
// tap anywhere in the app so every narration afterwards plays reliably.
export function unlockVoiceEngine() {
  if (voiceEngineUnlocked || !window.speechSynthesis) return;
  voiceEngineUnlocked = true;
  try {
    const warm = new SpeechSynthesisUtterance(" ");
    warm.volume = 0;
    window.speechSynthesis.speak(warm);
  } catch {}
}

export function speak(text, lang = "en", rate = 0.88) {
  try {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop any previous narration before starting new
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "ms" ? "ms-MY" : "en-US";
    utter.rate = rate;
    utter.pitch = 1.15;
    const voices = cachedVoices.length
      ? cachedVoices
      : (refreshVoices(), cachedVoices);
    const match = voices.find(
      (v) =>
        v.lang &&
        v.lang.toLowerCase().startsWith(utter.lang.toLowerCase().slice(0, 2)),
    );
    if (match) utter.voice = match;
    window.speechSynthesis.speak(utter);
  } catch {}
}

// Rough estimate of how long a line will take to speak aloud (at the
// default rate), used so auto-advance timers give speech enough time to
// finish instead of getting cut off mid-sentence.
export function estimateSpeechMs(text) {
  if (!text) return 1200;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1400, words * 380 + 900);
}

// Builds the full sentence to narrate for a question: the instruction/prompt,
// plus a spoken list of the answer choices when those choices are words
// (shapes/colors) rather than numerals, since numerals are easy for
// pre-readers to recognize by sight but color/shape words are not.
export function narrateQuestion(q, lang) {
  let text = q.spoken || q.prompt || "";
  if (
    q.choices &&
    q.choices.length &&
    q.choices.some((c) => isNaN(Number(c)))
  ) {
    const conj = lang === "ms" ? "atau" : "or";
    const list =
      q.choices.length > 1
        ? `${q.choices.slice(0, -1).join(", ")} ${conj} ${q.choices[q.choices.length - 1]}`
        : String(q.choices[0]);
    text += lang === "ms" ? ` Adakah ${list}?` : ` Is it ${list}?`;
  }
  if (q.instruction) text += ` ${q.instruction}`;
  return text;
}