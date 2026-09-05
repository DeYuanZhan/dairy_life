import {
  MOODS,
  WEEKDAYS,
  dayOfYear,
  fmtCN,
  greeting,
  isTodayKey,
  moodOf,
  type DayScore,
  type MoodKey,
} from "../lib/core";
import { Bar, Icon, MoodFace, Ring, useReveal } from "./ui";

export interface WeekCell {
  key: string;
  label: string;
  num: number;
  score: number;
  filled: boolean;
  isToday: boolean;
  active: boolean;
}

/* ---------------- 顶部导航栏 ---------------- */

export function TopBar({
  date,
  dateKey,
  onShift,
  onToday,
  saving,
  savedLabel,
}: {
  date: Date;
  dateKey: string;
  onShift: (n: number) => void;
  onToday: () => void;
  saving: boolean;
  savedLabel: string | null;
}) {
  const today = isTodayKey(dateKey);
  return (
    <div className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 lg:px-6">
        {/* 品牌 */}
        <div className="flex items-center gap-3">
          <span className="font-display grid h-10 w-10 rotate-3 place-items-center rounded-md bg-seal text-xl font-black text-[#fff7ee] shadow-[0_6px_14px_-6px_rgba(217,72,43,0.7)] ring-2 ring-[#fff7ee] ring-offset-2 ring-offset-paper transition-transform duration-300 hover:rotate-0">
            记
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-black tracking-wide">一日手账</p>
            <p className="font-num text-[10px] font-medium tracking-[0.3em] text-ink2">
              DAY LEDGER
            </p>
          </div>
        </div>

        <div className="flex-1" />

        {/* 日期导航 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="前一天"
            onClick={() => onShift(-1)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-sheet text-ink2 transition-all hover:-translate-x-0.5 hover:border-ink/30 hover:text-ink active:translate-x-0"
          >
            <Icon name="chevL" size={18} />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="flex items-center gap-2 rounded-lg border border-line bg-sheet px-3 py-1.5 transition-all hover:border-ink/30 hover:shadow-sm"
            title="点击回到今天"
          >
            <Icon name="calendar" size={15} className="text-seal" />
            <span className="font-num text-sm font-bold tracking-wide">
              {String(date.getMonth() + 1).padStart(2, "0")}-{String(date.getDate()).padStart(2, "0")}
            </span>
            <span className="text-xs font-medium text-ink2">周{WEEKDAYS[date.getDay()]}</span>
          </button>
          <button
            type="button"
            aria-label="后一天"
            onClick={() => onShift(1)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-sheet text-ink2 transition-all hover:translate-x-0.5 hover:border-ink/30 hover:text-ink active:translate-x-0"
          >
            <Icon name="chevR" size={18} />
          </button>
        </div>

        {!today && (
          <button
            type="button"
            onClick={onToday}
            className="rounded-lg bg-ink px-3 py-2 text-xs font-bold text-paper shadow-sm transition-all hover:-translate-y-0.5 hover:bg-seal active:translate-y-0"
          >
            回到今天
          </button>
        )}

        {/* 保存状态 */}
        <div className="hidden items-center gap-1.5 pl-2 text-xs text-ink2 sm:flex">
          <span
            className={`h-2 w-2 rounded-full ${saving ? "blink bg-gold" : "bg-pine"}`}
            style={{ transition: "background .3s" }}
          />
          {saving ? "记录中…" : savedLabel ? `已保存 ${savedLabel}` : "自动保存"}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 今日总览 ---------------- */

export function Banner({
  date,
  score,
  mood,
  onMood,
  stats,
}: {
  date: Date;
  score: DayScore;
  mood: MoodKey | null;
  onMood: (m: MoodKey) => void;
  stats: { streak: number; weekAvg: number | null; count: number };
}) {
  const [ref, inView] = useReveal<HTMLDivElement>();
  const moodDef = moodOf(mood);
  const hour = new Date().getHours();
  const ringColor = moodDef?.color ?? "#d9482b";

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in" : ""} relative mt-6 overflow-hidden rounded-xl border border-line bg-sheet shadow-[0_20px_50px_-30px_rgba(36,48,41,0.4)]`}
    >
      {/* 装饰层 */}
      <div className="animate-spin-slow pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[3px] border-dashed border-gold/40" />
      <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-pine/8" />
      <div className="pointer-events-none absolute right-6 top-5 hidden select-none md:block">
        <span className="font-display inline-block rotate-12 rounded-md border-[3px] border-seal/80 px-2.5 py-1 text-2xl font-black text-seal/80">
          今日
        </span>
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(36,48,41,0.06) 1px, transparent 1.3px)",
          backgroundSize: "18px 18px",
          maskImage: "linear-gradient(105deg, black 0%, transparent 55%)",
          WebkitMaskImage: "linear-gradient(105deg, black 0%, transparent 55%)",
        }}
      />

      <div className="relative grid gap-8 px-6 py-7 md:grid-cols-[1fr_auto] md:px-8 lg:grid-cols-[1.15fr_auto_auto]">
        {/* 日期区 */}
        <div>
          <p className="font-num text-[11px] font-bold tracking-[0.34em] text-seal">
            TODAY · {date.getFullYear()}
          </p>
          <h1 className="font-display mt-2 text-5xl font-black leading-none tracking-tight sm:text-6xl">
            {fmtCN(date)}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink2">
            <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-paper">
              周{WEEKDAYS[date.getDay()]}
            </span>
            <span>
              今年第 <b className="font-num text-ink">{dayOfYear(date)}</b> 天
            </span>
            {isTodayKey(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`) && (
              <span className="rounded-md border border-seal/40 bg-seal/10 px-2 py-0.5 text-xs font-bold text-seal">
                就是今天
              </span>
            )}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line bg-white/70 px-3 py-2 text-sm font-medium text-ink">
            <Icon name="pen" size={15} className="text-gold" strokeWidth={2.2} />
            {greeting(hour)}
          </p>

          {/* 统计胶囊 */}
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink2 transition-colors hover:border-seal/50">
              <Icon name="flame" size={14} className="text-seal" strokeWidth={2.2} />
              连续记录
              <b className="font-num text-sm text-ink">{stats.streak}</b>天
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink2 transition-colors hover:border-pine/50">
              <Icon name="gauge" size={14} className="text-pine" strokeWidth={2.2} />
              本周均分
              <b className="font-num text-sm text-ink">{stats.weekAvg ?? "—"}</b>
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink2 transition-colors hover:border-gold/60">
              <Icon name="star" size={14} className="text-gold" strokeWidth={2.2} />
              累计记录
              <b className="font-num text-sm text-ink">{stats.count}</b>天
            </span>
          </div>
        </div>

        {/* 心情打卡 */}
        <div className="md:border-l md:border-dashed md:border-line md:pl-8 lg:border-none lg:pl-0">
          <p className="lbl">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-seal" />
            此刻心情 · 点一下打卡
          </p>
          <div className="flex gap-2.5">
            {MOODS.map((m) => {
              const active = mood === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => onMood(m.key)}
                  aria-pressed={active}
                  className="group flex flex-col items-center gap-1"
                  title={m.label}
                >
                  <span
                    key={active ? `${m.key}-on` : `${m.key}-off`}
                    className={`${active ? "face-pop" : ""} grid place-items-center rounded-full border-2 p-1.5 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md`}
                    style={{
                      borderColor: active ? m.color : "transparent",
                      background: active
                        ? `color-mix(in srgb, ${m.color} 10%, #ffffff)`
                        : "#ffffff",
                      boxShadow: active ? `0 8px 18px -8px ${m.color}` : "0 1px 3px rgba(36,48,41,.08)",
                    }}
                  >
                    <MoodFace mood={m.key} size={30} active={active} color={m.color} />
                  </span>
                  <span
                    className="text-[11px] font-bold transition-colors"
                    style={{ color: active ? m.color : "#9a9484" }}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 max-w-[220px] text-xs leading-relaxed text-ink2">
            {moodDef ? (
              <>
                已记下「<b style={{ color: moodDef.color }}>{moodDef.label}</b>」，心情会计入今日评分。
              </>
            ) : (
              "选一个最贴近现在的表情，失落也没关系。"
            )}
          </p>
        </div>

        {/* 评分环 */}
        <div className="flex items-center gap-5 border-t border-dashed border-line pt-6 md:flex-col md:items-center md:border-l md:border-t-0 md:pl-8 md:pt-0 lg:pl-2">
          <div className="relative">
            <Ring value={score.total} size={148} stroke={11} color={ringColor} track="#eee8d9">
              <div className="text-center">
                <p className="font-num text-[44px] font-bold leading-none" style={{ color: ringColor }}>
                  {score.total}
                </p>
                <p className="mt-1 text-[11px] font-bold tracking-[0.2em] text-ink2">状态分</p>
              </div>
            </Ring>
          </div>
          <div className="text-center md:mt-1">
            <p className="text-xs font-bold text-ink">今日状态</p>
            <p className="mt-0.5 max-w-[150px] text-[11px] leading-relaxed text-ink2">
              由九个维度的记录综合计算
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 周视图 ---------------- */

export function WeekStrip({ week, onPick }: { week: WeekCell[]; onPick: (k: string) => void }) {
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} mt-5`}>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="lbl !mb-0">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-pine" />
          本周概览 · 点击切换日期
        </p>
        <p className="text-[11px] text-ink2">
          柱高 = 当日状态分
        </p>
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {week.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => onPick(d.key)}
            className={`group relative flex flex-col items-center rounded-xl border px-1 pb-2.5 pt-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
              d.active
                ? "border-ink bg-ink text-paper shadow-[0_10px_22px_-12px_rgba(36,48,41,0.7)]"
                : "border-line bg-sheet text-ink hover:border-ink/35"
            }`}
          >
            {d.isToday && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-seal" />
            )}
            <span className={`text-[10px] font-bold ${d.active ? "text-paper/70" : "text-ink2"}`}>
              {d.label}
            </span>
            <span className={`font-num mt-0.5 text-lg font-bold leading-none ${d.active ? "text-paper" : ""}`}>
              {d.num}
            </span>
            <span className="mt-2 flex h-8 w-full max-w-[26px] items-end overflow-hidden rounded-full bg-black/5">
              <Bar
                value={d.score}
                color={d.active ? "#e8a33d" : d.filled ? "#2e6b54" : "#d8d2c2"}
                height={Math.max(4, (d.score / 100) * 32)}
                className="!bg-transparent"
              />
            </span>
            <span
              className={`font-num mt-1 text-[10px] font-bold ${
                d.active ? "text-gold" : d.filled ? "text-pine" : "text-ink2/50"
              }`}
            >
              {d.filled || d.active ? d.score : "·"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
