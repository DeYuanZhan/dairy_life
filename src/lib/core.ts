/* ============================================================
 * 一日手账 · 数据模型 / 日期工具 / 本地存储 / 评分引擎
 * ============================================================ */

export type MoodKey = "happy" | "calm" | "okay" | "down" | "irritable";

export interface MoodDef {
  key: MoodKey;
  label: string;
  score: number;
  color: string;
}

export const MOODS: MoodDef[] = [
  { key: "happy", label: "开心", score: 100, color: "#e8a33d" },
  { key: "calm", label: "平静", score: 88, color: "#3e9c6e" },
  { key: "okay", label: "一般", score: 66, color: "#46639e" },
  { key: "down", label: "失落", score: 42, color: "#7c8794" },
  { key: "irritable", label: "烦躁", score: 34, color: "#d9482b" },
];

export const moodOf = (k: MoodKey | null): MoodDef | null =>
  MOODS.find((m) => m.key === k) ?? null;

/* ---------------- 天气 ---------------- */

export type WeatherKey = "sunny" | "cloudy" | "rain" | "storm" | "snow" | "wind";

export interface WeatherDef {
  key: WeatherKey;
  label: string;
}

export const WEATHERS: WeatherDef[] = [
  { key: "sunny", label: "晴" },
  { key: "cloudy", label: "多云" },
  { key: "rain", label: "雨" },
  { key: "storm", label: "雷雨" },
  { key: "snow", label: "雪" },
  { key: "wind", label: "风" },
];

/* ---------------- 数据结构 ---------------- */

export interface WorkItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ActivityItem {
  id: string;
  type: string;
  note: string;
}

export interface StudyItem {
  id: string;
  subject: string;
  planMin: number;
  actualMin: number;
  checked: boolean;
}

export interface ImageRow {
  learn: string;
  actual: string;
  next: string;
}

export interface DayData {
  mood: MoodKey | null;
  energy: number; // 1 - 10
  moodNote: string;
  weather: WeatherKey | null;
  place: string;
  workItems: WorkItem[];
  workNote: string;
  life: { food: string; clothing: string; home: string; transport: string };
  activities: ActivityItem[];
  records: { vlog: boolean; photo: boolean; social: boolean; showcase: boolean };
  recordNote: string;
  sleep: {
    planBed: string;
    planWake: string;
    actBed: string;
    actWake: string;
    nextBed: string;
    nextWake: string;
  };
  studyItems: StudyItem[];
  studyNote: string;
  fitness: { plan: string; actual: string; next: string };
  image: { skincare: ImageRow; hair: ImageRow; outfit: ImageRow };
  selfScore: number; // 0 = 未自评，1-10
}

export const emptyImageRow = (): ImageRow => ({ learn: "", actual: "", next: "" });

export function emptyDay(): DayData {
  return {
    mood: null,
    energy: 6,
    moodNote: "",
    weather: null,
    place: "",
    workItems: [],
    workNote: "",
    life: { food: "", clothing: "", home: "", transport: "" },
    activities: [],
    records: { vlog: false, photo: false, social: false, showcase: false },
    recordNote: "",
    sleep: { planBed: "", planWake: "", actBed: "", actWake: "", nextBed: "", nextWake: "" },
    studyItems: [],
    studyNote: "",
    fitness: { plan: "", actual: "", next: "" },
    image: { skincare: emptyImageRow(), hair: emptyImageRow(), outfit: emptyImageRow() },
    selfScore: 0,
  };
}

/* ---------------- 模块元信息 ---------------- */

export type ModuleKey =
  | "work"
  | "study"
  | "sleep"
  | "mood"
  | "fitness"
  | "life"
  | "records"
  | "activities"
  | "image";

export interface ModuleMeta {
  label: string;
  en: string;
  color: string;
  weight: number;
  hint: string;
}

