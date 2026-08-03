"use client";
import { useState } from "react";
import { Target, Plus, Minus, Trash2, CheckCircle2, Trophy } from "lucide-react";
import { Badge, Button, Card, EmptyState, Progress, Segmented, Skeleton } from "@/components/ui";
import { useCrud } from "@/hooks/useCrud";
import { CreateModal, FAB, type CreateKind } from "@/components/forms";

export default function GoalsPage() {
  const goals = useCrud("goals");
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [kind, setKind] = useState<CreateKind | null>(null);

  const list = (goals.data ?? []).filter((g) => g.status === tab);

  const step = (target: number) => (target >= 1000 ? 500 : target <= 10 ? 0.5 : 1);
  const bump = (id: string, current: number, target: number, dir: number) => {
    const next = Math.max(0, Math.min(target, +(current + dir * step(target)).toFixed(2)));
    goals.update.mutate({ id, patch: { current: next } });
  };

  if (goals.isLoading) return <div className="grid sm:grid-cols-2 gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-5 anim-rise">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Segmented value={tab} onChange={setTab} options={[{ value: "active", label: "Active" }, { value: "completed", label: "Completed" }]} />
        <Button onClick={() => setKind("goal")}><Plus className="h-4 w-4" /> New Goal</Button>
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Trophy className="h-6 w-6" />}
            title={tab === "active" ? "No active goals" : "No completed goals yet"}
            sub={tab === "active" ? "Set a goal — read more, save money, code daily — and watch your progress grow." : "Complete an active goal and it will show up here."}
            action={tab === "active" ? <Button onClick={() => setKind("goal")}>Create your first goal</Button> : undefined}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map((g) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            const done = g.current >= g.target;
            return (
              <Card key={g.id} className="p-5 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-ink truncate">{g.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone="mute">{g.category}</Badge>
                      <span className="text-[11px] text-mute">{g.repeat}</span>
                    </div>
                  </div>
                  <button onClick={() => goals.remove.mutate(g.id)} className="text-mute/0 group-hover:text-mute hover:!text-danger transition-colors shrink-0"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <p className="font-display font-bold text-2xl text-ink tabular-nums">{pct}%</p>
                  <p className="text-xs text-mute tabular-nums">{g.current} / {g.target} {g.unit}</p>
                </div>
                <Progress value={g.current} max={g.target} className="mt-2" color={done ? "#1db463" : "#12924f"} />
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => bump(g.id, g.current, g.target, -1)} disabled={g.current <= 0}>
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => bump(g.id, g.current, g.target, 1)} disabled={done}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  {done && g.status === "active" ? (
                    <Button size="sm" className="flex-1" onClick={() => goals.update.mutate({ id: g.id, patch: { status: "completed" } })}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                    </Button>
                  ) : g.status === "completed" ? (
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => goals.update.mutate({ id: g.id, patch: { status: "active" } })}>Reopen</Button>
                  ) : (
                    <span className="flex-1" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <FAB onClick={() => setKind("goal")} />
      <CreateModal kind={kind} onClose={() => setKind(null)} />
    </div>
  );
}
