"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { STRINGS, SINGLE_LEVEL_CATEGORIES, MKA_TINT_COLORS } from "@/lib/constants";
import { TWINKLE_MELODY, loopPattern, unlockVoiceEngine } from "@/lib/audio";
import { storage } from "@/lib/storage";
import { generateQuestionPool, generateMemoriseSteps, generateLearnSteps, LEARN_HAS_LEVELS } from "@/lib/generators";
import { MainMenu, ProfilesScreen, CategoriesScreen } from "@/components/screens/MenuCore";
import { ModeChoiceScreen, DifficultyScreen } from "@/components/screens/MenuModes";
import { NumbersLevelScreen, NumbersTableScreen, TimerScreen } from "@/components/screens/SetupScreens";
import { LeaderboardScreen, DashboardScreen, SettingsScreen } from "@/components/screens/MetaScreens";
import { GameScreen } from "@/components/game/GameScreen";
import { LearnScreen } from "@/components/learn/LearnScreen";


/* ============================= MAIN APP =================================== */
export default function MathKidsAdventure() {
  const [students, setStudents] = useState([]);
  const [settings, setSettings] = useState({
    music: true,
    sound: true,
    voice: true,
    language: "en",
    darkMode: false,
  });
  const [screen, setScreen] = useState("profiles"); // starts on the player picker; menu, profiles, categories, modeChoice, difficulty, timer, game, learnDifficulty, learn, leaderboard, dashboard, settings
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [selCategory, setSelCategory] = useState(null);
  const [selDifficulty, setSelDifficulty] = useState(null);
  const [selTimerMode, setSelTimerMode] = useState(null); // '30' | '60' | 'unlimited'
  const [gameState, setGameState] = useState(null);
  const [learnSteps, setLearnSteps] = useState([]);
  const [learnIndex, setLearnIndex] = useState(0);
  const [ready, setReady] = useState(false);

  const t = STRINGS[settings.language];
  const currentStudent =
    students.find((s) => s.id === currentStudentId) || null;

  /* ---- load on mount ---- */
  useEffect(() => {
    setStudents(storage.loadStudents());
    const s = storage.loadSettings();
    if (s)
      setSettings((prev) => ({
        ...prev,
        ...s,
        voice: s.voice !== undefined ? s.voice : true,
      }));
    // Some browsers load their voice list asynchronously; this warms it up.
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
    // Unlock the speech engine on the very first tap so narration isn't
    // silently dropped on mobile browsers (a common first-utterance bug).
    const unlockOnce = () => {
      unlockVoiceEngine();
      window.removeEventListener("pointerdown", unlockOnce);
    };
    window.addEventListener("pointerdown", unlockOnce, { once: true });
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) storage.saveStudents(students);
  }, [students, ready]);
  useEffect(() => {
    if (ready) storage.saveSettings(settings);
  }, [settings, ready]);

  /* ---- background music for PLAY mode: "Twinkle, Twinkle, Little Star",
     played softly so it never competes with the voice narration ---- */
  useEffect(() => {
    if (!settings.music || screen !== "game") return;
    return loopPattern(TWINKLE_MELODY);
  }, [settings.music, screen]);

  const goto = (s) => setScreen(s);

  /* ---- student management ---- */
  const upsertStudent = (student) => {
    setStudents((prev) => {
      const exists = prev.find((p) => p.id === student.id);
      if (exists) return prev.map((p) => (p.id === student.id ? student : p));
      return [...prev, student];
    });
  };
  const deleteStudent = (id) => {
    setStudents((prev) => prev.filter((p) => p.id !== id));
    storage.clearSession(id);
    if (currentStudentId === id) setCurrentStudentId(null);
  };

  /* ---- start a new game session ---- */
  const startGame = (category, difficulty, timerMode) => {
    const pool = generateQuestionPool(
      category,
      difficulty,
      12,
      settings.language,
    );
    const totalTime = timerMode === "30" ? 30 : timerMode === "60" ? 60 : 0;
    const session = {
      category,
      difficulty,
      timerMode,
      questions: pool,
      currentIndex: 0,
      score: 0,
      correct: 0,
      wrong: 0,
      totalTime,
      timeLeft: totalTime,
      startedAt: Date.now(),
    };
    setGameState(session);
    if (currentStudentId) storage.saveSession(currentStudentId, session);
    setScreen("game");
  };

  const resumeSession = () => {
    if (!currentStudentId) return;
    const s = storage.loadSession(currentStudentId);
    if (s) {
      setGameState(s);
      setScreen("game");
    }
  };

  const persistSession = (s) => {
    if (currentStudentId) storage.saveSession(currentStudentId, s);
  };

  const finishGame = (finalState) => {
    if (currentStudentId) {
      storage.clearSession(currentStudentId);
      setStudents((prev) =>
        prev.map((st) => {
          if (st.id !== currentStudentId) return st;
          const accuracy =
            finalState.correct + finalState.wrong > 0
              ? Math.round(
                  (finalState.correct /
                    (finalState.correct + finalState.wrong)) *
                    100,
                )
              : 0;
          const history = [
            ...(st.history || []),
            {
              date: new Date().toISOString(),
              score: finalState.score,
              correct: finalState.correct,
              wrong: finalState.wrong,
              accuracy,
              category: finalState.category,
              timeSpent: Math.round((Date.now() - finalState.startedAt) / 1000),
            },
          ].slice(-30);
          return {
            ...st,
            highestScore: Math.max(st.highestScore || 0, finalState.score),
            gamesPlayed: (st.gamesPlayed || 0) + 1,
            progress: Math.min(100, (st.progress || 0) + 5),
            lastPlayed: new Date().toISOString(),
            history,
          };
        }),
      );
    }
  };

  const dark = settings.darkMode;

  if (!ready) return null;

  return (
    <div
      className="flex-1 w-full min-h-[100dvh] flex flex-col overflow-hidden"
      style={{
        fontFamily: "ui-rounded, 'Segoe UI Rounded', system-ui, sans-serif",
      }}
    >
      {/* Hidden SVG filters that recolor an object emoji to a flat solid
          color (used by the "match objects by color" game) — feColorMatrix
          forces exact R/G/B output while keeping the emoji's own alpha
          shape, so e.g. a ball can be turned fully black regardless of how
          its emoji is normally colored on any given device. */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute" }}
        aria-hidden="true"
      >
        <defs>
          {Object.entries(MKA_TINT_COLORS).map(([key, [r, g, b]]) => (
            <filter id={`mka-tint-${key}`} key={key}>
              <feColorMatrix
                type="matrix"
                values={`0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 1 0`}
              />
            </filter>
          ))}
        </defs>
      </svg>
      {screen === "menu" && (
        <MainMenu
          t={t}
          dark={dark}
          goto={goto}
          currentStudent={currentStudent}
          students={students}
          onSelectStudent={(id) => setCurrentStudentId(id)}
          hasResume={
            currentStudentId && !!storage.loadSession(currentStudentId)
          }
          onResume={resumeSession}
          lang={settings.language}
          voiceOn={settings.voice}
        />
      )}
      {screen === "profiles" && (
        <ProfilesScreen
          t={t}
          dark={dark}
          students={students}
          onBack={() => goto("menu")}
          onUpsert={upsertStudent}
          onDelete={deleteStudent}
          currentStudentId={currentStudentId}
          onSelect={(id) => {
            setCurrentStudentId(id);
            goto("menu");
          }}
        />
      )}
      {screen === "categories" && (
        <CategoriesScreen
          t={t}
          dark={dark}
          onBack={() => goto("menu")}
          lang={settings.language}
          voiceOn={settings.voice}
          onPick={(cat) => {
            setSelCategory(cat);
            goto("modeChoice");
          }}
          onPickBonus={() => {
            setSelCategory("bonus");
            setLearnSteps(generateMemoriseSteps());
            setLearnIndex(0);
            goto("learn");
          }}
        />
      )}
      {screen === "modeChoice" && (
        <ModeChoiceScreen
          t={t}
          dark={dark}
          category={selCategory}
          onBack={() => goto("categories")}
          lang={settings.language}
          voiceOn={settings.voice}
          onPickPlay={() => {
            // Subtraction, Colors, and Shapes each have only one simple
            // level in PLAY, so skip straight to the timer screen.
            if (SINGLE_LEVEL_CATEGORIES.includes(selCategory)) {
              setSelDifficulty("easy");
              goto("timer");
            } else {
              goto("difficulty");
            }
          }}
          onPickLearn={() => {
            if (LEARN_HAS_LEVELS.includes(selCategory)) {
              goto("learnDifficulty");
            } else {
              setLearnSteps(
                generateLearnSteps(selCategory, "easy", settings.language),
              );
              setLearnIndex(0);
              goto("learn");
            }
          }}
        />
      )}
      {screen === "difficulty" && (
        <DifficultyScreen
          t={t}
          dark={dark}
          onBack={() => goto("modeChoice")}
          lang={settings.language}
          voiceOn={settings.voice}
          category={selCategory}
          onPick={(diff) => {
            setSelDifficulty(diff);
            goto("timer");
          }}
        />
      )}
      {screen === "learnDifficulty" && selCategory === "numbers" && (
        <NumbersLevelScreen
          t={t}
          dark={dark}
          onBack={() => goto("modeChoice")}
          lang={settings.language}
          voiceOn={settings.voice}
          onPick={(diff) => {
            if (diff === "1-100") {
              goto("numbersTable");
              return;
            }
            setSelDifficulty(diff);
            setLearnSteps(
              generateLearnSteps(selCategory, diff, settings.language),
            );
            setLearnIndex(0);
            goto("learn");
          }}
        />
      )}
      {screen === "numbersTable" && (
        <NumbersTableScreen
          t={t}
          dark={dark}
          lang={settings.language}
          voiceOn={settings.voice}
          onBack={() => goto("learnDifficulty")}
        />
      )}
      {screen === "learnDifficulty" && selCategory !== "numbers" && (
        <DifficultyScreen
          t={t}
          dark={dark}
          onBack={() => goto("modeChoice")}
          lang={settings.language}
          voiceOn={settings.voice}
          category={selCategory}
          onPick={(diff) => {
            setSelDifficulty(diff);
            setLearnSteps(
              generateLearnSteps(selCategory, diff, settings.language),
            );
            setLearnIndex(0);
            goto("learn");
          }}
        />
      )}
      {screen === "timer" && (
        <TimerScreen
          t={t}
          dark={dark}
          onBack={() =>
            goto(
              SINGLE_LEVEL_CATEGORIES.includes(selCategory)
                ? "modeChoice"
                : "difficulty",
            )
          }
          lang={settings.language}
          voiceOn={settings.voice}
          onPick={(mode) => startGame(selCategory, selDifficulty, mode)}
        />
      )}
      {screen === "learn" && (
        <LearnScreen
          t={t}
          dark={dark}
          lang={settings.language}
          voiceOn={settings.voice}
          musicOn={settings.music}
          category={selCategory}
          steps={learnSteps}
          index={learnIndex}
          onNext={() =>
            setLearnIndex((i) => Math.min(i + 1, learnSteps.length - 1))
          }
          onPrev={() => setLearnIndex((i) => Math.max(i - 1, 0))}
          onExit={() =>
            goto(selCategory === "bonus" ? "categories" : "modeChoice")
          }
          onFinish={() =>
            goto(selCategory === "bonus" ? "categories" : "modeChoice")
          }
        />
      )}
      {screen === "game" && gameState && (
        <GameScreen
          t={t}
          dark={dark}
          lang={settings.language}
          student={currentStudent}
          gameState={gameState}
          setGameState={setGameState}
          persistSession={persistSession}
          onFinish={(final) => {
            finishGame(final);
          }}
          onExit={() => goto("menu")}
          onPlayAgain={() => {
            if (SINGLE_LEVEL_CATEGORIES.includes(selCategory)) {
              setSelDifficulty("easy");
              goto("timer");
            } else {
              goto("difficulty");
            }
          }}
          settings={settings}
        />
      )}
      {screen === "leaderboard" && (
        <LeaderboardScreen
          t={t}
          dark={dark}
          students={students}
          onBack={() => goto("menu")}
        />
      )}
      {screen === "dashboard" && (
        <DashboardScreen
          t={t}
          dark={dark}
          student={currentStudent}
          onBack={() => goto("menu")}
        />
      )}
      {screen === "settings" && (
        <SettingsScreen
          t={t}
          dark={dark}
          settings={settings}
          setSettings={setSettings}
          onBack={() => goto("menu")}
          onReset={() => {
            setStudents([]);
            students.forEach((s) => storage.clearSession(s.id));
          }}
        />
      )}
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-18px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes bounceSlow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounceSlow 2s ease-in-out infinite; }
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.9; }
        }
        .animate-confetti-fall { animation-name: confettiFall; animation-timing-function: ease-in; animation-fill-mode: forwards; }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop { animation: popIn 0.35s cubic-bezier(.34,1.56,.64,1); }
        @keyframes shakeX { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-8px);} 75%{transform:translateX(8px);} }
        .animate-shake { animation: shakeX 0.35s ease-in-out; }
        @keyframes wiggle { 0%,100%{transform:rotate(0deg);} 50%{transform:rotate(6deg);} }
        .animate-wiggle { animation: wiggle 1.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}