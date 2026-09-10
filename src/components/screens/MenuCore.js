import { useState, useEffect } from "react";
import { Play, Users, BarChart3, Trophy, Settings as SettingsIcon, Star, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { COLORS, AVATARS, CATEGORIES } from "@/lib/constants";
import { SFX, speak } from "@/lib/audio";
import { BigButton, BrandLogo, ScreenShell, TopBar } from "@/components/ui/SharedUI";


/* ============================= MAIN MENU ================================== */
export function MainMenu({
  t,
  dark,
  goto,
  currentStudent,
  students,
  onSelectStudent,
  hasResume,
  onResume,
  lang,
  voiceOn,
}) {
  useEffect(() => {
    if (!currentStudent && voiceOn) {
      speak(t.chooseStudent, lang);
    }
  }, [currentStudent, voiceOn, lang, t.chooseStudent]);

  return (
    <ScreenShell dark={dark}>
      <div className="flex flex-col items-center mt-4 mb-6">
        <BrandLogo className="w-32 md:w-36" />
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mt-2 text-center drop-shadow-sm">
          {t.title}
        </h1>
        <p
          className="text-xl md:text-2xl font-extrabold mt-3 text-center"
          style={{ color: COLORS.pink }}
        >
          {t.productName}
        </p>
        <p className="text-sm font-semibold text-slate-600 mt-1 text-center">
          {t.productTagline}
        </p>
      </div>

      {!currentStudent ? (
        // First thing on launch: just pick who's playing — nothing else.
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <p className="text-lg font-bold text-slate-700 text-center">
            {t.chooseStudent}
          </p>
          <div className="grid grid-cols-3 gap-3 w-full">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  SFX.click();
                  onSelectStudent(s.id);
                }}
                className="rounded-2xl p-3 bg-white/90 shadow flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <span className="text-4xl">{s.avatar}</span>
                <span className="font-bold text-slate-700 text-xs text-center">
                  {s.name}
                </span>
              </button>
            ))}
            <button
              onClick={() => {
                SFX.click();
                goto("profiles");
              }}
              className="rounded-2xl p-3 bg-white/60 border-4 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 min-h-[84px] hover:bg-white/80"
            >
              <Plus className="w-7 h-7 text-slate-500" />
              <span className="text-xs font-bold text-slate-500 text-center">
                {t.newStudent}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 shadow">
            <span className="text-2xl">{currentStudent.avatar}</span>
            <span className="font-bold text-slate-700">
              {currentStudent.name}
            </span>
          </div>
          <div className="w-full max-w-sm flex flex-col gap-3">
            {hasResume && (
              <BigButton
                color={COLORS.pink}
                onClick={onResume}
                className="py-4 flex items-center justify-center gap-2 text-lg"
              >
                <RotateCcw className="w-5 h-5" /> {t.resume}
              </BigButton>
            )}
            <BigButton
              color={COLORS.sky}
              onClick={() => goto("categories")}
              className="py-4 flex items-center justify-center gap-2 text-lg"
            >
              <Play className="w-5 h-5" /> {t.start}
            </BigButton>
            <BigButton
              color={COLORS.green}
              onClick={() => goto("profiles")}
              className="py-4 flex items-center justify-center gap-2 text-lg"
            >
              <Users className="w-5 h-5" /> {t.profiles}
            </BigButton>
            <BigButton
              color={COLORS.orange}
              onClick={() => goto("dashboard")}
              className="py-4 flex items-center justify-center gap-2 text-lg"
            >
              <BarChart3 className="w-5 h-5" /> {t.progress}
            </BigButton>
            <BigButton
              color={COLORS.yellow}
              onClick={() => goto("leaderboard")}
              className="py-4 flex items-center justify-center gap-2 text-lg"
            >
              <Trophy className="w-5 h-5" /> {t.leaderboard}
            </BigButton>
            <BigButton
              color={COLORS.pink}
              onClick={() => goto("settings")}
              className="py-4 flex items-center justify-center gap-2 text-lg"
            >
              <SettingsIcon className="w-5 h-5" /> {t.settings}
            </BigButton>
          </div>
        </>
      )}
    </ScreenShell>
  );
}


