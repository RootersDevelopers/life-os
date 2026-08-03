import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { RESOURCES, habitLogs, pickFields } from "@/lib/registry";
import { nowISO } from "@/lib/format";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { resource } = await params;
  const def = RESOURCES[resource];
  if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const rows = await db.select().from(def.table).where(eq(def.userCol, user.id)).orderBy(...def.order);

  if (resource === "habits") {
    const logs = await db.select().from(habitLogs).where(eq(habitLogs.userId, user.id));
    const byHabit = new Map<string, string[]>();
    for (const l of logs) {
      byHabit.set(l.habitId, [...(byHabit.get(l.habitId) ?? []), l.date]);
    }
    const enriched = rows.map((h: any) => ({ ...h, logDates: byHabit.get(h.id) ?? [] }));
    return NextResponse.json(enriched);
  }
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { resource } = await params;
  const def = RESOURCES[resource];
  if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const values = pickFields(def, body);
  const required = resource === "events" ? ["title", "date", "start", "end"]
    : resource === "goals" ? ["name", "target"]
    : resource === "meals" ? ["name"]
    : resource === "transactions" ? ["amount"]
    : resource === "workouts" ? ["type"]
    : resource === "reminders" ? ["title"]
    : resource === "habits" ? ["name"]
    : ["title"];
  for (const r of required) {
    if (values[r] === undefined || values[r] === "") {
      return NextResponse.json({ error: `Missing required field: ${r}` }, { status: 400 });
    }
  }
  const inserted: any[] = await (db.insert(def.table).values({ ...values, userId: user.id, createdAt: nowISO() }) as any).returning();
  const row = inserted[0];
  if (resource === "habits") return NextResponse.json({ ...row, logDates: [] });
  return NextResponse.json(row);
}
