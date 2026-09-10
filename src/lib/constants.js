import { Play, Music, Star, Plus, Home, Hash, Minus, Apple, Square, Palette, Medal } from "lucide-react";
import { randInt } from "@/lib/utils";
import { MatchingQ } from "@/components/game/QuestionCore";


/* ---------------------------- THEME TOKENS ------------------------------ */
export const COLORS = {
  sky: "#38BDF8",
  yellow: "#FBBF24",
  green: "#4ADE80",
  orange: "#FB923C",
  pink: "#F472B6",
  ink: "#1E293B",
  cream: "#FFFDF7",
};

export const PIE_COLORS = [
  COLORS.sky,
  COLORS.pink,
  COLORS.green,
  COLORS.orange,
  COLORS.yellow,
];


/* ------------------------------ STRINGS --------------------------------- */
export const STRINGS = {
  en: {
    title: "LEARN, PLAY & GROW HAPPILY",
    productName: "Fun With Numbers",
    productTagline: "Early Math & Number Learning (Ages 3-6)",
    start: "Start Game",
    profiles: "Student Profiles",
    progress: "Progress",
    leaderboard: "Leaderboard",
    settings: "Settings",
    resume: "Continue Last Game",
    chooseStudent: "What is your name?",
    newStudent: "New Student",
    name: "Name",
    namePlaceholder: "Type name here",
    age: "Age",
    avatar: "Avatar",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    noStudents: "No students yet — add your first explorer!",
    chooseCategory: "Choose a Category!",
    numbers: "Numbers",
    addition: "Addition",
    subtraction: "Subtraction",
    counting: "Counting Objects",
    shapes: "Shapes",
    colors: "Colors",
    chooseDifficulty: "Choose Your Level!",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    chooseTimer: "Choose Your Time!",
    learn: "LEARN",
    play: "PLAY",
    chooseMode: "Learn it, or play it?",
    letsLearn: "Let's Learn!",
    letsPlay: "Let's Play!",
    learnDesc: "Explore at your own pace",
    playDesc: "Test what you know",
    next: "Next",
    previous: "Previous",
    learnDone: "You learned it all!",
    backToMenu: "Category Menu",
    bonusTitle: "Number Twins",
    bonusSubtitle: "Memorise Activity",
    parentNote: "Parents, please make sure your kid memorises this!",
    sec30: "30 Seconds",
    min1: "1 Minute",
    unlimited: "Unlimited",
    correct: "CONGRATULATIONS!",
    tryAgain: "Try Again!",
    correctWas: "The right answer was",
    correctLabel: "Correct",
    wrongLabel: "Wrong",
    wrongIsNot: "No, it's not",
    continueBtn: "Continue",
    score: "Score",
    question: "Question",
    of: "of",
    gameOver: "Great Job, Explorer!",
    playAgain: "Play Again",
    backHome: "Back Home",
    top10: "Top 10 Explorers",
    games: "Games",
    highScore: "High Score",
    dashboard: "Progress Dashboard",
    accuracy: "Accuracy",
    avgScore: "Average Score",
    avgTime: "Average Time",
    played: "Games Played",
    music: "Music",
    sound: "Sound",
    voice: "Read Aloud",
    tapToHear: "Tap to hear again",
    language: "Language",
    darkMode: "Dark Mode",
    reset: "Reset Progress",
    resetConfirm: "This will erase all student progress. Are you sure?",
    achievementUnlocked: "Achievement Unlocked!",
    noData: "Play a few games to see charts here!",
    selectStudentFirst: "Pick a student to begin your adventure!",
  },
  ms: {
    title: "LEARN, PLAY & GROW HAPPILY",
    productName: "Fun With Numbers",
    productTagline: "Mengenal Matematik dan Nombor",
    start: "Mula Permainan",
    profiles: "Profil Pelajar",
    progress: "Kemajuan",
    leaderboard: "Papan Pendahulu",
    settings: "Tetapan",
    resume: "Sambung Permainan",
    chooseStudent: "Siapa nama awak?",
    newStudent: "Pelajar Baru",
    name: "Nama",
    namePlaceholder: "Taip nama di sini",
    age: "Umur",
    avatar: "Avatar",
    save: "Simpan",
    cancel: "Batal",
    edit: "Edit",
    delete: "Padam",
    noStudents: "Belum ada pelajar — tambah peneroka pertama anda!",
    chooseCategory: "Pilih Kategori!",
    numbers: "Nombor",
    addition: "Tambah",
    subtraction: "Tolak",
    counting: "Kira Objek",
    shapes: "Bentuk",
    colors: "Warna",
    chooseDifficulty: "Pilih Tahap Anda!",
    easy: "Mudah",
    medium: "Sederhana",
    hard: "Sukar",
    chooseTimer: "Pilih Masa Anda!",
    learn: "BELAJAR",
    play: "MAIN",
    chooseMode: "Nak belajar dulu, atau main?",
    letsLearn: "Let's Learn!",
    letsPlay: "Let's Play!",
    learnDesc: "Terokai ikut masa anda sendiri",
    playDesc: "Uji apa yang anda tahu",
    next: "Seterusnya",
    previous: "Sebelum",
    learnDone: "Anda dah belajar semuanya!",
    backToMenu: "Menu Kategori",
    bonusTitle: "Kembar Nombor",
    bonusSubtitle: "JOM HAFAL",
    parentNote: "Ibu bapa, pastikan anak anda menghafal ini!",
    sec30: "30 Saat",
    min1: "1 Minit",
    unlimited: "Tanpa Had",
    correct: "TAHNIAH!",
    tryAgain: "Cuba Lagi!",
    correctWas: "Jawapan yang betul ialah",
    correctLabel: "Betul",
    wrongLabel: "Salah",
    wrongIsNot: "Bukan, ia bukan",
    continueBtn: "Teruskan",
    score: "Markah",
    question: "Soalan",
    of: "daripada",
    gameOver: "Syabas, Peneroka!",
    playAgain: "Main Lagi",
    backHome: "Ke Menu Utama",
    top10: "10 Peneroka Teratas",
    games: "Permainan",
    highScore: "Markah Tertinggi",
    dashboard: "Papan Pemuka Kemajuan",
    accuracy: "Ketepatan",
    avgScore: "Purata Markah",
    avgTime: "Purata Masa",
    played: "Permainan Dimainkan",
    music: "Muzik",
    sound: "Bunyi",
    voice: "Baca Kuat",
    tapToHear: "Klik untuk dengar lagi",
    language: "Bahasa",
    darkMode: "Mod Gelap",
    reset: "Set Semula Kemajuan",
    resetConfirm: "Ini akan memadam semua kemajuan pelajar. Anda pasti?",
    achievementUnlocked: "Pencapaian Dibuka!",
    noData: "Main beberapa permainan untuk lihat carta!",
    selectStudentFirst: "Pilih pelajar untuk mula pengembaraan anda!",
  },
};


