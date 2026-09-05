import type { CSSProperties } from "react";
import {
  MODULES,
  buildSummary,
  computeScore,
  encouragement,
  fmtDur,
  type DayData,
  type DayScore,
} from "../lib/core";
import { Bar, Card, EmptyHint, Icon, Ring } from "./ui";
import type { Updater } from "./ModulesA";

/* ================= 睡眠 ================= */

function spanMin(bed: string, wake: string): number | null {
  if (!bed || !wake) return null;
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let m = wh * 60 + wm - (bh * 60 + bm);
  if (m <= 0) m += 24 * 60;
  return m;
}

function TimeBlock({
  label,
  bedLabel,
  wakeLabel,
  bed,
  wake,
  onBed,
  onWake,
  color,
}: {
  label: string;
  bedLabel: string;
  wakeLabel: string;
  bed: string;
  wake: string;
  onBed: (v: string) => void;
  onWake: (v: string) => void;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-line/80 bg-white p-3">
      <p className="lbl !mb-2" style={{ color }}>
        <Icon name="moon" size={12} strokeWidth={2.4} />
        {label}
      </p>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-[11px] font-bold text-ink2">{bedLabel}</span>
          <input type="time" className="inp !py-1.5" style={{ "--c": color } as CSSProperties} value={bed} onChange={(e) => onBed(e.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-[11px] font-bold text-ink2">{wakeLabel}</span>
          <input type="time" className="inp !py-1.5" style={{ "--c": color } as CSSProperties} value={wake} onChange={(e) => onWake(e.target.value)} />
        </label>
      </div>
    </div>
  );
}

export function SleepCard({ d, up }: { d: DayData; up: Updater }) {
  const c = MODULES.sleep;
  const s = d.sleep;
  const plan = spanMin(s.planBed, s.planWake);
  const act = spanMin(s.actBed, s.actWake);

  // 与评分引擎保持一致的得分
  const { parts } = computeScore(d);
  const score = parts.find((p) => p.key === "sleep")?.score ?? 0;

  const delta = act !== null && plan !== null ? act - plan : null;

  return (
    <Card title="睡眠" en={c.en} color={c.color} icon="moon" hint={c.hint} progress={score}>
      <div className="grid gap-2.5 sm:grid-cols-3">
        <TimeBlock
          label="昨晚计划"
          bedLabel="入睡"
          wakeLabel="起床"
          bed={s.planBed}
          wake={s.planWake}
          color={c.color}
          onBed={(v) => up((dd) => void (dd.sleep.planBed = v))}
          onWake={(v) => void up((dd) => void (dd.sleep.planWake = v))}
        />
        <TimeBlock
          label="实际睡眠"
          bedLabel="入睡"
          wakeLabel="起床"
          bed={s.actBed}
          wake={s.actWake}
          color="#d9482b"
          onBed={(v) => up((dd) => void (dd.sleep.actBed = v))}
          onWake={(v) => up((dd) => void (dd.sleep.actWake = v))}
        />
        <TimeBlock
          label="明日规划"
          bedLabel="今晚"
          wakeLabel="明早"
          bed={s.nextBed}
          wake={s.nextWake}
          color="#2e6b54"
          onBed={(v) => up((dd) => void (dd.sleep.nextBed = v))}
          onWake={(v) => up((dd) => void (dd.sleep.nextWake = v))}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-ink2 shadow-sm ring-1 ring-line">
          计划 <b className="font-num text-ink">{plan !== null ? fmtDur(plan) : "—"}</b>
        </span>
        <span className="rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-ink2 shadow-sm ring-1 ring-line">
          实际 <b className="font-num" style={{ color: c.color }}>{act !== null ? fmtDur(act) : "—"}</b>
        </span>
        {delta !== null && delta !== 0 && (
          <span
            className="rounded-md px-2.5 py-1.5 text-xs font-bold"
            style={{
              background: delta > 0 ? "color-mix(in srgb, #2e6b54 12%, #fff)" : "color-mix(in srgb, #d9482b 12%, #fff)",
              color: delta > 0 ? "#2e6b54" : "#d9482b",
            }}
          >
            比计划{delta > 0 ? "多睡" : "少睡"} {fmtDur(Math.abs(delta))}
          </span>
        )}
        {act !== null && Math.abs(act / 60 - 8) <= 1 && (
          <span className="rounded-md bg-pine/10 px-2.5 py-1.5 text-xs font-bold text-pine">
            黄金睡眠时长 ✓
          </span>
        )}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-ink2">
        理想的睡眠在 7~9 小时之间；入睡时间和计划偏差越小，作息规律分越高。
      </p>
    </Card>
  );
}

/* ================= 学习 ================= */

export function StudyCard({ d, up }: { d: DayData; up: Updater }) {
  const c = MODULES.study;
  const { parts } = computeScore(d);
  const score = parts.find((p) => p.key === "study")?.score ?? 0;

  const planTotal = d.studyItems.reduce((s, i) => s + (i.planMin || 0), 0);
  const actTotal = d.studyItems.reduce((s, i) => s + (i.actualMin || 0), 0);
  const rate = planTotal > 0 ? Math.round((Math.min(actTotal, planTotal) / planTotal) * 100) : actTotal > 0 ? 100 : 0;

  const addRow = () =>
    up((dd) => {
      dd.studyItems.push({ id: uidLocal(), subject: "", planMin: 60, actualMin: 0, checked: false });
    });

  return (
    <Card title="学习" en={c.en} color={c.color} icon="book" hint={c.hint} progress={score}>
      {d.studyItems.length === 0 && (
        <EmptyHint text="今天要学什么？加一行：科目 + 计划分钟数，晚上填实际。" />
      )}
      <div className="space-y-2">
        {d.studyItems.map((it) => (
          <div
            key={it.id}
            className="group rounded-lg border border-line/80 bg-white px-3 py-2 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)] hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <input
                className="inp inp-ghost min-w-0 flex-1 font-medium"
                style={{ "--c": c.color } as CSSProperties}
                placeholder="科目 / 内容"
                value={it.subject}
                onChange={(e) =>
                  up((dd) => {
                    const t = dd.studyItems.find((x) => x.id === it.id);
                    if (t) t.subject = e.target.value;
                  })
                }
              />
              <button
                type="button"
                aria-label="删除科目"
                onClick={() =>
                  up((dd) => {
                    dd.studyItems = dd.studyItems.filter((x) => x.id !== it.id);
                  })
                }
                className="text-ink2/50 opacity-0 transition-all hover:scale-110 hover:text-seal group-hover:opacity-100"
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] font-bold text-ink2">
                规划
                <input
                  type="number"
                  min={0}
                  max={720}
                  className="inp !w-16 !px-2 !py-1 text-center font-num text-xs"
                  style={{ "--c": c.color } as CSSProperties}
                  value={it.planMin || ""}
                  placeholder="0"
                  onChange={(e) =>
                    up((dd) => {
                      const t = dd.studyItems.find((x) => x.id === it.id);
                      if (t) t.planMin = Math.max(0, Math.min(720, Number(e.target.value) || 0));
                    })
                  }
                />
                分钟
              </label>
              <label className="flex items-center gap-1 text-[11px] font-bold text-ink2">
                实际
                <input
                  type="number"
                  min={0}
                  max={720}
                  className="inp !w-16 !px-2 !py-1 text-center font-num text-xs"
                  style={{ "--c": c.color } as CSSProperties}
                  value={it.actualMin || ""}
                  placeholder="0"
                  onChange={(e) =>
                    up((dd) => {
                      const t = dd.studyItems.find((x) => x.id === it.id);
                      if (t) t.actualMin = Math.max(0, Math.min(720, Number(e.target.value) || 0));
                    })
                  }
                />
                分钟
              </label>
              <button
                type="button"
                aria-pressed={it.checked}
                onClick={() =>
                  up((dd) => {
                    const t = dd.studyItems.find((x) => x.id === it.id);
                    if (t) t.checked = !t.checked;
                  })
                }
                className="ml-auto flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all hover:-translate-y-0.5"
                style={
                  it.checked
                    ? { background: c.color, borderColor: c.color, color: "#fff" }
                    : { background: "#fff", borderColor: "#e3ddcd", color: "#9a9484" }
                }
              >
                <Icon name="check" size={11} strokeWidth={3} />
                {it.checked ? "已检查" : "检查"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-white/60 py-2.5 text-xs font-bold text-ink2 transition-all hover:border-[color:var(--c)] hover:text-ink hover:shadow-sm"
        style={{ "--c": c.color } as CSSProperties}
      >
        <Icon name="plus" size={14} strokeWidth={2.6} />
        添加学习科目
      </button>

      {d.studyItems.length > 0 && (
        <div className="mt-4 rounded-lg bg-white p-3 ring-1 ring-line">
          <div className="flex items-center justify-between text-[11px] font-bold text-ink2">
            <span>
              执行率{" "}
              <b className="font-num text-sm" style={{ color: c.color }}>{rate}%</b>
            </span>
            <span>
              规划 <b className="font-num text-ink">{planTotal}</b> 分 · 实际{" "}
              <b className="font-num text-ink">{actTotal}</b> 分
            </span>
          </div>
          <Bar value={rate} color={c.color} className="mt-2" />
        </div>
      )}

      <input
        className="inp mt-3"
        style={{ "--c": c.color } as CSSProperties}
        placeholder="复盘：哪里没做到？明天怎么调整？"
        value={d.studyNote}
        onChange={(e) => up((dd) => void (dd.studyNote = e.target.value))}
      />
    </Card>
  );
}

let seq = 0;
const uidLocal = () => `s${Date.now().toString(36)}${(seq++).toString(36)}`;

/* ================= 健身 ================= */

export function FitnessCard({ d, up }: { d: DayData; up: Updater }) {
  const c = MODULES.fitness;
  const { parts } = computeScore(d);
  const score = parts.find((p) => p.key === "fitness")?.score ?? 0;
  const doneToday = !!d.fitness.actual.trim();

  const rows: {
    k: keyof DayData["fitness"];
    label: string;
    ph: string;
    icon: "pen" | "check" | "chevR";
  }[] = [
    { k: "plan", label: "今日规划", ph: "比如：上肢推日 + 20 分钟有氧", icon: "pen" },
    { k: "actual", label: "实际完成", ph: "完成了什么？组数 / 时长 / 感受", icon: "check" },
    { k: "next", label: "下一步计划", ph: "下次练什么？强度怎么调？", icon: "chevR" },
  ];

  return (
    <Card title="健身" en={c.en} color={c.color} icon="dumbbell" hint={c.hint} progress={score}>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.k}>
            <p className="lbl" style={{ color: c.color }}>
              <Icon name={r.icon} size={12} strokeWidth={2.6} />
              {r.label}
            </p>
            <textarea
              className="inp resize-none"
              style={{ "--c": c.color } as CSSProperties}
              rows={2}
              placeholder={r.ph}
              value={d.fitness[r.k]}
              onChange={(e) =>
                up((dd) => {
                  dd.fitness[r.k] = e.target.value;
                })
              }
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all"
          style={
            doneToday
              ? { background: c.color, color: "#fff", boxShadow: `0 6px 14px -6px ${c.color}` }
              : { background: "#efeadd", color: "#9a9484" }
          }
        >
          <Icon name="dumbbell" size={13} strokeWidth={2.4} />
          {doneToday ? "今日已练，肌肉在生长" : "今天还没开练"}
        </span>
      </div>
    </Card>
  );
}

/* ================= 个人形象 ================= */

const IMAGE_GROUPS: { k: keyof DayData["image"]; label: string; phs: [string, string, string] }[] = [
  { k: "skincare", label: "护肤", phs: ["学到的护肤知识", "今天做了什么（早晚护肤）", "下一步（尝试/购入/坚持）"] },
  { k: "hair", label: "发型", phs: ["看到的合适发型/打理技巧", "今天的发型状态", "下一步（修剪/造型计划）"] },
  { k: "outfit", label: "穿搭", phs: ["学到的搭配思路", "今天穿了什么", "下一步（想尝试的风格）"] },
];

export function ImageCard({ d, up }: { d: DayData; up: Updater }) {
  const c = MODULES.image;
  let filled = 0;
  IMAGE_GROUPS.forEach((g) => {
    const r = d.image[g.k];
    if (r.learn.trim()) filled++;
    if (r.actual.trim()) filled++;
    if (r.next.trim()) filled++;
  });

  return (
    <Card
      title="个人形象"
      en={c.en}
      color={c.color}
      icon="shirt"
      hint={c.hint}
      progress={(filled / 9) * 100}
    >
      <div className="space-y-4">
        {IMAGE_GROUPS.map((g, gi) => (
          <div key={g.k}>
            <p className="mb-2 flex items-center gap-2">
              <span
                className="font-display grid h-6 w-6 place-items-center rounded-md text-[11px] font-black text-white"
                style={{ background: c.color, opacity: 1 - gi * 0.18 }}
              >
                {g.label.slice(0, 1)}
              </span>
              <span className="text-sm font-bold text-ink">{g.label}</span>
              <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,#e3ddcd_0_5px,transparent_5px_9px)]" />
            </p>
            <div className="grid gap-2">
              {(["learn", "actual", "next"] as const).map((f, fi) => (
                <div key={f} className="flex items-center gap-2">
                  <span
                    className="w-11 shrink-0 text-center text-[10px] font-bold tracking-wider"
                    style={{
                      color: f === "actual" ? c.color : "#9a9484",
                    }}
                  >
                    {["学习", "实际", "下一步"][fi]}
                  </span>
                  <input
                    className="inp !py-1.5 text-xs"
                    style={{ "--c": c.color } as CSSProperties}
                    placeholder={g.phs[fi]}
                    value={d.image[g.k][f]}
                    onChange={(e) =>
                      up((dd) => {
                        dd.image[g.k][f] = e.target.value;
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-ink2">
        已填写 <b className="font-num" style={{ color: c.color }}>{filled}</b> / 9 格 · 形象是一项长期主义
      </p>
    </Card>
  );
}

/* ================= 今日状态总分 ================= */

export function ScoreCard({
  d,
  up,
  date,
  onToast,
}: {
  d: DayData;
  up: Updater;
  date: Date;
  onToast: (msg: string) => void;
}) {
  const score = computeScore(d);
  const color = score.total >= 70 ? "#2e6b54" : score.total >= 40 ? "#e8a33d" : "#d9482b";

  const copySummary = async () => {
    const text = buildSummary(d, date, score);
    try {
      await navigator.clipboard.writeText(text);
      onToast("今日总结已复制到剪贴板");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        onToast("今日总结已复制到剪贴板");
      } catch {
        onToast("复制失败，请手动选择文本");
      }
      document.body.removeChild(ta);
    }
  };

  return (
    <Card
      title="今日状态总分"
      en="DAILY SCORE"
      color={color}
      icon="gauge"
      hint="综合以上九个维度自动计算 · 记录越完整，评分越准"
      className="md:col-span-2 xl:col-span-3"
      tape="right"
    >
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* 左：总分环 + 自评 */}
        <div className="flex flex-col items-center text-center">
          <Ring value={score.total} size={172} stroke={13} color={color} track="#eee8d9">
            <div>
              <p className="font-num text-6xl font-bold leading-none" style={{ color }}>
                {score.total}
              </p>
              <p className="mt-1.5 text-[11px] font-bold tracking-[0.3em] text-ink2">/ 100</p>
            </div>
          </Ring>
          <p className="font-display mt-4 text-lg font-bold text-ink">{encouragement(score.total)}</p>

          <div className="mt-5 w-full max-w-[260px] rounded-lg border border-line bg-white p-3.5">
            <div className="flex items-center justify-between">
              <p className="lbl !mb-0">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                我的自评
              </p>
              <span className="font-num text-sm font-bold text-gold">
                {d.selfScore > 0 ? `${d.selfScore} / 10` : "未自评"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={d.selfScore}
              onChange={(e) => up((dd) => void (dd.selfScore = Number(e.target.value)))}
              className="slider mt-2.5"
              style={{ "--c": "#e8a33d", "--fill": `${(d.selfScore / 10) * 100}%` } as CSSProperties}
            />
            <div className="mt-1 flex justify-between text-[10px] font-bold text-ink2/70">
              <span>拖动打分</span>
              <span>10 = 满分的一天</span>
            </div>
          </div>
        </div>

        {/* 右：维度拆解 + 总结 */}
        <div>
          <p className="lbl">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-seal" />
            维度拆解 · 括号内为权重
          </p>
          <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {score.parts.map((p) => {
              const meta = MODULES[p.key];
              return (
                <div key={p.key} className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: meta.color }} />
                  <span className="w-16 shrink-0 text-xs font-bold text-ink">
                    {meta.label}
                    <span className="font-num ml-0.5 text-[10px] font-medium text-ink2">{p.weight}%</span>
                  </span>
                  <Bar value={p.score} color={meta.color} className="flex-1" height={7} />
                  <span className="font-num w-7 shrink-0 text-right text-xs font-bold" style={{ color: meta.color }}>
                    {p.score}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-lg border border-dashed border-line bg-paper/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="lbl !mb-0">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-pine" />
                今日总结 · 可一键复制
              </p>
              <button
                type="button"
                onClick={copySummary}
                className="flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-xs font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-seal hover:shadow-md active:translate-y-0"
              >
                <Icon name="copy" size={14} />
                复制总结
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-body text-xs leading-6 text-ink2">
              {buildSummary(d, date, score)}
            </pre>
          </div>
        </div>
      </div>
    </Card>
  );
}
