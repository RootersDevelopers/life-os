import {
  events, goals, habitLogs, habits, meals, notifications, reminders,
  transactions, workouts,
} from "@/db/schema";
import { asc, desc, eq, SQL } from "drizzle-orm";

type FieldType = "str" | "int" | "num" | "bool";

export type ResourceDef = {
  table: any;
  idCol: any;
  userCol: any;
  fields: Record<string, FieldType>;
  order: SQL[];
  label: string;
};

export const RESOURCES: Record<string, ResourceDef> = {
  events: {
    table: events, idCol: events.id, userCol: events.userId, label: "event",
    fields: {
      type: "str", title: "str", date: "str", start: "str", end: "str",
      durationMin: "int", category: "str", notes: "str", mood: "str",
      energy: "str", color: "str", completed: "bool",
    },
    order: [asc(events.date), asc(events.start)],
  },
  goals: {
    table: goals, idCol: goals.id, userCol: goals.userId, label: "goal",
    fields: {
      name: "str", category: "str", target: "num", current: "num", unit: "str",
      startDate: "str", endDate: "str", repeat: "str", status: "str",
    },
    order: [asc(goals.createdAt)],
  },
  meals: {
    table: meals, idCol: meals.id, userCol: meals.userId, label: "meal",
    fields: {
      name: "str", mealType: "str", foods: "str", protein: "int", carbs: "int",
      fat: "int", calories: "int", notes: "str", date: "str",
    },
    order: [desc(meals.date), asc(meals.createdAt)],
  },
  transactions: {
    table: transactions, idCol: transactions.id, userCol: transactions.userId, label: "transaction",
    fields: {
      kind: "str", amount: "num", category: "str", payment: "str",
      date: "str", description: "str",
    },
    order: [desc(transactions.date), desc(transactions.createdAt)],
  },
  workouts: {
    table: workouts, idCol: workouts.id, userCol: workouts.userId, label: "workout",
    fields: {
      type: "str", date: "str", start: "str", durationMin: "int",
      distance: "num", speed: "num", calories: "int",
    },
    order: [desc(workouts.date), asc(workouts.start)],
  },
  reminders: {
    table: reminders, idCol: reminders.id, userCol: reminders.userId, label: "reminder",
    fields: {
      title: "str", type: "str", repeat: "str", start: "str", end: "str",
      channel: "str", enabled: "bool",
    },
    order: [asc(reminders.createdAt)],
  },
  habits: {
    table: habits, idCol: habits.id, userCol: habits.userId, label: "habit",
    fields: { name: "str", icon: "str", color: "str", target: "int" },
    order: [asc(habits.createdAt)],
  },
  notifications: {
    table: notifications, idCol: notifications.id, userCol: notifications.userId, label: "notification",
    fields: { kind: "str", title: "str", message: "str", read: "bool" },
    order: [desc(notifications.createdAt)],
  },
};

export function coerce(type: FieldType, v: unknown) {
  if (type === "int") return Math.round(Number(v) || 0);
  if (type === "num") return Number(v) || 0;
  if (type === "bool") return Boolean(v);
  return String(v ?? "");
}

export function pickFields(def: ResourceDef, body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, t] of Object.entries(def.fields)) {
    if (k in body) out[k] = coerce(t, body[k]);
  }
  return out;
}

export { habitLogs, eq };
