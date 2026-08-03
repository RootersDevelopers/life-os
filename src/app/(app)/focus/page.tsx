"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Square, Timer as TimerIcon, Flame, Code2 } from "lucide-react";
import { Button, Card, Field, Ring, Select, cn } from "@/components/ui";
import { useCrud, useList } from "@/hooks/useCrud";
import { startOfWeekISO, todayISO } from "@/lib/format";

const SESSIONS = ["Coding Session", "Deep Work", "Study", "Writing", "Reading"];

export default function FocusPage() {
  const events = useCrud("events");
  const all = useList("events");
  const [label, setLabel] = useState(SESSIONS[0]);
  const [target, setTarget] = useState(25 * 60);
  const [left, setLeft] = useState(25 * 60);
  const [state, setState] = useState<"idle" | "running" | "paused">("idle");
  const endRef = useRef(0);

  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => {
      const remain = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setLeft(remain);
      if (remain <= 0) { setState("idle"); finish(target); }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const elapsed = target - left;

  function start() {
    endRef.current = Date.now() + left * 1000;
    setState("running");
  }
  function pause() { setState("paused"); }
  function stop() {
    if (elapsed >= 30) finish(elapsed);
    setState("idle");
    setLeft(target);
  }
  function finish(seconds: number) {
    const mins = Math.max(1, Math.round(seconds / 60));
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const startHm = `${String(Math.max(0, now.getHours() - Math.floor(mins / 60))).padStart(2, "0")}:${mm}`;
    events.create.mutate({
      type: "focus", title: label, category: "Coding", date: todayISO(),
      start: startHm, end: `${hh}:${mm}`, durationMin: mins, color: "#22c55e", completed: true,
    });
    setLeft(target);
  }

  const stats = useMemo(() => {
    const rows = (all.data ?? []).filter((e) => e.type === "focus" || e.category === "Coding");
    const t = todayISO();
    const ws = startOfWeekISO(t);
    const today = rows.filter((e) => e.date === t).reduce((a, e) => a + e.durationMin, 0);
    const week = rows.filter((e) => e.date >= ws).reduce((a, e) => a + e.durationMin, 0);
    return { today, week };
  }, [all.data]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="grid lg:grid-cols-3 gap-5 anim-rise">
      <Card className="lg:col-span-2 p-8 bg-night border-night-line relative overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="relative flex flex-col items-center">
          <p className="text-sm font-semibold text-white/50">Focus Mode</p>
          <p className="text-brand-300 font-display font-semibold mt-1">{label}</p>

          <div className="my-8">
            <Ring value={elapsed} max={target} size={240} stroke={10} color="#1db463">
              <div className="text-center">
                <p className="font-display font-bold text-5xl text-white tabular-nums tracking-tight">{mm}:{ss}</p>
                <p className="text-xs text-white/40 mt-1">
                  {state === "running" ? "Keep going! You're doing great." : state === "paused" ? "Paused" : "Ready when you are"}
                </p>
              </div>
            </Ring>
          </div>

          <div className="flex items-center gap-3">
            {state !== "running" ? (
              <Button size="lg" onClick={start} className="w-36">
                <Play className="h-4 w-4" fill="currentColor" /> {state === "paused" ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button size="lg" variant="outline" onClick={pause} className="w-36 border-night-line bg-white/5 text-white hover:text-white hover:border-white/30">
                <Pause className="h-4 w-4" /> Pause
              </Button>
            )}
            <Button size="lg" variant="danger" onClick={stop} disabled={state === "idle" || elapsed < 5}>
              <Square className="h-4 w-4" fill="currentColor" /> Stop
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm">
            <Field label="Session">
              <Select value={label} onChange={(e) => setLabel(e.target.value)} disabled={state !== "idle"} className="bg-night-2 border-night-line text-white">
                {SESSIONS.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Length">
              <Select value={String(target)} onChange={(e) => { const v = Number(e.target.value); setTarget(v); setLeft(v); }} disabled={state !== "idle"} className="bg-night-2 border-night-line text-white">
                <option value={15 * 60}>15 min</option>
                <option value={25 * 60}>25 min</option>
                <option value={45 * 60}>45 min</option>
                <option value={60 * 60}>60 min</option>
              </Select>
            </Field>
          </div>
        </div>
      </Card>

      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-mute mb-4"><TimerIcon className="h-4 w-4 text-brand-600" /><p className="text-xs font-semibold uppercase tracking-wide">Focus Statistics</p></div>
          <div className="space-y-3">
            <StatRow label="Today" value={`${Math.floor(stats.today / 60)}h ${stats.today % 60}m`} />
            <StatRow label="This Week" value={`${Math.floor(stats.week / 60)}h ${stats.week % 60}m`} />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-mute mb-2"><Code2 className="h-4 w-4 text-brand-600" /><p className="text-xs font-semibold uppercase tracking-wide">How it works</p></div>
          <ul className="text-sm text-ink-soft space-y-2 leading-relaxed">
            <li className="flex gap-2"><Flame className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" /> Pick a session and start the timer.</li>
            <li className="flex gap-2"><Flame className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" /> Stopping logs the session to your planner automatically.</li>
            <li className="flex gap-2"><Flame className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" /> Focus time feeds your Life Score and Insights.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-paper/70 border border-line px-4 py-3">
      <span className="text-sm text-mute">{label}</span>
      <span className="font-display font-bold text-ink tabular-nums">{value}</span>
    </div>
  );
}
