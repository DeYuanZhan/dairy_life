import {
  CSSProperties,
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MoodKey } from "../lib/core";

/* ---------------- 滚动显现 ---------------- */

export function useReveal<T extends Element>(): [MutableRefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          ob.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return [ref, inView];
}

/* ---------------- 图标（手绘线条风） ---------------- */

export type IconName =
  | "briefcase"
  | "bowl"
  | "ticket"
  | "camera"
  | "moon"
  | "book"
  | "dumbbell"
  | "shirt"
  | "gauge"
  | "plus"
  | "trash"
  | "check"
  | "chevL"
  | "chevR"
  | "copy"
  | "pen"
  | "flame"
  | "star"
  | "calendar"
  | "users"
  | "video"
  | "spark"
  | "home"
  | "bus";

const PATHS: Record<IconName, ReactNode> = {
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2" />
      <path d="M8.5 7.5V5.6A1.6 1.6 0 0 1 10.1 4h3.8a1.6 1.6 0 0 1 1.6 1.6v1.9M3 13h18" />
    </>
  ),
  bowl: (
    <>
      <path d="M4 12h16a8 8 0 0 1-16 0Z" />
      <path d="M9.2 4.5c0 1.3 1 1.7 1 3M13.8 4.5c0 1.3 1 1.7 1 3" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h13A2.5 2.5 0 0 1 21 8.5v.6a2.9 2.9 0 0 0 0 5.8v.6a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 15.5v-.6a2.9 2.9 0 0 0 0-5.8Z" />
      <path d="M14.5 6.5v1.6M14.5 11.2v1.6M14.5 15.9v1.6" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13.2" r="3.6" />
      <path d="M8.2 7 9.8 4.6h4.4L15.8 7" />
    </>
  ),
  moon: (
    <>
      <path d="M20 13.6A8.4 8.4 0 1 1 10.4 4a6.9 6.9 0 0 0 9.6 9.6Z" />
      <path d="M17.5 3.5v3M16 5h3" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M9 7h6" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M6.7 6.7v10.6M17.3 6.7v10.6M3 9.2v5.6M21 9.2v5.6M6.7 12h10.6" />
    </>
  ),
  shirt: (
    <>
      <path d="M8.2 3.5 4 6.4l2.3 2.9 1.4-1v12.2h8.6V8.3l1.4 1L20 6.4l-4.2-2.9-1.9 1.9H10L8.2 3.5Z" />
    </>
  ),
  gauge: (
    <>
      <path d="M5.2 18.6a9 9 0 1 1 13.6 0" />
      <path d="M12 13.4 15.6 9" />
      <circle cx="12" cy="14" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V4.8A.8.8 0 0 1 10.3 4h3.4a.8.8 0 0 1 .8.8V7" />
      <path d="m6.5 7 .9 12.2a1 1 0 0 0 1 .8h7.2a1 1 0 0 0 1-.8L17.5 7M10.2 11v5M13.8 11v5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chevL: <path d="m14.5 6-6 6 6 6" />,
  chevR: <path d="m9.5 6 6 6-6 6" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 14.5V6a2 2 0 0 1 2-2h8.5" />
    </>
  ),
  pen: (
    <>
      <path d="M12.5 20.5h8" />
      <path d="M16.7 3.8a2.1 2.1 0 0 1 3 3L7.5 19l-4.2 1.2L4.5 16 16.7 3.8Z" />
    </>
  ),
  flame: (
    <path d="M12 3s5.2 4.6 5.2 9.6a5.2 5.2 0 0 1-10.4 0c0-2 1-3.9 2.1-5.1.3 1.2 1 2 2 2.3C11 7.4 12 3 12 3Z" />
  ),
  star: (
    <path d="m12 3.6 2.4 5 5.4.7-4 3.8 1 5.4L12 15.9l-4.8 2.6 1-5.4-4-3.8 5.4-.7Z" />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
  users: (
    <>
      <path d="M15.5 20.5v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.7A3.7 3.7 0 0 0 3 18.7v1.8" />
      <circle cx="9.2" cy="7.5" r="3.4" />
      <path d="M21 20.5v-1.8a3.7 3.7 0 0 0-2.8-3.6M15.2 4.3a3.4 3.4 0 0 1 0 6.4" />
    </>
  ),
  video: (
    <>
      <rect x="2.5" y="6.5" width="13" height="11" rx="2" />
      <path d="m15.5 10.5 6-3.4v9.8l-6-3.4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3.5 1.8 5 5 1.8-5 1.8-1.8 5-1.8-5-5-1.8 5-1.8Z" />
      <path d="M19 16.5v3M17.5 18h3" />
    </>
  ),
  home: (
    <>
      <path d="m3.5 10.8 8.5-7.3 8.5 7.3" />
      <path d="M5.8 9.5V20h12.4V9.5" />
      <path d="M10 20v-5.5h4V20" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="3.5" width="16" height="14" rx="2.2" />
      <path d="M4 10.5h16M8 6.8h8" />
      <circle cx="8" cy="19.6" r="1.4" />
      <circle cx="16" cy="19.6" r="1.4" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.9,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

/* ---------------- 表情（心情） ---------------- */

export function MoodFace({
  mood,
  size = 30,
  active = false,
  color = "#6b756e",
}: {
  mood: MoodKey;
  size?: number;
  active?: boolean;
  color?: string;
}) {
  const stroke = color;
  let eyes: ReactNode;
  let mouth: ReactNode;
  let extra: ReactNode = null;

  switch (mood) {
    case "happy":
      eyes = <path d="M7.2 10.2q1.4-1.7 2.8 0M14 10.2q1.4-1.7 2.8 0" />;
      mouth = <path d="M7.8 13.6q4.2 4.4 8.4 0" />;
      break;
    case "calm":
      eyes = (
        <>
          <circle cx="8.8" cy="10" r="0.9" fill={stroke} stroke="none" />
          <circle cx="15.2" cy="10" r="0.9" fill={stroke} stroke="none" />
        </>
      );
      mouth = <path d="M9 14.4q3 2.1 6 0" />;
      break;
    case "okay":
      eyes = (
        <>
          <circle cx="8.8" cy="10" r="0.9" fill={stroke} stroke="none" />
          <circle cx="15.2" cy="10" r="0.9" fill={stroke} stroke="none" />
        </>
      );
      mouth = <path d="M9.2 15h5.6" />;
      break;
    case "down":
      eyes = (
        <>
          <circle cx="8.8" cy="10.4" r="0.9" fill={stroke} stroke="none" />
          <circle cx="15.2" cy="10.4" r="0.9" fill={stroke} stroke="none" />
          <path d="M7.4 8.2l2.6.8M16.6 8.2l-2.6.8" />
        </>
      );
      mouth = <path d="M9 16.2q3-2.6 6 0" />;
      extra = <path d="M17.6 12.6c.8 1.1.8 1.9 0 2.4-.7-.4-.8-1.3 0-2.4Z" fill={stroke} stroke="none" opacity=".55" />;
      break;
    case "irritable":
      eyes = (
        <>
          <path d="M7.2 8.6l3 1.3M16.8 8.6l-3 1.3" />
          <circle cx="8.9" cy="11" r="0.9" fill={stroke} stroke="none" />
          <circle cx="15.1" cy="11" r="0.9" fill={stroke} stroke="none" />
        </>
      );
      mouth = <path d="M8.6 15.6q1.7-1.8 3.4 0t3.4 0" />;
      break;
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9.2"
        fill={active ? `color-mix(in srgb, ${color} 16%, #ffffff)` : "#ffffff"}
        stroke={stroke}
        strokeWidth="1.7"
        style={{ transition: "fill .25s, stroke .25s" }}
      />
      <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none">
        {eyes}
        {mouth}
        {extra}
      </g>
    </svg>
  );
}

/* ---------------- 进度环 / 进度条 ---------------- */

export function Ring({
  value,
  size = 64,
  stroke = 6,
  color = "#d9482b",
  track = "#eae4d5",
  children,
  className = "",
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div className={`relative grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(.22,.9,.3,1), stroke .4s" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function Bar({
  value,
  color = "#d9482b",
  className = "",
  height = 6,
}: {
  value: number;
  color?: string;
  className?: string;
  height?: number;
}) {
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-[#eae4d5] ${className}`}
      style={{ height }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: color,
          transition: "width .8s cubic-bezier(.22,.9,.3,1), background .4s",
        }}
      />
    </div>
  );
}

export function ProgressBadge({ value, color }: { value: number; color: string }) {
  const v = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <div className="flex items-center gap-2">
      <span className="font-num text-sm font-bold" style={{ color }}>
        {v}
        <span className="text-[10px] font-medium">%</span>
      </span>
      <Ring value={v} size={34} stroke={4} color={color}>
        {v >= 100 ? (
          <Icon name="check" size={14} className="text-current" strokeWidth={2.6} />
        ) : null}
      </Ring>
    </div>
  );
}