// Randomized praise shown/spoken for every correct PLAY answer (instead of
// a single fixed "CONGRATULATIONS!" every time).
export const PRAISE_WORDS = {
  en: [
    "Good!",
    "Great!",
    "Excellent!",
    "Bravo!",
    "Well Done!",
    "Awesome!",
    "Fantastic!",
    "Nice Job!",
    "Super!",
    "Correct!",
  ],
  ms: [
    "Bagus!",
    "Hebat!",
    "Cemerlang!",
    "Syabas!",
    "Terbaik!",
    "Bagus Sekali!",
    "Power!",
    "Comel!",
    "Betul!",
  ],
};

export function randomPraise(lang) {
  const list = PRAISE_WORDS[lang] || PRAISE_WORDS.en;
  return list[randInt(0, list.length - 1)];
}


export const AVATARS = ["🦊", "🐼", "🐵", "🦁", "🐰", "🐨", "🐯", "🦄", "🦋", "🐱"];


export const CATEGORIES = [
  { id: "numbers", labelKey: "numbers", icon: Hash, color: COLORS.sky },
  { id: "counting", labelKey: "counting", icon: Apple, color: COLORS.pink },
  { id: "addition", labelKey: "addition", icon: Plus, color: COLORS.green },
  {
    id: "subtraction",
    labelKey: "subtraction",
    icon: Minus,
    color: COLORS.orange,
  },
  { id: "colors", labelKey: "colors", icon: Palette, color: COLORS.sky },
  { id: "shapes", labelKey: "shapes", icon: Square, color: COLORS.yellow },
];

