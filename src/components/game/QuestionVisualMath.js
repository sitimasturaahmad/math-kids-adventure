import { useState } from "react";
import { COLORS } from "@/lib/constants";
import { SFX, speak } from "@/lib/audio";
import { NUMBER_WORDS, wordFor, numberSpeech } from "@/lib/utils";
import { BigButton } from "@/components/ui/SharedUI";

export function SubtractionVisualQ({ q, onAnswer, lang, voiceOn }) {
  const [crossed, setCrossed] = useState([]);
  const [locked, setLocked] = useState(false);
  const words = NUMBER_WORDS[lang] || NUMBER_WORDS.en;

  const tapObject = (i) => {
    if (locked || crossed.includes(i) || crossed.length >= q.remove) return; // can only cross out exactly `remove` objects
    const nextCount = crossed.length + 1;
    setCrossed((prev) => [...prev, i]);
    if (voiceOn) speak(words[nextCount - 1] || String(nextCount), lang);
    else SFX.click();
  };

  const [previewed, setPreviewed] = useState(null);
  // Two-tap flow so the child hears the number before committing to it:
  // first tap on a choice previews it aloud (highlighted, not yet
  // submitted); tapping that same choice again confirms and submits it.
  const choose = (c) => {
    if (locked) return;
    if (previewed === c) {
      setLocked(true);
      onAnswer(c === q.correctAnswer, q.correctAnswer, c);
    } else {
      setPreviewed(c);
      if (voiceOn) speak(numberSpeech(c, lang), lang);
    }
  };
  return (
    <div className="w-full flex flex-col items-center animate-pop">
      <p className="text-sm font-bold text-slate-500 mb-2 text-center">
        {lang === "ms"
          ? `Klik ${q.remove} untuk buang!`
          : `Tap ${q.remove} to take away!`}
      </p>
      <div className="flex flex-wrap gap-3 justify-center max-w-sm mb-3">
        {Array.from({ length: q.total }).map((_, i) => {
          const removed = crossed.includes(i);
          return (
            <button
              key={i}
              onClick={() => tapObject(i)}
              aria-label={`item ${i + 1}`}
              className="relative inline-flex items-center justify-center active:scale-90 transition-transform"
            >
              <span
                className={`text-5xl md:text-6xl drop-shadow-md transition-opacity ${removed ? "opacity-30" : ""}`}
              >
                {q.emoji}
              </span>
              {removed && (
                <span className="absolute inset-0 flex items-center justify-center text-red-500 text-4xl font-black">
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-2xl font-black text-slate-700 mb-4 drop-shadow-sm">
        {q.prompt}
      </p>
      <p className="text-xs font-bold text-slate-500 mb-2 text-center">
        {lang === "ms"
          ? "Sentuh untuk dengar, sentuh lagi untuk pilih"
          : "Tap to hear, tap again to choose"}
      </p>
      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {q.choices.map((c, i) => (
          <BigButton
            key={i}
            color={[COLORS.sky, COLORS.pink, COLORS.green][i % 3]}
            onClick={() => choose(c)}
            className={`py-6 text-3xl drop-shadow-md flex flex-col items-center justify-center leading-tight ${previewed === c ? "ring-4 ring-yellow-300 scale-105" : ""}`}
          >
            <span>{c}</span>
            <span className="text-sm font-bold">{wordFor(c, lang)}</span>
          </BigButton>
        ))}
      </div>
    </div>
  );
}

export function AdditionVisualQ({ q, onAnswer, lang, voiceOn }) {
  const [tapped, setTapped] = useState([]);
  const [locked, setLocked] = useState(false);
  const words = NUMBER_WORDS[lang] || NUMBER_WORDS.en;

  const tapObject = (i) => {
    if (locked || tapped.includes(i)) return;
    const nextCount = tapped.length + 1;
    setTapped((prev) => [...prev, i]);
    if (voiceOn) speak(words[nextCount - 1] || String(nextCount), lang);
    else SFX.click();
  };

  const [previewed, setPreviewed] = useState(null);
  // Two-tap flow so the child hears the number before committing to it:
  // first tap on a choice previews it aloud (highlighted, not yet
  // submitted); tapping that same choice again confirms and submits it.
  const choose = (c) => {
    if (locked) return;
    if (previewed === c) {
      setLocked(true);
      onAnswer(c === q.correctAnswer, q.correctAnswer, c);
    } else {
      setPreviewed(c);
      if (voiceOn) speak(numberSpeech(c, lang), lang);
    }
  };

  const renderObject = (i) => {
    const isTapped = tapped.includes(i);
    return (
      <button
        key={i}
        onClick={() => tapObject(i)}
        aria-label={`item ${i + 1}`}
        className="relative inline-flex items-center justify-center active:scale-90 transition-transform"
      >
        <span
          className="text-5xl md:text-6xl inline-flex items-center justify-center rounded-full transition-all"
          style={
            isTapped
              ? {
                  boxShadow: `0 0 0 6px ${COLORS.yellow}`,
                  backgroundColor: `${COLORS.yellow}55`,
                }
              : {}
          }
        >
          {q.emoji}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col items-center animate-pop">
      <p className="text-sm font-bold text-slate-500 mb-2 text-center">
        {lang === "ms" ? "Klik semua untuk kira!" : "Tap them all to count!"}
      </p>
      <div className="flex items-center justify-center gap-3 mb-4 w-full">
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-[38%]">
          {Array.from({ length: q.groupA }).map((_, i) => renderObject(i))}
        </div>
        <span
          className="text-4xl font-black shrink-0"
          style={{ color: COLORS.orange }}
        >
          +
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-[38%]">
          {Array.from({ length: q.groupB }).map((_, j) =>
            renderObject(q.groupA + j),
          )}
        </div>
      </div>
      <p className="text-2xl font-black text-slate-700 mb-4 drop-shadow-sm">
        {q.prompt}
      </p>
      <p className="text-xs font-bold text-slate-500 mb-2 text-center">
        {lang === "ms"
          ? "Sentuh untuk dengar, sentuh lagi untuk pilih"
          : "Tap to hear, tap again to choose"}
      </p>
      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {q.choices.map((c, i) => (
          <BigButton
            key={i}
            color={[COLORS.sky, COLORS.pink, COLORS.green][i % 3]}
            onClick={() => choose(c)}
            className={`py-6 text-3xl drop-shadow-md flex flex-col items-center justify-center leading-tight ${previewed === c ? "ring-4 ring-yellow-300 scale-105" : ""}`}
          >
            <span>{c}</span>
            <span className="text-sm font-bold">{wordFor(c, lang)}</span>
          </BigButton>
        ))}
      </div>
    </div>
  );
}