import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { COLORS, OBJECT_NAMES } from "@/lib/constants";
import { SFX, speak } from "@/lib/audio";
import { NUMBER_WORDS, wordFor, numberSpeech } from "@/lib/utils";
import { BalancedObjectRows } from "@/components/ui/SharedUI";


// Simple flashcard: big digit + big word together, spoken on entry.
export function LearnNumberIntro({ step, lang, voiceOn }) {
  useEffect(() => {
    if (voiceOn) speak(numberSpeech(step.count, lang), lang);
  }, [step, voiceOn, lang]);
  return (
    <div className="flex items-center gap-5 animate-pop">
      <button
        onClick={() => voiceOn && speak(numberSpeech(step.count, lang), lang)}
        className="font-black drop-shadow-md active:scale-90 transition-transform"
        style={{ fontSize: "clamp(3.5rem, 14vw, 7rem)", color: "#000000" }}
      >
        {step.count}
      </button>
      <button
        onClick={() => voiceOn && speak(step.word, lang)}
        className="font-black drop-shadow-md active:scale-90 transition-transform"
        style={{ fontSize: "clamp(3.5rem, 14vw, 7rem)", color: "#DC2626" }}
      >
        {step.word}
      </button>
    </div>
  );
}


// Numbers Learn "1-10" level: objects up top the child taps one at a time to
// count (each tap grows and keeps that object big), digit + word below.
export function LearnNumberObjectsIntro({ step, lang, voiceOn }) {
  const [grown, setGrown] = useState([]);
  const words = NUMBER_WORDS[lang] || NUMBER_WORDS.en;
  const instruction =
    lang === "ms" ? "Klik untuk kira" : "Tap the object to count!";

  useEffect(() => {
    setGrown([]);
    if (voiceOn) {
      // Announce the number, then the tap instruction once — not repeated
      // per tap, just this one time when we arrive on this number.
      speak(numberSpeech(step.count, lang), lang);
      setTimeout(() => {
        if (voiceOn) speak(instruction, lang);
      }, 900);
    }
  }, [step]);

  const tapObject = (i) => {
    if (grown.includes(i)) return;
    const nextCount = grown.length + 1;
    setGrown((g) => [...g, i]);
    if (voiceOn) speak(words[nextCount - 1] || String(nextCount), lang);
    else SFX.click();
  };

  return (
    <div className="flex flex-col items-center animate-pop">
      <p className="text-xs font-bold text-slate-500 mb-2 text-center">
        {instruction}
      </p>
      <BalancedObjectRows
        count={step.count}
        className="max-w-md mb-6"
        rowClassName="gap-4"
      >
        {(i) => (
          <button
            key={i}
            onClick={() => tapObject(i)}
            aria-label={`item ${i + 1}`}
            className={`drop-shadow-md transition-transform duration-300 active:scale-90 ${grown.includes(i) ? "scale-150" : "scale-100"}`}
            style={{ fontSize: "3.5rem" }}
          >
            {step.emoji}
          </button>
        )}
      </BalancedObjectRows>
      <div className="flex items-center gap-5">
        <button
          onClick={() => voiceOn && speak(numberSpeech(step.count, lang), lang)}
          className="font-black drop-shadow-md active:scale-90 transition-transform"
          style={{ fontSize: "clamp(2.5rem, 9vw, 4.5rem)", color: "#000000" }}
        >
          {step.count}
        </button>
        <button
          onClick={() => voiceOn && speak(step.word, lang)}
          className="font-black drop-shadow-md active:scale-90 transition-transform"
          style={{ fontSize: "clamp(2.5rem, 9vw, 4.5rem)", color: "#DC2626" }}
        >
          {step.word}
        </button>
      </div>
    </div>
  );
}


