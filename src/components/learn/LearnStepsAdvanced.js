import { useState, useEffect } from "react";
import { X, RotateCcw } from "lucide-react";
import { COLORS, ShapeGlyph } from "@/lib/constants";
import { SFX, speak } from "@/lib/audio";
import { NUMBER_WORDS, wordFor, doublesWord } from "@/lib/utils";


// Walks through "total - remove = answer" — objects get crossed out one at a
// time (auto), then the remaining amount is announced.
// Automatic demo (matches the Addition Learn flow): full sentence with the
// answer first, then the take-away objects get crossed out one at a time
// (counted aloud), then voice asks "How many left?", then every remaining
// object gets the glowing yellow circle as it's counted one at a time, and
// finally the answer is shown big at the bottom with a spoken confirmation.
// A Replay button restarts the whole demo.
export function LearnSubtractionIntro({ step, lang, voiceOn }) {
  const [crossed, setCrossed] = useState([]);
  const [countedLeft, setCountedLeft] = useState([]);
  const [askedHowMany, setAskedHowMany] = useState(false);
  const [stage, setStage] = useState(0); // 0 idle, 1 crossing, 2 asked "how many left", 3 counting remaining, 4 answer shown
  const [runId, setRunId] = useState(0);
  const words = NUMBER_WORDS[lang] || NUMBER_WORDS.en;
  const RATE = 0.68;
  const remaining = step.total - step.remove;
  const wordTotal = wordFor(step.total, lang);
  const wordRemove = wordFor(step.remove, lang);
  const wordAns = wordFor(step.answer, lang);

  useEffect(() => {
    let cancelled = false;
    const timers = [];
    setCrossed([]);
    setCountedLeft([]);
    setAskedHowMany(false);
    setStage(0);

    const fullSentence =
      lang === "ms"
        ? `${wordTotal} tolak ${wordRemove} sama dengan ${wordAns}.`
        : `${wordTotal} take away ${wordRemove} equals ${wordAns}.`;
    if (voiceOn) speak(fullSentence, lang, RATE);

    const crossStart = 2600;
    for (let i = 0; i < step.remove; i++) {
      timers.push(
        setTimeout(
          () => {
            if (cancelled) return;
            setStage(1);
            setCrossed((c) => [...c, step.total - 1 - i]);
            if (voiceOn) speak(words[i] || String(i + 1), lang, RATE);
          },
          crossStart + i * 700,
        ),
      );
    }

    const askTime = crossStart + step.remove * 700 + 700;
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setStage(2);
        setAskedHowMany(true);
        if (voiceOn)
          speak(
            lang === "ms" ? "Berapa yang tinggal?" : "How many left?",
            lang,
            RATE,
          );
      }, askTime),
    );

    const countStart = askTime + 1600;
    for (let i = 0; i < remaining; i++) {
      timers.push(
        setTimeout(
          () => {
            if (cancelled) return;
            setStage(3);
            setCountedLeft((c) => [...c, i]);
            if (voiceOn) speak(words[i] || String(i + 1), lang, RATE);
          },
          countStart + i * 700,
        ),
      );
    }

    timers.push(
      setTimeout(
        () => {
          if (cancelled) return;
          setStage(4);
          // Repeat the whole question (with the answer), not just "equals to X",
          // so the confirmation lands as a complete statement.
          if (voiceOn) speak(fullSentence, lang, RATE);
        },
        countStart + remaining * 700 + 500,
      ),
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [step, runId]);

  const replay = () => {
    SFX.click();
    setRunId((r) => r + 1);
  };

  return (
    <div className="flex flex-col items-center animate-pop">
      <p className="text-3xl md:text-4xl font-black text-black mb-6 drop-shadow-sm">
        {step.total} − {step.remove} = {step.answer}
      </p>
      <div className="flex flex-wrap gap-4 justify-center max-w-sm mb-3">
        {Array.from({ length: step.total }).map((_, i) => {
          const removed = crossed.includes(i);
          const counted = !removed && countedLeft.includes(i);
          return (
            <span
              key={i}
              className="relative inline-flex items-center justify-center"
            >
              <span
                className="inline-flex items-center justify-center rounded-full transition-all drop-shadow-md"
                style={{
                  fontSize: "3.5rem",
                  opacity: removed ? 0.3 : 1,
                  ...(counted
                    ? {
                        boxShadow: `0 0 0 6px ${COLORS.yellow}`,
                        backgroundColor: `${COLORS.yellow}55`,
                      }
                    : {}),
                }}
              >
                {step.emoji}
              </span>
              {removed && (
                <span className="absolute inset-0 flex items-center justify-center text-red-500 text-4xl font-black">
                  ✕
                </span>
              )}
            </span>
          );
        })}
      </div>
      {askedHowMany && stage < 4 && (
        <p className="text-sm font-extrabold text-slate-600 mb-3 animate-pop">
          {lang === "ms" ? "Berapa yang tinggal?" : "How many left?"}
        </p>
      )}
      {stage >= 4 && (
        <p
          className="font-black mb-3 animate-pop text-black drop-shadow-sm"
          style={{ fontSize: "clamp(3rem, 12vw, 5rem)" }}
        >
          = {step.answer}
        </p>
      )}
      <button
        onClick={replay}
        className="flex items-center gap-2 bg-white/85 rounded-full px-4 py-2 shadow text-sm font-bold text-slate-600 active:scale-95 transition-transform"
      >
        <RotateCcw className="w-4 h-4" />{" "}
        {lang === "ms" ? "Ulang semula" : "Repeat this"}
      </button>
    </div>
  );
}


