"use client";
import { useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import { TrendingUp, Award, CalendarCheck2 } from "lucide-react";
import { Card, CardHead, Progress, Segmented, Skeleton, Badge } from "@/components/ui";
import { useList, useStats } from "@/hooks/useCrud";
import { fmtDuration, fmtMoney, startOfWeekISO, todayISO, weekDaysISO, weekdayShort } from "@/lib/format";

type Tab = "time" | "health" | "finance" | "goals";

const EXPENSE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#64748b"];

export default function InsightsPage() {
  const [tab, setTab] = useState<Tab>("time");
  const stats = useStats();
  const meals = useList("meals");
  const txs = useList("transactions");
  const goals = useList("goals");
  const workouts = useList("workouts");

  const s = stats.data;
  const week = weekDaysISO(todayISO());

  const prodScore = useMemo(() => {
    const days = (s?.productivityByDay ?? []).filter((d: any) => d.minutes > 0);
    if (!days.length) return 0;
    return Math.round(days.reduce((a: number, d: any) => a + d.score, 0) / days.length);
  }, [s]);

  const mealByDay = useMemo(() => week.map((d) => ({
    day: weekdayShort(d),
    kcal: (meals.data ?? []).filter((m) => m.date === d).reduce((a, m) => a + m.calories, 0),
  })), [meals.data, week.join()]);

  const workoutByDay = useMemo(() => week.map((d) => ({
    day: weekdayShort(d),
    min: (workouts.data ?? []).filter((w) => w.date === d).reduce((a, w) => a + w.durationMin, 0),
  })), [workouts.data, week.join()]);

  const expenseDist = useMemo(() => {
    const monthStart = todayISO().slice(0, 8) + "01";
    const map = new Map<string, number>();
    for (const t of (txs.data ?? []).filter((t) => t.kind === "expense" && t.date >= monthStart)) {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return [...map.entries()].map(([name, value], i) => ({ name, value, color: EXPENSE_COLORS[i % EXPENSE_COLORS.length] })).sort((a, b) => b.value - a.value);
  }, [txs.data]);

  const loading = stats.isLoading || meals.isLoading || txs.isLoading;
  if (loading) return <div className="grid lg:grid-cols-2 gap-4"><Skeleton className="h-80 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div>;

  return (
    <div className="space-y-5 anim-rise">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Segmented<Tab> value={tab} onChange={setTab} options={[
          { value: "time", label: "Time" }, { value: "health", label: "Health" },
          { value: "finance", label: "Finance" }, { value: "goals", label: "Goals" },
        ]} />
        <Badge tone="mute">This Week · {weekDaysISO(todayISO())[0].slice(5)} → {todayISO().slice(5)}</Badge>
      </div>

      {tab === "time" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHead title="Time Distribution" sub={fmtDuration(s?.weekTotalMin ?? 0) + " tracked this week"} />
            {(s?.timeDist ?? []).length === 0 ? (
              <p className="text-sm text-mute text-center py-10">No tracked time yet this week.</p>
            ) : (
              <div className="flex items-center gap-4 px-5 pb-5 flex-wrap">
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={s?.timeDist} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                        {(s?.timeDist ?? []).map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => fmtDuration(Number(v))} contentStyle={tipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex-1 min-w-40 space-y-2">
                  {(s?.timeDist ?? []).slice(0, 6).map((d: any) => (
                    <li key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="font-semibold text-ink-soft flex-1">{d.name}</span>
                      <span className="text-mute tabular-nums">{fmtDuration(d.value)}</span>
                      <span className="text-mute tabular-nums w-9 text-right">{Math.round((d.value / (s?.weekTotalMin || 1)) * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <Card className="p-5">
                <div className="flex items-center gap-2 text-mute"><TrendingUp className="h-4 w-4 text-brand-600" /><p className="text-xs font-semibold uppercase tracking-wide">Productivity Score</p></div>
                <p className="font-display font-bold text-4xl text-ink mt-2 tabular-nums">{prodScore}</p>
                <p className="text-xs text-brand-700 font-semibold mt-1">{prodScore >= 70 ? "Great progress!" : prodScore >= 40 ? "Building momentum" : "Room to grow"}</p>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-2 text-mute"><Award className="h-4 w-4 text-amber-500" /><p className="text-xs font-semibold uppercase tracking-wide">Best Day</p></div>
                <p className="font-display font-bold text-xl text-ink mt-2">{s?.mostProductiveDay}</p>
                <p className="text-xs text-mute mt-1">most scheduled time</p>
              </Card>
            </div>
            <Card>
              <CardHead title="Weekly Productivity" sub="Completion rate per day" />
              <div className="h-44 px-2 pb-3">
                <ResponsiveContainer>
                  <AreaChart data={s?.productivityByDay ?? []}>
                    <defs>
                      <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1db463" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#1db463" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e8e1" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6d766f" }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={tipStyle} formatter={(v: any) => [`${v}%`, "score"]} />
                    <Area type="monotone" dataKey="score" stroke="#12924f" strokeWidth={2.5} fill="url(#pg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "health" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHead title="Calorie Intake" sub="kcal per day this week" />
            <div className="h-56 px-2 pb-3">
              <ResponsiveContainer>
                <BarChart data={mealByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e8e1" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6d766f" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6d766f" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={tipStyle} formatter={(v: any) => [`${v} kcal`, "intake"]} />
                  <Bar dataKey="kcal" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardHead title="Workout Minutes" sub="movement per day" />
            <div className="h-56 px-2 pb-3">
              <ResponsiveContainer>
                <BarChart data={workoutByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e8e1" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6d766f" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6d766f" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={tipStyle} formatter={(v: any) => [`${v} min`, "workout"]} />
                  <Bar dataKey="min" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {tab === "finance" && (
        <Card>
          <CardHead title="Expense Breakdown" sub="This month by category" />
          {expenseDist.length === 0 ? (
            <p className="text-sm text-mute text-center py-10">No expenses logged this month.</p>
          ) : (
            <div className="flex items-center gap-6 px-5 pb-6 flex-wrap">
              <div className="h-52 w-52 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={expenseDist} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={2} strokeWidth={0}>
                      {expenseDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmtMoney(Number(v))} contentStyle={tipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 min-w-48 space-y-2.5">
                {expenseDist.map((d) => (
                  <li key={d.name} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="font-semibold text-ink-soft flex-1">{d.name}</span>
                    <span className="text-mute tabular-nums">{fmtMoney(d.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {tab === "goals" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {(goals.data ?? []).filter((g) => g.status === "active").map((g) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <Card key={g.id} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-ink">{g.name}</p>
                  <span className="text-xs font-bold text-brand-700 tabular-nums">{pct}%</span>
                </div>
                <Progress value={g.current} max={g.target} className="mt-3" />
                <p className="text-xs text-mute mt-2 tabular-nums">{g.current} / {g.target} {g.unit} · {g.repeat}</p>
              </Card>
            );
          })}
          {(goals.data ?? []).length === 0 && (
            <Card className="p-8 text-center text-sm text-mute sm:col-span-2">No goals yet — create one from the Goals page.</Card>
          )}
        </div>
      )}
    </div>
  );
}

const tipStyle: React.CSSProperties = {
  borderRadius: 12, border: "1px solid #e4e8e1", background: "#fdfdfc",
  fontSize: 12, fontFamily: "Manrope", boxShadow: "0 4px 16px -8px rgb(19 24 21 / 0.2)",
};
