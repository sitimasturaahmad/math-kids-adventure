import { useState, useEffect } from "react";
import { COLORS } from "@/lib/constants";
import { SFX, speak } from "@/lib/audio";
import { uniqueChoices, NUMBER_WORDS, wordFor, numberSpeech } from "@/lib/utils";
import { BigButton, BalancedObjectRows } from "@/components/ui/SharedUI";


export function DragDropQ({ q, onAnswer, lang }) {
  const missing =
    q.blankMissing !== undefined ? q.blankMissing : q.correctAnswer;
  const [tiles] = useState(() =>
    uniqueChoices(missing, 0, Math.max(20, missing + 5), 4),
  );
  const [placed, setPlaced] = useState(null);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState(null);

  const finalize = (val) => {
    if (locked) return;
    setLocked(true);
    setPlaced(val);
    onAnswer(val === missing, missing, val);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const val = Number(e.dataTransfer.getData("text/plain"));
    finalize(val);
  };
  const onDragStart = (e, val) => {
    e.dataTransfer.setData("text/plain", String(val));
  };

  const tapTile = (val) => {
    if (locked) return;
    setSelected(val);
  };
  const tapDropzone = () => {
    if (selected !== null) finalize(selected);
  };

  return (
    <div className="w-full flex flex-col items-center animate-pop">
      <p className="text-lg font-bold text-slate-600 mb-2 text-center">
        {q.prompt}
      </p>
      <p className="text-xs text-slate-500 mb-4 text-center">
        {q.instruction ||
          (lang === "ms"
            ? "Tarik jawapan ke dalam kotak (atau klik jubin, kemudian klik kotak)."
            : "Drag the answer into the box (or tap a tile, then tap the box).")}
      </p>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl font-black text-slate-700">
          {q.blankPrompt?.split("__")[0]}
        </span>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={tapDropzone}
          className="w-16 h-16 rounded-2xl border-4 border-dashed border-sky-400 flex items-center justify-center text-2xl font-black bg-white/70"
        >
          {placed !== null ? placed : "?"}
        </div>
        <span className="text-2xl font-black text-slate-700">
          {q.blankPrompt?.split("__")[1]}
        </span>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {tiles.map((val, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => onDragStart(e, val)}
            onClick={() => tapTile(val)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow cursor-grab active:cursor-grabbing ${selected === val ? "ring-4 ring-white" : ""}`}
            style={{ backgroundColor: COLORS.pink }}
          >
            {val}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CountingTapQ({ q, onAnswer, lang, voiceOn }) {
  const [tapped, setTapped] = useState([]);
  const [locked, setLocked] = useState(false);
  const words = NUMBER_WORDS[lang] || NUMBER_WORDS.en;
  const instruction =
    lang === "ms" ? "Klik untuk kira" : "Tap the object to count!";

  useEffect(() => {
    if (voiceOn) setTimeout(() => speak(instruction, lang), 250); // spoken once, not per tap
  }, [q]);

  const tapFruit = (index) => {
    if (locked || tapped.includes(index)) return;
    const nextCount = tapped.length + 1; // 1-based position in the counting sequence
    setTapped((prev) => [...prev, index]);
    if (voiceOn) speak(words[nextCount - 1] || String(nextCount), lang);
    else SFX.click();
  };

  const [previewed, setPreviewed] = useState(null);
  // Two-tap flow so the child hears the number before committing to it:
  // first tap on a choice previews it aloud (highlighted, not yet
  // submitted); tapping that same choice again confirms and submits it.
  const choose = (val) => {
    if (locked) return;
    if (previewed === val) {
      setLocked(true);
      onAnswer(val === q.correctAnswer, q.correctAnswer, val);
    } else {
      setPreviewed(val);
      if (voiceOn) speak(numberSpeech(val, lang), lang);
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-pop">
      <p className="text-xl font-extrabold text-slate-700 mb-1 text-center drop-shadow-sm">
        {q.prompt}
      </p>
      <p className="text-sm font-bold text-slate-500 mb-4 text-center">
        {instruction}
      </p>
      <BalancedObjectRows
        count={q.count}
        className="max-w-md mb-6"
        rowClassName="gap-4"
      >
        {(i) => (
          <button
            key={i}
            onClick={() => tapFruit(i)}
            className={`text-6xl md:text-7xl transition-transform active:scale-90 drop-shadow-md ${tapped.includes(i) ? "scale-150" : "animate-wiggle"}`}
            style={{ animationDelay: `${i * 0.15}s` }}
            aria-label={`item ${i + 1}`}
          >
            {q.emoji}
          </button>
        )}
      </BalancedObjectRows>
      <p className="text-sm font-extrabold text-slate-600 mb-3">
        {tapped.length}/{q.count} {lang === "ms" ? "dikira" : "counted"}
      </p>
      <p className="text-xs font-bold text-slate-500 mb-2 text-center">
        {lang === "ms"
          ? "Sentuh untuk dengar, sentuh lagi untuk pilih"
          : "Tap to hear, tap again to choose"}
      </p>
      <div className="grid grid-cols-4 gap-2 w-full max-w-md">
        {q.choices.map((c, i) => (
          <BigButton
            key={i}
            color={
              [COLORS.sky, COLORS.pink, COLORS.green, COLORS.orange][i % 4]
            }
            onClick={() => choose(c)}
            className={`py-5 text-3xl drop-shadow-md flex flex-col items-center justify-center leading-tight ${previewed === c ? "ring-4 ring-yellow-300 scale-105" : ""}`}
          >
            <span>{c}</span>
            <span className="text-sm font-bold">{wordFor(c, lang)}</span>
          </BigButton>
        ))}
      </div>
    </div>
  );
}

export function NumbersQ({ q, onAnswer, lang, voiceOn }) {
  const [tapped, setTapped] = useState([]);
  const [locked, setLocked] = useState(false);
  const words = NUMBER_WORDS[lang] || NUMBER_WORDS.en;
  const showObjects =
    q.variant === "digitObjects" || q.variant === "objectsWord";
  const instruction =
    lang === "ms" ? "Klik untuk kira" : "Tap the object to count!";

  useEffect(() => {
    if (showObjects && voiceOn) setTimeout(() => speak(instruction, lang), 250); // spoken once, not per tap
  }, [q]);

  const tapObject = (i) => {
    if (locked || tapped.includes(i)) return;
    const nextCount = tapped.length + 1;
    setTapped((prev) => [...prev, i]);
    if (voiceOn) speak(words[nextCount - 1] || String(nextCount), lang);
    else SFX.click();
  };

  const speakLabel = (text) => {
    if (voiceOn) speak(text, lang);
  };

  const [previewed, setPreviewed] = useState(null);
  // Two-tap flow so the child hears the answer before committing to it:
  // first tap on a choice previews it aloud (highlighted, not yet
  // submitted); tapping that same choice again confirms and submits it.
  const choose = (c) => {
    if (locked) return;
    if (previewed === c) {
      setLocked(true);
      onAnswer(c === q.correctAnswer, q.correctAnswer, c);
    } else {
      setPreviewed(c);
      speakLabel(numberSpeech(c, lang));
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-pop">
      {q.variant === "digitWord" && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => speakLabel(String(q.count))}
            className="font-black text-slate-700 drop-shadow-md active:scale-90 transition-transform"
            style={{ fontSize: "clamp(2.5rem, 9vw, 4.5rem)" }}
          >
            {q.count}
          </button>
          <button
            onClick={() => speakLabel(wordFor(q.count, lang))}
            className="font-black drop-shadow-md active:scale-90 transition-transform"
            style={{
              fontSize: "clamp(2.5rem, 9vw, 4.5rem)",
              color: COLORS.pink,
            }}
          >
            {wordFor(q.count, lang)}
          </button>
        </div>
      )}

      {q.variant === "digitObjects" && (
        <button
          onClick={() => speakLabel(String(q.count))}
          className="text-6xl md:text-7xl font-black text-slate-700 drop-shadow-md mb-3 active:scale-90 transition-transform"
        >
          {q.count}
        </button>
      )}
      {q.variant === "objectsWord" && (
        <button
          onClick={() => speakLabel(wordFor(q.count, lang))}
          className="text-3xl md:text-4xl font-black drop-shadow-md mb-3 active:scale-90 transition-transform"
          style={{ color: COLORS.pink }}
        >
          {wordFor(q.count, lang)}
        </button>
      )}

      {showObjects && (
        <>
          <p className="text-xs font-bold text-slate-500 mb-2 text-center">
            {instruction}
          </p>
          <BalancedObjectRows
            count={q.count}
            className="max-w-sm mb-6"
            rowClassName="gap-3"
          >
            {(i) => (
              <button
                key={i}
                onClick={() => tapObject(i)}
                className={`text-5xl md:text-6xl transition-transform active:scale-90 drop-shadow-md ${tapped.includes(i) ? "scale-150" : "animate-wiggle"}`}
                style={{ animationDelay: `${i * 0.15}s` }}
                aria-label={`item ${i + 1}`}
              >
                {q.emoji}
              </button>
            )}
          </BalancedObjectRows>
        </>
      )}

      <p className="text-sm font-bold text-slate-500 mb-3 text-center">
        {q.prompt}
      </p>
      <p className="text-xs font-bold text-slate-500 mb-2 text-center">
        {lang === "ms"
          ? "Sentuh untuk dengar, sentuh lagi untuk pilih"
          : "Tap to hear, tap again to choose"}
      </p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {q.choices.map((c, i) => {
          if (q.answerType === "objects") {
            return (
              <BigButton
                key={i}
                color={[COLORS.sky, COLORS.pink, COLORS.green][i % 3]}
                onClick={() => choose(c)}
                className={`py-3 px-2 min-h-[76px] drop-shadow-md flex flex-wrap items-center justify-center gap-0.5 ${previewed === c ? "ring-4 ring-yellow-300 scale-105" : ""}`}
              >
                {Array.from({ length: c }).map((_, j) => (
                  <span key={j} className="text-lg leading-none">
                    {q.emoji}
                  </span>
                ))}
              </BigButton>
            );
          }
          if (q.answerType === "word") {
            return (
              <BigButton
                key={i}
                color={[COLORS.sky, COLORS.pink, COLORS.green][i % 3]}
                onClick={() => choose(c)}
                className={`py-5 text-xl drop-shadow-md ${previewed === c ? "ring-4 ring-yellow-300 scale-105" : ""}`}
              >
                {c}
              </BigButton>
            );
          }
          // answerType === "digit"
          return (
            <BigButton
              key={i}
              color={[COLORS.sky, COLORS.pink, COLORS.green][i % 3]}
              onClick={() => choose(c)}
              className={`py-6 text-3xl drop-shadow-md flex flex-col items-center justify-center leading-tight ${previewed === c ? "ring-4 ring-yellow-300 scale-105" : ""}`}
            >
              <span>{c}</span>
              <span className="text-sm font-bold">{wordFor(c, lang)}</span>
            </BigButton>
          );
        })}
      </div>
    </div>
  );
}