// Simple flashcard for colors/shapes — big swatch/shape + big word, spoken.
export function LearnSwatchIntro({ step, lang, voiceOn }) {
  const label = step.name[lang];
  useEffect(() => {
    if (voiceOn) speak(label, lang);
  }, [step, voiceOn, lang]);
  return (
    <div className="flex items-center gap-5 animate-pop">
      <button
        onClick={() => voiceOn && speak(label, lang)}
        className="drop-shadow-md active:scale-90 transition-transform"
        style={{ fontSize: "clamp(5rem, 18vw, 9rem)" }}
      >
        <ShapeGlyph emoji={step.emoji} />
      </button>
      <button
        onClick={() => voiceOn && speak(label, lang)}
        className="text-4xl md:text-5xl font-black drop-shadow-md active:scale-90 transition-transform text-black"
      >
        {label}
      </button>
    </div>
  );
}


// BONUS "Number Twins": a plain, calm flashcard for one doubles fact
// (e.g. "5 + 5 = 10") — read aloud, replayable by tapping.
export function LearnDoublesIntro({ step, lang, voiceOn }) {
  const wordA = doublesWord(step.a, lang);
  const wordB = doublesWord(step.b, lang);
  const wordAns = doublesWord(step.answer, lang);
  const sentence =
    lang === "ms"
      ? `${wordA} tambah ${wordB} sama dengan ${wordAns}.`
      : `${wordA} plus ${wordB} equals ${wordAns}.`;
  useEffect(() => {
    if (voiceOn) speak(sentence, lang);
  }, [step, voiceOn, lang]);
  return (
    <div className="flex flex-col items-center animate-pop">
      <button
        onClick={() => voiceOn && speak(sentence, lang)}
        className="font-black text-black drop-shadow-md active:scale-90 transition-transform text-center"
        style={{ fontSize: "clamp(3rem, 11vw, 5.5rem)" }}
      >
        {step.a} + {step.b} = {step.answer}
      </button>
      <p className="text-xs font-bold text-slate-500 mt-4">
        {lang === "ms" ? "Ketuk untuk dengar lagi" : "Tap to hear again"}
      </p>
    </div>
  );
}