// Automatically walks through counting `count` copies of each of 3 objects,
// one object growing (and staying grown) per counted step.
export function LearnCountIntro({ step, lang, voiceOn }) {
  const [phase, setPhase] = useState("number"); // "number" first, then "objects"
  const [exampleIndex, setExampleIndex] = useState(0);
  const [grown, setGrown] = useState([]);
  const words = NUMBER_WORDS[lang] || NUMBER_WORDS.en;

  useEffect(() => {
    let cancelled = false;
    const timers = [];
    setPhase("number");
    setGrown([]);
    setExampleIndex(0);
    if (voiceOn) speak(numberSpeech(step.count, lang), lang);

    const runExample = (exIdx) => {
      if (cancelled || exIdx >= step.objects.length) return;
      setExampleIndex(exIdx);
      setGrown([]);
      const object = step.objects[exIdx];
      const objName = OBJECT_NAMES[object] ? OBJECT_NAMES[object][lang] : "";
      const plural = step.count > 1 && lang === "en" ? `${objName}s` : objName;
      if (voiceOn) speak(`${step.count} ${plural}`, lang);
      for (let i = 0; i < step.count; i++) {
        timers.push(
          setTimeout(
            () => {
              if (cancelled) return;
              setGrown((g) => [...g, i]);
              if (voiceOn) speak(words[i] || String(i + 1), lang);
            },
            900 + i * 650,
          ),
        );
      }
      timers.push(
        setTimeout(() => runExample(exIdx + 1), 900 + step.count * 650 + 700),
      );
    };
    // Show just the number by itself first, then move on to the objects.
    timers.push(
      setTimeout(() => {
        if (!cancelled) {
          setPhase("objects");
          runExample(0);
        }
      }, 1800),
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [step]);

  if (phase === "number") {
    return (
      <div className="flex flex-col items-center animate-pop">
        <button
          onClick={() => voiceOn && speak(numberSpeech(step.count, lang), lang)}
          className="font-black drop-shadow-md active:scale-90 transition-transform text-black"
          style={{ fontSize: "clamp(6rem, 22vw, 13rem)" }}
        >
          {step.count}
        </button>
      </div>
    );
  }

  const object = step.objects[exampleIndex] || step.objects[0];
  return (
    <div className="flex flex-col items-center animate-pop">
      <p className="text-xs font-bold text-slate-500 mb-3">
        {exampleIndex + 1} / {step.objects.length}
      </p>
      <BalancedObjectRows
        count={step.count}
        className="max-w-md min-h-[110px]"
        rowClassName="gap-4"
      >
        {(i) => (
          <span
            key={i}
            className={`drop-shadow-md transition-transform duration-300 ${grown.includes(i) ? "scale-150" : "scale-100"}`}
            style={{ fontSize: "3.5rem" }}
          >
            {object}
          </span>
        )}
      </BalancedObjectRows>
    </div>
  );
}


// Walks through "a + b = answer" — the full equation is read slowly first,
// then group A highlights while its number is spoken, "plus" + group B's
// number, "equals to", and then the objects visibly drop down one at a time
// into an answer area below until all of them have gathered there.
// Interactive version (matches the PLAY tap-to-grow style): the child taps
// every object across group A and group B themselves; each tap grows that
// object with a glowing highlight and counts it aloud in sequence, and the
// answer is announced once every object has been tapped. A Replay button
// lets the child redo the whole thing as many times as they want.
// Automatic demo (no tapping) — matches the requested flow:
// 1) full sentence WITH the answer, spoken once immediately.
// 2) the question is repeated: group A grows together while its number is
//    spoken, then group B grows together while its number is spoken.
// 3) "equals to" is spoken, then every object (across both groups) is
//    counted one at a time — each one gets the glowing yellow circle right
//    as it's being counted.
// A Replay button restarts the whole demo for another look.
export function LearnAdditionIntro({ step, lang, voiceOn }) {
  const [stage, setStage] = useState(0); // 0 idle, 1 group A grown, 2 group B grown, 3 "equals to" said, 4 counting
  const [countedIdx, setCountedIdx] = useState([]);
  const [runId, setRunId] = useState(0); // bumped by Replay to restart the demo
  const words = NUMBER_WORDS[lang] || NUMBER_WORDS.en;
  const RATE = 0.68;
  const total = step.a + step.b;
  // Medium and Hard use plain numerals (spoken/shown as "6", "2"...) instead
  // of spelled-out words — only Easy spells them out.
  const useNumerals =
    step.difficulty === "medium" || step.difficulty === "hard";
  const wordA = useNumerals ? String(step.a) : wordFor(step.a, lang);
  const wordB = useNumerals ? String(step.b) : wordFor(step.b, lang);
  const wordAns = useNumerals
    ? String(step.answer)
    : wordFor(step.answer, lang);

  useEffect(() => {
    let cancelled = false;
    const timers = [];
    setStage(0);
    setCountedIdx([]);

    // Step one: full sentence with the answer, right away
    const fullSentence =
      lang === "ms"
        ? `${wordA} tambah ${wordB} sama dengan ${wordAns}.`
        : `${wordA} plus ${wordB} equals ${wordAns}.`;
    if (voiceOn) speak(fullSentence, lang, RATE);

    // Step two: repeat it, group by group — "plus" and "equals to" are both
    // said in full, not skipped.
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setStage(1);
        if (voiceOn) speak(wordA, lang, RATE);
      }, 2600),
    );
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setStage(2);
        if (voiceOn)
          speak(
            lang === "ms" ? `tambah ${wordB}` : `plus ${wordB}`,
            lang,
            RATE,
          );
      }, 4200),
    );
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setStage(3);
        if (voiceOn)
          speak(lang === "ms" ? "sama dengan" : "equals to", lang, RATE);
      }, 5800),
    );

    // Step three: count every object one at a time, glowing as each is counted
    const countStart = 6900;
    for (let i = 0; i < total; i++) {
      timers.push(
        setTimeout(
          () => {
            if (cancelled) return;
            setStage(4);
            setCountedIdx((c) => [...c, i]);
            if (voiceOn) speak(words[i] || String(i + 1), lang, RATE);
          },
          countStart + i * 700,
        ),
      );
    }

    // Step four: once every object has been counted, show the answer below
    // and repeat the whole question (with the answer) one more time so it
    // lands as a complete statement, not just a fragment.
    timers.push(
      setTimeout(
        () => {
          if (cancelled) return;
          setStage(5);
          if (voiceOn) speak(fullSentence, lang, RATE);
        },
        countStart + total * 700 + 500,
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

  const renderObject = (i, inGroupA) => {
    const counted = countedIdx.includes(i);
    const groupGrown = (inGroupA && stage === 1) || (!inGroupA && stage === 2);
    return (
      <span
        key={i}
        className={`inline-flex items-center justify-center rounded-full transition-all drop-shadow-md ${groupGrown ? "scale-150" : "scale-100"}`}
        style={{
          fontSize: "3rem",
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
    );
  };

  return (
    <div className="flex flex-col items-center animate-pop">
      <p className="text-3xl md:text-4xl font-black text-black mb-6 drop-shadow-sm">
        {step.a} + {step.b} = {step.answer}
      </p>
      {/* Left group / right group split — keeps things clear even when the
          medium/hard levels need more room for bigger counts. */}
      <div className="flex items-center justify-center gap-4 mb-4 w-full">
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-[38%] min-h-[60px]">
          {Array.from({ length: step.a }).map((_, i) => renderObject(i, true))}
        </div>
        <span
          className="text-3xl font-black shrink-0"
          style={{ color: COLORS.orange }}
        >
          +
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-[38%] min-h-[60px]">
          {Array.from({ length: step.b }).map((_, i) =>
            renderObject(step.a + i, false),
          )}
        </div>
      </div>
      <p className="text-xs font-extrabold text-slate-600 mb-3">
        {countedIdx.length}/{total} {lang === "ms" ? "dikira" : "counted"}
      </p>
      {stage >= 5 && (
        <p
          className="font-black mb-4 animate-pop text-black drop-shadow-sm"
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