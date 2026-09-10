import { speak } from "@/lib/audio";


/* ------------------------------ QUESTION GEN ----------------------------- */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function uniqueChoices(correct, min, max, count) {
  const set = new Set([correct]);
  while (set.size < count) {
    const n = randInt(min, max);
    if (n >= 0) set.add(n);
  }
  return shuffle([...set]);
}


// Numeric ranges are tuned per-category for pre-readers (ages 3-6):
// numbers: easy 1-5, medium 6-10, hard 1-10 (kept within one-digit words).
// counting: easy 1-5, medium 5-10, hard 1-12 (kept exactly as requested).
export function numRangeForDifficulty(category, difficulty) {
  if (category === "counting") {
    if (difficulty === "easy") return [1, 5];
    if (difficulty === "medium") return [5, 10];
    return [11, 20];
  }
  if (category === "numbers") {
    if (difficulty === "easy") return [1, 5];
    if (difficulty === "medium") return [6, 10];
    return [1, 10];
  }
  if (difficulty === "easy") return [1, 5];
  if (difficulty === "medium") return [6, 10];
  return [1, 12];
}


// Subtraction has its own per-level ranges (not a single lo/hi span), since
// Hard uses different caps for the two numbers: easy/medium keep both
// numbers under the same cap (5 / 10), hard allows a bigger first number
// (up to 15) minus a smaller second number (up to 9).
export function subtractionRanges(difficulty) {
  if (difficulty === "easy") return { aMax: 5, bMax: 5 };
  if (difficulty === "medium") return { aMax: 10, bMax: 10 };
  return { aMax: 15, bMax: 9 }; // hard
}


// Addition uses its own per-number ranges per level (not a single lo/hi span):
// easy: both numbers 1-5. medium: first number 6-10, second number 1-3.
// hard: first number 1-10, second number 1-3.
export function additionRanges(difficulty) {
  if (difficulty === "easy") return { aLo: 1, aHi: 5, bLo: 1, bHi: 5 };
  if (difficulty === "medium") return { aLo: 6, aHi: 10, bLo: 1, bHi: 3 };
  return { aLo: 1, aHi: 10, bLo: 1, bHi: 3 };
}


export const NUMBER_WORDS = {
  en: [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty",
  ],
  ms: [
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "lapan",
    "sembilan",
    "sepuluh",
    "sebelas",
    "dua belas",
    "tiga belas",
    "empat belas",
    "lima belas",
    "enam belas",
    "tujuh belas",
    "lapan belas",
    "sembilan belas",
    "dua puluh",
  ],
};

// Wider lookup (used by wordFor below) covering everything Numbers Learn
// needs: every number 1-20, plus the exact tens up to 100.
export const NUMBER_WORDS_EXT = {
  en: {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    10: "ten",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
    15: "fifteen",
    16: "sixteen",
    17: "seventeen",
    18: "eighteen",
    19: "nineteen",
    20: "twenty",
    30: "thirty",
    40: "forty",
    50: "fifty",
    60: "sixty",
    70: "seventy",
    80: "eighty",
    90: "ninety",
    100: "one hundred",
  },
  ms: {
    1: "satu",
    2: "dua",
    3: "tiga",
    4: "empat",
    5: "lima",
    6: "enam",
    7: "tujuh",
    8: "lapan",
    9: "sembilan",
    10: "sepuluh",
    11: "sebelas",
    12: "dua belas",
    13: "tiga belas",
    14: "empat belas",
    15: "lima belas",
    16: "enam belas",
    17: "tujuh belas",
    18: "lapan belas",
    19: "sembilan belas",
    20: "dua puluh",
    30: "tiga puluh",
    40: "empat puluh",
    50: "lima puluh",
    60: "enam puluh",
    70: "tujuh puluh",
    80: "lapan puluh",
    90: "sembilan puluh",
    100: "seratus",
  },
};

export function wordFor(num, lang) {
  if (num === 0) return lang === "ms" ? "SIFAR" : "ZERO";
  const dict = NUMBER_WORDS_EXT[lang] || NUMBER_WORDS_EXT.en;
  return (dict[num] || String(num)).toUpperCase();
}

// Text to speak for an answer value: numeric values are spoken as proper
// number words in the current language (e.g. "LIMA" for BM, not the raw
// digit "5" — relying on the device's TTS engine to "translate" a bare
// digit isn't reliable, especially when no Malay voice is installed).
// Values that are already words (e.g. shape/color names) pass through as-is.
export function numberSpeech(value, lang) {
  const n = Number(value);
  return isNaN(n) ? String(value) : wordFor(n, lang);
}

// For the "Number Twins" doubles facts, 6 and 10 are spoken as plain digits
// instead of spelled-out words (their spelled pronunciation came out wrong
// for this activity) — every other number keeps the spelled word.
export function doublesWord(n, lang) {
  return n === 6 || n === 10 ? String(n) : wordFor(n, lang);
}


// Arranges a cluster of objects into one centered row (counts under 5), or
// two balanced rows for 5+ (top row gets the extra one when the count is
// odd) — keeps object groups readable instead of one long wrapping line.
export function splitBalancedRows(count) {
  if (count < 5) return [count, 0];
  const top = Math.ceil(count / 2);
  return [top, count - top];
}