// These categories only have one simple difficulty level, so the difficulty
// screen is skipped entirely for them.
export const SINGLE_LEVEL_CATEGORIES = ["colors", "shapes"];


export const SHAPES_LIST = [
  { name: { en: "Circle", ms: "Bulatan" }, emoji: "⚪" },
  { name: { en: "Square", ms: "Segi Empat Sama" }, emoji: "🟧" },
  { name: { en: "Rectangle", ms: "Segi Empat Tepat" }, emoji: "▭" },
  { name: { en: "Oval", ms: "Bujur" }, emoji: "⬭" },
  { name: { en: "Semicircle", ms: "Separuh Bulatan" }, emoji: "◗" },
  { name: { en: "Triangle", ms: "Segi Tiga" }, emoji: "🔺" },
  { name: { en: "Star", ms: "Bintang" }, emoji: "⭐" },
  { name: { en: "Heart", ms: "Hati" }, emoji: "❤️" },
  { name: { en: "Diamond", ms: "Berlian" }, emoji: "💎" },
];

// Rectangle/Oval/Semicircle have no real colorful emoji in Unicode (only
// thin outline symbols), so they're drawn as solid colored CSS shapes
// instead — sized in "em" so they always match the surrounding emoji size.
export const CUSTOM_SHAPE_COLORS = {
  "▭": COLORS.orange,
  "⬭": COLORS.sky,
  "◗": COLORS.green,
  "💎": COLORS.pink,
  "🌸": "#F9A8D4",
};

