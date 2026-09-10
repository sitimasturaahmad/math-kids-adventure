import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { SFX, speak } from "@/lib/audio";
import { numberSpeech } from "@/lib/utils";
import { BigButton, ScreenShell, TopBar } from "@/components/ui/SharedUI";


// Numbers Learn uses its own three number-range groups instead of
// Easy/Medium/Hard: 1-10 (with countable objects), 11-20, and the tens
// (10, 20, 30 ... 100) — both digit + word only.
export function NumbersLevelScreen({ t, dark, onBack, onPick, lang, voiceOn }) {
  // Each level has a separate `spoken` phrase from its visual `label` — a
  // raw "1 - 100" style label read literally by TTS comes out garbled
  // (e.g. "One One Hundred"), so the voice gets a proper sentence instead.
  const levels = [
    {
      id: "1-10",
      label: "1 - 10",
      spoken: { en: "One to Ten", ms: "Satu ke Sepuluh" },
      color: COLORS.green,
    },
    {
      id: "11-20",
      label: "11 - 20",
      spoken: { en: "Eleven to Twenty", ms: "Sebelas ke Dua Puluh" },
      color: COLORS.orange,
    },
    {
      id: "tens",
      label: "10 - 100",
      spoken: { en: "Ten to One Hundred", ms: "Sepuluh ke Seratus" },
      color: COLORS.pink,
    },
    {
      id: "1-100",
      label: "1 - 100",
      spoken: { en: "One to One Hundred", ms: "Satu ke Seratus" },
      color: COLORS.sky,
    },
  ];
  useEffect(() => {
    if (voiceOn) speak(t.chooseDifficulty, lang);
  }, []);
  return (
    <ScreenShell dark={dark}>
      <TopBar onBack={onBack} title={t.chooseDifficulty} />
      <div className="w-full max-w-sm flex flex-col gap-3">
        {levels.map((l) => (
          <BigButton
            key={l.id}
            color={l.color}
            onClick={() => {
              if (voiceOn) speak(l.spoken[lang], lang);
              onPick(l.id);
            }}
            className="py-6 text-2xl"
          >
            {l.label}
          </BigButton>
        ))}
      </div>
    </ScreenShell>
  );
}


// Numbers Learn "1-100" level: a single scrollable table of every number —
// tap any cell to hear it spoken (no sequencing/Next needed here).
export function NumbersTableScreen({ t, dark, lang, voiceOn, onBack }) {
  const [tapped, setTapped] = useState(null);
  const nums = Array.from({ length: 100 }, (_, i) => i + 1);
  const tapNumber = (n) => {
    setTapped(n);
    if (voiceOn) speak(numberSpeech(n, lang), lang);
    else SFX.click();
  };
  return (
    <ScreenShell dark={dark}>
      <TopBar onBack={onBack} title="" />
      <h1 className="text-4xl md:text-5xl font-black text-slate-800 text-center mb-2 drop-shadow-sm">
        1 - 100
      </h1>
      <p className="text-xs font-bold text-slate-500 mb-3 text-center">
        {lang === "ms"
          ? "Klik mana-mana nombor untuk dengar!"
          : "Tap any number to hear it!"}
      </p>
      <div
        className="w-full max-w-2xl overflow-y-auto flex-1 pb-4"
        style={{ maxHeight: "70vh" }}
      >
        <div className="grid grid-cols-10 gap-1.5">
          {nums.map((n) => (
            <button
              key={n}
              onClick={() => tapNumber(n)}
              className={`aspect-square w-full rounded-lg font-black text-white shadow active:scale-90 transition-transform flex items-center justify-center text-lg sm:text-2xl md:text-3xl ${tapped === n ? "ring-2 ring-yellow-300 scale-110" : ""}`}
              style={{
                backgroundColor: [
                  COLORS.sky,
                  COLORS.pink,
                  COLORS.green,
                  COLORS.orange,
                  COLORS.yellow,
                ][n % 5],
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}


// "1-100" level: a static scrollable table of every number 1-100 — tap any
// number to hear it read aloud. No sequencing/Next-Prev, just free browsing.
/* ============================= TIMER SCREEN =============================== */
export function TimerScreen({ t, dark, onBack, onPick, lang, voiceOn }) {
  const opts = [
    { id: "30", label: t.sec30, color: COLORS.sky },
    { id: "60", label: t.min1, color: COLORS.orange },
    { id: "unlimited", label: t.unlimited, color: COLORS.green },
  ];
  return (
    <ScreenShell dark={dark}>
      <TopBar onBack={onBack} title={t.chooseTimer} />
      <div className="w-full max-w-sm flex flex-col gap-3">
        {opts.map((o) => (
          <BigButton
            key={o.id}
            color={o.color}
            onClick={() => {
              if (voiceOn) speak(o.label, lang);
              onPick(o.id);
            }}
            className="py-5 flex items-center justify-center gap-2 text-lg"
          >
            <Clock className="w-5 h-5" /> {o.label}
          </BigButton>
        ))}
      </div>
    </ScreenShell>
  );
}