/* ============================================================
 * 一日手账 v2 · 晨间规划 / 晚间复盘
 * 数据模型 · 迁移 · 存储 · 评分 · 洞察 · 勋章 · 标签
 * ============================================================ */

export type MoodKey = "happy" | "calm" | "down" | "anxious" | "tired";
export type Priority = "high" | "mid" | "low";
export type Mastery = "none" | "part" | "full";
export type WeatherKey = "sunny" | "cloudy" | "rain" | "storm" | "snow" | "wind";

export interface MoodDef {
  key: MoodKey;
  label: string;
  score: number;
  color: string;
}

export const MOODS: MoodDef[] = [
  { key: "happy", label: "开心", score: 100, color: "#e8a33d" },
  { key: "calm", label: "平静", score: 80, color: "#3e9c6e" },
  { key: "down", label: "失落", score: 55, color: "#46639e" },
  { key: "anxious", label: "焦虑", score: 45, color: "#e05b7a" },
  { key: "tired", label: "疲惫", score: 35, color: "#8a7f9e" },
];

export const moodOf = (k: MoodKey | null): MoodDef | null =>
  MOODS.find((m) => m.key === k) ?? null;

export const WEATHERS: { key: WeatherKey; label: string }[] = [
  { key: "sunny", label: "晴" },
  { key: "cloudy", label: "多云" },
  { key: "rain", label: "小雨" },
  { key: "storm", label: "雷雨" },
  { key: "snow", label: "雪" },
  { key: "wind", label: "大风" },
];

export const WEATHER_COLORS: Record<WeatherKey, string> = {
  sunny: "#e8a33d",
  cloudy: "#9aa7b4",
  rain: "#4a7fb5",
  storm: "#7a5fa0",
  snow: "#6b9ac4",
  wind: "#7ca982",
};

/* ---------------- 数据结构 v2 ---------------- */

export interface WorkItem {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  tags: string[];
}

export interface StudyItem {
  id: string;
  subject: string;
  planMin: number;
  actualMin: number;
  checked: boolean;
  mastery: Mastery;
  toReview: boolean;
}

export interface ActivityItem {
  id: string;
  type: string;
  time: string;
  people: string;
  note: string;
}

export interface ExpenseItem {
  id: string;
  item: string;
  amount: number;
}

export interface ImageRow {
  learn: string;
  actual: string;
  next: string;
}

export interface DayData {
  v: 2;
  mood: MoodKey | null;
  energy: number;
  moodNote: string;
  weather: WeatherKey | null;
  place: string;
  workItems: WorkItem[];
  workGoals: string[];
  workNote: string;
  workBlockers: string;
  workTomorrow: string;
  life: {
    breakfast: string;
    lunch: string;
    dinner: string;
    water: number;
    dietNote: string;
    location: string;
    transport: string;
    home: string;
    shopping: string;
  };
  expenses: ExpenseItem[];
  activities: ActivityItem[];
  records: { vlog: boolean; photo: boolean; social: boolean; showcase: boolean };
  photos: string[];
  recordNote: string;
  recordTags: string[];
  isPublic: boolean;
  sleep: {
    planBed: string;
    planWake: string;
    actBed: string;
    actWake: string;
    nextBed: string;
    nextWake: string;
    quality: number; // 0 未评，1-5
  };
  studyItems: StudyItem[];
  studyNote: string;
  studyNext: string;
  fitness: { plan: string; detail: string; actual: string; weight: string; feel: string; next: string };
  image: { skincare: ImageRow; hair: ImageRow; outfit: ImageRow };
  outfitPhoto: string;
  selfScore: number;
  scoreOverride: number; // 0 = 自动
  scoreNote: string;
}

export const emptyImageRow = (): ImageRow => ({ learn: "", actual: "", next: "" });

