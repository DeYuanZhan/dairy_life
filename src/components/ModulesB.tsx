import { useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ACT_TYPES,
  MODULES,
  RECORD_TAG_PRESETS,
  buildSummary,
  compressImage,
  encouragement,
  scoreVerdict,
  uid,
  type DayData,
  type DayScore,
  type ExpenseItem,
  type ModuleKey,
  type Settings,
} from "../lib/core";
import { Bar, Card, Chip, DotCheck, EmptyHint, Icon, Ring, type IconName } from "./ui";
import type { Notify, PhaseMode, Updater } from "./ModulesA";

const tag = { label: "规划", bg: "#e8a33d" };
const rev = { label: "复盘", bg: "#46639e" };

/* ================= 生活（衣食住行 + 消费） ================= */

export function LifeCard({
  d, up, phase, spendingOn, notify,
}: {
  d: DayData; up: Updater; phase: PhaseMode; spendingOn: boolean; notify: Notify;
}) {
  const c = MODULES.life;
  const L = d.life;
  const [expItem, setExpItem] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const total = d.expenses.reduce((s, e) => s + e.amount, 0);

  const fields = [L.breakfast, L.lunch, L.dinner, L.water > 0 ? "w" : "", L.location || L.transport, L.home || L.shopping].filter(Boolean).length;
  const pct = (fields / 6) * 100;

  const addExpense = () => {
    const item = expItem.trim();
    const amount = Number(expAmt);
    if (!item || !amount || amount <= 0) return;
    up((dd) => void dd.expenses.push({ id: uid(), item, amount }));
    setExpItem("");
    setExpAmt("");
  };

  return (
    <Card title="生活" en={c.en} color={c.color} icon="bowl" hint={c.hint} progress={pct} phaseTag={phase === "plan" ? tag : phase === "review" ? rev : undefined}>
      {/* 三餐 + 饮水 */}
      <div className="space-y-2">
        <p className="lbl !mb-1">
          <Icon name="bowl" size={12} strokeWidth={2.4} />
          饮食 · 三餐与饮水
        </p>
        <div className="grid gap-1.5 sm:grid-cols-3">
          {([
            ["breakfast", "早餐", "豆浆油条？"],
            ["lunch", "午餐", "吃了什么？"],
            ["dinner", "晚餐", "吃了什么？"],
          ] as const).map(([k, label, ph]) => (
            <label key={k} className="rounded-lg border border-line/80 bg-white px-2.5 py-1.5 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)]">
              <span className="block text-[10px] font-bold text-ink2">{label}</span>
              <input className="inp inp-ghost !px-1 !py-0.5 text-sm" style={{ "--c": c.color } as CSSProperties} placeholder={ph} value={L[k]} onChange={(e) => up((dd) => void (dd.life[k] = e.target.value))} />
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-line/80 bg-white px-3 py-2">
          <span className="text-[11px] font-bold text-ink2">饮水</span>
          <button type="button" aria-label="减少一杯水" onClick={() => up((dd) => void (dd.life.water = Math.max(0, dd.life.water - 1)))} className="grid h-7 w-7 place-items-center rounded-full border border-line text-ink2 transition-all hover:scale-110 hover:border-[#3e9c6e] hover:text-pine active:scale-95">
            −
          </button>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 8 }, (_, i) => (
              <button key={i} type="button" aria-label={`${i + 1} 杯水`} onClick={() => up((dd) => void (dd.life.water = i + 1 === dd.life.water ? i : i + 1))} className="transition-transform hover:scale-125">
                <svg width="12" height="16" viewBox="0 0 12 16">
                  <path d="M2 1.5h8l-1 13H3Z" fill={i < L.water ? "#4a9fd8" : "none"} stroke={i < L.water ? "#4a9fd8" : "#cfc7b2"} strokeWidth="1.3" strokeLinejoin="round" style={{ transition: "all .2s" }} />
                </svg>
              </button>
            ))}
          </div>
          <span className="font-num ml-auto text-xs font-bold text-[#4a9fd8]">{L.water} 杯</span>
        </div>
        <input className="inp" style={{ "--c": c.color } as CSSProperties} placeholder="忌口 / 减脂饮食备注（选填）" value={L.dietNote} onChange={(e) => up((dd) => void (dd.life.dietNote = e.target.value))} />
      </div>

      {/* 出行 + 居住 */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <label className="rounded-lg border border-line/80 bg-white px-3 py-2 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)]">
          <span className="flex items-center gap-1 text-[10px] font-bold text-ink2">
            <Icon name="bus" size={11} strokeWidth={2.4} />
            出行 · 通勤 / 外出地点
          </span>
          <input className="inp inp-ghost !px-1 mt-0.5 text-sm" style={{ "--c": c.color } as CSSProperties} placeholder="公司 / 咖啡馆 / 交通方式" value={L.location} onChange={(e) => up((dd) => void (dd.life.location = e.target.value))} />
        </label>
        <label className="rounded-lg border border-line/80 bg-white px-3 py-2 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)]">
          <span className="flex items-center gap-1 text-[10px] font-bold text-ink2">
            <Icon name="home" size={11} strokeWidth={2.4} />
            居住 · 家务 / 整理
          </span>
          <input className="inp inp-ghost !px-1 mt-0.5 text-sm" style={{ "--c": c.color } as CSSProperties} placeholder="晾衣服 / 大扫除…" value={L.home} onChange={(e) => up((dd) => void (dd.life.home = e.target.value))} />
        </label>
      </div>
      <input className="inp mt-2" style={{ "--c": c.color } as CSSProperties} placeholder="采购清单：今天想买 / 要买的东西" value={L.shopping} onChange={(e) => up((dd) => void (dd.life.shopping = e.target.value))} />

      {/* 消费记账 */}
      {spendingOn && (
        <div className="mt-4 rounded-lg border border-[#e7d9b8] bg-[#fcf8ee] p-3">
          <p className="lbl !mb-2" style={{ color: "#a5791c" }}>
            <Icon name="wallet" size={12} strokeWidth={2.4} />
            当日消费 · 已花 <b className="font-num">¥{total.toFixed(0)}</b>
          </p>
          {d.expenses.length === 0 && <p className="text-[11px] text-ink2">今天花了哪些钱？记一笔，月底不糊涂。</p>}
          <div className="space-y-1.5">
            {d.expenses.map((e: ExpenseItem) => (
              <div key={e.id} className="group flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 shadow-sm">
                <span className="flex-1 truncate text-xs text-ink">{e.item}</span>
                <span className="font-num text-xs font-bold text-[#a5791c]">¥{e.amount.toFixed(0)}</span>
                <button type="button" aria-label="删除支出" onClick={() => up((dd) => void (dd.expenses = dd.expenses.filter((x) => x.id !== e.id)))} className="text-ink2/40 opacity-0 transition-all hover:text-seal group-hover:opacity-100">
                  <Icon name="x" size={12} strokeWidth={2.6} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5">
            <input className="inp !py-1.5 min-w-0 flex-1" style={{ "--c": "#a5791c" } as CSSProperties} placeholder="项目，如：午饭" value={expItem} onChange={(e) => setExpItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addExpense()} />
            <input className="inp !py-1.5 !w-20 font-num" style={{ "--c": "#a5791c" } as CSSProperties} placeholder="金额" type="number" min={0} value={expAmt} onChange={(e) => setExpAmt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addExpense()} />
            <button type="button" onClick={addExpense} className="rounded-lg bg-[#a5791c] px-3 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
              记一笔
            </button>
          </div>
        </div>
      )}
      {spendingOn && d.expenses.length > 0 && (
        <button type="button" onClick={() => { up((dd) => void (dd.expenses = [])); notify("已清空今日账单"); }} className="mt-1.5 text-[10px] text-ink2/70 underline-offset-2 hover:underline">
          清空今日账单
        </button>
      )}
    </Card>
  );
}

/* ================= 活动 ================= */

export function ActivitiesCard({
  d, up, notify, phase,
}: {
  d: DayData; up: Updater; notify: Notify; phase: PhaseMode;
}) {
  const c = MODULES.activities;
  const [type, setType] = useState("聚餐");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState("");
  const [note, setNote] = useState("");

  const add = () => {
    if (!note.trim() && !people.trim()) return;
    up((dd) => void dd.activities.push({ id: uid(), type, time, people: people.trim(), note: note.trim() }));
    setNote("");
    setPeople("");
    setTime("");
  };

  return (
    <Card title="日常活动" en={c.en} color={c.color} icon="ticket" hint={c.hint} progress={Math.min(100, d.activities.length * 50)} phaseTag={phase === "plan" ? tag : phase === "review" ? rev : undefined}>
      <div className="flex flex-wrap gap-1.5">
        {ACT_TYPES.map((t) => (
          <Chip key={t} active={type === t} color={c.color} onClick={() => setType(t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-lg border border-line/80 bg-white px-2.5 py-1.5">
          <span className="text-[10px] font-bold text-ink2">时间</span>
          <input type="time" className="inp !py-1 !px-1 font-num text-xs" style={{ "--c": c.color } as CSSProperties} value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <input className="inp !py-1.5" style={{ "--c": c.color } as CSSProperties} placeholder="参与人：和谁一起？" value={people} onChange={(e) => setPeople(e.target.value)} />
      </div>
      <div className="mt-1.5 flex gap-2">
        <input className="inp flex-1" style={{ "--c": c.color } as CSSProperties} placeholder={phase === "plan" ? "打算做什么？回车记录…" : "发生了什么？感受如何？"} value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button type="button" onClick={add} className="flex items-center gap-1 rounded-lg px-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0" style={{ background: c.color }}>
          <Icon name="plus" size={15} strokeWidth={2.6} />
          {phase === "plan" ? "安排" : "记一笔"}
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {d.activities.length === 0 && <EmptyHint text={phase === "plan" ? "今天有什么安排？聚餐、电影、逛街…先写下来。" : "今天的快乐时刻还空着——发生了什么？"} />}
        {d.activities.map((a) => (
          <div key={a.id} className="group flex items-center gap-2.5 rounded-lg border border-line/80 bg-white px-3 py-2 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)] hover:shadow-sm">
            <span
              className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold"
              style={{ background: `color-mix(in srgb, ${c.color} 14%, #fff)`, color: c.color }}
            >
              {a.type}
            </span>
            {a.time && <span className="font-num shrink-0 text-[10px] font-bold text-ink2">{a.time}</span>}
            <div className="min-w-0 flex-1">
              {a.people && <p className="text-[10px] font-bold text-ink2">与 {a.people}</p>}
              <input className="inp inp-ghost !py-0.5 min-w-0 text-sm" style={{ "--c": c.color } as CSSProperties} value={a.note} onChange={(e) => up((dd) => { const t = dd.activities.find((x) => x.id === a.id); if (t) t.note = e.target.value; })} placeholder="感想 / 细节…" />
            </div>
            <button
              type="button"
              aria-label="删除活动"
              onClick={() => {
                const idx = d.activities.findIndex((x) => x.id === a.id);
                const item = { ...a };
                up((dd) => void (dd.activities = dd.activities.filter((x) => x.id !== a.id)));
                notify("已删除活动", { label: "撤销", fn: () => up((dd) => { if (!dd.activities.some((x) => x.id === item.id)) dd.activities.splice(Math.min(idx, dd.activities.length), 0, item); }) });
              }}
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

/* ================= 生活记录（照片 / 随笔 / 标签 / 隐私） ================= */

const RECORD_TILES: { k: keyof DayData["records"]; icon: IconName; label: string; sub: string }[] = [
  { k: "vlog", icon: "video", label: "Vlog", sub: "拍一段日常" },
  { k: "photo", icon: "camera", label: "拍照", sub: "留下今日画面" },
  { k: "social", icon: "users", label: "社交", sub: "和朋友聊了天" },
  { k: "showcase", icon: "spark", label: "展示面", sub: "更新动态形象" },
];

export function RecordsCard({
  d, up, notify,
}: {
  d: DayData; up: Updater; notify: Notify;
}) {
  const c = MODULES.records;
  const fileRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState("");
  const count = RECORD_TILES.filter((t) => d.records[t.k]).length;
  const pct = (count / 4) * 70 + (d.photos.length ? 15 : 0) + (d.recordNote.trim() ? 15 : 0);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files).slice(0, 9 - d.photos.length);
    try {
      const urls = await Promise.all(list.map((f) => compressImage(f)));
      up((dd) => void dd.photos.push(...urls));
      notify(`已添加 ${urls.length} 张照片（自动压缩）`);
    } catch {
      notify("照片读取失败，请换一张试试");
    }
  };

  const addTag = (t: string) => {
    const v = t.trim().replace(/^#/, "");
    if (!v || d.recordTags.includes(v)) return;
    up((dd) => void dd.recordTags.push(v));
  };

  return (
    <Card title="生活记录" en={c.en} color={c.color} icon="camera" hint={c.hint} progress={pct} phaseTag={rev}>
      {/* 隐私切换 */}
      <div className="mb-3 flex items-center justify-between rounded-lg border border-line/80 bg-white px-3 py-2.5">
        <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
          <Icon name={d.isPublic ? "globe" : "lock"} size={14} className={d.isPublic ? "text-pine" : "text-ink2"} />
          {d.isPublic ? "可对外展示" : "私密记录"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={d.isPublic}
          onClick={() => up((dd) => void (dd.isPublic = !dd.isPublic))}
          className="relative h-5 w-9 rounded-full transition-colors duration-300"
          style={{ background: d.isPublic ? "#3e9c6e" : "#ddd6c4" }}
        >
          <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300" style={{ left: d.isPublic ? "calc(100% - 18px)" : "2px" }} />
        </button>
      </div>

      {/* 照片 */}
      <div className="grid grid-cols-4 gap-1.5">
        {d.photos.map((p, i) => (
          <div key={i} className="group/photo relative aspect-square overflow-hidden rounded-lg border border-line">
            <img src={p} alt={`生活照片 ${i + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover/photo:scale-110" />
            <button
              type="button"
              aria-label="删除照片"
              onClick={() => up((dd) => void dd.photos.splice(i, 1))}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition-all hover:bg-seal group-hover/photo:opacity-100"
            >
              <Icon name="x" size={10} strokeWidth={3} />
            </button>
          </div>
        ))}
        {d.photos.length < 9 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line bg-white/60 text-ink2 transition-all hover:-translate-y-0.5 hover:border-[#a24e9c] hover:text-[#a24e9c] active:translate-y-0"
          >
            <Icon name="photo" size={20} />
            <span className="text-[10px] font-bold">加照片</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} />

      {/* 打卡格 */}
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {RECORD_TILES.map((t) => {
          const on = d.records[t.k];
          return (
            <button
              key={t.k}
              type="button"
              aria-pressed={on}
              title={t.sub}
              onClick={() => up((dd) => void (dd.records[t.k] = !dd.records[t.k]))}
              className="flex flex-col items-center gap-1 rounded-lg border-2 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
              style={{ borderColor: on ? c.color : "#e9e3d4", background: on ? `color-mix(in srgb, ${c.color} 9%, #ffffff)` : "#ffffff" }}
            >
              <span style={{ color: on ? c.color : "#9a9484" }} className="transition-colors">
                <Icon name={t.icon} size={18} />
              </span>
              <span className={`text-[10px] font-bold ${on ? "text-ink" : "text-ink2"}`}>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 随笔 */}
      <textarea className="inp mt-3 resize-none" style={{ "--c": c.color } as CSSProperties} rows={2} placeholder="简短随笔：今天最值得回味的画面…" value={d.recordNote} onChange={(e) => up((dd) => void (dd.recordNote = e.target.value))} />

      {/* 标签 */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {d.recordTags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: `color-mix(in srgb, ${c.color} 14%, #fff)`, color: c.color }}>
            #{t}
            <button type="button" aria-label={`移除标签${t}`} onClick={() => up((dd) => void (dd.recordTags = dd.recordTags.filter((x) => x !== t)))} className="opacity-60 hover:opacity-100">
              <Icon name="x" size={9} strokeWidth={3} />
            </button>
          </span>
        ))}
        {RECORD_TAG_PRESETS.filter((t) => !d.recordTags.includes(t)).slice(0, 5).map((t) => (
          <button key={t} type="button" onClick={() => addTag(t)} className="rounded-full border border-dashed border-line px-2 py-0.5 text-[11px] text-ink2 transition-all hover:border-[#a24e9c] hover:text-[#a24e9c]">
            + #{t}
          </button>
        ))}
        <input className="w-20 bg-transparent text-[11px] outline-none placeholder:text-ink2/40" placeholder="自定义…" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { addTag(tagInput); setTagInput(""); } }} />
      </div>
    </Card>
  );
}

/* ================= 个人形象 ================= */

const IMAGE_ROWS: { k: "skincare" | "hair" | "outfit"; label: string; icon: IconName; ph: [string, string, string] }[] = [
  { k: "skincare", label: "护肤", icon: "spark", ph: ["最近学到的护肤知识", "今天实际做了什么", "下一步护肤安排"] },
  { k: "hair", label: "发型", icon: "pen", ph: ["打理 / 护理学习", "今天怎么打理的", "下次护理计划"] },
  { k: "outfit", label: "穿搭", icon: "shirt", ph: ["风格学习笔记", "今日穿搭记录", "想尝试的风格"] },
];

export function ImageCard({
  d, up, notify, phase,
}: {
  d: DayData; up: Updater; notify: Notify; phase: PhaseMode;
}) {
  const c = MODULES.image;
  const fileRef = useRef<HTMLInputElement>(null);
  let f = 0;
  [d.image.skincare, d.image.hair, d.image.outfit].forEach((r) => {
    if (r.learn.trim()) f++;
    if (r.actual.trim()) f++;
    if (r.next.trim()) f++;
  });
  const pct = (f / 9) * 92 + (d.outfitPhoto ? 8 : 0);

  const onOutfitPhoto = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    try {
      const url = await compressImage(files[0]);
      up((dd) => void (dd.outfitPhoto = url));
      notify("穿搭照片已保存");
    } catch {
      notify("照片读取失败");
    }
  };

  return (
    <Card title="个人形象" en={c.en} color={c.color} icon="shirt" hint={c.hint} progress={pct} phaseTag={phase === "plan" ? tag : phase === "review" ? rev : undefined}>
      <div className="space-y-3">
        {IMAGE_ROWS.map((row) => {
          const r = d.image[row.k];
          return (
            <div key={row.k} className="rounded-lg border border-line/80 bg-white p-3 transition-all hover:border-[color-mix(in_srgb,var(--c)_45%,#e3ddcd)] hover:shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${c.color} 12%, #fff)`, color: c.color }}>
                    <Icon name={row.icon} size={13} />
                  </span>
                  {row.label}
                </p>
                {row.k === "outfit" &&
                  (d.outfitPhoto ? (
                    <div className="group/op relative">
                      <img src={d.outfitPhoto} alt="今日穿搭" className="h-12 w-12 rounded-md border border-line object-cover transition-transform hover:scale-105" />
                      <button type="button" aria-label="删除穿搭照片" onClick={() => up((dd) => void (dd.outfitPhoto = ""))} className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-ink/75 text-white opacity-0 transition-opacity hover:bg-seal group-hover/op:opacity-100">
                        <Icon name="x" size={8} strokeWidth={3.4} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1 rounded-md border border-dashed border-line px-2 py-1 text-[10px] font-bold text-ink2 transition-all hover:border-[#8fa63b] hover:text-[#8fa63b]">
                      <Icon name="photo" size={11} />
                      穿搭照
                    </button>
                  ))}
              </div>
              <div className="space-y-1.5">
                {phase !== "review" && (
                  <input className="inp !py-1.5 text-xs" style={{ "--c": c.color } as CSSProperties} placeholder={`学习 · ${row.ph[0]}`} value={r.learn} onChange={(e) => up((dd) => void (dd.image[row.k].learn = e.target.value))} />
                )}
                {phase !== "plan" && (
                  <div className="flex items-center gap-1.5">
                    <input className="inp !py-1.5 min-w-0 flex-1 text-xs" style={{ "--c": c.color } as CSSProperties} placeholder={`实际 · ${row.ph[1]}`} value={r.actual} onChange={(e) => up((dd) => void (dd.image[row.k].actual = e.target.value))} />
                    {r.next.trim() && (
                      <button type="button" title="把「下一步」带到现在" onClick={() => up((dd) => void (dd.image[row.k].actual = dd.image[row.k].next))} className="shrink-0 rounded-md border border-dashed border-[#d6dfb0] bg-[#f7f9ec] px-1.5 py-1 text-[9px] font-bold text-[#8fa63b] transition-all hover:border-solid active:scale-95">
                        带入
                      </button>
                    )}
                  </div>
                )}
                <input className="inp !py-1.5 text-xs" style={{ "--c": c.color } as CSSProperties} placeholder={`下一步 · ${row.ph[2]}`} value={r.next} onChange={(e) => up((dd) => void (dd.image[row.k].next = e.target.value))} />
              </div>
            </div>
          );
        })}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void onOutfitPhoto(e.target.files); e.target.value = ""; }} />
    </Card>
  );
}

/* ================= 综合打分 ================= */

export function ScoreCard({
  d, up, date, score, settings, onToast,
}: {
  d: DayData; up: Updater; date: Date; score: DayScore; settings: Settings; onToast: Notify;
}) {
  const c = "#243029";
  const [copied, setCopied] = useState(false);
  const enabled = useMemo(() => settings.weights, [settings]);
  const sumW = score.parts.reduce((s, p) => s + p.weight, 0) || 1;
  const display = d.scoreOverride > 0 ? d.scoreOverride : score.total;
  const verdict = scoreVerdict(display);

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary(d, date, score));
      setCopied(true);
      onToast("今日总结已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast("复制失败，请手动选择文本");
    }
  };

  return (
    <Card title="今日综合打分" en="SCORE" color={verdict.color} icon="gauge" hint="自动计算 + 手动修正" className="md:col-span-2 xl:col-span-3" tape="right">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto]">
        {/* 大分数 */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="relative">
            <Ring value={display} size={150} stroke={12} color={verdict.color} track="#eee8d9">
              <div className="text-center">
                <p className="font-num text-[46px] font-bold leading-none" style={{ color: verdict.color }}>{display}</p>
                <p className="mt-1 text-[10px] font-bold tracking-[0.18em] text-ink2">{d.scoreOverride > 0 ? "手动修正" : "自动计算"}</p>
              </div>
            </Ring>
            <span className="font-display absolute -right-3 -top-2 rotate-12 rounded border-2 px-1.5 py-0.5 text-sm font-black" style={{ borderColor: verdict.color, color: verdict.color }}>
              {verdict.label}
            </span>
          </div>
          <p className="max-w-[180px] text-center text-[11px] leading-relaxed text-ink2">{encouragement(display)}</p>
        </div>

        {/* 维度明细 */}
        <div>
          <p className="lbl">
            <Icon name="chart" size={12} strokeWidth={2.4} />
            九维明细 · 括号内为权重（可在设置调整）
          </p>
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {score.parts.map((p) => {
              const meta = MODULES[p.key as ModuleKey];
              return (
                <div key={p.key} className="group">
                  <div className="mb-0.5 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-ink">
                      {meta.label}
                      <span className="font-num ml-1 text-ink2">({Math.round((p.weight / sumW) * 100)}%)</span>
                    </span>
                    <span className="font-num font-bold" style={{ color: meta.color }}>{p.score}</span>
                  </div>
                  <Bar value={p.score} color={meta.color} height={5} />
                </div>
              );
            })}
          </div>

          {/* 手动修正 */}
          <div className="mt-4 rounded-lg border border-line/80 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-ink2">
                手动修正总分
                <span className="ml-1 font-normal">（0 = 使用自动分）</span>
              </p>
              <span className="font-num rounded-md px-2 py-0.5 text-sm font-bold" style={{ background: `color-mix(in srgb, ${verdict.color} 12%, #fff)`, color: verdict.color }}>
                {d.scoreOverride > 0 ? d.scoreOverride : "自动"}
              </span>
            </div>
            <input
              type="range" min={0} max={100} step={1} value={d.scoreOverride}
              onChange={(e) => up((dd) => void (dd.scoreOverride = Number(e.target.value)))}
              className="slider mt-2"
              style={{ "--c": verdict.color, "--fill": `${d.scoreOverride}%` } as CSSProperties}
            />
            <div className="mt-1 flex justify-between text-[10px] font-bold text-ink2/70">
              <span>自动</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* 自评 + 一句话 + 复制 */}
        <div className="flex flex-col gap-3 lg:w-64">
          <div>
            <p className="lbl">
              <Icon name="star" size={12} strokeWidth={2.4} />
              自评打分（1-10）
            </p>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" aria-label={`自评 ${n} 分`} onClick={() => up((dd) => void (dd.selfScore = dd.selfScore === n ? 0 : n))} className="font-num h-8 flex-1 rounded-md border text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0" style={d.selfScore >= n ? { background: "#243029", borderColor: "#243029", color: "#f4f2ea" } : { borderColor: "#e3ddcd", color: "#9a9484", background: "#fff" }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="lbl">
              <Icon name="pen" size={12} strokeWidth={2.4} />
              一句话总结今天
            </p>
            <input className="inp" style={{ "--c": c } as CSSProperties} placeholder="例如：稳住了节奏，晚上睡个好觉。" value={d.scoreNote} onChange={(e) => up((dd) => void (dd.scoreNote = e.target.value))} />
          </div>
          <button type="button" onClick={() => void copySummary()} className={`mt-auto flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${copied ? "bg-pine" : "bg-ink"}`}>
            <Icon name={copied ? "check" : "copy"} size={16} strokeWidth={2.4} />
            {copied ? "已复制" : "复制今日总结"}
          </button>
        </div>
      </div>
    </Card>
  );
}

export { DotCheck, EmptyHint };
