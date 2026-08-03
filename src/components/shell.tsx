"use client";
import Link from "next/link";
import { usePathname as usePath, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, CalendarDays, PieChart, HeartPulse, Wallet, Target,
  CheckSquare, Timer, Bell, UserRound, LogOut, Leaf, Menu, X,
} from "lucide-react";
import { cn } from "@/components/ui";
import { api } from "@/lib/api";
import { prettyDate, todayISO } from "@/lib/format";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/insights", label: "Insights", icon: PieChart },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export const TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "Dashboard", sub: "Your day at a glance" },
  "/planner": { title: "Planner", sub: "Schedule, tasks & timeline" },
  "/insights": { title: "Insights", sub: "Understand your patterns" },
  "/health": { title: "Health", sub: "Nutrition, water & workouts" },
  "/finance": { title: "Finance", sub: "Income, expenses & budgets" },
  "/goals": { title: "Goals", sub: "Track what matters" },
  "/habits": { title: "Habits", sub: "Small steps, every day" },
  "/focus": { title: "Focus Mode", sub: "Deep work, distraction free" },
  "/notifications": { title: "Notifications", sub: "Stay in the loop" },
  "/profile": { title: "Profile", sub: "Your account & preferences" },
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center shadow-lg shadow-brand-900/40">
        <Leaf className="h-5 w-5 text-white" fill="currentColor" fillOpacity={0.25} />
      </div>
      <div className="leading-tight">
        <p className="font-display font-700 font-bold text-white text-[17px] tracking-tight">
          Life<span className="text-brand-400">OS</span>
        </p>
        <p className="text-[10px] text-white/40 font-medium -mt-0.5">Live Better. Every Day.</p>
      </div>
    </div>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 mt-6 space-y-1 px-3 overflow-y-auto scrollbar-thin">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 h-10 text-[13.5px] font-semibold transition-all",
              active
                ? "bg-brand-500/15 text-brand-300 border border-brand-500/20"
                : "text-white/55 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <item.icon className={cn("h-[18px] w-[18px]", active ? "text-brand-400" : "")} />
            {item.label}
            {item.href === "/notifications" && <NotifDot />}
          </Link>
        );
      })}
    </nav>
  );
}

function NotifDot() {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<any[]>("/api/data/notifications"),
  });
  const unread = (data ?? []).filter((n) => !n.read).length;
  if (!unread) return null;
  return (
    <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-danger text-white text-[10px] font-bold grid place-items-center">
      {unread}
    </span>
  );
}

function UserChip() {
  const router = useRouter();
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => api("/api/auth/me") });
  const user = data?.user;
  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }
  return (
    <div className="p-3 border-t border-night-line">
      <div className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/8 px-2.5 py-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white text-xs font-bold shrink-0">
          {user?.name?.split(" ").map((s: string) => s[0]).slice(0, 2).join("") ?? "…"}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[12.5px] font-semibold text-white truncate">{user?.name ?? "Loading…"}</p>
          <p className="text-[10.5px] text-white/40 truncate">{user?.email ?? ""}</p>
        </div>
        <button onClick={logout} title="Sign out" className="text-white/40 hover:text-danger transition-colors">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePath();
  const [drawer, setDrawer] = useState(false);
  useEffect(() => setDrawer(false), [pathname]);
  const meta = TITLES[pathname] ?? { title: "LifeOS", sub: "" };

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-night border-r border-night-line fixed inset-y-0">
        <div className="pt-6 pb-2"><Logo /></div>
        <NavList pathname={pathname} />
        <UserChip />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-night/60 anim-fade" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 flex flex-col bg-night border-r border-night-line anim-rise">
            <div className="pt-6 pb-2 flex items-start justify-between pr-3">
              <Logo />
              <button onClick={() => setDrawer(false)} className="text-white/50 p-2"><X className="h-5 w-5" /></button>
            </div>
            <NavList pathname={pathname} onNavigate={() => setDrawer(false)} />
            <UserChip />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:pl-64 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur border-b border-line">
          <div className="flex items-center gap-3 px-4 sm:px-8 h-16">
            <button onClick={() => setDrawer(true)} className="lg:hidden text-ink-soft p-1.5 -ml-1.5">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-ink text-lg leading-tight truncate">{meta.title}</h1>
              <p className="text-xs text-mute truncate">{meta.sub} · {prettyDate(todayISO())}</p>
            </div>
            <Link href="/notifications" className="relative h-10 w-10 grid place-items-center rounded-xl border border-line bg-card text-ink-soft hover:text-ink hover:border-brand-300 transition-colors">
              <Bell className="h-[18px] w-[18px]" />
              <NotifDot />
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