export function emptyDay(): DayData {
  return {
    v: 2,
    mood: null,
    energy: 6,
    moodNote: "",
    weather: null,
    place: "",
    workItems: [],
    workGoals: ["", "", ""],
    workNote: "",
    workBlockers: "",
    workTomorrow: "",
    life: {
      breakfast: "",
      lunch: "",
      dinner: "",
      water: 0,
      dietNote: "",
      location: "",
      transport: "",
      home: "",
      shopping: "",
    },
    expenses: [],
    activities: [],
    records: { vlog: false, photo: false, social: false, showcase: false },
    photos: [],
    recordNote: "",
    recordTags: [],
    isPublic: false,
    sleep: { planBed: "", planWake: "", actBed: "", actWake: "", nextBed: "", nextWake: "", quality: 0 },
    studyItems: [],
    studyNote: "",
    studyNext: "",
    fitness: { plan: "", detail: "", actual: "", weight: "", feel: "", next: "" },
    image: { skincare: emptyImageRow(), hair: emptyImageRow(), outfit: emptyImageRow() },
    outfitPhoto: "",
    selfScore: 0,
    scoreOverride: 0,
    scoreNote: "",
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
  work: { label: "工作", en: "WORK", color: "#3d74c0", weight: 20, hint: "目标 · 待办 · 复盘卡点" },
  study: { label: "学习", en: "STUDY", color: "#2c8c99", weight: 15, hint: "规划 · 执行 · 检查 · 复习" },
  sleep: { label: "睡眠", en: "SLEEP", color: "#46639e", weight: 15, hint: "计划 · 实际 · 质量 · 明日" },
  mood: { label: "情绪", en: "MOOD", color: "#e05b7a", weight: 15, hint: "情绪 · 能量 · 七天曲线" },
  fitness: { label: "健身", en: "FITNESS", color: "#d9482b", weight: 10, hint: "训练 · 体重 · 身体感受" },
  image: { label: "形象", en: "IMAGE", color: "#8fa63b", weight: 10, hint: "护肤 · 发型 · 穿搭" },
  life: { label: "生活", en: "LIFE", color: "#3e9c6e", weight: 7, hint: "三餐 · 饮水 · 居住 · 出行" },
  activities: { label: "活动", en: "EVENTS", color: "#e8a33d", weight: 5, hint: "聚餐 · 电影 · 逛街…" },
  records: { label: "记录", en: "RECORDS", color: "#a24e9c", weight: 3, hint: "照片 · 随笔 · 标签" },
};

export const MODULE_KEYS = Object.keys(MODULES) as ModuleKey[];

/* ---------------- 设置 ---------------- */

export interface Settings {
  modules: Record<ModuleKey, boolean>;
  weights: Record<ModuleKey, number>;
  spending: boolean;
  reminders: { morning: boolean; evening: boolean };
}

export const DEFAULT_SETTINGS: Settings = {
  modules: MODULE_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {} as Record<ModuleKey, boolean>),
  weights: MODULE_KEYS.reduce(
    (acc, k) => ({ ...acc, [k]: MODULES[k].weight }),
    {} as Record<ModuleKey, number>
  ),
  spending: true,
  reminders: { morning: false, evening: false },
};

