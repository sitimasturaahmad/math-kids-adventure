import { useState, useEffect, useRef } from "react";
import { Volume2, Star, Home, RotateCcw } from "lucide-react";
import { COLORS, randomPraise, ACHIEVEMENTS } from "@/lib/constants";
import { SFX, speak, estimateSpeechMs, narrateQuestion } from "@/lib/audio";
import { numberSpeech } from "@/lib/utils";
import { BigButton, Mascot, ScreenShell, CircularTimer, Confetti } from "@/components/ui/SharedUI";
import { QuestionRenderer } from "@/components/game/QuestionCore";


/* ============================== GAME SCREEN ================================ */
export function GameScreen({
  t,
  dark,
  lang,
  student,
  gameState,
  setGameState,
  persistSession,
  onFinish,
  onExit,
  onPlayAgain,
  settings,
}) {
  const [feedback, setFeedback] = useState(null); // {correct:bool, correctAnswer}
  const [questionStart, setQuestionStart] = useState(Date.now());
  const [achievementPopup, setAchievementPopup] = useState(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const unlockedRef = useRef(new Set());

  const q = gameState.questions[gameState.currentIndex];
  const totalQ = gameState.questions.length;

  /* countdown timer */
  useEffect(() => {
    if (gameState.totalTime <= 0 || feedback) return;
    if (gameState.timeLeft <= 0) {
      handleGameEnd(gameState);
      return;
    }
    const iv = setTimeout(() => {
      setGameState((g) => {
        const next = { ...g, timeLeft: g.timeLeft - 1 };
        persistSession(next);
        return next;
      });
    }, 1000);
    return () => clearTimeout(iv);
  }, [gameState.timeLeft, feedback]);

  useEffect(() => {
    setQuestionStart(Date.now());
  }, [gameState.currentIndex]);

  /* auto-narrate each new question aloud for pre-readers */
  useEffect(() => {
    if (feedback || !q) return;
    if (settings.voice) {
      const timeoutId = setTimeout(
        () => speak(narrateQuestion(q, lang), lang),
        150,
      );
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.currentIndex, settings.voice]);

  const replayNarration = () => {
    if (q) speak(feedback ? "" : narrateQuestion(q, lang), lang);
  };

  const checkAchievements = (score) => {
    for (const a of ACHIEVEMENTS) {
      if (score >= a.threshold && !unlockedRef.current.has(a.key)) {
        unlockedRef.current.add(a.key);
        setAchievementPopup(a);
        if (settings.sound) SFX.achievement();
        setTimeout(() => setAchievementPopup(null), 2400);
      }
    }
  };

  const handleAnswer = (isCorrect, correctAnswerDisplay, userAnswer) => {
    const elapsed = (Date.now() - questionStart) / 1000;
    let gained = 0;
    if (isCorrect) {
      gained = 10;
      if (gameState.totalTime > 0) {
        if (elapsed < 10) gained += 5;
        else if (elapsed < 20) gained += 3;
      }
      if (settings.sound) SFX.correct();
      setConfettiOn(true);
      setTimeout(() => setConfettiOn(false), 1400);
    } else {
      if (settings.sound) SFX.wrong();
    }
    const newScore = gameState.score + gained;
    const praise = isCorrect ? randomPraise(lang) : null;
    // Spoken as number words, not raw digits — a bare digit can still come
    // out in English pronunciation from a fallback voice when no Malay
    // voice is installed, even inside an otherwise-BM sentence.
    const wrongLine = `${t.wrongIsNot} ${numberSpeech(userAnswer, lang)}. ${t.correctWas} ${numberSpeech(correctAnswerDisplay, lang)}.`;
    const line = isCorrect ? praise : wrongLine;
    // Estimate how long the spoken line will actually take so the
    // auto-advance never cuts it off mid-sentence (this was happening on
    // wrong answers before, since the line is longer than a short praise word).
    const voiceMs = settings.voice ? estimateSpeechMs(line) : 0;
    setFeedback({
      correct: isCorrect,
      correctAnswer: correctAnswerDisplay,
      userAnswer,
      gained,
      praise,
      voiceMs,
    });
    if (settings.voice) {
      // Wrong answers first confirm what was tapped is wrong ("No, it's not 4")
      // before revealing the correct answer, so the child understands their
      // specific attempt was wrong rather than just hearing the right answer.
      const spokenLine = isCorrect
        ? praise
        : userAnswer !== undefined && userAnswer !== null && userAnswer !== ""
          ? wrongLine
          : `${t.tryAgain} ${t.correctWas} ${numberSpeech(correctAnswerDisplay, lang)}`;
      setTimeout(() => speak(spokenLine, lang), 200);
    }
    checkAchievements(newScore);
    const updated = {
      ...gameState,
      score: newScore,
      correct: gameState.correct + (isCorrect ? 1 : 0),
      wrong: gameState.wrong + (isCorrect ? 0 : 1),
    };
    setGameState(updated);
    persistSession(updated);
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (gameState.currentIndex + 1 >= totalQ) {
      handleGameEnd(gameState);
    } else {
      const updated = {
        ...gameState,
        currentIndex: gameState.currentIndex + 1,
      };
      setGameState(updated);
      persistSession(updated);
    }
  };

  // Auto-advance to the next question after feedback is shown — no manual
  // "Continue" tap needed. The delay is based on how long the spoken line
  // actually takes (see estimateSpeechMs), with a floor, so wrong-answer
  // explanations (which are longer) never get cut off mid-sentence.
  useEffect(() => {
    if (!feedback) return;
    const delay = Math.max(1700, 200 + (feedback.voiceMs || 0) + 400);
    const id = setTimeout(() => nextQuestion(), delay);
    return () => clearTimeout(id);
  }, [feedback]);

  const [gameOver, setGameOver] = useState(false);
  const handleGameEnd = (final) => {
    setGameOver(true);
    if (settings.sound) SFX.finish();
    onFinish(final);
  };

  if (gameOver) {
    const accuracy =
      gameState.correct + gameState.wrong > 0
        ? Math.round(
            (gameState.correct / (gameState.correct + gameState.wrong)) * 100,
          )
        : 0;
    return (
      <ScreenShell dark={dark}>
        <Confetti active={true} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Mascot size="text-8xl" />
          <h2 className="text-3xl font-black text-slate-800 text-center">
            {lang === "ms"
              ? `Syabas, ${student?.name || "Peneroka"}!`
              : `Great Job, ${student?.name || "Explorer"}!`}
          </h2>
          <div className="bg-white/90 rounded-3xl p-6 shadow-lg flex flex-col items-center gap-2 w-full max-w-xs">
            <div
              className="text-4xl font-black"
              style={{ color: COLORS.orange }}
            >
              {gameState.score} ⭐
            </div>
            <div className="text-slate-600 font-semibold">
              {t.accuracy}: {accuracy}%
            </div>
            <div className="text-slate-600 font-semibold">
              ✅ {gameState.correct} / ❌ {gameState.wrong}
            </div>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <BigButton
              color={COLORS.pink}
              onClick={onPlayAgain}
              className="flex-1 py-3 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> {t.playAgain}
            </BigButton>
            <BigButton
              color={COLORS.green}
              onClick={onExit}
              className="flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" /> {t.backHome}
            </BigButton>
          </div>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell dark={dark}>
      <Confetti active={confettiOn} />
      {/* HUD */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-3">
        <button
          onClick={onExit}
          className="rounded-full bg-white/80 p-2 shadow"
        >
          <Home className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2 bg-white/85 rounded-full px-3 py-1.5 shadow">
          <span className="text-2xl">{student?.avatar || "🙂"}</span>
          <span className="font-bold text-slate-700 text-sm hidden sm:inline">
            {student?.name}
          </span>
        </div>
        <div
          className="flex items-center gap-1 bg-white/85 rounded-full px-3 py-1.5 shadow font-extrabold"
          style={{ color: COLORS.orange }}
        >
          <Star className="w-4 h-4 fill-current" /> {gameState.score}
        </div>
        <CircularTimer
          total={gameState.totalTime}
          timeLeft={gameState.timeLeft}
        />
      </div>

      {/* progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/60 rounded-full overflow-hidden mb-4 shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(gameState.currentIndex / totalQ) * 100}%`,
            backgroundColor: COLORS.green,
          }}
        />
      </div>
      <p className="text-xs font-bold text-slate-500 mb-2">
        {t.question} {gameState.currentIndex + 1} {t.of} {totalQ}
      </p>

      {settings.voice && !feedback && q && (
        <button
          onClick={replayNarration}
          aria-label={t.tapToHear}
          className="mb-2 flex items-center gap-1.5 bg-white/85 rounded-full px-3 py-1.5 shadow text-xs font-bold text-slate-600 active:scale-95 transition-transform"
        >
          <Volume2 className="w-4 h-4" /> {t.tapToHear}
        </button>
      )}
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center">
        {!feedback && q && (
          <QuestionRenderer
            q={q}
            onAnswer={handleAnswer}
            t={t}
            lang={lang}
            voiceOn={settings.voice}
          />
        )}
        {feedback && <FeedbackPanel feedback={feedback} t={t} />}
      </div>

      {achievementPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-2 animate-pop">
            <div className="text-6xl animate-wiggle">
              {achievementPopup.icon}
            </div>
            <div className="font-black text-lg text-slate-800">
              {t.achievementUnlocked}
            </div>
            <div className="font-bold text-slate-600">
              {achievementPopup.label[lang]}
            </div>
          </div>
        </div>
      )}
    </ScreenShell>
  );
}


export function FeedbackPanel({ feedback, t }) {
  return (
    <div className="w-full flex flex-col items-center animate-pop">
      <div className="text-7xl mb-3">{feedback.correct ? "🎉" : "😊"}</div>
      <h2
        className="text-2xl font-black mb-2"
        style={{ color: feedback.correct ? COLORS.green : COLORS.orange }}
      >
        {feedback.correct ? feedback.praise : t.tryAgain}
      </h2>
      {feedback.correct ? (
        <p className="font-extrabold text-slate-700 mb-4">
          +{feedback.gained} {t.score}
        </p>
      ) : (
        <p className="font-semibold text-slate-600 mb-4">
          {t.correctWas}:{" "}
          <span className="font-black">{String(feedback.correctAnswer)}</span>
        </p>
      )}
    </div>
  );
}