export function ShapeGlyph({ emoji, className = "" }) {
  const color = CUSTOM_SHAPE_COLORS[emoji];
  if (!color) return emoji;
  // A true semicircle is exactly half of a circle cut through the middle:
  // width = 2 x radius, height = 1 x radius, with the curved edge radius
  // equal to that same height — not a square with one side rounded off.
  // A diamond is a square met point-to-point top and bottom — a "V" and an
  // upside-down "V" joined — which a plain square rotated 45° draws exactly.
  if (emoji === "💎") {
    // A real diamond/rhombus is taller than it is wide (like a kite or a
    // playing-card diamond ♦), not a plain square spun 45° (which would be
    // equally wide and tall) — drawn here with a 4-point polygon instead.
    return (
      <span
        className={`inline-block align-middle drop-shadow-md ${className}`}
        style={{
          width: "1.05em",
          height: "1.5em",
          backgroundColor: color,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }}
      />
    );
  }
  if (emoji === "🌸") {
    // Pink swatch drawn as a plain circle, same size/shape as the other
    // color swatches (⚪⚫🟤🟠🔴🟢🔵🟡🟣), just filled with the same pink
    // the flower emoji was.
    return (
      <span
        className={`inline-block align-middle drop-shadow-md ${className}`}
        style={{
          width: "1em",
          height: "1em",
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
    );
  }
  const shapeStyle =
    emoji === "▭"
      ? { width: "1.5em", height: "0.95em", borderRadius: "0.12em" }
      : emoji === "⬭"
        ? { width: "1.5em", height: "1em", borderRadius: "50%" }
        : { width: "2em", height: "1em", borderRadius: "1em 1em 0 0" }; // semicircle: flat base, domed top
  return (
    <span
      className={`inline-block align-middle drop-shadow-md ${className}`}
      style={{ ...shapeStyle, backgroundColor: color }}
    />
  );
}

// All colors are shown as the same flower shape, recolored via the SVG tint
// filters (see MKA_TINT_COLORS + the <defs> block in the root component) —
// this keeps every color swatch visually consistent instead of a mix of
// circles/squares/hearts (some of which don't exist as clean flat emoji).
export const COLORS_LIST = [
  { name: { en: "White", ms: "Putih" }, emoji: "⚪" },
  { name: { en: "Black", ms: "Hitam" }, emoji: "⚫" },
  { name: { en: "Brown", ms: "Coklat" }, emoji: "🟤" },
  { name: { en: "Orange", ms: "Oren" }, emoji: "🟠" },
  { name: { en: "Red", ms: "Merah" }, emoji: "🔴" },
  { name: { en: "Green", ms: "Hijau" }, emoji: "🟢" },
  { name: { en: "Blue", ms: "Biru" }, emoji: "🔵" },
  { name: { en: "Yellow", ms: "Kuning" }, emoji: "🟡" },
  { name: { en: "Purple", ms: "Ungu" }, emoji: "🟣" },
  { name: { en: "Pink", ms: "Merah Jambu" }, emoji: "🌸" },
];

// Master object list used across every game category (numbers, counting,
// addition, subtraction) — picked randomly per question.
export const OBJECT_EMOJI = [
  "⚽",
  "🎈",
  "🍭",
  "🍬",
  "✈️",
  "🚁",
  "🧸",
  "🍎",
  "🍋",
  "🍍",
  "🍓",
];

// Fixed "game color" for each object used in the "match two objects with the
// same color" game in the Colors category. Objects are recolored solid via
// an SVG filter (see MKA_TINT_COLORS + MatchingQ) rather than relying on
// each emoji's own (inconsistent, device-dependent) colors, so any object
// can be assigned to any color group unambiguously.
export const OBJECT_COLOR_GROUPS = {
  red: ["🍎", "🍓", "🎈"],
  yellow: ["🍋", "🍍"],
  black: ["🚁", "⚽"],
  white: ["✈️", "🍬"],
  brown: ["🧸", "🍭"],
};

// Names for each object (for spoken "{color} {object}" phrases, e.g.
// "Yellow Pineapple") and the localized label for each color key above.
export const OBJECT_NAMES = {
  "⚽": { en: "Ball", ms: "Bola" },
  "🎈": { en: "Balloon", ms: "Belon" },
  "🍭": { en: "Lollipop", ms: "Lolipop" },
  "🍬": { en: "Candy", ms: "Gula-gula" },
  "✈️": { en: "Plane", ms: "Kapal Terbang" },
  "🚁": { en: "Helicopter", ms: "Helikopter" },
  "🧸": { en: "Teddy Bear", ms: "Beruang Teddy" },
  "🍎": { en: "Apple", ms: "Epal" },
  "🍋": { en: "Lemon", ms: "Limau" },
  "🍍": { en: "Pineapple", ms: "Nanas" },
  "🍓": { en: "Strawberry", ms: "Strawberi" },
};

export const COLOR_KEY_LABEL = {
  red: { en: "Red", ms: "Merah" },
  yellow: { en: "Yellow", ms: "Kuning" },
  black: { en: "Black", ms: "Hitam" },
  white: { en: "White", ms: "Putih" },
  brown: { en: "Brown", ms: "Coklat" },
};

// RGB (0-1 normalized) target color for each key's SVG recolor filter —
// see the <svg><defs> block rendered once in the root component.
export const MKA_TINT_COLORS = {
  red: [0.937, 0.267, 0.267],
  yellow: [0.98, 0.8, 0.082],
  black: [0.06, 0.06, 0.08],
  white: [0.95, 0.95, 0.96],
  brown: [0.545, 0.353, 0.169],
};

// Builds the spoken phrase for an object-color match item, e.g. "Yellow Banana".
export function objectColorPhrase(emoji, colorKey, lang) {
  const colorLabel = COLOR_KEY_LABEL[colorKey]
    ? COLOR_KEY_LABEL[colorKey][lang]
    : "";
  const objName = OBJECT_NAMES[emoji] ? OBJECT_NAMES[emoji][lang] : "";
  return `${colorLabel} ${objName}`.trim();
}


export const ACHIEVEMENTS = [
  {
    threshold: 100,
    key: "sticker",
    icon: "⭐",
    label: { en: "Sticker Unlocked", ms: "Pelekat Dibuka" },
  },
  {
    threshold: 200,
    key: "character",
    icon: "🎭",
    label: { en: "Character Unlocked", ms: "Watak Dibuka" },
  },
  {
    threshold: 300,
    key: "bronze",
    icon: "🥉",
    label: { en: "Bronze Medal", ms: "Pingat Gangsa" },
  },
  {
    threshold: 500,
    key: "silver",
    icon: "🥈",
    label: { en: "Silver Medal", ms: "Pingat Perak" },
  },
  {
    threshold: 700,
    key: "gold",
    icon: "🥇",
    label: { en: "Gold Medal", ms: "Pingat Emas" },
  },
  {
    threshold: 1000,
    key: "champion",
    icon: "👑",
    label: { en: "Math Champion", ms: "Juara Matematik" },
  },
];