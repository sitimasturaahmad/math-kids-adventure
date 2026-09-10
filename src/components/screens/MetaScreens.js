import { useState } from "react";
import { Volume2, VolumeX, Music, Sun, Moon } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { COLORS, PIE_COLORS } from "@/lib/constants";
import { BigButton, ScreenShell, TopBar } from "@/components/ui/SharedUI";


/* =========================== LEADERBOARD SCREEN =========================== */
export function LeaderboardScreen({ t, dark, students, onBack }) {
  const top = [...students]
    .sort((a, b) => (b.highestScore || 0) - (a.highestScore || 0))
    .slice(0, 10);
  return (
    <ScreenShell dark={dark}>
      <TopBar onBack={onBack} title={t.top10} />
      <div className="w-full max-w-xl flex flex-col gap-2">
        {top.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-3 bg-white/90 rounded-2xl px-4 py-3 shadow"
          >
            <div className="w-8 text-center font-black text-slate-500">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
            </div>
            <div className="text-3xl">{s.avatar}</div>
            <div className="flex-1">
              <div className="font-bold text-slate-800">{s.name}</div>
              <div className="text-xs text-slate-500">
                {t.games}: {s.gamesPlayed || 0}
                {s.lastPlayed
                  ? ` • ${new Date(s.lastPlayed).toLocaleDateString()}`
                  : ""}
              </div>
            </div>
            <div
              className="font-black text-lg"
              style={{ color: COLORS.orange }}
            >
              {s.highestScore || 0} ⭐
            </div>
          </div>
        ))}
        {top.length === 0 && (
          <p className="text-slate-600 font-semibold text-center mt-4">
            {t.noStudents}
          </p>
        )}
      </div>
    </ScreenShell>
  );
}


/* ============================ DASHBOARD SCREEN ============================= */
export function DashboardScreen({ t, dark, student, onBack }) {
  if (!student) {
    return (
      <ScreenShell dark={dark}>
        <TopBar onBack={onBack} title={t.dashboard} />
        <p className="text-slate-600 font-semibold mt-6">
          {t.selectStudentFirst}
        </p>
      </ScreenShell>
    );
  }
  const history = student.history || [];
  const totalCorrect = history.reduce((a, h) => a + h.correct, 0);
  const totalWrong = history.reduce((a, h) => a + h.wrong, 0);
  const avgScore = history.length
    ? Math.round(history.reduce((a, h) => a + h.score, 0) / history.length)
    : 0;
  const avgTime = history.length
    ? Math.round(history.reduce((a, h) => a + h.timeSpent, 0) / history.length)
    : 0;
  const accuracy =
    totalCorrect + totalWrong > 0
      ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
      : 0;

  const catCounts = {};
  history.forEach((h) => {
    catCounts[h.category] = (catCounts[h.category] || 0) + 1;
  });
  const barData = Object.entries(catCounts).map(([k, v]) => ({
    name: k,
    count: v,
  }));
  const pieData = [
    { name: "Correct", value: totalCorrect },
    { name: "Wrong", value: totalWrong },
  ];
  const lineData = history.map((h, i) => ({ session: i + 1, score: h.score }));

  return (
    <ScreenShell dark={dark}>
      <TopBar onBack={onBack} title={t.dashboard} />
      <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          label={t.played}
          value={student.gamesPlayed || 0}
          color={COLORS.sky}
        />
        <StatCard
          label={t.highScore}
          value={student.highestScore || 0}
          color={COLORS.orange}
        />
        <StatCard label={t.avgScore} value={avgScore} color={COLORS.green} />
        <StatCard
          label={t.accuracy}
          value={`${accuracy}%`}
          color={COLORS.pink}
        />
      </div>

      {history.length === 0 ? (
        <p className="text-slate-600 font-semibold">{t.noData}</p>
      ) : (
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <ChartCard title="Games by Category">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.sky} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={`${t.correctLabel} / ${t.wrongLabel}`}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={`${t.score} ${t.progress}`}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={COLORS.pink}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </ScreenShell>
  );
}


export function StatCard({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white/90 p-3 shadow flex flex-col items-center">
      <div className="text-2xl font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-xs font-bold text-slate-500 text-center">
        {label}
      </div>
    </div>
  );
}

export function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow">
      <div className="font-bold text-slate-700 mb-2 text-sm">{title}</div>
      {children}
    </div>
  );
}


/* ============================= SETTINGS SCREEN ============================= */
export function SettingsScreen({ t, dark, settings, setSettings, onBack, onReset }) {
  const [confirming, setConfirming] = useState(false);
  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <ScreenShell dark={dark}>
      <TopBar onBack={onBack} title={t.settings} />
      <div className="w-full max-w-md flex flex-col gap-3">
        <SettingRow
          icon={settings.music ? Music : VolumeX}
          label={t.music}
          active={settings.music}
          onClick={() => toggle("music")}
        />
        <SettingRow
          icon={settings.sound ? Volume2 : VolumeX}
          label={t.sound}
          active={settings.sound}
          onClick={() => toggle("sound")}
        />
        <SettingRow
          icon={settings.voice ? Volume2 : VolumeX}
          label={t.voice}
          active={settings.voice}
          onClick={() => toggle("voice")}
        />
        <SettingRow
          icon={settings.darkMode ? Moon : Sun}
          label={t.darkMode}
          active={settings.darkMode}
          onClick={() => toggle("darkMode")}
        />

        <div className="bg-white/90 rounded-2xl p-4 shadow flex items-center justify-between">
          <span className="font-bold text-slate-700">{t.language}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSettings((s) => ({ ...s, language: "en" }))}
              className={`px-3 py-1.5 rounded-xl font-bold text-sm ${settings.language === "en" ? "bg-sky-400 text-white" : "bg-slate-100 text-slate-500"}`}
            >
              EN
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, language: "ms" }))}
              className={`px-3 py-1.5 rounded-xl font-bold text-sm ${settings.language === "ms" ? "bg-sky-400 text-white" : "bg-slate-100 text-slate-500"}`}
            >
              BM
            </button>
          </div>
        </div>

        {!confirming ? (
          <BigButton
            color="#EF4444"
            onClick={() => setConfirming(true)}
            className="py-3"
          >
            {t.reset}
          </BigButton>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-700">
              {t.resetConfirm}
            </p>
            <div className="flex gap-2">
              <BigButton
                color="#EF4444"
                onClick={() => {
                  onReset();
                  setConfirming(false);
                }}
                className="flex-1 py-2"
              >
                {t.reset}
              </BigButton>
              <BigButton
                color="#94A3B8"
                onClick={() => setConfirming(false)}
                className="flex-1 py-2"
              >
                {t.cancel}
              </BigButton>
            </div>
          </div>
        )}
      </div>
    </ScreenShell>
  );
}


export function SettingRow({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white/90 rounded-2xl p-4 shadow flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-600" />
        <span className="font-bold text-slate-700">{label}</span>
      </div>
      <div
        className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${active ? "bg-green-400 justify-end" : "bg-slate-300 justify-start"}`}
      >
        <div className="w-4 h-4 rounded-full bg-white shadow" />
      </div>
    </button>
  );
}