const SETTINGS_KEY = "dayledger:settings";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const p = JSON.parse(raw) as Partial<Settings>;
    const base = structuredClone(DEFAULT_SETTINGS);
    return {
      modules: { ...base.modules, ...(p.modules ?? {}) },
      weights: { ...base.weights, ...(p.weights ?? {}) },
      spending: p.spending ?? base.spending,
      reminders: { ...base.reminders, ...(p.reminders ?? {}) },
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/* ---------------- 日期工具 ---------------- */

export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export const keyOf = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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
  mood: MoodKey | null;
  study: boolean;
  fit: boolean;
  q: number; // 睡眠质量
  photo: boolean;
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

/** v1 → v2 迁移 */
function migrate(raw: Record<string, unknown>): DayData {
  const b = emptyDay();
  const r = raw as Record<string, never> & Record<string, unknown>;
  const pick = <T,>(k: string, fallback: T): T =>
    (r[k] === undefined || r[k] === null ? fallback : (r[k] as T));
  try {
    b.mood = (["happy", "calm", "down"].includes(pick<string>("mood", ""))
      ? pick<MoodKey>("mood", "calm")
      : null) as MoodKey | null;
    if (pick<string>("mood", "") === "okay") b.mood = "calm";
    if (pick<string>("mood", "") === "irritable") b.mood = "anxious";
    b.energy = pick<number>("energy", 6);
    b.moodNote = pick<string>("moodNote", "");
    b.weather = (pick<string>("weather", "") || null) as WeatherKey | null;
    b.place = pick<string>("place", "");
    b.workItems = (pick<Array<Record<string, unknown>>>("workItems", []) || []).map((it) => ({
      id: String(it.id ?? uid()),
      text: String(it.text ?? ""),
      done: !!it.done,
      priority: (["high", "mid", "low"].includes(String(it.priority)) ? it.priority : "mid") as Priority,
      tags: Array.isArray(it.tags) ? (it.tags as string[]) : [],
    }));
    b.workNote = pick<string>("workNote", "");
    const life = pick<Record<string, string>>("life", {});
    b.life.breakfast = life?.food ?? "";
    b.life.home = life?.home ?? "";
    b.life.transport = life?.transport ?? "";
    const rec = pick<Record<string, boolean>>("records", {});
    b.records = {
      vlog: !!rec?.vlog,
      photo: !!rec?.photo,
      social: !!rec?.social,
      showcase: !!rec?.showcase,
    };
    b.recordNote = pick<string>("recordNote", "");
    const sl = pick<Record<string, string>>("sleep", {});
    b.sleep = {
      planBed: sl?.planBed ?? "",
      planWake: sl?.planWake ?? "",
      actBed: sl?.actBed ?? "",
      actWake: sl?.actWake ?? "",
      nextBed: sl?.nextBed ?? "",
      nextWake: sl?.nextWake ?? "",
      quality: 0,
    };
    b.studyItems = (pick<Array<Record<string, unknown>>>("studyItems", []) || []).map((it) => ({
      id: String(it.id ?? uid()),
      subject: String(it.subject ?? ""),
      planMin: Number(it.planMin ?? 0),
      actualMin: Number(it.actualMin ?? 0),
      checked: !!it.checked,
      mastery: "none" as Mastery,
      toReview: false,
    }));
    b.studyNote = pick<string>("studyNote", "");
    const ft = pick<Record<string, string>>("fitness", {});
    b.fitness = {
      plan: ft?.plan ?? "",
      detail: "",
      actual: ft?.actual ?? "",
      weight: "",
      feel: "",
      next: ft?.next ?? "",
    };
    const img = pick<Record<string, Record<string, string>>>("image", {});
    (["skincare", "hair", "outfit"] as const).forEach((k) => {
      b.image[k] = {
        learn: img?.[k]?.learn ?? "",
        actual: img?.[k]?.actual ?? "",
        next: img?.[k]?.next ?? "",
      };
    });
    b.activities = (pick<Array<Record<string, unknown>>>("activities", []) || []).map((a) => ({
      id: String(a.id ?? uid()),
      type: String(a.type ?? "其他"),
      time: "",
      people: "",
      note: String(a.note ?? ""),
    }));
    b.selfScore = pick<number>("selfScore", 0);
  } catch {
    return b;
  }
  return b;
}

export function loadDay(k: string): DayData {
  try {
    const raw = localStorage.getItem(DATA_PREFIX + k);
    if (!raw) return emptyDay();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && parsed.v === 2) {
      const base = emptyDay();
      const p = parsed as unknown as Partial<DayData>;
      return {
        ...base,
        ...p,
        life: { ...base.life, ...(p.life ?? {}) },
        records: { ...base.records, ...(p.records ?? {}) },
        sleep: { ...base.sleep, ...(p.sleep ?? {}) },
        fitness: { ...base.fitness, ...(p.fitness ?? {}) },
        image: {
          skincare: { ...base.image.skincare, ...(p.image?.skincare ?? {}) },
          hair: { ...base.image.hair, ...(p.image?.hair ?? {}) },
          outfit: { ...base.image.outfit, ...(p.image?.outfit ?? {}) },
        },
        workItems: Array.isArray(p.workItems) ? p.workItems : [],
        workGoals: Array.isArray(p.workGoals) && p.workGoals.length === 3 ? p.workGoals : ["", "", ""],
        studyItems: Array.isArray(p.studyItems) ? p.studyItems : [],
        activities: Array.isArray(p.activities) ? p.activities : [],
        expenses: Array.isArray(p.expenses) ? p.expenses : [],
        photos: Array.isArray(p.photos) ? p.photos : [],
        recordTags: Array.isArray(p.recordTags) ? p.recordTags : [],
      };
    }
    return migrate(parsed);
  } catch {
    return emptyDay();
  }
}

