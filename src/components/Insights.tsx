import { useMemo, useState } from "react";
import {
  MOODS,
  MODULES,
  MODULE_TIPS,
  fmtCN,
  fmtDur,
  keyOf,
  moodOf,
  parseKey,
  reviewOfDays,
  todayKey,
  type DayData,
  type LedgerIndex,
  type TrendPoint,
} from "../lib/core";
import { Bar, MoodFace, useReveal } from "./ui";

/* ---------------- 平滑曲线 ---------------- */

function smoothPath(pts: { x: number; y: number }[]): string {
  if (!pts.length) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ---------------- 14 天趋势 ---------------- */

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const [ref, inView] = useReveal<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const W = 560;
  const H = 210;
  const PL = 34;
  const PR = 14;
  const PT = 16;
  const PB = 30;
  const iw = W - PL - PR;
  const ih = H - PT - PB;
  const n = points.length;
  const xs = points.map((_, i) => PL + (i / (n - 1)) * iw);
  const yOf = (v: number) => PT + (1 - v / 100) * ih;

  const valid = points.map((p, i) => ({ p, i })).filter((x) => x.p.score !== null);
  const pts = valid.map((x) => ({ x: xs[x.i], y: yOf(x.p.score as number) }));
  const path = pts.length >= 2 ? smoothPath(pts) : "";
  const area = path
    ? `${path} L ${pts[pts.length - 1].x} ${PT + ih} L ${pts[0].x} ${PT + ih} Z`
    : "";

  const hp = hover !== null ? points[hover] : null;
  const tx = hover !== null ? Math.min(Math.max(xs[hover] - 58, PL), W - PR - 116) : 0;

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in" : ""} flex h-full flex-col rounded-xl border border-line bg-sheet p-5 shadow-[0_1px_0_rgba(36,48,41,0.05),0_14px_30px_-22px_rgba(36,48,41,0.35)]`}
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-ink">
          情绪与评分走势
          <span className="font-num ml-2 text-[10px] font-medium tracking-[0.22em] text-ink2/70">
            14 DAYS
          </span>
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-ink2">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 rounded bg-pine" /> 状态分
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-gold" /> 心情
          </span>
        </div>
      </div>

      {valid.length === 0 ? (
        <div className="grid flex-1 place-items-center py-10 text-center text-xs leading-relaxed text-ink2">
          近 14 天还没有记录。
          <br />
          从今天这一页开始，曲线就会长出来。
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e6b54" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#2e6b54" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 50, 100].map((v) => (
            <g key={v}>
              <line
                x1={PL}
                x2={W - PR}
                y1={yOf(v)}
                y2={yOf(v)}
                stroke="#e6e0d0"
                strokeDasharray="3 5"
              />
              <text
                x={PL - 8}
                y={yOf(v) + 3}
                textAnchor="end"
                fontSize="9"
                fill="#9a947f"
                fontFamily="Space Grotesk"
              >
                {v}
              </text>
            </g>
          ))}

          {points.map((p, i) =>
            p.score === null ? (
              <circle key={p.key} cx={xs[i]} cy={PT + ih} r="2" fill="#d9d3c3" />
            ) : null
          )}

          {area && (
            <path
              d={area}
              fill="url(#trendFill)"
              style={{ opacity: inView ? 1 : 0, transition: "opacity .9s .35s" }}
            />
          )}
          {path && (
            <path
              d={path}
              fill="none"
              stroke="#2e6b54"
              strokeWidth="2.4"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={inView ? 0 : 1}
              style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.22,.9,.3,1) .15s" }}
            />
          )}

          {valid.map((x, idx) => {
            const md = moodOf(x.p.mood);
            return (
              <circle
                key={x.p.key}
                cx={xs[x.i]}
                cy={yOf(x.p.score as number)}
                r={hover === x.i ? 5.5 : 4}
                fill={md?.color ?? "#2e6b54"}
                stroke="#fffdf7"
                strokeWidth="1.8"
                style={{
                  opacity: inView ? 1 : 0,
                  transition: `opacity .4s ${0.35 + idx * 0.05}s, r .15s`,
                }}
              />
            );
          })}

          {[0, Math.floor((n - 1) / 2), n - 1].map((i) => (
            <text
              key={i}
              x={xs[i]}
              y={H - 8}
              textAnchor="middle"
              fontSize="9"
              fill="#9a947f"
              fontFamily="Space Grotesk"
            >
              {points[i].label}
            </text>
          ))}

          {points.map((p, i) => (
            <rect
              key={p.key}
              x={xs[i] - iw / n / 2}
              y={PT}
              width={iw / n}
              height={ih}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}

          {hover !== null && hp && hp.score !== null && (
            <g pointerEvents="none">
              <line
                x1={xs[hover]}
                x2={xs[hover]}
                y1={PT}
                y2={PT + ih}
                stroke="#243029"
                strokeOpacity="0.25"
                strokeDasharray="3 3"
              />
              <g transform={`translate(${tx}, ${PT + 2})`}>
                <rect width="116" height="36" rx="7" fill="#243029" opacity="0.92" />
                <text x="10" y="15" fontSize="10.5" fill="#fffdf7" fontWeight="700">
                  {hp.label} · {hp.score} 分
                </text>
                <text x="10" y="28" fontSize="9" fill="#cfc9b8">
                  {moodOf(hp.mood) ? `心情：${moodOf(hp.mood)?.label}` : "心情：未记录"}
                </text>
              </g>
            </g>
          )}
        </svg>
      )}
    </div>
  );
}

