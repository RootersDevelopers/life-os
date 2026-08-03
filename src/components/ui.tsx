"use client";
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, X, XCircle, Inbox } from "lucide-react";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Buttons ---------------- */
export function Button({
  variant = "primary", size = "md", className, children, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger" | "dark";
  size?: "sm" | "md" | "lg";
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98]";
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-sm" };
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/30",
    ghost: "text-ink-soft hover:bg-ink/5",
    outline: "border border-line bg-card text-ink hover:border-brand-400 hover:text-brand-700",
    danger: "bg-danger text-white hover:brightness-95",
    dark: "bg-night text-white hover:bg-night-3",
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function IconBtn({ className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("h-9 w-9 grid place-items-center rounded-lg text-mute hover:text-ink hover:bg-ink/5 transition-colors", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- Form fields ---------------- */
const fieldCls =
  "w-full h-10 px-3 rounded-xl border border-line bg-card text-sm text-ink placeholder:text-mute/70 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-shadow";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldCls, props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldCls, "h-auto py-2 min-h-20 resize-none", props.className)} />;
}
export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(fieldCls, "appearance-none pr-8 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236d766f%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_0.75rem_center]", props.className)}>
      {children}
    </select>
  );
}
export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-xs font-semibold text-ink-soft">
        {label}
        {hint && <span className="font-medium text-mute">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 rounded-full transition-colors shrink-0", checked ? "bg-brand-500" : "bg-ink/15")}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl bg-ink/5 p-1 gap-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "px-3.5 h-8 rounded-lg text-xs font-semibold transition-all",
            value === o.value ? "bg-card text-ink shadow-sm" : "text-mute hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Surfaces ---------------- */
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl bg-card border border-line shadow-card", className)}>{children}</div>;
}

export function CardHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
      <div>
        <h3 className="font-display font-semibold text-[15px] text-ink">{title}</h3>
        {sub && <p className="text-xs text-mute mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Badge({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "mute" | "warn" | "danger" | "info" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    mute: "bg-ink/5 text-ink-soft border-line",
    warn: "bg-warn/10 text-amber-700 border-warn/30",
    danger: "bg-danger/10 text-danger border-danger/25",
    info: "bg-info/10 text-blue-700 border-info/25",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

export function Progress({ value, max, color = "#1db463", className }: { value: number; max: number; color?: string; className?: string }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className={cn("h-2 rounded-full bg-ink/8 overflow-hidden", className)}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Ring({ value, max, size = 64, stroke = 6, color = "#1db463", children }: {
  value: number; max: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / Math.max(1, max));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(19 24 21 / 0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/* ---------------- States ---------------- */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin h-5 w-5", className)} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-ink/8", className)} />;
}

export function EmptyState({ icon, title, sub, action }: { icon?: React.ReactNode; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 anim-fade">
      <div className="h-14 w-14 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 grid place-items-center mb-4">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h4 className="font-display font-semibold text-ink">{title}</h4>
      {sub && <p className="text-sm text-mute mt-1 max-w-xs">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-night/50 backdrop-blur-[2px] anim-fade" onClick={onClose} />
      <div className={cn("relative w-full rounded-2xl bg-card border border-line shadow-pop anim-modal max-h-[90vh] flex flex-col", wide ? "max-w-2xl" : "max-w-md")}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-display font-semibold text-ink">{title}</h3>
          <IconBtn onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></IconBtn>
        </div>
        <div className="p-5 overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ---------------- Toasts ---------------- */
type Toast = { id: number; kind: "success" | "error" | "info"; msg: string };
const ToastCtx = createContext<{ push: (kind: Toast["kind"], msg: string) => void }>({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const idRef = useRef(0);
  const push = useCallback((kind: Toast["kind"], msg: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-brand-400" />,
    error: <XCircle className="h-4 w-4 text-danger" />,
    info: <Info className="h-4 w-4 text-info" />,
  };
  return (
    <ToastCtx.Provider value={value}>
      {children}
      {mounted && createPortal(
        <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)]">
          {toasts.map((t) => (
            <div key={t.id} className="anim-toast flex items-start gap-2.5 rounded-xl bg-night text-white/90 border border-night-line px-3.5 py-3 shadow-pop">
              <span className="mt-0.5">{icons[t.kind]}</span>
              <p className="text-[13px] font-medium leading-snug flex-1">{t.msg}</p>
              <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="text-white/40 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}

export function Confirm({ open, onClose, onConfirm, title, sub }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; sub: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-danger/10 text-danger grid place-items-center shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-ink-soft leading-relaxed">{sub}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
      </div>
    </Modal>
  );
}
