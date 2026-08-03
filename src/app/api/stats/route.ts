import { NextResponse } from "next/server";
import { db } from "@/db";
import { dailyStats, events, habitLogs, habits, meals, workouts } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { catColor, startOfWeekISO, todayISO, weekDaysISO, weekdayShort } from "@/lib/format";

export async function GET() {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const t = todayISO();
  const week = weekDaysISO(t);
  const weekStart = startOfWeekISO(t);

  const [evAll, mealsToday, workoutsToday, habitsAll, logsToday, waterRow] = await Promise.all([
    db.select().from(events).where(and(eq(events.userId, user.id), gte(events.date, weekStart))),
    db.select().from(meals).where(and(eq(meals.userId, user.id), eq(meals.date, t))),
    db.select().from(workouts).where(and(eq(workouts.userId, user.id), eq(workouts.date, t))),
    db.select().from(habits).where(eq(habits.userId, user.id)),
    db.select().from(habitLogs).where(and(eq(habitLogs.userId, user.id), eq(habitLogs.date, t))),
    db.select().from(dailyStats).where(and(eq(dailyStats.userId, user.id), eq(dailyStats.date, t))).limit(1),
  ]);

  const evToday = evAll.filter((e) => e.date === t);
  const tasksToday = evToday.filter((e) => e.type === "task" || e.type === "activity");
  const tasksDone = tasksToday.filter((e) => e.completed).length;
  const focusMin = evToday.filter((e) => e.type === "focus" || e.category === "Coding").reduce((s, e) => s + e.durationMin, 0);
  const workoutMin = workoutsToday.reduce((s, w) => s + w.durationMin, 0);
  const calories = mealsToday.reduce((s, m) => s + m.calories, 0);
  const water = waterRow[0]?.water ?? 0;
  const habitsDone = logsToday.length;
  const habitsTotal = habitsAll.length;

  const taskRatio = tasksToday.length ? tasksDone / tasksToday.length : 0;
  const habitRatio = habitsTotal ? habitsDone / habitsTotal : 0;
  const lifeScore = Math.round(
    taskRatio * 35 + habitRatio * 25 + Math.min(1, water / 8) * 15 + Math.min(1, focusMin / 240) * 10 + (workoutMin > 0 ? 15 : 0)
  );

  // time distribution this week by category
  const distMap = new Map<string, number>();
  for (const e of evAll) distMap.set(e.category, (distMap.get(e.category) ?? 0) + e.durationMin);
  const timeDist = [...distMap.entries()]
    .map(([name, value]) => ({ name, value, color: catColor(name) }))
    .sort((a, b) => b.value - a.value);

  // productivity per day
  const productivityByDay = week.map((d) => {
    const dayEv = evAll.filter((e) => e.date === d);
    const total = dayEv.reduce((s, e) => s + e.durationMin, 0);
    const done = dayEv.filter((e) => e.completed).reduce((s, e) => s + e.durationMin, 0);
    return { day: weekdayShort(d), date: d, score: total ? Math.round((done / total) * 100) : 0, minutes: total };
  });
  const best = [...productivityByDay].sort((a, b) => b.minutes - a.minutes)[0];
  const mostProductiveDay = best && best.minutes > 0 ? fullWeekday(best.date) : "—";

  const upcoming = evToday
    .filter((e) => !e.completed)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 5);

  return NextResponse.json({
    date: t,
    weather: { temp: 24, condition: "Light Rain", humidity: 82, wind: 12, location: "Nairobi, Kenya" },
    lifeScore,
    tasks: { done: tasksDone, total: tasksToday.length },
    focusMin, workoutMin, calories, water,
    habits: { done: habitsDone, total: habitsTotal },
    upcoming,
    timeDist,
    productivityByDay,
    mostProductiveDay,
    weekTotalMin: evAll.reduce((s, e) => s + e.durationMin, 0),
  });
}

function fullWeekday(iso: string) {
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return names[new Date(iso + "T00:00:00").getDay()];
}
