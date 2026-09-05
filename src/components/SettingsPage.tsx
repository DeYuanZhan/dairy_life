import { useRef, useState } from "react";
import {
  MODULES,
  MODULE_KEYS,
  exportAll,
  importAll,
  type ModuleKey,
  type Settings,
} from "../lib/core";
import { Icon, Toggle, useReveal, type IconName } from "./ui";
import type { Notify } from "./ModulesA";

const MODULE_ICONS: Record<ModuleKey, IconName> = {
  work: "briefcase",
  study: "book",
  sleep: "moon",
  mood: "star",
  fitness: "dumbbell",
  image: "shirt",
  life: "bowl",
  activities: "ticket",
  records: "camera",
};

function Panel({ title, icon, children, desc }: { title: string; icon: IconName; children: React.ReactNode; desc?: string }) {
  return (
    <div className="rounded-xl border border-line bg-sheet p-5 shadow-[0_14px_30px_-22px_rgba(36,48,41,0.35)]">
      <p className="lbl !mb-0.5">
        <Icon name={icon} size={14} strokeWidth={2.2} className="text-seal" />
        {title}
      </p>
      {desc && <p className="mb-3 text-[11px] text-ink2">{desc}</p>}
      {children}
    </div>
  );
}

export function SettingsPage({
  settings,
  onSettings,
  notify,
  onDataChanged,
}: {
  settings: Settings;
  onSettings: (s: Settings) => void;
  notify: Notify;
  onDataChanged: () => void;
}) {
  const [ref, inView] = useReveal<HTMLDivElement>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [usage, setUsage] = useState<number | null>(null);

  const sumW = MODULE_KEYS.reduce((s, k) => s + (settings.weights[k] || 0), 0);

  const calcUsage = () => {
    let bytes = 0;
    Object.keys(localStorage)
      .filter((k) => k.startsWith("dayledger"))
      .forEach((k) => {
        bytes += (localStorage.getItem(k) ?? "").length * 2;
      });
    setUsage(Math.round(bytes / 1024));
  };

  const doExport = () => {
    try {
      const blob = new Blob([exportAll()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `一日手账备份-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notify("备份文件已开始下载");
    } catch {
      notify("导出失败，请重试");
    }
  };

  const onImport = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importAll(String(reader.result ?? ""));
      if (res.ok) {
        notify(`导入成功：${res.count} 天记录`);
        onDataChanged();
      } else {
        notify(`导入失败：${res.error ?? "未知错误"}`);
      }
    };
    reader.readAsText(f);
  };

  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} mt-6 grid gap-5 lg:grid-cols-2`}>
      <div className="space-y-5">
        {/* 模块开关 */}
        <Panel title="模块开关" icon="gear" desc="关掉暂时不用的模块，首页就不会冗长。关闭的模块不计入总分。">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MODULE_KEYS.map((k) => {
              const meta = MODULES[k];
              const on = settings.modules[k];
              return (
                <div key={k} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all duration-200 ${on ? "border-line/80 bg-white" : "border-dashed border-line bg-white/40 opacity-70"}`}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md transition-all" style={{ background: on ? `color-mix(in srgb, ${meta.color} 13%, #fff)` : "#efeadd", color: on ? meta.color : "#b3ac99" }}>
                    <Icon name={MODULE_ICONS[k]} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{meta.label}</p>
                    <p className="font-num text-[9px] tracking-widest text-ink2">{meta.en}</p>
                  </div>
                  <Toggle on={on} color={meta.color} onChange={(v) => onSettings({ ...settings, modules: { ...settings.modules, [k]: v } })} />
                </div>
              );
            })}
            <div className="flex items-center gap-2.5 rounded-lg border border-[#e7d9b8] bg-[#fcf8ee] px-3 py-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#f3e8cd] text-[#a5791c]">
                <Icon name="wallet" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">消费记账</p>
                <p className="text-[9px] text-ink2">生活模块内的当日账单</p>
              </div>
              <Toggle on={settings.spending} color="#a5791c" onChange={(v) => onSettings({ ...settings, spending: v })} />
            </div>
          </div>
        </Panel>

        {/* 提醒 */}
        <Panel title="每日提醒" icon="alarm" desc="开启后将在浏览器内定时提醒（需允许通知权限，页面保持打开时生效）。">
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-line/80 bg-white px-3.5 py-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                  <Icon name="sun" size={14} className="text-gold" strokeWidth={2.2} />
                  晨间规划提醒
                </p>
                <p className="font-num text-[10px] text-ink2">每天 08:00</p>
              </div>
              <Toggle
                on={settings.reminders.morning}
                color="#e8a33d"
                onChange={(v) => {
                  if (v && "Notification" in window && Notification.permission === "default") {
                    void Notification.requestPermission();
                  }
                  onSettings({ ...settings, reminders: { ...settings.reminders, morning: v } });
                }}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-line/80 bg-white px-3.5 py-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                  <Icon name="moon" size={14} className="text-[#46639e]" strokeWidth={2.2} />
                  晚间复盘提醒
                </p>
                <p className="font-num text-[10px] text-ink2">每天 21:30</p>
              </div>
              <Toggle
                on={settings.reminders.evening}
                color="#46639e"
                onChange={(v) => {
                  if (v && "Notification" in window && Notification.permission === "default") {
                    void Notification.requestPermission();
                  }
                  onSettings({ ...settings, reminders: { ...settings.reminders, evening: v } });
                }}
              />
            </div>
          </div>
        </Panel>
      </div>

      <div className="space-y-5">
        {/* 打分权重 */}
        <Panel title="打分权重" icon="gauge" desc={`调整九个维度在总分中的占比，当前合计 ${sumW} 分（自动归一化为 100 分制）。`}>
          <div className="space-y-2.5">
            {MODULE_KEYS.map((k) => {
              const meta = MODULES[k];
              const w = settings.weights[k] || 0;
              const pct = sumW ? Math.round((w / sumW) * 100) : 0;
              return (
                <div key={k} className={`flex items-center gap-3 ${settings.modules[k] ? "" : "opacity-45"}`}>
                  <span className="w-9 shrink-0 text-xs font-bold text-ink">{meta.label}</span>
                  <input
                    type="range" min={0} max={40} step={1} value={w}
                    onChange={(e) => onSettings({ ...settings, weights: { ...settings.weights, [k]: Number(e.target.value) } })}
                    className="slider flex-1"
                    style={{ "--c": meta.color, "--fill": `${(w / 40) * 100}%` } as React.CSSProperties}
                  />
                  <span className="font-num w-14 shrink-0 text-right text-xs font-bold" style={{ color: meta.color }}>
                    {w} 分
                  </span>
                  <span className="font-num w-9 shrink-0 text-right text-[10px] text-ink2">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* 数据与隐私 */}
        <Panel title="数据备份与隐私" icon="lock" desc="本地优先：所有数据只保存在你的浏览器里，不经过任何服务器。">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={doExport} className="flex items-center justify-center gap-1.5 rounded-lg bg-ink px-3 py-2.5 text-xs font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-seal hover:shadow-md active:translate-y-0">
              <Icon name="download" size={14} strokeWidth={2.4} />
              导出 JSON 备份
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2.5 text-xs font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-pine hover:text-pine hover:shadow-md active:translate-y-0">
              <Icon name="upload" size={14} strokeWidth={2.4} />
              导入备份
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { onImport(e.target.files); e.target.value = ""; }} />
            <button type="button" onClick={calcUsage} className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-white/60 px-3 py-2.5 text-xs font-bold text-ink2 transition-all hover:border-ink/40 hover:text-ink">
              <Icon name="chart" size={14} strokeWidth={2.4} />
              {usage === null ? "查看本地存储占用" : `当前占用约 ${usage >= 1024 ? (usage / 1024).toFixed(1) + " MB" : usage + " KB"}`}
            </button>
          </div>
          <div className="mt-3 rounded-lg border border-dashed border-line bg-white/50 px-3.5 py-3 text-[11px] leading-relaxed text-ink2">
            <p className="font-bold text-ink">隐私说明</p>
            照片会自动压缩后仅保存在本机浏览器；清空浏览器数据前请先导出备份。云端同步能力已预留接口，可对接微信云开发 / Supabase。
          </div>
        </Panel>

        {/* 关于 */}
        <Panel title="关于" icon="spark">
          <div className="flex items-center gap-3">
            <span className="font-display grid h-12 w-12 -rotate-3 place-items-center rounded-md bg-seal text-2xl font-black text-[#fff7ee] shadow-md ring-2 ring-[#fff7ee] transition-transform hover:rotate-0">
              记
            </span>
            <div>
              <p className="font-display text-base font-black text-ink">一日手账 · DAY LEDGER</p>
              <p className="text-[11px] text-ink2">早上规划，晚上复盘。认真过好的每一天，都值得被打分。</p>
              <p className="font-num mt-1 text-[9px] tracking-[0.3em] text-ink2/60">PLAN · LIVE · REVIEW · GLOW</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
