"use client";
import { useMemo, useState } from "react";
import {
  Sunrise, Dumbbell, BookOpen, Brain, Droplets, CupSoda, Moon, Sparkles,
  Plus, Trash2, Check, Flame,
} from "lucide-react";
import { Button, Card, EmptyState, Field, Input, Modal, Skeleton, cn } from "@/components/ui";
import { useCrud, useToggleHabit } from "@/hooks/useCrud";
import { addDaysISO, todayISO, weekdayShort } from "@/lib/format";

const ICONS: Record<string, any> = {
  sunrise: Sunrise, dumbbell: Dumbbell, book: BookOpen, brain: Brain,
  droplet: Droplets, "cup-soda": CupSoda, moon: Moon, sparkles: Sparkles,
};
const COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#f97316", "#ef4444", "#14b8a6", "#f59e0b", "#6366f1"];

export default function HabitsPage() {
  const habits = useCrud("habits");
  const toggle = useToggleHabit();
  const [add, setAdd] = useState(false);
  const [f, setF] = useState({ name: "", icon: "sparkles", color: COLORS[0] });
  const t = todayISO();
  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysISO(t, i - 6)), [t]);

  const streak = (logDates: string[]) => {
    let s = 0;
    let cursor = logDates.includes(t) ? t : addDaysISO(t, -1);
    while (logDates.includes(cursor)) { s++; cursor = addDaysISO(cursor, -1); }
    return s;
  };

  if (habits.isLoading) return <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-5 anim-rise">
      <div className="flex items-center justify-between">
        <p className="text-sm text-mute">Tap the check to log today. Consistency builds streaks.</p>
        <Button onClick={() => setAdd(true)}><Plus className="h-4 w-4" /> New Habit</Button>
      </div>

      {(habits.data ?? []).length === 0 ? (
        <Card>
          <EmptyState icon={<Sparkles className="h-6 w-6" />} title="No habits yet" sub="Build small daily rituals — drink water, read, meditate — and track your streaks." action={<Button onClick={() => setAdd(true)}>Create a habit</Button>} />
        </Card>
      ) : (
        <div className="space-y-3">
          {(habits.data ?? []).map((h) => {
            const logs: string[] = h.logDates ?? [];
            const doneToday = logs.includes(t);
            const Icon = ICONS[h.icon] ?? Sparkles;
            const sk = streak(logs);
            return (
              <Card key={h.id} className="group flex items-center gap-4 px-4 sm:px-5 py-4">
                <span className="h-11 w-11 rounded-xl grid place-items-center shrink-0" style={{ background: h.color + "1a", color: h.color }}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{h.name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      {last7.map((d) => (
                        <span
                          key={d}
                          title={`${d} · ${weekdayShort(d)}`}
                          className={cn("h-2.5 w-2.5 rounded-full transition-colors", logs.includes(d) ? "" : "bg-ink/10")}
                          style={logs.includes(d) ? { background: h.color } : undefined}
                        />
                      ))}
                    </div>
                    {sk > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600">
                        <Flame className="h-3 w-3" /> {sk} day{sk > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => habits.remove.mutate(h.id)} className="text-mute/0 group-hover:text-mute hover:!text-danger transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggle.mutate({ id: h.id, date: t })}
                  className={cn(
                    "h-9 w-9 rounded-xl grid place-items-center border-2 transition-all shrink-0",
                    doneToday ? "border-transparent text-white scale-100" : "border-line text-transparent hover:border-brand-400"
                  )}
                  style={doneToday ? { background: h.color } : undefined}
                  title={doneToday ? "Logged today" : "Mark done today"}
                >
                  <Check className="h-5 w-5" strokeWidth={3} />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={add} onClose={() => setAdd(false)} title="New Habit">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          habits.create.mutate({ ...f, target: 1 }, {
            onSuccess: () => { setAdd(false); setF({ name: "", icon: "sparkles", color: COLORS[0] }); },
          });
        }}>
          <Field label="Habit Name"><Input required autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Drink Water" /></Field>
          <Field label="Icon">
            <div className="flex flex-wrap gap-2">
              {Object.entries(ICONS).map(([key, Ic]) => (
                <button key={key} type="button" onClick={() => setF({ ...f, icon: key })}
                  className={cn("h-10 w-10 rounded-xl grid place-items-center border transition-all", f.icon === key ? "border-brand-500 text-brand-700 bg-brand-50" : "border-line text-mute hover:text-ink")}>
                  <Ic className="h-4.5 w-4.5" />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Color">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setF({ ...f, color: c })}
                  className={cn("h-8 w-8 rounded-full transition-transform", f.color === c ? "scale-110 ring-2 ring-offset-2 ring-ink/30" : "")}
                  style={{ background: c }} />
              ))}
            </div>
          </Field>
          <Button type="submit" className="w-full" size="lg" disabled={habits.create.isPending}>Save Habit</Button>
        </form>
      </Modal>
    </div>
  );
}