export function saveDay(k: string, d: DayData): void {
  try {
    localStorage.setItem(DATA_PREFIX + k, JSON.stringify(d));
    const idx = loadIndex();
    const study = d.studyItems.some((i) => i.actualMin > 0 || i.checked);
    idx[k] = {
      score: computeScore(d).total,
      filled: hasContent(d),
      mood: d.mood,
      study,
      fit: !!d.fitness.actual.trim(),
      q: d.sleep.quality,
      photo: d.photos.length > 0 || d.records.photo || !!d.outfitPhoto,
    };
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch {
    /* 存储已满等异常静默处理 */
  }
}

export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

/* ---------------- 内容完整度 ---------------- */

export function hasContent(d: DayData): boolean {
  if (d.weather || d.place.trim() || d.mood || d.moodNote.trim()) return true;
  if (d.workItems.length || d.workGoals.some((g) => g.trim()) || d.workNote.trim()) return true;
  const L = d.life;
  if (
    L.breakfast || L.lunch || L.dinner || L.water > 0 || L.dietNote ||
    L.location || L.transport || L.home || L.shopping
  ) return true;
  if (d.expenses.length) return true;
  if (d.activities.length) return true;
  if (Object.values(d.records).some(Boolean) || d.recordNote.trim() || d.photos.length || d.recordTags.length) return true;
  if (Object.entries(d.sleep).some(([kk, v]) => kk !== "quality" && String(v).trim())) return true;
  if (d.sleep.quality > 0) return true;
  if (d.studyItems.length || d.studyNote.trim() || d.studyNext.trim()) return true;
  if (Object.values(d.fitness).some((v) => v.trim())) return true;
  const rows = [d.image.skincare, d.image.hair, d.image.outfit];
  if (rows.some((r) => r.learn.trim() || r.actual.trim() || r.next.trim())) return true;
  if (d.outfitPhoto) return true;
  if (d.selfScore > 0 || d.scoreOverride > 0 || d.scoreNote.trim()) return true;
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

export function sleepSpanMin(bed: string, wake: string): number {
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
  const doneRate = d.workItems.filter((i) => i.done).length / n;
  const goals = d.workGoals.filter((g) => g.trim()).length;
  const review = d.workNote.trim() || d.workBlockers.trim() || d.workTomorrow.trim() ? 1 : 0;
  return clamp(doneRate * 78 + Math.min(goals, 3) * 4 + review * 10, 0, 100);
}

function studyScore(d: DayData): number {
  const n = d.studyItems.length;
  if (!n) return 0;
  let exec = 0;
  d.studyItems.forEach((it) => {
    exec += it.planMin > 0 ? Math.min(it.actualMin / it.planMin, 1) : it.actualMin > 0 ? 1 : 0;
  });
  const execPct = exec / n;
  const checkPct = d.studyItems.filter((i) => i.checked).length / n;
  const masteryPts = d.studyItems.reduce((s, i) => s + (i.mastery === "full" ? 1 : i.mastery === "part" ? 0.5 : 0), 0) / n;
  return clamp(execPct * 62 + checkPct * 16 + masteryPts * 22, 0, 100);
}

function sleepScore(d: DayData): number {
  const s = d.sleep;
  const hasPlan = !!(s.planBed && s.planWake);
  const hasAct = !!(s.actBed && s.actWake);
  if (hasAct) {
    const hours = sleepSpanMin(s.actBed, s.actWake) / 60;
    let sc = 100 - Math.min(Math.abs(hours - 8) * 30, 80);
    if (hasPlan) {
      const drift = Math.abs(startMin(s.actBed) - startMin(s.planBed));
      if (drift <= 30) sc = Math.min(100, sc + 8);
      else if (drift <= 60) sc = Math.min(100, sc + 4);
    }
    sc = clamp(sc, 10, 100);
    if (s.quality > 0) sc = sc * 0.8 + s.quality * 20 * 0.2;
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
  const f = d.fitness;
  let sc = 0;
  if (f.plan.trim() || f.detail.trim()) sc += 35;
  if (f.actual.trim()) sc += 45;
  if (f.next.trim()) sc += 12;
  if (f.feel.trim()) sc += 8;
  return clamp(sc, 0, 100);
}

function lifeScore(d: DayData): number {
  const L = d.life;
  const meals = [L.breakfast, L.lunch, L.dinner].filter((v) => v.trim()).length;
  let sc = (meals / 3) * 40;
  if (L.water > 0) sc += 10;
  if (L.location.trim() || L.transport.trim()) sc += 25;
  if (L.home.trim() || L.shopping.trim()) sc += 25;
  return clamp(sc, 0, 100);
}

function recordsScore(d: DayData): number {
  let sc = 0;
  if (d.photos.length > 0) sc += 30;
  if (d.records.vlog) sc += 15;
  if (d.records.social) sc += 15;
  if (d.records.showcase || d.isPublic) sc += 15;
  if (d.recordNote.trim()) sc += 15;
  if (d.recordTags.length) sc += 10;
  return clamp(sc, 0, 100);
}

function activitiesScore(d: DayData): number {
  const n = d.activities.length;
  if (!n) return 0;
  const base = (Math.min(n, 2) / 2) * 60;
  const detailed =
    (d.activities.filter((a) => a.note.trim() || a.people.trim() || a.time.trim()).length / n) * 40;
  return base + detailed;
}

function imageScore(d: DayData): number {
  let f = 0;
  [d.image.skincare, d.image.hair, d.image.outfit].forEach((r) => {
    if (r.learn.trim()) f++;
    if (r.actual.trim()) f++;
    if (r.next.trim()) f++;
  });
  let sc = (f / 9) * 92;
  if (d.outfitPhoto) sc += 8;
  return clamp(sc, 0, 100);
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

export function computeScore(
  d: DayData,
  weights?: Record<ModuleKey, number>,
  enabled?: ModuleKey[]
): DayScore {
  const w = weights ?? DEFAULT_SETTINGS.weights;
  const en = enabled ?? MODULE_KEYS;
  const parts = en.map((k) => ({
    key: k,
    score: Math.round(SCORERS[k](d)),
    weight: w[k] ?? MODULES[k].weight,
  }));
  const sumW = parts.reduce((s, p) => s + p.weight, 0) || 1;
  const total = Math.round(parts.reduce((s, p) => s + p.score * p.weight, 0) / sumW);
  return { total, parts };
}

export function scoreVerdict(total: number): { label: string; color: string; tip: string } {
  if (total >= 85) return { label: "优秀", color: "#d9482b", tip: "闪闪发光的一天，值得给自己盖个章。" };
  if (total >= 70) return { label: "不错", color: "#2e6b54", tip: "节奏很稳，保持住这个状态。" };
  if (total >= 55) return { label: "尚可", color: "#e8a33d", tip: "基本盘在线，明天再往前挪一点。" };
  if (total >= 35) return { label: "需调整", color: "#46639e", tip: "找到今天最耗能的一件事，明天绕开它。" };
  return { label: "重新出发", color: "#7c8794", tip: "低分不代表糟糕的一天，只代表新的一页。" };
}

export function encouragement(total: number): string {
  return scoreVerdict(total).tip;
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

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  high: { label: "高", color: "#d9482b" },
  mid: { label: "中", color: "#e8a33d" },
  low: { label: "低", color: "#7c8794" },
};

export const MASTERY_META: Record<Mastery, { label: string; color: string }> = {
  none: { label: "未掌握", color: "#9a9484" },
  part: { label: "部分掌握", color: "#e8a33d" },
  full: { label: "已掌握", color: "#3e9c6e" },
};

export const ACT_TYPES = ["聚餐", "电影", "逛街", "演出", "看展", "运动", "散步", "社交", "独处", "其他"];

export const RECORD_TAG_PRESETS = ["日常", "探店", "自拍", "穿搭", "美食", "旅行", "学习", "健身"];

export const WORK_TEMPLATES = ["晨会同步", "回复邮件", "周报整理", "专注攻坚 2h", "需求评审"];

export const STUDY_TEMPLATES = ["英语", "阅读", "刷题", "专业课", "技能练习"];

export const FITNESS_TYPES = ["力量", "有氧", "跑步", "瑜伽", "游泳", "球类", "拉伸", "休息"];

export const SLEEP_PRESETS = [
  { label: "早睡", bed: "22:30", wake: "06:30" },
  { label: "规律", bed: "23:30", wake: "07:30" },
  { label: "晚睡", bed: "00:30", wake: "08:30" },
];

/* ---------------- 日总结 ---------------- */

export function buildSummary(d: DayData, date: Date, score: DayScore): string {
  const L: string[] = [];
  L.push(
    `${date.getMonth() + 1}月${date.getDate()}日 · 周${WEEKDAYS[date.getDay()]} · 今日状态 ${score.total} 分 · ${scoreVerdict(score.total).label}`
  );
  if (d.weather) L.push(`▸ 天气/地点：${WEATHERS.find((w) => w.key === d.weather)?.label ?? ""}${d.place ? ` · ${d.place}` : ""}`);

  const goals = d.workGoals.filter((g) => g.trim());
  const wk = d.workItems;
  L.push(
    wk.length || goals.length
      ? `▸ 工作：目标 ${goals.length} 条；任务完成 ${wk.filter((i) => i.done).length}/${wk.length}${d.workBlockers.trim() ? `；卡点「${d.workBlockers.trim()}」` : ""}${d.workTomorrow.trim() ? `；明日「${d.workTomorrow.trim()}」` : ""}`
      : "▸ 工作：未记录"
  );

  if (d.studyItems.length) {
    const plan = d.studyItems.reduce((s, i) => s + (i.planMin || 0), 0);
    const act = d.studyItems.reduce((s, i) => s + (i.actualMin || 0), 0);
    const reviews = d.studyItems.filter((i) => i.toReview).length;
    L.push(`▸ 学习：计划 ${plan} 分 / 实际 ${act} 分，检查 ${d.studyItems.filter((i) => i.checked).length} 项${reviews ? `，待复习 ${reviews} 项` : ""}`);
  } else L.push("▸ 学习：未记录");

  const s = d.sleep;
  const actSleep = s.actBed && s.actWake ? fmtDur(sleepSpanMin(s.actBed, s.actWake)) : null;
  L.push(
    `▸ 睡眠：${actSleep ? `实际 ${actSleep}` : "实际未记录"}${s.quality ? `，质量 ${s.quality}/5 星` : ""}${s.nextBed && s.nextWake ? `；明日 ${s.nextBed}-${s.nextWake}` : ""}`
  );

  const f = d.fitness;
  L.push(
    f.actual.trim()
      ? `▸ 健身：${f.actual.trim()}${f.weight ? `（${f.weight}kg）` : ""}${f.next.trim() ? `；下一步「${f.next.trim()}」` : ""}`
      : f.plan.trim()
        ? `▸ 健身：计划「${f.plan.trim()}」未完成`
        : "▸ 健身：未记录"
  );

  const lifeBits: string[] = [];
  if (d.life.breakfast) lifeBits.push(`早·${d.life.breakfast}`);
  if (d.life.lunch) lifeBits.push(`午·${d.life.lunch}`);
  if (d.life.dinner) lifeBits.push(`晚·${d.life.dinner}`);
  if (d.life.water > 0) lifeBits.push(`水×${d.life.water}`);
  if (d.life.location) lifeBits.push(`行·${d.life.location}`);
  if (d.expenses.length)
    lifeBits.push(`支出¥${d.expenses.reduce((ss, e) => ss + e.amount, 0).toFixed(0)}`);
  L.push(lifeBits.length ? `▸ 生活：${lifeBits.join("；")}` : "▸ 生活：未记录");

  L.push(
    d.activities.length
      ? `▸ 活动：${d.activities.map((a) => `${a.type}${a.note.trim() ? `·${a.note.trim()}` : ""}`).join("；")}`
      : "▸ 活动：未记录"
  );

  const recs: string[] = [];
  if (d.photos.length) recs.push(`照片×${d.photos.length}`);
  if (d.records.vlog) recs.push("Vlog");
  if (d.recordTags.length) recs.push(`#${d.recordTags.join(" #")}`);
  L.push(recs.length || d.recordNote.trim() ? `▸ 记录：${[...recs, d.recordNote.trim()].filter(Boolean).join("；")}` : "▸ 记录：未打卡");

  const m = moodOf(d.mood);
  L.push(`▸ 心情：${m ? m.label : "未选择"} · 能量 ${d.energy}/10${d.moodNote.trim() ? ` · ${d.moodNote.trim()}` : ""}`);
  if (d.scoreNote.trim()) L.push(`▸ 一句话总结：${d.scoreNote.trim()}`);
  return L.join("\n");
}

/* ---------------- 洞察 ---------------- */

export interface TrendPoint {
  key: string;
  label: string;
  score: number | null;
  mood: MoodKey | null;
}

export function trendSeries(index: LedgerIndex, days: number, endDate = new Date()): TrendPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(endDate, i - (days - 1));
    const k = keyOf(d);
    const meta = index[k];
    return {
      key: k,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      score: meta?.filled ? meta.score : null,
      mood: meta?.mood ?? null,
    };
  });
}

export interface HeatCell {
  key: string;
  day: number;
  score: number | null;
  filled: boolean;
}

export function monthHeat(date: Date, index: LedgerIndex): HeatCell[][] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startOff = (first.getDay() + 6) % 7;
  const cells: (HeatCell | null)[] = Array.from({ length: startOff }, () => null);
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(date.getFullYear(), date.getMonth(), i);
    const k = keyOf(d);
    const meta = index[k];
    cells.push({
      key: k,
      day: i,
      score: meta?.filled ? meta.score : null,
      filled: !!meta?.filled,
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: HeatCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7) as HeatCell[]);
  return weeks;
}

