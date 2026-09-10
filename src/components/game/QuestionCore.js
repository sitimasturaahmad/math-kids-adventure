import { useState, useEffect } from "react";
import { COLORS, CUSTOM_SHAPE_COLORS, ShapeGlyph, OBJECT_NAMES, MKA_TINT_COLORS, objectColorPhrase } from "@/lib/constants";
import { SFX, speak } from "@/lib/audio";
import { shuffle, uniqueChoices, numberSpeech } from "@/lib/utils";
import { BigButton } from "@/components/ui/SharedUI";
import { DragDropQ, CountingTapQ, NumbersQ } from "@/components/game/QuestionVisualCore";
import { SubtractionVisualQ, AdditionVisualQ } from "@/components/game/QuestionVisualMath";


/* ---------------------------- QUESTION RENDERER --------------------------- */
export function QuestionRenderer({ q, onAnswer, t, lang, voiceOn }) {
  if (q.type === "multiple")
    return (
      <MultipleChoiceQ
        q={q}
        onAnswer={onAnswer}
        lang={lang}
        voiceOn={voiceOn}
      />
    );
  if (q.type === "fill") return <FillBlankQ q={q} onAnswer={onAnswer} />;
  if (q.type === "matching")
    return (
      <MatchingQ
        q={q}
        onAnswer={onAnswer}
        t={t}
        lang={lang}
        voiceOn={voiceOn}
      />
    );
  if (q.type === "dragdrop")
    return <DragDropQ q={q} onAnswer={onAnswer} lang={lang} />;
  if (q.type === "counttap")
    return (
      <CountingTapQ q={q} onAnswer={onAnswer} lang={lang} voiceOn={voiceOn} />
    );
  if (q.type === "numshow")
    return <NumbersQ q={q} onAnswer={onAnswer} lang={lang} voiceOn={voiceOn} />;
  if (q.type === "subvisual")
    return (
      <SubtractionVisualQ
        q={q}
        onAnswer={onAnswer}
        lang={lang}
        voiceOn={voiceOn}
      />
    );
  if (q.type === "addvisual")
    return (
      <AdditionVisualQ
        q={q}
        onAnswer={onAnswer}
        lang={lang}
        voiceOn={voiceOn}
      />
    );
  return (
    <MultipleChoiceQ q={q} onAnswer={onAnswer} lang={lang} voiceOn={voiceOn} />
  );
}


// Renders the shared flower shape recolored to any of MKA_TINT_COLORS via
// the hidden SVG filters — used everywhere a color swatch is shown so every
// color looks like the same flower, just a different color.
export function QuestionPrompt({ q }) {
  return (
    <div className="text-center mb-6">
      <p className="text-xl font-extrabold text-slate-700 mb-2 drop-shadow-sm">
        {q.prompt}
      </p>
      {q.display && (
        <div className="text-6xl md:text-7xl leading-relaxed max-w-xs mx-auto drop-shadow-md flex items-center justify-center">
          <ShapeGlyph emoji={q.display} />
        </div>
      )}
    </div>
  );
}


export function MultipleChoiceQ({ q, onAnswer, lang, voiceOn }) {
  const [locked, setLocked] = useState(false);
  // Two-tap flow so a pre-reader hears the answer before committing to it:
  // the first tap on a choice just previews it aloud (highlighted, not yet
  // submitted); tapping that same choice again confirms and submits it.
  // Tapping a different choice just moves the preview there instead.
  const [previewed, setPreviewed] = useState(null);
  const tap = (c) => {
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
      <QuestionPrompt q={q} />
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
            onClick={() => tap(c)}
            className={`py-6 text-3xl drop-shadow-md ${previewed === c ? "ring-4 ring-yellow-300 scale-105" : ""}`}
          >
            {c}
          </BigButton>
        ))}
      </div>
    </div>
  );
}


export function FillBlankQ({ q, onAnswer }) {
  const [locked, setLocked] = useState(false);
  const missing =
    q.blankMissing !== undefined ? q.blankMissing : q.correctAnswer;
  const options = uniqueChoices(missing, 0, Math.max(20, missing + 5), 4);
  const choose = (val) => {
    if (locked) return;
    setLocked(true);
    onAnswer(val === missing, missing, val);
  };
  return (
    <div className="w-full flex flex-col items-center animate-pop">
      <p className="text-2xl font-black text-slate-700 mb-6 text-center">
        {q.blankPrompt}
      </p>
      <div className="grid grid-cols-4 gap-2 w-full max-w-md">
        {options.map((c, i) => (
          <BigButton
            key={i}
            color={COLORS.orange}
            onClick={() => choose(c)}
            className="py-4 text-xl"
          >
            {c}
          </BigButton>
        ))}
      </div>
    </div>
  );
}


