import { db } from "@/db";
import {
  users, dailyStats, events, goals, habitLogs, habits, meals,
  notifications, reminders, transactions, workouts,
} from "@/db/schema";
import { count } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { addDaysISO, nowISO, todayISO } from "@/lib/format";

export async function seedIfNeeded() {
  const [{ value: n }] = await db.select({ value: count() }).from(users);
  if (n > 0) return;

  const now = nowISO();
  const t = todayISO();
  const [user] = await db
    .insert(users)
    .values({
      name: "Alex John",
      email: "alex@lifeos.app",
      passwordHash: hashPassword("demo1234"),
      plan: "Premium",
      createdAt: now,
    })
    .returning();
  const uid = user.id;

  // ---- Events across the week ----
  // [type,title,date,start,end,dur,category,color,completed,dayOffset]
  type Ev = [string, string, string, string, string, number, string, string, boolean, number];
  const weekTemplate: Record<number, Ev[]> = {
    0: [
      ["activity", "Wake Up", t, "06:30", "06:45", 15, "Personal", "#14b8a6", true, 0],
      ["activity", "Morning Routine", t, "07:00", "07:45", 45, "Personal", "#14b8a6", true, 0],
      ["activity", "Exercise", t, "08:00", "09:00", 60, "Exercise", "#10b981", true, 0],
      ["activity", "Coding Session", t, "09:30", "11:30", 120, "Coding", "#22c55e", true, 0],
      ["activity", "Lunch Break", t, "12:00", "13:00", 60, "Food", "#eab308", true, 0],
      ["task", "Team Meeting", t, "13:00", "14:00", 60, "Meeting", "#ef4444", false, 0],
      ["activity", "Project Work", t, "15:00", "17:00", 120, "Work", "#3b82f6", false, 0],
      ["activity", "Gym Workout", t, "18:00", "19:00", 60, "Exercise", "#10b981", false, 0],
      ["activity", "Dinner", t, "20:00", "20:45", 45, "Food", "#eab308", false, 0],
      ["activity", "Reading", t, "21:00", "21:45", 45, "Reading", "#8b5cf6", false, 0],
      ["activity", "Sleep", t, "22:30", "23:30", 60, "Sleep", "#6366f1", false, 0],
    ],
    [-1]: [
      ["activity", "Coding Session", addDaysISO(t, -1), "09:00", "12:00", 180, "Coding", "#22c55e", true, -1],
      ["activity", "Project Work", addDaysISO(t, -1), "13:00", "16:00", 180, "Work", "#3b82f6", true, -1],
      ["activity", "Gym", addDaysISO(t, -1), "18:00", "19:00", 60, "Exercise", "#10b981", true, -1],
      ["activity", "Reading", addDaysISO(t, -1), "20:00", "21:00", 60, "Reading", "#8b5cf6", true, -1],
      ["activity", "Meditation", addDaysISO(t, -1), "21:30", "22:00", 30, "Meditation", "#f97316", true, -1],
    ],
    [-2]: [
      ["activity", "Deep Work", addDaysISO(t, -2), "09:00", "12:30", 210, "Coding", "#22c55e", true, -2],
      ["task", "Sprint Planning", addDaysISO(t, -2), "14:00", "15:00", 60, "Meeting", "#ef4444", true, -2],
      ["activity", "Cycling", addDaysISO(t, -2), "17:30", "18:30", 60, "Exercise", "#10b981", true, -2],
      ["activity", "Reading", addDaysISO(t, -2), "21:00", "22:00", 60, "Reading", "#8b5cf6", true, -2],
    ],
    [-3]: [
      ["activity", "Coding Session", addDaysISO(t, -3), "09:30", "11:30", 120, "Coding", "#22c55e", true, -3],
      ["activity", "Client Call", addDaysISO(t, -3), "13:00", "14:00", 60, "Meeting", "#ef4444", true, -3],
      ["activity", "Project Work", addDaysISO(t, -3), "15:00", "18:00", 180, "Work", "#3b82f6", true, -3],
      ["activity", "Yoga", addDaysISO(t, -3), "19:00", "19:45", 45, "Exercise", "#10b981", true, -3],
    ],
    [1]: [
      ["task", "Team Meeting", addDaysISO(t, 1), "10:00", "11:00", 60, "Meeting", "#ef4444", false, 1],
      ["activity", "Lunch Break", addDaysISO(t, 1), "12:30", "13:30", 60, "Food", "#eab308", false, 1],
      ["activity", "Gym Workout", addDaysISO(t, 1), "18:00", "19:00", 60, "Exercise", "#10b981", false, 1],
    ],
    [2]: [
      ["activity", "Coding Session", addDaysISO(t, 2), "09:00", "12:00", 180, "Coding", "#22c55e", false, 2],
      ["task", "Design Review", addDaysISO(t, 2), "14:00", "15:00", 60, "Meeting", "#ef4444", false, 2],
    ],
  };

  await db.insert(events).values(
    Object.values(weekTemplate)
      .flat()
      .map(([type, title, date, start, end, durationMin, category, color, completed]) => ({
        userId: uid, type, title, date, start, end, durationMin, category, color,
        completed, notes: "", mood: "", energy: "", createdAt: now,
      }))
  );

  // ---- Goals ----
  await db.insert(goals).values([
    { userId: uid, name: "Code 8 Hours Daily", category: "Coding", target: 8, current: 7.2, unit: "hrs", startDate: t, endDate: addDaysISO(t, 30), repeat: "Daily", status: "active", createdAt: now },
    { userId: uid, name: "Exercise 5x Per Week", category: "Fitness", target: 5, current: 4, unit: "x", startDate: t, endDate: addDaysISO(t, 7), repeat: "Weekly", status: "active", createdAt: now },
    { userId: uid, name: "Save KSh 20,000", category: "Finance", target: 20000, current: 14250, unit: "KSh", startDate: t, endDate: addDaysISO(t, 60), repeat: "Monthly", status: "active", createdAt: now },
    { userId: uid, name: "Read 20 Books", category: "Reading", target: 20, current: 5, unit: "books", startDate: t, endDate: addDaysISO(t, 300), repeat: "Yearly", status: "active", createdAt: now },
    { userId: uid, name: "Drink 8 Glasses Water", category: "Health", target: 8, current: 5, unit: "glasses", startDate: t, endDate: t, repeat: "Daily", status: "active", createdAt: now },
  ]);

  // ---- Meals today ----
  await db.insert(meals).values([
    { userId: uid, name: "Breakfast", mealType: "Breakfast", foods: "Oats, banana, honey", protein: 18, carbs: 62, fat: 12, calories: 420, notes: "Quick energy", date: t, createdAt: now },
    { userId: uid, name: "Lunch", mealType: "Lunch", foods: "Ugali, Sukuma Wiki, Beans, Beef", protein: 35, carbs: 58, fat: 20, calories: 520, notes: "Homemade meal", date: t, createdAt: now },
    { userId: uid, name: "Dinner", mealType: "Dinner", foods: "Grilled chicken, rice, salad", protein: 19, carbs: 90, fat: 28, calories: 780, notes: "", date: addDaysISO(t, -1), createdAt: now },
  ]);

  // ---- Transactions ----
  await db.insert(transactions).values([
    { userId: uid, kind: "income", amount: 50000, category: "Salary", payment: "Bank", date: addDaysISO(t, -20), description: "Monthly salary", createdAt: now },
    { userId: uid, kind: "income", amount: 2000, category: "Others", payment: "M-Pesa", date: addDaysISO(t, -6), description: "Freelance gig", createdAt: now },
    { userId: uid, kind: "expense", amount: 25000, category: "Rent", payment: "Bank", date: addDaysISO(t, -19), description: "House rent", createdAt: now },
    { userId: uid, kind: "expense", amount: 4500, category: "Shopping", payment: "Card", date: addDaysISO(t, -12), description: "Groceries & home", createdAt: now },
    { userId: uid, kind: "expense", amount: 3000, category: "Shopping", payment: "M-Pesa", date: addDaysISO(t, -9), description: "Clothes", createdAt: now },
    { userId: uid, kind: "expense", amount: 2250, category: "Transport", payment: "M-Pesa", date: addDaysISO(t, -7), description: "Fuel & fares", createdAt: now },
    { userId: uid, kind: "expense", amount: 1500, category: "Food", payment: "M-Pesa", date: addDaysISO(t, -4), description: "Eating out", createdAt: now },
    { userId: uid, kind: "expense", amount: 1400, category: "Others", payment: "Card", date: addDaysISO(t, -3), description: "Utilities", createdAt: now },
    { userId: uid, kind: "expense", amount: 350, category: "Food", payment: "M-Pesa", date: addDaysISO(t, -1), description: "Lunch", createdAt: now },
    { userId: uid, kind: "expense", amount: 100, category: "Others", payment: "M-Pesa", date: t, description: "M-Pesa Top-up fee", createdAt: now },
  ]);

  // ---- Workouts ----
  await db.insert(workouts).values([
    { userId: uid, type: "Cycling", date: t, start: "06:00", durationMin: 45, distance: 12.6, speed: 16.8, calories: 350, createdAt: now },
    { userId: uid, type: "Gym", date: addDaysISO(t, -1), start: "18:00", durationMin: 60, distance: 0, speed: 0, calories: 420, createdAt: now },
    { userId: uid, type: "Running", date: addDaysISO(t, -2), start: "06:30", durationMin: 35, distance: 6.2, speed: 10.6, calories: 380, createdAt: now },
    { userId: uid, type: "Yoga", date: addDaysISO(t, -3), start: "19:00", durationMin: 45, distance: 0, speed: 0, calories: 180, createdAt: now },
  ]);

  // ---- Reminders ----
  await db.insert(reminders).values([
    { userId: uid, title: "Drink Water", type: "Water Reminder", repeat: "Every 2 Hours", start: "08:00", end: "22:00", channel: "Sound & Vibration", enabled: true, createdAt: now },
    { userId: uid, title: "Stand & Stretch", type: "Movement", repeat: "Every Hour", start: "09:00", end: "17:00", channel: "Vibration", enabled: true, createdAt: now },
    { userId: uid, title: "Take Supplements", type: "Health", repeat: "Daily", start: "20:00", end: "20:30", channel: "Sound", enabled: true, createdAt: now },
    { userId: uid, title: "Prepare for Sleep", type: "Sleep", repeat: "Daily", start: "22:00", end: "22:30", channel: "Sound & Vibration", enabled: false, createdAt: now },
  ]);

  // ---- Habits + logs ----
  const habitDefs: [string, string, string][] = [
    ["Wake Up Early", "sunrise", "#f59e0b"],
    ["Exercise", "dumbbell", "#10b981"],
    ["Read", "book", "#8b5cf6"],
    ["Meditate", "brain", "#f97316"],
    ["Drink Water", "droplet", "#3b82f6"],
    ["No Sugary Drinks", "cup-soda", "#ef4444"],
    ["Sleep by 10 PM", "moon", "#6366f1"],
  ];
  const insertedHabits = await db.insert(habits).values(
    habitDefs.map(([name, icon, color]) => ({ userId: uid, name, icon, color, target: 1, createdAt: now }))
  ).returning();

  const donePattern: Record<number, number[]> = {
    0: [0, 1, 2, 4],
    [-1]: [0, 1, 2, 3, 4, 5, 6],
    [-2]: [0, 1, 2, 4, 5],
    [-3]: [0, 1, 3, 4, 6],
    [-4]: [0, 1, 2, 3, 4],
    [-5]: [1, 2, 4, 5],
    [-6]: [0, 1, 2, 4, 6],
  };
  const logRows: { habitId: string; userId: string; date: string }[] = [];
  for (const [off, idxs] of Object.entries(donePattern)) {
    for (const i of idxs) {
      logRows.push({ habitId: insertedHabits[i].id, userId: uid, date: addDaysISO(t, Number(off)) });
    }
  }
  await db.insert(habitLogs).values(logRows);

  // ---- Notifications ----
  const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();
  await db.insert(notifications).values([
    { userId: uid, kind: "water", title: "Drink Water", message: "Time to drink some water 💧", read: false, createdAt: minsAgo(5) },
    { userId: uid, kind: "weather", title: "Weather Alert", message: "It's rainy today. Stay hydrated and carry an umbrella ☔", read: false, createdAt: minsAgo(15) },
    { userId: uid, kind: "workout", title: "Workout Reminder", message: "Don't skip your workout 💪", read: false, createdAt: minsAgo(30) },
    { userId: uid, kind: "meeting", title: "Meeting Reminder", message: "Team meeting in 30 minutes", read: true, createdAt: minsAgo(60) },
    { userId: uid, kind: "budget", title: "Budget Alert", message: "You have spent 80% of your food budget", read: true, createdAt: minsAgo(120) },
    { userId: uid, kind: "goal", title: "Goal Update", message: "You are close to your daily coding goal 🎯", read: true, createdAt: minsAgo(180) },
  ]);

  // ---- Daily stats ----
  await db.insert(dailyStats).values([
    { userId: uid, date: t, water: 5 },
    { userId: uid, date: addDaysISO(t, -1), water: 8 },
    { userId: uid, date: addDaysISO(t, -2), water: 7 },
  ]);
}
