import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { habitLogs, habits } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/format";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { date } = await req.json().catch(() => ({}));
  const d = typeof date === "string" ? date : todayISO();

  const [habit] = await db.select().from(habits).where(and(eq(habits.id, id), eq(habits.userId, user.id)));
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [existing] = await db.select().from(habitLogs).where(and(eq(habitLogs.habitId, id), eq(habitLogs.date, d)));
  if (existing) {
    await db.delete(habitLogs).where(eq(habitLogs.id, existing.id));
    return NextResponse.json({ done: false });
  }
  await db.insert(habitLogs).values({ habitId: id, userId: user.id, date: d });
  return NextResponse.json({ done: true });
}
