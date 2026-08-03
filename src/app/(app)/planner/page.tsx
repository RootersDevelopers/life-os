"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, CheckCircle2, Circle, Trash2, CalendarDays } from "lucide-react";
import { Button, Card, EmptyState, IconBtn, Input, Segmented, Skeleton, cn } from "@/components/ui";
import { useCrud } from "@/hooks/useCrud";
import { addDaysISO, dayNum, fmtDuration, fmtTime, longDate, prettyDate, todayISO, weekDaysISO, weekdayShort } from "@/lib/format";
import { CreateHub, CreateModal, FAB, type CreateKind } from "@/components/forms";

type View = "day" | "week" | "timeline";

export default function PlannerPage() {
  const { data, isLoading, update, remove } = useCrud("events");
  const [view, setView] = useState<View>("day");
  const [anchor, setAnchor] = useState(todayISO());
  const [q, setQ] = useState("");
  const [hub, setHub] = useState(false);
  const [kind, setKind] = useState<CreateKind | null>(null);

  const all = useMemo(() => (data ?? []).filter((e) => e.title.toLowerCase().includes(q.toLowerCase())), [data, q]);
  const dayEvents = all.filter((e) => e.date === anchor).sort((a, b) => a.start.localeCompare(b.start));
  const week = weekDaysISO(anchor);

  const shift = (dir: number) => setAnchor((a) => addDaysISO(a, view === "week" ? dir * 7 : dir));

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-96 rounded-2xl" /></div>;
  }

  return (
    <div className="space-y-4 anim-rise">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented<View>
          value={view}
          onChange={setView}
          options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "timeline", label: "Timeline" }]}
        />
        <div className="flex items-center gap-1 rounded-xl border border-line bg-card px-1 py-1">
          <IconBtn onClick={() => shift(-1)} className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></IconBtn>
          <button onClick={() => setAnchor(todayISO())} className="px-2 text-xs font-semibold text-brand-700 hover:text-brand-800">Today</button>
          <IconBtn onClick={() => shift(1)} className="h-7 w-7"><ChevronRight className="h-4 w-4" /></IconBtn>
        </div>
        <p className="text-sm font-semibold text-ink-soft min-w-36">
          {view === "week" ? longDate(anchor) : prettyDate(anchor)}
        </p>
        <div className="relative ml-auto w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…" className="pl-9 h-9" />
        </div>
      </div>

      {view === "day" && (
        <Card>
          {dayEvents.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title="Nothing scheduled"
              sub={q ? "No events match your search." : "Your day is wide open. Add an activity, task or appointment."}
              action={<Button onClick={() => setHub(true)}>Add to this day</Button>}
            />
          ) : (
            <div className="divide-y divide-line">
              {dayEvents.map((e) => (
                <div key={e.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-ink/3 transition-colors">
                  <div className="w-20 shrink-0">
                    <p className="text-xs font-bold text-ink tabular-nums">{fmtTime(e.start)}</p>
                    <p className="text-[11px] text-mute">{fmtDuration(e.durationMin)}</p>
                  </div>
                  <span className="h-10 w-1 rounded-full shrink-0" style={{ background: e.color }} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold truncate", e.completed ? "text-mute line-through" : "text-ink")}>{e.title}</p>
                    <p className="text-[11px] text-mute">{e.category} · {fmtTime(e.start)} – {fmtTime(e.end)}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-mute hidden sm:block">{e.mood || e.energy || ""}</span>
                  <button
                    onClick={() => update.mutate({ id: e.id, patch: { completed: !e.completed } })}
                    className={cn("shrink-0 transition-colors", e.completed ? "text-brand-500" : "text-mute hover:text-brand-500")}
                    title="Toggle complete"
                  >
                    {e.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </button>
                  <button onClick={() => remove.mutate(e.id)} className="shrink-0 text-mute/0 group-hover:text-mute hover:!text-danger transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {view === "week" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {week.map((d) => {
            const evs = all.filter((e) => e.date === d).sort((a, b) => a.start.localeCompare(b.start));
            const isToday = d === todayISO();
            return (
              <div key={d} className={cn("rounded-2xl border bg-card p-2.5 min-h-56 flex flex-col", isToday ? "border-brand-400 ring-2 ring-brand-500/15" : "border-line")}>
                <button onClick={() => { setAnchor(d); setView("day"); }} className="text-center pb-2 border-b border-line mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-mute">{weekdayShort(d)}</p>
                  <p className={cn("font-display font-bold text-lg leading-tight", isToday ? "text-brand-700" : "text-ink")}>{dayNum(d)}</p>
                </button>
                <div className="space-y-1.5 flex-1">
                  {evs.length === 0 && <p className="text-[10px] text-mute/60 text-center pt-4">—</p>}
                  {evs.map((e) => (
                    <div key={e.id} className="rounded-lg px-2 py-1.5 text-white" style={{ background: e.color, opacity: e.completed ? 0.45 : 1 }}>
                      <p className="text-[11px] font-bold leading-tight truncate">{e.title}</p>
                      <p className="text-[9.5px] opacity-80">{fmtTime(e.start)} – {fmtTime(e.end)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "timeline" && (
        <Card className="p-6">
          {dayEvents.length === 0 ? (
            <EmptyState title="No timeline entries" sub="Events for this day will appear here as a timeline." action={<Button onClick={() => setHub(true)}>Add event</Button>} />
          ) : (
            <ol className="relative ml-3 space-y-6 border-l-2 border-line pl-6">
              {dayEvents.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-card" style={{ background: e.completed ? "#1db463" : e.color }} />
                  <div className="flex items-baseline gap-3">
                    <p className="text-xs font-bold text-ink tabular-nums w-16 shrink-0">{fmtTime(e.start)}</p>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-semibold", e.completed ? "text-mute line-through" : "text-ink")}>{e.title}</p>
                      <p className="text-[11px] text-mute">{e.category} · {fmtDuration(e.durationMin)}{e.notes ? ` · ${e.notes}` : ""}</p>
                    </div>
                    <button onClick={() => update.mutate({ id: e.id, patch: { completed: !e.completed } })} className={cn(e.completed ? "text-brand-500" : "text-mute hover:text-brand-500")}>
                      {e.completed ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Circle className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}

      <FAB onClick={() => setHub(true)} />
      <CreateHub open={hub} onClose={() => setHub(false)} onPick={(k) => { setHub(false); setKind(k); }} />
      <CreateModal kind={kind} onClose={() => setKind(null)} />
    </div>
  );
}
