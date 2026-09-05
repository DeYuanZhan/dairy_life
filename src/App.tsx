import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  WEEKDAYS,
  addDays,
  computeScore,
  exportAll,
  fmtCN,
  hasContent,
  importAll,
  isTodayKey,
  keyOf,
  lastNights,
  loadDay,
  loadIndex,
  parseKey,
  saveDay,
  sleepStats,
  toMarkdown,
  todayKey,
  trendOf,
  weekOf,
  type DayData,
  type LedgerIndex,
} from "./lib/core";
import { Icon, type IconName } from "./components/ui";
import { Banner, TopBar, WeekStrip, type WeekCell } from "./components/Header";
import { ActivitiesCard, LifeCard, MoodCard, RecordsCard, WorkCard } from "./components/ModulesA";
import { FitnessCard, ImageCard, ScoreCard, SleepCard, StudyCard } from "./components/ModulesB";
import { MonthHeat, TrendChart, WeekReview } from "./components/Insights";

interface Toast {
  id: number;
  msg: string;
  action?: { label: string; fn: () => void };
}

function ToolBtn({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-medium text-ink2 transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:text-ink hover:shadow-sm active:translate-y-0"
    >
      <Icon name={icon} size={13} strokeWidth={2.2} />
      {label}
    </button>
  );
}

export default function App() {
  const [dateKey, setDateKey] = useState<string>(todayKey());
  const [data, setData] = useState<DayData>(() => loadDay(todayKey()));
  const [index, setIndex] = useState<LedgerIndex>(() => loadIndex());
  const [saving, setSaving] = useState(false);
  const [savedLabel, setSavedLabel] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  /* ---------- toast（支持撤销动作） ---------- */
  const onToast = useCallback((msg: string, action?: Toast["action"]) => {
    setToast({ id: Date.now() + Math.random(), msg, action });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.action ? 5200 : 2400);
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

    let streak = 0;
    let cur = new Date();
    if (!filled(keyOf(cur))) cur = addDays(cur, -1);
    while (filled(keyOf(cur))) {
      streak++;
      cur = addDays(cur, -1);
    }

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

  /* ---------- 洞察数据 ---------- */
  const override = useMemo(() => ({ key: dateKey, data }), [dateKey, data]);
  const trend = useMemo(() => trendOf(dateKey, 14, override), [dateKey, override]);
  const nights = useMemo(() => lastNights(dateKey, 7, override), [dateKey, override]);
  const sStats = useMemo(() => sleepStats(nights), [nights]);
  const weekDates = useMemo(() => weekOf(date), [date]);
  const weekDays = useMemo(
    () => weekDates.map((dd) => (keyOf(dd) === dateKey ? data : loadDay(keyOf(dd)))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekDates, dateKey, data, index]
  );

  /* ---------- 数据管理 ---------- */
  const copyMarkdown = () => {
    const md = toMarkdown(data, date);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(md)
        .then(() => onToast("Markdown 日记已复制到剪贴板"))
        .catch(() => onToast("复制失败，请重试"));
    } else {
      onToast("当前环境不支持复制");
    }
  };

  const onExport = () => {
    try {
      saveDay(dateKey, data);
      exportAll();
      onToast("已导出全部数据（JSON 备份）");
    } catch {
      onToast("导出失败，请重试");
    }
  };

  const onImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const n = importAll(String(r.result));
        setIndex(loadIndex());
        setData(loadDay(dateKey));
        onToast(n ? `已导入 ${n} 天的记录` : "文件里没有可导入的数据");
      } catch {
        onToast("导入失败：文件格式不正确");
      }
    };
    r.readAsText(f);
    e.target.value = "";
  };

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
        <Banner
          date={date}
          score={score}
          mood={data.mood}
          onMood={(m) => up((dd) => void (dd.mood = m))}
          stats={stats}
          weather={data.weather}
          place={data.place}
          onWeather={(w) => up((dd) => void (dd.weather = w))}
          onPlace={(s) => up((dd) => void (dd.place = s))}
        />

        <WeekStrip week={week} onPick={switchDate} />

        {/* 九大模块 */}
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <WorkCard d={data} up={up} notify={onToast} />
          <StudyCard d={data} up={up} />
          <SleepCard d={data} up={up} nights={nights} sStats={sStats} />
          <LifeCard d={data} up={up} />
          <FitnessCard d={data} up={up} />
          <ImageCard d={data} up={up} />
          <ActivitiesCard d={data} up={up} notify={onToast} />
          <RecordsCard d={data} up={up} />
          <MoodCard d={data} up={up} />
          <ScoreCard d={data} up={up} date={date} onToast={onToast} />
        </div>

        {/* 数据洞察 */}
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-black tracking-tight text-ink">
                数据洞察
                <span className="font-num ml-2 text-[11px] font-medium tracking-[0.26em] text-ink2/70">
                  INSIGHTS
                </span>
              </h2>
              <p className="mt-1 text-xs text-ink2">趋势 · 热力 · 复盘，看见自己的节奏</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ToolBtn icon="pen" label="复制 Markdown" onClick={copyMarkdown} />
              <ToolBtn icon="download" label="导出备份" onClick={onExport} />
              <ToolBtn icon="upload" label="导入备份" onClick={() => fileRef.current?.click()} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <TrendChart points={trend} />
            </div>
            <div className="lg:col-span-5">
              <MonthHeat base={date} index={index} selectedKey={dateKey} onSelect={switchDate} />
            </div>
            <div className="lg:col-span-12">
              <WeekReview week={weekDates} days={weekDays} />
            </div>
          </div>
        </section>

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
            数据保存在本地浏览器，隐私只属于你；建议定期「导出备份」，换设备时「导入备份」即可恢复。
            <br />
            认真过好的每一天，都值得被打分。
          </p>
          <p className="font-num text-[10px] tracking-[0.3em] text-ink2/60">
            PLAN · LIVE · RECORD · SLEEP · STUDY · TRAIN · GLOW
          </p>
        </footer>
      </main>

      {/* 隐藏的文件输入（导入备份） */}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onImportFile}
      />

      {/* Toast */}
      {toast && (
        <div key={toast.id} className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4">
          <div className="toast-in pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink py-3 pl-5 pr-3 text-sm font-bold text-paper shadow-[0_16px_40px_-12px_rgba(36,48,41,0.6)]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-pine text-white">
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
                className="ml-1 rounded-full bg-paper/15 px-3 py-1 text-xs font-bold text-gold transition-colors hover:bg-paper/25"
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