export const MODULES: Record<ModuleKey, ModuleMeta> = {
  work: { label: "工作", en: "WORK", color: "#3d74c0", weight: 18, hint: "列出今日任务，逐项打勾" },
  study: { label: "学习", en: "STUDY", color: "#2c8c99", weight: 16, hint: "规划 · 实际 · 检查 · 执行" },
  sleep: { label: "睡眠", en: "SLEEP", color: "#46639e", weight: 14, hint: "昨晚计划 · 实际 · 明日规划" },
  mood: { label: "心情", en: "MOOD", color: "#e05b7a", weight: 12, hint: "此刻的情绪与能量值" },
  fitness: { label: "健身", en: "FITNESS", color: "#d9482b", weight: 10, hint: "计划 · 实际 · 下一步" },
  life: { label: "生活", en: "LIFE", color: "#3e9c6e", weight: 10, hint: "衣食住行，好好生活" },
  records: { label: "记录", en: "RECORDS", color: "#a24e9c", weight: 8, hint: "vlog · 拍照 · 社交 · 展示面" },
  activities: { label: "活动", en: "EVENTS", color: "#e8a33d", weight: 6, hint: "聚餐 · 电影 · 逛街……" },
  image: { label: "形象", en: "IMAGE", color: "#8fa63b", weight: 6, hint: "护肤 · 发型 · 穿搭" },
};

export const MODULE_KEYS = Object.keys(MODULES) as ModuleKey[];

/* ---------------- 日期工具 ---------------- */

export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export const keyOf = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export const todayKey = (): string => keyOf(new Date());

export const parseKey = (k: string): Date => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const fmtCN = (d: Date): string => `${d.getMonth() + 1}月${d.getDate()}日`;

export const isTodayKey = (k: string): boolean => k === todayKey();

/** 所在周（周一 ~ 周日） */
export const weekOf = (d: Date): Date[] => {
  const off = (d.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => addDays(d, i - off));
};

export const dayOfYear = (d: Date): number => {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
};

/* ---------------- 本地存储 ---------------- */

const DATA_PREFIX = "dayledger:d:";
const INDEX_KEY = "dayledger:index";

export interface DayMeta {
  score: number;
  filled: boolean;
}

export type LedgerIndex = Record<string, DayMeta>;

export function loadIndex(): LedgerIndex {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LedgerIndex;
  } catch {
    return {};
  }
}

export function loadDay(k: string): DayData {
  try {
    const raw = localStorage.getItem(DATA_PREFIX + k);
    if (!raw) return emptyDay();
    const parsed = JSON.parse(raw) as Partial<DayData>;
    const base = emptyDay();
    return {
      ...base,
      ...parsed,
      life: { ...base.life, ...(parsed.life ?? {}) },
      records: { ...base.records, ...(parsed.records ?? {}) },
      sleep: { ...base.sleep, ...(parsed.sleep ?? {}) },
      fitness: { ...base.fitness, ...(parsed.fitness ?? {}) },
      image: {
        skincare: { ...base.image.skincare, ...(parsed.image?.skincare ?? {}) },
        hair: { ...base.image.hair, ...(parsed.image?.hair ?? {}) },
        outfit: { ...base.image.outfit, ...(parsed.image?.outfit ?? {}) },
      },
      workItems: Array.isArray(parsed.workItems) ? parsed.workItems : [],
      studyItems: Array.isArray(parsed.studyItems) ? parsed.studyItems : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
    };
  } catch {
    return emptyDay();
  }
}

