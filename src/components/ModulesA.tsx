import { useMemo, useState, type CSSProperties } from "react";
import {
  FITNESS_TYPES,
  MASTERY_META,
  MOODS,
  MODULES,
  PRIORITY_META,
  SLEEP_PRESETS,
  STUDY_TEMPLATES,
  WORK_TEMPLATES,
  addDays,
  fmtDur,
  keyOf,
  loadDay,
  moodOf,
  sleepSpanMin,
  uid,
  type DayData,
  type LedgerIndex,
  type Mastery,
  type MoodKey,
  type NightPoint,
  type Priority,
} from "../lib/core";
import { Bar, Card, Chip, DotCheck, EmptyHint, Icon, MoodFace, StarRating, type IconName } from "./ui";
import type { Phase } from "./Header";

export type Updater = (mut: (d: DayData) => void) => void;
export type Notify = (msg: string, action?: { label: string; fn: () => void }) => void;
export type PhaseMode = Phase | "all";

const tag = { label: "规划", bg: "#e8a33d" };
const rev = { label: "复盘", bg: "#46639e" };

/* ================= 工作 ================= */

export function WorkCard({
  d, date, up, notify, phase,
}: {
  d: DayData; date: Date; up: Updater; notify: Notify; phase: PhaseMode;
}) {
  const [text, setText] = useState("");
  const [pri, setPri] = useState<Priority>("mid");
  const [tagInput, setTagInput] = useState<Record<string, string>>({});
  const c = MODULES.work;
  const done = d.workItems.filter((i) => i.done).length;
  const pct = d.workItems.length ? (done / d.workItems.length) * 100 : 0;

  const yesterday = useMemo(() => loadDay(keyOf(addDays(date, -1))), [date]);
  const undone = yesterday.workItems.filter((i) => !i.done && i.text.trim());
  const canMigrate = undone.filter((u) => !d.workItems.some((x) => x.text === u.text));
  const yesterdayTip = yesterday.workTomorrow.trim();

  const add = () => {
    const t = text.trim();
    if (!t) return;
    up((dd) => void dd.workItems.push({ id: uid(), text: t, done: false, priority: pri, tags: [] }));
    setText("");
  };

  const sorted = useMemo(
    () =>
      [...d.workItems].sort((a, b) => {
        const w: Record<Priority, number> = { high: 0, mid: 1, low: 2 };
        return Number(a.done) - Number(b.done) || w[a.priority] - w[b.priority];
      }),
    [d.workItems]
  );

  return (
    <Card
      title="工作" en={c.en} color={c.color} icon="briefcase" hint={c.hint} progress={pct}
      phaseTag={phase === "plan" ? tag : phase === "review" ? rev : undefined}
    >
      {/* 规划：核心目标 */}
      {phase !== "review" && (
        <div className="mb-4">
          <p className="lbl">
            <Icon name="star" size={12} strokeWidth={2.4} />
            今日核心目标（1~3 条就够）
          </p>
          <div className="space-y-1.5">
            {d.workGoals.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-num w-4 shrink-0 text-center text-xs font-bold text-ink2">{i + 1}</span>
                <input
                  className="inp inp-ghost flex-1"
                  style={{ "--c": c.color } as CSSProperties}
                  placeholder={i === 0 ? "今天最重要的一件事…" : "选填"}
                  value={g}
                  onChange={(e) =>
                    up((dd) => {
                      dd.workGoals[i] = e.target.value;
                    })
                  }
                />
              </div>
            ))}
          </div>
          {yesterdayTip && (
            <button
              type="button"
              onClick={() =>
                up((dd) => {
                  const slot = dd.workGoals.findIndex((x) => !x.trim());
                  if (slot >= 0) dd.workGoals[slot] = yesterdayTip;
                })
              }
              className="mt-1.5 rounded-md border border-dashed border-[#b9c8de] bg-[#f4f8fd] px-2 py-1 text-[11px] text-[#3d74c0] transition-all hover:-translate-y-0.5 hover:border-solid active:translate-y-0"
            >
              昨日明日调整：「{yesterdayTip.slice(0, 18)}{yesterdayTip.length > 18 ? "…" : ""}」→ 填入目标
            </button>
          )}
        </div>
      )}

      {/* 迁移昨日未完成 */}
      {phase !== "review" && canMigrate.length > 0 && (
        <button
          type="button"
          onClick={() => {
            up((dd) => {
              canMigrate.forEach((u) =>
                dd.workItems.push({ ...u, id: uid(), tags: [...u.tags, "昨日遗留"] })
              );
            });
            notify(`已迁移 ${canMigrate.length} 条昨日未完成任务`);
          }}
          className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#b9c8de] bg-[#f4f8fd] py-2 text-xs font-bold text-[#3d74c0] transition-all hover:-translate-y-0.5 hover:border-solid hover:shadow-sm active:translate-y-0"
        >
          <Icon name="upload" size={13} strokeWidth={2.4} />
          迁移昨日未完成任务（{canMigrate.length}）
        </button>
      )}

      {/* 待办列表 */}
      {d.workItems.length === 0 && <EmptyHint text="还没有任务。写下今天要做的第一件事，哪怕很小。" />}
      {WORK_TEMPLATES.some((t) => !d.workItems.some((i) => i.text === t)) && phase !== "review" && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {WORK_TEMPLATES.filter((t) => !d.workItems.some((i) => i.text === t)).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => up((dd) => void dd.workItems.push({ id: uid(), text: t, done: false, priority: "mid", tags: [] }))}
              className="rounded-md border border-dashed border-[#b9c8de] bg-[#f4f8fd] px-2 py-1 text-[11px] font-medium text-[#3d74c0] transition-all hover:-translate-y-0.5 hover:border-solid hover:bg-[#e9f1fb] active:translate-y-0"
            >
              + {t}
            </button>
          ))}
        </div>
      )}

      <ul className="space-y-2">
        {sorted.map((it) => {
          const pm = PRIORITY_META[it.priority];
          return (
            <li key={it.id} className="group rounded-lg border border-line/80 bg-white px-3 py-2 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)] hover:shadow-sm">
              <div className="flex items-center gap-2.5">
                <DotCheck
                  checked={it.done}
                  color={c.color}
                  onToggle={() =>
                    up((dd) => {
                      const t = dd.workItems.find((x) => x.id === it.id);
                      if (t) t.done = !t.done;
                    })
                  }
                />
                <input
                  className={`inp inp-ghost min-w-0 flex-1 ${it.done ? "text-ink2 line-through" : ""}`}
                  value={it.text}
                  onChange={(e) =>
                    up((dd) => {
                      const t = dd.workItems.find((x) => x.id === it.id);
                      if (t) t.text = e.target.value;
                    })
                  }
                  placeholder="任务内容"
                />
                <select
                  aria-label="优先级"
                  className="cursor-pointer rounded-md border px-1.5 py-1 text-[10px] font-bold outline-none transition-colors"
                  style={{ borderColor: `${pm.color}55`, color: pm.color, background: `${pm.color}12` }}
                  value={it.priority}
                  onChange={(e) =>
                    up((dd) => {
                      const t = dd.workItems.find((x) => x.id === it.id);
                      if (t) t.priority = e.target.value as Priority;
                    })
                  }
                >
                  <option value="high">高</option>
                  <option value="mid">中</option>
                  <option value="low">低</option>
                </select>
                <button
                  type="button"
                  aria-label="删除任务"
                  onClick={() => {
                    const idx = d.workItems.findIndex((x) => x.id === it.id);
                    const item = { ...it };
                    up((dd) => {
                      dd.workItems = dd.workItems.filter((x) => x.id !== it.id);
                    });
                    notify("已删除任务", {
                      label: "撤销",
                      fn: () =>
                        up((dd) => {
                          if (dd.workItems.some((x) => x.id === item.id)) return;
                          dd.workItems.splice(Math.min(idx, dd.workItems.length), 0, item);
                        }),
                    });
                  }}
                  className="text-ink2/50 opacity-0 transition-all hover:scale-110 hover:text-seal group-hover:opacity-100"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
              {/* 标签 */}
              <div className="mt-1 flex flex-wrap items-center gap-1 pl-8">
                {it.tags.map((t) => (
                  <span key={t} className="group/t inline-flex items-center gap-0.5 rounded-full bg-[#eef1e8] px-1.5 py-0.5 text-[10px] font-medium text-pine">
                    #{t}
                    <button
                      type="button"
                      aria-label={`移除标签${t}`}
                      onClick={() =>
                        up((dd) => {
                          const x = dd.workItems.find((v) => v.id === it.id);
                          if (x) x.tags = x.tags.filter((v) => v !== t);
                        })
                      }
                      className="opacity-50 transition-opacity hover:opacity-100"
                    >
                      <Icon name="x" size={9} strokeWidth={3} />
                    </button>
                  </span>
                ))}
                <input
                  className="w-16 bg-transparent text-[10px] text-ink2 outline-none placeholder:text-ink2/40"
                  placeholder="+标签回车"
                  value={tagInput[it.id] ?? ""}
                  onChange={(e) => setTagInput((s) => ({ ...s, [it.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = (tagInput[it.id] ?? "").trim().replace(/^#/, "");
                      if (!v) return;
                      up((dd) => {
                        const x = dd.workItems.find((x2) => x2.id === it.id);
                        if (x && !x.tags.includes(v)) x.tags.push(v);
                      });
                      setTagInput((s) => ({ ...s, [it.id]: "" }));
                    }
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {phase !== "review" && (
        <div className="mt-3 flex gap-2">
          <div className="flex gap-1">
            {(["high", "mid", "low"] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPri(p)}
                className="rounded-md border px-2 py-1 text-[11px] font-bold transition-all"
                style={
                  pri === p
                    ? { background: PRIORITY_META[p].color, borderColor: PRIORITY_META[p].color, color: "#fff" }
                    : { borderColor: "#e3ddcd", color: "#9a9484" }
                }
              >
                {PRIORITY_META[p].label}
              </button>
            ))}
          </div>
          <input
            className="inp min-w-0 flex-1"
            style={{ "--c": c.color } as CSSProperties}
            placeholder="添加任务，回车确认…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button type="button" onClick={add} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0" style={{ background: c.color }}>
            <Icon name="plus" size={16} strokeWidth={2.6} />
          </button>
        </div>
      )}

      {d.workItems.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <Bar value={pct} color={c.color} className="flex-1" />
          <span className="font-num text-xs font-bold text-ink2">
            {done}/{d.workItems.length}
          </span>
        </div>
      )}

      {/* 复盘区 */}
      {phase !== "plan" && (
        <div className="mt-4 space-y-2 border-t border-dashed border-line pt-4">
          <p className="lbl !mb-1">
            <Icon name="pen" size={12} strokeWidth={2.4} />
            工作复盘
          </p>
          <input className="inp" style={{ "--c": c.color } as CSSProperties} placeholder="完成情况：今天推进了什么？" value={d.workNote} onChange={(e) => up((dd) => void (dd.workNote = e.target.value))} />
          <input className="inp" style={{ "--c": c.color } as CSSProperties} placeholder="卡点：什么阻碍了你？" value={d.workBlockers} onChange={(e) => up((dd) => void (dd.workBlockers = e.target.value))} />
          <input className="inp" style={{ "--c": c.color } as CSSProperties} placeholder="明日调整：明天最重要的事（可带入明日目标）" value={d.workTomorrow} onChange={(e) => up((dd) => void (dd.workTomorrow = e.target.value))} />
        </div>
      )}
    </Card>
  );
}

/* ================= 学习 ================= */

export function StudyCard({
  d, date, up, phase,
}: {
  d: DayData; date: Date; up: Updater; phase: PhaseMode;
}) {
  const c = MODULES.study;
  const planTotal = d.studyItems.reduce((s, i) => s + (i.planMin || 0), 0);
  const actTotal = d.studyItems.reduce((s, i) => s + (i.actualMin || 0), 0);
  const rate = planTotal > 0 ? Math.round((Math.min(actTotal, planTotal) / planTotal) * 100) : actTotal > 0 ? 100 : 0;
  const scorePct = d.studyItems.length
    ? (d.studyItems.reduce((s, i) => s + (i.planMin > 0 ? Math.min(i.actualMin / i.planMin, 1) : i.actualMin > 0 ? 1 : 0), 0) /
        d.studyItems.length) *
        78 +
      (d.studyItems.filter((i) => i.checked).length / d.studyItems.length) * 22
    : 0;

  const yesterday = useMemo(() => loadDay(keyOf(addDays(date, -1))), [date]);
  const carryText = yesterday.studyNext.trim();
  const reviewList = d.studyItems.filter((i) => i.toReview);

  const addRow = (subject = "") =>
    up((dd) => void dd.studyItems.push({ id: uid(), subject, planMin: 30, actualMin: 0, checked: false, mastery: "none", toReview: false }));

  return (
    <Card title="学习" en={c.en} color={c.color} icon="book" hint={c.hint} progress={scorePct} phaseTag={phase === "plan" ? tag : phase === "review" ? rev : undefined}>
      {phase !== "review" && carryText && !d.studyItems.some((i) => i.subject === carryText) && (
        <button
          type="button"
          onClick={() => addRow(carryText)}
          className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#a9d3d9] bg-[#f1fafb] py-2 text-xs font-bold text-[#2c8c99] transition-all hover:-translate-y-0.5 hover:border-solid hover:shadow-sm active:translate-y-0"
        >
          <Icon name="upload" size={13} strokeWidth={2.4} />
          带入昨日「下一步计划」：{carryText.slice(0, 16)}{carryText.length > 16 ? "…" : ""}
        </button>
      )}

      {d.studyItems.length === 0 && <EmptyHint text="今天要学什么？加一行：内容 + 计划分钟，晚上填实际。" />}

      {phase !== "review" && STUDY_TEMPLATES.some((t) => !d.studyItems.some((i) => i.subject === t)) && (
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold tracking-wider text-ink2">快速添加</span>
          {STUDY_TEMPLATES.filter((t) => !d.studyItems.some((i) => i.subject === t)).map((t) => (
            <button key={t} type="button" onClick={() => addRow(t)} className="rounded-md border border-dashed border-[#a9d3d9] bg-[#f1fafb] px-2 py-1 text-[11px] font-medium text-[#2c8c99] transition-all hover:-translate-y-0.5 hover:border-solid hover:bg-[#e4f5f7] active:translate-y-0">
              + {t}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {d.studyItems.map((it) => (
          <div key={it.id} className="group rounded-lg border border-line/80 bg-white px-3 py-2 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)] hover:shadow-sm">
            <div className="flex items-center gap-2">
              <input
                className="inp inp-ghost min-w-0 flex-1 font-medium"
                style={{ "--c": c.color } as CSSProperties}
                placeholder="学习内容"
                value={it.subject}
                onChange={(e) =>
                  up((dd) => {
                    const t = dd.studyItems.find((x) => x.id === it.id);
                    if (t) t.subject = e.target.value;
                  })
                }
              />
              <button type="button" aria-label="删除" onClick={() => up((dd) => void (dd.studyItems = dd.studyItems.filter((x) => x.id !== it.id)))} className="text-ink2/50 opacity-0 transition-all hover:scale-110 hover:text-seal group-hover:opacity-100">
                <Icon name="trash" size={16} />
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {phase !== "review" && (
                <label className="flex items-center gap-1 text-[11px] font-bold text-ink2">
                  规划
                  <input
                    type="number" min={0} max={720}
                    className="inp !w-16 !px-2 !py-1 text-center font-num text-xs"
                    style={{ "--c": c.color } as CSSProperties}
                    value={it.planMin || ""} placeholder="0"
                    onChange={(e) =>
                      up((dd) => {
                        const t = dd.studyItems.find((x) => x.id === it.id);
                        if (t) t.planMin = Math.max(0, Math.min(720, Number(e.target.value) || 0));
                      })
                    }
                  />
                  分钟
                </label>
              )}
              {phase !== "plan" && (
                <>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-ink2">
                    实际
                    <input
                      type="number" min={0} max={720}
                      className="inp !w-16 !px-2 !py-1 text-center font-num text-xs"
                      style={{ "--c": c.color } as CSSProperties}
                      value={it.actualMin || ""} placeholder="0"
                      onChange={(e) =>
                        up((dd) => {
                          const t = dd.studyItems.find((x) => x.id === it.id);
                          if (t) t.actualMin = Math.max(0, Math.min(720, Number(e.target.value) || 0));
                        })
                      }
                    />
                    分
                  </label>
                  <span className="flex gap-0.5">
                    {[25, 45].map((m) => (
                      <button key={m} type="button" title={`+${m} 分钟`} onClick={() => up((dd) => { const t = dd.studyItems.find((x) => x.id === it.id); if (t) t.actualMin = Math.min(720, (t.actualMin || 0) + m); })} className="rounded border border-[#cfe8ec] bg-white px-1 font-num text-[9px] font-bold text-[#2c8c99] transition-all hover:bg-[#e4f5f7] active:scale-90">
                        +{m}
                      </button>
                    ))}
                  </span>
                  <select
                    aria-label="掌握情况"
                    className="cursor-pointer rounded-md border px-1.5 py-1 text-[10px] font-bold outline-none"
                    style={{ borderColor: `${MASTERY_META[it.mastery].color}55`, color: MASTERY_META[it.mastery].color, background: `${MASTERY_META[it.mastery].color}12` }}
                    value={it.mastery}
                    onChange={(e) =>
                      up((dd) => {
                        const t = dd.studyItems.find((x) => x.id === it.id);
                        if (t) t.mastery = e.target.value as Mastery;
                      })
                    }
                  >
                    <option value="none">未掌握</option>
                    <option value="part">部分掌握</option>
                    <option value="full">已掌握</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => up((dd) => { const t = dd.studyItems.find((x) => x.id === it.id); if (t) t.toReview = !t.toReview; })}
                    className="rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all"
                    style={it.toReview ? { background: "#e8a33d", borderColor: "#e8a33d", color: "#fff" } : { borderColor: "#e3ddcd", color: "#9a9484" }}
                  >
                    {it.toReview ? "待复习" : "加入复习"}
                  </button>
                  <button
                    type="button"
                    aria-pressed={it.checked}
                    onClick={() => up((dd) => { const t = dd.studyItems.find((x) => x.id === it.id); if (t) t.checked = !t.checked; })}
                    className="ml-auto flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all hover:-translate-y-0.5"
                    style={it.checked ? { background: c.color, borderColor: c.color, color: "#fff" } : { background: "#fff", borderColor: "#e3ddcd", color: "#9a9484" }}
                  >
                    <Icon name="check" size={11} strokeWidth={3} />
                    {it.checked ? "已检查" : "检查"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {phase !== "review" && (
        <button type="button" onClick={() => addRow()} className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-white/60 py-2.5 text-xs font-bold text-ink2 transition-all hover:border-[color:var(--c)] hover:text-ink hover:shadow-sm" style={{ "--c": c.color } as CSSProperties}>
          <Icon name="plus" size={14} strokeWidth={2.6} />
          添加学习内容
        </button>
      )}

      {phase !== "plan" && reviewList.length > 0 && (
        <div className="mt-3 rounded-lg border border-[#f0ddb4] bg-[#fdf7ea] px-3 py-2">
          <p className="text-[10px] font-bold tracking-widest text-[#b07d1e]">待复习清单</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink">
            {reviewList.map((i) => i.subject || "（未命名）").join(" · ")}
          </p>
        </div>
      )}

      {d.studyItems.length > 0 && phase !== "plan" && (
        <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-line">
          <div className="flex items-center justify-between text-[11px] font-bold text-ink2">
            <span>
              执行率 <b className="font-num text-sm" style={{ color: c.color }}>{rate}%</b>
            </span>
            <span>
              规划 <b className="font-num text-ink">{planTotal}</b> 分 · 实际 <b className="font-num text-ink">{actTotal}</b> 分
            </span>
          </div>
          <Bar value={rate} color={c.color} className="mt-2" />
        </div>
      )}

      {phase !== "plan" && (
        <div className="mt-3 space-y-2">
          <input className="inp" style={{ "--c": c.color } as CSSProperties} placeholder="复盘：哪里没做到？怎么调整？" value={d.studyNote} onChange={(e) => up((dd) => void (dd.studyNote = e.target.value))} />
          <input className="inp" style={{ "--c": c.color } as CSSProperties} placeholder="下一步学习计划（明天自动提醒带入）" value={d.studyNext} onChange={(e) => up((dd) => void (dd.studyNext = e.target.value))} />
        </div>
      )}
    </Card>
  );
}

/* ================= 睡眠 ================= */

function TimeBlock({
  label, bedLabel, wakeLabel, bed, wake, onBed, onWake, color,
}: {
  label: string; bedLabel: string; wakeLabel: string; bed: string; wake: string;
  onBed: (v: string) => void; onWake: (v: string) => void; color: string;
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

export function SleepCard({
  d, up, phase, nights,
}: {
  d: DayData; up: Updater; phase: PhaseMode;
  nights: NightPoint[];
}) {
  const c = MODULES.sleep;
  const s = d.sleep;
  const plan = s.planBed && s.planWake ? sleepSpanMin(s.planBed, s.planWake) : null;
  const act = s.actBed && s.actWake ? sleepSpanMin(s.actBed, s.actWake) : null;
  const delta = act !== null && plan !== null ? act - plan : null;
  const avg = nights.filter((n) => n.hours !== null);
  const avgH = avg.length ? (avg.reduce((a, b) => a + (b.hours ?? 0), 0) / avg.length).toFixed(1) : null;

  return (
    <Card title="睡眠" en={c.en} color={c.color} icon="moon" hint={c.hint} phaseTag={phase === "plan" ? tag : phase === "review" ? rev : undefined}>
      {phase !== "review" && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold tracking-wider text-ink2">今晚计划</span>
          {SLEEP_PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => up((dd) => { dd.sleep.planBed = p.bed; dd.sleep.planWake = p.wake; })} className="rounded-full border border-[#d8e0ee] bg-[#f5f8fc] px-2.5 py-1 text-[11px] font-medium text-[#46639e] transition-all hover:-translate-y-0.5 hover:bg-[#eaf0f9] active:translate-y-0">
              {p.label} · {p.bed}–{p.wake}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-2.5 sm:grid-cols-3">
        {phase !== "review" && (
          <TimeBlock label="睡眠计划" bedLabel="入睡" wakeLabel="起床" bed={s.planBed} wake={s.planWake} color={c.color} onBed={(v) => up((dd) => void (dd.sleep.planBed = v))} onWake={(v) => up((dd) => void (dd.sleep.planWake = v))} />
        )}
        {phase !== "plan" && (
          <TimeBlock label="实际睡眠" bedLabel="入睡" wakeLabel="起床" bed={s.actBed} wake={s.actWake} color="#d9482b" onBed={(v) => up((dd) => void (dd.sleep.actBed = v))} onWake={(v) => up((dd) => void (dd.sleep.actWake = v))} />
        )}
        <TimeBlock label="明日规划" bedLabel="明晚" wakeLabel="明早" bed={s.nextBed} wake={s.nextWake} color="#2e6b54" onBed={(v) => up((dd) => void (dd.sleep.nextBed = v))} onWake={(v) => up((dd) => void (dd.sleep.nextWake = v))} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {plan !== null && (
          <span className="rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-ink2 shadow-sm ring-1 ring-line">
            计划 <b className="font-num text-ink">{fmtDur(plan)}</b>
          </span>
        )}
        {act !== null && (
          <span className="rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-ink2 shadow-sm ring-1 ring-line">
            实际 <b className="font-num" style={{ color: c.color }}>{fmtDur(act)}</b>
          </span>
        )}
        {delta !== null && delta !== 0 && (
          <span className="rounded-md px-2.5 py-1.5 text-xs font-bold" style={{ background: delta > 0 ? "color-mix(in srgb, #2e6b54 12%, #fff)" : "color-mix(in srgb, #d9482b 12%, #fff)", color: delta > 0 ? "#2e6b54" : "#d9482b" }}>
            比计划{delta > 0 ? "多睡" : "少睡"} {fmtDur(Math.abs(delta))}
          </span>
        )}
        {act !== null && Math.abs(act / 60 - 8) <= 1 && (
          <span className="rounded-md bg-pine/10 px-2.5 py-1.5 text-xs font-bold text-pine">黄金睡眠时长 ✓</span>
        )}
      </div>

      {phase !== "plan" && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-line/80 bg-white px-3.5 py-3">
          <span className="text-xs font-bold text-ink2">昨晚睡眠质量</span>
          <StarRating value={s.quality} onChange={(n) => up((dd) => void (dd.sleep.quality = n))} color="#e8a33d" size={24} />
          <span className="text-[11px] text-ink2">
            {s.quality === 0 ? "点星评分" : s.quality >= 4 ? "一夜好眠" : s.quality === 3 ? "中规中矩" : "没睡好，今晚早点休息"}
          </span>
        </div>
      )}

      {phase !== "plan" && nights.some((x) => x.hours !== null) && (
        <div className="mt-4 rounded-lg border border-[#dbe2ee] bg-[#f6f8fc] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold tracking-[0.14em] text-[#46639e]">近 7 晚睡眠</span>
            {avgH && <span className="rounded-full bg-white px-2 py-0.5 font-num text-[10px] font-bold text-[#46639e]">均 {avgH}h</span>}
          </div>
          <div className="relative h-16">
            <div className="absolute inset-x-0 z-10 border-t border-dashed border-[#46639e]/45" style={{ bottom: "80%" }}>
              <span className="absolute -top-2.5 right-0 font-num text-[9px] font-medium text-[#46639e]/75">8h</span>
            </div>
            <div className="absolute inset-0 flex items-end gap-1.5">
              {nights.map((ng) => (
                <div key={ng.key} className="flex-1 rounded-t-sm transition-all duration-500" title={ng.hours !== null ? `${ng.hours} 小时` : "未记录"} style={{ height: ng.hours !== null ? `${Math.min(100, ng.hours * 10)}%` : "4px", background: ng.hours === null ? "#dde2ec" : ng.hours >= 7.5 ? "#3e9c6e" : ng.hours >= 6 ? "#e8a33d" : "#d9482b" }} />
              ))}
            </div>
          </div>
          <div className="mt-1 flex gap-1.5">
            {nights.map((ng) => (
              <span key={ng.key} className="flex-1 text-center text-[9px] text-ink2">{ng.weekday}</span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ================= 情绪 ================= */

export function MoodCard({
  d, up, phase, index,
}: {
  d: DayData; up: Updater; phase: PhaseMode; index: LedgerIndex;
}) {
  const c = MODULES.mood;
  const m = moodOf(d.mood);
  const pct = m ? m.score * 0.65 + d.energy * 10 * 0.35 : d.energy * 3;

  /* 7 天情绪曲线 */
  const days = useMemo(() => {
    const arr: { key: string; label: string; mood: MoodKey | null }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dt = addDays(new Date(), -i);
      const k = keyOf(dt);
      arr.push({ key: k, label: `${dt.getMonth() + 1}/${dt.getDate()}`, mood: index[k]?.mood ?? null });
    }
    return arr;
  }, [index]);

  if (phase === "plan") return null as unknown as JSX.Element;

  return (
    <Card title="个人情绪" en={c.en} color={c.color} icon="star" hint={c.hint} progress={pct} phaseTag={rev}>
      <div className="flex items-center gap-3 rounded-lg border border-line/80 bg-white px-3.5 py-3">
        {m ? (
          <>
            <MoodFace mood={d.mood as MoodKey} size={38} active color={m.color} />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: m.color }}>今天感觉「{m.label}」</p>
              <p className="text-[11px] text-ink2">在页头可以修改打卡</p>
            </div>
            <span className="font-num rounded-md px-2 py-1 text-xs font-bold" style={{ background: `color-mix(in srgb, ${m.color} 14%, #fff)`, color: m.color }}>
              +{Math.round(m.score * 0.65)}
            </span>
          </>
        ) : (
          <>
            <MoodFace mood="calm" size={38} color="#c4bda9" />
            <div className="flex-1">
              <p className="text-sm font-bold text-ink2">还没选择心情</p>
              <p className="text-[11px] text-ink2">在页面顶部的表情里点一下</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="lbl !mb-0">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
            今日能量值
          </p>
          <span className="font-num rounded-md px-2 py-0.5 text-sm font-bold" style={{ background: `color-mix(in srgb, ${c.color} 12%, #fff)`, color: c.color }}>
            {d.energy} / 10
          </span>
        </div>
        <input
          type="range" min={1} max={10} step={1} value={d.energy}
          onChange={(e) => up((dd) => void (dd.energy = Number(e.target.value)))}
          className="slider"
          style={{ "--c": c.color, "--fill": `${((d.energy - 1) / 9) * 100}%` } as CSSProperties}
        />
        <div className="mt-1 flex justify-between text-[10px] font-bold tracking-wider text-ink2/70">
          <span>电量见底</span>
          <span>满电出发</span>
        </div>
      </div>

      {/* 7 天情绪曲线 */}
      <div className="mt-4 rounded-lg border border-line/80 bg-white p-3">
        <p className="text-[10px] font-bold tracking-[0.16em] text-ink2">近 7 天情绪曲线</p>
        <div className="mt-2 flex items-end gap-1.5">
          {days.map((dy) => {
            const def = moodOf(dy.mood);
            return (
              <div key={dy.key} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-num text-[9px] font-bold" style={{ color: def?.color ?? "#cfc7b2" }}>
                  {def ? def.label : "·"}
                </span>
                <span className="h-8 w-full max-w-[26px] overflow-hidden rounded-full bg-black/5 flex items-end" style={{ display: "flex" }}>
                  <span
                    className="w-full rounded-full transition-all duration-700"
                    style={{ height: def ? `${Math.max(20, def.score * 0.32)}%` : "8%", background: def?.color ?? "#ddd6c4" }}
                  />
                </span>
                <span className="text-[9px] text-ink2">{dy.label.split("/")[1]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <textarea
        className="inp mt-4 resize-none"
        style={{ "--c": c.color } as CSSProperties}
        rows={2}
        placeholder="是什么引发了这种情绪？写下来就轻了一半…"
        value={d.moodNote}
        onChange={(e) => up((dd) => void (dd.moodNote = e.target.value))}
      />
    </Card>
  );
}

/* ================= 健身 ================= */

export function FitnessCard({
  d, up, phase,
}: {
  d: DayData; up: Updater; phase: PhaseMode;
}) {
  const c = MODULES.fitness;
  const f = d.fitness;
  let pct = 0;
  if (f.plan.trim() || f.detail.trim()) pct += 35;
  if (f.actual.trim()) pct += 45;
  if (f.next.trim()) pct += 12;
  if (f.feel.trim()) pct += 8;

  return (
    <Card title="健身" en={c.en} color={c.color} icon="dumbbell" hint={c.hint} progress={pct} phaseTag={phase === "plan" ? tag : phase === "review" ? rev : undefined}>
      {phase !== "review" && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {FITNESS_TYPES.map((t) => (
              <Chip key={t} active={f.plan === t} color={c.color} onClick={() => up((dd) => void (dd.fitness.plan = dd.fitness.plan === t ? "" : t))}>
                {t}
              </Chip>
            ))}
          </div>
          <input className="inp mt-2.5" style={{ "--c": c.color } as CSSProperties} placeholder="组数 / 时长 / 动作安排，例如：深蹲 4×12 + 慢跑 30 分" value={f.detail} onChange={(e) => up((dd) => void (dd.fitness.detail = e.target.value))} />
        </>
      )}
      {phase !== "plan" && (
        <div className="space-y-2.5">
          <textarea className="inp resize-none" style={{ "--c": c.color } as CSSProperties} rows={2} placeholder="实际完成情况：练了什么？感觉如何？" value={f.actual} onChange={(e) => up((dd) => void (dd.fitness.actual = e.target.value))} />
          <div className="flex gap-2">
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-line/80 bg-white px-3 py-2">
              <Icon name="gauge" size={15} className="text-ink2" />
              <input className="inp inp-ghost !px-1 font-num" style={{ "--c": c.color } as CSSProperties} placeholder="体重 kg（选填）" value={f.weight} onChange={(e) => up((dd) => void (dd.fitness.weight = e.target.value))} />
            </label>
            <input className="inp min-w-0 flex-[1.4]" style={{ "--c": c.color } as CSSProperties} placeholder="身体感受：酸爽 / 疲惫 / 充电…" value={f.feel} onChange={(e) => up((dd) => void (dd.fitness.feel = e.target.value))} />
          </div>
          <input className="inp" style={{ "--c": c.color } as CSSProperties} placeholder="下一步健身安排（下次练什么）" value={f.next} onChange={(e) => up((dd) => void (dd.fitness.next = e.target.value))} />
        </div>
      )}
      {pct === 0 && <EmptyHint text="先选个训练类型，哪怕今天只是拉伸 10 分钟。" />}
    </Card>
  );
}

export { MOODS };
