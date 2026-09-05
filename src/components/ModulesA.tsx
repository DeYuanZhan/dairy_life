import { useState } from "react";
import {
  MODULES,
  moodOf,
  uid,
  type DayData,
  type MoodKey,
} from "../lib/core";
import { Bar, Card, Chip, DotCheck, EmptyHint, Icon, MoodFace, type IconName } from "./ui";

export type Updater = (mut: (d: DayData) => void) => void;

/* ================= 工作 ================= */

export function WorkCard({ d, up }: { d: DayData; up: Updater }) {
  const [text, setText] = useState("");
  const c = MODULES.work;
  const done = d.workItems.filter((i) => i.done).length;
  const pct = d.workItems.length ? (done / d.workItems.length) * 100 : 0;

  const add = () => {
    const t = text.trim();
    if (!t) return;
    up((dd) => {
      dd.workItems.push({ id: uid(), text: t, done: false });
    });
    setText("");
  };

  return (
    <Card title="工作" en={c.en} color={c.color} icon="briefcase" hint={c.hint} progress={pct}>
      {d.workItems.length === 0 && (
        <EmptyHint text="还没有任务。写下今天要做的第一件事，哪怕很小。" />
      )}
      <ul className="space-y-2">
        {d.workItems.map((it) => (
          <li
            key={it.id}
            className="group flex items-center gap-2.5 rounded-lg border border-line/80 bg-white px-3 py-2 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)] hover:shadow-sm"
          >
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
              className="inp inp-ghost flex-1"
              value={it.text}
              onChange={(e) =>
                up((dd) => {
                  const t = dd.workItems.find((x) => x.id === it.id);
                  if (t) t.text = e.target.value;
                })
              }
              placeholder="任务内容"
            />
            <span
              className={`text-[11px] font-bold transition-opacity ${it.done ? "opacity-100" : "opacity-0"}`}
              style={{ color: c.color }}
            >
              完成
            </span>
            <button
              type="button"
              aria-label="删除任务"
              onClick={() =>
                up((dd) => {
                  dd.workItems = dd.workItems.filter((x) => x.id !== it.id);
                })
              }
              className="text-ink2/50 opacity-0 transition-all hover:scale-110 hover:text-seal group-hover:opacity-100"
            >
              <Icon name="trash" size={16} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <input
          className="inp flex-1"
          style={{ "--c": c.color } as React.CSSProperties}
          placeholder="添加任务，回车确认…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 rounded-lg px-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          style={{ background: c.color }}
        >
          <Icon name="plus" size={15} strokeWidth={2.6} />
          添加
        </button>
      </div>

      {d.workItems.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <Bar value={pct} color={c.color} className="flex-1" />
          <span className="font-num text-xs font-bold text-ink2">
            {done}/{d.workItems.length}
          </span>
        </div>
      )}

      <textarea
        className="inp mt-3 resize-none"
        style={{ "--c": c.color } as React.CSSProperties}
        rows={2}
        placeholder="今日复盘 / 明天最重要的一件事…"
        value={d.workNote}
        onChange={(e) => up((dd) => void (dd.workNote = e.target.value))}
      />
    </Card>
  );
}

/* ================= 生活（衣食住行） ================= */

const LIFE_ROWS: {
  k: keyof DayData["life"];
  char: string;
  icon: IconName;
  ph: string;
}[] = [
  { k: "food", char: "食", icon: "bowl", ph: "三餐吃了什么？" },
  { k: "clothing", char: "衣", icon: "shirt", ph: "穿搭 / 添置 / 洗护" },
  { k: "home", char: "住", icon: "home", ph: "家务 / 居家小事" },
  { k: "transport", char: "行", icon: "bus", ph: "通勤 / 去了哪里" },
];

export function LifeCard({ d, up }: { d: DayData; up: Updater }) {
  const c = MODULES.life;
  const filled = LIFE_ROWS.filter((r) => d.life[r.k].trim()).length;
  return (
    <Card title="生活" en={c.en} color={c.color} icon="bowl" hint={c.hint} progress={(filled / 4) * 100}>
      <div className="space-y-2.5">
        {LIFE_ROWS.map((r) => (
          <div
            key={r.k}
            className="flex items-center gap-3 rounded-lg border border-line/80 bg-white px-3 py-2 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)] hover:shadow-sm"
          >
            <span
              className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm font-black"
              style={{ background: `color-mix(in srgb, ${c.color} 12%, #fff)`, color: c.color }}
            >
              {r.char}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-ink2">
                <Icon name={r.icon} size={11} strokeWidth={2.2} />
                {r.ph.split(" ")[0]}
              </p>
              <input
                className="inp inp-ghost mt-0.5 !py-0.5 text-sm"
                style={{ "--c": c.color } as React.CSSProperties}
                placeholder={r.ph}
                value={d.life[r.k]}
                onChange={(e) =>
                  up((dd) => {
                    dd.life[r.k] = e.target.value;
                  })
                }
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-ink2">
        已记录 <b className="font-num" style={{ color: c.color }}>{filled}</b> / 4 项 · 好好生活本身就是正事
      </p>
    </Card>
  );
}

/* ================= 活动 ================= */

const ACT_TYPES = ["聚餐", "电影", "逛街", "演出", "看展", "运动", "散步", "其他"];

export function ActivitiesCard({ d, up }: { d: DayData; up: Updater }) {
  const c = MODULES.activities;
  const [type, setType] = useState("聚餐");
  const [note, setNote] = useState("");

  const add = () => {
    const n = note.trim();
    if (!n) return;
    up((dd) => {
      dd.activities.push({ id: uid(), type, note: n });
    });
    setNote("");
  };

  return (
    <Card
      title="活动"
      en={c.en}
      color={c.color}
      icon="ticket"
      hint={c.hint}
      progress={Math.min(100, d.activities.length * 50)}
    >
      <div className="flex flex-wrap gap-1.5">
        {ACT_TYPES.map((t) => (
          <Chip key={t} active={type === t} color={c.color} onClick={() => setType(t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="inp flex-1"
          style={{ "--c": c.color } as React.CSSProperties}
          placeholder="和谁？做了什么？回车记录…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 rounded-lg px-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          style={{ background: c.color }}
        >
          <Icon name="plus" size={15} strokeWidth={2.6} />
          记一笔
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {d.activities.length === 0 && <EmptyHint text="今天的快乐时刻还空着——聚餐、电影、逛街，发生了什么？" />}
        {d.activities.map((a) => (
          <div
            key={a.id}
            className="group flex items-center gap-2.5 rounded-lg border border-line/80 bg-white px-3 py-2 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)] hover:shadow-sm"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
            <span
              className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold"
              style={{ background: `color-mix(in srgb, ${c.color} 14%, #fff)`, color: c.color }}
            >
              {a.type}
            </span>
            <input
              className="inp inp-ghost min-w-0 flex-1"
              style={{ "--c": c.color } as React.CSSProperties}
              value={a.note}
              onChange={(e) =>
                up((dd) => {
                  const t = dd.activities.find((x) => x.id === a.id);
                  if (t) t.note = e.target.value;
                })
              }
              placeholder="补充细节…"
            />
            <button
              type="button"
              aria-label="删除活动"
              onClick={() =>
                up((dd) => {
                  dd.activities = dd.activities.filter((x) => x.id !== a.id);
                })
              }
              className="text-ink2/50 opacity-0 transition-all hover:scale-110 hover:text-seal group-hover:opacity-100"
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ================= 生活记录 ================= */

const RECORD_TILES: {
  k: keyof DayData["records"];
  icon: IconName;
  label: string;
  sub: string;
}[] = [
  { k: "vlog", icon: "video", label: "Vlog", sub: "拍一段日常" },
  { k: "photo", icon: "camera", label: "拍照", sub: "留下今日画面" },
  { k: "social", icon: "users", label: "社交", sub: "和朋友聊了天" },
  { k: "showcase", icon: "spark", label: "展示面", sub: "更新动态形象" },
];

export function RecordsCard({ d, up }: { d: DayData; up: Updater }) {
  const c = MODULES.records;
  const count = RECORD_TILES.filter((t) => d.records[t.k]).length;
  return (
    <Card title="生活记录" en={c.en} color={c.color} icon="camera" hint={c.hint} progress={(count / 4) * 100}>
      <div className="grid grid-cols-2 gap-2.5">
        {RECORD_TILES.map((t) => {
          const on = d.records[t.k];
          return (
            <button
              key={t.k}
              type="button"
              aria-pressed={on}
              onClick={() =>
                up((dd) => {
                  dd.records[t.k] = !dd.records[t.k];
                })
              }
              className="group relative flex flex-col items-start gap-1.5 rounded-lg border-2 px-3.5 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
              style={{
                borderColor: on ? c.color : "#e3ddcd",
                background: on ? `color-mix(in srgb, ${c.color} 9%, #ffffff)` : "#ffffff",
              }}
            >
              <span
                className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full transition-all duration-200"
                style={{
                  background: on ? c.color : "#efeadd",
                  color: on ? "#fff" : "#b3ac99",
                  transform: on ? "scale(1)" : "scale(0.85)",
                }}
              >
                <Icon name="check" size={11} strokeWidth={3.2} />
              </span>
              <span style={{ color: on ? c.color : "#9a9484" }} className="transition-colors">
                <Icon name={t.icon} size={22} />
              </span>
              <span>
                <span className={`block text-sm font-bold ${on ? "text-ink" : "text-ink2"}`}>{t.label}</span>
                <span className="block text-[11px] text-ink2">{t.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
      <input
        className="inp mt-3"
        style={{ "--c": c.color } as React.CSSProperties}
        placeholder="补一句：今天最值得回味的画面…"
        value={d.recordNote}
        onChange={(e) => up((dd) => void (dd.recordNote = e.target.value))}
      />
      <p className="mt-2.5 text-center text-[11px] text-ink2">
        已打卡 <b className="font-num" style={{ color: c.color }}>{count}</b> / 4
        {count === 4 && <span className="ml-1 font-bold text-seal">· 全满贯！</span>}
      </p>
    </Card>
  );
}

/* ================= 心情 ================= */

export function MoodCard({
  d,
  up,
}: {
  d: DayData;
  up: Updater;
}) {
  const c = MODULES.mood;
  const m = moodOf(d.mood);
  const pct = m ? m.score * 0.65 + d.energy * 10 * 0.35 : d.energy * 3;

  return (
    <Card title="个人状态" en={c.en} color={c.color} icon="star" hint={c.hint} progress={pct}>
      <div className="flex items-center gap-3 rounded-lg border border-line/80 bg-white px-3.5 py-3">
        {m ? (
          <>
            <MoodFace mood={d.mood as MoodKey} size={38} active color={m.color} />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: m.color }}>
                今天感觉「{m.label}」
              </p>
              <p className="text-[11px] text-ink2">已在页头打卡，去页头可以修改</p>
            </div>
            <span
              className="font-num rounded-md px-2 py-1 text-xs font-bold"
              style={{ background: `color-mix(in srgb, ${m.color} 14%, #fff)`, color: m.color }}
            >
              +{Math.round(m.score * 0.65)}
            </span>
          </>
        ) : (
          <>
            <MoodFace mood="okay" size={38} color="#c4bda9" />
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
          <span
            className="font-num rounded-md px-2 py-0.5 text-sm font-bold"
            style={{ background: `color-mix(in srgb, ${c.color} 12%, #fff)`, color: c.color }}
          >
            {d.energy} / 10
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={d.energy}
          onChange={(e) => up((dd) => void (dd.energy = Number(e.target.value)))}
          className="slider"
          style={{ "--c": c.color, "--fill": `${((d.energy - 1) / 9) * 100}%` } as React.CSSProperties}
        />
        <div className="mt-1 flex justify-between text-[10px] font-bold tracking-wider text-ink2/70">
          <span>电量见底</span>
          <span>满电出发</span>
        </div>
      </div>

      <textarea
        className="inp mt-4 resize-none"
        style={{ "--c": c.color } as React.CSSProperties}
        rows={2}
        placeholder="发生了什么让你有这种感觉？写下来就轻了一半…"
        value={d.moodNote}
        onChange={(e) => up((dd) => void (dd.moodNote = e.target.value))}
      />
    </Card>
  );
}
