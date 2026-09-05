import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  WEEKDAYS,
  addDays,
  computeScore,
  fmtCN,
  hasContent,
  isTodayKey,
  keyOf,
  loadDay,
  loadIndex,
  parseKey,
  saveDay,
  todayKey,
  weekOf,
  type DayData,
  type LedgerIndex,
} from "./lib/core";
import { Icon } from "./components/ui";
import { Banner, TopBar, WeekStrip, type WeekCell } from "./components/Header";
import { ActivitiesCard, LifeCard, MoodCard, RecordsCard, WorkCard } from "./components/ModulesA";
import { FitnessCard, ImageCard, ScoreCard, SleepCard, StudyCard } from "./components/ModulesB";

interface Toast {
  id: number;
  msg: string;
}

export default function App() {
  const [dateKey, setDateKey] = useState<string>(todayKey());
  const [data, setData] = useState<DayData>(() => loadDay(todayKey()));
  const [index, setIndex] = useState<LedgerIndex>(() => loadIndex());
  const [saving, setSaving] = useState(false);
  const [savedLabel, setSavedLabel] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const date = useMemo(() => parseKey(dateKey), [dateKey]);
  const score = useMemo(() => computeScore(data), [data]);

  /* ---------- 日期切换 ---------- */
  const switchDate = useCallback(
    (k: string) => {
      if (k === dateKey) return;
      setDateKey(k);
      setData(loadDay(k));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dateKey]
  );

  const shift = useCallback((n: number) => switchDate(keyOf(addDays(date, n))), [date, switchDate]);

  /* 键盘 ← / → 切换日期 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      shift(e.key === "ArrowLeft" ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shift]);

  /* ---------- 自动保存（防抖） ---------- */
  useEffect(() => {
    setSaving(true);
    const t = setTimeout(() => {
      saveDay(dateKey, data);
      setIndex(loadIndex());
      setSaving(false);
      setSavedLabel(
        new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      );
    }, 500);
    return () => clearTimeout(t);
  }, [data, dateKey]);

  /* ---------- 数据更新器 ---------- */
  const up = useCallback((mut: (d: DayData) => void) => {
    setData((prev) => {
      const draft: DayData = structuredClone(prev);
      mut(draft);
      return draft;
    });
  }, []);

  /* ---------- toast ---------- */
  const onToast = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- 周视图数据 ---------- */
  const week: WeekCell[] = useMemo(() => {
    const liveFilled = hasContent(data);
    return weekOf(date).map((d) => {
      const k = keyOf(d);
      const meta = index[k];
      const isSel = k === dateKey;
      return {
        key: k,
        label: `周${WEEKDAYS[d.getDay()]}`,
        num: d.getDate(),
        score: isSel ? score.total : meta?.score ?? 0,
        filled: isSel ? liveFilled : meta?.filled ?? false,
        isToday: isTodayKey(k),
        active: isSel,
      };
    });
  }, [date, dateKey, index, score, data]);

  /* ---------- 统计 ---------- */
  const stats = useMemo(() => {
    const liveFilled = hasContent(data);
    const filled = (k: string) => (k === dateKey ? liveFilled || !!index[k]?.filled : !!index[k]?.filled);

    // 连续记录
    let streak = 0;
    let cur = new Date();
    if (!filled(keyOf(cur))) cur = addDays(cur, -1);
    while (filled(keyOf(cur))) {
      streak++;
      cur = addDays(cur, -1);
    }

    // 本周均分（基于所选日期的那一周）
    const scores = weekOf(date)
      .map((d) => {
        const k = keyOf(d);
        if (k === dateKey) return liveFilled ? score.total : null;
        const m = index[k];
        return m?.filled ? m.score : null;
      })
      .filter((v): v is number => v !== null);
    const weekAvg = scores.length
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      : null;

    const countSet = new Set(Object.keys(index).filter((k) => index[k]?.filled));
    if (liveFilled) countSet.add(dateKey);

    return { streak, weekAvg, count: countSet.size };
  }, [date, dateKey, index, data, score]);

  const today = isTodayKey(dateKey);

  return (
    <div className="relative min-h-screen">
      {/* 环境漂浮层 */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="animate-float absolute -left-24 top-1/3 h-96 w-96 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(232,163,61,0.16), transparent 65%)" }}
        />
        <div
          className="animate-float2 absolute -right-28 top-2/3 h-[28rem] w-[28rem] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(46,107,84,0.14), transparent 65%)" }}
        />
      </div>

      <TopBar
        date={date}
        dateKey={dateKey}
        onShift={shift}
        onToday={() => switchDate(todayKey())}
        saving={saving}
        savedLabel={savedLabel}
      />

      <main className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
        <Banner date={date} score={score} mood={data.mood} onMood={(m) => up((dd) => void (dd.mood = m))} stats={stats} />

        <WeekStrip week={week} onPick={switchDate} />

        {/* 九大模块 */}
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <WorkCard d={data} up={up} />
          <StudyCard d={data} up={up} />
          <SleepCard d={data} up={up} />
          <LifeCard d={data} up={up} />
          <FitnessCard d={data} up={up} />
          <ImageCard d={data} up={up} />
          <ActivitiesCard d={data} up={up} />
          <RecordsCard d={data} up={up} />
          <MoodCard d={data} up={up} />
          <ScoreCard d={data} up={up} date={date} onToast={onToast} />
        </div>

        {!today && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => switchDate(todayKey())}
              className="group flex items-center gap-2 rounded-full border border-line bg-sheet px-5 py-2.5 text-sm font-bold text-ink2 transition-all hover:-translate-y-0.5 hover:border-seal hover:text-seal hover:shadow-md"
            >
              <Icon name="calendar" size={16} />
              你正在回看 {fmtCN(date)} · 点击回到今天
            </button>
          </div>
        )}

        <footer className="mt-14 flex flex-col items-center gap-2 border-t border-dashed border-line pt-8 text-center">
          <span className="font-display grid h-9 w-9 -rotate-3 place-items-center rounded-md bg-seal text-lg font-black text-[#fff7ee] shadow-md ring-2 ring-[#fff7ee]">
            记
          </span>
          <p className="font-display text-sm font-bold text-ink">一日手账 · DAY LEDGER</p>
          <p className="max-w-md text-xs leading-relaxed text-ink2">
            数据保存在本地浏览器，隐私只属于你。
            <br />
            认真过好的每一天，都值得被打分。
          </p>
          <p className="font-num text-[10px] tracking-[0.3em] text-ink2/60">
            PLAN · LIVE · RECORD · SLEEP · STUDY · TRAIN · GLOW
          </p>
        </footer>
      </main>

      {/* Toast */}
      {toast && (
        <div key={toast.id} className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4">
          <div className="toast-in flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper shadow-[0_16px_40px_-12px_rgba(36,48,41,0.6)]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-pine text-white">
              <Icon name="check" size={12} strokeWidth={3.2} />
            </span>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
