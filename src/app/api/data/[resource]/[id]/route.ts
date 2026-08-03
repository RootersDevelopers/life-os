import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { RESOURCES, habitLogs, pickFields } from "@/lib/registry";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { resource, id } = await params;
  const def = RESOURCES[resource];
  if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const patch = pickFields(def, body);
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const updated: any[] = await (db.update(def.table).set(patch).where(and(eq(def.idCol, id), eq(def.userCol, user.id))) as any).returning();
  const row = updated[0];
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { resource, id } = await params;
  const def = RESOURCES[resource];
  if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const deleted: any[] = await (db.delete(def.table).where(and(eq(def.idCol, id), eq(def.userCol, user.id))) as any).returning();
  const row = deleted[0];
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (resource === "habits") {
    await db.delete(habitLogs).where(eq(habitLogs.habitId, id));
  }
  return NextResponse.json({ ok: true });
}
