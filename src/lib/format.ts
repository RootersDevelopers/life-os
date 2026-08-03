export const DAY_MS = 86400000;

export function todayISO(offset = 0) {
  const d = new Date(Date.now() + offset * DAY_MS);
  return d.toISOString().slice(0, 10);
}

export function nowISO() {
  return new Date().toISOString();
}

export function parseISO(iso: string) {
  return new Date(iso + "T00:00:00");
}

export function addDaysISO(iso: string, n: number) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function startOfWeekISO(iso: string) {
  const d = parseISO(iso);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

export function weekDaysISO(iso: string) {
  const start = startOfWeekISO(iso);
  return Array.from({ length: 7 }, (_, i) => addDaysISO(start, i));
}

const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function weekdayShort(iso: string) {
  return WD[(parseISO(iso).getDay() + 6) % 7];
}

export function dayNum(iso: string) {
  return parseISO(iso).getDate();
}

export function prettyDate(iso: string) {
  const d = parseISO(iso);
  return `${WD[(d.getDay() + 6) % 7]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function longDate(iso: string) {
  const d = parseISO(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()} – ${MONTHS[parseISO(addDaysISO(iso, 6)).getMonth()]} ${parseISO(addDaysISO(iso, 6)).getDate()}`;
}

export function monthLabel(iso: string) {
  const d = parseISO(iso);
  return `${["January","February","March","April","May","June","July","August","September","October","November","December"][d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtTime(hm: string) {
  const [h, m] = hm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function fmtDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function fmtHoursMin(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function fmtMoney(n: number) {
  return `KSh ${Math.round(n).toLocaleString("en-KE")}`;
}

export function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

export function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Coding: "#22c55e",
  Work: "#3b82f6",
  Exercise: "#10b981",
  Reading: "#8b5cf6",
  Meditation: "#f97316",
  Food: "#eab308",
  Meeting: "#ef4444",
  Personal: "#14b8a6",
  Sleep: "#6366f1",
  General: "#64748b",
};

export function catColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "#64748b";
}
