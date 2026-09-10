import { useEffect } from "react";
import { Play, Star, BookOpen } from "lucide-react";
import { COLORS, CATEGORIES } from "@/lib/constants";
import { SFX, speak } from "@/lib/audio";
import { BigButton, ScreenShell, TopBar } from "@/components/ui/SharedUI";


/* =========================== MODE CHOICE SCREEN =========================== */
export function ModeChoiceScreen({
  t,
  dark,
  category,
  onBack,
  onPickPlay,
  onPickLearn,
  lang,
  voiceOn,
}) {
  const cat = CATEGORIES.find((c) => c.id === category);
  const Icon = cat ? cat.icon : Star;
  useEffect(() => {
    if (voiceOn) speak(t.chooseMode, lang);
  }, [category]);
  return (
    <ScreenShell dark={dark}>
      <TopBar
        onBack={onBack}
        title={category === "bonus" ? t.bonusTitle : cat ? t[cat.labelKey] : ""}
      />
      <div className="flex flex-col items-center mb-6">
        <div
          className="rounded-3xl p-5 shadow-lg text-white mb-3"
          style={{
            backgroundColor:
              category === "bonus" ? "#7C3AED" : cat ? cat.color : COLORS.sky,
          }}
        >
          <Icon className="w-10 h-10" />
        </div>
        <p className="text-lg font-bold text-slate-700 text-center">
          {t.chooseMode}
        </p>
      </div>
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            SFX.click();
            if (voiceOn) speak(t.letsLearn, lang);
            onPickLearn();
          }}
          className="rounded-3xl p-5 shadow-lg flex flex-col items-center gap-2 text-white active:scale-95 transition-transform"
          style={{
            backgroundColor: COLORS.green,
            boxShadow: "0 6px 0 rgba(0,0,0,0.15)",
          }}
        >
          <BookOpen className="w-9 h-9" />
          <span className="font-black text-lg">{t.learn}</span>
          <span className="text-xs font-semibold opacity-90 text-center">
            {t.learnDesc}
          </span>
        </button>
        <button
          onClick={() => {
            SFX.click();
            if (voiceOn) speak(t.letsPlay, lang);
            onPickPlay();
          }}
          className="rounded-3xl p-5 shadow-lg flex flex-col items-center gap-2 text-white active:scale-95 transition-transform"
          style={{
            backgroundColor: COLORS.pink,
            boxShadow: "0 6px 0 rgba(0,0,0,0.15)",
          }}
        >
          <Play className="w-9 h-9" />
          <span className="font-black text-lg">{t.play}</span>
          <span className="text-xs font-semibold opacity-90 text-center">
            {t.playDesc}
          </span>
        </button>
      </div>
    </ScreenShell>
  );
}


export function DifficultyScreen({
  t,
  dark,
  onBack,
  onPick,
  lang,
  voiceOn,
  category,
}) {
  // Counting shows the actual number ranges as labels instead of
  // Easy/Medium/Hard, since that's more concrete for this category.
  // Counting's range labels get their own `spoken` phrase too, so voice
  // doesn't try to read "1 - 5" literally (which can come out garbled).
  const levels =
    category === "counting"
      ? [
          {
            id: "easy",
            label: "1 - 5",
            spoken: { en: "One to Five", ms: "Satu ke Lima" },
            stars: 1,
            color: COLORS.green,
          },
          {
            id: "medium",
            label: "6 - 10",
            spoken: { en: "Six to Ten", ms: "Enam ke Sepuluh" },
            stars: 2,
            color: COLORS.orange,
          },
          {
            id: "hard",
            label: "11 - 20",
            spoken: { en: "Eleven to Twenty", ms: "Sebelas ke Dua Puluh" },
            stars: 3,
            color: COLORS.pink,
          },
        ]
      : [
          { id: "easy", label: t.easy, stars: 1, color: COLORS.green },
          { id: "medium", label: t.medium, stars: 2, color: COLORS.orange },
          { id: "hard", label: t.hard, stars: 3, color: COLORS.pink },
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
              if (voiceOn) speak(l.spoken ? l.spoken[lang] : l.label, lang);
              onPick(l.id);
            }}
            className="py-5 flex items-center justify-center gap-1 text-lg"
          >
            {Array.from({ length: l.stars }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-white" />
            ))}
            <span className="ml-2">{l.label}</span>
          </BigButton>
        ))}
      </div>
    </ScreenShell>
  );
}