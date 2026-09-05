import { useMemo, useState, type CSSProperties } from "react";
import {
  MODULES,
  collectTags,
  computeMedals,
  moodOf,
  sleepSeries,
  tagSearch,
  todayKey,
  trendSeries,
  weakTip,
  weekOf,
  weekReview,
  type LedgerIndex,
  type ModuleKey,
  type TagHit,
} from "../lib/core";
import { Bar, Icon, useReveal } from "./ui";

/* ---------------- 趋势图 ---------------- */

function TrendChart({ index, days }: { index: LedgerIndex; days: number }) {
  const series = useMemo(() => trendSeries(index, days), [index, days]);
  const [hover, setHover] = useState<number | null>(null);

  const W = 560;
  const H = 170;
  const padX = 10;
  const padTop = 16;
  const padBottom = 24;
  const iw = W - padX * 2;
  const ih = H - padTop - padBottom;

  const pts = series.map((p, i) => ({
    ...p,
    x: padX + (series.length === 1 ? iw / 2 : (i / (series.length - 1)) * iw),
    y: p.score === null ? null : padTop + ih - (p.score / 100) * ih,
  }));

  let line = "";
  let area = "";
  let started = false;
  pts.forEach((p) => {
    if (p.y === null) {
      started = false;
      return;
    }
    if (!started) {
      line += `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
      area += `M ${p.x.toFixed(1)} ${(padTop + ih).toFixed(1)} L ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
      started = true;
    } else {
      line += `L ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
      area += `L ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
    }
  });
  for (let i = pts.length - 1; i >= 0; i--) {
    if (pts[i].y !== null) {
      area += `L ${pts[i].x.toFixed(1)} ${(padTop + ih).toFixed(1)} Z`;
      break;
    }
  }

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bd = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    setHover(best);
  };

  const hv = hover !== null ? pts[hover] : null;
  const hvMood = hv ? moodOf(hv.mood) : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {[25, 50, 75].map((g) => (
          <g key={g}>
            <line x1={padX} x2={W - padX} y1={padTop + ih - (g / 100) * ih} y2={padTop + ih - (g / 100) * ih} stroke="#e6e0cf" strokeDasharray="3 5" strokeWidth="1" />
            <text x={W - padX} y={padTop + ih - (g / 100) * ih - 4} textAnchor="end" fontSize="9" fill="#b3ac99" className="font-num">
              {g}
            </text>
          </g>
        ))}
        <path d={area} fill="rgba(217,72,43,0.09)" />
        <path d={line} fill="none" stroke="#d9482b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) =>
          p.y === null ? null : (
            <circle key={p.key} cx={p.x} cy={p.y} r={hover === i ? 5.5 : 3.4} fill={moodOf(p.mood)?.color ?? "#d9482b"} stroke="#fffdf7" strokeWidth="1.6" style={{ transition: "r .15s" }} />
          )
        )}
        {hv && hv.y !== null && (
          <line x1={hv.x} x2={hv.x} y1={padTop} y2={padTop + ih} stroke="#24302933" strokeWidth="1" strokeDasharray="2 4" />
        )}
        {pts.map((p, i) =>
          i % Math.ceil(series.length / 10) === 0 || i === series.length - 1 ? (
            <text key={`t${p.key}`} x={p.x} y={H - 8} textAnchor="middle" fontSize="9" fill="#9a9484" className="font-num">
              {p.label}
            </text>
          ) : null
        )}
      </svg>
      {hv && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg bg-ink px-3 py-1.5 text-center shadow-lg"
          style={{ left: `${(hv.x / W) * 100}%`, top: 0 }}
        >
          <p className="font-num text-[10px] font-bold text-paper/70">{hv.label}</p>
          <p className="font-num text-sm font-bold text-paper">
            {hv.score === null ? "未记录" : `${hv.score} 分`}
          </p>
          {hvMood && (
            <p className="text-[10px] font-bold" style={{ color: hvMood.color }}>
              {hvMood.label}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- 统计页 ---------------- */

export function StatsPage({
  index,
  enabled,
  onViewDay,
}: {
  index: LedgerIndex;
  enabled: ModuleKey[];
  onViewDay: (k: string) => void;
}) {
  const [range, setRange] = useState<7 | 30>(7);
  const [query, setQuery] = useState("");
  const [ref, inView] = useReveal<HTMLDivElement>();

  const medals = useMemo(() => computeMedals(index), [index]);
  const nights = useMemo(() => sleepSeries(index, todayKey(), 7), [index]);
  const review = useMemo(() => weekReview(index, weekOf(new Date()), enabled), [index, enabled]);
  const allTags = useMemo(() => collectTags(index), [index]);
  const hits: TagHit[] = useMemo(() => tagSearch(index, query), [index, query]);
  const trend = useMemo(() => trendSeries(index, range), [index, range]);
  const avg = trend.filter((t) => t.score !== null);
  const avgScore = avg.length ? Math.round(avg.reduce((s, t) => s + (t.score ?? 0), 0) / avg.length) : null;
  const moodCount = trend.filter((t) => t.mood).length;

  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} mt-6 space-y-5`}>
      {/* 顶部统计条 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: `${range} 天均分`, value: avgScore ?? "—", color: "#d9482b", icon: "gauge" as const },
          { label: "有情绪记录", value: `${moodCount} 天`, color: "#e05b7a", icon: "star" as const },
          { label: "勋章", value: `${medals.filter((m) => m.got).length}/${medals.length}`, color: "#e8a33d", icon: "medal" as const },
          { label: "累计记录", value: `${Object.values(index).filter((m) => m?.filled).length} 天`, color: "#2e6b54", icon: "calendar" as const },
        ].map((s) => (
          <div key={s.label} className="group rounded-xl border border-line bg-sheet px-4 py-3.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-ink2">
              <Icon name={s.icon} size={12} strokeWidth={2.4} />
              {s.label}
            </p>
            <p className="font-num mt-1 text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* 综合分趋势 */}
      <div className="rounded-xl border border-line bg-sheet p-5 shadow-[0_14px_30px_-22px_rgba(36,48,41,0.35)]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="lbl !mb-0">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-seal" />
            综合分趋势 · 圆点颜色 = 当日情绪
          </p>
          <div className="inline-flex rounded-full border border-line bg-white p-0.5">
            {([7, 30] as const).map((r) => (
              <button key={r} type="button" onClick={() => setRange(r)} className="rounded-full px-3 py-1 font-num text-xs font-bold transition-all duration-200" style={range === r ? { background: "#243029", color: "#f4f2ea" } : { color: "#6b756e" }}>
                {r} 天
              </button>
            ))}
          </div>
        </div>
        <TrendChart index={index} days={range} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 本周复盘 */}
        <div className="rounded-xl border border-line bg-sheet p-5 shadow-[0_14px_30px_-22px_rgba(36,48,41,0.35)]">
          <p className="lbl">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-pine" />
            本周复盘看板
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-ink px-3 py-2 text-center text-paper">
              <span className="block text-[9px] font-bold tracking-widest text-paper/60">均分</span>
              <span className="font-num text-xl font-bold">{review.avg ?? "—"}</span>
            </span>
            <span className="rounded-lg border border-line bg-white px-3 py-2">
              <span className="block text-[9px] font-bold tracking-widest text-ink2">最佳日</span>
              <span className="font-num text-sm font-bold text-pine">{review.best ? `${review.best.label} · ${review.best.score}` : "—"}</span>
            </span>
            <span className="rounded-lg border border-line bg-white px-3 py-2">
              <span className="block text-[9px] font-bold tracking-widest text-ink2">任务</span>
              <span className="font-num text-sm font-bold text-[#3d74c0]">{review.work.done}/{review.work.total}</span>
            </span>
            <span className="rounded-lg border border-line bg-white px-3 py-2">
              <span className="block text-[9px] font-bold tracking-widest text-ink2">学习</span>
              <span className="font-num text-sm font-bold text-[#2c8c99]">{review.studyAct}/{review.studyPlan}分</span>
            </span>
            <span className="rounded-lg border border-line bg-white px-3 py-2">
              <span className="block text-[9px] font-bold tracking-widest text-ink2">健身</span>
              <span className="font-num text-sm font-bold text-seal">{review.fitDays} 天</span>
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-bold tracking-widest text-ink2">九维均分（低 → 高）</p>
            {review.partsAvg.map((p) => {
              const meta = MODULES[p.key];
              return (
                <div key={p.key} className="flex items-center gap-2">
                  <span className="w-8 shrink-0 text-[11px] font-bold text-ink">{meta.label}</span>
                  <Bar value={p.avg} color={meta.color} className="flex-1" height={7} />
                  <span className="font-num w-7 text-right text-[11px] font-bold" style={{ color: meta.color }}>{p.avg}</span>
                </div>
              );
            })}
          </div>

          {review.weakest && (
            <div className="mt-4 rounded-lg border border-dashed border-gold/60 bg-[#fdf7ea] px-3 py-2.5">
              <p className="text-[10px] font-bold tracking-widest text-[#b07d1e]">本周短板 · {MODULES[review.weakest].label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink">{weakTip(review.weakest)}</p>
            </div>
          )}
        </div>

        {/* 睡眠 + 勋章 */}
        <div className="space-y-5">
          <div className="rounded-xl border border-line bg-sheet p-5 shadow-[0_14px_30px_-22px_rgba(36,48,41,0.35)]">
            <p className="lbl">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#46639e]" />
              近 7 晚睡眠时长
            </p>
            <div className="relative h-24">
              <div className="absolute inset-x-0 z-10 border-t border-dashed border-[#46639e]/45" style={{ bottom: "80%" }}>
                <span className="absolute -top-2.5 right-0 font-num text-[9px] text-[#46639e]/75">8h</span>
              </div>
              <div className="absolute inset-0 flex items-end gap-2">
                {nights.map((n) => (
                  <div key={n.key} className="flex-1 rounded-t-md transition-all duration-700" title={n.hours !== null ? `${n.hours}h` : "未记录"} style={{ height: n.hours !== null ? `${Math.min(100, n.hours * 10)}%` : "4px", background: n.hours === null ? "#e4e8f0" : n.hours >= 7.5 ? "#3e9c6e" : n.hours >= 6 ? "#e8a33d" : "#d9482b" }} />
                ))}
              </div>
            </div>
            <div className="mt-1 flex gap-2">
              {nights.map((n) => (
                <span key={n.key} className="flex-1 text-center text-[9px] text-ink2">{n.weekday}</span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-sheet p-5 shadow-[0_14px_30px_-22px_rgba(36,48,41,0.35)]">
            <p className="lbl">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              打卡勋章墙
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {medals.map((m) => (
                <div key={m.id} className={`group flex flex-col items-center rounded-xl border p-3 text-center transition-all duration-200 hover:-translate-y-1 ${m.got ? "border-gold/60 bg-[#fdf8ec] shadow-sm hover:shadow-md" : "border-line bg-white/60"}`}>
                  <span className={`grid h-11 w-11 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 ${m.got ? "" : "opacity-35 grayscale"}`} style={{ background: `color-mix(in srgb, ${m.color} 16%, #fff)`, color: m.color, border: `2px solid ${m.color}` }}>
                    <Icon name="medal" size={22} strokeWidth={1.7} />
                  </span>
                  <p className={`mt-1.5 text-xs font-bold ${m.got ? "text-ink" : "text-ink2"}`}>{m.label}</p>
                  <p className="mt-0.5 text-[9px] leading-tight text-ink2">{m.desc}</p>
                  <p className="font-num mt-1 text-[10px] font-bold" style={{ color: m.got ? m.color : "#b3ac99" }}>
                    {m.got ? "已达成 ✓" : `${m.cur}/${m.target}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 标签检索 */}
      <div className="rounded-xl border border-line bg-sheet p-5 shadow-[0_14px_30px_-22px_rgba(36,48,41,0.35)]">
        <p className="lbl">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#a24e9c]" />
          标签检索 · 找回所有聚餐、穿搭、随笔
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 transition-colors focus-within:border-[#a24e9c]">
            <Icon name="tag" size={15} className="text-[#a24e9c]" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink2/50" placeholder="输入标签或关键词，如：探店 / 穿搭…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {allTags.slice(0, 8).map((t) => (
            <button key={t} type="button" onClick={() => setQuery(t)} className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-ink2 transition-all hover:-translate-y-0.5 hover:border-[#a24e9c] hover:text-[#a24e9c]" style={query === t ? ({ borderColor: "#a24e9c", color: "#a24e9c" } as CSSProperties) : undefined}>
              #{t}
            </button>
          ))}
        </div>
        {query.trim() && (
          <div className="mt-3">
            {hits.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line bg-white/50 px-4 py-4 text-center text-xs text-ink2">
                没有找到「{query}」相关的记录，换个词试试。
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {hits.map((h) => (
                  <button key={h.key} type="button" onClick={() => onViewDay(h.key)} className="group rounded-lg border border-line/80 bg-white px-3.5 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a24e9c]/50 hover:shadow-md">
                    <p className="flex items-center justify-between">
                      <span className="font-num text-xs font-bold text-ink">{h.label}</span>
                      <Icon name="chevR" size={13} className="text-ink2/50 transition-transform group-hover:translate-x-0.5 group-hover:text-[#a24e9c]" />
                    </p>
                    {h.note && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink2">{h.note}</p>}
                    {h.tags.length > 0 && (
                      <p className="mt-1.5 text-[10px] font-bold text-[#a24e9c]">
                        {h.tags.map((t) => `#${t}`).join(" ")}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
