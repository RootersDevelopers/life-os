"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CloudRain, ChevronRight, CheckCircle2, Circle, Timer, Dumbbell, Flame,
  ListTodo, Play, ClipboardList, UtensilsCrossed, ReceiptText, LayoutGrid, Sun, Sunset, Moon,
} from "lucide-react";
import { Badge, Card, Ring, Skeleton, cn } from "@/components/ui";
import { useStats } from "@/hooks/useCrud";
import { useCrud } from "@/hooks/useCrud";
import { api } from "@/lib/api";
import { fmtTime, prettyDate, todayISO } from "@/lib/format";
import { CreateHub, CreateModal, type CreateKind } from "@/components/forms";

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = now.getHours() % 12 || 12;
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  return (
    <div className="text-right">
      <p className="font-display font-bold text-3xl text-white tabular-nums tracking-tight">
        {String(hh).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
        <span className="text-base text-white/60 ml-1.5">{ampm}</span>
      </p>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good Morning", icon: <Sun className="h-4 w-4 text-amber-300" /> };
  if (h < 17) return { text: "Good Afternoon", icon: <Sunset className="h-4 w-4 text-orange-300" /> };
  return { text: "Good Evening", icon: <Moon className="h-4 w-4 text-indigo-300" /> };
}

export default function DashboardPage() {
  const stats = useStats();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api("/api/auth/me") });
  const events = useCrud("events");
  const [hub, setHub] = useState(false);
  const [kind, setKind] = useState<CreateKind | null>(null);
  const s = stats.data;
  const g = greeting();
  const firstName = (me?.user?.name ?? "there").split(" ")[0];

  if (stats.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 anim-rise">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-night border border-night-line p-6">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="flex items-center gap-2 font-display font-bold text-2xl text-white">
              {g.text}, {firstName} <span className="text-xl">{g.icon}</span>
            </p>
            <p className="text-sm text-white/50 mt-1">{prettyDate(todayISO())}</p>
            <div className="mt-4 inline-flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2">
              <CloudRain className="h-5 w-5 text-sky-300" />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">{s?.weather.temp}°C · {s?.weather.condition}</p>
                <p className="text-[11px] text-white/45">{s?.weather.location}</p>
              </div>
            </div>
          </div>
          <Clock />
        </div>
      </div>

      {/* Weather alert */}
      <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
        <span className="h-9 w-9 rounded-xl bg-sky-100 text-sky-600 grid place-items-center shrink-0"><CloudRain className="h-4.5 w-4.5" /></span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sky-900">Weather Alert</p>
          <p className="text-xs text-sky-700">It's rainy today. Don't forget your umbrella and stay hydrated.</p>
        </div>
        <Badge tone="info">{s?.weather.humidity}% humidity</Badge>
      </div>

      {/* Overview */}
      <div>
        <h2 className="font-display font-semibold text-ink mb-3">Today's Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 col-span-2 lg:col-span-1 flex items-center gap-4">
            <Ring value={s?.lifeScore ?? 0} max={100} size={72} stroke={7}>
              <span className="font-display font-bold text-xl text-ink tabular-nums">{s?.lifeScore}</span>
            </Ring>
            <div>
              <p className="text-xs font-semibold text-mute uppercase tracking-wide">Life Score</p>
              <p className="text-xs text-mute mt-0.5">/ 100</p>
              <p className="text-sm font-bold text-brand-700 mt-1">{(s?.lifeScore ?? 0) >= 70 ? "Great Day!" : (s?.lifeScore ?? 0) >= 40 ? "Keep going" : "Let's begin"}</p>
            </div>
          </Card>
          <StatCard icon={<ListTodo className="h-4 w-4" />} tone="brand" label="Tasks" value={`${s?.tasks.done ?? 0}/${s?.tasks.total ?? 0}`} sub="completed today" />
          <StatCard icon={<Timer className="h-4 w-4" />} tone="info" label="Focus Time" value={`${Math.floor((s?.focusMin ?? 0) / 60)}h ${(s?.focusMin ?? 0) % 60}m`} sub="deep work" />
          <StatCard icon={<Dumbbell className="h-4 w-4" />} tone="warn" label="Workout" value={`${s?.workoutMin ?? 0}m`} sub={`${s?.calories ?? 0} kcal eaten`} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Upcoming */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="font-display font-semibold text-ink">Upcoming Events</h3>
            <Link href="/planner" className="text-xs font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-0.5">
              Open planner <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="px-2 pb-3">
            {(s?.upcoming ?? []).length === 0 ? (
              <p className="text-sm text-mute px-3 py-6 text-center">No more events today — enjoy your free time ✨</p>
            ) : (
              (s?.upcoming ?? []).map((e: any) => (
                <button
                  key={e.id}
                  onClick={() => events.update.mutate({ id: e.id, patch: { completed: !e.completed } })}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-ink/4 transition-colors group"
                >
                  <span className={cn("shrink-0", e.completed ? "text-brand-500" : "text-mute group-hover:text-brand-500")}>
                    {e.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </span>
                  <span className="w-16 text-xs font-semibold text-mute tabular-nums shrink-0">{fmtTime(e.start)}</span>
                  <span className={cn("flex-1 text-left text-sm font-semibold truncate", e.completed ? "text-mute line-through" : "text-ink")}>{e.title}</span>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: e.color }} />
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickBtn icon={<Play className="h-4 w-4" />} label="Start Focus" color="#22c55e" onClick={() => (location.href = "/focus")} />
            <QuickBtn icon={<ClipboardList className="h-4 w-4" />} label="Add Task" color="#8b5cf6" onClick={() => setKind("task")} />
            <QuickBtn icon={<UtensilsCrossed className="h-4 w-4" />} label="Add Meal" color="#eab308" onClick={() => setKind("meal")} />
            <QuickBtn icon={<ReceiptText className="h-4 w-4" />} label="Add Expense" color="#ef4444" onClick={() => setKind("expense")} />
            <button onClick={() => setHub(true)} className="col-span-2 h-11 rounded-xl border border-dashed border-line text-mute hover:text-ink hover:border-brand-300 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors">
              <LayoutGrid className="h-4 w-4" /> More options
            </button>
          </div>
        </Card>
      </div>

      <CreateHub open={hub} onClose={() => setHub(false)} onPick={(k) => { setHub(false); setKind(k); }} />
      <CreateModal kind={kind} onClose={() => setKind(null)} />
    </div>
  );
}

function StatCard({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: "brand" | "info" | "warn" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    info: "bg-blue-50 text-blue-600",
    warn: "bg-orange-50 text-orange-600",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className={cn("h-8 w-8 rounded-lg grid place-items-center", tones[tone])}>{icon}</span>
        <p className="text-xs font-semibold text-mute uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-display font-bold text-2xl text-ink mt-3 tabular-nums">{value}</p>
      <p className="text-xs text-mute mt-0.5">{sub}</p>
    </Card>
  );
}

function QuickBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-xl border border-line bg-paper/60 p-3.5 hover:border-brand-300 hover:shadow-card transition-all">
      <span className="h-9 w-9 rounded-xl grid place-items-center" style={{ background: color + "1a", color }}>
        {icon}
      </span>
      <span className="text-xs font-semibold text-ink-soft">{label}</span>
    </button>
  );
}
