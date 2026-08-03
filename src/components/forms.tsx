"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Gamepad2, ClipboardList, Target, BellRing, UtensilsCrossed, ReceiptText,
  Wallet, Dumbbell, Moon, BookOpen, CalendarClock, StickyNote, Plus,
} from "lucide-react";
import { Button, Field, Input, Modal, Select, Textarea, cn } from "@/components/ui";
import { useCrud } from "@/hooks/useCrud";
import { catColor, minutesBetween, todayISO } from "@/lib/format";

export type CreateKind =
  | "activity" | "task" | "goal" | "reminder" | "meal" | "expense"
  | "income" | "workout" | "sleep" | "journal" | "appointment" | "note";

const HUB: { kind: CreateKind; label: string; icon: any; color: string }[] = [
  { kind: "activity", label: "Activity", icon: Gamepad2, color: "#22c55e" },
  { kind: "task", label: "Task", icon: ClipboardList, color: "#8b5cf6" },
  { kind: "goal", label: "Goal", icon: Target, color: "#f59e0b" },
  { kind: "reminder", label: "Reminder", icon: BellRing, color: "#ef4444" },
  { kind: "meal", label: "Meal", icon: UtensilsCrossed, color: "#eab308" },
  { kind: "expense", label: "Expense", icon: ReceiptText, color: "#10b981" },
  { kind: "income", label: "Income", icon: Wallet, color: "#14b8a6" },
  { kind: "workout", label: "Workout", icon: Dumbbell, color: "#f97316" },
  { kind: "sleep", label: "Sleep", icon: Moon, color: "#6366f1" },
  { kind: "journal", label: "Journal", icon: BookOpen, color: "#f59e0b" },
  { kind: "appointment", label: "Appointment", icon: CalendarClock, color: "#8b5cf6" },
  { kind: "note", label: "Note", icon: StickyNote, color: "#ef4444" },
];

const TITLES: Record<CreateKind, string> = {
  activity: "Add Activity", task: "Add Task", goal: "Add Goal", reminder: "Add Reminder",
  meal: "Add Meal", expense: "Add Expense", income: "Add Income", workout: "Add Workout",
  sleep: "Log Sleep", journal: "New Journal Entry", appointment: "Add Appointment", note: "New Note",
};

