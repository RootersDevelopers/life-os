"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, UserPlus, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button, Field, Input, Spinner, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { BrandPanel } from "@/app/login/page";

export default function RegisterPage() {
  const router = useRouter();
  const { push } = useToast();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/auth/register", { method: "POST", body: JSON.stringify(f) });
      push("success", "Account created — welcome to LifeOS");
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
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">Create Account</h1>
          <p className="text-sm text-mute mt-1">Start living better, every day</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field label="Full Name">
              <Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Alex John" autoComplete="name" />
            </Field>
            <Field label="Email">
              <Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
            </Field>
            <Field label="Password" hint="min 6 characters">
              <div className="relative">
                <Input type={show ? "text" : "password"} required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••••" autoComplete="new-password" className="pr-10" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? <Spinner className="h-4 w-4" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-mute">
            Already have an account? <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