export function MatchingQ({ q, onAnswer, t, lang, voiceOn }) {
  const items = q.matchItems || [];
  const [rightOrder] = useState(() => shuffle(items));
  const [matched, setMatched] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [shakeKey, setShakeKey] = useState(null);
  const done = matched.length === items.length && items.length > 0;

  useEffect(() => {
    if (done) {
      const t0 = setTimeout(() => onAnswer(true, ""), 500);
      return () => clearTimeout(t0);
    }
  }, [done]);

  const pickLeft = (key) => {
    if (matched.includes(key)) return;
    setSelectedLeft(key);
    if (voiceOn) {
      const item = items.find((it) => it.key === key);
      if (item) {
        if (OBJECT_NAMES[item.left])
          speak(objectColorPhrase(item.left, item.key, lang), lang); // "Yellow Banana"
        else if (isNaN(Number(item.left))) speak(item.left, lang); // speak word labels (shapes/colors), not plain numerals
      }
    }
  };
  const pickRight = (key) => {
    if (voiceOn) {
      const rightItem = items.find((it) => it.key === key);
      if (rightItem) {
        if (OBJECT_NAMES[rightItem.right])
          speak(objectColorPhrase(rightItem.right, rightItem.key, lang), lang); // "Yellow Banana"
        else if (isNaN(Number(rightItem.right))) speak(rightItem.right, lang);
      }
    }
    if (selectedLeft == null) return;
    if (selectedLeft === key) {
      setMatched((m) => [...m, key]);
      SFX.correct();
      setSelectedLeft(null);
    } else {
      setShakeKey(key);
      SFX.wrong();
      setTimeout(() => setShakeKey(null), 350);
      setSelectedLeft(null);
    }
  };

  if (items.length === 0)
    return (
      <MultipleChoiceQ
        q={{ ...q, type: "multiple" }}
        onAnswer={onAnswer}
        lang={lang}
        voiceOn={voiceOn}
      />
    );

  // Objects in the "match by color" game are recolored solid (like a
  // silhouette) using an SVG color-matrix filter, so the object's actual
  // shape stays the same but its color is forced to the target color —
  // instead of relying on the emoji's own inconsistent rendering, or
  // sticking a colored circle behind it.
  const renderContent = (content, colorKey) => {
    if (OBJECT_NAMES[content]) {
      // object-color match: colorKey is already a tint id (red/yellow/etc)
      const filterStyle =
        colorKey === "white"
          ? { filter: "url(#mka-tint-white) drop-shadow(0 0 1.5px #64748b)" }
          : { filter: `url(#mka-tint-${colorKey})` };
      return (
        <span className="inline-block text-4xl" style={filterStyle}>
          {content}
        </span>
      );
    }
    if (CUSTOM_SHAPE_COLORS[content]) return <ShapeGlyph emoji={content} />;
    return content;
  };

  return (
    <div className="w-full flex flex-col items-center animate-pop">
      <p className="text-lg font-bold text-slate-600 mb-1">{q.prompt}</p>
      <p className="text-xs text-slate-500 mb-4 text-center">
        {q.instruction ||
          (lang === "ms"
            ? "Klik perkataan, kemudian klik padanannya."
            : "Tap a word, then tap its match.")}
      </p>
      <div className="flex gap-8 w-full max-w-md justify-center">
        <div className="flex flex-col gap-3">
          {items.map((it) => (
            <button
              key={it.key}
              disabled={matched.includes(it.key)}
              onClick={() => pickLeft(it.key)}
              className={`px-4 py-3 rounded-2xl font-black text-xl shadow flex items-center justify-center ${matched.includes(it.key) ? "bg-green-200 text-green-700" : selectedLeft === it.key ? "bg-sky-300 text-white" : "bg-white text-slate-700"}`}
            >
              {renderContent(it.left, it.key)}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rightOrder.map((it) => (
            <button
              key={it.key}
              disabled={matched.includes(it.key)}
              onClick={() => pickRight(it.key)}
              className={`px-4 py-3 rounded-2xl font-black text-2xl shadow flex items-center justify-center ${matched.includes(it.key) ? "bg-green-200 text-green-700" : shakeKey === it.key ? "bg-red-200 animate-shake" : "bg-white"}`}
            >
              {renderContent(it.right, it.key)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}