export interface NightPoint {
  key: string;
  weekday: string;
  hours: number | null;
}

export function sleepSeries(index: LedgerIndex, endDateKey: string, n = 7): NightPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const d = addDays(parseKey(endDateKey), i - (n - 1));
    const k = keyOf(d);
    const meta = index[k];
    let hours: number | null = null;
    if (meta?.filled) {
      const day = loadDay(k);
      if (day.sleep.actBed && day.sleep.actWake) {
        hours = Math.round((sleepSpanMin(day.sleep.actBed, day.sleep.actWake) / 60) * 10) / 10;
      }
    }
    return { key: k, weekday: WEEKDAYS[d.getDay()], hours };
  });
}

export function sleepStats(nights: NightPoint[]): { avg: string | null; debt: number | null } {
  const hs = nights.filter((x) => x.hours !== null).map((x) => x.hours as number);
  if (!hs.length) return { avg: null, debt: null };
  const avg = hs.reduce((a, b) => a + b, 0) / hs.length;
  const debt = Math.round((hs.reduce((a, b) => a + (8 - b), 0) / hs.length) * 10) / 10;
  return { avg: avg.toFixed(1), debt };
}

export interface WeekReview {
  avg: number | null;
  best: { label: string; score: number } | null;
  work: { done: number; total: number };
  studyPlan: number;
  studyAct: number;
  fitDays: number;
  moodDist: Record<MoodKey, number>;
  partsAvg: { key: ModuleKey; avg: number }[];
  weakest: ModuleKey | null;
}

