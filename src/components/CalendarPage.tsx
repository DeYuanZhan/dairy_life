import { useMemo, useState } from "react";
import {
  MOODS,
  WEEKDAYS,
  keyOf,
  moodOf,
  monthHeat,
  todayKey,
  type LedgerIndex,
} from "../lib/core";
import { Icon, useReveal } from "./ui";

/* ---------------- 月历 ---------------- */

export function CalendarPage({
  index,
  onViewDay,
}: {
  index: LedgerIndex;
  onViewDay: (k: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [ref, inView] = useReveal<HTMLDivElement>();
  const weeks = useMemo(() => monthHeat(cursor, index), [cursor, index]);
  const tk = todayKey();

  const filledCount = weeks.flat().filter((c) => c?.filled).length;

  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} mt-6`}>
      <div className="rounded-xl border border-line bg-sheet p-5 shadow-[0_14px_30px_-22px_rgba(36,48,41,0.35)] sm:p-7">
        {/* 头部 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-num text-[10px] font-bold tracking-[0.3em] text-seal">CALENDAR</p>
            <h2 className="font-display mt-1 text-3xl font-black text-ink">
              {cursor.getFullYear()}年{cursor.getMonth() + 1}月
            </h2>
            <p className="mt-1 text-xs text-ink2">
              本月已记录 <b className="font-num text-ink">{filledCount}</b> 天 · 点击任意一天查看完整手账
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="上个月" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink2 transition-all hover:-translate-x-0.5 hover:border-ink/30 hover:text-ink">
              <Icon name="chevL" size={18} />
            </button>
            <button type="button" onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); onViewDay(tk); }} className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink2 transition-all hover:border-seal hover:text-seal">
              今天
            </button>
            <button type="button" aria-label="下个月" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink2 transition-all hover:translate-x-0.5 hover:border-ink/30 hover:text-ink">
              <Icon name="chevR" size={18} />
            </button>
          </div>
        </div>

        {/* 星期表头 */}
        <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {["一", "二", "三", "四", "五", "六", "日"].map((w, i) => (
            <p key={w} className={`text-center text-[11px] font-bold tracking-widest ${i >= 5 ? "text-seal/70" : "text-ink2"}`}>
              {w}
            </p>
          ))}
        </div>

        {/* 日期格 */}
        <div className="mt-1.5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {weeks.flat().map((cell, i) => {
            if (!cell) return <div key={`e${i}`} />;
            const isToday = cell.key === tk;
            const mood = cell.filled ? moodOf(index[cell.key]?.mood ?? null) : null;
            const bg =
              cell.score === null
                ? "#ffffff"
                : cell.score >= 80
                  ? "color-mix(in srgb, #2e6b54 88%, #ffffff)"
                  : cell.score >= 60
                    ? "color-mix(in srgb, #2e6b54 62%, #ffffff)"
                    : cell.score >= 40
                      ? "color-mix(in srgb, #2e6b54 38%, #ffffff)"
                      : "color-mix(in srgb, #2e6b54 16%, #ffffff)";
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => onViewDay(cell.key)}
                className={`group relative flex aspect-square flex-col items-center justify-center rounded-lg border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 sm:aspect-[5/4] ${
                  isToday ? "border-seal ring-2 ring-seal/30" : "border-line/80"
                }`}
                style={{ background: bg }}
              >
                <span className={`font-num text-sm font-bold sm:text-base ${cell.score !== null && cell.score >= 60 ? "text-white" : "text-ink"} ${isToday ? "text-seal" : ""}`}>
                  {cell.day}
                </span>
                <span className={`font-num text-[9px] font-bold sm:text-[10px] ${cell.score !== null && cell.score >= 60 ? "text-white/85" : "text-ink2/70"}`}>
                  {cell.filled ? cell.score : ""}
                </span>
                {mood && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full border border-white/60" style={{ background: mood.color }} title={mood.label} />
                )}
                {isToday && (
                  <span className="absolute left-1 top-1 rounded bg-seal px-1 text-[8px] font-bold text-white">今</span>
                )}
                <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-ink/0 text-[10px] font-bold text-white opacity-0 transition-all duration-200 group-hover:bg-ink/55 group-hover:opacity-100">
                  查看
                </span>
              </button>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dashed border-line pt-4 text-[10px] font-bold text-ink2">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-line" style={{ background: "#ffffff" }} /> 未记录
          </span>
          {[[80, "≥80"], [60, "60-79"], [40, "40-59"], [15, "<40"]].map(([v, lb]) => (
            <span key={lb} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: `color-mix(in srgb, #2e6b54 ${v}%, #ffffff)` }} /> {lb}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-2">
            情绪：
            {MOODS.map((m) => (
              <span key={m.key} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                {m.label}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 日详情头部（查看任意一天时用） ---------------- */

export function DayHeader({ date, isToday }: { date: Date; isToday: boolean }) {
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} relative mt-6 overflow-hidden rounded-xl border border-line bg-sheet px-6 py-5 shadow-[0_14px_30px_-22px_rgba(36,48,41,0.35)]`}>
      <div className="pointer-events-none absolute right-5 top-4 hidden select-none sm:block">
        <span className="font-display inline-block rotate-12 rounded-md border-[3px] border-pine/70 px-2 py-0.5 text-xl font-black text-pine/70">档案</span>
      </div>
      <p className="font-num text-[10px] font-bold tracking-[0.3em] text-pine">DAY ARCHIVE</p>
      <h1 className="font-display mt-1 text-4xl font-black leading-none text-ink">
        {date.getMonth() + 1}月{date.getDate()}日
        <span className="ml-3 align-middle text-base font-bold text-ink2">
          周{WEEKDAYS[date.getDay()]} {date.getFullYear()}
        </span>
      </h1>
      <p className="mt-2 text-xs text-ink2">
        {isToday ? "这就是今天，规划和复盘都从这一页开始。" : "回看这一天：所有模块都可以补记或修改，改动会自动保存。"}
      </p>
    </div>
  );
}

export { keyOf };
