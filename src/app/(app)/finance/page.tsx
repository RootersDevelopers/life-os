"use client";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet, Plus, Trash2, Search } from "lucide-react";
import { Button, Card, CardHead, EmptyState, Input, Progress, Skeleton, cn } from "@/components/ui";
import { useCrud } from "@/hooks/useCrud";
import { fmtMoney, monthLabel, todayISO } from "@/lib/format";
import { CreateModal, FAB, type CreateKind } from "@/components/forms";

export default function FinancePage() {
  const txs = useCrud("transactions");
  const [kind, setKind] = useState<CreateKind | null>(null);
  const [q, setQ] = useState("");

  const monthStart = todayISO().slice(0, 8) + "01";
  const monthTx = useMemo(() => (txs.data ?? []).filter((t) => t.date >= monthStart), [txs.data]);
  const income = monthTx.filter((t) => t.kind === "income").reduce((a, t) => a + t.amount, 0);
  const expenses = monthTx.filter((t) => t.kind === "expense").reduce((a, t) => a + t.amount, 0);
  const balance = income - expenses;

  const byCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthTx.filter((t) => t.kind === "expense")) map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthTx]);

  const filtered = useMemo(
    () => (txs.data ?? []).filter((t) => (t.description + t.category).toLowerCase().includes(q.toLowerCase())),
    [txs.data, q]
  );

  if (txs.isLoading) return <div className="space-y-4"><div className="grid grid-cols-3 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div><Skeleton className="h-80 rounded-2xl" /></div>;

  return (
    <div className="space-y-5 anim-rise">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-night border-night-line relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wide flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Total Balance</p>
            <p className="font-display font-bold text-3xl text-white mt-2 tabular-nums">{fmtMoney(balance)}</p>
            <p className="text-xs text-white/40 mt-1">{monthLabel(todayISO())}</p>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-mute uppercase tracking-wide flex items-center gap-1.5"><ArrowUpRight className="h-3.5 w-3.5 text-brand-600" /> Income</p>
          <p className="font-display font-bold text-2xl text-brand-700 mt-2 tabular-nums">{fmtMoney(income)}</p>
          <p className="text-xs text-mute mt-1">{monthTx.filter((t) => t.kind === "income").length} deposits</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-mute uppercase tracking-wide flex items-center gap-1.5"><ArrowDownLeft className="h-3.5 w-3.5 text-danger" /> Expenses</p>
          <p className="font-display font-bold text-2xl text-ink mt-2 tabular-nums">{fmtMoney(expenses)}</p>
          <p className="text-xs text-mute mt-1">{monthTx.filter((t) => t.kind === "expense").length} transactions</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card>
          <CardHead title="Breakdown" sub="Expenses by category" />
          <div className="px-5 pb-5 space-y-3.5">
            {byCat.length === 0 && <p className="text-sm text-mute py-4 text-center">No expenses this month.</p>}
            {byCat.map(([cat, amt]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-ink-soft">{cat}</span>
                  <span className="text-mute tabular-nums">{fmtMoney(amt)} · {Math.round((amt / (expenses || 1)) * 100)}%</span>
                </div>
                <Progress value={amt} max={expenses || 1} color={catColorFor(cat)} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHead
            title="Recent Transactions"
            right={
              <div className="flex gap-2">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mute" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-8 h-8 w-36 text-xs" />
                </div>
                <Button size="sm" onClick={() => setKind("expense")}><Plus className="h-3.5 w-3.5" /> Add</Button>
              </div>
            }
          />
          {filtered.length === 0 ? (
            <EmptyState icon={<Wallet className="h-6 w-6" />} title="No transactions" sub={q ? "Nothing matches your search." : "Record income and expenses to see your balance."} action={<Button onClick={() => setKind("expense")}>Add transaction</Button>} />
          ) : (
            <div className="divide-y divide-line max-h-[480px] overflow-y-auto scrollbar-thin">
              {filtered.slice(0, 30).map((t) => (
                <div key={t.id} className="group flex items-center gap-3.5 px-5 py-3 hover:bg-ink/3">
                  <span className={cn("h-9 w-9 rounded-xl grid place-items-center shrink-0", t.kind === "income" ? "bg-brand-50 text-brand-600" : "bg-danger/8 text-danger")}>
                    {t.kind === "income" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{t.description || t.category}</p>
                    <p className="text-[11px] text-mute">{t.category} · {t.payment} · {t.date}</p>
                  </div>
                  <p className={cn("text-sm font-bold tabular-nums", t.kind === "income" ? "text-brand-700" : "text-ink")}>
                    {t.kind === "income" ? "+" : "−"}{fmtMoney(t.amount)}
                  </p>
                  <button onClick={() => txs.remove.mutate(t.id)} className="text-mute/0 group-hover:text-mute hover:!text-danger transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <FAB onClick={() => setKind("expense")} />
      <CreateModal kind={kind} onClose={() => setKind(null)} />
    </div>
  );
}

const CAT_COLORS: Record<string, string> = { Food: "#eab308", Transport: "#3b82f6", Shopping: "#8b5cf6", Rent: "#ef4444", Bills: "#f59e0b", Health: "#10b981", Other: "#64748b", Others: "#64748b" };
function catColorFor(c: string) { return CAT_COLORS[c] ?? "#14b8a6"; }
