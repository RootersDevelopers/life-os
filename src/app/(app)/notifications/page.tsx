"use client";
import { useState } from "react";
import { Droplets, CloudRain, Dumbbell, CalendarClock, Wallet, Target, Bell, CheckCheck } from "lucide-react";
import { Button, Card, EmptyState, Segmented, Skeleton, cn } from "@/components/ui";
import { useCrud } from "@/hooks/useCrud";
import { relTime } from "@/lib/format";

const ICONS: Record<string, any> = {
  water: Droplets, weather: CloudRain, workout: Dumbbell, meeting: CalendarClock,
  budget: Wallet, goal: Target, info: Bell,
};
const TONES: Record<string, string> = {
  water: "#3b82f6", weather: "#0ea5e9", workout: "#10b981", meeting: "#8b5cf6",
  budget: "#f59e0b", goal: "#22c55e", info: "#64748b",
};

export default function NotificationsPage() {
  const notes = useCrud("notifications");
  const [tab, setTab] = useState<"all" | "unread">("all");

  const list = (notes.data ?? []).filter((n) => (tab === "all" ? true : !n.read));
  const unread = (notes.data ?? []).filter((n) => !n.read);

  function markAll() {
    for (const n of unread) notes.update.mutate({ id: n.id, patch: { read: true } });
  }

  if (notes.isLoading) return <div className="space-y-3">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-5 anim-rise max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Segmented value={tab} onChange={setTab} options={[
          { value: "all", label: `All (${notes.data?.length ?? 0})` },
          { value: "unread", label: `Unread (${unread.length})` },
        ]} />
        <Button variant="outline" size="sm" onClick={markAll} disabled={unread.length === 0}>
          <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
        </Button>
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState icon={<Bell className="h-6 w-6" />} title={tab === "unread" ? "You're all caught up" : "No notifications"} sub={tab === "unread" ? "New reminders and alerts will appear here." : "When LifeOS has something to tell you, it shows up here."} />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {list.map((n) => {
            const Icon = ICONS[n.kind] ?? Bell;
            const color = TONES[n.kind] ?? "#64748b";
            return (
              <button
                key={n.id}
                onClick={() => !n.read && notes.update.mutate({ id: n.id, patch: { read: true } })}
                className={cn(
                  "w-full text-left flex items-start gap-3.5 rounded-2xl border px-4 py-3.5 transition-all",
                  n.read ? "bg-card border-line" : "bg-brand-50/50 border-brand-200 hover:border-brand-300"
                )}
              >
                <span className="h-10 w-10 rounded-xl grid place-items-center shrink-0" style={{ background: color + "1a", color }}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm truncate", n.read ? "font-semibold text-ink-soft" : "font-bold text-ink")}>{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />}
                  </div>
                  <p className="text-[13px] text-mute mt-0.5 leading-snug">{n.message}</p>
                </div>
                <span className="text-[11px] text-mute shrink-0 tabular-nums">{relTime(n.createdAt)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