const WEAK_TIPS: Record<ModuleKey, string> = {
  work: "从明天早上的 3 条核心目标开始，任务先列再做。",
  study: "把「下一步计划」写下来，明早会自动提醒你带过来。",
  sleep: "今晚试试 23:30 前上床，先固定入睡时间。",
  mood: "情绪低落时，先记一句诱因——看见它，就轻了一半。",
  fitness: "哪怕 10 分钟拉伸也算训练，先让连续天数跑起来。",
  life: "三餐里先认真记一顿，好好吃饭是最低成本的正事。",
  records: "今天拍一张照片就好，不用追求精致。",
  activities: "给自己约一件小事：散步、电影或一顿好饭。",
  image: "护肤从最简单的三步开始：清洁、保湿、防晒。",
};

export function weekReview(index: LedgerIndex, week: Date[], enabled: ModuleKey[]): WeekReview {
  const res: WeekReview = {
    avg: null,
    best: null,
    work: { done: 0, total: 0 },
    studyPlan: 0,
    studyAct: 0,
    fitDays: 0,
    moodDist: { happy: 0, calm: 0, down: 0, anxious: 0, tired: 0 },
    partsAvg: [],
    weakest: null,
  };
  const totals: number[] = [];
  const sums: Record<string, { s: number; n: number }> = {};
  week.forEach((d) => {
    const k = keyOf(d);
    const meta = index[k];
    if (!meta?.filled) return;
    totals.push(meta.score);
    if (!res.best || meta.score > res.best.score)
      res.best = { label: `${d.getMonth() + 1}/${d.getDate()}`, score: meta.score };
    if (meta.mood) res.moodDist[meta.mood]++;
    if (meta.fit) res.fitDays++;
    const day = loadDay(k);
    res.work.total += day.workItems.length;
    res.work.done += day.workItems.filter((i) => i.done).length;
    res.studyPlan += day.studyItems.reduce((s, i) => s + i.planMin, 0);
    res.studyAct += day.studyItems.reduce((s, i) => s + i.actualMin, 0);
    const sc = computeScore(day, undefined, enabled);
    sc.parts.forEach((p) => {
      if (!sums[p.key]) sums[p.key] = { s: 0, n: 0 };
      sums[p.key].s += p.score;
      sums[p.key].n++;
    });
  });
  if (totals.length) res.avg = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
  res.partsAvg = enabled
    .map((k) => ({ key: k, avg: sums[k]?.n ? Math.round(sums[k].s / sums[k].n) : 0 }))
    .sort((a, b) => a.avg - b.avg);
  res.weakest = res.partsAvg.length && totals.length ? res.partsAvg[0].key : null;
  return res;
}

