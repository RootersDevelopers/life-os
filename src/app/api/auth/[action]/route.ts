export const dynamic = 'force-static';
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createSession, destroySession, getSessionUser, hashPassword, verifyPassword,
} from "@/lib/auth";
import { nowISO } from "@/lib/format";

type Ctx = { params: Promise<{ action: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { action } = await params;
  const body = await req.json().catch(() => ({}));

  if (action === "login") {
    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    const [user] = await db.select().from(users).where(eq(users.email, String(email).toLowerCase().trim()));
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
  }

  if (action === "register") {
    const { name, email, password } = body;
    if (!name || !email || !password) return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (String(password).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    const em = String(email).toLowerCase().trim();
    const [existing] = await db.select().from(users).where(eq(users.email, em));
    if (existing) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    const [user] = await db
      .insert(users)
      .values({ name: String(name).trim(), email: em, passwordHash: hashPassword(String(password)), createdAt: nowISO() })
      .returning();
    await createSession(user.id);
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
  }

  if (action === "logout") {
    await destroySession();
    return NextResponse.json({ ok: true });
  }

  if (action === "update") {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const patch: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
    if (typeof body.email === "string" && body.email.trim()) patch.email = body.email.trim().toLowerCase();
    if (typeof body.password === "string" && body.password.length >= 6) patch.passwordHash = hashPassword(body.password);
    if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    const [updated] = await db.update(users).set(patch).where(eq(users.id, user.id)).returning();
    return NextResponse.json({ ok: true, user: { id: updated.id, name: updated.name, email: updated.email, plan: updated.plan } });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { action } = await params;
  if (action === "me") {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan, createdAt: user.createdAt } });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}
