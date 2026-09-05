import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import confetti from "canvas-confetti";
import {
  MODULE_KEYS,
  WEEKDAYS,
  addDays,
  computeScore,
  fmtCN,
  hasContent,
  isTodayKey,
  keyOf,
  loadDay,
  loadIndex,
  loadSettings,
  parseKey,
  saveDay,
  saveSettings,
  sleepSeries,
  todayKey,
  weekOf,
  type DayData,
  type LedgerIndex,
  type ModuleKey,
  type Settings,
} from "./lib/core";
import { Icon, useReveal, type IconName } from "./components/ui";
import { TopBar, TodayHero, type Phase } from "./components/Header";
import {
  FitnessCard,
  MoodCard,
  SleepCard,
  StudyCard,
  WorkCard,
  type Notify,
} from "./components/ModulesA";
import { ActivitiesCard, ImageCard, LifeCard, RecordsCard, ScoreCard } from "./components/ModulesB";
import { CalendarPage, DayHeader } from "./components/CalendarPage";
import { StatsPage } from "./components/StatsPage";
import { SettingsPage } from "./components/SettingsPage";

type Tab = "home" | "calendar" | "stats" | "settings";

interface ToastState {
  id: number;
  msg: string;
  action?: { label: string; fn: () => void };
}

const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: "home", label: "首页", icon: "home" },
  { key: "calendar", label: "日历", icon: "calendar" },
  { key: "stats", label: "统计", icon: "chart" },
  { key: "settings", label: "设置", icon: "gear" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [viewDay, setViewDay] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>(() => (new Date().getHours() < 18 ? "plan" : "review"));

  const [editKey, setEditKey] = useState<string>(todayKey());
  const [data, setData] = useState<DayData>(() => loadDay(todayKey()));
  const [index, setIndex] = useState<LedgerIndex>(() => loadIndex());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [saving, setSaving] = useState(false);
  const [savedLabel, setSavedLabel] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [quickText, setQuickText] = useState("");

  const date = useMemo(() => parseKey(editKey), [editKey]);
  const enabled = useMemo(
    () => MODULE_KEYS.filter((k) => settings.modules[k]),
    [settings]
  );
  const score = useMemo(
    () => computeScore(data, settings.weights, enabled),
    [data, settings.weights, enabled]
  );
  const nights = useMemo(() => sleepSeries(index, editKey, 7), [index, editKey]);

  /* ---------- 切换编辑日期 ---------- */
  const openDay = useCallback((k: string) => {
    setEditKey(k);
    setData(loadDay(k));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* 首页固定编辑今天；跨零点自动切换 */
  useEffect(() => {
    const t = setInterval(() => {
      if (!viewDay && editKey !== todayKey()) openDay(todayKey());
    }, 60_000);
    return () => clearInterval(t);
  }, [viewDay, editKey, openDay]);

  /* 键盘 ← / → 在日详情翻页 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!viewDay) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      openDay(keyOf(addDays(date, e.key === "ArrowLeft" ? -1 : 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewDay, date, openDay]);

  /* ---------- 自动保存 ---------- */
  useEffect(() => {
    setSaving(true);
    const t = setTimeout(() => {
      saveDay(editKey, data);
      setIndex(loadIndex());
      setSaving(false);
      setSavedLabel(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
    }, 500);
    return () => clearTimeout(t);
  }, [data, editKey]);

  /* ---------- 更新器 / toast ---------- */
  const up = useCallback((mut: (d: DayData) => void) => {
    setData((prev) => {
      const draft: DayData = structuredClone(prev);
      mut(draft);
      return draft;
    });
  }, []);

  const notify: Notify = useCallback((msg, action) => {
    setToast({ id: Date.now(), msg, action });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.action ? 5000 : 2400);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- 85+ 撒花庆祝（每日一次） ---------- */
  const scoreTrack = useRef<{ k: string; s: number } | null>(null);
  const celebrated = useRef<string>("");
  useEffect(() => {
    const prev = scoreTrack.current;
    scoreTrack.current = { k: editKey, s: score.total };
    if (!prev || prev.k !== editKey) return;
    if (score.total >= 85 && prev.s < 85 && celebrated.current !== editKey) {
      celebrated.current = editKey;
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        confetti({
          particleCount: 130,
          spread: 78,
          origin: { y: 0.55 },
          colors: ["#d9482b", "#e8a33d", "#2e6b54", "#fffdf7", "#46639e"],
        });
      }
      setToast({ id: Date.now(), msg: "状态分冲上 85+，闪闪发光的一天！" });
    }
  }, [score.total, editKey]);

  /* ---------- 提醒 ---------- */
  const notifiedRef = useRef<{ m: string; e: string }>({ m: "", e: "" });
  useEffect(() => {
    if (!settings.reminders.morning && !settings.reminders.evening) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const t = setInterval(() => {
      const now = new Date();
      const day = todayKey();
      const hm = now.getHours() * 60 + now.getMinutes();
      const idx = loadIndex();
      const filledToday = !!idx[day]?.filled;
      if (settings.reminders.morning && hm >= 8 * 60 && hm < 8 * 60 + 30 && notifiedRef.current.m !== day) {
        notifiedRef.current.m = day;
        new Notification("一日手账 · 晨间规划", { body: "花 3 分钟把今天安排明白：目标、待办、学习计划。" });
      }
      if (settings.reminders.evening && hm >= 21 * 60 + 30 && hm < 22 * 60 && notifiedRef.current.e !== day && !filledToday) {
        notifiedRef.current.e = day;
        new Notification("一日手账 · 晚间复盘", { body: "今天过得怎么样？记录一下，给今天打个分。" });
      }
    }, 30_000);
    return () => clearInterval(t);
  }, [settings.reminders]);

  /* ---------- 统计 ---------- */
  const stats = useMemo(() => {
    const filled = (k: string) => !!index[k]?.filled;
    let streak = 0;
    let cur = new Date();
    if (!filled(keyOf(cur))) cur = addDays(cur, -1);
    while (filled(keyOf(cur))) {
      streak++;
      cur = addDays(cur, -1);
    }
    const scores = weekOf(date)
      .map((d2) => {
        const m = index[keyOf(d2)];
        return m?.filled ? m.score : null;
      })
      .filter((v): v is number => v !== null);
    const weekAvg = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
    const count = Object.values(index).filter((m) => m?.filled).length;
    return { streak, weekAvg, count };
  }, [index, date]);

  const sleepLine = useMemo(() => {
    if (data.sleep.actBed && data.sleep.actWake) {
      const last = nights[nights.length - 1];
      return last?.hours ? `昨晚睡了 ${last.hours}h` : "已记录实际睡眠";
    }
    if (data.sleep.planBed && data.sleep.planWake) return "已规划今晚睡眠";
    return "睡眠待记录";
  }, [data.sleep, nights]);

  const onViewDay = useCallback(
    (k: string) => {
      setViewDay(k);
      openDay(k);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [openDay]
  );

  /* ---------- 快速随笔 ---------- */
  const saveQuick = () => {
    const t = quickText.trim();
    if (!t) return;
    up((dd) => {
      dd.recordNote = dd.recordNote ? `${dd.recordNote}\n${t}` : t;
    });
    setQuickText("");
    setFabOpen(false);
    notify("随笔已记入今日「生活记录」");
  };

  const showHome = tab === "home" && !viewDay;

  /* 模块卡片渲染（首页按时段 / 日详情全量） */
  const renderModules = (mode: Phase | "all") => {
    const has = (k: ModuleKey) => enabled.includes(k);
    const grid = "mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3";
    const cards: ReactNode[] = [];
    if (has("work")) cards.push(<WorkCard key="work" d={data} date={date} up={up} notify={notify} phase={mode} />);
    if (has("study")) cards.push(<StudyCard key="study" d={data} date={date} up={up} phase={mode} />);
    if (has("sleep")) cards.push(<SleepCard key="sleep" d={data} up={up} phase={mode} nights={nights} />);
    if (mode === "review" || mode === "all") {
      if (has("life")) cards.push(<LifeCard key="life" d={data} up={up} phase={mode} spendingOn={settings.spending} notify={notify} />);
      if (has("activities")) cards.push(<ActivitiesCard key="act" d={data} up={up} notify={notify} phase={mode} />);
    }
    if (has("fitness")) cards.push(<FitnessCard key="fit" d={data} up={up} phase={mode} />);
    if (has("image")) cards.push(<ImageCard key="img" d={data} up={up} notify={notify} phase={mode} />);
    if (mode === "plan" && (has("life") || has("activities"))) {
      if (has("activities")) cards.push(<ActivitiesCard key="act-plan" d={data} up={up} notify={notify} phase="plan" />);
      if (has("life")) cards.push(<LifeCard key="life-plan" d={data} up={up} phase="plan" spendingOn={settings.spending} notify={notify} />);
    }
    if (mode === "review" || mode === "all") {
      if (has("records")) cards.push(<RecordsCard key="rec" d={data} up={up} notify={notify} />);
      if (has("mood")) cards.push(<MoodCard key="mood" d={data} up={up} phase={mode} index={index} />);
    }
    if (mode === "plan" && cards.length === 0) {
      return (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-sheet/60 px-6 py-10 text-center">
          <p className="font-display text-lg font-bold text-ink2">所有模块都被关闭了</p>
          <p className="mt-1 text-xs text-ink2">去「设置」里打开至少一个模块，这一页才会热闹起来。</p>
        </div>
      );
    }
    const withScore =
      mode === "plan" ? (
        cards
      ) : (
        <>
          {cards}
          <ScoreCard d={data} up={up} date={date} score={score} settings={settings} onToast={notify} />
        </>
      );
    return <div className={grid}>{withScore}</div>;
  };

  return (
    <div className="relative min-h-screen pb-24">
      {/* 环境漂浮层 */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="animate-float absolute -left-24 top-1/3 h-96 w-96 rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle, rgba(232,163,61,0.16), transparent 65%)" }} />
        <div className="animate-float2 absolute -right-28 top-2/3 h-[28rem] w-[28rem] rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle, rgba(46,107,84,0.14), transparent 65%)" }} />
      </div>

      <TopBar
        date={date}
        saving={saving}
        savedLabel={savedLabel}
        dayView={!!viewDay}
        onShift={viewDay ? (n) => openDay(keyOf(addDays(date, n))) : undefined}
        onBack={viewDay ? () => setViewDay(null) : undefined}
      />

      <main className="mx-auto max-w-6xl px-4 pb-10 lg:px-6">
        {/* ---------- 首页 ---------- */}
        {showHome && (
          <>
            <TodayHero
              date={date}
              phase={phase}
              onPhase={setPhase}
              score={score}
              mood={data.mood}
              onMood={(m) => up((dd) => void (dd.mood = m))}
              weather={data.weather}
              onWeather={(w) => up((dd) => void (dd.weather = w))}
              place={data.place}
              onPlace={(s) => up((dd) => void (dd.place = s))}
              stats={stats}
              sleepLine={sleepLine}
            />
            {renderModules(phase)}
          </>
        )}

        {/* ---------- 日详情 ---------- */}
        {viewDay && (
          <>
            <DayHeader date={date} isToday={isTodayKey(editKey)} />
            {renderModules("all")}
          </>
        )}

        {/* ---------- 日历 ---------- */}
        {tab === "calendar" && !viewDay && <CalendarPage index={index} onViewDay={onViewDay} />}

        {/* ---------- 统计 ---------- */}
        {tab === "stats" && !viewDay && <StatsPage index={index} enabled={enabled} onViewDay={onViewDay} />}

        {/* ---------- 设置 ---------- */}
        {tab === "settings" && !viewDay && (
          <SettingsPage
            settings={settings}
            onSettings={(s) => {
              setSettings(s);
              saveSettings(s);
            }}
            notify={notify}
            onDataChanged={() => {
              setIndex(loadIndex());
              setData(loadDay(editKey));
              setSettings(loadSettings());
            }}
          />
        )}

        <footer className="mt-14 flex flex-col items-center gap-2 border-t border-dashed border-line pt-8 text-center">
          <span className="font-display grid h-9 w-9 -rotate-3 place-items-center rounded-md bg-seal text-lg font-black text-[#fff7ee] shadow-md ring-2 ring-[#fff7ee]">记</span>
          <p className="font-display text-sm font-bold text-ink">一日手账 · DAY LEDGER</p>
          <p className="max-w-md text-xs leading-relaxed text-ink2">
            早上规划，晚上复盘；数据保存在本地浏览器，隐私只属于你。
            <br />
            认真过好的每一天，都值得被打分。
          </p>
        </footer>
      </main>

      {/* ---------- 悬浮速记 ---------- */}
      {!viewDay && tab === "home" && (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 sm:right-6">
          {fabOpen && (
            <div className="toast-in w-72 rounded-xl border border-line bg-sheet p-3.5 shadow-[0_20px_50px_-20px_rgba(36,48,41,0.5)]">
              <p className="lbl !mb-1.5">
                <Icon name="pen" size={12} strokeWidth={2.4} className="text-gold" />
                快速随笔 · {fmtCN(date)}
              </p>
              <textarea
                autoFocus
                className="inp resize-none"
                rows={3}
                placeholder="灵感、碎碎念、值得记一笔的瞬间…"
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveQuick();
                }}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setFabOpen(false)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-ink2 transition-colors hover:bg-white">
                  取消
                </button>
                <button type="button" onClick={saveQuick} disabled={!quickText.trim()} className="rounded-lg bg-seal px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0">
                  记一笔
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            aria-label="快速随笔"
            onClick={() => setFabOpen((v) => !v)}
            className="relative grid h-14 w-14 place-items-center rounded-full bg-seal text-white shadow-[0_14px_30px_-10px_rgba(217,72,43,0.8)] transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95"
          >
            <span className="absolute inset-0 -z-10 rounded-full bg-seal/40 fab-ping" />
            <Icon name={fabOpen ? "x" : "pen"} size={22} strokeWidth={2.2} />
          </button>
        </div>
      )}

      {/* ---------- 底部页签栏 ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-sheet/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {TABS.map((t) => {
            const active = tab === t.key && !viewDay;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setViewDay(null);
                  if (t.key === "home") openDay(todayKey());
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group relative flex flex-col items-center gap-0.5 py-2.5 transition-colors"
              >
                <span
                  className={`absolute top-0 h-0.5 w-8 rounded-full transition-all duration-300 ${active ? "bg-seal" : "bg-transparent"}`}
                />
                <span
                  className={`grid h-8 w-12 place-items-center rounded-full transition-all duration-300 ${active ? "bg-seal/15 text-seal" : "text-ink2 group-hover:text-ink"}`}
                  style={active ? { transform: "translateY(-2px)" } : undefined}
                >
                  <Icon name={t.icon} size={19} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                <span className={`text-[10px] font-bold transition-colors ${active ? "text-seal" : "text-ink2"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ---------- Toast ---------- */}
      {toast && (
        <div key={toast.id} className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <div className="toast-in pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink py-2.5 pl-5 pr-3 text-sm font-bold text-paper shadow-[0_16px_40px_-12px_rgba(36,48,41,0.6)]">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pine text-white">
              <Icon name="check" size={12} strokeWidth={3.2} />
            </span>
            {toast.msg}
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.fn();
                  setToast(null);
                }}
                className="ml-1 rounded-full bg-paper/15 px-3 py-1 text-xs font-bold text-gold transition-all hover:bg-paper/25"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* 让 useReveal 在 App 层也可用（保留导入一致性） */
export { useReveal };