export const weakTip = (k: ModuleKey): string => WEAK_TIPS[k];

/* ---------------- 勋章 ---------------- */

export interface Medal {
  id: string;
  label: string;
  desc: string;
  got: boolean;
  cur: number;
  target: number;
  color: string;
}

function streakOf(index: LedgerIndex, pred: (m: DayMeta) => boolean): number {
  let s = 0;
  let cur = new Date();
  if (!index[keyOf(cur)] || !pred(index[keyOf(cur)])) cur = addDays(cur, -1);
  while (index[keyOf(cur)] && pred(index[keyOf(cur)])) {
    s++;
    cur = addDays(cur, -1);
  }
  return s;
}

const countOf = (index: LedgerIndex, pred: (m: DayMeta) => boolean): number =>
  Object.values(index).filter((m) => m?.filled && pred(m)).length;

export function computeMedals(index: LedgerIndex): Medal[] {
  const reviewS = streakOf(index, (m) => m.filled);
  const studyS = streakOf(index, (m) => m.study);
  const fitS = streakOf(index, (m) => m.fit);
  const totalDays = Object.values(index).filter((m) => m?.filled).length;
  const goodSleep = countOf(index, (m) => m.q >= 4);
  const photoDays = countOf(index, (m) => m.photo);
  const happyDays = countOf(index, (m) => m.mood === "happy");
  const mk = (id: string, label: string, desc: string, cur: number, target: number, color: string): Medal => ({
    id, label, desc, cur: Math.min(cur, target), target, got: cur >= target, color,
  });
  return [
    mk("review7", "复盘新人", "连续复盘 7 天", reviewS, 7, "#cd7f32"),
    mk("review30", "月度坚持", "连续复盘 30 天", reviewS, 30, "#e8a33d"),
    mk("study7", "学有所成", "连续学习打卡 7 天", studyS, 7, "#2c8c99"),
    mk("fit7", "铁人养成", "连续健身打卡 7 天", fitS, 7, "#d9482b"),
    mk("total30", "记账达人", "累计记录 30 天", totalDays, 30, "#2e6b54"),
    mk("sleep7", "好眠之星", "睡眠质量 ≥4 星累计 7 天", goodSleep, 7, "#46639e"),
    mk("photo10", "生活捕手", "有照片的日子累计 10 天", photoDays, 10, "#a24e9c"),
    mk("happy10", "阳光体质", "心情「开心」累计 10 天", happyDays, 10, "#e8a33d"),
  ];
}

