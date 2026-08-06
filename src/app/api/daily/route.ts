export const dynamic = 'force-static';
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dailyStats } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/format";

export async function GET(req: NextRequest) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const date = req.nextUrl.searchParams.get("date") ?? todayISO();
  const [row] = await db.select().from(dailyStats).where(and(eq(dailyStats.userId, user.id), eq(dailyStats.date, date)));
  return NextResponse.json({ water: row?.water ?? 0 });
}

export async function PATCH(req: NextRequest) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { date, water } = await req.json().catch(() => ({}));
  const d = typeof date === "string" ? date : todayISO();
  const w = Math.max(0, Math.min(20, Math.round(Number(water) || 0)));
  const [existing] = await db.select().from(dailyStats).where(and(eq(dailyStats.userId, user.id), eq(dailyStats.date, d)));
  if (existing) {
    await db.update(dailyStats).set({ water: w }).where(eq(dailyStats.id, existing.id));
  } else {
    await db.insert(dailyStats).values({ userId: user.id, date: d, water: w });
  }
  return NextResponse.json({ water: w });
}
