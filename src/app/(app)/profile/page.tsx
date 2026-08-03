"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserRound, Pencil, KeyRound, LogOut, ShieldCheck, CalendarDays, Mail, BadgeCheck } from "lucide-react";
import { Button, Card, Field, Input, Modal, Skeleton, useToast, Badge } from "@/components/ui";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { push } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ["me"], queryFn: () => api("/api/auth/me") });
  const user = data?.user;

  const [edit, setEdit] = useState(false);
  const [pw, setPw] = useState(false);
  const [f, setF] = useState({ name: "", email: "" });
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  function openEdit() { setF({ name: user?.name ?? "", email: user?.email ?? "" }); setEdit(true); }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/auth/update", { method: "POST", body: JSON.stringify(f) });
      await qc.invalidateQueries({ queryKey: ["me"] });
      push("success", "Profile updated");
      setEdit(false);
    } catch (err: any) { push("error", err.message); } finally { setBusy(false); }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/auth/update", { method: "POST", body: JSON.stringify({ password }) });
      push("success", "Password changed");
      setPw(false); setPassword("");
    } catch (err: any) { push("error", err.message); } finally { setBusy(false); }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (isLoading || !user) return <div className="max-w-2xl space-y-4"><Skeleton className="h-40 rounded-2xl" /><Skeleton className="h-56 rounded-2xl" /></div>;

  const initials = user.name.split(" ").map((s: string) => s[0]).slice(0, 2).join("");
  const joined = new Date(user.createdAt).toLocaleDateString("en-KE", { month: "long", year: "numeric" });

  return (
    <div className="max-w-2xl space-y-5 anim-rise">
      <Card className="relative overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-night via-night-2 to-brand-900" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-white text-2xl font-bold border-4 border-card shadow-card">
                {initials}
              </div>
              <div className="pb-1">
                <h2 className="font-display font-bold text-xl text-ink">{user.name}</h2>
                <p className="text-sm text-mute flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user.email}</p>
              </div>
            </div>
            <Badge tone="brand"><BadgeCheck className="h-3 w-3" /> {user.plan} Member</Badge>
          </div>
          <div className="flex items-center gap-4 mt-5 text-xs text-mute">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Joined {joined}</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> Account secured</span>
          </div>
        </div>
      </Card>

      <Card className="divide-y divide-line">
        <SettingRow icon={<UserRound className="h-4.5 w-4.5" />} title="Personal Information" sub="Update your name and email" onClick={openEdit} />
        <SettingRow icon={<KeyRound className="h-4.5 w-4.5" />} title="Change Password" sub="Use at least 6 characters" onClick={() => setPw(true)} />
        <button onClick={logout} className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-danger/5 transition-colors text-left">
          <span className="h-10 w-10 rounded-xl bg-danger/10 text-danger grid place-items-center"><LogOut className="h-4.5 w-4.5" /></span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-danger">Logout</span>
            <span className="block text-xs text-mute">Sign out of LifeOS on this device</span>
          </span>
        </button>
      </Card>

      <Modal open={edit} onClose={() => setEdit(false)} title="Personal Information">
        <form onSubmit={saveProfile} className="space-y-4">
          <Field label="Full Name"><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>Save Changes</Button>
        </form>
      </Modal>

      <Modal open={pw} onClose={() => setPw(false)} title="Change Password">
        <form onSubmit={savePassword} className="space-y-4">
          <Field label="New Password" hint="min 6 characters">
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          </Field>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>Update Password</Button>
        </form>
      </Modal>
    </div>
  );
}

function SettingRow({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-ink/3 transition-colors text-left group">
      <span className="h-10 w-10 rounded-xl bg-ink/5 text-ink-soft grid place-items-center group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="block text-xs text-mute">{sub}</span>
      </span>
      <Pencil className="h-4 w-4 text-mute/50 group-hover:text-brand-600 transition-colors" />
    </button>
  );
}