export function CreateHub({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (k: CreateKind) => void }) {
  return (
    <Modal open={open} onClose={onClose} title="What do you want to create?">
      <div className="grid grid-cols-3 gap-3">
        {HUB.map((h) => (
          <button
            key={h.kind}
            onClick={() => onPick(h.kind)}
            className="group flex flex-col items-center gap-2 rounded-xl border border-line bg-card p-4 hover:border-brand-300 hover:shadow-card transition-all"
          >
            <span className="h-10 w-10 rounded-xl grid place-items-center transition-transform group-hover:scale-110" style={{ background: h.color + "1a", color: h.color }}>
              <h.icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold text-ink-soft">{h.label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl bg-brand-600 text-white shadow-pop grid place-items-center hover:bg-brand-700 active:scale-95 transition-all z-30"
      aria-label="Create"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function useCloseOnSuccess() {
  const qc = useQueryClient();
  return (onClose: () => void) => ({
    onSuccess: () => {
      onClose();
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["daily"] });
    },
  });
}

/* ---------------- Event (activity/task/appointment/sleep/journal/note) ---------------- */
function EventForm({ kind, onClose }: { kind: CreateKind; onClose: () => void }) {
  const { create } = useCrud("events");
  const close = useCloseOnSuccess();
  const [f, setF] = useState({
    title: "", category: kind === "sleep" ? "Sleep" : kind === "journal" ? "Personal" : "Coding",
    date: todayISO(), start: "09:00", end: "10:00", notes: "", mood: "Happy", energy: "High",
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <form
      className="space-y-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate({
          type: kind, title: f.title, category: f.category, date: f.date, start: f.start, end: f.end,
          durationMin: minutesBetween(f.start, f.end) || 30, notes: f.notes, mood: f.mood, energy: f.energy,
          color: catColor(f.category), completed: false,
        }, close(onClose));
      }}
    >
      <Field label="Title">
        <Input required value={f.title} onChange={(e) => set("title", e.target.value)} placeholder={kind === "task" ? "Team Meeting" : "Coding Session"} autoFocus />
      </Field>
      <Row2>
        <Field label="Category">
          <Select value={f.category} onChange={(e) => set("category", e.target.value)}>
            {["Coding", "Work", "Exercise", "Reading", "Meditation", "Food", "Meeting", "Personal", "Sleep", "General"].map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Date">
          <Input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
      </Row2>
      <Row2>
        <Field label="Start Time"><Input type="time" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field>
        <Field label="End Time"><Input type="time" value={f.end} onChange={(e) => set("end", e.target.value)} /></Field>
      </Row2>
      <Row2>
        <Field label="Mood">
          <Select value={f.mood} onChange={(e) => set("mood", e.target.value)}>
            {["Happy", "Energized", "Neutral", "Tired", "Stressed"].map((m) => <option key={m}>{m}</option>)}
          </Select>
        </Field>
        <Field label="Energy">
          <Select value={f.energy} onChange={(e) => set("energy", e.target.value)}>
            {["High", "Medium", "Low"].map((m) => <option key={m}>{m}</option>)}
          </Select>
        </Field>
      </Row2>
      <Field label="Notes on life"><Textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Worked on API…" /></Field>
      <Button type="submit" className="w-full" size="lg" disabled={create.isPending}>Save</Button>
    </form>
  );
}

/* ---------------- Goal ---------------- */
function GoalForm({ onClose }: { onClose: () => void }) {
  const { create } = useCrud("goals");
  const close = useCloseOnSuccess();
  const [f, setF] = useState({ name: "", category: "Reading", target: "20", unit: "books", startDate: todayISO(), endDate: todayISO(365), repeat: "Daily" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <form className="space-y-3.5" onSubmit={(e) => {
      e.preventDefault();
      create.mutate({ ...f, target: Number(f.target) || 0, current: 0, status: "active" }, close(onClose));
    }}>
      <Field label="Goal Name"><Input required value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Read 20 Books" autoFocus /></Field>
      <Row2>
        <Field label="Category">
          <Select value={f.category} onChange={(e) => set("category", e.target.value)}>
            {["Coding", "Fitness", "Reading", "Finance", "Health", "Personal"].map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Repeat">
          <Select value={f.repeat} onChange={(e) => set("repeat", e.target.value)}>
            {["Daily", "Weekly", "Monthly", "Yearly"].map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
      </Row2>
      <Row2>
        <Field label="Target"><Input type="number" min="1" value={f.target} onChange={(e) => set("target", e.target.value)} /></Field>
        <Field label="Unit"><Input value={f.unit} onChange={(e) => set("unit", e.target.value)} placeholder="books" /></Field>
      </Row2>
      <Row2>
        <Field label="Start Date"><Input type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
        <Field label="Target Date"><Input type="date" value={f.endDate} onChange={(e) => set("endDate", e.target.value)} /></Field>
      </Row2>
      <Button type="submit" className="w-full" size="lg" disabled={create.isPending}>Save</Button>
    </form>
  );
}

/* ---------------- Meal ---------------- */
function MealForm({ onClose }: { onClose: () => void }) {
  const { create } = useCrud("meals");
  const close = useCloseOnSuccess();
  const [f, setF] = useState({ mealType: "Lunch", foods: "", protein: "30", carbs: "50", fat: "20", calories: "520", notes: "", date: todayISO() });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <form className="space-y-3.5" onSubmit={(e) => {
      e.preventDefault();
      create.mutate({
        name: f.mealType, mealType: f.mealType, foods: f.foods, notes: f.notes, date: f.date,
        protein: +f.protein, carbs: +f.carbs, fat: +f.fat, calories: +f.calories,
      }, close(onClose));
    }}>
      <Row2>
        <Field label="Meal Type">
          <Select value={f.mealType} onChange={(e) => set("mealType", e.target.value)}>
            {["Breakfast", "Lunch", "Dinner", "Snack"].map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Date"><Input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
      </Row2>
      <Field label="Food Items"><Textarea value={f.foods} onChange={(e) => set("foods", e.target.value)} placeholder="Ugali, Sukuma Wiki, Beans, Beef" /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Protein (g)"><Input type="number" value={f.protein} onChange={(e) => set("protein", e.target.value)} /></Field>
        <Field label="Carbs (g)"><Input type="number" value={f.carbs} onChange={(e) => set("carbs", e.target.value)} /></Field>
        <Field label="Fat (g)"><Input type="number" value={f.fat} onChange={(e) => set("fat", e.target.value)} /></Field>
      </div>
      <Field label="Calories (kcal)"><Input type="number" value={f.calories} onChange={(e) => set("calories", e.target.value)} /></Field>
      <Field label="Notes"><Input value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Homemade meal" /></Field>
      <Button type="submit" className="w-full" size="lg" disabled={create.isPending}>Save</Button>
    </form>
  );
}

/* ---------------- Transaction ---------------- */
function TxForm({ kind, onClose }: { kind: "expense" | "income"; onClose: () => void }) {
  const { create } = useCrud("transactions");
  const close = useCloseOnSuccess();
  const [f, setF] = useState({ amount: "", category: kind === "income" ? "Salary" : "Food", payment: "M-Pesa", date: todayISO(), description: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <form className="space-y-3.5" onSubmit={(e) => {
      e.preventDefault();
      create.mutate({ ...f, amount: Number(f.amount) || 0, kind }, close(onClose));
    }}>
      <Field label="Amount (KSh)"><Input required type="number" min="1" value={f.amount} onChange={(e) => set("amount", e.target.value)} placeholder="650" autoFocus /></Field>
      <Row2>
        <Field label="Category">
          <Select value={f.category} onChange={(e) => set("category", e.target.value)}>
            {(kind === "income" ? ["Salary", "Freelance", "Business", "Others"] : ["Food", "Transport", "Shopping", "Rent", "Bills", "Health", "Others"]).map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Payment Method">
          <Select value={f.payment} onChange={(e) => set("payment", e.target.value)}>
            {["M-Pesa", "Card", "Bank", "Cash"].map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
      </Row2>
      <Field label="Date"><Input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
      <Field label="Description"><Input value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Lunch and snacks" /></Field>
      <Button type="submit" className="w-full" size="lg" disabled={create.isPending}>Save</Button>
    </form>
  );
}

/* ---------------- Workout ---------------- */
function WorkoutForm({ onClose }: { onClose: () => void }) {
  const { create } = useCrud("workouts");
  const close = useCloseOnSuccess();
  const [f, setF] = useState({ type: "Cycling", date: todayISO(), start: "06:00", durationMin: "45", distance: "12", calories: "350" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const dist = Number(f.distance) || 0;
  const dur = Number(f.durationMin) || 0;
  const speed = dur ? +((dist / (dur / 60)).toFixed(1)) : 0;
  return (
    <form className="space-y-3.5" onSubmit={(e) => {
      e.preventDefault();
      create.mutate({ ...f, durationMin: dur, distance: dist, speed, calories: +f.calories }, close(onClose));
    }}>
      <Row2>
        <Field label="Workout Type">
          <Select value={f.type} onChange={(e) => set("type", e.target.value)}>
            {["Cycling", "Running", "Gym", "Yoga", "Swimming", "Walking"].map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Date"><Input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
      </Row2>
      <Row2>
        <Field label="Start Time"><Input type="time" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field>
        <Field label="Duration (min)"><Input type="number" value={f.durationMin} onChange={(e) => set("durationMin", e.target.value)} /></Field>
      </Row2>
      <Row2>
        <Field label="Distance (km)"><Input type="number" step="0.1" value={f.distance} onChange={(e) => set("distance", e.target.value)} /></Field>
        <Field label="Calories (kcal)"><Input type="number" value={f.calories} onChange={(e) => set("calories", e.target.value)} /></Field>
      </Row2>
      <p className="text-xs text-mute -mt-1">Avg speed: <span className="font-semibold text-ink">{speed} km/h</span></p>
      <Button type="submit" className="w-full" size="lg" disabled={create.isPending}>Save</Button>
    </form>
  );
}

/* ---------------- Reminder ---------------- */
function ReminderForm({ onClose }: { onClose: () => void }) {
  const { create } = useCrud("reminders");
  const close = useCloseOnSuccess();
  const [f, setF] = useState({ title: "", type: "Water Reminder", repeat: "Every 2 Hours", start: "08:00", end: "22:00", channel: "Sound & Vibration" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <form className="space-y-3.5" onSubmit={(e) => {
      e.preventDefault();
      create.mutate({ ...f, enabled: true }, close(onClose));
    }}>
      <Field label="Title"><Input required value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Drink Water" autoFocus /></Field>
      <Row2>
        <Field label="Type">
          <Select value={f.type} onChange={(e) => set("type", e.target.value)}>
            {["Water Reminder", "Movement", "Health", "Sleep", "Work"].map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Repeat">
          <Select value={f.repeat} onChange={(e) => set("repeat", e.target.value)}>
            {["Every Hour", "Every 2 Hours", "Every 4 Hours", "Daily", "Weekdays"].map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
      </Row2>
      <Row2>
        <Field label="Start Time"><Input type="time" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field>
        <Field label="End Time"><Input type="time" value={f.end} onChange={(e) => set("end", e.target.value)} /></Field>
      </Row2>
      <Field label="Notification">
        <Select value={f.channel} onChange={(e) => set("channel", e.target.value)}>
          {["Sound & Vibration", "Sound", "Vibration", "Silent"].map((c) => <option key={c}>{c}</option>)}
        </Select>
      </Field>
      <Button type="submit" className="w-full" size="lg" disabled={create.isPending}>Save</Button>
    </form>
  );
}

/* ---------------- Dispatcher ---------------- */
export function CreateModal({ kind, onClose }: { kind: CreateKind | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (kind) setMounted(true); else setMounted(false); }, [kind]);
  if (!kind) return null;
  const inner =
    kind === "goal" ? <GoalForm onClose={onClose} /> :
    kind === "meal" ? <MealForm onClose={onClose} /> :
    kind === "expense" || kind === "income" ? <TxForm kind={kind} onClose={onClose} /> :
    kind === "workout" ? <WorkoutForm onClose={onClose} /> :
    kind === "reminder" ? <ReminderForm onClose={onClose} /> :
    <EventForm kind={kind} onClose={onClose} />;
  return (
    <Modal open={mounted} onClose={onClose} title={TITLES[kind]}>
      {inner}
    </Modal>
  );
}
