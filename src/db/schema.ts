import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  real,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").notNull().default("Premium"),
  createdAt: text("created_at").notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  type: text("type").notNull(), // activity | task | appointment | note | journal | sleep | focus
  title: text("title").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  start: text("start").notNull(), // HH:MM
  end: text("end").notNull(),
  durationMin: integer("duration_min").notNull().default(30),
  category: text("category").notNull().default("General"),
  notes: text("notes").notNull().default(""),
  mood: text("mood").notNull().default(""),
  energy: text("energy").notNull().default(""),
  color: text("color").notNull().default("#22c55e"),
  completed: boolean("completed").notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("General"),
  target: real("target").notNull(),
  current: real("current").notNull().default(0),
  unit: text("unit").notNull().default(""),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  repeat: text("repeat").notNull().default("Daily"),
  status: text("status").notNull().default("active"), // active | completed
  createdAt: text("created_at").notNull(),
});

export const meals = pgTable("meals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  mealType: text("meal_type").notNull().default("Lunch"),
  foods: text("foods").notNull().default(""),
  protein: integer("protein").notNull().default(0),
  carbs: integer("carbs").notNull().default(0),
  fat: integer("fat").notNull().default(0),
  calories: integer("calories").notNull().default(0),
  notes: text("notes").notNull().default(""),
  date: text("date").notNull(),
  createdAt: text("created_at").notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  kind: text("kind").notNull().default("expense"), // expense | income
  amount: real("amount").notNull(),
  category: text("category").notNull().default("Other"),
  payment: text("payment").notNull().default("M-Pesa"),
  date: text("date").notNull(),
  description: text("description").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const workouts = pgTable("workouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  type: text("type").notNull().default("Cycling"),
  date: text("date").notNull(),
  start: text("start").notNull().default("06:00"),
  durationMin: integer("duration_min").notNull().default(30),
  distance: real("distance").notNull().default(0),
  speed: real("speed").notNull().default(0),
  calories: integer("calories").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const reminders = pgTable("reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull().default("Water Reminder"),
  repeat: text("repeat").notNull().default("Every 2 Hours"),
  start: text("start").notNull().default("08:00"),
  end: text("end").notNull().default("22:00"),
  channel: text("channel").notNull().default("Sound & Vibration"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const habits = pgTable("habits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("sparkles"),
  color: text("color").notNull().default("#22c55e"),
  target: integer("target").notNull().default(1),
  createdAt: text("created_at").notNull(),
});

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    habitId: uuid("habit_id").notNull(),
    userId: uuid("user_id").notNull(),
    date: text("date").notNull(),
  },
  (t) => [uniqueIndex("habit_log_uniq").on(t.habitId, t.date)]
);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  kind: text("kind").notNull().default("info"), // water | weather | workout | meeting | budget | goal | info
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const dailyStats = pgTable(
  "daily_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    date: text("date").notNull(),
    water: integer("water").notNull().default(0),
  },
  (t) => [uniqueIndex("daily_stats_uniq").on(t.userId, t.date)]
);
