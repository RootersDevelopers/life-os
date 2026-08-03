"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Check, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { Button, Field, Input, Spinner, useToast } from "@/components/ui";
import { api } from "@/lib/api";

const FEATURES = [
  "Plan your day, week, month",
  "Track activities, habits, meals, workouts",
  "Manage goals, tasks and reminders",
  "Monitor health, nutrition and sleep",
  "Manage finances and budgets",
  "Get smart insights and suggestions",
];

export function BrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-[440px] shrink-0 bg-night p-12 overflow-hidden">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-brand-700/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center shadow-lg shadow-brand-900/50">
            <Leaf className="h-6 w-6 text-white" fill="currentColor" fillOpacity={0.25} />
          </div>
          <div>
            <p className="font-display font-bold text-white text-2xl tracking-tight">Life<span className="text-brand-400">OS</span></p>
            <p className="text-xs text-white/40">Live Better. Every Day.</p>
          </div>
        </div>
        <p className="mt-8 text-white/60 text-sm leading-relaxed max-w-xs">
          LifeOS is your all-in-one life management system to plan, track, analyze and improve every aspect of your life.
        </p>
      </div>
      <ul className="relative space-y-3.5">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-white/75">
            <span className="h-5 w-5 rounded-md bg-brand-500 grid place-items-center shrink-0">
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <p className="relative text-xs text-white/30">Designed for people who want every day to count.</p>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      push("success", "Welcome back to LifeOS");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      push("error", err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <BrandPanel />
      <div className="flex-1 grid place-items-center p-6">
        <div className="w-full max-w-sm anim-rise">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center">
              <Leaf className="h-5 w-5 text-white" fill="currentColor" fillOpacity={0.25} />
            </div>
            <p className="font-display font-bold text-xl text-ink">Life<span className="text-brand-600">OS</span></p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 grid place-items-center mb-5">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">Welcome Back</h1>
          <p className="text-sm text-mute mt-1">Sign in to continue to LifeOS</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field label="Email">
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@lifeos.app" autoComplete="email" />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className="pr-10" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? <Spinner className="h-4 w-4" /> : <>Login <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <button
            onClick={() => { setEmail("alex@lifeos.app"); setPassword("demo1234"); push("info", "Demo credentials filled — hit Login"); }}
            className="mt-4 w-full h-10 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 text-brand-700 text-sm font-semibold hover:bg-brand-50 transition-colors"
          >
            Use demo account (alex@lifeos.app)
          </button>

          <p className="mt-6 text-center text-sm text-mute">
            Don't have an account? <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