export function saveDay(k: string, d: DayData): void {
  try {
    localStorage.setItem(DATA_PREFIX + k, JSON.stringify(d));
    const idx = loadIndex();
    idx[k] = { score: computeScore(d).total, filled: hasContent(d) };
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch {
    /* 存储不可用时静默失败 */
  }
}

export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

/* ---------------- 内容完整度 ---------------- */

export function hasContent(d: DayData): boolean {
  if (d.weather || d.place.trim()) return true;
  if (d.mood || d.moodNote.trim()) return true;
  if (d.workItems.length || d.workNote.trim()) return true;
  if (Object.values(d.life).some((v) => v.trim())) return true;
  if (d.activities.length) return true;
  if (Object.values(d.records).some(Boolean) || d.recordNote.trim()) return true;
  if (Object.values(d.sleep).some((v) => v.trim())) return true;
  if (d.studyItems.length || d.studyNote.trim()) return true;
  if (Object.values(d.fitness).some((v) => v.trim())) return true;
  const img = [d.image.skincare, d.image.hair, d.image.outfit];
  if (img.some((r) => r.learn.trim() || r.actual.trim() || r.next.trim())) return true;
  if (d.selfScore > 0) return true;
  return false;
}

/* ---------------- 评分引擎 ---------------- */

export interface ScorePart {
  key: ModuleKey;
  score: number;
  weight: number;
}

export interface DayScore {
  total: number;
  parts: ScorePart[];
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** a 入睡 -> b 起床（跨零点）的分钟数 */
function sleepSpan(bed: string, wake: string): number {
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let m = wh * 60 + wm - (bh * 60 + bm);
  if (m <= 0) m += 24 * 60;
  return m;
}

const startMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function workScore(d: DayData): number {
  const n = d.workItems.length;
  if (!n) return 0;
  return (d.workItems.filter((i) => i.done).length / n) * 100;
}

function studyScore(d: DayData): number {
  const n = d.studyItems.length;
  if (!n) return 0;
  let exec = 0;
  d.studyItems.forEach((it) => {
    exec += it.planMin > 0 ? Math.min(it.actualMin / it.planMin, 1) : it.actualMin > 0 ? 1 : 0;
  });
  const execPct = (exec / n) * 100;
  const checkPct = (d.studyItems.filter((i) => i.checked).length / n) * 100;
  return execPct * 0.8 + checkPct * 0.2;
}

function sleepScore(d: DayData): number {
  const s = d.sleep;
  const hasPlan = !!(s.planBed && s.planWake);
  const hasAct = !!(s.actBed && s.actWake);
  if (hasAct) {
    const hours = sleepSpan(s.actBed, s.actWake) / 60;
    let sc = 100 - Math.min(Math.abs(hours - 8) * 30, 80);
    if (hasPlan) {
      const drift = Math.abs(startMin(s.actBed) - startMin(s.planBed));
      if (drift <= 30) sc = Math.min(100, sc + 8);
      else if (drift <= 60) sc = Math.min(100, sc + 4);
    }
    return clamp(sc, 10, 100);
  }
  return hasPlan ? 35 : 0;
}

function moodScore(d: DayData): number {
  const m = moodOf(d.mood);
  const es = d.energy * 10;
  return m ? m.score * 0.65 + es * 0.35 : es * 0.3;
}

function fitnessScore(d: DayData): number {
  const p = d.fitness.plan.trim();
  const a = d.fitness.actual.trim();
  if (p && a) return 100;
  if (a) return 72;
  if (p) return 38;
  return 0;
}

function lifeScore(d: DayData): number {
  const f = [d.life.food, d.life.clothing, d.life.home, d.life.transport].filter((v) =>
    v.trim()
  ).length;
  return (f / 4) * 100;
}

function recordsScore(d: DayData): number {
  const c = [d.records.vlog, d.records.photo, d.records.social, d.records.showcase].filter(
    Boolean
  ).length;
  return (c / 4) * 85 + (d.recordNote.trim() ? 15 : 0);
}

function activitiesScore(d: DayData): number {
  const n = d.activities.length;
  if (!n) return 0;
  const base = (Math.min(n, 2) / 2) * 70;
  const noted = (d.activities.filter((a) => a.note.trim()).length / n) * 30;
  return base + noted;
}

function imageScore(d: DayData): number {
  let f = 0;
  [d.image.skincare, d.image.hair, d.image.outfit].forEach((r) => {
    if (r.learn.trim()) f++;
    if (r.actual.trim()) f++;
    if (r.next.trim()) f++;
  });
  return (f / 9) * 100;
}

const SCORERS: Record<ModuleKey, (d: DayData) => number> = {
  work: workScore,
  study: studyScore,
  sleep: sleepScore,
  mood: moodScore,
  fitness: fitnessScore,
  life: lifeScore,
  records: recordsScore,
  activities: activitiesScore,
  image: imageScore,
};

export function computeScore(d: DayData): DayScore {
  const parts = MODULE_KEYS.map((k) => ({
    key: k,
    score: Math.round(SCORERS[k](d)),
    weight: MODULES[k].weight,
  }));
  const total = Math.round(parts.reduce((s, p) => s + p.score * p.weight, 0) / 100);
  return { total, parts };
}

export function encouragement(total: number): string {
  if (total >= 85) return "闪闪发光的一天，你值得被自己表扬。";
  if (total >= 70) return "很稳的一天，节奏在你手里。";
  if (total >= 50) return "还不错，明天再往前挪一点点。";
  if (total >= 25) return "慢慢来，把一件事做完就是胜利。";
  return "新的一页已经铺开，从第一条记录开始。";
}

/* ---------------- 文案 ---------------- */

export function greeting(hour: number): string {
  if (hour < 5) return "夜深了，写完今天这一页就休息吧。";
  if (hour < 11) return "早上好，先把今天安排明白。";
  if (hour < 14) return "中午好，记得好好吃一顿。";
  if (hour < 18) return "下午好，稳住节奏继续走。";
  return "晚上好，适合复盘这一天。";
}

export const fmtDur = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h <= 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分`;
};

export function buildSummary(d: DayData, date: Date, score: DayScore): string {
  const L: string[] = [];
  L.push(
    `${date.getMonth() + 1}月${date.getDate()}日 · 周${WEEKDAYS[date.getDay()]} · 今日状态 ${score.total} 分`
  );

  const wk = d.workItems;
  L.push(
    wk.length
      ? `▸ 工作：完成 ${wk.filter((i) => i.done).length}/${wk.length} 项${d.workNote.trim() ? `；备注「${d.workNote.trim()}」` : ""}`
      : "▸ 工作：未记录"
  );

  if (d.studyItems.length) {
    const plan = d.studyItems.reduce((s, i) => s + (i.planMin || 0), 0);
    const act = d.studyItems.reduce((s, i) => s + (i.actualMin || 0), 0);
    const rate = plan > 0 ? Math.round((Math.min(act, plan) / plan) * 100) : act > 0 ? 100 : 0;
    L.push(
      `▸ 学习：计划 ${plan} 分钟，实际 ${act} 分钟，执行率 ${rate}%，已检查 ${d.studyItems.filter((i) => i.checked).length} 项`
    );
  } else L.push("▸ 学习：未记录");

  const s = d.sleep;
  const actSleep = s.actBed && s.actWake ? fmtDur(sleepSpan(s.actBed, s.actWake)) : null;
  const planSleep = s.planBed && s.planWake ? fmtDur(sleepSpan(s.planBed, s.planWake)) : null;
  const nextSleep = s.nextBed && s.nextWake ? `${s.nextBed} - ${s.nextWake}` : null;
  L.push(
    `▸ 睡眠：${actSleep ? `实际 ${actSleep}` : "实际未记录"}${planSleep ? `（计划 ${planSleep}）` : ""}${nextSleep ? `；明日计划 ${nextSleep}` : ""}`
  );

  const f = d.fitness;
  L.push(
    f.actual.trim()
      ? `▸ 健身：${f.actual.trim()}${f.next.trim() ? `；下一步「${f.next.trim()}」` : ""}`
      : f.plan.trim()
        ? `▸ 健身：计划了「${f.plan.trim()}」，尚未完成`
        : "▸ 健身：未记录"
  );

  const lifeBits: string[] = [];
  if (d.life.food.trim()) lifeBits.push(`食·${d.life.food.trim()}`);
  if (d.life.clothing.trim()) lifeBits.push(`衣·${d.life.clothing.trim()}`);
  if (d.life.home.trim()) lifeBits.push(`住·${d.life.home.trim()}`);
  if (d.life.transport.trim()) lifeBits.push(`行·${d.life.transport.trim()}`);
  L.push(lifeBits.length ? `▸ 生活：${lifeBits.join("；")}` : "▸ 生活：未记录");

  L.push(
    d.activities.length
      ? `▸ 活动：${d.activities.map((a) => `${a.type}${a.note.trim() ? `·${a.note.trim()}` : ""}`).join("；")}`
      : "▸ 活动：未记录"
  );

  const recs: string[] = [];
  if (d.records.vlog) recs.push("Vlog");
  if (d.records.photo) recs.push("拍照");
  if (d.records.social) recs.push("社交");
  if (d.records.showcase) recs.push("展示面");
  L.push(
    recs.length || d.recordNote.trim()
      ? `▸ 记录：${recs.length ? recs.join("、") + " 已打卡" : ""}${d.recordNote.trim() ? `${recs.length ? "；" : ""}${d.recordNote.trim()}` : ""}`
      : "▸ 记录：未打卡"
  );

  const imgRows: string[] = [];
  ([
    ["护肤", d.image.skincare],
    ["发型", d.image.hair],
    ["穿搭", d.image.outfit],
  ] as [string, ImageRow][]).forEach(([name, r]) => {
    if (r.learn.trim() || r.actual.trim() || r.next.trim()) imgRows.push(name);
  });
  L.push(imgRows.length ? `▸ 形象：已完成 ${imgRows.join("、")} 的记录` : "▸ 形象：未记录");

  const m = moodOf(d.mood);
  L.push(
    `▸ 心情：${m ? m.label : "未选择"} · 能量 ${d.energy}/10${d.moodNote.trim() ? ` · ${d.moodNote.trim()}` : ""}`
  );

  if (d.selfScore > 0) L.push(`▸ 自评：${d.selfScore}/10 分`);
  return L.join("\n");
}

/* ---------------- 快速模板 ---------------- */

export const WORK_TEMPLATES = ["回复邮件", "开晨会", "深度工作 2 小时", "写周报", "整理文档"];

export const STUDY_TEMPLATES = ["英语", "专业课", "阅读", "刷题"];

export const SLEEP_PRESETS = [
  { label: "睡满 8 小时", bed: "23:00", wake: "07:00" },
  { label: "7.5 小时", bed: "23:30", wake: "07:00" },
  { label: "7 小时", bed: "00:00", wake: "07:00" },
];

export const MODULE_TIPS: Record<ModuleKey, string> = {
  work: "明天先写下最重要的 3 件事，挑一件「硬骨头」放在上午啃。",
  study: "从 25 分钟一个番茄钟开始，完成后记得勾「已检查」。",
  sleep: "今晚把上床时间提前 30 分钟，睡前一小时放下手机。",
  mood: "情绪没有对错，写下「为什么」比打分更有用。",
  fitness: "哪怕 10 分钟拉伸也算数，先让身体动起来。",
  life: "好好吃一顿饭，把「食」这一栏认真填上。",
  records: "随手拍一张今天的天空，记录不需要仪式感。",
  activities: "约一个朋友，或者给自己安排一场电影。",
  image: "今晚多花 3 分钟护肤，明天穿一套让自己开心的搭配。",
};

/* ---------------- 洞察分析 ---------------- */

export interface NightPoint {
  key: string;
  weekday: string;
  hours: number | null;
}

export interface SleepStats {
  nights: number;
  avg: number | null;
  debt: number | null;
}

export function lastNights(
  endKey: string,
  n: number,
  override?: { key: string; data: DayData }
): NightPoint[] {
  const end = parseKey(endKey);
  const out: NightPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const dt = addDays(end, -i);
    const k = keyOf(dt);
    const d = override && override.key === k ? override.data : loadDay(k);
    const h =
      d.sleep.actBed && d.sleep.actWake ? sleepSpan(d.sleep.actBed, d.sleep.actWake) / 60 : null;
    out.push({
      key: k,
      weekday: WEEKDAYS[dt.getDay()],
      hours: h === null ? null : Math.round(h * 10) / 10,
    });
  }
  return out;
}

export function sleepStats(nights: NightPoint[]): SleepStats {
  const hs = nights.map((x) => x.hours).filter((h): h is number => h !== null);
  if (!hs.length) return { nights: 0, avg: null, debt: null };
  const debt = hs.reduce((s, h) => s + (8 - h), 0);
  return {
    nights: hs.length,
    avg: Math.round((hs.reduce((a, b) => a + b, 0) / hs.length) * 10) / 10,
    debt: Math.round(debt * 10) / 10,
  };
}

export interface TrendPoint {
  key: string;
  label: string;
  score: number | null;
  mood: MoodKey | null;
}

export function trendOf(
  endKey: string,
  n: number,
  override?: { key: string; data: DayData }
): TrendPoint[] {
  const end = parseKey(endKey);
  const out: TrendPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const dt = addDays(end, -i);
    const k = keyOf(dt);
    const d = override && override.key === k ? override.data : loadDay(k);
    const filled = hasContent(d);
    out.push({
      key: k,
      label: `${dt.getMonth() + 1}/${dt.getDate()}`,
      score: filled ? computeScore(d).total : null,
      mood: d.mood,
    });
  }
  return out;
}

export interface WeekStats {
  avg: number | null;
  best: { key: string; score: number } | null;
  filledDays: number;
  tasksDone: number;
  tasksTotal: number;
  studyPlan: number;
  studyActual: number;
  fitnessDays: number;
  moodCounts: Record<MoodKey, number>;
  moduleAvg: { key: ModuleKey; value: number }[];
  weakest: ModuleKey | null;
}

function hasModuleData(d: DayData, k: ModuleKey): boolean {
  switch (k) {
    case "work":
      return d.workItems.length > 0 || !!d.workNote.trim();
    case "study":
      return d.studyItems.length > 0;
    case "sleep":
      return Object.values(d.sleep).some((v) => v.trim());
    case "mood":
      return !!d.mood || !!d.moodNote.trim();
    case "fitness":
      return Object.values(d.fitness).some((v) => v.trim());
    case "life":
      return Object.values(d.life).some((v) => v.trim());
    case "records":
      return Object.values(d.records).some(Boolean) || !!d.recordNote.trim();
    case "activities":
      return d.activities.length > 0;
    case "image":
      return [d.image.skincare, d.image.hair, d.image.outfit].some(
        (r) => r.learn.trim() || r.actual.trim() || r.next.trim()
      );
  }
}

export function reviewOfDays(keys: string[], days: DayData[]): WeekStats {
  const moduleSum = {} as Record<ModuleKey, { sum: number; n: number }>;
  MODULE_KEYS.forEach((k) => (moduleSum[k] = { sum: 0, n: 0 }));
  const moodCounts: Record<MoodKey, number> = {
    happy: 0,
    calm: 0,
    okay: 0,
    down: 0,
    irritable: 0,
  };
  let scoreSum = 0;
  let filled = 0;
  let best: WeekStats["best"] = null;
  let tasksDone = 0;
  let tasksTotal = 0;
  let studyPlan = 0;
  let studyActual = 0;
  let fitnessDays = 0;

  keys.forEach((k, i) => {
    const d = days[i];
    if (!hasContent(d)) return;
    filled++;
    const sc = computeScore(d);
    scoreSum += sc.total;
    if (!best || sc.total > best.score) best = { key: k, score: sc.total };
    sc.parts.forEach((p) => {
      if (p.score > 0 || hasModuleData(d, p.key)) {
        moduleSum[p.key].sum += p.score;
        moduleSum[p.key].n++;
      }
    });
    tasksTotal += d.workItems.length;
    tasksDone += d.workItems.filter((w) => w.done).length;
    d.studyItems.forEach((si) => {
      studyPlan += si.planMin || 0;
      studyActual += si.actualMin || 0;
    });
    if (d.fitness.actual.trim() || d.fitness.plan.trim()) fitnessDays++;
    if (d.mood) moodCounts[d.mood]++;
  });

  const moduleAvg = MODULE_KEYS.map((k) => ({
    key: k,
    value: moduleAvgSafe(moduleSum[k]),
  }));
  const scored = moduleAvg.filter((x) => x.value >= 0);
  const weakest = scored.length ? scored.reduce((a, b) => (b.value < a.value ? b : a)).key : null;

  return {
    avg: filled ? Math.round(scoreSum / filled) : null,
    best,
    filledDays: filled,
    tasksDone,
    tasksTotal,
    studyPlan,
    studyActual,
    fitnessDays,
    moodCounts,
    moduleAvg,
    weakest,
  };
}

function moduleAvgSafe(s: { sum: number; n: number }): number {
  return s.n ? Math.round(s.sum / s.n) : -1;
}

/* ---------------- 导出 / 导入 ---------------- */

export function toMarkdown(d: DayData, date: Date): string {
  const sc = computeScore(d);
  const m = moodOf(d.mood);
  const w = WEATHERS.find((x) => x.key === d.weather);
  const part = (k: ModuleKey) => sc.parts.find((p) => p.key === k)?.score ?? 0;
  const L: string[] = [];
  L.push(`# ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 · 一日手账`);
  L.push("");
  L.push(`> 状态评分：**${sc.total} / 100** · ${encouragement(sc.total)}`);
  const meta: string[] = [];
  if (w) meta.push(`天气：${w.label}`);
  if (d.place.trim()) meta.push(`地点：${d.place.trim()}`);
  if (meta.length) L.push(`> ${meta.join(" · ")}`);
  L.push("");

  L.push(`## 工作（${part("work")} 分）`);
  if (d.workItems.length)
    d.workItems.forEach((i) => L.push(`- [${i.done ? "x" : " "}] ${i.text}`));
  else L.push("- （未记录）");
  if (d.workNote.trim()) L.push(`> 复盘：${d.workNote.trim()}`);
  L.push("");

  L.push(`## 学习（${part("study")} 分）`);
  if (d.studyItems.length) {
    L.push("| 科目 | 规划(分) | 实际(分) | 检查 |");
    L.push("| --- | --- | --- | --- |");
    d.studyItems.forEach((i) =>
      L.push(
        `| ${i.subject || "未命名"} | ${i.planMin || "—"} | ${i.actualMin || "—"} | ${i.checked ? "已检查" : "未检查"} |`
      )
    );
  } else L.push("- （未记录）");
  if (d.studyNote.trim()) L.push(`> ${d.studyNote.trim()}`);
  L.push("");

  const s = d.sleep;
  L.push(`## 睡眠（${part("sleep")} 分）`);
  L.push(`- 昨晚计划：${s.planBed && s.planWake ? `${s.planBed} – ${s.planWake}` : "未记录"}`);
  L.push(
    `- 实际睡眠：${s.actBed && s.actWake ? `${s.actBed} – ${s.actWake}（${fmtDur(sleepSpan(s.actBed, s.actWake))}）` : "未记录"}`
  );
  L.push(`- 明日规划：${s.nextBed && s.nextWake ? `${s.nextBed} – ${s.nextWake}` : "未规划"}`);
  L.push("");

  L.push(`## 健身（${part("fitness")} 分）`);
  L.push(`- 规划：${d.fitness.plan.trim() || "未记录"}`);
  L.push(`- 实际：${d.fitness.actual.trim() || "未记录"}`);
  L.push(`- 下一步：${d.fitness.next.trim() || "未规划"}`);
  L.push("");

  L.push(`## 生活 · 衣食住行（${part("life")} 分）`);
  L.push(`- 食：${d.life.food.trim() || "—"}`);
  L.push(`- 衣：${d.life.clothing.trim() || "—"}`);
  L.push(`- 住：${d.life.home.trim() || "—"}`);
  L.push(`- 行：${d.life.transport.trim() || "—"}`);
  L.push("");

  L.push(`## 活动（${part("activities")} 分）`);
  if (d.activities.length)
    d.activities.forEach((a) => L.push(`- ${a.type}${a.note.trim() ? `：${a.note.trim()}` : ""}`));
  else L.push("- （未记录）");
  L.push("");

  L.push(`## 生活记录（${part("records")} 分）`);
  const recs: string[] = [];
  if (d.records.vlog) recs.push("Vlog");
  if (d.records.photo) recs.push("拍照");
  if (d.records.social) recs.push("社交");
  if (d.records.showcase) recs.push("展示面");
  L.push(`- 打卡：${recs.length ? recs.join("、") : "无"}`);
  if (d.recordNote.trim()) L.push(`- 灵感：${d.recordNote.trim()}`);
  L.push("");

  L.push(`## 个人形象（${part("image")} 分）`);
  (
    [
      ["护肤", d.image.skincare],
      ["发型", d.image.hair],
      ["穿搭", d.image.outfit],
    ] as [string, ImageRow][]
  ).forEach(([name, r]) => {
    L.push(`### ${name}`);
    L.push(`- 学习：${r.learn.trim() || "—"}`);
    L.push(`- 实际：${r.actual.trim() || "—"}`);
    L.push(`- 下一步：${r.next.trim() || "—"}`);
  });
  L.push("");

  L.push(`## 心情（${part("mood")} 分）`);
  L.push(`- 心情：${m ? m.label : "未选择"} · 能量 ${d.energy}/10`);
  if (d.moodNote.trim()) L.push(`> ${d.moodNote.trim()}`);
  L.push("");

  if (d.selfScore > 0) L.push(`**自评：${d.selfScore} / 10 分**`);
  return L.join("\n");
}

export function exportAll(): void {
  const idx = loadIndex();
  const days: Record<string, DayData> = {};
  Object.keys(idx).forEach((k) => {
    days[k] = loadDay(k);
  });
  const payload = {
    app: "day-ledger",
    version: 1,
    exportedAt: new Date().toISOString(),
    days,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `一日手账-备份-${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importAll(json: string): number {
  const obj = JSON.parse(json) as { days?: Record<string, unknown> };
  const days = obj?.days;
  if (!days || typeof days !== "object") throw new Error("invalid backup file");
  let n = 0;
  Object.entries(days).forEach(([k, v]) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v && typeof v === "object") {
      saveDay(k, { ...emptyDay(), ...(v as Partial<DayData>) });
      n++;
    }
  });
  return n;
}