/* ============================ PROFILES SCREEN ============================= */
export function ProfilesScreen({
  t,
  dark,
  students,
  onBack,
  onUpsert,
  onDelete,
  currentStudentId,
  onSelect,
}) {
  const [editing, setEditing] = useState(null); // student object or null
  const [form, setForm] = useState({ name: "", age: 4, avatar: AVATARS[0] });

  const openNew = () => {
    setForm({ name: "", age: 4, avatar: AVATARS[0] });
    setEditing("new");
  };
  const openEdit = (s) => {
    setForm({ name: s.name, age: s.age, avatar: s.avatar });
    setEditing(s.id);
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing === "new") {
      onUpsert({
        id: Math.random().toString(36).slice(2),
        name: form.name.trim(),
        age: form.age,
        avatar: form.avatar,
        highestScore: 0,
        gamesPlayed: 0,
        progress: 0,
        lastPlayed: null,
        history: [],
      });
    } else {
      const existing = students.find((s) => s.id === editing);
      onUpsert({
        ...existing,
        name: form.name.trim(),
        age: form.age,
        avatar: form.avatar,
      });
    }
    setEditing(null);
  };

  return (
    <ScreenShell dark={dark}>
      <TopBar onBack={onBack} title={t.chooseStudent} />
      <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {students.map((s) => (
          <div
            key={s.id}
            className={`rounded-2xl p-3 bg-white/90 shadow flex flex-col items-center gap-1 cursor-pointer border-4 ${currentStudentId === s.id ? "border-sky-400" : "border-transparent"}`}
            onClick={() => onSelect(s.id)}
          >
            <div className="text-5xl">{s.avatar}</div>
            <div className="font-bold text-slate-800">{s.name}</div>
            <div className="text-xs text-slate-500">
              {t.age}: {s.age}
            </div>
            <div className="text-xs text-slate-500">
              ⭐ {s.highestScore || 0}
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(s);
                }}
                className="p-1.5 rounded-full bg-sky-100 text-sky-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(s.id);
                }}
                className="p-1.5 rounded-full bg-red-100 text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={openNew}
          className="rounded-2xl p-3 bg-white/60 border-4 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 min-h-[140px] hover:bg-white/80"
        >
          <Plus className="w-8 h-8 text-slate-500" />
          <span className="text-sm font-bold text-slate-500">
            {t.newStudent}
          </span>
        </button>
      </div>
      {students.length === 0 && (
        <p className="text-slate-600 font-semibold">{t.noStudents}</p>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm mt-10 mb-10 animate-pop shadow-2xl">
            <h2 className="text-xl font-extrabold text-slate-800 mb-3">
              {editing === "new" ? t.newStudent : t.edit}
            </h2>
            <label className="text-base font-bold text-slate-600">
              {t.name}
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && form.name.trim()) save();
              }}
              autoFocus
              placeholder={t.namePlaceholder}
              style={{ lineHeight: 1.4, fontSize: "1.5rem" }}
              className="w-full rounded-2xl border-4 border-sky-400 px-5 py-4 mb-4 mt-2 font-bold text-slate-800 focus:outline-none focus:border-sky-500 shadow-inner"
            />
            <label className="text-sm font-bold text-slate-600">{t.age}</label>
            <input
              type="number"
              min={3}
              max={6}
              value={form.age}
              onChange={(e) =>
                setForm({
                  ...form,
                  age: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 mb-3 mt-1 font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
            />
            <label className="text-sm font-bold text-slate-600">
              {t.avatar}
            </label>
            <div className="grid grid-cols-5 gap-2 my-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setForm({ ...form, avatar: a })}
                  className={`text-3xl rounded-xl p-1 border-2 ${form.avatar === a ? "border-sky-400 bg-sky-50" : "border-transparent"}`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <BigButton
                color={COLORS.green}
                onClick={save}
                className="flex-1 py-3"
              >
                {t.save}
              </BigButton>
              <BigButton
                color="#94A3B8"
                onClick={() => setEditing(null)}
                className="flex-1 py-3"
              >
                {t.cancel}
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </ScreenShell>
  );
}


/* ============================ CATEGORY SCREEN ============================= */
export function CategoriesScreen({
  t,
  dark,
  onBack,
  onPick,
  onPickBonus,
  lang,
  voiceOn,
}) {
  useEffect(() => {
    if (voiceOn) speak(t.chooseCategory, lang);
  }, [voiceOn, lang, t.chooseCategory]);

  return (
    <ScreenShell dark={dark}>
      <TopBar onBack={onBack} title={t.chooseCategory} />
      <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => {
                SFX.click();
                if (voiceOn) speak(t[c.labelKey], lang);
                onPick(c.id);
              }}
              className="rounded-3xl p-5 shadow-lg flex flex-col items-center gap-2 text-white active:scale-95 transition-transform"
              style={{
                backgroundColor: c.color,
                boxShadow: "0 6px 0 rgba(0,0,0,0.15)",
              }}
            >
              <Icon className="w-10 h-10" />
              <span className="font-extrabold">{t[c.labelKey]}</span>
            </button>
          );
        })}
      </div>
      {/* BONUS card — visually distinct (gold border + ribbon), pinned to
          the bottom-center of the page at a smaller width (3/5) since it's
          a special extra activity, not one of the core categories. */}
      <button
        onClick={() => {
          SFX.click();
          if (voiceOn) speak(t.bonusTitle, lang);
          onPickBonus();
        }}
        className="mt-auto w-3/5 max-w-xs rounded-3xl p-4 shadow-lg flex flex-col items-center justify-center text-white active:scale-95 transition-transform relative overflow-hidden border-4"
        style={{
          backgroundColor: "#7C3AED",
          borderColor: COLORS.yellow,
          boxShadow: "0 6px 0 rgba(0,0,0,0.15)",
        }}
      >
        <span className="absolute top-2 right-2 text-[10px] font-black bg-white text-purple-700 rounded-full px-2 py-0.5">
          BONUS
        </span>
        <Star
          className="w-8 h-8 fill-current mb-1"
          style={{ color: COLORS.yellow }}
        />
        <span className="font-extrabold text-lg text-center">
          {t.bonusTitle}
        </span>
        <span className="font-extrabold text-lg text-center">
          {t.bonusSubtitle}
        </span>
      </button>
    </ScreenShell>
  );
}