/* ---------------- 月度热力图 ---------------- */

function MonthCell({
  k,
  index,
  today,
  selected,
  inView,
  delay,
  onSelect,
}: {
  k: string;
  index: LedgerIndex;
  today: string;
  selected: boolean;
  inView: boolean;
  delay: number;
  onSelect: (k: string) => void;
}) {
  const meta = index[k];
  const score = meta?.filled ? meta.score : 0;
  const future = k > today;
  const day = Number(k.slice(8));
  return (
    <button
      type="button"
      onClick={() => onSelect(k)}
      title={`${k}${meta?.filled ? ` · ${meta.score} 分` : ""}`}
      className={`relative grid aspect-square place-items-center rounded-md font-num text-xs transition-all duration-300 hover:z-10 hover:scale-110 hover:shadow-md ${
        selected ? "ring-2 ring-seal" : k === today ? "ring-2 ring-pine" : ""
      }`}
      style={{
        background: score > 0 ? `rgba(217,72,43,${0.16 + (score / 100) * 0.66})` : "#ffffff",
        color: score > 55 ? "#fffdf7" : "#6b756e",
        opacity: inView ? (future ? 0.4 : 1) : 0,
        transform: inView ? undefined : "scale(.6)",
        transitionDelay: `${delay}ms`,
        border: "1px solid #eae4d5",
      }}
    >
      {day}
      {k === today && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-pine" />}
    </button>
  );
}

export function MonthHeat({
  base,
  index,
  selectedKey,
  onSelect,
}: {
  base: Date;
  index: LedgerIndex;
  selectedKey: string;
  onSelect: (k: string) => void;
}) {
  const [ref, inView] = useReveal<HTMLDivElement>();
  const year = base.getFullYear();
  const month = base.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const dim = new Date(year, month + 1, 0).getDate();
  const today = todayKey();

  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(keyOf(new Date(year, month, d)));
  const filledCount = cells.filter((k) => k && index[k]?.filled).length;

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in" : ""} flex h-full flex-col rounded-xl border border-line bg-sheet p-5 shadow-[0_1px_0_rgba(36,48,41,0.05),0_14px_30px_-22px_rgba(36,48,41,0.35)]`}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-bold text-ink">
          {year}年{month + 1}月
          <span className="font-num ml-2 text-[10px] font-medium tracking-[0.22em] text-ink2/70">
            HEATMAP
          </span>
        </h3>
        <span className="text-xs text-ink2">
          已记录{" "}
          <b className="font-num text-seal">{filledCount}</b> 天
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["一", "二", "三", "四", "五", "六", "日"].map((w) => (
          <div key={w} className="pb-1 text-center text-[10px] font-medium text-ink2">
            {w}
          </div>
        ))}
        {cells.map((k, i) =>
          k === null ? (
            <div key={`e${i}`} />
          ) : (
            <MonthCell
              key={k}
              k={k}
              index={index}
              today={today}
              selected={k === selectedKey}
              inView={inView}
              delay={(i % 7) * 28 + Math.floor(i / 7) * 18}
              onSelect={onSelect}
            />
          )
        )}
      </div>

      <div className="mt-auto flex items-center justify-end gap-1.5 pt-3 text-[10px] text-ink2">
        少
        {[0.15, 0.35, 0.55, 0.8].map((o) => (
          <span
            key={o}
            className="h-3 w-3 rounded-sm"
            style={{ background: `rgba(217,72,43,${o})` }}
          />
        ))}
        多
      </div>
    </div>
  );
}