/* ---------------- 标签检索 ---------------- */

export interface TagHit {
  key: string;
  label: string;
  note: string;
  tags: string[];
}

export function collectTags(index: LedgerIndex): string[] {
  const set = new Set<string>();
  Object.keys(index).forEach((k) => {
    if (!index[k]?.filled) return;
    loadDay(k).recordTags.forEach((t) => set.add(t));
  });
  return [...set].sort();
}

export function tagSearch(index: LedgerIndex, q: string): TagHit[] {
  const query = q.trim().replace(/^#/, "").toLowerCase();
  if (!query) return [];
  const hits: TagHit[] = [];
  Object.keys(index)
    .sort()
    .reverse()
    .forEach((k) => {
      if (!index[k]?.filled) return;
      const d = loadDay(k);
      const tagMatch = d.recordTags.some((t) => t.toLowerCase().includes(query));
      const noteMatch = d.recordNote.toLowerCase().includes(query);
      if (tagMatch || noteMatch) {
        const dt = parseKey(k);
        hits.push({
          key: k,
          label: `${dt.getMonth() + 1}月${dt.getDate()}日`,
          note: d.recordNote,
          tags: d.recordTags,
        });
      }
    });
  return hits.slice(0, 30);
}

/* ---------------- 图片压缩 ---------------- */

export function compressImage(file: File, max = 1000, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败"));
    };
    img.src = url;
  });
}

/* ---------------- 导出 ---------------- */

export function exportAll(): string {
  const out: Record<string, unknown> = { app: "day-ledger", version: 2, exportedAt: new Date().toISOString(), days: {} };
  Object.keys(localStorage)
    .filter((k) => k.startsWith(DATA_PREFIX))
    .forEach((k) => {
      try {
        (out.days as Record<string, unknown>)[k.slice(DATA_PREFIX.length)] = JSON.parse(
          localStorage.getItem(k) || "null"
        );
      } catch {
        /* skip */
      }
    });
  (out as Record<string, unknown>).settings = loadSettings();
  return JSON.stringify(out, null, 2);
}

export interface ImportResult {
  ok: boolean;
  count: number;
  error?: string;
}

export function importAll(json: string): ImportResult {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const days = parsed.days as Record<string, unknown> | undefined;
    if (!days || typeof days !== "object") return { ok: false, count: 0, error: "文件格式不正确" };
    let count = 0;
    Object.entries(days).forEach(([k, v]) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
        localStorage.setItem(DATA_PREFIX + k, JSON.stringify(v));
        count++;
      }
    });
    if (parsed.settings) saveSettings(parsed.settings as Settings);
    const idx = loadIndex();
    Object.keys(days).forEach((k) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
        const d = loadDay(k);
        idx[k] = {
          score: computeScore(d).total,
          filled: hasContent(d),
          mood: d.mood,
          study: d.studyItems.some((i) => i.actualMin > 0 || i.checked),
          fit: !!d.fitness.actual.trim(),
          q: d.sleep.quality,
          photo: d.photos.length > 0 || d.records.photo || !!d.outfitPhoto,
        };
      }
    });
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
    return { ok: true, count };
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "解析失败" };
  }
}
