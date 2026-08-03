"use client";
import { useState } from "react";
import { Droplets, Flame, Plus, Minus, UtensilsCrossed, Trash2, Dumbbell, Beef, Wheat, Droplet } from "lucide-react";
import { Button, Card, CardHead, EmptyState, Ring, Skeleton, cn } from "@/components/ui";
import { useCrud, useDaily } from "@/hooks/useCrud";
import { fmtTime, todayISO } from "@/lib/format";
import { CreateModal, type CreateKind } from "@/components/forms";

const KCAL_TARGET = 2200;

export default function HealthPage() {
  const meals = useCrud("meals");
  const workouts = useCrud("workouts");
  const daily = useDaily(todayISO());
  const [kind, setKind] = useState<CreateKind | null>(null);

  const todayMeals = (meals.data ?? []).filter((m) => m.date === todayISO());
  const kcal = todayMeals.reduce((a, m) => a + m.calories, 0);
  const macros = {
    protein: todayMeals.reduce((a, m) => a + m.protein, 0),
    carbs: todayMeals.reduce((a, m) => a + m.carbs, 0),
    fat: todayMeals.reduce((a, m) => a + m.fat, 0),
  };
  const recentWorkouts = (workouts.data ?? []).slice(0, 4);
  const water = daily.data?.water ?? 0;

  if (meals.isLoading || daily.isLoading) {
    return <div className="grid lg:grid-cols-3 gap-4"><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-72 rounded-2xl lg:col-span-2" /></div>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-5 anim-rise">
      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-mute mb-3">
            <Flame className="h-4 w-4 text-orange-500" />
            <p className="text-xs font-semibold uppercase tracking-wide">Calories</p>
          </div>
          <p className="font-display font-bold text-4xl text-ink tabular-nums">{kcal.toLocaleString()}</p>
          <p className="text-xs text-mute">/ {KCAL_TARGET.toLocaleString()} kcal target</p>
          <div className="mt-3 h-2 rounded-full bg-ink/8 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500" style={{ width: `${Math.min(100, (kcal / KCAL_TARGET) * 100)}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <MacroRing label="Protein" value={macros.protein} target={120} color="#22c55e" icon={<Beef className="h-3 w-3" />} />
            <MacroRing label="Carbs" value={macros.carbs} target={250} color="#f59e0b" icon={<Wheat className="h-3 w-3" />} />
            <MacroRing label="Fat" value={macros.fat} target={70} color="#ef4444" icon={<Droplet className="h-3 w-3" />} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-mute">
              <Droplets className="h-4 w-4 text-sky-500" />
              <p className="text-xs font-semibold uppercase tracking-wide">Water Intake</p>
            </div>
            <p className="text-xs font-bold text-ink tabular-nums">{water} / 8 glasses</p>
          </div>
          <div className="flex items-center gap-1.5 justify-between">
            {Array.from({ length: 8 }).map((_, i) => (
              <button
                key={i}
                onClick={() => daily.setWater.mutate(i + 1 === water ? i : i + 1)}
                className="transition-transform hover:scale-110"
                title={`Set ${i + 1} glasses`}
              >
                <Droplets className={cn("h-6 w-6 transition-colors", i < water ? "text-sky-500" : "text-ink/12")} fill={i < water ? "currentColor" : "none"} fillOpacity={0.25} />
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => daily.setWater.mutate(Math.max(0, water - 1))} disabled={water === 0}>
              <Minus className="h-3.5 w-3.5" /> Remove
            </Button>
            <Button size="sm" className="flex-1" onClick={() => daily.setWater.mutate(Math.min(12, water + 1))}>
              <Plus className="h-3.5 w-3.5" /> Add glass
            </Button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-5">
        <Card>
          <CardHead
            title="Today's Meals"
            sub={`${todayMeals.length} logged`}
            right={<Button size="sm" onClick={() => setKind("meal")}><Plus className="h-3.5 w-3.5" /> Add Meal</Button>}
          />
          {todayMeals.length === 0 ? (
            <EmptyState icon={<UtensilsCrossed className="h-6 w-6" />} title="No meals logged today" sub="Track breakfast, lunch or dinner to see your nutrition breakdown." action={<Button onClick={() => setKind("meal")}>Log a meal</Button>} />
          ) : (
            <div className="divide-y divide-line">
              {todayMeals.map((m) => (
                <div key={m.id} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-ink/3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center shrink-0"><UtensilsCrossed className="h-4.5 w-4.5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{m.mealType} <span className="text-mute font-medium">· {m.foods}</span></p>
                    <p className="text-[11px] text-mute tabular-nums">P {m.protein}g · C {m.carbs}g · F {m.fat}g</p>
                  </div>
                  <p className="text-sm font-bold text-ink tabular-nums">{m.calories} kcal</p>
                  <button onClick={() => meals.remove.mutate(m.id)} className="text-mute/0 group-hover:text-mute hover:!text-danger transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHead
            title="Recent Workouts"
            sub="Your latest sessions"
            right={<Button size="sm" variant="outline" onClick={() => setKind("workout")}><Plus className="h-3.5 w-3.5" /> Add</Button>}
          />
          {recentWorkouts.length === 0 ? (
            <EmptyState icon={<Dumbbell className="h-6 w-6" />} title="No workouts yet" sub="Log a run, ride or gym session to track your fitness." action={<Button onClick={() => setKind("workout")}>Log workout</Button>} />
          ) : (
            <div className="divide-y divide-line">
              {recentWorkouts.map((w) => (
                <div key={w.id} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-ink/3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0"><Dumbbell className="h-4.5 w-4.5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{w.type}</p>
                    <p className="text-[11px] text-mute tabular-nums">{w.date} · {fmtTime(w.start)} · {w.durationMin} min{w.distance ? ` · ${w.distance} km` : ""}</p>
                  </div>
                  <p className="text-sm font-bold text-ink tabular-nums">{w.calories} kcal</p>
                  <button onClick={() => workouts.remove.mutate(w.id)} className="text-mute/0 group-hover:text-mute hover:!text-danger transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <CreateModal kind={kind} onClose={() => setKind(null)} />
    </div>
  );
}

function MacroRing({ label, value, target, color, icon }: { label: string; value: number; target: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Ring value={value} max={target} size={56} stroke={5} color={color}>
        <span className="text-[11px] font-bold text-ink tabular-nums">{value}g</span>
      </Ring>
      <p className="text-[11px] font-semibold text-mute inline-flex items-center gap-1">{icon}{label}</p>
      <p className="text-[10px] text-mute/70 tabular-nums">/ {target}g</p>
    </div>
  );
}