/* ---------------- 本周复盘 ---------------- */

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-line bg-white/70 px-3 py-2.5">
      <div className="text-[10px] tracking-wider text-ink2">{label}</div>
      <div className="mt-0.5 font-num text-sm font-bold text-ink">{value}</div>
      {sub ? <div className="text-[10px] text-ink2/70">{sub}</div> : null}
    </div>
  );
}

export function WeekReview({ week, days }: { week: Date[]; days: DayData[] }) {
  const [ref, inView] = useReveal<HTMLDivElement>();
  const stats = useMemo(() => reviewOfDays(week.map(keyOf), days), [week, days]);
  const bestDate = stats.best ? parseKey(stats.best.key) : null;
  const weakMeta = stats.weakest ? MODULES[stats.weakest] : null;

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in" : ""} rounded-xl border border-line bg-sheet p-6 shadow-[0_1px_0_rgba(36,48,41,0.05),0_14px_30px_-22px_rgba(36,48,41,0.35)]`}
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-ink">
          本周复盘
          <span className="font-num ml-2 text-[10px] font-medium tracking-[0.22em] text-ink2/70">
            WEEKLY REVIEW
          </span>
        </h3>
        <span className="font-num text-xs text-ink2">
          {fmtCN(week[0])} – {fmtCN(week[6])}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <div className="flex items-end gap-3">
            <span className="font-num text-6xl font-bold leading-none text-ink">
              {stats.avg ?? "–"}
            </span>
            <div className="pb-1">
              <div className="text-xs font-bold text-ink2">/ 100 本周均分</div>
              <div className="mt-1 text-[11px] text-ink2">已记录 {stats.filledDays}/7 天</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat label="任务完成" value={`${stats.tasksDone}/${stats.tasksTotal}`} />
            <MiniStat
              label="学习时长"
              value={stats.studyActual ? fmtDur(stats.studyActual) : "—"}
              sub={stats.studyPlan ? `计划 ${fmtDur(stats.studyPlan)}` : undefined}
            />
            <MiniStat label="健身天数" value={`${stats.fitnessDays} 天`} />
          </div>

          <div className="mt-4">
            <p className="lbl">心情分布</p>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <div
                  key={m.key}
                  className={`flex items-center gap-1 rounded-full border px-2 py-1 transition-all hover:-translate-y-0.5 ${
                    stats.moodCounts[m.key]
                      ? "border-line bg-white shadow-sm"
                      : "border-transparent opacity-35"
                  }`}
                >
                  <MoodFace mood={m.key} size={20} color={m.color} />
                  <span className="font-num text-xs font-bold" style={{ color: m.color }}>
                    {stats.moodCounts[m.key]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {stats.best && bestDate && (
            <div className="mt-4 rounded-lg bg-[#eef4f0] px-3 py-2.5 text-xs text-pine">
              <b className="font-display">{fmtCN(bestDate)}</b> 是本周最佳的一天 ·{" "}
              <b className="font-num">{stats.best.score}</b> 分
            </div>
          )}
        </div>

        <div>
          <p className="lbl">九维均分</p>
          <div className="flex flex-col gap-2">
            {stats.moduleAvg.map((m) => {
              const meta = MODULES[m.key];
              const has = m.value >= 0;
              return (
                <div key={m.key} className="group/bar flex items-center gap-3">
                  <span className="w-9 shrink-0 text-xs font-medium text-ink2">{meta.label}</span>
                  <Bar value={has ? m.value : 0} color={has ? meta.color : "#d9d3c3"} className="flex-1" />
                  <span
                    className={`w-8 text-right font-num text-xs font-bold ${has ? "" : "text-ink2/40"}`}
                    style={has ? { color: meta.color } : undefined}
                  >
                    {has ? m.value : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          {weakMeta && stats.weakest && (
            <div className="mt-4 rounded-lg border border-[#f0d5cd] bg-[#fdf1ee] px-3.5 py-3 text-xs leading-relaxed text-[#8c3a28]">
              <span className="font-display font-bold">本周短板 · {weakMeta.label}</span>
              <span className="mx-1.5 opacity-50">|</span>
              {MODULE_TIPS[stats.weakest]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