/* ---------------- 模块卡片 ---------------- */

export function Card({
  title,
  en,
  color,
  icon,
  hint,
  progress,
  children,
  className = "",
  delay = 0,
  tape = "left",
}: {
  title: string;
  en: string;
  color: string;
  icon: IconName;
  hint?: string;
  progress?: number;
  children: ReactNode;
  className?: string;
  delay?: number;
  tape?: "left" | "right";
}) {
  const [ref, inView] = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      className={`reveal ${inView ? "in" : ""} group/card relative flex flex-col rounded-xl border border-line bg-sheet shadow-[0_1px_0_rgba(36,48,41,0.05),0_14px_30px_-22px_rgba(36,48,41,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_2px_0_rgba(36,48,41,0.05),0_22px_44px_-24px_rgba(36,48,41,0.4)] ${className}`}
      style={{ "--c": color, transitionDelay: `${delay}ms` } as CSSProperties}
    >
      <i
        className="tape"
        style={{
          background: color,
          [tape === "left" ? "left" : "right"]: "20px",
          transform: `rotate(${tape === "left" ? -4 : 3.5}deg)`,
        }}
      />
      <header className="flex items-center gap-3 px-5 pt-5">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-transform duration-300 group-hover/card:scale-110 group-hover/card:-rotate-6"
          style={{ background: `color-mix(in srgb, ${color} 13%, #ffffff)`, color }}
        >
          <Icon name={icon} size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold leading-tight text-ink">
            {title}
            <span className="font-num ml-2 text-[10px] font-medium tracking-[0.22em] text-ink2/70">
              {en}
            </span>
          </h3>
          {hint ? <p className="mt-0.5 text-xs text-ink2">{hint}</p> : null}
        </div>
        {typeof progress === "number" ? <ProgressBadge value={progress} color={color} /> : null}
      </header>
      <div className="flex-1 px-5 pb-5 pt-4">{children}</div>
    </section>
  );
}

/* ---------------- 小部件 ---------------- */

export function DotCheck({
  checked,
  onToggle,
  color,
  size = 22,
}: {
  checked: boolean;
  onToggle: () => void;
  color: string;
  size?: number;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="grid shrink-0 place-items-center rounded-full border-2 transition-all duration-200 hover:scale-110 active:scale-95"
      style={{
        width: size,
        height: size,
        borderColor: checked ? color : "#cfc7b2",
        background: checked ? color : "transparent",
        color: "#fff",
      }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: checked ? 1 : 0,
          transform: checked ? "scale(1)" : "scale(0.4)",
          transition: "all .2s cubic-bezier(.22,.9,.3,1)",
        }}
      >
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </button>
  );
}

export function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/50 px-4 py-5 text-center text-xs leading-relaxed text-ink2">
      {text}
    </div>
  );
}

export function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
      style={
        active
          ? { background: color, borderColor: color, color: "#fff", boxShadow: `0 4px 10px -4px ${color}` }
          : { background: "#fff", borderColor: "#e3ddcd", color: "#6b756e" }
      }
    >
      {children}
    </button>
  );
}
